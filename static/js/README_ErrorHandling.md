# Sistema de Tratamento de Erros React

## Visão Geral

Este sistema fornece ferramentas robustas para capturar, tratar e debugar erros em componentes React integrados ao Django.

## Componentes do Sistema

### 1. ReactErrorBoundary
Componente que captura erros de renderização React.

```javascript
// Uso automático via SafeComponentLoader
window.SafeComponentLoader.render('MeuComponente', props, 'container-id');

// Uso manual
ReactDOM.render(
  React.createElement(ReactErrorBoundary, null,
    React.createElement(MeuComponente, props)
  ),
  document.getElementById('container')
);
```

### 2. SafeComponentLoader
Sistema de carregamento seguro de componentes.

```javascript
// Renderização segura
window.SafeComponentLoader.render('ComponentName', props, 'container-id');

// Verificar se foi renderizado
window.SafeComponentLoader.isRendered('container-id');

// Limpar componente
window.SafeComponentLoader.unmount('container-id');
```

### 3. ReactDebugger
Sistema de logging e debug.

```javascript
// Ativar modo debug
window.ReactDebugger.setDebugMode(true);

// Log de componente
window.ReactDebugger.logComponent('ComponentName', true);

// Obter logs
window.ReactDebugger.getLogs();
```

### 4. ErrorHandlingExample
Ferramentas de demonstração e teste.

```javascript
// Workflow completo de debug
ErrorHandlingExample.fullDebugWorkflow('ComponentName', 'container-id');

// Criar ambiente de teste visual
ErrorHandlingExample.createTestEnvironment();
```

## Tipos de Erros Tratados

### 1. Componente Não Encontrado
**Sintoma:** `window.ComponentName is undefined`

**Tratamento:**
```javascript
if (!window[componentName]) {
  console.warn(`Componente ${componentName} não encontrado`);
  showFallbackHTML();
  return false;
}
```

**Solução:**
- Verificar se bundle foi carregado
- Executar `npm run build`
- Verificar exportação do componente

### 2. Container Não Existe
**Sintoma:** `Cannot read property 'appendChild' of null`

**Tratamento:**
```javascript
const container = document.getElementById(containerId);
if (!container) {
  console.error(`Container ${containerId} não encontrado`);
  return false;
}
```

**Solução:**
- Verificar ID do elemento HTML
- Garantir que elemento existe antes da renderização

### 3. Erro de Renderização React
**Sintoma:** Componente quebra durante render

**Tratamento:**
```javascript
class ReactErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo);
    this.setState({ hasError: true, error });
  }
  
  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        className: 'error-fallback'
      }, 'Erro no componente. Usando fallback HTML.');
    }
    return this.props.children;
  }
}
```

### 4. Erro de Rede (404, 500, etc)
**Sintoma:** Arquivos JavaScript não carregam

**Tratamento:**
```javascript
window.addEventListener('error', function(e) {
  if (e.target.tagName === 'SCRIPT') {
    console.error('Erro ao carregar script:', e.target.src);
    showNetworkErrorMessage();
  }
});
```

**Solução:**
- Verificar configuração de arquivos estáticos
- Executar `python manage.py collectstatic`

### 5. Erro de CSRF Token
**Sintoma:** 403 Forbidden em requests POST

**Tratamento:**
```javascript
function getCSRFToken() {
  const token = document.querySelector('[name=csrfmiddlewaretoken]');
  if (!token) {
    console.error('CSRF Token não encontrado');
    return null;
  }
  return token.value;
}
```

## Estratégias de Fallback

### 1. HTML Fallback
Sempre fornecer HTML estático como fallback:

```html
<div id="component-root">
  <div class="fallback-container">
    <!-- HTML estático que funciona sem JavaScript -->
    <form method="post">
      {% csrf_token %}
      <!-- campos do formulário -->
    </form>
  </div>
</div>
```

