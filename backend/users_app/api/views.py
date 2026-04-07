from django.contrib.auth import get_user_model
from django.shortcuts import render
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users_app.models import User

from .serializers import UserSerializer

User = get_user_model()


class UserSearchView(ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.all()

        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(display_name__icontains=search)

        return queryset.exclude(id=self.request.user.id)
