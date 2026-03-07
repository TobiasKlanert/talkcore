from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import (
    RegisterView,
    ActivateAccountView,
    LoginView,
    LogoutView,
    ResetPasswordView,
    ConfirmPasswordView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("activate/", ActivateAccountView.as_view(), name="activate_account"),
    path("login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("reset-password/", ResetPasswordView.as_view()),
    path("confirm-password/", ConfirmPasswordView.as_view()),
]
