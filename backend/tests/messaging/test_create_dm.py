import pytest
from rest_framework import status

from messaging_app.models import Conversation, ConversationMember


@pytest.mark.django_db
def test_authenticated_user_can_create_dm(api_client, user_factory):
    sender = user_factory(email="user-dm1@example.com")
    recipient = user_factory(email="user-dm2@example.com")

    api_client.force_authenticate(user=sender)

    response = api_client.post(
        "/api/conversations/create-dm/",
        {"user_id": str(recipient.id)},
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert Conversation.objects.filter(type="dm").count() == 1

    dm = Conversation.objects.get(type="dm")

    assert dm.type == "dm"

    member_ids = set(
        ConversationMember.objects.filter(conversation=dm).values_list("user_id", flat=True)
    )
    assert member_ids == {sender.id, recipient.id}


@pytest.mark.django_db
def test_create_dm_does_not_create_duplicate_conversation(api_client, user_factory):
    sender = user_factory(email="user-dm1@example.com")
    recipient = user_factory(email="user-dm2@example.com")

    api_client.force_authenticate(user=sender)

    first_response = api_client.post(
        "/api/conversations/create-dm/",
        {"user_id": str(recipient.id)},
        format="json",
    )

    second_response = api_client.post(
        "/api/conversations/create-dm/",
        {"user_id": str(recipient.id)},
        format="json",
    )

    assert first_response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]
    assert second_response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]
    assert Conversation.objects.filter(type="dm").count() == 1

    dm = Conversation.objects.get(type="dm")
    member_ids = set(
        ConversationMember.objects.filter(conversation=dm).values_list("user_id", flat=True)
    )
    assert member_ids == {sender.id, recipient.id}


@pytest.mark.django_db
def test_user_cannot_create_dm_with_self(api_client, user_factory):
    user = user_factory()

    api_client.force_authenticate(user=user)

    response = api_client.post(
        "/api/conversations/create-dm/",
        {"user_id": str(user.id)},
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert Conversation.objects.filter(type="dm").count() == 0


@pytest.mark.django_db
def test_unauthenticated_user_cannot_create_dm(api_client, user_factory):
    recipient = user_factory()

    response = api_client.post(
        "/api/conversations/create-dm/",
        {"user_id": str(recipient.id)},
        format="json",
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert Conversation.objects.filter(type="dm").count() == 0


@pytest.mark.django_db
def test_create_dm_with_nonexistent_user_returns_404(api_client, user_factory):
    sender = user_factory()

    api_client.force_authenticate(user=sender)

    response = api_client.post(
        "/api/conversations/create-dm/",
        {"user_id": "11111111-1111-1111-1111-111111111111"},
        format="json",
    )

    assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_400_BAD_REQUEST]
    assert Conversation.objects.filter(type="dm").count() == 0