### 2. Mensagens de Erro Amigáveis
```javascript
function showUserFriendlyError(containerId, error) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <div class="alert alert-warning">
      <h4>⚠️ Componente Temporariamente Indisponível</h4>
      <p>Estamos usando a versão HTML desta página.</p>
      <button onclick="location.reload()" class="btn btn-primary">
        🔄 Tentar Novamente
      </button>
    </div>
  `;
}
```

### 3. Retry Automático
```javascript
function retryComponentLoad(componentName, props, containerId, maxRetries = 3) {
  let attempts = 0;
  
  function attempt() {
    attempts++;
    
    if (window[componentName]) {
      return SafeComponentLoader.render(componentName, props, containerId);
    }
    
    if (attempts < maxRetries) {
      console.log(`Tentativa ${attempts}/${maxRetries} para ${componentName}`);
      setTimeout(attempt, 1000 * attempts); // Backoff exponencial
    } else {
      console.error(`Falha ao carregar ${componentName} após ${maxRetries} tentativas`);
      showFallbackHTML(containerId);
    }
  }
  
  attempt();
}
```

## Debug em Produção

### 1. Logging Seguro
```javascript
const ReactLogger = {
  log: function(level, message, data = null) {
    // Só logar em desenvolvimento ou se debug estiver ativo
    if (window.location.hostname === 'localhost' || window.DEBUG_MODE) {
      console[level](`[React] ${message}`, data);
    }
    
    // Em produção, enviar para serviço de logging
    if (window.PRODUCTION_LOGGING) {
      this.sendToLoggingService(level, message, data);
    }
  }
};
```

### 2. Métricas de Erro
```javascript
const ErrorMetrics = {
  track: function(errorType, componentName, details) {
    // Enviar métricas para analytics
    if (window.gtag) {
      gtag('event', 'react_error', {
        error_type: errorType,
        component_name: componentName,
        details: JSON.stringify(details)
      });
    }
  }
};
```

## Testes de Error Handling

### 1. Teste de Componente Ausente
```javascript
// Simular componente ausente
delete window.ComponenteTeste;

// Tentar renderizar
SafeComponentLoader.render('ComponenteTeste', {}, 'test-container');

// Verificar se fallback foi ativado
const fallback = document.querySelector('.fallback-container');
console.assert(fallback.style.display !== 'none', 'Fallback deve estar visível');
```

### 2. Teste de Erro de Renderização
```javascript
// Componente que sempre falha
window.ComponenteComErro = function() {
  throw new Error('Erro simulado');
};

// Tentar renderizar
SafeComponentLoader.render('ComponenteComErro', {}, 'test-container');

// Verificar se error boundary capturou
const errorMessage = document.querySelector('.error-fallback');
console.assert(errorMessage, 'Error boundary deve capturar erro');
```

### 3. Teste de Rede
```javascript
// Simular erro 404
const script = document.createElement('script');
script.src = '/static/js/arquivo-inexistente.js';
script.onerror = function() {
  console.log('✅ Erro de rede capturado corretamente');
};
document.head.appendChild(script);
```

## Configuração Recomendada

### 1. Template Base
```html
<!-- templates/react_scripts_base.html -->
<script>
// Configurar error handling global
window.addEventListener('error', function(e) {
  if (e.target.tagName === 'SCRIPT') {
    console.error('Script load error:', e.target.src);
  }
});

// Configurar unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled promise rejection:', e.reason);
});
</script>
```

### 2. Inicialização Padrão
```javascript
// static/js/services/ReactInitializer.js
window.ReactInitializer = {
  init: function(componentName, props, containerId) {
    // Aguardar DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.safeInit(componentName, props, containerId);
      });
    } else {
      this.safeInit(componentName, props, containerId);
    }
  },
  
  safeInit: function(componentName, props, containerId) {
    try {
      SafeComponentLoader.render(componentName, props, containerId);
    } catch (error) {
      console.error('Initialization error:', error);
      ErrorHandlingExample.showErrorInContainer(containerId, error);
    }
  }
};
```

## Monitoramento e Alertas

### 1. Dashboard de Erros
```javascript
const ErrorDashboard = {
  errors: [],
  
  addError: function(error) {
    this.errors.push({
      timestamp: new Date(),
      error: error,
      url: window.location.href,
      userAgent: navigator.userAgent
    });
    
    this.updateDisplay();
  },
  
  updateDisplay: function() {
    // Atualizar contador de erros na UI
    const counter = document.getElementById('error-counter');
    if (counter) {
      counter.textContent = this.errors.length;
    }
  }
};
```

### 2. Alertas Automáticos
```javascript
// Alertar se muitos erros ocorrerem
if (ErrorDashboard.errors.length > 5) {
  console.warn('⚠️ Muitos erros React detectados. Verifique a configuração.');
  
  // Mostrar notificação para desenvolvedores
  if (window.location.hostname === 'localhost') {
    alert('Muitos erros React detectados. Verifique o console.');
  }
}
```

---

**Dica:** Use `ErrorHandlingExample.createTestEnvironment()` para criar um painel visual de testes durante o desenvolvimento.