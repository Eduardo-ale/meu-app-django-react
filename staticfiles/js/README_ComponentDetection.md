# Sistema de Detecção de Componentes React

## Visão Geral

Este sistema fornece ferramentas para diagnosticar e resolver problemas com componentes React na aplicação Django.

## Ferramentas Disponíveis

### 1. ComponentDetectionExample

Script de diagnóstico que pode ser usado no console do navegador.

**Como usar:**
1. Abra o DevTools (F12)
2. Vá para a aba Console
3. Execute os comandos abaixo

### 2. Comandos de Diagnóstico

#### Diagnóstico Completo
```javascript
ComponentDetectionExample.fullDiagnosis()
```

#### Verificar Componentes
```javascript
ComponentDetectionExample.checkAllComponents()
```

#### Verificar Bundles
```javascript
ComponentDetectionExample.checkBundles()
```

#### Testar Componente Específico
```javascript
ComponentDetectionExample.testComponent('CriarUnidadeReact', 'criar-unidade-root')
```

#### Verificar Erros de Rede
```javascript
ComponentDetectionExample.checkNetworkErrors()
```

## Interpretando os Resultados

### ✅ Símbolos de Status
- ✅ = Funcionando corretamente
- ❌ = Problema identificado
- ⚠️ = Aviso/Atenção
- 📦 = Container/Bundle
- 🌐 = Problema de rede

### Problemas Comuns e Soluções

#### "Componente não encontrado"
**Causa:** Bundle não foi gerado ou não carregou
**Solução:**
```bash
npm run build
python manage.py collectstatic
```

#### "Container não encontrado"
**Causa:** ID do elemento HTML não confere
**Solução:** Verificar se o ID no template HTML está correto

#### "Bundles não encontrados"
**Causa:** Webpack não executou ou arquivos não foram coletados
**Solução:**
```bash
npm install
npm run build
python manage.py collectstatic --noinput
```

#### "Recursos falharam ao carregar"
**Causa:** Problemas de configuração de arquivos estáticos
**Solução:** Verificar settings.py e URLs do Django

## Exemplo de Uso Prático

### Cenário: Página fica em loading infinito

1. **Abrir DevTools e executar diagnóstico:**
```javascript
ComponentDetectionExample.fullDiagnosis()
```

2. **Analisar resultado:**
```
❌ CriarUnidadeReact - Não encontrado
📦 Bundles encontrados: 0
❌ Recursos que falharam ao carregar: criar-unidade.bundle.js
```

3. **Aplicar solução recomendada:**
```bash
npm run build
python manage.py collectstatic
```

4. **Verificar novamente:**
```javascript
ComponentDetectionExample.checkAllComponents()
```

5. **Resultado esperado:**
```
✅ CriarUnidadeReact - Carregado
📦 Bundles encontrados: 3
✅ Todos os recursos carregaram corretamente
```

## Integração com Sistema de Debug

### ReactDebugger
```javascript
// Verificar status geral
window.ReactDebugger.getStatus()

// Verificar componente específico
window.ReactDebugger.checkComponent('CriarUnidadeReact')
```

### SafeComponentLoader
```javascript
// Renderizar componente com segurança
window.SafeComponentLoader.render('CriarUnidadeReact', {}, 'container-id')

// Verificar se componente foi renderizado
window.SafeComponentLoader.isRendered('container-id')
```

## Automatização

### Script de Verificação Automática

Adicione ao final dos seus templates React:

```html
<script>
// Verificação automática em desenvolvimento
if (window.location.hostname === 'localhost') {
  setTimeout(() => {
    if (window.ComponentDetectionExample) {
      ComponentDetectionExample.checkAllComponents();
    }
  }, 1000);
}
</script>
```

### Hook de Build

Adicione ao package.json:

```json
{
  "scripts": {
    "build": "webpack --mode production",
    "build:check": "npm run build && node -e \"console.log('✅ Build concluído com sucesso')\"",
    "dev:check": "npm run dev && echo 'Verificando componentes...' && timeout 3"
  }
}
```

## Troubleshooting Avançado

### Problema: Componente carrega mas não renderiza

```javascript
// Verificar se React está disponível
console.log('React disponível:', !!window.React);

// Verificar se ReactDOM está disponível  
console.log('ReactDOM disponível:', !!window.ReactDOM);

// Verificar props passadas
ComponentDetectionExample.testComponent('MeuComponente', 'meu-container');
```

### Problema: Erro de CSRF em formulários

```javascript
// Verificar se token CSRF está disponível
const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
console.log('CSRF Token:', csrfToken ? csrfToken.value : 'Não encontrado');
```

### Problema: Conflitos de versão do React

```javascript
// Verificar versão do React
console.log('Versão do React:', window.React?.version);

// Verificar se há múltiplas instâncias
console.log('Instâncias do React:', Object.keys(window).filter(key => key.includes('React')));
```

## Logs de Debug

### Ativar Logs Detalhados

```javascript
// Ativar modo debug
window.ReactDebugger.setDebugMode(true);

// Verificar logs
window.ReactDebugger.getLogs();
```

### Filtrar Logs por Tipo

```javascript
// Apenas erros
window.ReactDebugger.getLogs('error');

// Apenas avisos
window.ReactDebugger.getLogs('warning');

// Apenas sucessos
window.ReactDebugger.getLogs('success');
```

---

**Dica:** Mantenha este sistema de diagnóstico sempre disponível durante o desenvolvimento para identificar problemas rapidamente.