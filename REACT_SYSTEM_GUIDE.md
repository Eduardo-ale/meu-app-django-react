# Guia do Sistema React - Django

## Visão Geral

Este documento descreve como o sistema React está integrado com Django e como resolver problemas comuns de carregamento.

## Arquitetura do Sistema

### Estrutura de Arquivos
```
static/js/
├── components/           # Componentes React
│   ├── CriarUnidadeReact.js
│   ├── RegistroChamadaReact.js
│   └── ReactErrorBoundary.js
├── services/            # Serviços e utilitários
│   ├── ReactInitializer.js
│   ├── ReactErrorHandling.js
│   ├── SafeComponentLoader.js
│   └── ReactDebugger.js
├── entries/             # Entry points para webpack
│   ├── criar-unidade.js
│   └── registro-chamada.js
└── dist/               # Arquivos compilados (gerados)
    ├── criar-unidade.bundle.js
    └── registro-chamada.bundle.js
```

### Como Funciona

1. **Webpack** compila os componentes React em bundles
2. **Templates Django** carregam os bundles e inicializam componentes
3. **Sistema de Fallback** garante que HTML estático seja exibido se React falhar
4. **Error Handling** captura e trata erros de carregamento

## Processo de Build

### Scripts Disponíveis

```bash
# Build de desenvolvimento (com watch)
npm run dev

# Build de produção
npm run build

# Build específico para um componente
npm run build:criar-unidade
npm run build:registro-chamada
```

### Configuração do Webpack

O webpack está configurado para:
- Processar múltiplos entry points
- Gerar bundles otimizados
- Suportar JSX e ES6+
- Incluir source maps para debug

## Como Criar Novos Componentes React

### 1. Criar o Componente

```javascript
// static/js/components/MeuComponente.js
function MeuComponente(props) {
  const [estado, setEstado] = React.useState({});
  
  return React.createElement('div', {
    className: 'meu-componente'
  }, 'Conteúdo do componente');
}

// Exportar para uso global
window.MeuComponente = MeuComponente;
```

### 2. Criar Entry Point

```javascript
// static/js/entries/meu-componente.js
import '../components/MeuComponente.js';

// Inicialização automática se elemento existir
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('meu-componente-root');
  if (container && window.MeuComponente) {
    window.SafeComponentLoader.render('MeuComponente', {}, 'meu-componente-root');
  }
});
```

### 3. Atualizar Webpack Config

```javascript
// webpack.config.js
module.exports = {
  entry: {
    // ... outros entries
    'meu-componente': './static/js/entries/meu-componente.js'
  }
  // ... resto da configuração
};
```

### 4. Criar Template Django

```html
<!-- templates/meu_template_react.html -->
{% extends 'react_scripts_base.html' %}
{% load static %}

{% block title %}Meu Componente{% endblock %}

{% block content %}
<div id="meu-componente-root">
  <!-- HTML de fallback -->
  <div class="fallback-container">
    <h2>Meu Componente (versão HTML)</h2>
    <!-- Conteúdo estático como fallback -->
  </div>
</div>
{% endblock %}

{% block react_scripts %}
<script src="{% static 'js/dist/meu-componente.bundle.js' %}"></script>
{% endblock %}
```

## Sistema de Error Handling

### Componentes com Error Boundary

Todos os componentes React são automaticamente envolvidos em um Error Boundary:

```javascript
// Uso automático via SafeComponentLoader
window.SafeComponentLoader.render('MeuComponente', props, 'container-id');
```

### Logging de Erros

O sistema inclui logging detalhado:

```javascript
// Verificar logs no console do navegador
console.log('React Debug Info:', window.ReactDebugger.getStatus());
```

### Fallback Automático

Se um componente React falhar:
1. Error é capturado e logado
2. HTML de fallback é exibido
3. Mensagem de aviso é mostrada (em desenvolvimento)

## Troubleshooting

### Problema: "Carregando dashboard..." infinito

**Sintomas:**
- Página fica em loading infinito
- Console mostra 404 para arquivos .js
- React DevTools não conecta

**Soluções:**

1. **Verificar se bundles foram gerados:**
```bash
# Executar build
npm run build

# Verificar se arquivos existem
ls static/js/dist/
```

2. **Verificar configuração Django:**
```python
# settings.py
STATICFILES_DIRS = [
    BASE_DIR / "static",
]

# Executar collectstatic
python manage.py collectstatic
```

3. **Verificar logs do navegador:**
- Abrir DevTools (F12)
- Verificar erros no Console
- Verificar Network tab para 404s

### Problema: Componente não renderiza

**Diagnóstico:**
```javascript
// No console do navegador
console.log('Componente disponível:', !!window.MeuComponente);
console.log('Container existe:', !!document.getElementById('container-id'));
```

**Soluções:**
1. Verificar se bundle foi carregado
2. Verificar se ID do container está correto
3. Verificar se componente foi exportado corretamente

### Problema: Erros de CSRF

**Sintoma:** Erro 403 ao submeter formulários

**Solução:**
```javascript
// Garantir que CSRF token está sendo passado
const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

// Incluir em requests
fetch('/api/endpoint/', {
  method: 'POST',
  headers: {
    'X-CSRFToken': csrfToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### Problema: Arquivos estáticos não carregam

**Verificações:**
1. `DEBUG = True` em settings.py (desenvolvimento)
2. `python manage.py collectstatic` executado
3. URLs estáticas configuradas corretamente

```python
# urls.py (desenvolvimento)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # suas URLs
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
```

## Comandos Úteis

### Build e Deploy
```bash
# Build completo
npm run build

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Executar servidor
python manage.py runserver
```

### Debug
```bash
# Verificar estrutura de arquivos
find static/js -name "*.js" | head -20

# Verificar bundles gerados
ls -la static/js/dist/

# Verificar arquivos coletados
ls -la staticfiles/js/
```

### Limpeza
```bash
# Limpar bundles antigos
rm -rf static/js/dist/*

# Limpar staticfiles
rm -rf staticfiles/*

# Rebuild completo
npm run build && python manage.py collectstatic
```

## Boas Práticas

### 1. Desenvolvimento
- Sempre usar `npm run dev` para desenvolvimento (watch mode)
- Verificar console do navegador para erros
- Testar fallback HTML desabilitando JavaScript

### 2. Produção
- Executar `npm run build` antes do deploy
- Sempre executar `collectstatic` após build
- Verificar que todos os bundles foram gerados

### 3. Debugging
- Usar React DevTools para inspecionar componentes
- Verificar Network tab para problemas de carregamento
- Usar `window.ReactDebugger` para informações do sistema

## Suporte

Para problemas não cobertos neste guia:

1. Verificar logs do Django (`python manage.py runserver`)
2. Verificar console do navegador (F12)
3. Verificar se todos os arquivos necessários existem
4. Testar com JavaScript desabilitado (fallback HTML)

---

**Última atualização:** Janeiro 2025