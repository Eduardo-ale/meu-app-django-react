# Sistema React - Documentação Completa

## Visão Geral

Este documento descreve o sistema React implementado na aplicação Django, incluindo a arquitetura de build, processo de desenvolvimento e guias de troubleshooting.

## Arquitetura do Sistema

### Estrutura de Arquivos

```
static/js/
├── components/           # Componentes React
│   ├── CriarUnidadeReact.js
│   ├── RegistroChamadaReact.js
│   └── outros...
├── entries/             # Entry points para webpack
│   ├── criar-unidade.js
│   ├── registro-chamada.js
│   └── outros...
├── services/            # Serviços e utilitários
│   ├── ReactInitializer.js
│   ├── ReactErrorHandling.js
│   ├── SafeComponentLoader.js
│   ├── ReactDebugger.js
│   └── ComponentDetectionSystem.js
├── examples/            # Exemplos de uso
│   ├── ComponentDetectionExample.js
│   └── ErrorHandlingExample.js
└── dist/               # Arquivos compilados (gerados)
    ├── criar-unidade.bundle.js
    ├── registro-chamada.bundle.js
    └── outros...

staticfiles/            # Arquivos coletados pelo Django
├── js/
│   └── dist/          # Bundles copiados pelo collectstatic
└── outros...

templates/              # Templates Django
├── react_scripts_base.html    # Base para scripts React
├── criar_unidade_react.html
├── registro_chamada_react.html
└── outros...
```

### Componentes do Sistema

#### 1. Sistema de Build (Webpack)
- **Arquivo**: `webpack.config.js`
- **Função**: Compila componentes React em bundles otimizados
- **Entry Points**: Múltiplos pontos de entrada para diferentes componentes
- **Output**: Bundles organizados em `static/js/dist/`

#### 2. Sistema de Inicialização
- **Arquivo**: `static/js/services/ReactInitializer.js`
- **Função**: Inicializa componentes React de forma segura
- **Features**: Detecção automática, fallback graceful, logging

#### 3. Sistema de Tratamento de Erros
- **Arquivos**: 
  - `static/js/services/ReactErrorHandling.js`
  - `static/js/components/ReactErrorBoundary.js`
- **Função**: Captura e trata erros de componentes React
- **Features**: Error boundaries, fallback UI, logging detalhado

#### 4. Sistema de Detecção de Componentes
- **Arquivo**: `static/js/services/ComponentDetectionSystem.js`
- **Função**: Detecta disponibilidade de componentes antes da renderização
- **Features**: Verificação de dependências, status de carregamento

## Sistema de Build

### Configuração do Webpack

O webpack está configurado para processar múltiplos entry points:

```javascript
// webpack.config.js
module.exports = {
  entry: {
    'criar-unidade': './static/js/entries/criar-unidade.js',
    'registro-chamada': './static/js/entries/registro-chamada.js',
    // outros entry points...
  },
  output: {
    path: path.resolve(__dirname, 'static/js/dist'),
    filename: '[name].bundle.js',
    library: '[name]',
    libraryTarget: 'window'
  },
  // configurações adicionais...
}
```

### Scripts de Build

```json
// package.json
{
  "scripts": {
    "build": "webpack --mode=production",
    "build:dev": "webpack --mode=development",
    "watch": "webpack --mode=development --watch",
    "build:all": "npm run build && python manage.py collectstatic --noinput"
  }
}
```

### Processo de Build

1. **Desenvolvimento**:
   ```bash
   npm run watch
   ```

2. **Produção**:
   ```bash
   npm run build:all
   ```

## Criação de Novos Componentes React

### Passo a Passo

#### 1. Criar o Componente
```javascript
// static/js/components/MeuNovoComponente.js
import React, { useState, useEffect } from 'react';

function MeuNovoComponente(props) {
  const [estado, setEstado] = useState({});
  
  // Lógica do componente
  
  return (
    <div className="meu-componente">
      {/* JSX do componente */}
    </div>
  );
}

export default MeuNovoComponente;
```

