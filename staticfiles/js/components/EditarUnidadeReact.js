// EditarUnidadeReact.js - Componente React para editar unidade
class EditarUnidadeReact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                nome: props.unidade?.nome || '',
                tipo: props.unidade?.tipo || 'UNIDADE_EXECUTANTE',
                municipio: props.unidade?.municipio || '',
                endereco: props.unidade?.endereco || '',
                telefone: props.unidade?.telefone || '',
                cnes: props.unidade?.cnes || '',
                responsavel: props.unidade?.responsavel || '',
                email: props.unidade?.email || '',
                horario_funcionamento: props.unidade?.horario_funcionamento || '',
                servicos_emergencia: props.unidade?.servicos_emergencia || false
            },
            loading: false,
            errors: {},
            touched: {},
            municipios: [],
            searchingMunicipios: false
        };
    }

    componentDidMount() {
        this.initializeAnimations();
        this.loadMunicipios();
    }

    initializeAnimations = () => {
        const sections = document.querySelectorAll('.form-section-react');
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.1}s`;
            section.classList.add('animate-fade-in');
        });
    }

    loadMunicipios = async () => {
        try {
            const response = await fetch('/api/municipios/');
            if (response.ok) {
                const data = await response.json();
                this.setState({ municipios: data });
            }
        } catch (error) {
            console.error('Erro ao carregar municípios:', error);
        }
    }

    searchMunicipios = async (query) => {
        if (!query || query.length < 2) {
            this.setState({ municipios: [] });
            return;
        }

        this.setState({ searchingMunicipios: true });
        try {
            const response = await fetch(`/api/municipios/autocomplete/?q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                this.setState({ municipios: data });
            }
        } catch (error) {
            console.error('Erro ao buscar municípios:', error);
        } finally {
            this.setState({ searchingMunicipios: false });
        }
    }

    handleInputChange = (field, value) => {
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [field]: value
            },
            touched: {
                ...prevState.touched,
                [field]: true
            }
        }));

        // Buscar municípios em tempo real
        if (field === 'municipio') {
            this.searchMunicipios(value);
        }
    }

    validateForm = () => {
        const { formData } = this.state;
        const errors = {};

        if (!formData.nome.trim()) {
            errors.nome = 'Nome é obrigatório';
        }

        if (!formData.tipo) {
            errors.tipo = 'Tipo é obrigatório';
        }

        if (formData.telefone && !/^\d{10,11}$/.test(formData.telefone.replace(/\D/g, ''))) {
            errors.telefone = 'Telefone deve ter 10 ou 11 dígitos';
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'E-mail inválido';
        }

        if (formData.cnes && !/^\d{7}$/.test(formData.cnes)) {
            errors.cnes = 'CNES deve ter 7 dígitos';
        }

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        this.setState({ loading: true });

        try {
            const { unidade } = this.props;
            const response = await fetch(`/accounts/unidades-saude/${unidade.id}/editar/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify(this.state.formData)
            });

            if (response.ok) {
                window.location.href = `/accounts/unidades-saude/${unidade.id}/visualizar/`;
            } else {
                const errorData = await response.json();
                this.setState({ errors: errorData.errors || {} });
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            this.setState({ loading: false });
        }
    }

    getCsrfToken = () => {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken'))
            ?.split('=')[1];
        return cookieValue || '';
    }

    formatPhone = (value) => {
        const digits = value.replace(/\D/g, '');
        if (digits.length <= 10) {
            return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    getTipoOptions = () => [
        { value: 'UNIDADE_EXECUTANTE', label: 'Executante', icon: 'fas fa-hospital' },
        { value: 'UNIDADE_SOLICITANTE', label: 'Solicitante', icon: 'fas fa-phone-alt' },
        { value: 'EXECUTANTE_SOLICITANTE', label: 'Executante/Solicitante', icon: 'fas fa-hospital-user' }
    ];

    render() {
        const { formData, loading, errors, touched, municipios, searchingMunicipios } = this.state;
        const { unidade } = this.props;

        return (
            <div className="editar-unidade-container">
                {/* Header */}
                <div className="edit-header-react">
                    <div className="header-background"></div>
                    <div className="header-content-react">
                        <div className="header-info">
                            <div className="edit-icon-react">
                                <i className="fas fa-edit"></i>
                            </div>
                            <div>
                                <h1 className="edit-title-react">Editar Unidade</h1>
                                <p className="edit-subtitle-react">{unidade?.nome}</p>
                            </div>
                        </div>
                        <div className="header-actions">
                            <a 
                                href={`/accounts/unidades-saude/${unidade?.id}/visualizar/`}
                                className="action-btn-react btn-secondary-react"
                            >
                                <i className="fas fa-eye"></i>
                                <span>Visualizar</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Formulário */}
                <form onSubmit={this.handleSubmit} className="edit-form-react">
                    {/* Informações Básicas */}
                    <div className="form-section-react">
                        <div className="section-header-react">
                            <div className="section-icon-react">
                                <i className="fas fa-info-circle"></i>
                            </div>
                            <h3 className="section-title-react">Informações Básicas</h3>
                        </div>
                        <div className="section-content-react">
                            <div className="form-grid-react">
                                <div className="form-group-react">
                                    <label className="form-label-react">
                                        Nome da Unidade <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-input-react ${errors.nome ? 'error' : ''}`}
                                        value={formData.nome}
                                        onChange={(e) => this.handleInputChange('nome', e.target.value)}
                                        placeholder="Digite o nome completo da unidade"
                                    />
                                    {errors.nome && (
                                        <span className="error-message-react">
                                            <i className="fas fa-exclamation-circle"></i>
                                            {errors.nome}
                                        </span>
                                    )}
                                </div>

                                <div className="form-group-react">
                                    <label className="form-label-react">
                                        Tipo <span className="required">*</span>
                                    </label>
                                    <div className="radio-group-react">
                                        {this.getTipoOptions().map(option => (
                                            <label key={option.value} className="radio-option-react">
                                                <input
                                                    type="radio"
                                                    name="tipo"
                                                    value={option.value}
                                                    checked={formData.tipo === option.value}
                                                    onChange={(e) => this.handleInputChange('tipo', e.target.value)}
                                                />
                                                <div className="radio-custom-react">
                                                    <i className={option.icon}></i>
                                                    <span>{option.label}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.tipo && (
                                        <span className="error-message-react">
                                            <i className="fas fa-exclamation-circle"></i>
                                            {errors.tipo}
                                        </span>
                                    )}
                                </div>

                                <div className="form-group-react">
                                    <label className="form-label-react">CNES</label>
                                    <input
                                        type="text"
                                        className={`form-input-react ${errors.cnes ? 'error' : ''}`}
                                        value={formData.cnes}
                                        onChange={(e) => this.handleInputChange('cnes', e.target.value.replace(/\D/g, '').substring(0, 7))}
                                        placeholder="Código CNES (7 dígitos)"
                                        maxLength="7"
                                    />
                                    {errors.cnes && (
                                        <span className="error-message-react">
                                            <i className="fas fa-exclamation-circle"></i>
                                            {errors.cnes}
                                        </span>
                                    )}
                                </div>

                                <div className="form-group-react">
                                    <label className="form-label-react">Responsável</label>
                                    <input
                                        type="text"
                                        className="form-input-react"
                                        value={formData.responsavel}
                                        onChange={(e) => this.handleInputChange('responsavel', e.target.value)}
                                        placeholder="Nome do responsável"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Localização */}
                    <div className="form-section-react">
                        <div className="section-header-react">
                            <div className="section-icon-react">
                                <i className="fas fa-map-marker-alt"></i>
                            </div>
                            <h3 className="section-title-react">Localização</h3>
                        </div>
                        <div className="section-content-react">
                            <div className="form-grid-react">
                                <div className="form-group-react full-width">
                                    <label className="form-label-react">Município</label>
                                    <div className="autocomplete-wrapper-react">
                                        <input
                                            type="text"
                                            className="form-input-react"
                                            value={formData.municipio}
                                            onChange={(e) => this.handleInputChange('municipio', e.target.value)}
                                            placeholder="Digite o nome do município"
                                        />
                                        {searchingMunicipios && (
                                            <div className="autocomplete-loading">
                                                <i className="fas fa-spinner fa-spin"></i>
                                            </div>
                                        )}
                                        {municipios.length > 0 && (
                                            <div className="autocomplete-results-react">
                                                {municipios.map(municipio => (
                                                    <div 
                                                        key={municipio.id}
                                                        className="autocomplete-item-react"
                                                        onClick={() => this.handleInputChange('municipio', municipio.nome)}
                                                    >
                                                        <i className="fas fa-map-marker-alt"></i>
                                                        <span>{municipio.nome}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group-react full-width">
                                    <label className="form-label-react">Endereço</label>
                                    <textarea
                                        className="form-textarea-react"
                                        value={formData.endereco}
                                        onChange={(e) => this.handleInputChange('endereco', e.target.value)}
                                        placeholder="Endereço completo da unidade"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contato */}
                    <div className="form-section-react">
                        <div className="section-header-react">
                            <div className="section-icon-react">
                                <i className="fas fa-phone-alt"></i>
                            </div>
                            <h3 className="section-title-react">Contato</h3>
                        </div>
                        <div className="section-content-react">
                            <div className="form-grid-react">
                                <div className="form-group-react">
                                    <label className="form-label-react">Telefone</label>
                                    <input
                                        type="text"
                                        className={`form-input-react ${errors.telefone ? 'error' : ''}`}
                                        value={this.formatPhone(formData.telefone)}
                                        onChange={(e) => this.handleInputChange('telefone', e.target.value.replace(/\D/g, ''))}
                                        placeholder="(67) 99999-9999"
                                    />
                                    {errors.telefone && (
                                        <span className="error-message-react">
                                            <i className="fas fa-exclamation-circle"></i>
                                            {errors.telefone}
                                        </span>
                                    )}
                                </div>

                                <div className="form-group-react">
                                    <label className="form-label-react">E-mail</label>
                                    <input
                                        type="email"
                                        className={`form-input-react ${errors.email ? 'error' : ''}`}
                                        value={formData.email}
                                        onChange={(e) => this.handleInputChange('email', e.target.value)}
                                        placeholder="email@exemplo.com"
                                    />
                                    {errors.email && (
                                        <span className="error-message-react">
                                            <i className="fas fa-exclamation-circle"></i>
                                            {errors.email}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Funcionamento */}
                    <div className="form-section-react">
                        <div className="section-header-react">
                            <div className="section-icon-react">
                                <i className="fas fa-clock"></i>
                            </div>
                            <h3 className="section-title-react">Funcionamento</h3>
                        </div>
                        <div className="section-content-react">
                            <div className="form-grid-react">
                                <div className="form-group-react full-width">
                                    <label className="form-label-react">Horário de Funcionamento</label>
                                    <textarea
                                        className="form-textarea-react"
                                        value={formData.horario_funcionamento}
                                        onChange={(e) => this.handleInputChange('horario_funcionamento', e.target.value)}
                                        placeholder="Ex: Segunda a Sexta: 7h às 17h"
                                        rows="2"
                                    />
                                </div>

                                <div className="form-group-react full-width">
                                    <label className="checkbox-label-react">
                                        <input
                                            type="checkbox"
                                            checked={formData.servicos_emergencia}
                                            onChange={(e) => this.handleInputChange('servicos_emergencia', e.target.checked)}
                                        />
                                        <div className="checkbox-custom-react">
                                            <i className="fas fa-check"></i>
                                        </div>
                                        <span>Oferece serviços de emergência</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="form-actions-react">
                        <button
                            type="button"
                            className="btn-cancel-react"
                            onClick={() => window.history.back()}
                            disabled={loading}
                        >
                            <i className="fas fa-times"></i>
                            <span>Cancelar</span>
                        </button>
                        <button
                            type="submit"
                            className="btn-save-react"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save"></i>
                                    <span>Salvar Alterações</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}

// Função de renderização
function renderEditarUnidadeReact() {
    console.log('✏️ Inicializando EditarUnidadeReact');
    
    const container = document.getElementById('editar-unidade-react-root');
    if (!container) {
        console.error('❌ Container não encontrado: editar-unidade-react-root');
        return;
    }

    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error('❌ React não encontrado');
        container.innerHTML = `
            <div style="padding: 20px; background: #ffeeee; border: 1px solid #ff0000; border-radius: 5px;">
                <h2>❌ Erro: React não carregado</h2>
                <p>O React não foi carregado corretamente.</p>
                <button onclick="window.location.reload()">Recarregar</button>
            </div>
        `;
        return;
    }

    if (!window.editUnidadeData || !window.editUnidadeData.unidade) {
        console.error('❌ Dados da unidade não encontrados');
        container.innerHTML = `
            <div style="padding: 20px; background: #fff3cd; border: 1px solid #856404; border-radius: 5px;">
                <h2>⚠️ Dados não encontrados</h2>
                <p>Os dados da unidade não foram carregados.</p>
                <button onclick="window.location.reload()">Recarregar</button>
            </div>
        `;
        return;
    }

    try {
        console.log('✅ Renderizando EditarUnidadeReact com dados:', window.editUnidadeData);
        
        const root = ReactDOM.createRoot ? ReactDOM.createRoot(container) : null;
        
        if (root) {
            root.render(React.createElement(EditarUnidadeReact, window.editUnidadeData));
        } else {
            ReactDOM.render(
                React.createElement(EditarUnidadeReact, window.editUnidadeData),
                container
            );
        }
    } catch (error) {
        console.error('❌ Erro ao renderizar EditarUnidadeReact:', error);
        container.innerHTML = `
            <div style="padding: 20px; background: #f8d7da; border: 1px solid #721c24; border-radius: 5px;">
                <h2>❌ Erro de renderização</h2>
                <p>Erro: ${error.message}</p>
                <button onclick="window.location.reload()">Recarregar</button>
            </div>
        `;
    }
}

// Exportar o componente globalmente (para compatibilidade)
window.EditarUnidadeReact = EditarUnidadeReact;

// Exportar como módulo ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EditarUnidadeReact;
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderEditarUnidadeReact);
} else {
    renderEditarUnidadeReact();
}

// Export para ES6 modules
export default EditarUnidadeReact; 