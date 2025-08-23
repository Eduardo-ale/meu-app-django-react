/**
 * Utilitários para formatação e validação de telefones brasileiros
 */

class TelefoneUtils {
    /**
     * Remove todos os caracteres não numéricos
     */
    static limpar(telefone) {
        return telefone ? telefone.replace(/\D/g, '') : '';
    }

    /**
     * Formata telefone brasileiro para exibição
     */
    static formatar(telefone) {
        if (!telefone) return '';
        
        const numbers = this.limpar(telefone);
        
        if (numbers.length === 11) {  // Celular: (XX) 9XXXX-XXXX
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
        } else if (numbers.length === 10) {  // Fixo: (XX) XXXX-XXXX
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
        } else if (numbers.length === 9) {  // Celular sem DDD: 9XXXX-XXXX
            return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
        } else if (numbers.length === 8) {  // Fixo sem DDD: XXXX-XXXX
            return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
        }
        
        return telefone; // Retorna original se não conseguir formatar
    }

    /**
     * Aplica máscara durante a digitação
     */
    static aplicarMascara(value) {
        const numbers = this.limpar(value);
        
        if (numbers.length <= 2) {
            return numbers.length > 0 ? `(${numbers}` : numbers;
        } else if (numbers.length <= 6) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        } else if (numbers.length <= 10) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
        } else {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
        }
    }

    /**
     * Valida se o telefone está em formato válido
     */
    static validar(telefone) {
        const numbers = this.limpar(telefone);
        return numbers.length >= 10 && numbers.length <= 11;
    }

    /**
     * Cria link para chamada telefônica
     */
    static criarLink(telefone) {
        const numbers = this.limpar(telefone);
        return numbers ? `tel:+55${numbers}` : '';
    }

    /**
     * Aplica formatação automática a um campo de input
     */
    static aplicarFormatacaoAutomatica(input) {
        if (!input) return;

        input.addEventListener('input', function(e) {
            const cursorPos = e.target.selectionStart;
            const oldValue = e.target.value;
            const newValue = TelefoneUtils.aplicarMascara(oldValue);
            
            e.target.value = newValue;
            
            // Ajustar posição do cursor
            let newCursorPos = cursorPos;
            if (newValue.length > oldValue.length) {
                newCursorPos = cursorPos + (newValue.length - oldValue.length);
            }
            
            e.target.setSelectionRange(newCursorPos, newCursorPos);
        });

        // Validação visual
        input.addEventListener('blur', function(e) {
            const isValid = TelefoneUtils.validar(e.target.value);
            
            if (e.target.value && !isValid) {
                e.target.classList.add('telefone-invalido');
                e.target.classList.remove('telefone-valido');
            } else if (e.target.value) {
                e.target.classList.add('telefone-valido');
                e.target.classList.remove('telefone-invalido');
            } else {
                e.target.classList.remove('telefone-invalido', 'telefone-valido');
            }
        });
    }

    /**
     * Inicializa formatação automática para todos os campos de telefone da página
     */
    static inicializar() {
        document.addEventListener('DOMContentLoaded', function() {
            // Selecionar campos de telefone comuns
            const seletores = [
                'input[name="telefone"]',
                'input[name*="telefone"]',
                'input[type="tel"]',
                'input.telefone',
                'input[placeholder*="telefone" i]',
                'input[placeholder*="celular" i]'
            ];

            seletores.forEach(seletor => {
                document.querySelectorAll(seletor).forEach(input => {
                    TelefoneUtils.aplicarFormatacaoAutomatica(input);
                });
            });
        });
    }

    /**
     * Cria elemento visual melhorado para telefone
     */
    static criarElementoVisual(telefone, options = {}) {
        const {
            clicavel = true,
            copiavel = true,
            tamanho = 'normal' // 'pequeno', 'normal', 'grande'
        } = options;

        const container = document.createElement('div');
        container.className = `telefone-visual telefone-visual-${tamanho}`;

        const telefoneFormatado = this.formatar(telefone);
        const link = this.criarLink(telefone);

        let html = '';

        if (clicavel) {
            html = `
                <a href="${link}" class="telefone-link-visual" title="Clique para ligar">
                    <div class="telefone-icon-visual">
                        <i class="fas fa-phone"></i>
                    </div>
                    <div class="telefone-info-visual">
                        <span class="telefone-numero-visual">${telefoneFormatado}</span>
                        <span class="telefone-acao-visual">Clique para ligar</span>
                    </div>
                </a>
            `;
        } else {
            html = `
                <div class="telefone-display-visual">
                    <div class="telefone-icon-visual">
                        <i class="fas fa-phone"></i>
                    </div>
                    <span class="telefone-numero-visual">${telefoneFormatado}</span>
                </div>
            `;
        }

        container.innerHTML = html;

        // Adicionar funcionalidade de copiar
        if (copiavel) {
            container.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                TelefoneUtils.copiarTelefone(telefoneFormatado);
            });
            
            const elemento = container.querySelector('.telefone-link-visual, .telefone-display-visual');
            elemento.title += ' (Clique direito para copiar)';
        }

        return container;
    }

    /**
     * Copia telefone para a área de transferência
     */
    static copiarTelefone(telefone) {
        navigator.clipboard.writeText(telefone).then(function() {
            TelefoneUtils.mostrarToast('Telefone copiado!', 'sucesso');
        }).catch(function() {
            TelefoneUtils.mostrarToast('Erro ao copiar telefone', 'erro');
        });
    }

    /**
     * Mostra toast de feedback
     */
    static mostrarToast(mensagem, tipo = 'sucesso') {
        const toast = document.createElement('div');
        toast.textContent = mensagem;
        
        const cores = {
            sucesso: '#10b981',
            erro: '#ef4444',
            aviso: '#f59e0b',
            info: '#3b82f6'
        };

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${cores[tipo] || cores.sucesso};
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            z-index: 9999;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease-out forwards;
        `;

        // Adicionar animação CSS
        if (!document.querySelector('#telefone-toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'telefone-toast-styles';
            styles.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// CSS para validação visual
const telefoneStyles = document.createElement('style');
telefoneStyles.textContent = `
    .telefone-invalido {
        border-color: #ef4444 !important;
        background-color: #fef2f2 !important;
    }
    
    .telefone-valido {
        border-color: #10b981 !important;
        background-color: #f0fdf4 !important;
    }

    .telefone-visual {
        display: inline-block;
    }

    .telefone-link-visual,
    .telefone-display-visual {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        border-radius: 6px;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s ease;
        background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
        border: 1px solid #e2e8f0;
    }

    .telefone-link-visual:hover {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        text-decoration: none;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .telefone-icon-visual {
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        flex-shrink: 0;
    }

    .telefone-link-visual:hover .telefone-icon-visual {
        background: white;
        color: #3b82f6;
    }

    .telefone-numero-visual {
        font-weight: 600;
        font-family: 'Courier New', monospace;
        font-size: 0.85rem;
    }

    .telefone-acao-visual {
        font-size: 0.7rem;
        opacity: 0.7;
        font-weight: 500;
    }

    .telefone-visual-pequeno .telefone-icon-visual {
        width: 20px;
        height: 20px;
        font-size: 0.6rem;
    }

    .telefone-visual-pequeno .telefone-numero-visual {
        font-size: 0.75rem;
    }

    .telefone-visual-grande .telefone-icon-visual {
        width: 32px;
        height: 32px;
        font-size: 0.8rem;
    }

    .telefone-visual-grande .telefone-numero-visual {
        font-size: 1rem;
    }
`;

document.head.appendChild(telefoneStyles);

// Inicializar automaticamente
TelefoneUtils.inicializar();

// Exportar para uso global
window.TelefoneUtils = TelefoneUtils; 