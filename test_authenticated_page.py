#!/usr/bin/env python3
"""
Script para testar a página com usuário autenticado
"""

import os
import sys
import django
from pathlib import Path

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from django.urls import reverse
import re

def test_authenticated_page():
    """Testa a página com usuário autenticado"""
    print("🔐 Testando página com usuário autenticado...")
    
    # Criar cliente de teste
    client = Client()
    
    # Criar ou obter usuário de teste
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@test.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    
    if created:
        user.set_password('testpass123')
        user.save()
        print("✅ Usuário de teste criado")
    else:
        print("✅ Usuário de teste já existe")
    
    # Fazer login
    login_success = client.login(username='testuser', password='testpass123')
    if login_success:
        print("✅ Login realizado com sucesso")
    else:
        print("❌ Falha no login")
        return
    
    # Acessar a página de criar unidade
    try:
        url = reverse('criar_unidade')
        response = client.get(url)
        
        print(f"✅ Página acessada (Status: {response.status_code})")
        
        if response.status_code == 200:
            content = response.content.decode('utf-8')
            
            # Verificar se é o template correto
            if 'Nova Unidade de Saúde' in content:
                print("✅ Template correto carregado")
            else:
                print("❌ Template incorreto")
            
            # Procurar por scripts React
            script_tags = re.findall(r'<script[^>]*src=["\']([^"\']*)["\'][^>]*>', content)
            print(f"\n📜 Scripts encontrados ({len(script_tags)}):")
            for i, script in enumerate(script_tags, 1):
                print(f"   {i}. {script}")
            
            # Verificar scripts específicos
            searches = [
                ('React CDN', r'unpkg\.com/react'),
                ('ReactDOM CDN', r'unpkg\.com/react-dom'),
                ('Bundle criar-unidade', r'criar-unidade\.bundle\.js'),
                ('Bundle react-services', r'react-services\.bundle\.js'),
                ('ReactInitializer', r'ReactInitializer'),
                ('CriarUnidadeReact', r'CriarUnidadeReact'),
                ('Static template tag', r'\{% static'),
                ('CSRF token', r'csrfmiddlewaretoken')
            ]
            
            print(f"\n🔍 Verificações específicas:")
            for name, pattern in searches:
                matches = re.findall(pattern, content)
                if matches:
                    print(f"   ✅ {name}: {len(matches)} ocorrência(s)")
                else:
                    print(f"   ❌ {name}: não encontrado")
            
            # Verificar se há problemas com template tags
            if '{% static' in content:
                print(f"\n⚠️ Template tags não processadas encontradas!")
                # Encontrar linhas com {% static
                lines = content.split('\n')
                for i, line in enumerate(lines, 1):
                    if '{% static' in line:
                        print(f"   Linha {i}: {line.strip()}")
            
            # Salvar conteúdo para análise
            with open('debug_authenticated_content.html', 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"\n💾 Conteúdo salvo em debug_authenticated_content.html")
            
        else:
            print(f"❌ Erro ao acessar página: Status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_authenticated_page()