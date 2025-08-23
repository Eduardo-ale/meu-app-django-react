#!/usr/bin/env python3
"""
View simples para testar a página home
"""

from django.shortcuts import render
from django.http import HttpResponse

def test_home_simple_view(request):
    """View simples para teste"""
    with open('templates/test_home_simple.html', 'r', encoding='utf-8') as f:
        content = f.read()
    return HttpResponse(content)

# Para testar diretamente
if __name__ == '__main__':
    import os
    import django
    from django.conf import settings
    from django.urls import path
    from django.core.wsgi import get_wsgi_application
    
    # Configuração mínima do Django
    if not settings.configured:
        settings.configure(
            DEBUG=True,
            SECRET_KEY='test-key',
            ROOT_URLCONF=__name__,
            ALLOWED_HOSTS=['*'],
        )
    
    django.setup()
    
    urlpatterns = [
        path('test-home/', test_home_simple_view, name='test_home'),
    ]
    
    print("🚀 Servidor de teste iniciado!")
    print("📍 Acesse: http://127.0.0.1:8000/test-home/")
    
    from django.core.management import execute_from_command_line
    execute_from_command_line(['manage.py', 'runserver', '8001'])