#### 2. Criar Entry Point
```javascript
// static/js/entries/meu-novo-componente.js
import React from 'react';
import ReactDOM from 'react-dom';
import MeuNovoComponente from '../components/MeuNovoComponente.js';

// Exportar para window para acesso global
window.MeuNovoComponente = MeuNovoComponente;

// Função de inicialização
window.initMeuNovoComponente = function(containerId, props = {}) {
  const container = document.getElementById(containerId);
  if (container && window.MeuNovoComponente) {
    ReactDOM.render(
      React.createElement(window.ReactErrorBoundary, null,
        React.createElement(window.MeuNovoComponente, props)
      ),
      container
    );
  }
};
```

#### 3. Atualizar Webpack Config
```javascript
// webpack.config.js
module.exports = {
  entry: {
    // entries existentes...
    'meu-novo-componente': './static/js/entries/meu-novo-componente.js'
  },
  // resto da configuração...
}
```

#### 4. Criar Template Django
```html
<!-- templates/meu_novo_componente_react.html -->
{% extends 'base.html' %}
{% load static %}

{% block content %}
<div id="meu-componente-root">
  <!-- Fallback HTML -->
  <div class="fallback-container">
    <h2>Carregando componente...</h2>
  </div>
</div>
{% endblock %}

{% block extra_js %}
<script src="{% static 'js/dist/meu-novo-componente.bundle.js' %}"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  const props = {
    csrfToken: '{{ csrf_token }}',
    usuario: {{ user|safe }},
    // outras props...
  };
  
  if (window.initMeuNovoComponente) {
    window.initMeuNovoComponente('meu-componente-root', props);
  }
});
</script>
{% endblock %}
```

#### 5. Build e Deploy
```bash
# Build do novo componente
npm run build

# Coletar arquivos estáticos
python manage.py collectstatic --noinput
```

### Boas Práticas

#### Estrutura do Componente
```javascript
function MeuComponente(props) {
  // 1. Estados
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [errors, setErrors] = useState({});
  
  // 2. Effects
  useEffect(() => {
    // Inicialização
  }, []);
  
  // 3. Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Lógica de submit
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  // 4. Render
  return (
    <div className="component-container">
      {/* JSX */}
    </div>
  );
}
```

#### Integração com Django
```javascript
// Exemplo de chamada para API Django
const submitData = async (formData) => {
  const response = await fetch('/api/endpoint/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': props.csrfToken
    },
    body: JSON.stringify(formData)
  });
  
  if (!response.ok) {
    throw new Error('Erro na requisição');
  }
  
  return response.json();
};
```

## Exemplos de Uso

### Exemplo 1: Componente Simples
```javascript
// Componente básico com estado
function ExemploSimples(props) {
  const [contador, setContador] = useState(0);
  
  return (
    <div>
      <h3>Contador: {contador}</h3>
      <button onClick={() => setContador(contador + 1)}>
        Incrementar
      </button>
    </div>
  );
}
```

### Exemplo 2: Formulário com Validação
```javascript
function ExemploFormulario(props) {
  const [formData, setFormData] = useState({
    nome: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    return newErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Submit do formulário
    console.log('Dados válidos:', formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="Nome"
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
        />
        {errors.nome && <span className="error">{errors.nome}</span>}
      </div>
      
      <div>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <button type="submit">Enviar</button>
    </form>
  );
}
```

### Exemplo 3: Integração com API
```javascript
function ExemploAPI(props) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const response = await fetch('/api/dados/');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Carregando...</div>;
  
  return (
    <div>
      <h3>Dados da API</h3>
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.nome}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Sistema de Tratamento de Erros

### Error Boundary
```javascript
// Uso do Error Boundary
<ReactErrorBoundary>
  <MeuComponente {...props} />
</ReactErrorBoundary>
```

### Carregamento Seguro
```javascript
// Uso do SafeComponentLoader
window.safeRenderComponent('MeuComponente', props, 'container-id');
```

### Debug e Logging
```javascript
// Uso do ReactDebugger
ReactDebugger.logComponentLoad('MeuComponente', true);
ReactDebugger.logNetworkError('/api/endpoint', error);
```

---

*Próxima seção: Guia de Troubleshooting*