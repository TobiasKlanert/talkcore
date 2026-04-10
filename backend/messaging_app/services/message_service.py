from messaging_app.models import Message

def send_message(conversation, sender, content):
    return Message.objects.create(
        conversation=conversation,
        sender=sender,
        content=content,
    )