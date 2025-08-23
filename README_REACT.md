# Sistema React - Guia Completo e Documentação

## 🚀 Solução Rápida para Problemas de Carregamento

Se sua aplicação está ficando em "Carregando dashboard..." infinitamente:

```bash
# Execute estes comandos em sequência:
npm install
npm run build
python manage.py collectstatic --noinput
python manage.py runserver
```

**Para diagnóstico detalhado:** [GUIA_SOLUCAO_CARREGAMENTO.md](GUIA_SOLUCAO_CARREGAMENTO.md)

## Visão Geral

Este documento serve como guia completo para o sistema React implementado na aplicação Django, incluindo documentação do sistema de build, processo de criação de componentes, exemplos práticos e guia de troubleshooting.

## Problema Original Resolvido

A aplicação estava enfrentando os seguintes problemas que foram corrigidos:
- ✅ Componentes React não carregavam (404 errors)
- ✅ React DevTools não conseguia conectar
- ✅ Fallback HTML era exibido em vez dos componentes interativos
- ✅ Configuração de build incompleta
- ✅ Falta de sistema de tratamento de erros
- ✅ Ausência de documentação e guias

## Configuração

O projeto está configurado para usar React com Webpack e Babel, incluindo sistema robusto de tratamento de erros e detecção automática de componentes.

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm
- Python/Django (para integração)

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Adicione o Node.js ao PATH (Windows):
```powershell
$env:PATH += ";C:\Program Files\nodejs"
```

3. Execute o build inicial:
```bash
npm run build:all
```

### Desenvolvimento

#### Scripts de Build Disponíveis

##### Build de Produção
```bash
# Build otimizado para produção
npm run build

# Build de produção com otimizações extras
npm run build:prod

# Build completo (limpa + produção)
npm run build:all
```

##### Build de Desenvolvimento
```bash
# Build de desenvolvimento (uma vez)
npm run build:dev

# Build de desenvolvimento com watch
npm run dev

# Watch com progress e cores
npm run dev:watch

# Watch básico
npm run watch
```

##### Comandos Utilitários
```bash
# Limpar arquivos compilados
npm run clean

# Analisar tamanho dos bundles
npm run analyze

# Executar collectstatic do Django
npm run collectstatic

# Servidor de desenvolvimento
npm run start
```

## Estrutura dos Arquivos

### Componentes React
- `static/js/components/ListaTelefonica.js` - Componente principal da lista telefônica
- `static/js/components/FormComponents.js` - Componentes de formulário reutilizáveis

### Bundle
- `static/js/bundle-lista-telefonica.js` - Arquivo compilado do React

### Configuração
- `webpack.config.js` - Configuração do Webpack
- `package.json` - Dependências e scripts

## Processo de Build

### Arquitetura do Build

O sistema usa Webpack para compilar múltiplos entry points, cada um correspondendo a um componente React específico:

```
static/js/
├── components/          # Componentes React
├── entries/            # Entry points do Webpack
├── services/           # Serviços utilitários
└── dist/              # Arquivos compilados (gerados)
```

### Entry Points Configurados

O Webpack está configurado para processar os seguintes componentes:

- `lista-telefonica` → `lista-telefonica.bundle.js`
- `configuracoes` → `configuracoes.bundle.js`
- `criar-unidade` → `criar-unidade.bundle.js`
- `criar-usuario` → `criar-usuario.bundle.js`
- `editar-unidade` → `editar-unidade.bundle.js`
- `home` → `home.bundle.js`
- `notificacoes` → `notificacoes.bundle.js`
- `perfil` → `perfil.bundle.js`
- `registro-chamada` → `registro-chamada.bundle.js`
- `relatorios` → `relatorios.bundle.js`
- `senha` → `senha.bundle.js`
- `unidades-saude` → `unidades-saude.bundle.js`
- `visualizar-unidade` → `visualizar-unidade.bundle.js`

### Workflow de Desenvolvimento

#### 1. Desenvolvimento Ativo
```bash
# Para desenvolvimento com hot reload
npm run dev:watch
```

#### 2. Build de Teste
```bash
# Build rápido para testar
npm run build:dev
```

#### 3. Build de Produção
```bash
# Build otimizado para deploy
npm run build:all
```

#### 4. Integração com Django
```bash
# Após build, copiar arquivos estáticos
npm run collectstatic
```

