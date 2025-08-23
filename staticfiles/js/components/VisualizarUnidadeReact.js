// VisualizarUnidadeReact.js - Componente React para visualizar unidade
class VisualizarUnidadeReact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            showShareModal: false,
            copied: false
        };
    }

    componentDidMount() {
        this.initializeAnimations();
    }

    initializeAnimations = () => {
        // Adicionar animações de entrada
        const sections = document.querySelectorAll('.info-section-react');
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.1}s`;
            section.classList.add('animate-slide-up');
        });
    }

    handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            this.setState({ copied: true });
            setTimeout(() => this.setState({ copied: false }), 2000);
        });
    }

    getTipoBadge = (tipo) => {
        const badges = {
            'UNIDADE_EXECUTANTE': {
                class: 'badge-success-react',
                icon: 'fas fa-hospital',
                text: 'Executante'
            },
            'UNIDADE_SOLICITANTE': {
                class: 'badge-info-react',
                icon: 'fas fa-phone-alt',
                text: 'Solicitante'
            },
            'EXECUTANTE_SOLICITANTE': {
                class: 'badge-warning-react',
                icon: 'fas fa-hospital-user',
                text: 'Executante/Solicitante'
            }
        };
        return badges[tipo] || badges['UNIDADE_EXECUTANTE'];
    }

    render() {
        const { unidade } = this.props;
        const { copied } = this.state;
        const badge = this.getTipoBadge(unidade?.tipo);

        if (!unidade) {
            return (
                <div className="loading-container-react">
                    <div className="loading-spinner-react">
                        <i className="fas fa-spinner fa-spin"></i>
                    </div>
                    <p>Carregando dados da unidade...</p>
                </div>
            );
        }

        return (
            <div className="visualizar-unidade-container">
                {/* Header Principal */}
                <div className="unidade-header-react">
                    <div className="header-background"></div>
                    <div className="header-content-react">
                        <div className="header-main-info">
                            <div className="unidade-avatar-react">
                                <i className="fas fa-hospital-alt"></i>
                            </div>
                            <div className="header-text-info">
                                <h1 className="unidade-title-react">{unidade.nome}</h1>
                                <p className="unidade-subtitle-react">
                                    <i className="fas fa-map-marker-alt"></i>
                                    {unidade.municipio || 'Localização não informada'}
                                </p>
                                <div className="unidade-metadata">
                                    <span className="metadata-item">
                                        <i className="fas fa-calendar-plus"></i>
                                        Cadastrado em {unidade.created_at || 'Data não disponível'}
                                    </span>
                                    {unidade.usuario_cadastrante && (
                                        <span className="metadata-item">
                                            <i className="fas fa-user-plus"></i>
                                            Por {unidade.usuario_cadastrante}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="header-actions-react">
                            <div className={`status-badge-react ${badge.class}`}>
                                <i className={badge.icon}></i>
                                <span>{badge.text}</span>
                            </div>
                            <div className="action-buttons-group">
                                <a 
                                    href={`/accounts/unidades-saude/${unidade.id}/editar/`}
                                    className="action-btn-react btn-primary-react"
                                    title="Editar unidade"
                                >
                                    <i className="fas fa-edit"></i>
                                    <span>Editar</span>
                                </a>
                                <button 
                                    className="action-btn-react btn-secondary-react"
                                    onClick={() => window.print()}
                                    title="Imprimir informações"
                                >
                                    <i className="fas fa-print"></i>
                                    <span>Imprimir</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid de Informações */}
                <div className="info-grid-react">
                    {/* Informações Básicas */}
                    <div className="info-section-react info-card-primary">
                        <div className="section-header-react">
                            <div className="section-icon-react">
                                <i className="fas fa-info-circle"></i>
                            </div>
                            <h3 className="section-title-react">Informações Básicas</h3>
                        </div>
                        <div className="info-list-react">
                            <div className="info-row-react">
                                <span className="info-label-react">Nome Completo:</span>
                                <span className="info-value-react">{unidade.nome}</span>
                            </div>
                            <div className="info-row-react">
                                <span className="info-label-react">Tipo:</span>
                                <span className={`info-value-react badge-inline ${badge.class}`}>
                                    <i className={badge.icon}></i>
                                    {badge.text}
                                </span>
                            </div>
                            <div className="info-row-react">
                                <span className="info-label-react">CNES:</span>
                                <span className="info-value-react">
                                    {unidade.cnes ? (
                                        <span className="copyable-text" onClick={() => this.handleCopyToClipboard(unidade.cnes)}>
                                            {unidade.cnes}
                                            <i className="fas fa-copy copy-icon"></i>
                                        </span>
                                    ) : (
                                        <span className="text-muted">Não informado</span>
                                    )}
                                </span>
                            </div>
                            <div className="info-row-react">
                                <span className="info-label-react">Município:</span>
                                <span className="info-value-react">{unidade.municipio || 'Não informado'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contato */}
                    <div className="info-section-react info-card-secondary">
                        <div className="section-header-react">
                            <div className="section-icon-react">
                                <i className="fas fa-phone-alt"></i>
                            </div>
                            <h3 className="section-title-react">Contato</h3>
                        </div>
                        <div className="info-list-react">
                            <div className="info-row-react">
                                <span className="info-label-react">Telefone:</span>
                                <span className="info-value-react">
                                    {unidade.telefone ? (
                                        <a href={`tel:${unidade.telefone}`} className="contact-link">
                                            <i className="fas fa-phone"></i>
                                            {unidade.telefone}
                                        </a>
                                    ) : (
                                        <span className="text-muted">Não informado</span>
                                    )}
                                </span>
                            </div>
                            <div className="info-row-react">
                                <span className="info-label-react">E-mail:</span>
                                <span className="info-value-react">
                                    {unidade.email ? (
                                        <a href={`mailto:${unidade.email}`} className="contact-link">
                                            <i className="fas fa-envelope"></i>
                                            {unidade.email}
                                        </a>
                                    ) : (
                                        <span className="text-muted">Não informado</span>
                                    )}
                                </span>
                            </div>
                            <div className="info-row-react">
                                <span className="info-label-react">Responsável:</span>
                                <span className="info-value-react">{unidade.responsavel || 'Não informado'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Localização */}
                    <div className="info-section-react info-card-accent">
                        <div className="section-header-react">
                            <div className="section-icon-react">
                                <i className="fas fa-map-marker-alt"></i>
                            </div>
                            <h3 className="section-title-react">Localização</h3>
                        </div>
                        <div className="info-list-react">
                            <div className="info-row-react address-row">
                                <span className="info-label-react">Endereço:</span>
                                <span className="info-value-react address-text">
                                    {unidade.endereco || 'Endereço não informado'}
                                </span>
                            </div>
                            <div className="info-row-react">
                                <span className="info-label-react">Município:</span>
                                <span className="info-value-react">{unidade.municipio || 'Não informado'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Funcionamento */}
                    <div className="info-section-react info-card-warning">
                        <div className="section-header-react">
                            <div className="section-icon-react">
                                <i className="fas fa-clock"></i>
                            </div>
                            <h3 className="section-title-react">Funcionamento</h3>
                        </div>
                        <div className="info-list-react">
                            <div className="info-row-react">
                                <span className="info-label-react">Horário:</span>
                                <span className="info-value-react">
                                    {unidade.horario_funcionamento || 'Não informado'}
                                </span>
                            </div>
                            <div className="info-row-react">
                                <span className="info-label-react">Emergência:</span>
                                <span className="info-value-react">
                                    {unidade.servicos_emergencia ? (
                                        <span className="status-badge success">
                                            <i className="fas fa-check-circle"></i>
                                            Disponível
                                        </span>
                                    ) : (
                                        <span className="status-badge danger">
                                            <i className="fas fa-times-circle"></i>
                                            Não disponível
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notificação de Cópia */}
                {copied && (
                    <div className="copy-notification-react">
                        <i className="fas fa-check-circle"></i>
                        <span>Copiado para a área de transferência!</span>
                    </div>
                )}
            </div>
        );
    }
}

// Função de renderização
function renderVisualizarUnidadeReact() {
    console.log('🔍 Inicializando VisualizarUnidadeReact');
    
    const container = document.getElementById('visualizar-unidade-react-root');
    if (!container) {
        console.error('❌ Container não encontrado: visualizar-unidade-react-root');
        return;
    }

    // Verificar se React está disponível
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error('❌ React não encontrado');
        container.innerHTML = `
            <div style="padding: 20px; background: #ffeeee; border: 1px solid #ff0000; border-radius: 5px; margin: 20px;">
                <h2>❌ Erro: React não carregado</h2>
                <p>O React não foi carregado corretamente. Verifique a conexão de rede.</p>
                <button onclick="window.location.reload()">Recarregar Página</button>
            </div>
        `;
        return;
    }

    // Verificar se há dados
    if (!window.unidadeData || !window.unidadeData.unidade) {
        console.error('❌ Dados da unidade não encontrados');
        container.innerHTML = `
            <div style="padding: 20px; background: #fff3cd; border: 1px solid #856404; border-radius: 5px; margin: 20px;">
                <h2>⚠️ Dados não encontrados</h2>
                <p>Os dados da unidade não foram carregados. Verificando...</p>
                <button onclick="window.location.reload()">Recarregar Página</button>
            </div>
        `;
        return;
    }

    try {
        console.log('✅ Renderizando VisualizarUnidadeReact com dados:', window.unidadeData);
        
        const root = ReactDOM.createRoot ? ReactDOM.createRoot(container) : null;
        
        if (root) {
            root.render(React.createElement(VisualizarUnidadeReact, window.unidadeData));
        } else {
            ReactDOM.render(
                React.createElement(VisualizarUnidadeReact, window.unidadeData),
                container
            );
        }
    } catch (error) {
        console.error('❌ Erro ao renderizar VisualizarUnidadeReact:', error);
        container.innerHTML = `
            <div style="padding: 20px; background: #f8d7da; border: 1px solid #721c24; border-radius: 5px; margin: 20px;">
                <h2>❌ Erro de renderização</h2>
                <p>Houve um erro ao carregar o componente: ${error.message}</p>
                <button onclick="window.location.reload()">Recarregar Página</button>
            </div>
        `;
    }
}

// Exportar o componente globalmente (para compatibilidade)
window.VisualizarUnidadeReact = VisualizarUnidadeReact;

// Exportar como módulo ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualizarUnidadeReact;
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderVisualizarUnidadeReact);
} else {
    renderVisualizarUnidadeReact();
}

// Export para ES6 modules
export default VisualizarUnidadeReact; 