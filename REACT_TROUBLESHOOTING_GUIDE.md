# Guia de Troubleshooting - Sistema React

## Problemas Comuns e Soluções

### 1. Erro 404 - Arquivo JavaScript Não Encontrado

#### Sintomas
- Console mostra erro 404 para arquivos `.bundle.js`
- Componente React não carrega
- Fallback HTML é exibido

#### Diagnóstico
```bash
# Verificar se o bundle foi gerado
ls static/js/dist/

# Verificar se foi coletado pelo Django
ls staticfiles/js/dist/

# Verificar configuração de arquivos estáticos
python manage.py findstatic js/dist/meu-componente.bundle.js
```

#### Soluções

**Solução 1: Rebuild dos bundles**
```bash
npm run build
python manage.py collectstatic --noinput
```

**Solução 2: Verificar webpack config**
```javascript
// webpack.config.js - verificar se entry point existe
module.exports = {
  entry: {
    'meu-componente': './static/js/entries/meu-componente.js' // arquivo deve existir
  }
}
```

**Solução 3: Verificar configuração Django**
```python
# settings.py
STATICFILES_DIRS = [
    BASE_DIR / "static",
]

STATIC_ROOT = BASE_DIR / "staticfiles"
```

### 2. React DevTools Não Conecta

#### Sintomas
- React DevTools mostra "This page doesn't appear to be using React"
- Componentes não aparecem na árvore de componentes

#### Diagnóstico
```javascript
// No console do browser
console.log(window.React);        // Deve retornar objeto React
console.log(window.ReactDOM);     // Deve retornar objeto ReactDOM
console.log(window.MeuComponente); // Deve retornar função do componente
```

#### Soluções

**Solução 1: Verificar carregamento do React**
```html
<!-- Template deve incluir React antes dos componentes -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="{% static 'js/dist/meu-componente.bundle.js' %}"></script>
```

**Solução 2: Verificar inicialização**
```javascript
// Verificar se componente foi renderizado
const container = document.getElementById('meu-componente-root');
console.log(container._reactInternalFiber); // React 16
console.log(container._reactInternalInstance); // React 15
```

### 3. Componente Não Renderiza

#### Sintomas
- Arquivo JavaScript carrega sem erro 404
- Fallback HTML permanece visível
- Console não mostra erros

#### Diagnóstico
```javascript
// Verificar se componente está disponível
console.log(typeof window.MeuComponente); // Deve ser 'function'

// Verificar se container existe
console.log(document.getElementById('meu-componente-root')); // Não deve ser null

// Verificar se função de inicialização existe
console.log(typeof window.initMeuComponente); // Deve ser 'function'
```

#### Soluções

**Solução 1: Verificar export do componente**
```javascript
// entry point deve exportar para window
window.MeuComponente = MeuComponente;
window.initMeuComponente = function(containerId, props) {
  // lógica de inicialização
};
```

**Solução 2: Verificar ID do container**
```html
<!-- Template HTML -->
<div id="meu-componente-root">  <!-- ID deve coincidir -->
  <!-- fallback content -->
</div>

<script>
// JavaScript
window.initMeuComponente('meu-componente-root', props); // Mesmo ID
</script>
```

### 4. Erros de JavaScript no Console

#### Sintomas
- Console mostra erros JavaScript
- Componente não funciona corretamente
- Funcionalidades quebradas

#### Diagnóstico
```javascript
// Ativar modo debug
window.ReactDebugger.enabled = true;

// Verificar error boundary
console.log(window.ReactErrorBoundary); // Deve existir
```

#### Soluções

**Solução 1: Usar Error Boundary**
```javascript
// Sempre envolver componentes com error boundary
ReactDOM.render(
  React.createElement(window.ReactErrorBoundary, null,
    React.createElement(window.MeuComponente, props)
  ),
  container
);
```

**Solução 2: Adicionar try-catch**
```javascript
window.initMeuComponente = function(containerId, props) {
  try {
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container ${containerId} não encontrado`);
    if (!window.MeuComponente) throw new Error('Componente não carregado');
    
    ReactDOM.render(
      React.createElement(window.ReactErrorBoundary, null,
        React.createElement(window.MeuComponente, props)
      ),
      container
    );
  } catch (error) {
    console.error('Erro ao inicializar componente:', error);
    window.ReactDebugger.logComponentLoad('MeuComponente', false, error);
  }
};
```

### 5. Props Não Chegam ao Componente

#### Sintomas
- Componente renderiza mas dados não aparecem
- Props são undefined no componente

#### Diagnóstico
```javascript
// No template, verificar se props estão sendo passadas
console.log('Props enviadas:', props);

