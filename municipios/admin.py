from django.contrib import admin
from .models import Municipio

@admin.register(Municipio)
class MunicipioAdmin(admin.ModelAdmin):
    list_display = ('nome', 'estado', 'created_at')
    list_filter = ('estado', 'created_at')
    search_fields = ('nome',)
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('nome',) 