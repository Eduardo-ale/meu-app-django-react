#!/usr/bin/env python3
"""
Script específico para testar carregamento de JavaScript e identificar problemas de renderização
"""

import os
import sys
import django
from pathlib import Path
import subprocess
import time

# Configurar Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from django.urls import reverse
from django.conf import settings

def test_javascript_files_directly():
    """Testar arquivos JavaScript diretamente no sistema de arquivos"""
    print("🔍 Testando arquivos JavaScript diretamente...")
    
    # Verificar se os bundles existem fisicamente
    bundle_dir = Path('static/js/dist')
    staticfiles_dir = Path('staticfiles')
    
    print(f"📁 Diretório de bundles: {bundle_dir.absolute()}")
    print(f"📁 Diretório staticfiles: {staticfiles_dir.absolute()}")
    
    critical_bundles = [
        'react-services.bundle.js',
        'criar-unidade.bundle.js',
        'registro-chamada.bundle.js'
    ]
    
    results = {}
    
    for bundle_name in critical_bundles:
        # Verificar no diretório source
        source_path = bundle_dir / bundle_name
        static_path = staticfiles_dir / bundle_name
        
        results[bundle_name] = {
            'source_exists': source_path.exists(),
            'static_exists': static_path.exists(),
            'source_size': source_path.stat().st_size if source_path.exists() else 0,
            'static_size': static_path.stat().st_size if static_path.exists() else 0
        }
        
        if source_path.exists():
            print(f"✅ {bundle_name} existe em source ({results[bundle_name]['source_size']} bytes)")
        else:
            print(f"❌ {bundle_name} NÃO existe em source")
            
        if static_path.exists():
            print(f"✅ {bundle_name} existe em staticfiles ({results[bundle_name]['static_size']} bytes)")
        else:
            print(f"❌ {bundle_name} NÃO existe em staticfiles")
    
    return results

def test_bundle_content():
    """Testar conteúdo dos bundles para identificar problemas"""
    print("\n🔍 Analisando conteúdo dos bundles...")
    
    bundle_dir = Path('static/js/dist')
    critical_bundles = ['criar-unidade.bundle.js', 'react-services.bundle.js']
    
    for bundle_name in critical_bundles:
        bundle_path = bundle_dir / bundle_name
        
        if not bundle_path.exists():
            print(f"❌ {bundle_name} não existe")
            continue
            
        try:
            content = bundle_path.read_text(encoding='utf-8')
            
            # Verificações específicas
            checks = {
                'has_react': 'React' in content,
                'has_component': 'CriarUnidadeReact' in content if 'criar-unidade' in bundle_name else 'ReactErrorHandling' in content,
                'has_window_export': 'window.' in content,
                'has_syntax_error': content.count('(') != content.count(')') or content.count('{') != content.count('}'),
                'is_minified': '\n' not in content[:1000],  # Verificar se está minificado
                'size_ok': len(content) > 10000  # Deve ter pelo menos 10KB
            }
            
            print(f"\n📦 {bundle_name}:")
            print(f"   📏 Tamanho: {len(content):,} bytes")
            
            for check_name, result in checks.items():
                status = "✅" if result else "❌"
                if check_name == 'has_syntax_error':
                    status = "❌" if result else "✅"  # Inverter para erro de sintaxe
                print(f"   {status} {check_name.replace('_', ' ').title()}: {result}")
                
            # Verificar se há erros óbvios no JavaScript
            if 'SyntaxError' in content or 'ReferenceError' in content:
                print(f"   ❌ Contém erros JavaScript explícitos")
            else:
                print(f"   ✅ Não contém erros JavaScript explícitos")
                
        except Exception as e:
            print(f"❌ Erro ao ler {bundle_name}: {e}")

