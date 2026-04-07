import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestUserSearchView:
    @pytest.fixture(autouse=True)
    def setup_users(self, user_factory):
        self.current_user = user_factory(
            display_name="Tobias",
            email="tobias@example.com",
        )
        self.tom = user_factory(display_name="Tom", email="tom@example.com")
        self.tonia = user_factory(display_name="Tonia", email="tonia@example.com")
        self.max = user_factory(display_name="Max", email="max@example.com")

    def test_authenticated_user_can_search_users_by_display_name(
        self,
        api_client,
    ):
        api_client.force_authenticate(user=self.current_user)

        url = reverse("search-user")
        response = api_client.get(url, {"search": "to"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

        display_names = [user["display_name"] for user in response.data]
        assert self.tom.display_name in display_names
        assert self.tonia.display_name in display_names
        assert self.current_user.display_name not in display_names

    def test_search_is_case_insensitive(
        self,
        api_client,
        user_factory,
    ):
        user_factory(display_name="Thomas", email="thomas@example.com")
        user_factory(display_name="tina", email="tina@example.com")
        user_factory(display_name="Anna", email="anna@example.com")

        api_client.force_authenticate(user=self.current_user)

        url = reverse("search-user")
        response = api_client.get(url, {"search": "TI"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["display_name"] == "tina"

    def test_authenticated_user_gets_empty_list_when_no_match_exists(
        self,
        api_client,
        user_factory,
    ):
        user_factory(display_name="Julia")

        api_client.force_authenticate(user=self.current_user)

        url = reverse("search-user")
        response = api_client.get(url, {"search": "xyz"})

        assert response.status_code == status.HTTP_200_OK
        assert response.data == []

    def test_authenticated_user_does_not_see_self_in_results_without_search(
        self,
        api_client,
    ):
        api_client.force_authenticate(user=self.current_user)

        url = reverse("search-user")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK

        returned_ids = [user["id"] for user in response.data]
        assert str(self.current_user.id) not in returned_ids
        assert str(self.max.id) in returned_ids

    def test_unauthenticated_user_gets_401(
        self,
        api_client,
    ):
        url = reverse("search-user")
        response = api_client.get(url, {"search": "to"})

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_response_contains_expected_fields(
        self,
        api_client,
    ):
        self.tom.avatar_url = "https://example.com/avatar.jpg"
        self.tom.save(update_fields=["avatar_url"])

        api_client.force_authenticate(user=self.current_user)

        url = reverse("search-user")
        response = api_client.get(url, {"search": "tom"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

        user_data = response.data[0]
        assert set(user_data.keys()) == {"id", "email", "display_name", "avatar_url"}
        assert user_data["id"] == str(self.tom.id)
        assert user_data["email"] == "tom@example.com"
        assert user_data["display_name"] == "Tom"
        assert user_data["avatar_url"] == "https://example.com/avatar.jpg"
