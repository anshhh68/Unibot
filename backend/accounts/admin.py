from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'department', 'is_active']
    list_filter = ['role', 'is_active', 'department']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('UNIBOT Fields', {
            'fields': ('role', 'phone', 'department', 'avatar_url'),
        }),
    )
