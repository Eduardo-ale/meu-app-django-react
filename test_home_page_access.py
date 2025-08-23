#!/usr/bin/env python3
"""
Script para testar acesso à página principal via HTTP
"""

import requests
import sys

def test_home_page_access():
    """Testa acesso à página principal via HTTP"""
    print("🌐 TESTE DE ACESSO À PÁGINA PRINCIPAL")
    print("=" * 50)
    
    base_url = "http://127.0.0.1:8000"
    
    # 1. Testar se o servidor está rodando
    print("\n1. 🔍 Testando se o servidor está rodando...")
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"✅ Servidor respondeu - Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Página principal acessível")
        elif response.status_code == 302:
            print("⚠️ Redirecionamento (provavelmente para login)")
            print(f"   Redirecionando para: {response.headers.get('Location', 'N/A')}")
        else:
            print(f"❌ Status inesperado: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar ao servidor")
        print("💡 Certifique-se de que o servidor está rodando:")
        print("   python manage.py runserver")
        return False
    except requests.exceptions.Timeout:
        print("❌ Timeout na conexão")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False
    
    # 2. Testar acesso aos arquivos estáticos
    print("\n2. 📦 Testando acesso aos arquivos estáticos...")
    
    static_files = [
        "/static/js/dist/home.bundle.js",
        "/static/js/components/HomeReact.js",
        "/static/js/dist/react-services.bundle.js"
    ]
    
    for file_path in static_files:
        try:
            response = requests.get(f"{base_url}{file_path}", timeout=5)
            if response.status_code == 200:
                size = len(response.content)
                print(f"✅ {file_path}: {size} bytes")
            else:
                print(f"❌ {file_path}: Status {response.status_code}")
        except Exception as e:
            print(f"❌ {file_path}: Erro - {e}")
    
    # 3. Testar página de login (se houver redirecionamento)
    print("\n3. 🔐 Testando página de login...")
    try:
        response = requests.get(f"{base_url}/accounts/login/", timeout=5)
        if response.status_code == 200:
            print("✅ Página de login acessível")
        else:
            print(f"❌ Página de login: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Erro ao acessar login: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 INSTRUÇÕES PARA TESTE MANUAL")
    print("=" * 50)
    print("1. 🚀 Inicie o servidor (se não estiver rodando):")
    print("   python manage.py runserver")
    print()
    print("2. 🌐 Acesse no navegador:")
    print("   http://127.0.0.1:8000/")
    print()
    print("3. 🔍 Abra DevTools (F12) e verifique:")
    print("   - Console: Procure por erros JavaScript")
    print("   - Network: Verifique se arquivos estão carregando")
    print("   - Elements: Verifique se o container 'home-react-root' existe")
    print()
    print("4. 📋 Teste direto dos bundles:")
    for file_path in static_files:
        print(f"   {base_url}{file_path}")
    
    return True

if __name__ == '__main__':
    test_home_page_access()