import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient


pytestmark = pytest.mark.django_db

RESET_PASSWORD_URL = "/api/reset-password/"
CONFIRM_PASSWORD_URL = "/api/confirm-password/"


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


def test_reset_password_request_existing_email_sends_email_and_returns_200(api_client, user_factory, mailoutbox):
    user = user_factory(email="user@example.com")

    response = api_client.post(RESET_PASSWORD_URL, {"email": user.email}, format="json")

    assert response.status_code == 200
    assert len(mailoutbox) == 1


def test_reset_password_request_non_existing_email_still_returns_200(api_client, mailoutbox):
    response = api_client.post(RESET_PASSWORD_URL, {"email": "missing@example.com"}, format="json")

    assert response.status_code == 200
    assert len(mailoutbox) == 0


def test_confirm_password_reset_success_updates_password(api_client, user_factory):
    user = user_factory(email="user@example.com", password="OldStrongPassword123")
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    payload = {
        "uid": uid,
        "token": token,
        "password": "NewStrongPassword123",
        "password_confirm": "NewStrongPassword123",
    }
    response = api_client.post(CONFIRM_PASSWORD_URL, payload, format="json")

    assert response.status_code == 200
    user.refresh_from_db()
    assert user.check_password("NewStrongPassword123")


def test_confirm_password_reset_fails_when_passwords_do_not_match(api_client, user_factory):
    user = user_factory(email="user@example.com", password="OldStrongPassword123")
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    payload = {
        "uid": uid,
        "token": token,
        "new_password": "NewStrongPassword123",
        "new_password_confirm": "DifferentPassword123",
    }
    response = api_client.post(CONFIRM_PASSWORD_URL, payload, format="json")

    assert response.status_code == 400
    user.refresh_from_db()
    assert user.check_password("OldStrongPassword123")


def test_confirm_password_reset_fails_with_invalid_token(api_client, user_factory):
    user = user_factory(email="user@example.com", password="OldStrongPassword123")
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    payload = {
        "uid": uid,
        "token": "invalid-token",
        "new_password": "NewStrongPassword123",
        "new_password_confirm": "NewStrongPassword123",
    }
    response = api_client.post(CONFIRM_PASSWORD_URL, payload, format="json")

    assert response.status_code == 400
    user.refresh_from_db()
    assert user.check_password("OldStrongPassword123")
