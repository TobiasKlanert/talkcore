from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from messaging_app.models import Conversation, ConversationMember, Message
from messaging_app.services.conversation_service import get_or_create_dm
from messaging_app.services.message_service import send_message

from .serializers import MessageSerializer


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        conversation_id = request.data.get("conversation")
        content = request.data.get("content")
        conversation = get_object_or_404(Conversation, id=conversation_id)

        is_member = ConversationMember.objects.filter(
            conversation=conversation,
            user=request.user,
        ).exists()
        if not is_member:
            raise PermissionDenied("You are not a member of this conversation.")

        message = send_message(
            conversation=conversation,
            sender=request.user,
            content=content,
        )

        return Response(
            {
                "id": message.id,
                "content": message.content,
                "created_at": message.created_at,
            },
            status=status.HTTP_201_CREATED,
        )


class ListMessagesView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        conversation = get_object_or_404(Conversation, id=self.kwargs["conversation_id"])

        is_member = ConversationMember.objects.filter(
            conversation=conversation,
            user=self.request.user,
        ).exists()
        if not is_member:
            raise PermissionDenied("You are not a member of this conversation.")

        return Message.objects.filter(conversation=conversation).select_related(
            "sender"
        )


class CreateDMView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        other_user_id = request.data.get("user_id")

        conversation = get_or_create_dm(user1=request.user, user2_id=other_user_id)

        return Response({"conversation": conversation.id})
