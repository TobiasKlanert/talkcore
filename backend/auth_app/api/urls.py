from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import RegisterView, ActivateAccountView, LoginView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("activate/", ActivateAccountView.as_view(), name="activate_account"),
    path("login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]