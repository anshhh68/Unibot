"""
Serializers for the chat app.
"""

from rest_framework import serializers
from .models import Query, Response


class ChatRequestSerializer(serializers.Serializer):
    """Incoming chat message from a student."""
    message = serializers.CharField(max_length=2000)


class ResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Response
        fields = ['id', 'response_text', 'timestamp']


class QuerySerializer(serializers.ModelSerializer):
    response = ResponseSerializer(read_only=True)

    class Meta:
        model = Query
        fields = ['id', 'content', 'response', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class ChatHistorySerializer(serializers.ModelSerializer):
    """Full chat history item with both query and response."""
    response = ResponseSerializer(read_only=True)

    class Meta:
        model = Query
        fields = ['id', 'content', 'response', 'timestamp']
