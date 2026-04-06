import pytest
from rest_framework import status

from messaging_app.models import Conversation, ConversationMember, Message


def _extract_messages(response):
    data = response.json()
    if isinstance(data, dict) and "results" in data:
        return data["results"]
    return data


@pytest.mark.django_db
def test_user_can_list_messages(api_client, authenticated_tokens, user_factory):
    member_user, access_token, _ = authenticated_tokens
    other_user = user_factory(email="user2@example.com")
    conversation = Conversation.objects.create(name="project-chat", type="channel")

    ConversationMember.objects.create(user=member_user, conversation=conversation)
    ConversationMember.objects.create(user=other_user, conversation=conversation)

    Message.objects.create(conversation=conversation, sender=member_user, content="First")
    Message.objects.create(conversation=conversation, sender=other_user, content="Second")

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    url = f"/api/conversations/{conversation.id}/messages/"

    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK

    messages = _extract_messages(response)

    assert len(messages) == 2


@pytest.mark.django_db
def test_user_cannot_view_messages_if_not_member(api_client, authenticated_tokens, user_factory):
    requester, access_token, _ = authenticated_tokens
    sender = user_factory(email="user2@example.com")
    conversation = Conversation.objects.create(name="staff-only", type="channel")

    ConversationMember.objects.create(user=sender, conversation=conversation)
    Message.objects.create(conversation=conversation, sender=sender, content="Top secret")

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    url = f"/api/conversations/{conversation.id}/messages/"

    response = api_client.get(url)

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_list_messages_returns_messages_in_creation_order(
    api_client, authenticated_tokens
):
    user, access_token, _ = authenticated_tokens
    conversation = Conversation.objects.create(name="ordered-chat", type="channel")
    ConversationMember.objects.create(user=user, conversation=conversation)

    first_message = Message.objects.create(
        conversation=conversation,
        sender=user,
        content="First",
    )
    second_message = Message.objects.create(
        conversation=conversation,
        sender=user,
        content="Second",
    )

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    response = api_client.get(f"/api/conversations/{conversation.id}/messages/")

    assert response.status_code == status.HTTP_200_OK
    messages = _extract_messages(response)

    assert [message["id"] for message in messages] == [
        str(first_message.id),
        str(second_message.id),
    ]
    assert [message["content"] for message in messages] == ["First", "Second"]


@pytest.mark.django_db
def test_list_messages_returns_empty_list_for_empty_conversation(
    api_client, authenticated_tokens
):
    user, access_token, _ = authenticated_tokens
    conversation = Conversation.objects.create(name="quiet-room", type="channel")
    ConversationMember.objects.create(user=user, conversation=conversation)

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    response = api_client.get(f"/api/conversations/{conversation.id}/messages/")

    assert response.status_code == status.HTTP_200_OK
    assert _extract_messages(response) == []


@pytest.mark.django_db
def test_unauthenticated_user_cannot_list_messages(api_client, user_factory):
    user = user_factory(email="member@example.com")
    conversation = Conversation.objects.create(name="project-chat", type="channel")
    ConversationMember.objects.create(user=user, conversation=conversation)

    response = api_client.get(f"/api/conversations/{conversation.id}/messages/")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
