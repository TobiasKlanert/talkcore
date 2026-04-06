from django.urls import path

from .views import CreateDMView, ListConversationView, ListMessagesView, SendMessageView

urlpatterns = [
    path("messages/", SendMessageView.as_view(), name="send-message"),
    path("conversations/", ListConversationView.as_view(), name="list-conversations"),
    path(
        "conversations/<uuid:conversation_id>/messages/",
        ListMessagesView.as_view(),
        name="conversation",
    ),
    path("conversations/create-dm/", CreateDMView.as_view(), name="create-dm")
]
