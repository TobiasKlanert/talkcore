from rest_framework import serializers
from django.contrib.auth import get_user_model

from messaging_app.models import Conversation, Message


class SendMessageSerializer(serializers.Serializer):
    conversation = serializers.PrimaryKeyRelatedField(
        queryset=Conversation.objects.all()
    )
    content = serializers.CharField(max_length=5000)


class CreateDMSerializer(serializers.Serializer):
    user_id = serializers.PrimaryKeyRelatedField(
        source="user",
        queryset=get_user_model().objects.all(),
    )

    def validate_user_id(self, value):
        request = self.context["request"]
        if value == request.user:
            raise serializers.ValidationError("Cannot create DM with yourself")
        return value

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "content", "created_at"]
        read_only_fields = ["id", "sender", "created_at"]
