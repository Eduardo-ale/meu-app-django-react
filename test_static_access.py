#!/usr/bin/env python3
"""
Script para testar acesso aos arquivos estáticos
"""
import os
import sys
import django
from pathlib import Path

# Configurar Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from django.conf import settings
from django.contrib.staticfiles import finders
from django.contrib.staticfiles.storage import staticfiles_storage

def test_static_files():
    print("🔍 Testando configuração de arquivos estáticos...")
    print(f"STATIC_URL: {settings.STATIC_URL}")
    print(f"STATIC_ROOT: {settings.STATIC_ROOT}")
    print(f"STATICFILES_DIRS: {settings.STATICFILES_DIRS}")
    print()
    
    # Testar bundles específicos
    bundles_to_test = [
        'js/dist/react-services.bundle.js',
        'js/dist/criar-unidade.bundle.js',
        'js/dist/registro-chamada.bundle.js',
        'js/dist/home.bundle.js'
    ]
    
    print("📦 Testando bundles JavaScript...")
    for bundle in bundles_to_test:
        # Testar com finder
        found_path = finders.find(bundle)
        if found_path:
            print(f"✅ {bundle} encontrado em: {found_path}")
            
            # Verificar se arquivo existe
            if os.path.exists(found_path):
                size = os.path.getsize(found_path)
                print(f"   Tamanho: {size:,} bytes")
            else:
                print(f"   ❌ Arquivo não existe no caminho encontrado!")
        else:
            print(f"❌ {bundle} NÃO encontrado pelo finder")
            
            # Tentar encontrar manualmente
            for static_dir in settings.STATICFILES_DIRS:
                manual_path = static_dir / bundle
                if manual_path.exists():
                    print(f"   ⚠️ Encontrado manualmente em: {manual_path}")
                    break
    
    print()
    print("🌐 Testando URLs estáticas...")
    for bundle in bundles_to_test:
        try:
            url = staticfiles_storage.url(bundle)
            print(f"✅ URL para {bundle}: {url}")
        except Exception as e:
            print(f"❌ Erro ao gerar URL para {bundle}: {e}")

if __name__ == "__main__":
    test_static_files()