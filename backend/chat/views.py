"""
Views for the chat API.
"""

from rest_framework import permissions, status, generics
from rest_framework.response import Response as DRFResponse
from rest_framework.views import APIView

from .models import Query, Response
from .serializers import (
    ChatRequestSerializer,
    ChatHistorySerializer,
)
from .services import get_ai_response


class ChatView(APIView):
    """
    POST /api/chat/
    Accepts a natural language message, sends it to OpenAI with course context,
    and returns the answer while persisting both Query and Response.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_message = serializer.validated_data['message']

        # 1. Save the student's query
        query = Query.objects.create(
            user=request.user,
            content=user_message,
        )

        # 2. Get AI response (with course context)
        ai_text = get_ai_response(user_message, request.user)

        # 3. Save the response
        response_obj = Response.objects.create(
            query=query,
            response_text=ai_text,
        )

        return DRFResponse({
            'query_id': query.id,
            'message': user_message,
            'response': ai_text,
            'timestamp': query.timestamp,
        }, status=status.HTTP_200_OK)


class ChatHistoryView(generics.ListAPIView):
    """
    GET /api/chat/history/
    Returns the authenticated user's chat history.
    """
    serializer_class = ChatHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Query.objects.filter(
            user=self.request.user
        ).select_related('response').order_by('timestamp')
