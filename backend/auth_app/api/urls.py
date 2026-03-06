from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, ActivateAccountView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("activate/", ActivateAccountView.as_view(), name="activate_account"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]