// No componente, verificar se props chegam
function MeuComponente(props) {
  console.log('Props recebidas:', props);
  // resto do componente
}
```

#### Soluções

**Solução 1: Verificar serialização JSON**
```html
<script>
const props = {
  csrfToken: '{{ csrf_token }}',
  usuario: {{ user|safe }},  // |safe é importante para JSON
  dados: {{ dados|safe }}
};
</script>
```

**Solução 2: Verificar estrutura das props**
```python
# Na view Django
context = {
    'user': json.dumps({
        'id': request.user.id,
        'username': request.user.username,
        'full_name': request.user.get_full_name()
    }),
    'dados': json.dumps(dados_para_componente)
}
```

### 6. CSRF Token Issues

#### Sintomas
- Erro 403 Forbidden em requisições POST
- "CSRF token missing or incorrect"

#### Soluções

**Solução 1: Incluir CSRF token**
```javascript
const submitData = async (data) => {
  const response = await fetch('/api/endpoint/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': props.csrfToken  // Importante!
    },
    body: JSON.stringify(data)
  });
};
```

**Solução 2: Obter CSRF token do cookie**
```javascript
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const csrftoken = getCookie('csrftoken');
```

### 7. Build Failures

#### Sintomas
- `npm run build` falha
- Webpack mostra erros
- Bundles não são gerados

#### Diagnóstico
```bash
# Verificar dependências
npm list

# Verificar sintaxe dos arquivos
npm run build -- --verbose
```

#### Soluções

**Solução 1: Limpar e reinstalar dependências**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Solução 2: Verificar sintaxe JavaScript**
```bash
# Usar ESLint para verificar sintaxe
npx eslint static/js/components/
npx eslint static/js/entries/
```

**Solução 3: Verificar imports**
```javascript
// Verificar se todos os imports estão corretos
import React from 'react';  // Correto
import ReactDOM from 'react-dom';  // Correto
import MeuComponente from '../components/MeuComponente.js';  // Verificar caminho
```

## Ferramentas de Debug

### 1. React DevTools
- Instalar extensão do browser
- Verificar se React está em modo development
- Usar para inspecionar props e state

### 2. Console Debugging
```javascript
// Adicionar logs estratégicos
console.log('Componente iniciando:', props);
console.log('Estado atual:', state);
console.log('Erro capturado:', error);
```

### 3. Network Tab
- Verificar se arquivos JavaScript estão sendo carregados
- Verificar status codes das requisições
- Verificar headers CSRF

### 4. ReactDebugger Personalizado
```javascript
// Usar o sistema de debug customizado
ReactDebugger.enabled = true;
ReactDebugger.logComponentLoad('MeuComponente', success, error);
ReactDebugger.logNetworkError(url, error);
```

## Checklist de Verificação

### Antes de Reportar um Bug

- [ ] Arquivo bundle existe em `static/js/dist/`?
- [ ] Arquivo foi coletado em `staticfiles/js/dist/`?
- [ ] Template referencia o arquivo correto?
- [ ] React e ReactDOM estão carregados?
- [ ] Componente está exportado para `window`?
- [ ] Container HTML tem o ID correto?
- [ ] Props estão sendo passadas corretamente?
- [ ] CSRF token está incluído em requisições POST?
- [ ] Console mostra algum erro JavaScript?
- [ ] React DevTools consegue conectar?

### Para Novos Componentes

- [ ] Componente criado em `static/js/components/`?
- [ ] Entry point criado em `static/js/entries/`?
- [ ] Webpack config atualizado?
- [ ] Template Django criado?
- [ ] Build executado com sucesso?
- [ ] Collectstatic executado?
- [ ] Componente renderiza sem erros?
- [ ] Props chegam corretamente?
- [ ] Funcionalidades testadas?

## Comandos Úteis

### Debug e Verificação
```bash
# Verificar arquivos estáticos
python manage.py findstatic js/dist/meu-componente.bundle.js

# Listar arquivos coletados
ls -la staticfiles/js/dist/

# Verificar configuração webpack
npx webpack --config webpack.config.js --dry-run

# Build com informações detalhadas
npm run build -- --verbose

# Verificar sintaxe JavaScript
npx eslint static/js/
```

### Desenvolvimento
```bash
# Watch mode para desenvolvimento
npm run watch

# Build completo
npm run build:all

# Servidor de desenvolvimento Django
python manage.py runserver

# Coletar arquivos estáticos
python manage.py collectstatic --noinput --clear
```

---

*Para mais ajuda, consulte a documentação completa em REACT_SYSTEM_DOCUMENTATION.md*