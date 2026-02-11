"""
Database models for Courses, Enrollment, Assignment, and Feedback.
"""

from django.db import models
from django.conf import settings


class Course(models.Model):
    """Represents a university course."""
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    syllabus = models.TextField(blank=True, default='')
    description = models.TextField(blank=True, default='')
    department = models.CharField(max_length=100, blank=True, default='')
    faculty = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='courses_taught',
        limit_choices_to={'role': 'faculty'},
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        ordering = ['name']

    def __str__(self):
        return f"{self.code} — {self.name}"


class Enrollment(models.Model):
    """Links a Student to a Course."""
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'role': 'student'},
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments',
    )
    enrollment_num = models.CharField(max_length=30, unique=True)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'enrollments'
        unique_together = ['student', 'course']

    def __str__(self):
        return f"{self.student.username} → {self.course.code}"


class Assignment(models.Model):
    """An assignment created by Faculty for a Course."""
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='assignments',
    )
    faculty = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assignments_created',
        limit_choices_to={'role': 'faculty'},
    )
    title = models.CharField(max_length=300)
    content = models.TextField()
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assignments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.course.code})"


class Feedback(models.Model):
    """User feedback on the bot's performance."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedbacks',
    )
    comment = models.TextField()
    rating = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        default=5,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'feedback'
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback by {self.user.username} ({self.rating}★)"
