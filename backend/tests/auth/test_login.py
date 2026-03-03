import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


pytestmark = pytest.mark.django_db

LOGIN_URL = "/api/login/"


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


def test_login_success_returns_tokens_and_sets_online(api_client, user_factory):
    user = user_factory(email="user@example.com", password="StrongPassword123", is_active=True)

    payload = {
        "email": "user@example.com",
        "password": "StrongPassword123",
    }
    response = api_client.post(LOGIN_URL, payload, format="json")

    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data
    assert response.data["access"]
    assert response.data["refresh"]

    user.refresh_from_db()
    assert user.is_online is True


def test_login_fails_with_invalid_credentials(api_client, user_factory):
    user_factory(email="user@example.com", password="StrongPassword123", is_active=True)

    payload = {
        "email": "user@example.com",
        "password": "WrongPassword123",
    }
    response = api_client.post(LOGIN_URL, payload, format="json")

    assert response.status_code == 401


def test_login_fails_for_inactive_user(api_client, user_factory):
    user = user_factory(email="inactive@example.com", password="StrongPassword123", is_active=False)

    payload = {
        "email": user.email,
        "password": "StrongPassword123",
    }
    response = api_client.post(LOGIN_URL, payload, format="json")

    assert response.status_code == 403
    user.refresh_from_db()
    assert user.is_online is False
