import pytest

LOGIN_URL = "/api/login/"


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient

    return APIClient()


@pytest.fixture(autouse=True)
def _email_backend(settings):
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"


@pytest.fixture
def user_factory():
    from django.contrib.auth import get_user_model

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


@pytest.fixture
def authenticated_tokens(api_client, user_factory):
    user = user_factory(
        email="user@example.com", password="StrongPassword123", is_active=True
    )
    login_response = api_client.post(
        LOGIN_URL,
        {"email": "user@example.com", "password": "StrongPassword123"},
        format="json",
    )
    assert login_response.status_code == 200
    return user, login_response.data["access"], login_response.data["refresh"]
