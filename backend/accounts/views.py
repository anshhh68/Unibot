"""
Views for user authentication and profile management.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework_simplejwt.tokens import RefreshToken
import os
import uuid

from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Register a new user."""
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class ProfileView(APIView):
    """Get or update current user's profile."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class GoogleLoginView(APIView):
    """Authenticate via Google ID token."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('credential')
        if not token:
            return Response({'error': 'No auth token provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client_id = os.environ.get('NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'placeholder-google-client-id')
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)

            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')

            users = User.objects.filter(email=email)
            if users.exists():
                user = users.first()
            else:
                user = User.objects.create(
                    email=email,
                    username=email.split('@')[0] + str(uuid.uuid4())[:4],
                    first_name=first_name,
                    last_name=last_name,
                    role='student',
                )
                user.set_unusable_password()
                user.save()

            refresh = RefreshToken.for_user(user)

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })

        except ValueError as e:
            return Response({'error': f'Invalid token: {e}'}, status=status.HTTP_400_BAD_REQUEST)
