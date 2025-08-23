#!/usr/bin/env python3
"""
Script simples para diagnosticar problemas na página principal
"""

import os

def diagnose_home_simple():
    """Diagnóstico simples da página principal"""
    print("🔍 DIAGNÓSTICO SIMPLES DA PÁGINA PRINCIPAL")
    print("=" * 50)
    
    # 1. Verificar arquivos essenciais
    print("\n1. 📦 Verificando arquivos essenciais...")
    
    files_to_check = [
        ('templates/home_react.html', 'Template principal'),
        ('static/js/components/HomeReact.js', 'Componente React'),
        ('static/js/entries/home.js', 'Entry point'),
        ('static/js/dist/home.bundle.js', 'Bundle compilado'),
        ('webpack.config.js', 'Configuração webpack'),
        ('package.json', 'Configuração npm')
    ]
    
    missing_files = []
    
    for file_path, description in files_to_check:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"✅ {description}: {file_path} ({size} bytes)")
        else:
            print(f"❌ {description}: {file_path} - NÃO ENCONTRADO")
            missing_files.append(file_path)
    
    # 2. Verificar configuração webpack
    print("\n2. ⚙️ Verificando configuração webpack...")
    if os.path.exists('webpack.config.js'):
        with open('webpack.config.js', 'r', encoding='utf-8') as f:
            content = f.read()
            if "'home':" in content:
                print("✅ Entry point 'home' configurado no webpack")
            else:
                print("❌ Entry point 'home' NÃO configurado no webpack")
    
    # 3. Verificar se bundle foi gerado recentemente
    print("\n3. 🔨 Verificando build...")
    bundle_path = 'static/js/dist/home.bundle.js'
    if os.path.exists(bundle_path):
        import time
        mtime = os.path.getmtime(bundle_path)
        mtime_str = time.ctime(mtime)
        print(f"✅ Bundle existe - última modificação: {mtime_str}")
        
        size = os.path.getsize(bundle_path)
        if size < 1000:
            print("⚠️ Bundle muito pequeno - pode estar vazio ou com erro")
        else:
            print(f"✅ Bundle tem tamanho adequado: {size} bytes")
    else:
        print("❌ Bundle NÃO existe")
    
    # 4. Verificar template
    print("\n4. 📄 Verificando template...")
    template_path = 'templates/home_react.html'
    if os.path.exists(template_path):
        with open(template_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        checks = [
            ('home-react-root', 'Container React'),
            ('home.bundle.js', 'Referência ao bundle'),
            ('HomeReact', 'Referência ao componente'),
            ('React', 'React CDN'),
            ('ReactDOM', 'ReactDOM CDN')
        ]
        
        for check, description in checks:
            if check in content:
                print(f"✅ {description}: Encontrado no template")
            else:
                print(f"❌ {description}: NÃO encontrado no template")
    
    # 5. Resumo e soluções
    print("\n" + "=" * 50)
    print("🎯 RESUMO E SOLUÇÕES")
    print("=" * 50)
    
    if missing_files:
        print("❌ ARQUIVOS AUSENTES:")
        for file in missing_files:
            print(f"   - {file}")
    
    print("\n💡 SOLUÇÕES RECOMENDADAS:")
    
    if not os.path.exists('static/js/dist/home.bundle.js'):
        print("1. 🔨 Execute o build do webpack:")
        print("   npm run build")
        print("   ou")
        print("   npx webpack")
    
    if not os.path.exists('static/js/components/HomeReact.js'):
        print("2. 📝 Componente HomeReact.js ausente - precisa ser criado")
    
    if not os.path.exists('templates/home_react.html'):
        print("3. 📄 Template home_react.html ausente - precisa ser criado")
    
    print("\n4. 🌐 Para testar:")
    print("   - Inicie o servidor: python manage.py runserver")
    print("   - Acesse: http://127.0.0.1:8000/")
    print("   - Abra DevTools (F12) e verifique o console")
    
    print("\n5. 🔍 Para debug adicional:")
    print("   - Verifique erros no console do navegador")
    print("   - Teste acesso direto ao bundle: http://127.0.0.1:8000/static/js/dist/home.bundle.js")
    print("   - Verifique se o servidor está servindo arquivos estáticos")

if __name__ == '__main__':
    diagnose_home_simple()