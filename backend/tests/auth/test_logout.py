import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken


pytestmark = pytest.mark.django_db

LOGIN_URL = "/api/login/"
LOGOUT_URL = "/api/logout/"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user_factory():
    user_model = get_user_model()

    def _create_user(**kwargs):
        email = kwargs.pop("email", "user@example.com")
        display_name = kwargs.pop("display_name", "Tobias")
        password = kwargs.pop("password", "StrongPassword123")
        is_active = kwargs.pop("is_active", True)

        user = user_model.objects.create(
            email=email,
            display_name=display_name,
            is_active=is_active,
            **kwargs,
        )
        user.set_password(password)
        user.save()
        return user

    return _create_user


@pytest.fixture
def authenticated_tokens(api_client, user_factory):
    user = user_factory(email="user@example.com", password="StrongPassword123", is_active=True)
    login_response = api_client.post(
        LOGIN_URL,
        {"email": "user@example.com", "password": "StrongPassword123"},
        format="json",
    )
    assert login_response.status_code == 200
    return user, login_response.data["access"], login_response.data["refresh"]


def test_logout_success_blacklists_refresh_token_and_sets_offline(api_client, authenticated_tokens):
    user, access, refresh = authenticated_tokens

    parsed_refresh = RefreshToken(refresh)
    jti = parsed_refresh["jti"]

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    response = api_client.post(LOGOUT_URL, {"refresh": refresh}, format="json")

    assert response.status_code == 204

    user.refresh_from_db()
    assert user.is_online is False

    assert BlacklistedToken.objects.filter(token__jti=jti).exists()
