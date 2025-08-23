#!/usr/bin/env python3
"""
Script para testar acesso direto aos bundles JavaScript em produção
"""

import os
import sys
import django
from django.conf import settings
from django.test import Client
from django.urls import reverse
import requests
from pathlib import Path

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

def test_static_file_access():
    """Testa acesso direto aos arquivos estáticos"""
    print("🔍 Testando acesso direto aos bundles JavaScript...")
    
    client = Client()
    
    # Lista de bundles para testar
    bundles_to_test = [
        'js/dist/criar-unidade.bundle.js',
        'js/dist/registro-chamada.bundle.js',
        'js/dist/lista-telefonica.bundle.js',
        'js/dist/home.bundle.js',
        'js/dist/unidades-saude.bundle.js',
        'js/components/CriarUnidadeReact.js',
        'js/components/RegistroChamadaReact.js',
        'js/services/ReactDebugger.js',
        'js/services/ReactErrorHandling.js'
    ]
    
    results = []
    
    for bundle_path in bundles_to_test:
        # Construir URL estática
        static_url = f"/static/{bundle_path}"
        
        try:
            # Testar acesso via Django test client
            response = client.get(static_url)
            
            # Verificar se arquivo existe fisicamente
            full_path = settings.STATIC_ROOT / bundle_path
            file_exists = full_path.exists() if settings.STATIC_ROOT else False
            
            # Verificar no diretório de desenvolvimento
            dev_path = settings.STATICFILES_DIRS[0] / bundle_path if settings.STATICFILES_DIRS else None
            dev_file_exists = dev_path.exists() if dev_path else False
            
            # Lidar com WhiteNoise streaming content
            content_size = 0
            if response.status_code == 200:
                try:
                    content_size = len(response.content)
                except AttributeError:
                    # WhiteNoise usa streaming_content
                    if hasattr(response, 'streaming_content'):
                        content_size = sum(len(chunk) for chunk in response.streaming_content)
                    elif file_exists:
                        content_size = full_path.stat().st_size
                    elif dev_file_exists:
                        content_size = dev_path.stat().st_size
            
            result = {
                'path': bundle_path,
                'url': static_url,
                'status_code': response.status_code,
                'content_type': response.get('Content-Type', 'N/A'),
                'file_exists_static': file_exists,
                'file_exists_dev': dev_file_exists,
                'file_size': content_size
            }
            
            results.append(result)
            
            # Log do resultado
            status_icon = "✅" if response.status_code == 200 else "❌"
            print(f"{status_icon} {bundle_path}")
            print(f"   Status: {response.status_code}")
            print(f"   Content-Type: {response.get('Content-Type', 'N/A')}")
            print(f"   Tamanho: {content_size} bytes")
            print(f"   Arquivo existe (static): {file_exists}")
            print(f"   Arquivo existe (dev): {dev_file_exists}")
            print()
            
        except Exception as e:
            print(f"❌ Erro ao testar {bundle_path}: {str(e)}")
            results.append({
                'path': bundle_path,
                'url': static_url,
                'error': str(e)
            })
    
    return results

def test_static_configuration():
    """Testa configuração de arquivos estáticos"""
    print("⚙️ Verificando configuração de arquivos estáticos...")
    
    print(f"STATIC_URL: {settings.STATIC_URL}")
    print(f"STATIC_ROOT: {settings.STATIC_ROOT}")
    print(f"STATICFILES_DIRS: {settings.STATICFILES_DIRS}")
    print(f"DEBUG: {settings.DEBUG}")
    
    if hasattr(settings, 'STATICFILES_STORAGE'):
        print(f"STATICFILES_STORAGE: {settings.STATICFILES_STORAGE}")
    
    if hasattr(settings, 'WHITENOISE_USE_FINDERS'):
        print(f"WHITENOISE_USE_FINDERS: {settings.WHITENOISE_USE_FINDERS}")
    
    print()

def check_file_permissions():
    """Verifica permissões dos arquivos estáticos"""
    print("🔐 Verificando permissões dos arquivos...")
    
    if settings.STATIC_ROOT and settings.STATIC_ROOT.exists():
        js_dir = settings.STATIC_ROOT / 'js'
        if js_dir.exists():
            print(f"✅ Diretório {js_dir} existe")
            
            # Verificar alguns arquivos importantes
            important_files = [
                'js/dist/criar-unidade.bundle.js',
                'js/components/CriarUnidadeReact.js'
            ]
            
            for file_path in important_files:
                full_path = settings.STATIC_ROOT / file_path
                if full_path.exists():
                    stat = full_path.stat()
                    print(f"✅ {file_path} - Tamanho: {stat.st_size} bytes")
                else:
                    print(f"❌ {file_path} não encontrado")
        else:
            print(f"❌ Diretório {js_dir} não existe")
    else:
        print("❌ STATIC_ROOT não existe ou não está configurado")
    
    print()

def main():
    """Função principal"""
    print("🚀 Iniciando teste de configuração de arquivos estáticos em produção")
    print("=" * 70)
    
    # Testar configuração
    test_static_configuration()
    
    # Verificar permissões
    check_file_permissions()
    
    # Testar acesso aos arquivos
    results = test_static_file_access()
    
    # Resumo
    print("📊 RESUMO DOS TESTES")
    print("=" * 30)
    
    successful = sum(1 for r in results if r.get('status_code') == 200)
    total = len(results)
    
    print(f"✅ Arquivos acessíveis: {successful}/{total}")
    print(f"❌ Arquivos com problema: {total - successful}/{total}")
    
    if successful < total:
        print("\n🔧 ARQUIVOS COM PROBLEMAS:")
        for result in results:
            if result.get('status_code') != 200:
                print(f"   - {result['path']}: Status {result.get('status_code', 'Erro')}")
    
    print("\n✅ Teste de configuração de arquivos estáticos concluído!")

if __name__ == "__main__":
    main()