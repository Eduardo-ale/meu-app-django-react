#!/usr/bin/env python3
"""
Script para validação final dos problemas de renderização React
"""

import os
import sys
import django
from pathlib import Path

# Configurar Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from django.urls import reverse
import json

def test_static_files_access():
    """Testar acesso aos arquivos estáticos"""
    print("🔍 Testando acesso aos arquivos estáticos...")
    
    client = Client()
    
    # Arquivos críticos para testar
    critical_files = [
        '/static/js/dist/react-services.bundle.js',
        '/static/js/dist/criar-unidade.bundle.js',
        '/static/js/dist/registro-chamada.bundle.js',
        '/static/js/services/ReactDebugger.js',
        '/static/js/components/ReactErrorBoundary.js'
    ]
    
    results = {}
    
    for file_path in critical_files:
        try:
            response = client.get(file_path)
            results[file_path] = {
                'status': response.status_code,
                'size': len(response.content) if response.content else 0,
                'success': response.status_code == 200
            }
            
            if response.status_code == 200:
                print(f"✅ {file_path} - OK ({len(response.content)} bytes)")
            else:
                print(f"❌ {file_path} - HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ {file_path} - Erro: {e}")
            results[file_path] = {
                'status': 'error',
                'error': str(e),
                'success': False
            }
    
    return results

def test_react_pages_access():
    """Testar acesso às páginas React"""
    print("\n🔍 Testando acesso às páginas React...")
    
    # Criar usuário de teste
    try:
        user = User.objects.get(username='admin')
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='admin',
            password='admin123',
            is_staff=True,
            is_superuser=True
        )
    
    client = Client()
    client.force_login(user)
    
    # Páginas React para testar
    react_pages = [
        ('home', 'Home React'),
        ('criar_unidade', 'Criar Unidade React'),
        ('registro_chamada_react', 'Registro Chamada React'),
        ('test_react_validation', 'Teste de Validação React')
    ]
    
    results = {}
    
    for url_name, page_name in react_pages:
        try:
            url = reverse(url_name)
            response = client.get(url)
            
            results[url_name] = {
                'status': response.status_code,
                'success': response.status_code == 200,
                'has_react_container': b'react-root' in response.content,
                'has_react_scripts': b'react' in response.content.lower()
            }
            
            if response.status_code == 200:
                print(f"✅ {page_name} ({url}) - OK")
                if b'react-root' in response.content:
                    print(f"   ✅ Contém container React")
                else:
                    print(f"   ⚠️ Não contém container React")
            else:
                print(f"❌ {page_name} ({url}) - HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ {page_name} - Erro: {e}")
            results[url_name] = {
                'status': 'error',
                'error': str(e),
                'success': False
            }
    
    return results

def check_bundle_contents():
    """Verificar conteúdo dos bundles"""
    print("\n🔍 Verificando conteúdo dos bundles...")
    
    bundle_dir = Path('static/js/dist')
    if not bundle_dir.exists():
        print("❌ Diretório de bundles não existe")
        return {}
    
    results = {}
    
    for bundle_file in bundle_dir.glob('*.bundle.js'):
        try:
            content = bundle_file.read_text(encoding='utf-8')
            
            results[bundle_file.name] = {
                'size': len(content),
                'has_react': 'React' in content,
                'has_component': any(comp in content for comp in ['CriarUnidadeReact', 'RegistroChamadaReact', 'HomeReact']),
                'has_exports': 'window.' in content or 'export' in content,
                'success': len(content) > 1000  # Bundle deve ter pelo menos 1KB
            }
            
            if results[bundle_file.name]['success']:
                print(f"✅ {bundle_file.name} - OK ({len(content)} bytes)")
                if results[bundle_file.name]['has_component']:
                    print(f"   ✅ Contém componentes React")
            else:
                print(f"❌ {bundle_file.name} - Muito pequeno ou vazio")
                
        except Exception as e:
            print(f"❌ {bundle_file.name} - Erro: {e}")
            results[bundle_file.name] = {
                'error': str(e),
                'success': False
            }
    
    return results

