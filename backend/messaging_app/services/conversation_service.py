from django.db import transaction
from messaging_app.models import Conversation, ConversationMember


@transaction.atomic
def get_or_create_dm(user1, user2):

    if user1 == user2:
        raise ValueError("Cannot create DM with yourself")

    existing = (
        Conversation.objects.filter(type="dm", members__user=user1)
        .filter(members__user=user2)
        .distinct()
        .first()
    )

    if existing:
        return existing, False

    conversation = Conversation.objects.create(type="dm")

    ConversationMember.objects.create(conversation=conversation, user=user1)
    ConversationMember.objects.create(conversation=conversation, user=user2)

    return conversation, True
