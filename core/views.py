from rest_framework import viewsets, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Appointment, Treatment, User, DoctorProfile
from .serializers import AppointmentSerializer, TreatmentSerializer, UserSerializer
from reportlab.pdfgen import canvas
from django.http import HttpResponse
import io


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        patient_id = self.request.query_params.get('patient_id')
        if patient_id and user.role in ['DOCTOR', 'ADMIN']:
            return queryset.filter(patient_id=patient_id)

        if user.role == "DOCTOR":
            return queryset.filter(doctor=user)
        elif user.role == "PATIENT":
            return queryset.filter(patient=user)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == "PATIENT":
            doctor_id = self.request.data.get("doctor")
            serializer.save(patient=user, doctor_id=doctor_id)

        elif user.role == "ADMIN":
            doctor_id = self.request.data.get("doctor")
            patient_id = self.request.data.get("patient")

            if not doctor_id or not patient_id:
                raise serializers.ValidationError("Doctor and patient must be specified.")

            serializer.save(doctor_id=doctor_id, patient_id=patient_id)

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

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer)
    y = 800

    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, f"Історія лікування: {patient.username}")
    y -= 30

    if not appointments:
        p.drawString(50, y, "Прийомів не знайдено.")
    else:
        for appt in appointments:
            p.setFont("Helvetica", 11)
            p.drawString(50, y, f"📅 {appt.scheduled_time.strftime('%Y-%m-%d %H:%M')} — {appt.doctor.username}")
            y -= 15
            p.drawString(60, y, f"Опис: {appt.description}")
            y -= 15
            if hasattr(appt, 'treatment'):
                p.drawString(60, y, f"🩺 Діагноз: {appt.treatment.diagnosis}")
                y -= 15
                p.drawString(60, y, f"Процедура: {appt.treatment.procedure}")
                y -= 15
                p.drawString(60, y, f"Рекомендації: {appt.treatment.recommendations or '—'}")
                y -= 25
            else:
                p.drawString(60, y, "❌ Лікування не додано")
                y -= 25

            if y < 100:
                p.showPage()
                y = 800

    p.showPage()
    p.save()
    buffer.seek(0)

    return HttpResponse(buffer, content_type='application/pdf')


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
