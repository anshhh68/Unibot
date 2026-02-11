"""
Models for the Chat/AI system — Query & Response.
"""

from django.db import models
from django.conf import settings


class Query(models.Model):
    """A student's natural language question to the chatbot."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='queries',
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'queries'
        ordering = ['-timestamp']
        verbose_name_plural = 'queries'

    def __str__(self):
        return f"Q: {self.content[:60]}..."


class Response(models.Model):
    """The AI-generated response to a Query."""
    query = models.OneToOneField(
        Query,
        on_delete=models.CASCADE,
        related_name='response',
    )
    response_text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'responses'
        ordering = ['-timestamp']

    def __str__(self):
        return f"A: {self.response_text[:60]}..."
