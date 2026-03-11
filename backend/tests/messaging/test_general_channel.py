import pytest

from messaging_app.models import Conversation


@pytest.mark.django_db
def test_general_conversation_exists():
    conversation = Conversation.objects.filter(type="channel", name="general").first()

    assert conversation is not None
