from django.urls import path
from .views import ListMessagesView, SendMessageView, CreateDMView

urlpatterns = [
    path("messages/", SendMessageView.as_view(), name="send-message"),
    path(
        "conversations/<uuid:conversation_id>/messages/",
        ListMessagesView.as_view(),
        name="conversation",
    ),
    path("conversations/create-dm/", CreateDMView.as_view(), name="create-dm")
]
