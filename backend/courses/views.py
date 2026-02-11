"""
Views for courses, enrollment, assignments, and feedback.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Course, Enrollment, Assignment, Feedback
from .serializers import (
    CourseSerializer,
    EnrollmentSerializer,
    AssignmentSerializer,
    SyllabusUpdateSerializer,
    FeedbackSerializer,
)


# ─── Permission Helpers ──────────────────────────────────────────

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'


class IsFaculty(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'faculty'


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


# ─── Course Views ────────────────────────────────────────────────

class CourseListView(generics.ListAPIView):
    """List all courses. Available to all authenticated users."""
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            enrolled_ids = Enrollment.objects.filter(
                student=user
            ).values_list('course_id', flat=True)
            return Course.objects.filter(id__in=enrolled_ids)
        elif user.role == 'faculty':
            return Course.objects.filter(faculty=user)
        return Course.objects.all()


class CourseDetailView(generics.RetrieveAPIView):
    """Get a single course by ID."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]


# ─── Enrollment Views ────────────────────────────────────────────

class MyEnrollmentsView(generics.ListAPIView):
    """List the current student's enrollments."""
    serializer_class = EnrollmentSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Enrollment.objects.filter(
            student=self.request.user
        ).select_related('course')


# ─── Faculty Views ───────────────────────────────────────────────

class UpdateSyllabusView(APIView):
    """Allow faculty to update a course syllabus."""
    permission_classes = [IsFaculty]

    def post(self, request):
        serializer = SyllabusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        course = get_object_or_404(
            Course,
            id=serializer.validated_data['course_id'],
            faculty=request.user,
        )
        course.syllabus = serializer.validated_data['syllabus']
        course.save(update_fields=['syllabus', 'updated_at'])

        return Response(
            CourseSerializer(course).data,
            status=status.HTTP_200_OK,
        )


class FacultyAssignmentsView(generics.ListCreateAPIView):
    """Faculty can list & create assignments for their courses."""
    serializer_class = AssignmentSerializer
    permission_classes = [IsFaculty]

    def get_queryset(self):
        return Assignment.objects.filter(
            faculty=self.request.user
        ).select_related('course')

    def perform_create(self, serializer):
        serializer.save(faculty=self.request.user)


# ─── Feedback ────────────────────────────────────────────────────

class FeedbackView(generics.ListCreateAPIView):
    """Submit and list feedback."""
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Feedback.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
