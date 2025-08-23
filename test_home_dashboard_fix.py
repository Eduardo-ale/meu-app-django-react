#!/usr/bin/env python3
"""
Script para testar a correção do dashboard home
"""

import os
import sys
import django
from django.conf import settings
from django.test import Client
from django.contrib.auth.models import User

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

def test_home_dashboard():
    """Testa o carregamento do dashboard home"""
    print("🧪 Testando dashboard home...")
    
    client = Client()
    
    # Criar usuário de teste se não existir
    try:
        user = User.objects.get(username='admin')
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='admin',
            password='admin123',
            first_name='Administrador'
        )
        print("👤 Usuário de teste criado")
    
    # Fazer login
    login_success = client.login(username='admin', password='admin123')
    if not login_success:
        print("❌ Falha no login")
        return False
    
    print("✅ Login realizado com sucesso")
    
    # Testar página home original
    print("\n📄 Testando página home original...")
    response = client.get('/')
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        content = response.content.decode('utf-8')
        
        # Verificar se contém elementos essenciais
        checks = [
            ('home-react-root', 'Container React'),
            ('HomeReact', 'Componente HomeReact'),
            ('react.development.js', 'React CDN'),
            ('react-dom.development.js', 'ReactDOM CDN'),
        ]
        
        for check, description in checks:
            if check in content:
                print(f"✅ {description} encontrado")
            else:
                print(f"❌ {description} não encontrado")
    
    # Testar arquivos estáticos essenciais
    print("\n📦 Testando arquivos estáticos...")
    static_files = [
        '/static/js/components/HomeReact.js',
        '/static/debug_home_dashboard.js',
    ]
    
    for static_file in static_files:
        response = client.get(static_file)
        if response.status_code == 200:
            print(f"✅ {static_file} acessível")
        else:
            print(f"❌ {static_file} não acessível (Status: {response.status_code})")
    
    print("\n🔍 Teste concluído!")
    return True

def check_static_files():
    """Verifica se os arquivos estáticos existem no filesystem"""
    print("\n📁 Verificando arquivos no filesystem...")
    
    files_to_check = [
        'static/js/components/HomeReact.js',
        'debug_home_dashboard.js',
        'templates/home_react_fixed.html',
        'static/js/services/ReactDebugger.js',
    ]
    
    for file_path in files_to_check:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"✅ {file_path} existe ({size} bytes)")
        else:
            print(f"❌ {file_path} não existe")

if __name__ == '__main__':
    print("🚀 Iniciando testes do dashboard home...")
    
    check_static_files()
    test_home_dashboard()
    
    print("\n💡 Próximos passos:")
    print("1. Acesse http://127.0.0.1:8000/ no navegador")
    print("2. Abra o DevTools (F12) e verifique o console")
    print("3. Se houver erros, use o template home_react_fixed.html")
    print("4. Execute: python manage.py collectstatic --noinput")