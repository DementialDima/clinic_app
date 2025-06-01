from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Адміністратор"
        DOCTOR = "DOCTOR", "Лікар"
        PATIENT = "PATIENT", "Пацієнт"

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.PATIENT,
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="patient_profile")

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True)
    birth_date = models.DateField()
    gender = models.CharField(max_length=10, choices=[("MALE", "Чоловіча"), ("FEMALE", "Жіноча")])
    phone_number = models.CharField(max_length=20)
    address = models.TextField()
    inn = models.CharField(max_length=20, blank=True)
    medical_card_number = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return f"Пацієнт {self.last_name} {self.first_name}"


class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="doctor_profile")

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True)
    specialization = models.CharField(max_length=100)
    experience_years = models.PositiveIntegerField()
    license_number = models.CharField(max_length=50)
    license_issued = models.DateField()
    education = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()
    photo = models.ImageField(upload_to='doctor_photos/', null=True, blank=True)

    def __str__(self):
        return f"Лікар {self.last_name} {self.first_name} ({self.specialization})"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('PLANNED', 'Запланований'),
        ('COMPLETED', 'Завершений'),
        ('CANCELLED', 'Скасований'),
    ]

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments_as_patient',
        limit_choices_to={'role': 'PATIENT'}
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments_as_doctor',
        limit_choices_to={'role': 'DOCTOR'}
    )
    scheduled_time = models.DateTimeField()
    end_time = models.DateTimeField()
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNED')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Прийом {self.id} - {self.doctor} для {self.patient}"


class Treatment(models.Model):
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name='treatment'
    )
    diagnosis = models.TextField()
    procedure = models.TextField()
    medications = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Лікування для прийому #{self.appointment.id}"
