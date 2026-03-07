from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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