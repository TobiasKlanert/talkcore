from django.shortcuts import get_object_or_404
from messaging_app.api.permissions import IsConversationMember
from messaging_app.models import Conversation, ConversationMember, Message
from messaging_app.services.conversation_service import get_or_create_dm
from messaging_app.services.message_service import send_message
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CreateDMSerializer, MessageSerializer, SendMessageSerializer


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated, IsConversationMember]

    def post(self, request):
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        conversation = serializer.validated_data["conversation"]
        content = serializer.validated_data["content"]

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
    permission_classes = [IsAuthenticated, IsConversationMember]

    def get_queryset(self):
        conversation = get_object_or_404(
            Conversation, id=self.kwargs["conversation_id"]
        )

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
        serializer = CreateDMSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        conversation, created = get_or_create_dm(
            user1=request.user,
            user2=serializer.validated_data["user"],
        )

        return Response(
            {"conversation": str(conversation.id)},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
