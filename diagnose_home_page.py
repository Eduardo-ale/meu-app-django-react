#!/usr/bin/env python3
"""
Script para diagnosticar problemas na página principal (home)
"""

import os
import sys
import django
from django.test import Client
from django.contrib.auth.models import User

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

def diagnose_home_page():
    """Diagnostica problemas na página principal"""
    print("🔍 DIAGNÓSTICO DA PÁGINA PRINCIPAL")
    print("=" * 50)
    
    # 1. Verificar se existe usuário de teste
    print("\n1. 📋 Verificando usuários...")
    users = User.objects.all()
    if not users.exists():
        print("❌ Nenhum usuário encontrado!")
        print("💡 Crie um usuário com: python manage.py createsuperuser")
        return
    
    user = users.first()
    print(f"✅ Usuário encontrado: {user.username}")
    
    # 2. Testar acesso à página principal
    print("\n2. 🌐 Testando acesso à página principal...")
    client = Client()
    
    # Login
    client.force_login(user)
    print("✅ Login realizado")
    
    # Acessar página principal
    try:
        response = client.get('/')
        print(f"✅ Status da resposta: {response.status_code}")
        
        if response.status_code == 200:
            content = response.content.decode('utf-8')
            print(f"✅ Tamanho do conteúdo: {len(content)} bytes")
            
            # Verificar elementos essenciais
            checks = [
                ('home-react-root', 'Container React principal'),
                ('home.bundle.js', 'Bundle JavaScript'),
                ('HomeReact', 'Componente React'),
                ('react.development.js', 'React CDN'),
                ('react-dom.development.js', 'ReactDOM CDN'),
            ]
            
            print("\n📋 Verificando elementos essenciais:")
            for check, description in checks:
                if check in content:
                    print(f"✅ {description}: Encontrado")
                else:
                    print(f"❌ {description}: NÃO encontrado")
        else:
            print(f"❌ Erro na resposta: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro ao acessar página: {e}")
    
    # 3. Verificar arquivos estáticos
    print("\n3. 📦 Verificando arquivos estáticos...")
    static_files = [
        'static/js/dist/home.bundle.js',
        'static/js/components/HomeReact.js',
        'static/js/entries/home.js',
        'templates/home_react.html'
    ]
    
    for file_path in static_files:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"✅ {file_path}: {size} bytes")
        else:
            print(f"❌ {file_path}: NÃO encontrado")
    
    # 4. Verificar configuração do webpack
    print("\n4. ⚙️ Verificando configuração webpack...")
    if os.path.exists('webpack.config.js'):
        print("✅ webpack.config.js encontrado")
        with open('webpack.config.js', 'r') as f:
            content = f.read()
            if "'home':" in content:
                print("✅ Entry point 'home' configurado")
            else:
                print("❌ Entry point 'home' NÃO configurado")
    else:
        print("❌ webpack.config.js NÃO encontrado")
    
    # 5. Verificar se o build foi executado
    print("\n5. 🔨 Verificando build...")
    if os.path.exists('static/js/dist/home.bundle.js'):
        print("✅ Bundle home.bundle.js existe")
        size = os.path.getsize('static/js/dist/home.bundle.js')
        print(f"📊 Tamanho: {size} bytes")
        
        if size < 1000:
            print("⚠️ Bundle muito pequeno - pode estar vazio")
        else:
            print("✅ Bundle tem tamanho adequado")
    else:
        print("❌ Bundle home.bundle.js NÃO existe")
        print("💡 Execute: npm run build")
    
    print("\n" + "=" * 50)
    print("🎯 RESUMO DO DIAGNÓSTICO")
    print("=" * 50)
    
    # Verificar problemas mais comuns
    issues = []
    
    if not os.path.exists('static/js/dist/home.bundle.js'):
        issues.append("Bundle home.bundle.js não existe - execute 'npm run build'")
    
    if not os.path.exists('static/js/components/HomeReact.js'):
        issues.append("Componente HomeReact.js não existe")
    
    if not os.path.exists('templates/home_react.html'):
        issues.append("Template home_react.html não existe")
    
    if issues:
        print("❌ PROBLEMAS ENCONTRADOS:")
        for i, issue in enumerate(issues, 1):
            print(f"   {i}. {issue}")
    else:
        print("✅ Nenhum problema crítico encontrado")
    
    print("\n💡 PRÓXIMOS PASSOS:")
    print("1. Acesse http://127.0.0.1:8000/ no navegador")
    print("2. Abra o DevTools (F12) e verifique o console")
    print("3. Procure por erros JavaScript ou 404s")
    print("4. Se necessário, execute: npm run build")

if __name__ == '__main__':
    diagnose_home_page()