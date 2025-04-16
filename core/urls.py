from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AppointmentViewSet, TreatmentViewSet, list_doctors, list_users,
    update_user_role, export_patient_history_pdf,
    create_user_with_profile, admin_get_or_edit_user
)

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'treatments', TreatmentViewSet, basename='treatment')

urlpatterns = [
    path('', include(router.urls)),
    path('doctors/', list_doctors),
    path('users/', list_users),
    path('users/<int:user_id>/role/', update_user_role),
    path('patients/<int:patient_id>/history/pdf/', export_patient_history_pdf),
    path('users/create/', create_user_with_profile),
    path('users/<int:user_id>/', admin_get_or_edit_user),
]
