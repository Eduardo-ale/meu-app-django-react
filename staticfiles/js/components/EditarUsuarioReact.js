// EditarUsuarioReact.js - Componente React para Edição de Usuário
class EditarUsuarioReact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                username: this.props.user?.username || '',
                email: this.props.user?.email || '',
                first_name: this.props.user?.first_name || '',
                last_name: this.props.user?.last_name || '',
                is_active: this.props.user?.is_active || false,
                is_staff: this.props.user?.is_staff || false
            },
            errors: {},
            isSubmitting: false,
            hasChanges: false,
            showConfirmCancel: false
        };
    }

    componentDidMount() {
        console.log('✅ Componente EditarUsuarioReact iniciado');
        this.initializeAnimations();
        
        // Detectar mudanças não salvas
        window.addEventListener('beforeunload', this.handleBeforeUnload);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }

    handleBeforeUnload = (e) => {
        if (this.state.hasChanges) {
            e.preventDefault();
            e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
            return e.returnValue;
        }
    }

    initializeAnimations = () => {
        // Animação de entrada para o formulário
        const formContainer = document.querySelector('.edit-form-container');
        if (formContainer) {
            formContainer.style.opacity = '0';
            formContainer.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                formContainer.style.transition = 'all 0.6s ease';
                formContainer.style.opacity = '1';
                formContainer.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    handleInputChange = (field, value) => {
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [field]: value
            },
            hasChanges: true,
            errors: {
                ...prevState.errors,
                [field]: null // Limpar erro do campo
            }
        }));
    }

    handleSwitchToggle = (field) => {
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [field]: !prevState.formData[field]
            },
            hasChanges: true
        }));
    }

    validateForm = () => {
        const { formData } = this.state;
        const errors = {};

        // Validações obrigatórias
        if (!formData.first_name.trim()) {
            errors.first_name = 'Nome é obrigatório';
        }

        if (!formData.username.trim()) {
            errors.username = 'Nome de usuário é obrigatório';
        } else if (formData.username.length < 3) {
            errors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            errors.username = 'Nome de usuário deve conter apenas letras, números e _';
        }

        // Validação de email
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Email deve ter um formato válido';
        }

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!this.validateForm()) {
            this.showNotification('Corrija os erros antes de continuar', 'error');
            return;
        }

        this.setState({ isSubmitting: true });

        try {
            const formData = new FormData();
            formData.append('csrfmiddlewaretoken', this.props.csrfToken);
            
            Object.keys(this.state.formData).forEach(key => {
                if (key === 'is_active' || key === 'is_staff') {
                    if (this.state.formData[key]) {
                        formData.append(key, 'on');
                    }
                } else {
                    formData.append(key, this.state.formData[key]);
                }
            });

            const response = await fetch(this.props.submitUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                this.setState({ hasChanges: false });
                this.showNotification('Usuário atualizado com sucesso!', 'success');
                
                // Redirecionar após 2 segundos
                setTimeout(() => {
                    window.location.href = this.props.cancelUrl;
                }, 2000);
            } else {
                const data = await response.text();
                // Tentar extrair mensagem de erro do HTML
                if (data.includes('já existe') || data.includes('já está em uso')) {
                    this.showNotification('Nome de usuário ou email já está em uso', 'error');
                } else {
                    this.showNotification('Erro ao atualizar usuário', 'error');
                }
            }
        } catch (error) {
            console.error('Erro ao submeter formulário:', error);
            this.showNotification('Erro de conexão. Tente novamente.', 'error');
        } finally {
            this.setState({ isSubmitting: false });
        }
    }

    handleCancel = () => {
        if (this.state.hasChanges) {
            this.setState({ showConfirmCancel: true });
        } else {
            window.location.href = this.props.cancelUrl;
        }
    }

    confirmCancel = () => {
        this.setState({ hasChanges: false });
        window.location.href = this.props.cancelUrl;
    }

    showNotification = (message, type = 'info') => {
        // Criar notificação dinâmica
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;
        notification.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                                type === 'error' ? 'fa-exclamation-circle' : 
                                'fa-info-circle'}"></i>
            </div>
            <div class="toast-content">${message}</div>
            <button type="button" class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Adicionar à área de notificações
        let notificationsArea = document.querySelector('.notifications-premium');
        if (!notificationsArea) {
            notificationsArea = document.createElement('div');
            notificationsArea.className = 'notifications-premium';
            document.querySelector('.content-wrapper').prepend(notificationsArea);
        }

        notificationsArea.appendChild(notification);

        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    render() {
        const { formData, errors, isSubmitting, showConfirmCancel } = this.state;
        const { user } = this.props;

        return (
            <div className="edit-form-container">
                {/* Loading Overlay */}
                {isSubmitting && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                )}

                {/* Header do Formulário */}
                <div className="form-header">
                    <h2 className="form-title">
                        <i className="fas fa-user-edit"></i>
                        Editar Informações do Usuário
                    </h2>
                    <p className="form-subtitle">
                        Atualize as informações básicas e permissões do usuário
                    </p>
                </div>

                {/* Corpo do Formulário */}
                <form onSubmit={this.handleSubmit} className="form-body">
                    {/* Grid de Campos */}
                    <div className="form-grid">
                        {/* Nome */}
                        <div className="input-group-premium">
                            <label className="input-label-premium">
                                <i className="fas fa-user"></i>
                                Nome *
                            </label>
                            <div className="input-wrapper-premium">
                                <input
                                    type="text"
                                    className={`input-premium ${errors.first_name ? 'error' : ''}`}
                                    value={formData.first_name}
                                    onChange={(e) => this.handleInputChange('first_name', e.target.value)}
                                    placeholder="Digite o nome"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.first_name && (
                                <div className="input-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.first_name}
                                </div>
                            )}
                        </div>

                        {/* Sobrenome */}
                        <div className="input-group-premium">
                            <label className="input-label-premium">
                                <i className="fas fa-user"></i>
                                Sobrenome
                            </label>
                            <div className="input-wrapper-premium">
                                <input
                                    type="text"
                                    className="input-premium"
                                    value={formData.last_name}
                                    onChange={(e) => this.handleInputChange('last_name', e.target.value)}
                                    placeholder="Digite o sobrenome"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div className="input-group-premium">
                            <label className="input-label-premium">
                                <i className="fas fa-at"></i>
                                Nome de Usuário *
                            </label>
                            <div className="input-wrapper-premium">
                                <input
                                    type="text"
                                    className={`input-premium ${errors.username ? 'error' : ''}`}
                                    value={formData.username}
                                    onChange={(e) => this.handleInputChange('username', e.target.value)}
                                    placeholder="Digite o nome de usuário"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.username && (
                                <div className="input-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.username}
                                </div>
                            )}
                            <div className="input-help">
                                Usado para fazer login no sistema
                            </div>
                        </div>

                        {/* Email */}
                        <div className="input-group-premium">
                            <label className="input-label-premium">
                                <i className="fas fa-envelope"></i>
                                Email
                            </label>
                            <div className="input-wrapper-premium">
                                <input
                                    type="email"
                                    className={`input-premium ${errors.email ? 'error' : ''}`}
                                    value={formData.email}
                                    onChange={(e) => this.handleInputChange('email', e.target.value)}
                                    placeholder="Digite o email"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.email && (
                                <div className="input-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.email}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Seção de Permissões */}
                    <div className="switch-group">
                        <div className="switch-item">
                            <div className="switch-info">
                                <div className="switch-label">Usuário Ativo</div>
                                <div className="switch-description">
                                    Permite que o usuário faça login no sistema
                                </div>
                            </div>
                            <button
                                type="button"
                                className={`switch-premium ${formData.is_active ? 'active' : ''}`}
                                onClick={() => this.handleSwitchToggle('is_active')}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="switch-item">
                            <div className="switch-info">
                                <div className="switch-label">Administrador</div>
                                <div className="switch-description">
                                    Concede acesso administrativo e gerenciamento de usuários
                                </div>
                            </div>
                            <button
                                type="button"
                                className={`switch-premium ${formData.is_staff ? 'active' : ''}`}
                                onClick={() => this.handleSwitchToggle('is_staff')}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Informações do Sistema */}
                    <div className="system-info-section">
                        <div className="system-info-title">
                            <i className="fas fa-info-circle"></i>
                            Informações do Sistema
                        </div>
                        <div className="system-info-grid">
                            <div className="system-info-item">
                                <div className="system-info-icon">
                                    <i className="fas fa-calendar-plus"></i>
                                </div>
                                <div className="system-info-content">
                                    <div className="system-info-label">Data de Cadastro</div>
                                    <div className="system-info-value">{user?.date_joined}</div>
                                </div>
                            </div>

                            <div className="system-info-item">
                                <div className="system-info-icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <div className="system-info-content">
                                    <div className="system-info-label">Último Login</div>
                                    <div className="system-info-value">
                                        {user?.last_login || 'Nunca fez login'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Ações do Formulário */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="action-btn-premium secondary"
                        onClick={this.handleCancel}
                        disabled={isSubmitting}
                    >
                        <i className="fas fa-arrow-left"></i>
                        Cancelar
                    </button>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            className="action-btn-premium danger"
                            onClick={() => this.showNotification('Funcionalidade em desenvolvimento', 'info')}
                            disabled={isSubmitting}
                        >
                            <i className="fas fa-key"></i>
                            Redefinir Senha
                        </button>

                        <button
                            type="submit"
                            className="action-btn-premium primary"
                            onClick={this.handleSubmit}
                            disabled={isSubmitting || !this.state.hasChanges}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save"></i>
                                    Salvar Alterações
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Modal de Confirmação de Cancelamento */}
                {showConfirmCancel && (
                    <div className="modal-overlay-react active" onClick={() => this.setState({ showConfirmCancel: false })}>
                        <div className="modal-content-react" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header-react">
                                <div className="modal-icon-react">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                                <div className="modal-title-section-react">
                                    <h5>Descartar Alterações?</h5>
                                    <p>Você tem alterações não salvas</p>
                                </div>
                                <button 
                                    className="modal-close-btn-react"
                                    onClick={() => this.setState({ showConfirmCancel: false })}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="modal-body-react">
                                <p>
                                    Se você sair agora, todas as alterações feitas serão perdidas. 
                                    Deseja realmente continuar?
                                </p>
                            </div>
                            <div className="modal-footer-react">
                                <button 
                                    className="btn-react btn-secondary-react"
                                    onClick={() => this.setState({ showConfirmCancel: false })}
                                >
                                    <i className="fas fa-times"></i>
                                    Continuar Editando
                                </button>
                                <button 
                                    className="btn-react btn-danger-react"
                                    onClick={this.confirmCancel}
                                >
                                    <i className="fas fa-trash"></i>
                                    Descartar Alterações
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

// Estilos adicionais para o modal
const modalStyles = document.createElement('style');
modalStyles.textContent = `
.modal-overlay-react {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.modal-overlay-react.active {
    opacity: 1;
    visibility: visible;
}

.modal-content-react {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    transform: scale(0.9);
    transition: all 0.3s ease;
}

.modal-overlay-react.active .modal-content-react {
    transform: scale(1);
}

.modal-header-react {
    padding: 2rem 2rem 1rem 2rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    border-bottom: 1px solid rgba(226, 232, 240, 0.3);
}

.modal-icon-react {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #dc2626;
    font-size: 1.8rem;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.modal-title-section-react {
    flex: 1;
}

.modal-title-section-react h5 {
    margin: 0;
    color: #111827;
    font-weight: 600;
    font-size: 1.3rem;
}

.modal-title-section-react p {
    margin: 0.5rem 0 0 0;
    color: #6b7280;
    font-size: 0.9rem;
}

.modal-close-btn-react {
    width: 36px;
    height: 36px;
    border: none;
    background: rgba(107, 114, 128, 0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    transition: all 0.3s ease;
    cursor: pointer;
}

.modal-close-btn-react:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.modal-body-react {
    padding: 1rem 2rem;
}

.modal-body-react p {
    margin: 0;
    color: #374151;
    line-height: 1.6;
    font-size: 1rem;
}

.modal-footer-react {
    padding: 1rem 2rem 2rem 2rem;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.btn-react {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-secondary-react {
    background: #f3f4f6;
    color: #374151;
}

.btn-secondary-react:hover {
    background: #e5e7eb;
    transform: translateY(-1px);
}

.btn-danger-react {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: white;
}

.btn-danger-react:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}
`;

if (!document.querySelector('#modal-styles')) {
    modalStyles.id = 'modal-styles';
    document.head.appendChild(modalStyles);
}

// Função de renderização
function renderEditarUsuarioReact() {
    console.log('🔍 Debug - Tentando renderizar EditarUsuarioReact');
    console.log('🔍 Debug - Dados:', window.editUserData);
    
    const container = document.getElementById('edit-user-react-root');
    console.log('🔍 Debug - Container encontrado:', container);
    
    if (container && window.editUserData && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
        console.log('✅ Todos os requisitos atendidos, inicializando React...');
        const root = ReactDOM.createRoot ? ReactDOM.createRoot(container) : null;
        
        if (root) {
            // React 18
            console.log('✅ Renderizando com React 18');
            root.render(React.createElement(EditarUsuarioReact, window.editUserData));
        } else {
            // React 17
            console.log('✅ Renderizando com React 17');
            ReactDOM.render(
                React.createElement(EditarUsuarioReact, window.editUserData),
                container
            );
        }
    } else {
        console.error('❌ Erro: Container ou dados não encontrados', {
            container: container,
            dados: window.editUserData
        });
        
        // Fallback simples
        if (container) {
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center; background: white; border-radius: 12px; margin: 2rem;">
                    <div style="color: #dc2626; font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <h3 style="color: #374151; margin-bottom: 1rem;">Erro ao carregar formulário</h3>
                    <p style="color: #6b7280; margin-bottom: 2rem;">
                        Não foi possível carregar o formulário de edição.
                    </p>
                    <button onclick="window.location.reload()" style="
                        background: #3b82f6; 
                        color: white; 
                        padding: 0.75rem 1.5rem; 
                        border: none; 
                        border-radius: 8px; 
                        cursor: pointer;
                        font-weight: 500;
                    ">
                        🔄 Recarregar Página
                    </button>
                </div>
            `;
        }
    }
}

// Exportar o componente globalmente (para compatibilidade)
window.EditarUsuarioReact = EditarUsuarioReact;

// Exportar como módulo ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EditarUsuarioReact;
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderEditarUsuarioReact);
} else {
    renderEditarUsuarioReact();
}

// Export para ES6 modules
export default EditarUsuarioReact;

