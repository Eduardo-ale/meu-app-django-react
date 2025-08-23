from django.urls import path
from . import views

urlpatterns = [
    # API endpoints
    path('api/municipios/', views.api_municipios, name='api_municipios'),
    path('api/municipios/<int:municipio_id>/', views.api_municipio_por_id, name='api_municipio_por_id'),
    path('api/municipios/autocomplete/', views.api_municipios_autocomplete, name='api_municipios_autocomplete'),
] 