def generate_diagnostic_report():
    """Gerar relatório de diagnóstico"""
    print("\n📊 Gerando relatório de diagnóstico...")
    
    static_results = test_static_files_access()
    pages_results = test_react_pages_access()
    bundle_results = check_bundle_contents()
    
    # Contar sucessos e falhas
    static_success = sum(1 for r in static_results.values() if r.get('success', False))
    static_total = len(static_results)
    
    pages_success = sum(1 for r in pages_results.values() if r.get('success', False))
    pages_total = len(pages_results)
    
    bundle_success = sum(1 for r in bundle_results.values() if r.get('success', False))
    bundle_total = len(bundle_results)
    
    print(f"\n📈 Resumo dos Resultados:")
    print(f"   📁 Arquivos Estáticos: {static_success}/{static_total} OK")
    print(f"   🌐 Páginas React: {pages_success}/{pages_total} OK")
    print(f"   📦 Bundles: {bundle_success}/{bundle_total} OK")
    
    # Identificar problemas específicos
    print(f"\n🔍 Problemas Identificados:")
    
    # Problemas de arquivos estáticos
    static_issues = [k for k, v in static_results.items() if not v.get('success', False)]
    if static_issues:
        print(f"   ❌ Arquivos estáticos com problema:")
        for issue in static_issues:
            print(f"      - {issue}")
    
    # Problemas de páginas
    pages_issues = [k for k, v in pages_results.items() if not v.get('success', False)]
    if pages_issues:
        print(f"   ❌ Páginas com problema:")
        for issue in pages_issues:
            print(f"      - {issue}")
    
    # Problemas de bundles
    bundle_issues = [k for k, v in bundle_results.items() if not v.get('success', False)]
    if bundle_issues:
        print(f"   ❌ Bundles com problema:")
        for issue in bundle_issues:
            print(f"      - {issue}")
    
    # Sugestões de correção
    print(f"\n💡 Sugestões de Correção:")
    
    if static_issues:
        print(f"   🔧 Para arquivos estáticos:")
        print(f"      - Executar: python manage.py collectstatic --clear")
        print(f"      - Verificar configuração STATIC_URL e STATICFILES_DIRS")
    
    if bundle_issues:
        print(f"   🔧 Para bundles:")
        print(f"      - Executar: npm run build")
        print(f"      - Verificar configuração do webpack")
        print(f"      - Verificar se os entry points existem")
    
    if pages_issues:
        print(f"   🔧 Para páginas:")
        print(f"      - Verificar se as views estão configuradas corretamente")
        print(f"      - Verificar se os templates existem")
        print(f"      - Verificar autenticação de usuário")
    
    # Salvar relatório em arquivo
    report_data = {
        'static_files': static_results,
        'react_pages': pages_results,
        'bundles': bundle_results,
        'summary': {
            'static_success': static_success,
            'static_total': static_total,
            'pages_success': pages_success,
            'pages_total': pages_total,
            'bundle_success': bundle_success,
            'bundle_total': bundle_total
        }
    }
    
    with open('diagnostic_report.json', 'w', encoding='utf-8') as f:
        json.dump(report_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Relatório salvo em: diagnostic_report.json")
    
    return report_data

if __name__ == '__main__':
    print("🚀 Iniciando validação final dos problemas de renderização React...")
    print("=" * 60)
    
    try:
        report = generate_diagnostic_report()
        
        # Determinar status geral
        total_tests = (report['summary']['static_total'] + 
                      report['summary']['pages_total'] + 
                      report['summary']['bundle_total'])
        
        total_success = (report['summary']['static_success'] + 
                        report['summary']['pages_success'] + 
                        report['summary']['bundle_success'])
        
        success_rate = (total_success / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"\n🎯 Status Geral: {total_success}/{total_tests} testes passaram ({success_rate:.1f}%)")
        
        if success_rate >= 90:
            print("🎉 Sistema está funcionando bem!")
        elif success_rate >= 70:
            print("⚠️ Sistema tem alguns problemas menores")
        else:
            print("❌ Sistema tem problemas significativos que precisam ser corrigidos")
            
    except Exception as e:
        print(f"❌ Erro durante a validação: {e}")
        sys.exit(1)
    
    print("\n✅ Validação concluída!")