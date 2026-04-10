from django.conf import settings
from django.db.models.signals import post_migrate, post_save
from django.dispatch import receiver

from messaging_app.models import Conversation, ConversationMember
from messaging_app.services.general_channel_service import ensure_general_channel


@receiver(post_migrate)
def create_general_channel(sender, **kwargs):
    ensure_general_channel()


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def add_user_to_general(sender, instance, created, **kwargs):
    if not created:
        return

    general = ensure_general_channel()

    ConversationMember.objects.get_or_create(
        conversation=general,
        user=instance,
    )
