"""
Custom User model with role-based access for UNIBOT.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user model with role support."""

    class Role(models.TextChoices):
        STUDENT = 'student', 'Student'
        FACULTY = 'faculty', 'Faculty'
        ADMIN = 'admin', 'Administrator'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
    )
    phone = models.CharField(max_length=15, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    avatar_url = models.URLField(blank=True, null=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_faculty(self):
        return self.role == self.Role.FACULTY

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN
