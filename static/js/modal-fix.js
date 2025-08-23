/**
 * Script de correção para modais do Bootstrap
 * Garante que os modais funcionem corretamente em todos os navegadores
 */

(function() {
    'use strict';
    
    // Aguardar o DOM estar completamente carregado
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔧 Iniciando correções para modais...');
        
        // Verificar se o Bootstrap está disponível
        if (typeof bootstrap === 'undefined') {
            console.warn('⚠️ Bootstrap não encontrado. Aplicando correções básicas...');
            applyBasicModalFix();
            return;
        }
        
        // Aplicar correções específicas para modais
        applyBootstrapModalFix();
    });
    
    function applyBootstrapModalFix() {
        // Encontrar todos os modais na página
        const modals = document.querySelectorAll('.modal');
        
        modals.forEach(function(modal) {
            // Garantir que o modal tenha os atributos corretos
            if (!modal.hasAttribute('tabindex')) {
                modal.setAttribute('tabindex', '-1');
            }
            
            // Adicionar event listeners para limpeza
            modal.addEventListener('show.bs.modal', function(event) {
                console.log('🔴 Modal abrindo:', modal.id);
                
                // Esconder outros overlays
                hideConflictingOverlays();
                
                // Garantir z-index correto
                fixModalZIndex(modal);
            });
            
            modal.addEventListener('hidden.bs.modal', function(event) {
                console.log('🟢 Modal fechado:', modal.id);
                
                // Restaurar overlays
                restoreOverlays();
                
                // Limpeza adicional
                cleanupModalBackdrop();
            });
            
            // Garantir que botões de fechar funcionem
            const closeButtons = modal.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
            closeButtons.forEach(function(button) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('🔴 Botão de fechar clicado para modal:', modal.id);
                    
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                });
            });
        });
        
        // Listener global para ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal.show');
                openModals.forEach(function(modal) {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                });
            }
        });
    }
    
    function applyBasicModalFix() {
        // Fallback para quando o Bootstrap não está disponível
        const modals = document.querySelectorAll('.modal');
        
        modals.forEach(function(modal) {
            const closeButtons = modal.querySelectorAll('.btn-close, [data-dismiss="modal"]');
            
            closeButtons.forEach(function(button) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    modal.style.display = 'none';
                    modal.classList.remove('show');
                    document.body.classList.remove('modal-open');
                    
                    // Remover backdrop
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                });
            });
        });
    }
    
    function hideConflictingOverlays() {
        const overlays = [
            '.sidebar-overlay',
            '.period-modal-overlay',
            '.dark-overlay',
            '.assistant-modal-overlay'
        ];
        
        overlays.forEach(function(selector) {
            const overlay = document.querySelector(selector);
            if (overlay) {
                overlay.style.display = 'none';
            }
        });
    }
    
    function restoreOverlays() {
        const overlays = [
            '.sidebar-overlay',
            '.period-modal-overlay',
            '.dark-overlay',
            '.assistant-modal-overlay'
        ];
        
        overlays.forEach(function(selector) {
            const overlay = document.querySelector(selector);
            if (overlay) {
                overlay.style.display = '';
            }
        });
    }
    
    function fixModalZIndex(modal) {
        // Garantir que o modal tenha o z-index correto
        modal.style.zIndex = '9999';
        
        // Garantir que o backdrop tenha z-index menor
        setTimeout(function() {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.style.zIndex = '9998';
            }
        }, 50);
    }
    
    function cleanupModalBackdrop() {
        // Remover backdrops órfãos
        const backdrops = document.querySelectorAll('.modal-backdrop');
        const openModals = document.querySelectorAll('.modal.show');
        
        if (openModals.length === 0) {
            backdrops.forEach(function(backdrop) {
                backdrop.remove();
            });
        }
    }
    
    // Função global para depuração
    window.debugModals = function() {
        console.log('🔍 Informações de depuração dos modais:');
        
        const modals = document.querySelectorAll('.modal');
        console.log('Total de modais encontrados:', modals.length);
        
        modals.forEach(function(modal, index) {
            console.log(`Modal ${index + 1}:`, {
                id: modal.id,
                classes: modal.className,
                visible: modal.classList.contains('show'),
                zIndex: window.getComputedStyle(modal).zIndex,
                display: window.getComputedStyle(modal).display
            });
        });
        
        const backdrops = document.querySelectorAll('.modal-backdrop');
        console.log('Backdrops encontrados:', backdrops.length);
        
        backdrops.forEach(function(backdrop, index) {
            console.log(`Backdrop ${index + 1}:`, {
                classes: backdrop.className,
                zIndex: window.getComputedStyle(backdrop).zIndex
            });
        });
    };
    
    console.log('✅ Script de correção para modais carregado com sucesso!');
})(); 