## Como Adicionar Novos Componentes React

### Passo a Passo Completo

1. **Criar o componente**
   ```bash
   # Criar arquivo em static/js/components/
   touch static/js/components/MeuNovoComponente.js
   ```

2. **Criar entry point**
   ```bash
   # Criar entry point em static/js/entries/
   touch static/js/entries/meu-novo-componente.js
   ```

3. **Configurar entry point**
   ```javascript
   // static/js/entries/meu-novo-componente.js
   import React from 'react';
   import ReactDOM from 'react-dom';
   import MeuNovoComponente from '../components/MeuNovoComponente.js';
   
   window.MeuNovoComponente = MeuNovoComponente;
   ```

4. **Adicionar ao webpack.config.js**
   ```javascript
   entry: {
     // ... outros entries
     'meu-novo-componente': './static/js/entries/meu-novo-componente.js'
   }
   ```

5. **Compilar**
   ```bash
   npm run build:dev
   ```

6. **Usar no template Django**
   ```html
   <script src="{% static 'js/dist/meu-novo-componente.bundle.js' %}"></script>
   ```

## Páginas que usam React

- `/accounts/lista-telefonica/` - Lista telefônica com React

## Funcionalidades do React Implementadas

### Lista Telefônica
- ✅ Busca em tempo real
- ✅ Filtros por tipo de unidade
- ✅ Filtros por município
- ✅ Cards responsivos
- ✅ Estados de loading
- ✅ Estados vazios
- ✅ Links para ligação direta
- ✅ Visualização de detalhes

### Próximas Implementações
- [ ] Formulários dinâmicos
- [ ] Modais interativos
- [ ] Gráficos e estatísticas
- [ ] Notificações em tempo real

## Troubleshooting

### Node.js não encontrado
```powershell
$env:PATH += ";C:\Program Files\nodejs"
```

### Erro de compilação
1. Verifique se todas as dependências estão instaladas
2. Execute `npm install` novamente
3. Verifique a sintaxe dos arquivos JS

### Bundle não atualiza
1. Pare o processo de watch (Ctrl+C)
2. Execute `npm run build` para compilar uma vez
3. Execute `npm run watch` para reativar o watch

### Problemas com Scripts de Build

#### Erro "comando não encontrado" no Windows
```bash
# Se npm run clean falhar, execute manualmente:
rmdir /s /q static\js\dist

# Ou use PowerShell:
Remove-Item -Recurse -Force static\js\dist
```

#### Build falha com erro de memória
```bash
# Aumentar limite de memória do Node.js
set NODE_OPTIONS=--max-old-space-size=4096
npm run build:prod
```

#### Arquivos não são copiados pelo collectstatic
1. Verifique se o build foi executado: `npm run build`
2. Verifique se os arquivos estão em `static/js/dist/`
3. Execute: `python manage.py collectstatic --clear --noinput`

#### Watch mode não detecta mudanças
1. Pare o processo atual (Ctrl+C)
2. Limpe os arquivos: `npm run clean`
3. Reinicie: `npm run dev:watch`

## Comandos Úteis

### Comandos Essenciais
```bash
# Verificar versão do Node.js
node --version

# Verificar versão do npm
npm --version

# Instalar dependências
npm install
```

### Comandos de Build
```bash
# Build completo para produção (recomendado)
npm run build:all

# Build rápido para desenvolvimento
npm run build:dev

# Desenvolvimento com watch (recomendado para dev)
npm run dev:watch

# Limpar arquivos compilados
npm run clean
```

### Comandos de Integração Django
```bash
# Copiar arquivos estáticos após build
npm run collectstatic

# Workflow completo de deploy
npm run build:all && npm run collectstatic
```

### Comandos de Manutenção
```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules && npm install

# Verificar problemas de dependências
npm audit
```

## Resumo do Workflow

### Para Desenvolvimento Diário
1. `npm run dev:watch` - Inicia watch mode
2. Edite os componentes React
3. Os arquivos são recompilados automaticamente

### Para Deploy/Produção
1. `npm run build:all` - Build otimizado
2. `npm run collectstatic` - Copia para Django
3. Reinicie o servidor Django

### Para Adicionar Novo Componente
1. Crie o componente em `static/js/components/`
2. Crie entry point em `static/js/entries/`
3. Adicione ao `webpack.config.js`
4. Execute `npm run build:dev` para testar 