def test_server_response():
    """Testar resposta do servidor para arquivos JavaScript"""
    print("\n🔍 Testando resposta do servidor...")
    
    # Iniciar servidor de desenvolvimento em background
    print("🚀 Iniciando servidor de desenvolvimento...")
    
    try:
        # Usar subprocess para iniciar o servidor
        server_process = subprocess.Popen([
            sys.executable, 'manage.py', 'runserver', '127.0.0.1:8001', '--noreload'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Aguardar servidor iniciar
        time.sleep(3)
        
        # Testar com requests
        import requests
        
        base_url = 'http://127.0.0.1:8001'
        test_urls = [
            '/static/js/dist/react-services.bundle.js',
            '/static/js/dist/criar-unidade.bundle.js',
            '/static/js/services/ReactDebugger.js'
        ]
        
        results = {}
        
        for url in test_urls:
            try:
                response = requests.get(f"{base_url}{url}", timeout=5)
                results[url] = {
                    'status_code': response.status_code,
                    'content_type': response.headers.get('content-type', ''),
                    'content_length': len(response.content),
                    'success': response.status_code == 200
                }
                
                if response.status_code == 200:
                    print(f"✅ {url} - OK ({len(response.content)} bytes)")
                    print(f"   Content-Type: {response.headers.get('content-type', 'N/A')}")
                else:
                    print(f"❌ {url} - HTTP {response.status_code}")
                    
            except requests.exceptions.RequestException as e:
                print(f"❌ {url} - Erro de rede: {e}")
                results[url] = {'error': str(e), 'success': False}
        
        return results
        
    except Exception as e:
        print(f"❌ Erro ao testar servidor: {e}")
        return {}
        
    finally:
        # Terminar processo do servidor
        if 'server_process' in locals():
            server_process.terminate()
            server_process.wait()

def test_template_rendering():
    """Testar renderização de templates com JavaScript"""
    print("\n🔍 Testando renderização de templates...")
    
    # Criar usuário de teste
    try:
        user = User.objects.get(username='testuser')
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            is_staff=True
        )
    
    client = Client()
    client.force_login(user)
    
    # Testar página específica
    try:
        response = client.get('/accounts/unidades-saude/criar/')
        
        print(f"📄 Página criar-unidade:")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.content.decode('utf-8')
            
            # Verificações específicas
            checks = {
                'has_react_container': 'criar-unidade-react-root' in content,
                'has_react_scripts': 'react' in content.lower(),
                'has_bundle_reference': 'criar-unidade.bundle.js' in content,
                'has_fallback_html': 'fallback-container' in content,
                'has_csrf_token': 'csrfmiddlewaretoken' in content
            }
            
            for check_name, result in checks.items():
                status = "✅" if result else "❌"
                print(f"   {status} {check_name.replace('_', ' ').title()}: {result}")
                
            # Extrair scripts referenciados
            import re
            script_matches = re.findall(r'<script[^>]*src=["\']([^"\']*)["\']', content)
            
            print(f"   📜 Scripts referenciados:")
            for script in script_matches:
                if 'bundle.js' in script or 'react' in script.lower():
                    print(f"      - {script}")
        else:
            print(f"   ❌ Erro HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro ao testar template: {e}")

def run_comprehensive_test():
    """Executar teste abrangente"""
    print("🚀 Executando teste abrangente de JavaScript...")
    print("=" * 60)
    
    # Executar todos os testes
    file_results = test_javascript_files_directly()
    test_bundle_content()
    test_template_rendering()
    
    # Tentar testar servidor (opcional)
    try:
        server_results = test_server_response()
    except Exception as e:
        print(f"⚠️ Teste de servidor falhou: {e}")
        server_results = {}
    
    # Resumo final
    print("\n" + "=" * 60)
    print("📊 RESUMO FINAL")
    print("=" * 60)
    
    # Contar problemas
    problems = []
    
    for bundle_name, info in file_results.items():
        if not info['source_exists']:
            problems.append(f"Bundle {bundle_name} não existe em source")
        if not info['static_exists']:
            problems.append(f"Bundle {bundle_name} não existe em staticfiles")
        if info['source_size'] < 1000:
            problems.append(f"Bundle {bundle_name} muito pequeno em source")
    
    if problems:
        print("❌ PROBLEMAS ENCONTRADOS:")
        for problem in problems:
            print(f"   - {problem}")
        
        print("\n💡 SOLUÇÕES RECOMENDADAS:")
        print("   1. Executar: npm run build")
        print("   2. Executar: python manage.py collectstatic --clear")
        print("   3. Verificar configuração do webpack")
        print("   4. Verificar se os entry points existem")
        print("   5. Verificar configuração STATICFILES_DIRS")
    else:
        print("✅ Nenhum problema crítico encontrado nos arquivos!")
    
    print(f"\n🎯 PRÓXIMOS PASSOS:")
    print("   1. Acessar: http://127.0.0.1:8000/accounts/test-react-validation/")
    print("   2. Abrir DevTools do navegador (F12)")
    print("   3. Verificar aba Console para erros JavaScript")
    print("   4. Verificar aba Network para arquivos não carregados")
    print("   5. Executar: window.RenderingFixTools.runFullDiagnostic()")

if __name__ == '__main__':
    run_comprehensive_test()