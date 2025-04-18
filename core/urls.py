from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

from .views import (
    AppointmentViewSet, TreatmentViewSet, list_doctors, list_users,
    update_user_role, export_patient_history_pdf,
    create_user_with_profile, admin_get_or_edit_user, cancel_appointment,
    upload_doctor_photo, public_doctors  # <– додай це, якщо ще не додано
)

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'treatments', TreatmentViewSet, basename='treatment')

urlpatterns = [
    path('', include(router.urls)),
    path('doctors/', list_doctors),
    path('doctors/public/', public_doctors),
    path('doctors/profile/photo/', upload_doctor_photo),
    path('users/', list_users),
    path('users/<int:user_id>/role/', update_user_role),
    path('patients/<int:patient_id>/history/pdf/', export_patient_history_pdf),
    path('users/create/', create_user_with_profile),
    path('users/<int:user_id>/', admin_get_or_edit_user),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/appointments/<int:pk>/cancel/', cancel_appointment),
]

# ✅ ЦЕ МАЄ БУТИ В САМОМУ НИЗУ
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
