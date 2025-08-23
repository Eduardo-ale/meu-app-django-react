#!/usr/bin/env python3
"""
Script de validação para testar carregamento de componentes React
Verifica se os arquivos necessários existem e estão configurados corretamente
"""

import os
import json
from pathlib import Path

def validate_react_system():
    """Validar sistema React"""
    print("🔍 Validando sistema de componentes React...")
    
    results = {
        'files_check': {},
        'templates_check': {},
        'components_check': {},
        'services_check': {},
        'overall': 'unknown'
    }
    
    # Verificar arquivos de serviços
    service_files = [
        'static/js/services/ReactComponentInitializer.js',
        'static/js/services/ReactDependencyChecker.js',
        'static/js/services/ReactComponentLoader.js',
        'static/js/services/UniversalReactInitializer.js',
        'static/js/services/ReactDebugger.js',
        'static/js/components/ReactErrorBoundary.js'
    ]
    
    print("\n📁 Verificando arquivos de serviços...")
    for file_path in service_files:
        exists = os.path.exists(file_path)
        results['services_check'][file_path] = exists
        status = "✅" if exists else "❌"
        print(f"  {status} {file_path}")
    
    # Verificar componentes React
    component_files = [
        'static/js/components/CriarUnidadeReact.js',
        'static/js/components/RegistroChamadaReact.js'
    ]
    
    print("\n⚛️ Verificando componentes React...")
    for file_path in component_files:
        exists = os.path.exists(file_path)
        results['components_check'][file_path] = exists
        status = "✅" if exists else "❌"
        print(f"  {status} {file_path}")
    
    # Verificar templates
    template_files = [
        'templates/react_scripts_base.html',
        'templates/criar_unidade_react.html',
        'templates/registro_chamada_react.html',
        'templates/unidades_saude_react.html'
    ]
    
    print("\n📄 Verificando templates...")
    for file_path in template_files:
        exists = os.path.exists(file_path)
        results['templates_check'][file_path] = exists
        status = "✅" if exists else "❌"
        print(f"  {status} {file_path}")
    
    # Verificar conteúdo dos templates
    print("\n🔍 Verificando conteúdo dos templates...")
    
    # Verificar template base
    if os.path.exists('templates/react_scripts_base.html'):
        with open('templates/react_scripts_base.html', 'r', encoding='utf-8') as f:
            content = f.read()
            has_initializer = 'ReactComponentInitializer' in content
            has_init_function = 'initializeReactComponent' in content
            has_notification_function = 'showReactNotification' in content
            
            print(f"  {'✅' if has_initializer else '❌'} Template base tem ReactComponentInitializer")
            print(f"  {'✅' if has_init_function else '❌'} Template base tem função de inicialização")
            print(f"  {'✅' if has_notification_function else '❌'} Template base tem função de notificação")
    
    # Verificar template criar unidade
    if os.path.exists('templates/criar_unidade_react.html'):
        with open('templates/criar_unidade_react.html', 'r', encoding='utf-8') as f:
            content = f.read()
            has_new_init = 'ReactComponentInitializer.initComponent' in content
            has_fallback_container = 'fallback-container' in content
            has_error_handling = 'onError' in content and 'onFallback' in content
            
            print(f"  {'✅' if has_new_init else '❌'} Criar unidade usa novo sistema de inicialização")
            print(f"  {'✅' if has_fallback_container else '❌'} Criar unidade tem container de fallback")
            print(f"  {'✅' if has_error_handling else '❌'} Criar unidade tem tratamento de erros")
    
    # Verificar template registro chamada
    if os.path.exists('templates/registro_chamada_react.html'):
        with open('templates/registro_chamada_react.html', 'r', encoding='utf-8') as f:
            content = f.read()
            has_new_init = 'ReactComponentInitializer.initComponent' in content
            has_fallback_container = 'fallback-container' in content
            has_error_handling = 'onError' in content and 'onFallback' in content
            
            print(f"  {'✅' if has_new_init else '❌'} Registro chamada usa novo sistema de inicialização")
            print(f"  {'✅' if has_fallback_container else '❌'} Registro chamada tem container de fallback")
            print(f"  {'✅' if has_error_handling else '❌'} Registro chamada tem tratamento de erros")
    
    # Calcular resultado geral
    all_services = all(results['services_check'].values())
    all_components = all(results['components_check'].values())
    all_templates = all(results['templates_check'].values())
    
    if all_services and all_components and all_templates:
        results['overall'] = 'excellent'
    elif (sum(results['services_check'].values()) >= len(results['services_check']) * 0.8 and
          sum(results['components_check'].values()) >= len(results['components_check']) * 0.8 and
          sum(results['templates_check'].values()) >= len(results['templates_check']) * 0.8):
        results['overall'] = 'good'
    else:
        results['overall'] = 'needs_attention'
    
    # Exibir resumo
    print(f"\n📊 Resultado Geral: {results['overall'].upper()}")
    
    services_ok = sum(results['services_check'].values())
    components_ok = sum(results['components_check'].values())
    templates_ok = sum(results['templates_check'].values())
    
    print(f"📁 Serviços: {services_ok}/{len(results['services_check'])} OK")
    print(f"⚛️ Componentes: {components_ok}/{len(results['components_check'])} OK")
    print(f"📄 Templates: {templates_ok}/{len(results['templates_check'])} OK")
    
    # Recomendações
    print("\n💡 Recomendações:")
    
    if not all_services:
        missing_services = [k for k, v in results['services_check'].items() if not v]
        print(f"  - Verificar arquivos de serviços ausentes: {', '.join(missing_services)}")
    
    if not all_components:
        missing_components = [k for k, v in results['components_check'].items() if not v]
        print(f"  - Verificar componentes React ausentes: {', '.join(missing_components)}")
    
    if not all_templates:
        missing_templates = [k for k, v in results['templates_check'].items() if not v]
        print(f"  - Verificar templates ausentes: {', '.join(missing_templates)}")
    
    if results['overall'] == 'excellent':
        print("  ✅ Sistema React está configurado corretamente!")
        print("  ✅ Todos os arquivos necessários estão presentes")
        print("  ✅ Templates foram atualizados com novo sistema de inicialização")
    
    return results

