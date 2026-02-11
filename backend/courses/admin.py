from django.contrib import admin
from .models import Course, Enrollment, Assignment, Feedback


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'faculty', 'department', 'updated_at']
    list_filter = ['department']
    search_fields = ['name', 'code']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['enrollment_num', 'student', 'course', 'enrolled_at']
    search_fields = ['enrollment_num']


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'faculty', 'due_date', 'created_at']
    list_filter = ['course']


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['user', 'rating', 'created_at']
    list_filter = ['rating']
