# Sistema Padronizado de Templates React

Este documento descreve como usar o novo sistema padronizado para templates React no Django.

## Visão Geral

O sistema foi atualizado para usar:
- **Webpack bundles** em vez de componentes individuais
- **Sistema de tratamento de erros** robusto
- **Props padronizadas** para todos os componentes
- **Fallback HTML** graceful quando React falha
- **Inicialização consistente** entre todos os templates

## Estrutura dos Arquivos

```
static/js/
├── dist/                          # Bundles webpack gerados
│   ├── criar-unidade.bundle.js
│   ├── registro-chamada.bundle.js
│   └── ...
├── services/                      # Serviços de suporte
│   ├── ReactInitializer.js       # Sistema de inicialização
│   ├── ReactErrorHandling.js     # Tratamento de erros
│   ├── SafeComponentLoader.js     # Carregamento seguro
│   └── ReactDebugger.js          # Debug e logging
├── components/                    # Componentes React
│   ├── ReactErrorBoundary.js     # Error boundary
│   └── ...
└── entries/                       # Entry points webpack
    ├── criar-unidade.js
    ├── registro-chamada.js
    └── ...

templates/
├── react_scripts_base.html       # Scripts base para todos os templates
└── *_react.html                  # Templates React individuais
```

## Como Usar

### 1. Template Base

Todos os templates React devem incluir o template base:

```html
{% include 'react_scripts_base.html' %}

<!-- Bundle específico do componente -->
<script src="{% static 'js/dist/nome-componente.bundle.js' %}"></script>
```

### 2. Container HTML

Cada template deve ter um container com fallback HTML:

```html
<div id="nome-componente-react-root">
    <!-- Fallback HTML caso React falhe -->
    <div class="fallback-container">
        <!-- HTML estático como alternativa -->
        <form method="post">
            {% csrf_token %}
            <!-- Campos do formulário -->
        </form>
    </div>
</div>
```

### 3. Inicialização do Componente

Use a função padronizada para inicializar:

```javascript
// Inicializar componente React
initializeReactComponent('NomeComponenteReact', 'nome-componente-react-root', {
    // Props específicas do componente
    dados: {{ dados_json|safe }},
    opcoes: ['opcao1', 'opcao2']
}, {
    // Opções de configuração (opcional)
    fallbackMessage: 'Mensagem personalizada de fallback',
    onSuccess: function(componentName, container) {
        console.log('Componente carregado com sucesso');
    },
    onFallback: function(componentName, container) {
        console.log('Usando fallback HTML');
        // Inicializar funcionalidades do fallback
        initializeFallbackFeatures();
    }
});

// Funcionalidades para o fallback HTML
function initializeFallbackFeatures() {
    // Configurar máscaras, validações, etc.
    setupPhoneMask('input[name="telefone"]');
    setupCurrentDate('#data-input');
}
```

## Props Padronizadas

Todos os componentes recebem automaticamente:

```javascript
{
    // Props padrão do sistema
    csrfToken: 'token-csrf',
    usuario: {
        id: 123,
        username: 'usuario',
        full_name: 'Nome Completo'
    },
    dataAtual: '2025-01-18',
    urls: {
        home: '/',
        unidades_saude: '/unidades/',
        // ... outras URLs
    },
    
    // Props específicas do componente (passadas na inicialização)
    dados: {...},
    opcoes: [...]
}
```

## Tratamento de Erros

O sistema inclui tratamento automático de erros:

1. **Error Boundary**: Captura erros de renderização React
2. **Safe Loading**: Verifica dependências antes de renderizar
3. **Fallback Graceful**: Mostra HTML alternativo quando React falha
4. **Debug Logging**: Log detalhado para desenvolvimento

## Utilitários Disponíveis

### Máscaras e Formatação

```javascript
// Máscara de telefone
setupPhoneMask('input[name="telefone"]');

// Data/hora atual
setupCurrentDateTime('#datetime-display');
setupCurrentDate('#date-input');
```

### Configuração de Dados Django

```javascript
// No template, configurar dados globais
window.ReactInitializer.setDjangoData({
    user: { ... },
    urls: { ... },
    csrf_token: '{{ csrf_token }}'
});
```

## Exemplo Completo

### Template HTML

```html
{% load static %}
<!DOCTYPE html>
<html>
<head>
    <title>Meu Componente React</title>
</head>
<body>
    <div id="meu-componente-react-root">
        <div class="fallback-container">
            <h1>Formulário HTML</h1>
            <form method="post">
                {% csrf_token %}
                <input type="text" name="nome" placeholder="Nome">
                <button type="submit">Enviar</button>
            </form>
        </div>
    </div>

    {% include 'react_scripts_base.html' %}
    <script src="{% static 'js/dist/meu-componente.bundle.js' %}"></script>

    <script>
    initializeReactComponent('MeuComponenteReact', 'meu-componente-react-root', {
        dados: {{ dados_json|safe }},
        opcoes: {{ opcoes_json|safe }}
    });

    function initializeFallbackFeatures() {
        // Funcionalidades específicas do fallback
        console.log('Fallback HTML inicializado');
    }
    </script>
</body>
</html>
```

### Entry Point (static/js/entries/meu-componente.js)

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import MeuComponenteReact from '../components/MeuComponenteReact';

// Disponibilizar globalmente
window.MeuComponenteReact = MeuComponenteReact;
```

### Componente React

```javascript
function MeuComponenteReact(props) {
    const { dados, opcoes, usuario, csrfToken } = props;
    
    return (
        <div>
            <h1>Olá, {usuario.full_name}!</h1>
            <form>
                <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />
                {/* Resto do componente */}
            </form>
        </div>
    );
}

export default MeuComponenteReact;
```

## Debugging

Para diagnosticar problemas:

```javascript
// Diagnóstico completo do sistema
window.ReactInitializer.diagnose();

// Verificar componentes disponíveis
window.SafeComponentLoader.listAvailableComponents();

// Verificar ambiente React
window.SafeComponentLoader.diagnoseEnvironment();
```

## Migração de Templates Existentes

1. Substituir scripts React individuais por `{% include 'react_scripts_base.html' %}`
2. Adicionar bundle webpack específico
3. Substituir inicialização manual por `initializeReactComponent()`
4. Adicionar função `initializeFallbackFeatures()` se necessário
5. Testar fallback HTML quando React não carrega

## Benefícios

- **Consistência**: Todos os templates seguem o mesmo padrão
- **Robustez**: Tratamento automático de erros
- **Manutenibilidade**: Código centralizado e reutilizável
- **Performance**: Bundles otimizados pelo webpack
- **Experiência do usuário**: Fallback graceful quando necessário