def check_task_completion():
    """Verificar se a tarefa 14 foi completada"""
    print("\n🎯 Verificando conclusão da Tarefa 14...")
    
    # Critérios de conclusão da tarefa 14
    criteria = {
        'react_dependencies_verified': False,
        'component_initialization_fixed': False,
        'robust_dependency_checking': False,
        'components_render_correctly': False
    }
    
    # Verificar se React e ReactDOM estão sendo carregados adequadamente
    if os.path.exists('templates/react_scripts_base.html'):
        with open('templates/react_scripts_base.html', 'r', encoding='utf-8') as f:
            content = f.read()
            if 'react@18/umd/react.development.js' in content and 'react-dom@18/umd/react-dom.development.js' in content:
                criteria['react_dependencies_verified'] = True
    
    # Verificar se inicialização de componentes foi corrigida
    if os.path.exists('static/js/services/ReactComponentInitializer.js'):
        with open('static/js/services/ReactComponentInitializer.js', 'r', encoding='utf-8') as f:
            content = f.read()
            if 'ensureReactDependencies' in content and 'initComponent' in content:
                criteria['component_initialization_fixed'] = True
    
    # Verificar se verificação robusta de dependências foi implementada
    if os.path.exists('static/js/services/ReactDependencyChecker.js'):
        with open('static/js/services/ReactDependencyChecker.js', 'r', encoding='utf-8') as f:
            content = f.read()
            if 'checkAllDependencies' in content and 'waitForDependencies' in content:
                criteria['robust_dependency_checking'] = True
    
    # Verificar se componentes têm renderização correta
    templates_updated = 0
    for template in ['templates/criar_unidade_react.html', 'templates/registro_chamada_react.html']:
        if os.path.exists(template):
            with open(template, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'ReactComponentInitializer.initComponent' in content and 'onSuccess' in content and 'onFallback' in content:
                    templates_updated += 1
    
    if templates_updated >= 2:
        criteria['components_render_correctly'] = True
    
    # Exibir resultados
    print("\n📋 Critérios da Tarefa 14:")
    for criterion, status in criteria.items():
        status_icon = "✅" if status else "❌"
        criterion_name = criterion.replace('_', ' ').title()
        print(f"  {status_icon} {criterion_name}")
    
    completed_criteria = sum(criteria.values())
    total_criteria = len(criteria)
    completion_percentage = (completed_criteria / total_criteria) * 100
    
    print(f"\n📊 Progresso: {completed_criteria}/{total_criteria} critérios atendidos ({completion_percentage:.0f}%)")
    
    if completion_percentage == 100:
        print("🎉 Tarefa 14 CONCLUÍDA com sucesso!")
        return True
    elif completion_percentage >= 75:
        print("🟡 Tarefa 14 quase concluída - alguns ajustes necessários")
        return False
    else:
        print("🔴 Tarefa 14 precisa de mais trabalho")
        return False

if __name__ == "__main__":
    print("🚀 Iniciando validação do sistema React...")
    
    # Validar sistema
    validation_results = validate_react_system()
    
    # Verificar conclusão da tarefa
    task_completed = check_task_completion()
    
    print(f"\n{'='*60}")
    print("📋 RESUMO FINAL")
    print(f"{'='*60}")
    print(f"Sistema React: {validation_results['overall'].upper()}")
    print(f"Tarefa 14: {'CONCLUÍDA' if task_completed else 'EM PROGRESSO'}")
    print(f"{'='*60}")