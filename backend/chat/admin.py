from django.contrib import admin
from .models import Query, Response


@admin.register(Query)
class QueryAdmin(admin.ModelAdmin):
    list_display = ['user', 'content_preview', 'timestamp']
    search_fields = ['content']

    def content_preview(self, obj):
        return obj.content[:80]


@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ['query', 'response_preview', 'timestamp']

    def response_preview(self, obj):
        return obj.response_text[:80]
