#!/usr/bin/env python3
"""
Script para testar a página de debug
"""

import requests

def test_debug_page():
    """Testa a página de debug"""
    print("🔍 TESTE DA PÁGINA DE DEBUG")
    print("=" * 50)
    
    base_url = "http://127.0.0.1:8000"
    debug_url = f"{base_url}/accounts/home-debug/"
    
    try:
        response = requests.get(debug_url, timeout=10)
        
        if response.status_code == 200:
            print("✅ Página de debug acessível")
            print(f"📊 Tamanho da resposta: {len(response.content)} bytes")
            
            # Verificar elementos essenciais
            content = response.text
            checks = [
                ('home-react-root', 'Container React'),
                ('home.bundle.js', 'Bundle JavaScript'),
                ('debug-log', 'Log de debug'),
                ('testDependencies', 'Função de teste'),
                ('React', 'React CDN')
            ]
            
            print("\n📋 Verificando elementos na página:")
            for check, description in checks:
                if check in content:
                    print(f"✅ {description}: Encontrado")
                else:
                    print(f"❌ {description}: NÃO encontrado")
                    
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
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎯 INSTRUÇÕES PARA TESTE")
    print("=" * 50)
    print("1. 🚀 Certifique-se de que o servidor está rodando:")
    print("   python manage.py runserver")
    print()
    print("2. 🌐 Acesse a página de debug:")
    print(f"   {debug_url}")
    print()
    print("3. 🔍 Na página de debug:")
    print("   - Clique em 'Testar Dependências'")
    print("   - Clique em 'Testar Componente React'")
    print("   - Verifique o log de debug")
    print("   - Observe se o componente React renderiza")
    print()
    print("4. 📋 Compare com a página principal:")
    print(f"   {base_url}/")
    
    return True

if __name__ == '__main__':
    test_debug_page()