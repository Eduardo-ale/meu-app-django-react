#!/usr/bin/env python3
"""
Teste para verificar se os componentes React estão sendo inicializados corretamente
"""

import os
import sys

# Adicionar o diretório atual ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')

import django
django.setup()

from django.test import Client
from django.contrib.auth.models import User

def test_react_page_loading():
    """Testa se a página React está carregando corretamente"""
    print("🧪 Testando carregamento da página React...")
    
    client = Client()
    
    # Criar usuário de teste se não existir
    try:
        user = User.objects.get(username='test_user')
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='test_user',
            password='test_password',
            email='test@example.com'
        )
    
    # Fazer login
    client.login(username='test_user', password='test_password')
    
    # Acessar página de criar unidade
    try:
        response = client.get('/accounts/unidades-saude/criar/')
        
        print(f"📊 Status da resposta: {response.status_code}")
        
        if response.status_code == 200:
            content = response.content.decode('utf-8')
            
            # Verificar se os scripts estão sendo incluídos
            checks = [
                ('React CDN', 'react@18/umd/react.development.js' in content),
                ('ReactDOM CDN', 'react-dom@18/umd/react-dom.development.js' in content),
                ('Bundle do componente', 'criar-unidade.bundle.js' in content),
                ('Container do componente', 'criar-unidade-react-root' in content),
                ('Fallback HTML', 'fallback-container' in content),
                ('Scripts de inicialização', 'initializeComponent' in content)
            ]
            
            print("\n📋 Verificações da página:")
            for check_name, result in checks:
                status = "✅" if result else "❌"
                print(f"  {status} {check_name}")
            
            # Verificar se há erros óbvios
            if 'error' in content.lower() or 'erro' in content.lower():
                print("⚠️ Possíveis erros encontrados na página")
            
            print(f"\n📏 Tamanho da resposta: {len(content)} caracteres")
            
        else:
            print(f"❌ Erro ao acessar página: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")

def test_static_files():
    """Testa se os arquivos estáticos estão acessíveis"""
    print("\n🗂️ Testando arquivos estáticos...")
    
    client = Client()
    
    static_files = [
        '/static/js/dist/criar-unidade.bundle.js',
        '/static/js/services/ReactInitializer.js',
        '/static/js/services/SafeComponentLoader.js',
        '/static/js/services/ReactDebugger.js'
    ]
    
    for file_path in static_files:
        try:
            response = client.get(file_path)
            status = "✅" if response.status_code == 200 else "❌"
            print(f"  {status} {file_path} ({response.status_code})")
        except Exception as e:
            print(f"  ❌ {file_path} (Erro: {e})")

if __name__ == '__main__':
    print("🚀 Iniciando testes de componentes React...")
    test_react_page_loading()
    test_static_files()
    print("\n🏁 Testes concluídos!")