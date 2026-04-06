from rest_framework import permissions
from messaging_app.models import ConversationMember


class IsConversationMember(permissions.BasePermission):
    message = "You are not a member of this conversation."
    
    def has_permission(self, request, view):
        conversation_id = (
            view.kwargs.get("conversation_id")
            or request.data.get("conversation")
        )

        if not conversation_id:
            return False

        return ConversationMember.objects.filter(
            conversation_id=conversation_id,
            user=request.user
        ).exists()