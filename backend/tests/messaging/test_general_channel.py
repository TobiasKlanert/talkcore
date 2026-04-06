import pytest

from messaging_app.models import Conversation, ConversationMember
from messaging_app.services.general_channel_service import ensure_general_channel


@pytest.mark.django_db
def test_general_conversation_exists():
    conversation = Conversation.objects.filter(type="channel", name="general").first()

    assert conversation is not None


@pytest.mark.django_db
def test_ensure_general_channel_creates_channel_reliably():
    Conversation.objects.filter(name="general").delete()

    conversation = ensure_general_channel()

    assert conversation.type == "channel"
    assert conversation.name == "general"
    assert conversation.is_private is False
    assert Conversation.objects.filter(name="general", type="channel").count() == 1


@pytest.mark.django_db
def test_ensure_general_channel_does_not_create_duplicate_channel():
    first = ensure_general_channel()
    second = ensure_general_channel()

    assert first.id == second.id
    assert Conversation.objects.filter(name="general", type="channel").count() == 1


@pytest.mark.django_db
def test_existing_users_can_be_added_to_general_channel_cleanly(user_factory):
    user_one = user_factory(email="existing1@example.com")
    user_two = user_factory(email="existing2@example.com")
    general = Conversation.objects.get(type="channel", name="general")

    ConversationMember.objects.filter(
        conversation=general,
        user__in=[user_one, user_two],
    ).delete()

    ConversationMember.objects.get_or_create(conversation=general, user=user_one)
    ConversationMember.objects.get_or_create(conversation=general, user=user_one)
    ConversationMember.objects.get_or_create(conversation=general, user=user_two)

    assert ConversationMember.objects.filter(
        conversation=general,
        user=user_one,
    ).count() == 1
    assert ConversationMember.objects.filter(
        conversation=general,
        user=user_two,
    ).count() == 1
