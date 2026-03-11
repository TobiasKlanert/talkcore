from messaging_app.models import Conversation


def ensure_general_channel():
    channel, _ = Conversation.objects.get_or_create(
        name="general",
        defaults={
            "type": "channel",
            "is_private": False,
        },
    )
    return channel