from django.urls import path
from . import views

urlpatterns = [
    path('', views.ChatView.as_view(), name='chat'),
    path('history/', views.ChatHistoryView.as_view(), name='chat-history'),
]
