from rest_framework import serializers
from .models import User, PatientProfile, DoctorProfile, Appointment, Treatment

class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        exclude = ['user']


class DoctorProfileSerializer(serializers.ModelSerializer):
    photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = DoctorProfile
        exclude = ['user']


class AppointmentSerializer(serializers.ModelSerializer):
    patient = serializers.SerializerMethodField()
    doctor = serializers.SerializerMethodField()
    treatment = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = '__all__'

    def get_patient(self, obj):
        return {
            "id": obj.patient.id,
            "username": obj.patient.username,
            "first_name": obj.patient.patient_profile.first_name if hasattr(obj.patient, 'patient_profile') else '',
            "last_name": obj.patient.patient_profile.last_name if hasattr(obj.patient, 'patient_profile') else '',
            "role": obj.patient.role
        }

    def get_doctor(self, obj):
        return {
            "id": obj.doctor.id,
            "username": obj.doctor.username,
            "first_name": obj.doctor.doctor_profile.first_name if hasattr(obj.doctor, 'doctor_profile') else '',
            "last_name": obj.doctor.doctor_profile.last_name if hasattr(obj.doctor, 'doctor_profile') else '',
            "role": obj.doctor.role
        }

    def get_treatment(self, obj):
        if hasattr(obj, 'treatment'):
            return TreatmentSerializer(obj.treatment).data
        return None


class TreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Treatment
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    patient_profile = PatientProfileSerializer(required=False)
    doctor_profile = DoctorProfileSerializer(required=False)

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
