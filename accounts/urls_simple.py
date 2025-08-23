from django.urls import path
from . import views_simple

urlpatterns = [
    path('home-simple/', views_simple.home_react_super_simple, name='home_react_super_simple'),
]