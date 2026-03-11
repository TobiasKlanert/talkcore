import pytest

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db

ACTIVATE_URL = "/api/activate/"


def test_activate_account_success_sets_user_active(api_client, user_factory):
    user = user_factory(is_active=False)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    response = api_client.get(ACTIVATE_URL, {"uid": uid, "token": token})

    assert response.status_code == 200
    user.refresh_from_db()
    assert user.is_active is True


def test_activate_account_fails_with_invalid_token(api_client, user_factory):
    user = user_factory(is_active=False)
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    response = api_client.get(ACTIVATE_URL, {"uid": uid, "token": "invalid-token"})

    assert response.status_code == 400
    user.refresh_from_db()
    assert user.is_active is False
