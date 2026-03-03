import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


pytestmark = pytest.mark.django_db

REGISTER_URL = "/api/register/"


@pytest.fixture(autouse=True)
def _email_backend(settings):
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"


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
        is_active = kwargs.pop("is_active", False)

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


def test_register_success_creates_inactive_user_and_sends_activation_email(api_client, mailoutbox):
    payload = {
        "email": "user@example.com",
        "display_name": "Tobias",
        "password": "StrongPassword123",
        "password_confirm": "StrongPassword123",
    }

    response = api_client.post(REGISTER_URL, payload, format="json")

    assert response.status_code == 201
    assert "access" not in response.data
    assert "refresh" not in response.data

    user = get_user_model().objects.get(email=payload["email"])
    assert user.display_name == payload["display_name"]
    assert user.is_active is False
    assert len(mailoutbox) == 1


def test_register_fails_when_passwords_do_not_match(api_client):
    payload = {
        "email": "user@example.com",
        "display_name": "Tobias",
        "password": "StrongPassword123",
        "password_confirm": "WrongPassword123",
    }

    response = api_client.post(REGISTER_URL, payload, format="json")

    assert response.status_code == 400
    assert not get_user_model().objects.filter(email=payload["email"]).exists()


def test_register_fails_for_duplicate_email(api_client, user_factory):
    user_factory(email="user@example.com", password="StrongPassword123")

    payload = {
        "email": "user@example.com",
        "display_name": "Another Name",
        "password": "StrongPassword123",
        "password_confirm": "StrongPassword123",
    }

    response = api_client.post(REGISTER_URL, payload, format="json")

    assert response.status_code == 400
    assert get_user_model().objects.filter(email="user@example.com").count() == 1
