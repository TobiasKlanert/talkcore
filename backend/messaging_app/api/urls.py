from django.urls import path
from .views import ListMessagesView, SendMessageView

urlpatterns = [
    path("messages/", SendMessageView.as_view(), name="send-message"),
    path(
        "conversations/<uuid:conversation_id>/messages/",
        ListMessagesView.as_view(),
        name="conversation",
    ),
]
