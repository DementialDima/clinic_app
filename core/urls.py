from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AppointmentViewSet,
    TreatmentViewSet,
    list_doctors,
    list_users,
    update_user_role,
    export_patient_history_pdf,
    create_user_with_profile,
    admin_get_or_edit_user,
    cancel_appointment,
    public_doctors,
    upload_doctor_photo,
    delete_user,
    get_patient_appointments,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointments')
router.register(r'treatments', TreatmentViewSet, basename='treatments')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('doctors/', list_doctors, name='list_doctors'),
    path('users/', list_users, name='list_users'),
    path('users/<int:user_id>/role/', update_user_role, name='update_user_role'),
    path('users/<int:user_id>/', admin_get_or_edit_user, name='admin_get_or_edit_user'),
    path('users/<int:user_id>/delete/', delete_user, name='delete_user'),
    path('users/create/', create_user_with_profile, name='create_user_with_profile'),
    path('appointments/<int:pk>/cancel/', cancel_appointment, name='cancel_appointment'),
    path('patients/<int:patient_id>/history/pdf/', export_patient_history_pdf, name='export_patient_history_pdf'),
    path('patients/<int:patient_id>/appointments/', get_patient_appointments, name='get_patient_appointments'),
    path('doctors/public/', public_doctors, name='public_doctors'),
    path('doctors/upload-photo/', upload_doctor_photo, name='upload_doctor_photo'),
]
