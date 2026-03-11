from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import (SendMessageView, ListMessagesView)

urlpatterns = [
    path("messages/", SendMessageView.as_view(), name="send-message"),
    path("conversations/<int:conversation_id>/messages/", ListMessagesView.as_view(), name="conversation")
]