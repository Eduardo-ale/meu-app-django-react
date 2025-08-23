#!/usr/bin/env python3
"""
Script para diagnosticar problemas de carregamento JavaScript em produção
"""

import os
import sys
import django
from pathlib import Path
import requests
from urllib.parse import urljoin

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from django.conf import settings
from django.contrib.staticfiles import finders
from django.contrib.staticfiles.storage import staticfiles_storage
from django.template.loader import render_to_string
from django.test import RequestFactory
from django.contrib.auth.models import User
from accounts.views import criar_unidade

def test_static_files_configuration():
    """Testa a configuração de arquivos estáticos"""
    print("🔧 Testando configuração de arquivos estáticos...")
    
    print(f"STATIC_URL: {settings.STATIC_URL}")
    print(f"STATIC_ROOT: {settings.STATIC_ROOT}")
    print(f"STATICFILES_DIRS: {settings.STATICFILES_DIRS}")
    print(f"DEBUG: {settings.DEBUG}")
    print(f"STATICFILES_STORAGE: {settings.STATICFILES_STORAGE}")
    
    if hasattr(settings, 'WHITENOISE_USE_FINDERS'):
        print(f"WHITENOISE_USE_FINDERS: {settings.WHITENOISE_USE_FINDERS}")
    
    print()

def test_bundle_files():
    """Testa se os bundles JavaScript existem"""
    print("📦 Testando existência dos bundles JavaScript...")
    
    bundles = [
        'js/dist/react-services.bundle.js',
        'js/dist/criar-unidade.bundle.js',
        'js/dist/registro-chamada.bundle.js',
        'js/services/ReactDebugger.js',
        'js/components/ReactErrorBoundary.js',
        'js/services/SafeComponentLoader.js',
        'js/services/ReactErrorHandling.js',
        'js/services/ReactInitializer.js'
    ]
    
    for bundle in bundles:
        # Testar usando finders
        found_path = finders.find(bundle)
        if found_path:
            size = os.path.getsize(found_path)
            print(f"✅ {bundle} encontrado: {found_path} ({size:,} bytes)")
        else:
            print(f"❌ {bundle} NÃO encontrado")
    
    print()

def test_static_urls():
    """Testa as URLs estáticas geradas"""
    print("🌐 Testando URLs estáticas...")
    
    bundles = [
        'js/dist/react-services.bundle.js',
        'js/dist/criar-unidade.bundle.js',
        'js/services/ReactDebugger.js',
        'js/components/ReactErrorBoundary.js'
    ]
    
    for bundle in bundles:
        try:
            url = staticfiles_storage.url(bundle)
            print(f"✅ URL para {bundle}: {url}")
        except Exception as e:
            print(f"❌ Erro ao gerar URL para {bundle}: {e}")
    
    print()

def test_http_access():
    """Testa o acesso HTTP aos arquivos"""
    print("🌐 Testando acesso HTTP aos bundles...")
    
    base_url = "http://127.0.0.1:8000"
    bundles = [
        '/static/js/dist/react-services.bundle.js',
        '/static/js/dist/criar-unidade.bundle.js',
        '/static/js/services/ReactDebugger.js',
        '/static/js/components/ReactErrorBoundary.js'
    ]
    
    for bundle_path in bundles:
        try:
            url = urljoin(base_url, bundle_path)
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                size = len(response.content)
                print(f"✅ {bundle_path} - OK (Status: {response.status_code}, Tamanho: {size:,} bytes)")
                print(f"   Content-Type: {content_type}")
                
                # Verificar se é JavaScript válido
                if 'javascript' in content_type.lower() or bundle_path.endswith('.js'):
                    content = response.text[:100]
                    if content.strip():
                        print(f"   ✅ Conteúdo JavaScript válido")
                    else:
                        print(f"   ⚠️ Arquivo vazio")
                else:
                    print(f"   ⚠️ Content-Type não é JavaScript")
            else:
                print(f"❌ {bundle_path} - Status: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Erro ao acessar {bundle_path}: {e}")
    
    print()

def test_template_rendering():
    """Testa a renderização do template"""
    print("📄 Testando renderização do template...")
    
    try:
        # Criar um request factory
        factory = RequestFactory()
        request = factory.get('/accounts/unidades-saude/criar/')
        
        # Criar um usuário de teste
        user = User.objects.first()
        if not user:
            user = User.objects.create_user('testuser', 'test@test.com', 'testpass')
        
        request.user = user
        
        # Chamar a view
        response = criar_unidade(request)
        
        if response.status_code == 200:
            print("✅ Template renderizado com sucesso")
            
            # Verificar se contém as referências aos scripts
            content = response.content.decode('utf-8')
            
            scripts_to_check = [
                'js/dist/react-services.bundle.js',
                'js/dist/criar-unidade.bundle.js',
                'js/services/ReactDebugger.js',
                'ReactInitializer'
            ]
            
            for script in scripts_to_check:
                if script in content:
                    print(f"   ✅ Referência encontrada: {script}")
                else:
                    print(f"   ❌ Referência NÃO encontrada: {script}")
        else:
            print(f"❌ Erro na renderização: Status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro ao testar template: {e}")
    
    print()

def test_page_access():
    """Testa o acesso à página completa"""
    print("🌐 Testando acesso à página completa...")
    
    try:
        url = "http://127.0.0.1:8000/accounts/unidades-saude/criar/"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            print(f"✅ Página acessível (Status: {response.status_code})")
            
            # Verificar se contém os scripts necessários
            content = response.text
            
            scripts_to_check = [
                'react.development.js',
                'react-dom.development.js',
                'js/dist/react-services.bundle.js',
                'js/dist/criar-unidade.bundle.js',
                'ReactInitializer.initComponent'
            ]
            
            for script in scripts_to_check:
                if script in content:
                    print(f"   ✅ Script encontrado: {script}")
                else:
                    print(f"   ❌ Script NÃO encontrado: {script}")
                    
            # Verificar erros JavaScript no HTML
            if 'console.error' in content or 'console.warn' in content:
                print("   ⚠️ Possíveis logs de erro/aviso encontrados no HTML")
                
        else:
            print(f"❌ Página não acessível (Status: {response.status_code})")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao acessar página: {e}")
    
    print()

def main():
    """Função principal"""
    print("🔍 DIAGNÓSTICO DE CARREGAMENTO JAVASCRIPT EM PRODUÇÃO")
    print("=" * 60)
    print()
    
    test_static_files_configuration()
    test_bundle_files()
    test_static_urls()
    test_http_access()
    test_template_rendering()
    test_page_access()
    
    print("🏁 Diagnóstico concluído!")

if __name__ == "__main__":
    main()