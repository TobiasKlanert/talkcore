import pytest

from messaging_app.models import Conversation, ConversationMember, Message


@pytest.mark.django_db
def test_user_can_list_messages(api_client, authenticated_tokens, user_factory):
    member_user, access_token, _ = authenticated_tokens
    other_user = user_factory()
    conversation = Conversation.objects.create(name="project-chat", type="channel")

    ConversationMember.objects.create(user=member_user, conversation=conversation)
    ConversationMember.objects.create(user=other_user, conversation=conversation)

    Message.objects.create(conversation=conversation, sender=member_user, content="First")
    Message.objects.create(conversation=conversation, sender=other_user, content="Second")

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    url = f"/api/conversations/{conversation.id}/messages/"

    response = api_client.get(url)

    assert response.status_code == 200

    data = response.json()
    if isinstance(data, dict) and "results" in data:
        messages = data["results"]
    else:
        messages = data

    assert len(messages) == 2


@pytest.mark.django_db
def test_user_cannot_view_messages_if_not_member(api_client, authenticated_tokens, user_factory):
    requester, access_token, _ = authenticated_tokens
    sender = user_factory()
    conversation = Conversation.objects.create(name="staff-only", type="channel")

    ConversationMember.objects.create(user=sender, conversation=conversation)
    Message.objects.create(conversation=conversation, sender=sender, content="Top secret")

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    url = f"/api/conversations/{conversation.id}/messages/"

    response = api_client.get(url)

    assert response.status_code == 403
