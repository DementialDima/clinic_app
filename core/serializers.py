from rest_framework import serializers
from .models import User, PatientProfile, DoctorProfile, Appointment, Treatment
from django.utils.dateparse import parse_datetime
from django.utils.timezone import make_aware


class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = '__all__'


class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    patient_profile = PatientProfileSerializer(required=False, read_only=True)
    doctor_profile = DoctorProfileSerializer(required=False, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'patient_profile', 'doctor_profile']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        patient_data = validated_data.pop('patient_profile', None)
        doctor_data = validated_data.pop('doctor_profile', None)

        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data.get('role', 'PATIENT'),
            email=validated_data.get('email', '')
        )

        if user.role == 'PATIENT' and patient_data:
            PatientProfile.objects.create(user=user, **patient_data)

        if user.role == 'DOCTOR' and doctor_data:
            DoctorProfile.objects.create(user=user, **doctor_data)

        return user

    def update(self, instance, validated_data):
        patient_data = validated_data.pop('patient_profile', None)
        doctor_data = validated_data.pop('doctor_profile', None)

        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()

        if instance.role == 'PATIENT' and patient_data:
            profile, _ = PatientProfile.objects.get_or_create(user=instance)
            for attr, value in patient_data.items():
                setattr(profile, attr, value)
            profile.save()

        if instance.role == 'DOCTOR' and doctor_data:
            profile, _ = DoctorProfile.objects.get_or_create(user=instance)
            for attr, value in doctor_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


class AppointmentSerializer(serializers.ModelSerializer):
    patient = UserSerializer(read_only=True)
    doctor = UserSerializer(read_only=True)
    treatment = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = '__all__'

    def get_treatment(self, obj):
        if hasattr(obj, 'treatment'):
            return TreatmentSerializer(obj.treatment).data
        return None

    def validate(self, data):
        doctor = data.get('doctor')
        start = data.get('scheduled_time')
        end = data.get('end_time')

        if doctor and start and end:
            overlaps = Appointment.objects.filter(
                doctor=doctor,
                scheduled_time__lt=end,
                end_time__gt=start
            )
            if self.instance:
                overlaps = overlaps.exclude(id=self.instance.id)
            if overlaps.exists():
                raise serializers.ValidationError("У лікаря вже є прийом у цей час.")

        return data


class TreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Treatment
        fields = '__all__'
