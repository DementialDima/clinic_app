from rest_framework import viewsets, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from django.utils.timezone import make_aware
from django.conf import settings
from django.db.models import Q
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFont
from .models import Appointment, Treatment, User, DoctorProfile
from .serializers import AppointmentSerializer, TreatmentSerializer, UserSerializer
from reportlab.pdfgen import canvas
from django.http import HttpResponse
import io
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# Пошук шрифту в каталозі, де розміщено views.py (наприклад: clinic_app/views.py)
# 👇 Динамічний шлях до шрифту
font_path = os.path.join(os.path.dirname(__file__), 'fonts', 'DejaVuSans.ttf')

# 👇 Реєстрація шрифту
pdfmetrics.registerFont(TTFont('DejaVuSans', font_path))

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        patient_id = self.request.query_params.get('patient_id')
        doctor_id = self.request.query_params.get('doctor_id')

        if patient_id and user.role in ['DOCTOR', 'ADMIN']:
            return queryset.filter(patient_id=patient_id)
        if doctor_id and user.role in ['DOCTOR', 'ADMIN']:
            return queryset.filter(doctor_id=doctor_id)

        if user.role == "DOCTOR":
            return queryset.filter(doctor=user)
        elif user.role == "PATIENT":
            return queryset.filter(patient=user)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        scheduled_time = parse_datetime(self.request.data.get('scheduled_time'))
        end_time = parse_datetime(self.request.data.get('end_time'))
        doctor_id = self.request.data.get('doctor')
        patient_id = self.request.data.get('patient') or user.id

        if not (scheduled_time and end_time and doctor_id):
            raise serializers.ValidationError("Недостатньо даних для створення прийому.")

        if settings.USE_TZ and scheduled_time.tzinfo is None:
            scheduled_time = make_aware(scheduled_time)
        if settings.USE_TZ and end_time.tzinfo is None:
            end_time = make_aware(end_time)

        overlapping = Appointment.objects.filter(
            doctor_id=doctor_id,
            scheduled_time__lt=end_time,
            end_time__gt=scheduled_time,
        ).exists()

        if overlapping:
            raise serializers.ValidationError("⛔ Лікар вже має прийом у цей час.")

        if user.role == "PATIENT":
            serializer.save(patient=user, doctor_id=doctor_id)
        elif user.role == "ADMIN":
            serializer.save(patient_id=patient_id, doctor_id=doctor_id)
        else:
            serializer.save()


class TreatmentViewSet(viewsets.ModelViewSet):
    queryset = Treatment.objects.all()
    serializer_class = TreatmentSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_doctors(request):
    doctors = User.objects.filter(role='DOCTOR')
    serializer = UserSerializer(doctors, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_users(request):
    if request.user.role != 'ADMIN':
        return Response({"detail": "Access denied."}, status=403)
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_user_role(request, user_id):
    if request.user.role != 'ADMIN':
        return Response({"detail": "Access denied."}, status=403)

    user = get_object_or_404(User, id=user_id)
    new_role = request.data.get('role')

    if new_role not in [r[0] for r in User.Role.choices]:
        return Response({"detail": "Invalid role."}, status=400)

    user.role = new_role
    user.save()

    return Response({"detail": "Role updated."})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_patient_history_pdf(request, patient_id):
    user = request.user
    if user.role not in ['DOCTOR', 'ADMIN']:
        return Response({"detail": "Access denied."}, status=403)

    patient = get_object_or_404(User, id=patient_id)
    appointments = Appointment.objects.filter(patient=patient).select_related("treatment", "doctor")

    # 🧠 Отримуємо ПІБ пацієнта
    patient_profile = getattr(patient, 'patient_profile', None)
    patient_full_name = f"{patient_profile.last_name} {patient_profile.first_name}" if patient_profile else patient.username

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer)
    y = 800

    p.setFont("DejaVuSans", 14)
    p.drawString(50, y, f"Історія лікування: {patient_full_name}")
    y -= 30

    if not appointments:
        p.drawString(50, y, "Прийомів не знайдено.")
    else:
        for appt in appointments:
            p.setFont("DejaVuSans", 11)

            doctor = appt.doctor
            doctor_profile = getattr(doctor, 'doctor_profile', None)
            doctor_name = f"{doctor_profile.last_name} {doctor_profile.first_name}" if doctor_profile else doctor.username

            # Без смайликів ⛔📅🩺❌
            p.drawString(50, y, f"{appt.scheduled_time.strftime('%Y-%m-%d %H:%M')} — {doctor_name}")
            y -= 15
            p.drawString(60, y, f"Опис: {appt.description}")
            y -= 15

            if hasattr(appt, 'treatment') and appt.treatment:
                p.drawString(60, y, f"Діагноз: {appt.treatment.diagnosis}")
                y -= 15
                p.drawString(60, y, f"Процедура: {appt.treatment.procedure}")
                y -= 15
                p.drawString(60, y, f"Рекомендації: {appt.treatment.recommendations or '—'}")
                y -= 25
            else:
                p.drawString(60, y, "Лікування не додано")
                y -= 25

            if y < 100:
                p.showPage()
                y = 800

    p.showPage()
    p.save()
    buffer.seek(0)

    return HttpResponse(buffer, content_type='application/pdf')

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_patient_appointments(request, patient_id):
    user = request.user
    if user.role not in ['DOCTOR', 'ADMIN']:
        return Response({"detail": "Access denied."}, status=403)

    patient = get_object_or_404(User, id=patient_id)
    appointments = Appointment.objects.filter(patient=patient).select_related("doctor", "treatment")
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_user_with_profile(request):
    if request.user.role != "ADMIN":
        return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def admin_get_or_edit_user(request, user_id):
    if request.user.role != "ADMIN":
        return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def cancel_appointment(request, pk):
    appointment = get_object_or_404(Appointment, pk=pk)
    if request.user.role not in ['ADMIN', 'DOCTOR']:
        return Response({"detail": "Access denied."}, status=403)
    appointment.status = 'CANCELLED'
    appointment.save()
    return Response({"detail": "Appointment cancelled."})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_doctors(request):
    doctors = User.objects.filter(role='DOCTOR')
    data = []
    for doc in doctors:
        profile = getattr(doc, 'doctor_profile', None)
        if profile:
            data.append({
                'id': doc.id,
                'first_name': profile.first_name,
                'last_name': profile.last_name,
                'specialization': profile.specialization,
                'experience_years': profile.experience_years,
                'photo_url': profile.photo.url if profile.photo else None,
            })
    return Response(data)


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def upload_doctor_photo(request):
    user = request.user
    if user.role != 'DOCTOR':
        return Response({"detail": "Access denied."}, status=403)

    if 'photo' not in request.FILES:
        return Response({"detail": "No photo uploaded."}, status=400)

    doctor_profile = getattr(user, 'doctor_profile', None)
    if not doctor_profile:
        return Response({"detail": "Doctor profile not found."}, status=404)

    doctor_profile.photo = request.FILES['photo']
    doctor_profile.save()

    return Response({"detail": "Photo uploaded successfully."})


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_user(request, user_id):
    return Response({"detail": "Функція ще не реалізована."}, status=501)
