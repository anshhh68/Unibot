from django.urls import path
from . import views

urlpatterns = [
    path('', views.CourseListView.as_view(), name='course-list'),
    path('<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('enrollments/', views.MyEnrollmentsView.as_view(), name='enrollments'),
    path('faculty/update-syllabus/', views.UpdateSyllabusView.as_view(), name='update-syllabus'),
    path('faculty/assignments/', views.FacultyAssignmentsView.as_view(), name='faculty-assignments'),
    path('feedback/', views.FeedbackView.as_view(), name='feedback'),
]
