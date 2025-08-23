#!/usr/bin/env python3
"""
Script para testar acesso HTTP aos arquivos estáticos
"""
import requests
import sys
from urllib.parse import urljoin

def test_http_access():
    base_url = "http://127.0.0.1:8000"
    
    # Testar se servidor está rodando
    try:
        response = requests.get(base_url, timeout=5)
        print(f"✅ Servidor Django está rodando (Status: {response.status_code})")
    except requests.exceptions.RequestException as e:
        print(f"❌ Servidor Django não está acessível: {e}")
        print("   Execute: python manage.py runserver")
        return False
    
    # Testar arquivos estáticos
    static_files = [
        "/static/js/dist/react-services.bundle.js",
        "/static/js/dist/criar-unidade.bundle.js", 
        "/static/js/dist/registro-chamada.bundle.js",
        "/static/js/dist/home.bundle.js"
    ]
    
    print("\n📦 Testando acesso HTTP aos bundles...")
    for file_path in static_files:
        url = urljoin(base_url, file_path)
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                print(f"✅ {file_path} - OK (Tamanho: {len(response.content):,} bytes)")
                
                # Verificar se é JavaScript válido
                content = response.text
                if 'function' in content or 'var ' in content or 'const ' in content:
                    print(f"   ✅ Conteúdo JavaScript válido")
                else:
                    print(f"   ⚠️ Conteúdo pode não ser JavaScript válido")
                    
            else:
                print(f"❌ {file_path} - Status {response.status_code}")
                if response.status_code == 404:
                    print(f"   Arquivo não encontrado no servidor")
                elif response.status_code == 500:
                    print(f"   Erro interno do servidor")
                    
        except requests.exceptions.RequestException as e:
            print(f"❌ {file_path} - Erro de rede: {e}")
    
    return True

if __name__ == "__main__":
    if not test_http_access():
        sys.exit(1)