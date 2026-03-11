from django.shortcuts import render

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from messaging_app.models import Message
from .serializers import MessageSerializer

class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


class ListMessagesView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs["conversation_id"]

        return Message.objects.filter(
            conversation_id=conversation_id
        ).select_related("sender")