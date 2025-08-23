#!/usr/bin/env python
"""
Script para testar acesso aos arquivos estáticos JavaScript
"""
import os
import sys

# Adicionar o diretório do projeto ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')

import django
django.setup()

from django.conf import settings
from django.test import Client
from django.contrib.auth.models import User
from django.urls import reverse

def test_static_files_access():
    """Testa se os arquivos JavaScript estão acessíveis"""
    client = Client()
    
    # Lista de arquivos JavaScript críticos para testar
    js_files_to_test = [
        '/static/js/dist/criar-unidade.bundle.js',
        '/static/js/dist/registro-chamada.bundle.js',
        '/static/js/dist/home.bundle.js',
        '/static/js/dist/lista-telefonica.bundle.js',
        '/static/js/dist/unidades-saude.bundle.js',
        '/static/js/services/ReactDebugger.js',
        '/static/js/components/ReactErrorBoundary.js',
        '/static/js/services/SafeComponentLoader.js',
    ]
    
    print("🔍 Testando acesso aos arquivos JavaScript...")
    print("=" * 60)
    
    success_count = 0
    error_count = 0
    
    for js_file in js_files_to_test:
        try:
            response = client.get(js_file)
            status = response.status_code
            
            if status == 200:
                print(f"✅ {js_file} - OK (200)")
                success_count += 1
            elif status == 404:
                print(f"❌ {js_file} - NOT FOUND (404)")
                error_count += 1
            else:
                print(f"⚠️  {js_file} - STATUS {status}")
                error_count += 1
                
        except Exception as e:
            print(f"💥 {js_file} - ERRO: {str(e)}")
            error_count += 1
    
    print("=" * 60)
    print(f"📊 Resumo: {success_count} sucessos, {error_count} erros")
    
    # Testar páginas que usam React
    print("\n🌐 Testando páginas React...")
    print("=" * 60)
    
    # Criar usuário de teste se não existir
    try:
        user = User.objects.get(username='test_user')
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='test_user',
            password='test_password',
            email='test@example.com'
        )
    
    # Login
    client.login(username='test_user', password='test_password')
    
    react_pages = [
        ('home', 'Home React'),
        ('criar_unidade', 'Criar Unidade React'),
        ('registro_chamada', 'Registro Chamada React'),
        ('lista_telefonica', 'Lista Telefônica React'),
        ('unidades_saude', 'Unidades Saúde React'),
    ]
    
    for url_name, page_name in react_pages:
        try:
            url = reverse(url_name)
            response = client.get(url)
            
            if response.status_code == 200:
                # Verificar se a página contém referências aos bundles JavaScript
                content = response.content.decode('utf-8')
                
                # Procurar por referências aos bundles
                bundle_refs = []
                if 'criar-unidade.bundle.js' in content:
                    bundle_refs.append('criar-unidade.bundle.js')
                if 'registro-chamada.bundle.js' in content:
                    bundle_refs.append('registro-chamada.bundle.js')
                if 'home.bundle.js' in content:
                    bundle_refs.append('home.bundle.js')
                if 'lista-telefonica.bundle.js' in content:
                    bundle_refs.append('lista-telefonica.bundle.js')
                if 'unidades-saude.bundle.js' in content:
                    bundle_refs.append('unidades-saude.bundle.js')
                
                if bundle_refs:
                    print(f"✅ {page_name} ({url}) - OK, referencia: {', '.join(bundle_refs)}")
                else:
                    print(f"⚠️  {page_name} ({url}) - OK, mas sem referências JS detectadas")
                    
            else:
                print(f"❌ {page_name} ({url}) - STATUS {response.status_code}")
                
        except Exception as e:
            print(f"💥 {page_name} - ERRO: {str(e)}")
    
    print("=" * 60)
    
    # Verificar configurações Django
    print("\n⚙️  Verificando configurações Django...")
    print("=" * 60)
    print(f"DEBUG: {settings.DEBUG}")
    print(f"STATIC_URL: {settings.STATIC_URL}")
    print(f"STATIC_ROOT: {settings.STATIC_ROOT}")
    print(f"STATICFILES_DIRS: {settings.STATICFILES_DIRS}")
    print(f"STATICFILES_FINDERS: {settings.STATICFILES_FINDERS}")
    
    # Verificar se os diretórios existem
    print(f"\n📁 Verificando diretórios...")
    print("=" * 60)
    
    for static_dir in settings.STATICFILES_DIRS:
        if os.path.exists(static_dir):
            print(f"✅ {static_dir} - EXISTS")
            
            # Verificar subdiretórios importantes
            js_dir = os.path.join(static_dir, 'js', 'dist')
            if os.path.exists(js_dir):
                js_files = os.listdir(js_dir)
                bundle_files = [f for f in js_files if f.endswith('.bundle.js')]
                print(f"   📦 {len(bundle_files)} arquivos bundle encontrados")
            else:
                print(f"   ❌ Diretório js/dist não encontrado")
        else:
            print(f"❌ {static_dir} - NOT EXISTS")
    
    if os.path.exists(settings.STATIC_ROOT):
        print(f"✅ STATIC_ROOT ({settings.STATIC_ROOT}) - EXISTS")
        
        # Contar arquivos copiados
        static_files = []
        for root, dirs, files in os.walk(settings.STATIC_ROOT):
            for file in files:
                if file.endswith('.js'):
                    static_files.append(file)
        
        print(f"   📦 {len(static_files)} arquivos JavaScript encontrados")
    else:
        print(f"❌ STATIC_ROOT ({settings.STATIC_ROOT}) - NOT EXISTS")

if __name__ == '__main__':
    test_static_files_access()