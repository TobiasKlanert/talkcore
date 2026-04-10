import pytest
from rest_framework import status

from messaging_app.models import Conversation, ConversationMember


def _extract_conversations(response):
    data = response.json()
    if isinstance(data, dict) and "results" in data:
        return data["results"]
    return data


@pytest.mark.django_db
def test_user_sees_only_conversations_where_user_is_a_member(
    api_client, authenticated_tokens
):
    user, access_token, _ = authenticated_tokens
    visible_conversation = Conversation.objects.create(
        name="project-chat",
        type="channel",
    )
    hidden_conversation = Conversation.objects.create(
        name="staff-only",
        type="channel",
    )

    ConversationMember.objects.create(user=user, conversation=visible_conversation)

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    response = api_client.get("/api/conversations/")

    assert response.status_code == status.HTTP_200_OK

    conversations = _extract_conversations(response)
    conversation_ids = {conversation["id"] for conversation in conversations}

    assert str(visible_conversation.id) in conversation_ids
    assert str(hidden_conversation.id) not in conversation_ids


@pytest.mark.django_db
def test_user_does_not_see_conversations_where_user_is_not_a_member(
    api_client, authenticated_tokens, user_factory
):
    user, access_token, _ = authenticated_tokens
    other_user = user_factory(email="other-member@example.com")
    foreign_conversation = Conversation.objects.create(
        name="private-team-chat",
        type="channel",
    )

    ConversationMember.objects.create(user=other_user, conversation=foreign_conversation)

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    response = api_client.get("/api/conversations/")

    assert response.status_code == status.HTTP_200_OK

    conversations = _extract_conversations(response)
    conversation_ids = {conversation["id"] for conversation in conversations}

    assert str(foreign_conversation.id) not in conversation_ids


@pytest.mark.django_db
def test_list_conversations_always_includes_general_channel(
    api_client, authenticated_tokens
):
    _, access_token, _ = authenticated_tokens
    general_conversation = Conversation.objects.get(type="channel", name="general")

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    response = api_client.get("/api/conversations/")

    assert response.status_code == status.HTTP_200_OK

    conversations = _extract_conversations(response)
    conversation_names = {conversation["name"] for conversation in conversations}
    conversation_ids = {conversation["id"] for conversation in conversations}

    assert "general" in conversation_names
    assert str(general_conversation.id) in conversation_ids


@pytest.mark.django_db
def test_unauthenticated_user_cannot_list_conversations(api_client):
    response = api_client.get("/api/conversations/")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
