import pytest
from rest_framework import status

from messaging_app.models import Conversation, ConversationMember, Message


SEND_MESSAGE_URL = "/api/messages/"


@pytest.mark.django_db
def test_user_can_send_message(api_client, authenticated_tokens):
    user, access_token, _ = authenticated_tokens
    conversation = Conversation.objects.create(name="team-updates", type="channel")
    ConversationMember.objects.create(user=user, conversation=conversation)

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    payload = {
        "conversation": str(conversation.id),
        "content": "Hello team",
    }

    response = api_client.post(SEND_MESSAGE_URL, payload, format="json")

    assert response.status_code == 201
    assert Message.objects.filter(
        conversation=conversation,
        sender=user,
        content="Hello team",
    ).exists()


@pytest.mark.django_db
def test_user_cannot_send_message_if_not_member(api_client, authenticated_tokens):
    user, access_token, _ = authenticated_tokens
    conversation = Conversation.objects.create(name="private-channel", type="channel")

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    payload = {
        "conversation": str(conversation.id),
        "content": "Should not send",
    }

    response = api_client.post(SEND_MESSAGE_URL, payload, format="json")

    assert response.status_code == 403
    assert not Message.objects.filter(conversation=conversation, sender=user).exists()


@pytest.mark.django_db
def test_user_cannot_send_empty_message(api_client, authenticated_tokens):
    user, access_token, _ = authenticated_tokens
    conversation = Conversation.objects.create(name="team-updates", type="channel")
    ConversationMember.objects.create(user=user, conversation=conversation)

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    response = api_client.post(
        SEND_MESSAGE_URL,
        {
            "conversation": str(conversation.id),
            "content": "",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert not Message.objects.filter(conversation=conversation, sender=user).exists()


@pytest.mark.django_db
def test_send_message_with_invalid_conversation_id_returns_error(
    api_client, authenticated_tokens
):
    user, access_token, _ = authenticated_tokens

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    response = api_client.post(
        SEND_MESSAGE_URL,
        {
            "conversation": "11111111-1111-1111-1111-111111111111",
            "content": "Hello?",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert not Message.objects.filter(sender=user, content="Hello?").exists()


@pytest.mark.django_db
def test_unauthenticated_user_cannot_send_message(api_client):
    conversation = Conversation.objects.create(name="team-updates", type="channel")

    response = api_client.post(
        SEND_MESSAGE_URL,
        {
            "conversation": str(conversation.id),
            "content": "Hello team",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert Message.objects.count() == 0
