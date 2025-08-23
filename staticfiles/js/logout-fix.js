/**
 * Script para corrigir o problema do logout abrindo em nova janela
 * Este script garante que o logout funcione sempre na mesma janela
 */

(function() {
    'use strict';
    
    // Função para configurar o logout corretamente
    function setupLogout() {
        console.log('🔐 Configurando logout...');
        
        // Aguardar o DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupLogout);
            return;
        }
        
        // Buscar o formulário de logout
        const logoutForm = document.getElementById('logout-form');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (!logoutForm) {
            console.warn('⚠️ Formulário de logout não encontrado');
            return;
        }
        
        if (!logoutBtn) {
            console.warn('⚠️ Botão de logout não encontrado');
            return;
        }
        
        console.log('✅ Elementos de logout encontrados');
        
        // Garantir que o formulário tenha target="_self"
        logoutForm.setAttribute('target', '_self');
        
        // Remover qualquer target que possa estar causando problema
        logoutForm.removeAttribute('target');
        
        // Adicionar listener para o formulário
        logoutForm.addEventListener('submit', function(e) {
            console.log('🔐 Formulário de logout submetido');
            
            // Garantir que não abra em nova janela
            this.setAttribute('target', '_self');
            
            // Log para debug
            console.log('🔐 Redirecionando para:', this.action);
            console.log('🔐 Target definido como:', this.getAttribute('target'));
            
            // Permitir que o formulário seja enviado normalmente
            return true;
        });
        
        // Adicionar listener para o botão
        logoutBtn.addEventListener('click', function(e) {
            console.log('🔐 Botão de logout clicado');
            
            // Garantir que o formulário tenha target="_self"
            logoutForm.setAttribute('target', '_self');
            
            // Não prevenir o comportamento padrão
            return true;
        });
        
        // Também interceptar qualquer tentativa de abrir em nova janela
        const originalOpen = window.open;
        window.open = function(url, target, features) {
            // Se for o logout, forçar target="_self"
            if (url && url.includes('logout')) {
                console.log('🔐 Interceptando window.open para logout, redirecionando na mesma janela');
                window.location.href = url;
                return null;
            }
            
            // Para outros casos, usar comportamento padrão
            return originalOpen.call(this, url, target, features);
        };
        
        console.log('✅ Logout configurado com sucesso');
        
        // Verificar se há algum link ou botão que possa estar causando problema
        const allLogoutElements = document.querySelectorAll('[href*="logout"], [action*="logout"]');
        allLogoutElements.forEach(element => {
            if (element.tagName === 'A') {
                element.setAttribute('target', '_self');
                console.log('🔐 Link de logout corrigido:', element);
            }
        });
    }
    
    // Executar imediatamente se possível
    setupLogout();
    
    // Também executar quando a página estiver completamente carregada
    window.addEventListener('load', setupLogout);
    
    // Executar periodicamente para garantir que funcione mesmo com carregamento dinâmico
    setInterval(setupLogout, 5000);
    
    console.log('🔐 Script de correção do logout carregado');
})();




