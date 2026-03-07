from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from urllib.parse import urlencode

from .serializers import RegisterSerializer, LoginSerializer

User = get_user_model()

class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        uid = urlsafe_base64_encode(force_bytes(str(user.pk)))
        token = default_token_generator.make_token(user)

        activation_path = reverse("activate_account")

        params = urlencode({
            "uid": uid,
            "token": token,
        })

        activation_url = f"{request.scheme}://{request.get_host()}{activation_path}?{params}"
        
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