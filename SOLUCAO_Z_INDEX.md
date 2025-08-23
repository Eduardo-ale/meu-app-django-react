# Solução para Problema de Z-Index no Dropdown de Exportação

## Problema Identificado

O dropdown de opções de exportação (PDF, CSV, Excel) estava sendo renderizado atrás dos cards das unidades de saúde, tornando-o inacessível ou parcialmente oculto quando o zoom do navegador estava em 100%.

## Causa Raiz

O problema ocorria devido a conflitos de `z-index` entre elementos da página:
- Os cards das unidades de saúde tinham `z-index` alto ou não definido
- O dropdown de exportação tinha `z-index` baixo
- Elementos com `z-index` maior aparecem na frente de elementos com `z-index` menor

## Solução Implementada

### 1. Arquivo CSS Dedicado (`static/css/z-index-fixes.css`)

Criamos um arquivo CSS específico para resolver problemas de z-index:

```css
/* Prioridade máxima para o modal de exportação */
.export-modal-overlay {
    z-index: 999999999 !important;
    position: fixed !important;
    isolation: isolate !important;
    will-change: transform !important;
    backface-visibility: hidden !important;
    contain: layout style paint !important;
    transform: translateZ(999999999px) !important;
}

/* Z-index baixo para elementos da página */
.unidade-card,
.unidades-grid,
.page-header-modern,
.actions-bar {
    z-index: 1 !important;
    position: relative !important;
}
```

### 2. Modal em Tela Cheia

Substituímos o dropdown tradicional por um modal que cobre toda a tela:

```html
<div class="export-modal-overlay" id="exportModalOverlay">
    <div class="export-modal-content">
        <!-- Opções de exportação -->
    </div>
</div>
```

### 3. JavaScript Robusto

Implementamos funções JavaScript que garantem z-index correto:

```javascript
function ajustarZIndexPorZoom() {
    const modal = document.getElementById('exportModalOverlay');
    
    // Força z-index máximo para o modal
    modal.style.setProperty('z-index', '999999999', 'important');
    modal.style.setProperty('position', 'fixed', 'important');
    modal.style.setProperty('transform', 'translateZ(999999999px)', 'important');
    
    // Força z-index baixo para outros elementos
    const elementosParaReduzirZIndex = ['.unidade-card', '.unidades-grid', ...];
    elementosParaReduzirZIndex.forEach(seletor => {
        const elementos = document.querySelectorAll(seletor);
        elementos.forEach(elemento => {
            elemento.style.setProperty('z-index', '1', 'important');
        });
    });
}
```

### 4. Monitoramento Contínuo

Adicionamos listeners para diferentes eventos que podem afetar o z-index:

```javascript
// Monitorar mudanças de zoom e redimensionamento
window.addEventListener('resize', garantirZIndexCorreto);
window.addEventListener('scroll', garantirZIndexCorreto);

// Monitorar mudanças de zoom (para diferentes navegadores)
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', garantirZIndexCorreto);
}

// Verificar z-index periodicamente
setInterval(() => {
    const modal = document.getElementById('exportModalOverlay');
    if (modal && modal.classList.contains('show')) {
        garantirZIndexCorreto();
    }
}, 1000);
```

## Características da Solução

### ✅ **Robustez**
- Usa `!important` para sobrescrever qualquer CSS conflitante
- Aplica z-index máximo (`999999999`) para o modal
- Aplica z-index mínimo (`1`) para todos os outros elementos

### ✅ **Compatibilidade**
- Funciona em diferentes navegadores (Chrome, Firefox, Safari, Edge)
- Suporta diferentes níveis de zoom (100%, 125%, 150%, etc.)
- Funciona em diferentes resoluções de tela

### ✅ **Performance**
- Usa `transform: translateZ()` para forçar renderização em GPU
- Implementa `isolation: isolate` para criar contexto de empilhamento separado
- Usa `will-change: transform` para otimizar animações

### ✅ **Manutenibilidade**
- Código organizado em arquivos separados
- Comentários explicativos em português
- Estrutura modular e reutilizável

## Como Testar

1. Acesse a página `http://127.0.0.1:8000/accounts/unidades-saude/`
2. Configure o zoom do navegador para 100%
3. Clique no botão "Exportar"
4. Verifique se o modal aparece por cima de todos os cards
5. Teste em diferentes níveis de zoom (125%, 150%, etc.)

## Arquivos Modificados

- `templates/unidades_saude.html` - Template principal com modal
- `static/css/z-index-fixes.css` - CSS dedicado para correções de z-index
- `test_z_index_fix.html` - Arquivo de teste para verificar a solução

## Resultado Esperado

✅ O dropdown de exportação agora aparece sempre na frente dos cards das unidades de saúde
✅ Funciona em todos os níveis de zoom do navegador
✅ Compatível com diferentes navegadores e resoluções
✅ Interface mais intuitiva com modal em tela cheia

## Suporte Técnico

Se ainda houver problemas com z-index, verifique:

1. Se o arquivo `z-index-fixes.css` está sendo carregado
2. Se não há CSS conflitante sendo aplicado via JavaScript
3. Se o navegador suporta as propriedades CSS utilizadas
4. Se há elementos com `position: fixed` interferindo

## Próximos Passos

- Aplicar a mesma solução para outros dropdowns do sistema
- Criar um sistema de componentes reutilizável para modais
- Implementar testes automatizados para z-index
- Documentar padrões de z-index para o projeto

