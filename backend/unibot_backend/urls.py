"""
Root URL configuration for UNIBOT backend.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        'name': 'UNIBOT API',
        'version': '1.0.0',
        'description': 'Smart university chatbot API',
        'endpoints': {
            'auth': '/api/auth/',
            'courses': '/api/courses/',
            'chat': '/api/chat/',
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/auth/', include('accounts.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/chat/', include('chat.urls')),
]
