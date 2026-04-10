import pytest

from messaging_app.models import Conversation, ConversationMember


@pytest.mark.django_db
def test_new_user_is_automatically_added_to_general_conversation(user_factory):
    user = user_factory()
    general_conversation = Conversation.objects.get(type="channel", name="general")

    assert ConversationMember.objects.filter(
        user=user,
        conversation=general_conversation,
    ).exists()
