"""
Serializers for courses app.
"""

from rest_framework import serializers
from .models import Course, Enrollment, Assignment, Feedback


class CourseSerializer(serializers.ModelSerializer):
    faculty_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'syllabus', 'description',
                  'department', 'faculty', 'faculty_name',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_faculty_name(self, obj):
        if obj.faculty:
            return obj.faculty.get_full_name() or obj.faculty.username
        return None


class EnrollmentSerializer(serializers.ModelSerializer):
    course_detail = CourseSerializer(source='course', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'course_detail',
                  'enrollment_num', 'enrolled_at']
        read_only_fields = ['id', 'enrolled_at']


class AssignmentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = Assignment
        fields = ['id', 'course', 'course_name', 'faculty', 'title',
                  'content', 'due_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SyllabusUpdateSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    syllabus = serializers.CharField()


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'user', 'comment', 'rating', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
