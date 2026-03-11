from rest_framework import serializers
from messaging_app.models import Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "content", "created_at"]
        read_only_fields = ["id", "sender", "created_at"]