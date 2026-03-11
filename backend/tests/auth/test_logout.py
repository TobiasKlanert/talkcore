import pytest

from django.contrib.auth import get_user_model

from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

pytestmark = pytest.mark.django_db

LOGIN_URL = "/api/login/"
LOGOUT_URL = "/api/logout/"


def test_logout_success_blacklists_refresh_token_and_sets_offline(
    api_client, authenticated_tokens
):
    user, access, refresh = authenticated_tokens

    parsed_refresh = RefreshToken(refresh)
    jti = parsed_refresh["jti"]

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    response = api_client.post(LOGOUT_URL, {"refresh": refresh}, format="json")

    assert response.status_code == 204

    user.refresh_from_db()
    assert user.is_online is False

    assert BlacklistedToken.objects.filter(token__jti=jti).exists()
