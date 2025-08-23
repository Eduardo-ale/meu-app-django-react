#!/usr/bin/env python3
"""
Script para validar configuração de arquivos estáticos em produção
Testa acesso direto aos bundles, URLs corretas e headers adequados
"""

import os
import sys
import django
import requests
from pathlib import Path
from urllib.parse import urljoin
import json
from datetime import datetime

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from django.conf import settings
from django.contrib.staticfiles import finders
from django.contrib.staticfiles.storage import staticfiles_storage
from django.test import Client
from django.urls import reverse

class StaticFilesValidator:
    def __init__(self):
        self.client = Client()
        self.base_url = 'http://127.0.0.1:8000'
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'tests': [],
            'summary': {
                'total': 0,
                'passed': 0,
                'failed': 0,
                'warnings': 0
            }
        }
        
    def log_test(self, test_name, status, message, details=None):
        """Log resultado de um teste"""
        test_result = {
            'name': test_name,
            'status': status,  # 'PASS', 'FAIL', 'WARN'
            'message': message,
            'details': details or {}
        }
        self.results['tests'].append(test_result)
        self.results['summary']['total'] += 1
        
        if status == 'PASS':
            self.results['summary']['passed'] += 1
            print(f"✅ {test_name}: {message}")
        elif status == 'FAIL':
            self.results['summary']['failed'] += 1
            print(f"❌ {test_name}: {message}")
        elif status == 'WARN':
            self.results['summary']['warnings'] += 1
            print(f"⚠️ {test_name}: {message}")
            
        if details:
            for key, value in details.items():
                print(f"   {key}: {value}")
    
    def test_django_settings(self):
        """Testa configurações do Django para arquivos estáticos"""
        print("\n🔧 Testando configurações Django...")
        
        # Verificar STATIC_URL
        if hasattr(settings, 'STATIC_URL') and settings.STATIC_URL:
            self.log_test(
                "Django STATIC_URL",
                "PASS",
                f"STATIC_URL configurado: {settings.STATIC_URL}"
            )
        else:
            self.log_test(
                "Django STATIC_URL",
                "FAIL",
                "STATIC_URL não configurado"
            )
        
        # Verificar STATIC_ROOT
        if hasattr(settings, 'STATIC_ROOT') and settings.STATIC_ROOT:
            static_root_exists = Path(settings.STATIC_ROOT).exists()
            self.log_test(
                "Django STATIC_ROOT",
                "PASS" if static_root_exists else "WARN",
                f"STATIC_ROOT: {settings.STATIC_ROOT} ({'existe' if static_root_exists else 'não existe'})"
            )
        else:
            self.log_test(
                "Django STATIC_ROOT",
                "FAIL",
                "STATIC_ROOT não configurado"
            )
        
        # Verificar STATICFILES_DIRS
        if hasattr(settings, 'STATICFILES_DIRS') and settings.STATICFILES_DIRS:
            dirs_info = []
            for static_dir in settings.STATICFILES_DIRS:
                dir_path = Path(static_dir)
                dirs_info.append(f"{static_dir} ({'existe' if dir_path.exists() else 'não existe'})")
            
            self.log_test(
                "Django STATICFILES_DIRS",
                "PASS",
                f"STATICFILES_DIRS configurado: {len(settings.STATICFILES_DIRS)} diretórios",
                {"diretórios": dirs_info}
            )
        else:
            self.log_test(
                "Django STATICFILES_DIRS",
                "WARN",
                "STATICFILES_DIRS não configurado"
            )
    
    def test_bundle_files_exist(self):
        """Testa se os arquivos bundle existem fisicamente"""
        print("\n📁 Testando existência de arquivos bundle...")
        
        # Lista de bundles esperados
        expected_bundles = [
            'criar-unidade.bundle.js',
            'registro-chamada.bundle.js',
            'lista-telefonica.bundle.js',
            'home.bundle.js',
            'configuracoes.bundle.js',
            'unidades-saude.bundle.js',
            'relatorios.bundle.js',
            'perfil.bundle.js',
            'notificacoes.bundle.js'
        ]
        
        # Verificar em static/js/dist/
        static_dist_path = Path('static/js/dist')
        for bundle in expected_bundles:
            bundle_path = static_dist_path / bundle
            if bundle_path.exists():
                size = bundle_path.stat().st_size
                self.log_test(
                    f"Bundle {bundle}",
                    "PASS",
                    f"Arquivo existe em static/js/dist/ ({size} bytes)"
                )
            else:
                self.log_test(
                    f"Bundle {bundle}",
                    "FAIL",
                    f"Arquivo não encontrado em static/js/dist/"
                )
        
        # Verificar em staticfiles/
        staticfiles_path = Path('staticfiles')
        for bundle in expected_bundles:
            # Verificar na raiz de staticfiles
            bundle_path_root = staticfiles_path / bundle
            # Verificar em staticfiles/js/dist/
            bundle_path_dist = staticfiles_path / 'js' / 'dist' / bundle
            
            found_root = bundle_path_root.exists()
            found_dist = bundle_path_dist.exists()
            
            if found_root or found_dist:
                locations = []
                if found_root:
                    size = bundle_path_root.stat().st_size
                    locations.append(f"raiz ({size} bytes)")
                if found_dist:
                    size = bundle_path_dist.stat().st_size
                    locations.append(f"js/dist/ ({size} bytes)")
                
                self.log_test(
                    f"Bundle {bundle} (staticfiles)",
                    "PASS",
                    f"Coletado em: {', '.join(locations)}"
                )
            else:
                self.log_test(
                    f"Bundle {bundle} (staticfiles)",
                    "FAIL",
                    "Não encontrado em staticfiles/"
                )
    
    def test_static_url_resolution(self):
        """Testa resolução de URLs estáticas"""
        print("\n🔗 Testando resolução de URLs estáticas...")
        
        test_files = [
            'js/dist/criar-unidade.bundle.js',
            'js/dist/registro-chamada.bundle.js',
            'js/components/CriarUnidadeReact.js',
            'js/services/ReactDebugger.js',
            'css/styles.css'
        ]
        
        for file_path in test_files:
            try:
                # Usar Django staticfiles para resolver URL
                static_url = staticfiles_storage.url(file_path)
                
                # Verificar se o arquivo pode ser encontrado pelo finder
                found_file = finders.find(file_path)
                
                if found_file:
                    self.log_test(
                        f"URL Resolution {file_path}",
                        "PASS",
                        f"URL: {static_url}",
                        {"arquivo_encontrado": found_file}
                    )
                else:
                    self.log_test(
                        f"URL Resolution {file_path}",
                        "WARN",
                        f"URL gerada: {static_url}, mas arquivo não encontrado pelo finder"
                    )
            except Exception as e:
                self.log_test(
                    f"URL Resolution {file_path}",
                    "FAIL",
                    f"Erro ao resolver URL: {str(e)}"
                )
    
    def test_http_access(self):
        """Testa acesso HTTP aos arquivos estáticos"""
        print("\n🌐 Testando acesso HTTP aos bundles...")
        
        # Lista de URLs para testar
        test_urls = [
            '/static/js/dist/criar-unidade.bundle.js',
            '/static/js/dist/registro-chamada.bundle.js',
            '/static/js/components/CriarUnidadeReact.js',
            '/static/js/services/ReactDebugger.js',
            '/static/css/styles.css'
        ]
        
        for url in test_urls:
            try:
                response = self.client.get(url)
                
                if response.status_code == 200:
                    content_type = response.get('Content-Type', 'unknown')
                    content_length = len(response.content)
                    
                    # Verificar content-type para arquivos JS
                    if url.endswith('.js'):
                        if 'javascript' in content_type.lower() or 'application/javascript' in content_type.lower():
                            content_type_ok = True
                        else:
                            content_type_ok = False
                    else:
                        content_type_ok = True
                    
                    self.log_test(
                        f"HTTP Access {url}",
                        "PASS" if content_type_ok else "WARN",
                        f"Status: {response.status_code}, Size: {content_length} bytes",
                        {
                            "content_type": content_type,
                            "content_type_ok": content_type_ok
                        }
                    )
                elif response.status_code == 404:
                    self.log_test(
                        f"HTTP Access {url}",
                        "FAIL",
                        f"Arquivo não encontrado (404)"
                    )
                else:
                    self.log_test(
                        f"HTTP Access {url}",
                        "WARN",
                        f"Status inesperado: {response.status_code}"
                    )
                    
            except Exception as e:
                self.log_test(
                    f"HTTP Access {url}",
                    "FAIL",
                    f"Erro na requisição: {str(e)}"
                )
    
    def test_template_references(self):
        """Testa se os templates referenciam os arquivos corretos"""
        print("\n📄 Testando referências nos templates...")
        
        template_tests = [
            {
                'url': reverse('criar_unidade_react'),
                'expected_js': ['js/dist/criar-unidade.bundle.js', 'js/components/CriarUnidadeReact.js'],
                'name': 'Criar Unidade React'
            },
            {
                'url': reverse('registro_chamada_react'),
                'expected_js': ['js/dist/registro-chamada.bundle.js', 'js/components/RegistroChamadaReact.js'],
                'name': 'Registro Chamada React'
            }
        ]
        
        for test in template_tests:
            try:
                response = self.client.get(test['url'])
                
                if response.status_code == 200:
                    content = response.content.decode('utf-8')
                    
                    found_refs = []
                    missing_refs = []
                    
                    for js_file in test['expected_js']:
                        if js_file in content:
                            found_refs.append(js_file)
                        else:
                            missing_refs.append(js_file)
                    
                    if not missing_refs:
                        self.log_test(
                            f"Template {test['name']}",
                            "PASS",
                            f"Todas as referências JS encontradas: {len(found_refs)}"
                        )
                    else:
                        self.log_test(
                            f"Template {test['name']}",
                            "WARN",
                            f"Referências ausentes: {missing_refs}",
                            {"encontradas": found_refs}
                        )
                else:
                    self.log_test(
                        f"Template {test['name']}",
                        "FAIL",
                        f"Erro ao acessar template: {response.status_code}"
                    )
                    
            except Exception as e:
                self.log_test(
                    f"Template {test['name']}",
                    "FAIL",
                    f"Erro: {str(e)}"
                )
    
    def test_whitenoise_configuration(self):
        """Testa configuração do WhiteNoise"""
        print("\n⚪ Testando configuração WhiteNoise...")
        
        # Verificar se WhiteNoise está no middleware
        if hasattr(settings, 'MIDDLEWARE'):
            whitenoise_in_middleware = any('whitenoise' in middleware.lower() for middleware in settings.MIDDLEWARE)
            
            if whitenoise_in_middleware:
                self.log_test(
                    "WhiteNoise Middleware",
                    "PASS",
                    "WhiteNoise encontrado no MIDDLEWARE"
                )
            else:
                self.log_test(
                    "WhiteNoise Middleware",
                    "WARN",
                    "WhiteNoise não encontrado no MIDDLEWARE"
                )
        
        # Verificar configurações específicas do WhiteNoise
        whitenoise_settings = [
            'WHITENOISE_USE_FINDERS',
            'WHITENOISE_AUTOREFRESH',
            'WHITENOISE_MIMETYPES',
            'WHITENOISE_MAX_AGE'
        ]
        
        for setting_name in whitenoise_settings:
            if hasattr(settings, setting_name):
                value = getattr(settings, setting_name)
                self.log_test(
                    f"WhiteNoise {setting_name}",
                    "PASS",
                    f"Configurado: {value}"
                )
            else:
                self.log_test(
                    f"WhiteNoise {setting_name}",
                    "WARN",
                    "Não configurado"
                )
    
    def run_all_tests(self):
        """Executa todos os testes"""
        print("🚀 Iniciando validação de arquivos estáticos em produção...")
        print("=" * 60)
        
        self.test_django_settings()
        self.test_bundle_files_exist()
        self.test_static_url_resolution()
        self.test_http_access()
        self.test_template_references()
        self.test_whitenoise_configuration()
        
        # Resumo final
        print("\n" + "=" * 60)
        print("📊 RESUMO DOS TESTES")
        print("=" * 60)
        
        summary = self.results['summary']
        total = summary['total']
        passed = summary['passed']
        failed = summary['failed']
        warnings = summary['warnings']
        
        print(f"Total de testes: {total}")
        print(f"✅ Passou: {passed} ({passed/total*100:.1f}%)")
        print(f"❌ Falhou: {failed} ({failed/total*100:.1f}%)")
        print(f"⚠️ Avisos: {warnings} ({warnings/total*100:.1f}%)")
        
        if failed == 0:
            print("\n🎉 Todos os testes críticos passaram!")
            if warnings > 0:
                print(f"⚠️ Há {warnings} avisos que podem precisar de atenção.")
        else:
            print(f"\n❌ {failed} testes falharam. Verifique os problemas acima.")
        
        # Salvar relatório
        report_file = 'static_files_validation_report.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Relatório detalhado salvo em: {report_file}")
        
        return failed == 0

if __name__ == '__main__':
    validator = StaticFilesValidator()
    success = validator.run_all_tests()
    
    sys.exit(0 if success else 1)