#!/usr/bin/env python3
"""
Script para debugar o conteúdo da página e identificar problemas
"""

import requests
import re

def debug_page_content():
    """Debug do conteúdo da página"""
    print("🔍 Debugando conteúdo da página...")
    
    try:
        url = "http://127.0.0.1:8000/accounts/unidades-saude/criar/"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            content = response.text
            print(f"✅ Página carregada (Tamanho: {len(content):,} caracteres)")
            
            # Procurar por tags script
            script_tags = re.findall(r'<script[^>]*src=["\']([^"\']*)["\'][^>]*>', content)
            print(f"\n📜 Scripts encontrados ({len(script_tags)}):")
            for i, script in enumerate(script_tags, 1):
                print(f"   {i}. {script}")
            
            # Procurar por scripts inline
            inline_scripts = re.findall(r'<script[^>]*>(.*?)</script>', content, re.DOTALL)
            print(f"\n📝 Scripts inline encontrados ({len(inline_scripts)}):")
            for i, script in enumerate(inline_scripts, 1):
                preview = script.strip()[:100].replace('\n', ' ')
                print(f"   {i}. {preview}...")
            
            # Procurar por referências específicas
            searches = [
                ('React CDN', r'unpkg\.com/react'),
                ('ReactDOM CDN', r'unpkg\.com/react-dom'),
                ('Bundle criar-unidade', r'criar-unidade\.bundle\.js'),
                ('Bundle react-services', r'react-services\.bundle\.js'),
                ('ReactInitializer', r'ReactInitializer'),
                ('CriarUnidadeReact', r'CriarUnidadeReact'),
                ('Static tag', r'\{% static'),
                ('CSRF token', r'csrfmiddlewaretoken')
            ]
            
            print(f"\n🔍 Buscas específicas:")
            for name, pattern in searches:
                matches = re.findall(pattern, content)
                if matches:
                    print(f"   ✅ {name}: {len(matches)} ocorrência(s)")
                else:
                    print(f"   ❌ {name}: não encontrado")
            
            # Verificar se há erros no HTML
            if 'error' in content.lower() or 'exception' in content.lower():
                print(f"\n⚠️ Possíveis erros encontrados no HTML")
                
            # Salvar uma amostra do conteúdo
            print(f"\n📄 Primeiros 1000 caracteres do HTML:")
            print("-" * 50)
            print(content[:1000])
            print("-" * 50)
            
        else:
            print(f"❌ Erro ao carregar página: Status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    debug_page_content()