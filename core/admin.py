from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, PatientProfile, DoctorProfile

class CustomUserAdmin(UserAdmin):
    model = User
    fieldsets = UserAdmin.fieldsets + (
        ("Роль", {"fields": ("role",)}),
    )
    list_display = ("username", "email", "first_name", "last_name", "role")

admin.site.register(User, CustomUserAdmin)
admin.site.register(PatientProfile)
admin.site.register(DoctorProfile)
