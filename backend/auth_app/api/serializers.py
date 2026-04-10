from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str

from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from users_app.api.serializers import UserSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email", "display_name", "password", "password_confirm")

    def validate_email(self, value):
        email = value.lower().strip()

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")

        return email

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")

        user = User.objects.create_user(
            email=validated_data["email"],
            display_name=validated_data["display_name"],
            password=validated_data["password"],
            is_active=False,
        )

        return user


class LoginSerializer(TokenObtainPairSerializer):

    username_field = "email"

    def validate(self, attrs):
        data = super().validate(attrs)

        user = self.user

        if not user.is_active:
            raise AuthenticationFailed("Account not activated")

        user.is_online = True
        user.save(update_fields=["is_online"])

        data["user"] = UserSerializer(user).data

        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def save(self, **kwargs):
        refresh_token = self.validated_data["refresh"]

        token = RefreshToken(refresh_token)
        token.blacklist()

        user = self.context["request"].user
        user.is_online = False
        user.save(update_fields=["is_online"])


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ConfirmPasswordSerializer(serializers.Serializer):

    uid = serializers.CharField()
    token = serializers.CharField()

    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):

        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError("Passwords do not match")

        try:
            uid = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=uid)

        except Exception:
            raise serializers.ValidationError("Invalid reset link")

        if not PasswordResetTokenGenerator().check_token(user, attrs["token"]):
            raise serializers.ValidationError("Invalid or expired token")

        attrs["user"] = user
        return attrs

    def save(self):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["password"])
        user.save(update_fields=["password"])