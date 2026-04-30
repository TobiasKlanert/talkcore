from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import (
    PasswordResetTokenGenerator,
    default_token_generator,
)
from django.core.mail import EmailMultiAlternatives, send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import (
    ConfirmPasswordSerializer,
    LoginSerializer,
    LogoutSerializer,
    RegisterSerializer,
)

User = get_user_model()

class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        uid = urlsafe_base64_encode(force_bytes(str(user.pk)))
        token = default_token_generator.make_token(user)

        frontend_url = settings.FRONTEND_URL.rstrip("/")
        params = urlencode({
            "uid": uid,
            "token": token,
        })

        activation_url = f"{frontend_url}/activate?{params}"
        
        context = {
            "activation_url": activation_url,
        }

        html_content = render_to_string(
            "emails/activation_email.html",
            context
        )

        email = EmailMultiAlternatives(
            subject="Activate your TalkCore account",
            body=activation_url,  # fallback plain text
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )

        email.attach_alternative(html_content, "text/html")
        email.encoding = "utf-8"
        email.send()

        #for development only -> remove in production
        print("ACTIVATION URL:", activation_url)

        return Response(
            {"detail": "Registration successful. Please check your email to activate your account."},
            status=status.HTTP_201_CREATED,
        )


class ActivateAccountView(APIView):
    permission_classes = []

    def get(self, request):
        uid = request.query_params.get("uid")
        token = request.query_params.get("token")

        if not uid or not token:
            return Response(
                {"detail": "Invalid activation link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response(
                {"detail": "Invalid activation link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Invalid or expired activation link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = True
        user.save(update_fields=["is_active"])

        return Response(
            {"detail": "Account activated successfully."},
            status=status.HTTP_200_OK,
        )


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class ResetPasswordView(APIView):

    def post(self, request):
        email = request.data.get("email")

        try:
            user = User.objects.get(email=email, is_active=True)

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = PasswordResetTokenGenerator().make_token(user)

            frontend_url = settings.FRONTEND_URL.rstrip("/")
            params = urlencode({
                "uid": uid,
                "token": token,
            })
            reset_url = f"{frontend_url}/reset-password?{params}"

            send_mail(
                subject="Reset your TalkCore password",
                message=reset_url,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )

            # for development only -> remove in production
            print("RESET PASSWORD URL:", reset_url)

        except User.DoesNotExist:
            pass

        return Response(
            {"detail": "If an account with this email exists, a password reset link has been sent."},
            status=status.HTTP_200_OK
        )


class ConfirmPasswordView(APIView):

    def post(self, request):

        serializer = ConfirmPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"detail": "Password has been reset successfully."},
            status=status.HTTP_200_OK
        )