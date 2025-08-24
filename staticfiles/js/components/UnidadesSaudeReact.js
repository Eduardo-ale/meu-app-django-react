// UnidadesSaudeReact.js - Componente React para Unidades de Saúde
class UnidadesSaudeReact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchTerm: '',
            tipoFilter: '',
            filteredUnidades: this.props.unidades || [],
            showEmptyState: false,
            isLoading: false,
            showDeleteModal: false,
            unidadeToDelete: null,
            showExportDropdown: false,
        };
        
        this.searchTimeout = null;
    }

    printCurrentData = () => {
        const { filteredUnidades } = this.state;
        const printWindow = window.open('', '_blank');
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Lista de Unidades de Saúde</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .tipo { padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px; }
                    .executante { background-color: #10b981; }
                    .solicitante { background-color: #3b82f6; }
                    .mista { background-color: #8b5cf6; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>🏥 Unidades de Saúde</h1>
                <p><strong>Total de unidades:</strong> ${filteredUnidades.length}</p>
                <p><strong>Data de impressão:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>Município</th>
                            <th>Telefone</th>
                            <th>Responsável</th>
                            <th>CNES</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredUnidades.map(unidade => `
                            <tr>
                                <td>${unidade.nome}</td>
                                <td>
                                    <span class="tipo ${unidade.tipo === 'UNIDADE_EXECUTANTE' ? 'executante' : 
                                        unidade.tipo === 'UNIDADE_SOLICITANTE' ? 'solicitante' : 'mista'}">
                                        ${unidade.tipo === 'UNIDADE_EXECUTANTE' ? 'Executante' : 
                                          unidade.tipo === 'UNIDADE_SOLICITANTE' ? 'Solicitante' : 'Executante/Solicitante'}
                                    </span>
                                </td>
                                <td>${unidade.municipio || 'Não informado'}</td>
                                <td>${unidade.telefone}</td>
                                <td>${unidade.responsavel || 'Não informado'}</td>
                                <td>${unidade.cnes || 'Não informado'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }

    componentDidMount() {
        this.setState({ filteredUnidades: this.props.unidades || [] });
        
        // Inicializar animações
        this.initializeAnimations();
        
        // Adicionar event listener para fechar dropdown ao clicar fora
        document.addEventListener('click', this.handleClickOutside);
    }

    componentWillUnmount() {
        // Remover event listeners
        document.removeEventListener('click', this.handleClickOutside);
        
        // Remover dropdown customizado se existir
        this.removeCustomDropdown();
    }

    initializeAnimations = () => {
        // Adicionar animações de entrada escalonada
        const cards = document.querySelectorAll('.unidade-card-react');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-fade-in');
        });
    }

    handleSearch = (e) => {
        const value = e.target.value;
        this.setState({ searchTerm: value });
        
        // Debounce search
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.applyFilters(value, this.state.tipoFilter);
        }, 300);
    }

    handleTipoFilter = (e) => {
        const value = e.target.value;
        this.setState({ tipoFilter: value });
        this.applyFilters(this.state.searchTerm, value);
    }

    applyFilters = (searchTerm, tipoFilter) => {
        let filtered = [...(this.props.unidades || [])];
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(unidade =>
                unidade.nome.toLowerCase().includes(term) ||
                (unidade.municipio && unidade.municipio.toLowerCase().includes(term)) ||
                (unidade.telefone && unidade.telefone.includes(term)) ||
                (unidade.responsavel && unidade.responsavel.toLowerCase().includes(term)) ||
                (unidade.cnes && unidade.cnes.includes(term))
            );
        }
        
        if (tipoFilter) {
            filtered = filtered.filter(unidade => unidade.tipo === tipoFilter);
        }
        
        this.setState({ 
            filteredUnidades: filtered,
            showEmptyState: filtered.length === 0 && (this.props.unidades || []).length > 0
        });
    }

    clearFilters = () => {
        this.setState({
            searchTerm: '',
            tipoFilter: '',
            filteredUnidades: this.props.unidades || [],
            showEmptyState: false
        });
    }

    getTipoBadge = (tipo) => {
        const badges = {
            'UNIDADE_EXECUTANTE': {
                class: 'badge-executante',
                icon: 'fas fa-hospital',
                text: 'Executante'
            },
            'UNIDADE_SOLICITANTE': {
                class: 'badge-solicitante',
                icon: 'fas fa-phone-alt',
                text: 'Solicitante'
            },
            'EXECUTANTE_SOLICITANTE': {
                class: 'badge-mista',
                icon: 'fas fa-hospital-user',
                text: 'Executante/Solicitante'
            }
        };
        return badges[tipo] || badges['UNIDADE_EXECUTANTE'];
    }

    handleDeleteClick = (unidade) => {
        this.setState({
            showDeleteModal: true,
            unidadeToDelete: unidade
        });
    }

    closeDeleteModal = () => {
        this.setState({
            showDeleteModal: false,
            unidadeToDelete: null
        });
    }

    toggleExportDropdown = () => {
        this.setState(prevState => {
            const newState = !prevState.showExportDropdown;
            
            if (newState) {
                // Criar dropdown customizado com z-index máximo
                this.createCustomDropdown();
            } else {
                // Remover dropdown customizado
                this.removeCustomDropdown();
            }
            
            return { showExportDropdown: newState };
        });
    }

    createCustomDropdown = () => {
        // Remover dropdown existente se houver
        this.removeCustomDropdown();
        
        const exportButton = document.getElementById('export-button');
        if (!exportButton) return;
        
        // Criar dropdown customizado
        const customDropdown = document.createElement('div');
        customDropdown.id = 'custom-export-dropdown';
        customDropdown.className = 'custom-export-dropdown';
        
        // Aplicar estilos inline com z-index máximo
        Object.assign(customDropdown.style, {
            position: 'fixed',
            top: exportButton.getBoundingClientRect().bottom + 5 + 'px',
            left: exportButton.getBoundingClientRect().left + 'px',
            zIndex: '2147483647',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '280px',
            padding: '8px',
            fontFamily: 'inherit',
            fontSize: '14px'
        });
        
        // Conteúdo do dropdown
        customDropdown.innerHTML = `
            <div class="custom-dropdown-item" onclick="window.open('${window.exportUrls.pdf}', '_blank')">
                <div class="custom-dropdown-content">
                    <span class="custom-dropdown-title">Exportar PDF</span>
                    <small class="custom-dropdown-description">Documento portátil para impressão</small>
                </div>
            </div>
            <div class="custom-dropdown-item" onclick="window.open('${window.exportUrls.excel}', '_blank')">
                <div class="custom-dropdown-content">
                    <span class="custom-dropdown-title">Exportar Excel</span>
                    <small class="custom-dropdown-description">Planilha para análise de dados</small>
                </div>
            </div>
            <div class="custom-dropdown-item" onclick="window.open('${window.exportUrls.csv}', '_blank')">
                <div class="custom-dropdown-content">
                    <span class="custom-dropdown-title">Exportar CSV</span>
                    <small class="custom-dropdown-description">Valores separados por vírgula</small>
                </div>
            </div>
            <hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;">
            <div class="custom-dropdown-item" onclick="window.print()">
                <div class="custom-dropdown-content">
                    <span class="custom-dropdown-title">Imprimir Lista</span>
                    <small class="custom-dropdown-description">Imprimir dados visíveis na tela</small>
                </div>
            </div>
        `;
        
        // Adicionar ao body para garantir z-index máximo
        document.body.appendChild(customDropdown);
        
        // Adicionar estilos CSS para os itens
        this.addCustomDropdownStyles();
        
        console.log('✅ Dropdown customizado criado com z-index máximo');
    }

    removeCustomDropdown = () => {
        const existingDropdown = document.getElementById('custom-export-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
    }

    addCustomDropdownStyles = () => {
        // Adicionar estilos CSS se não existirem
        if (!document.getElementById('custom-dropdown-styles')) {
            const style = document.createElement('style');
            style.id = 'custom-dropdown-styles';
            style.textContent = `
                .custom-dropdown-item {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                }
                
                .custom-dropdown-item:hover {
                    background-color: #f8f9fa;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }
                
                .custom-dropdown-content {
                    flex: 1;
                }
                
                .custom-dropdown-title {
                    font-weight: 600;
                    color: #1f2937;
                    display: block;
                    margin-bottom: 0.25rem;
                }
                
                .custom-dropdown-description {
                    font-size: 0.8rem;
                    color: #6b7280;
                }
            `;
            document.head.appendChild(style);
        }
    }

    closeExportDropdown = () => {
        this.setState({ showExportDropdown: false });
        // Atualizar atributo aria-expanded do botão
        const exportButton = document.getElementById('export-button');
        if (exportButton) {
            exportButton.setAttribute('aria-expanded', 'false');
        }
    }

    handleClickOutside = (event) => {
        if (this.state.showExportDropdown && !event.target.closest('.dropdown') && !event.target.closest('#custom-export-dropdown')) {
            this.setState({ showExportDropdown: false });
            this.removeCustomDropdown();
        }
    }

    setupDropdownObserver = () => {
        // Observer para corrigir posicionamento do dropdown
        const exportButton = document.getElementById('export-button');
        if (exportButton) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && 
                        (mutation.attributeName === 'style' || 
                         mutation.attributeName === 'data-popper-placement')) {
                        
                        const dropdownMenu = exportButton.nextElementSibling;
                        if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                            // FORÇAR Z-INDEX MÁXIMO ABSOLUTO
                            dropdownMenu.style.setProperty('z-index', '999999', 'important');
                            dropdownMenu.style.setProperty('z-index', '2147483647', 'important');
                            
                            // FORÇAR POSICIONAMENTO CORRETO
                            dropdownMenu.style.setProperty('position', 'absolute', 'important');
                            dropdownMenu.style.setProperty('top', '100%', 'important');
                            dropdownMenu.style.setProperty('left', '0', 'important');
                            dropdownMenu.style.setProperty('transform', 'none', 'important');
                            dropdownMenu.style.setProperty('inset', 'auto', 'important');
                            dropdownMenu.style.setProperty('margin', '4px 0 0 0', 'important');
                            
                            // FORÇAR VISIBILIDADE
                            dropdownMenu.style.setProperty('display', 'block', 'important');
                            dropdownMenu.style.setProperty('visibility', 'visible', 'important');
                            dropdownMenu.style.setProperty('opacity', '1', 'important');
                            dropdownMenu.style.setProperty('pointer-events', 'auto', 'important');
                            
                            // REMOVER ATRIBUTOS DO POOPER.JS
                            dropdownMenu.removeAttribute('data-popper-placement');
                            dropdownMenu.removeAttribute('data-popper-reference-hidden');
                            dropdownMenu.removeAttribute('data-popper-escaped');
                        }
                    }
                });
            });
            
            observer.observe(exportButton.nextElementSibling, {
                attributes: true,
                attributeFilter: ['style', 'data-popper-placement']
            });
            
            this.dropdownObserver = observer;
        }
    }

    forceCorrectZIndex = () => {
        const exportButton = document.getElementById('export-button');
        if (exportButton) {
            const dropdownMenu = exportButton.nextElementSibling;
            if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                // FORÇAR Z-INDEX MÁXIMO ABSOLUTO
                dropdownMenu.style.setProperty('z-index', '999999', 'important');
                dropdownMenu.style.setProperty('z-index', '2147483647', 'important');
                
                // FORÇAR POSICIONAMENTO CORRETO
                dropdownMenu.style.setProperty('position', 'absolute', 'important');
                dropdownMenu.style.setProperty('top', '100%', 'important');
                dropdownMenu.style.setProperty('left', '0', 'important');
                dropdownMenu.style.setProperty('transform', 'none', 'important');
                dropdownMenu.style.setProperty('inset', 'auto', 'important');
                dropdownMenu.style.setProperty('margin', '4px 0 0 0', 'important');
                
                // FORÇAR VISIBILIDADE
                dropdownMenu.style.setProperty('display', 'block', 'important');
                dropdownMenu.style.setProperty('visibility', 'visible', 'important');
                dropdownMenu.style.setProperty('opacity', '1', 'important');
                dropdownMenu.style.setProperty('pointer-events', 'auto', 'important');
                
                // REMOVER ATRIBUTOS DO POOPER.JS
                dropdownMenu.removeAttribute('data-popper-placement');
                dropdownMenu.removeAttribute('data-popper-reference-hidden');
                dropdownMenu.removeAttribute('data-popper-escaped');
                
                // REMOVER ESTILOS INLINE PROBLEMÁTICOS
                if (dropdownMenu.style.inset) dropdownMenu.style.removeProperty('inset');
                if (dropdownMenu.style.transform && dropdownMenu.style.transform.includes('translate3d')) {
                    dropdownMenu.style.removeProperty('transform');
                }
                
                // FORÇAR BACKGROUND E SOMBRA
                dropdownMenu.style.setProperty('background', 'white', 'important');
                dropdownMenu.style.setProperty('border', '1px solid #ccc', 'important');
                dropdownMenu.style.setProperty('border-radius', '8px', 'important');
                dropdownMenu.style.setProperty('box-shadow', '0 4px 12px rgba(0,0,0,0.15)', 'important');
                
                console.log('🔧 Z-index e posicionamento forçados:', dropdownMenu.style.zIndex);
            }
        }
    }

    confirmDelete = () => {
        if (this.state.unidadeToDelete) {
            // Submit form para deletar
            const form = document.getElementById('formExclusao');
            if (form) {
                const actionUrl = window.actionUrls?.excluir?.replace('{id}', this.state.unidadeToDelete.id) || 
                                  `/accounts/unidades-saude/${this.state.unidadeToDelete.id}/excluir/`;
                form.action = actionUrl;
                form.submit();
            }
        }
    }

    render() {
        const { searchTerm, tipoFilter, filteredUnidades, showEmptyState, showDeleteModal, unidadeToDelete, showExportDropdown } = this.state;
        const { estatisticas } = this.props;
        
        // Calcular estatísticas dinâmicas baseadas na filtragem atual
        const currentStats = {
            total: filteredUnidades.length,
            executantes: filteredUnidades.filter(u => u.tipo === 'UNIDADE_EXECUTANTE').length,
            solicitantes: filteredUnidades.filter(u => u.tipo === 'UNIDADE_SOLICITANTE').length,
            executante_solicitante: filteredUnidades.filter(u => u.tipo === 'EXECUTANTE_SOLICITANTE').length,
        };

        return (
            <div className="unidades-saude-container">
                {/* Header com Estatísticas */}
                <div className="stats-header-modern">
                    <div className="header-content-flex">
                        <div className="title-section-modern">
                            <h1 className="page-title-modern">
                                <span className="title-icon">🏥</span>
                                Unidades de Saúde
                            </h1>
                            <p className="page-subtitle-modern">
                                Gerencie todas as unidades do sistema de saúde
                            </p>
                        </div>
                        
                        <div className="stats-grid-modern">
                            <div className="stat-card-modern stat-total">
                                <div className="stat-icon-modern">
                                    <i className="fas fa-hospital-alt"></i>
                                </div>
                                <div className="stat-content-modern">
                                    <div className="stat-number-modern">
                                        {(searchTerm || tipoFilter) ? currentStats.total : (estatisticas?.total || 0)}
                                    </div>
                                    <div className="stat-label-modern">
                                        {(searchTerm || tipoFilter) ? 'Unidades Filtradas' : 'Total de Unidades'}
                                    </div>
                                    <div className="stat-indicator">
                                        <div className="stat-pulse"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="stat-card-modern stat-executante">
                                <div className="stat-icon-modern">
                                    <i className="fas fa-hospital"></i>
                                </div>
                                <div className="stat-content-modern">
                                    <div className="stat-number-modern">
                                        {(searchTerm || tipoFilter) ? currentStats.executantes : (estatisticas?.executantes || 0)}
                                    </div>
                                    <div className="stat-label-modern">Executantes</div>
                                    <div className="stat-progress">
                                        <div className="progress-bar" style={{
                                            width: `${((searchTerm || tipoFilter) ? currentStats : estatisticas)?.total ? 
                                                (((searchTerm || tipoFilter) ? currentStats.executantes : estatisticas.executantes) / 
                                                ((searchTerm || tipoFilter) ? currentStats.total : estatisticas.total)) * 100 : 0}%`
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="stat-card-modern stat-solicitante">
                                <div className="stat-icon-modern">
                                    <i className="fas fa-phone-alt"></i>
                                </div>
                                <div className="stat-content-modern">
                                    <div className="stat-number-modern">
                                        {(searchTerm || tipoFilter) ? currentStats.solicitantes : (estatisticas?.solicitantes || 0)}
                                    </div>
                                    <div className="stat-label-modern">Solicitantes</div>
                                    <div className="stat-progress">
                                        <div className="progress-bar" style={{
                                            width: `${((searchTerm || tipoFilter) ? currentStats : estatisticas)?.total ? 
                                                (((searchTerm || tipoFilter) ? currentStats.solicitantes : estatisticas.solicitantes) / 
                                                ((searchTerm || tipoFilter) ? currentStats.total : estatisticas.total)) * 100 : 0}%`
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="stat-card-modern stat-mista">
                                <div className="stat-icon-modern">
                                    <i className="fas fa-hospital-user"></i>
                                </div>
                                <div className="stat-content-modern">
                                    <div className="stat-number-modern">
                                        {(searchTerm || tipoFilter) ? currentStats.executante_solicitante : (estatisticas?.executante_solicitante || 0)}
                                    </div>
                                    <div className="stat-label-modern">Executante/Solicitante</div>
                                    <div className="stat-progress">
                                        <div className="progress-bar" style={{
                                            width: `${((searchTerm || tipoFilter) ? currentStats : estatisticas)?.total ? 
                                                (((searchTerm || tipoFilter) ? currentStats.executante_solicitante : estatisticas.executante_solicitante) / 
                                                ((searchTerm || tipoFilter) ? currentStats.total : estatisticas.total)) * 100 : 0}%`
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra de Controles */}
                <div className="controls-bar-modern">
                    <div className="search-filters-section">
                        <div className="search-box-modern">
                            <i className="fas fa-search search-icon-modern"></i>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={this.handleSearch}
                                placeholder="Buscar por nome, município, telefone, responsável, CNES..."
                                className="search-input-modern"
                            />
                            {searchTerm && (
                                <button 
                                    className="search-clear-btn"
                                    onClick={() => this.setState({ searchTerm: '' }, () => this.applyFilters('', tipoFilter))}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                        
                        <div className="filters-group-modern">
                            <select
                                value={tipoFilter}
                                onChange={this.handleTipoFilter}
                                className="filter-select-modern"
                            >
                                <option value="">Todos os tipos</option>
                                <option value="UNIDADE_EXECUTANTE">🏥 Executante</option>
                                <option value="UNIDADE_SOLICITANTE">📞 Solicitante</option>
                                <option value="EXECUTANTE_SOLICITANTE">🏥📞 Executante/Solicitante</option>
                            </select>
                            
                            {(searchTerm || tipoFilter) && (
                                <button 
                                    className="clear-filters-btn"
                                    onClick={this.clearFilters}
                                    title="Limpar filtros"
                                >
                                    <i className="fas fa-times"></i>
                                    <span>Limpar</span>
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="action-buttons-modern">
                        <div className="dropdown">
                            <button 
                                id="export-button"
                                className="action-btn-modern action-btn-secondary" 
                                type="button"
                                onClick={this.toggleExportDropdown}
                                aria-expanded={showExportDropdown}
                            >
                                <i className="fas fa-download"></i>
                                <span>Exportar</span>
                                <i className="fas fa-chevron-down"></i>
                            </button>
                            {/* Dropdown Bootstrap removido - agora usando dropdown customizado */}
                        </div>
                        
                        <a href={window.actionUrls?.criar || "/accounts/unidades-saude/criar/"} className="action-btn-modern action-btn-primary">
                            <i className="fas fa-plus"></i>
                            <span>Nova Unidade</span>
                        </a>
                    </div>
                </div>

                {/* Grid de Unidades ou Estado Vazio */}
                {showEmptyState ? (
                    <div className="empty-state-modern">
                        <div className="empty-icon-modern">
                            <i className="fas fa-search"></i>
                        </div>
                        <h3 className="empty-title-modern">Nenhuma unidade encontrada</h3>
                        <p className="empty-description-modern">
                            Tente ajustar os filtros ou termos de busca para encontrar o que procura.
                        </p>
                        <button 
                            className="action-btn-modern action-btn-secondary"
                            onClick={this.clearFilters}
                        >
                            <i className="fas fa-refresh"></i>
                            <span>Limpar Filtros</span>
                        </button>
                    </div>
                ) : filteredUnidades.length === 0 ? (
                    <div className="empty-state-modern">
                        <div className="empty-icon-modern">
                            <i className="fas fa-hospital-alt"></i>
                        </div>
                        <h3 className="empty-title-modern">Nenhuma unidade cadastrada</h3>
                        <p className="empty-description-modern">
                            Comece criando sua primeira unidade de saúde para gerenciar o sistema.
                        </p>
                        <a href={window.actionUrls?.criar || "/accounts/unidades-saude/criar/"} className="action-btn-modern action-btn-primary">
                            <i className="fas fa-plus"></i>
                            <span>Criar Primeira Unidade</span>
                        </a>
                    </div>
                ) : (
                    <div className="unidades-grid-modern">
                        {filteredUnidades.map((unidade, index) => {
                            const badge = this.getTipoBadge(unidade.tipo);
                            return (
                                <div key={unidade.id} className="unidade-card-react">
                                    <div className="card-header-modern">
                                        <div className="unidade-type-badge-modern">
                                            <span 
                                                className={`badge-modern ${badge.class}`}
                                                title={`Tipo: ${badge.text}`}
                                            >
                                                <i className={badge.icon}></i>
                                                <span>{badge.text}</span>
                                            </span>
                                        </div>
                                        <div className="card-menu-modern">
                                            <button className="menu-trigger-modern" data-bs-toggle="dropdown">
                                                <i className="fas fa-ellipsis-v"></i>
                                            </button>
                                            <ul className="dropdown-menu dropdown-menu-end">
                                                <li>
                                                    <a 
                                                        className="dropdown-item" 
                                                        href={window.actionUrls?.visualizar?.replace('{id}', unidade.id) || `/accounts/unidades-saude/${unidade.id}/visualizar/`}
                                                    >
                                                        <i className="fas fa-eye me-2"></i>Visualizar
                                                    </a>
                                                </li>
                                                <li>
                                                    <a 
                                                        className="dropdown-item" 
                                                        href={window.actionUrls?.editar?.replace('{id}', unidade.id) || `/accounts/unidades-saude/${unidade.id}/editar/`}
                                                    >
                                                        <i className="fas fa-edit me-2"></i>Editar
                                                    </a>
                                                </li>
                                                <li><hr className="dropdown-divider" /></li>
                                                <li>
                                                    <button 
                                                        className="dropdown-item text-danger" 
                                                        onClick={() => this.handleDeleteClick(unidade)}
                                                        style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
                                                    >
                                                        <i className="fas fa-trash me-2"></i>Excluir
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    
                                    <div className="card-content-modern">
                                        <h3 className="unidade-name-modern">{unidade.nome}</h3>
                                        
                                        <div className="info-grid-modern">
                                            <div className="info-item-modern">
                                                <div className="info-icon-modern">
                                                    <i className="fas fa-certificate"></i>
                                                </div>
                                                <div className="info-content-modern">
                                                    <span className="info-label-modern">CNES</span>
                                                    <span className="info-value-modern">
                                                        {unidade.cnes || 'Não informado'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="info-item-modern">
                                                <div className="info-icon-modern">
                                                    <i className="fas fa-map-marked-alt"></i>
                                                </div>
                                                <div className="info-content-modern">
                                                    <span className="info-label-modern">Município</span>
                                                    <span className="info-value-modern">
                                                        {unidade.municipio || 'Não informado'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="info-item-modern">
                                                <div className="info-icon-modern">
                                                    <i className="fas fa-phone"></i>
                                                </div>
                                                <div className="info-content-modern">
                                                    <span className="info-label-modern">Telefone</span>
                                                    <span className="info-value-modern">{unidade.telefone}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="info-item-modern">
                                                <div className="info-icon-modern">
                                                    <i className="fas fa-user-tie"></i>
                                                </div>
                                                <div className="info-content-modern">
                                                    <span className="info-label-modern">Responsável</span>
                                                    <span className="info-value-modern">
                                                        {unidade.responsavel || 'Não informado'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="address-section-modern">
                                            <div className="address-icon-modern">
                                                <i className="fas fa-map-marker-alt"></i>
                                            </div>
                                            <span className="address-text-modern">{unidade.endereco}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="card-actions-modern">
                                        <a 
                                            href={window.actionUrls?.visualizar?.replace('{id}', unidade.id) || `/accounts/unidades-saude/${unidade.id}/visualizar/`}
                                            className="card-action-btn-modern btn-view-modern"
                                            title="Visualizar detalhes da unidade"
                                        >
                                            <i className="fas fa-eye"></i>
                                            <span>Visualizar</span>
                                        </a>
                                        <a 
                                            href={window.actionUrls?.editar?.replace('{id}', unidade.id) || `/accounts/unidades-saude/${unidade.id}/editar/`}
                                            className="card-action-btn-modern btn-edit-modern"
                                            title="Editar informações da unidade"
                                        >
                                            <i className="fas fa-edit"></i>
                                            <span>Editar</span>
                                        </a>
                                        <button 
                                            onClick={() => this.handleDeleteClick(unidade)}
                                            className="card-action-btn-modern btn-delete-modern"
                                            title="Excluir unidade"
                                        >
                                            <i className="fas fa-trash"></i>
                                            <span>Excluir</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Modal de Confirmação de Exclusão */}
                {showDeleteModal && (
                    <div className="modal-overlay-react active" onClick={this.closeDeleteModal}>
                        <div className="modal-content-react" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header-react">
                                <div className="modal-icon-react">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                                <div className="modal-title-section-react">
                                    <h5>Confirmar Exclusão</h5>
                                    <p>Esta ação não pode ser desfeita</p>
                                </div>
                                <button 
                                    className="modal-close-btn-react"
                                    onClick={this.closeDeleteModal}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="modal-body-react">
                                <p>
                                    Tem certeza que deseja excluir a unidade <strong>"{unidadeToDelete?.nome}"</strong>? 
                                    Todos os dados associados serão permanentemente removidos.
                                </p>
                            </div>
                            <div className="modal-footer-react">
                                <button 
                                    className="btn-react btn-secondary-react"
                                    onClick={this.closeDeleteModal}
                                >
                                    <i className="fas fa-times"></i>
                                    Cancelar
                                </button>
                                <button 
                                    className="btn-react btn-danger-react"
                                    onClick={this.confirmDelete}
                                >
                                    <i className="fas fa-trash"></i>
                                    Confirmar Exclusão
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form oculto para exclusão */}
                <form id="formExclusao" method="POST" style={{ display: 'none' }}>
                    <input type="hidden" name="csrfmiddlewaretoken" value={document.querySelector('[name=csrfmiddlewaretoken]')?.value} />
                </form>
            </div>
        );
    }
}

// Função de renderização
function renderUnidadesSaudeReact() {
    console.log('🔍 Debug - Tentando renderizar UnidadesSaudeReact');
    console.log('🔍 Debug - Dados:', window.unidadesSaudeData);
    console.log('🔍 Debug - URLs:', window.actionUrls);
    console.log('🔍 Debug - React disponível:', typeof React !== 'undefined');
    console.log('🔍 Debug - ReactDOM disponível:', typeof ReactDOM !== 'undefined');
    
    const container = document.getElementById('unidades-saude-react-root');
    console.log('🔍 Debug - Container encontrado:', container);
    
    if (container && window.unidadesSaudeData && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
        console.log('✅ Todos os requisitos atendidos, inicializando React...');
        const root = ReactDOM.createRoot ? ReactDOM.createRoot(container) : null;
        
        if (root) {
            // React 18
            console.log('✅ Renderizando com React 18');
            root.render(React.createElement(UnidadesSaudeReact, window.unidadesSaudeData));
        } else {
            // React 17
            console.log('✅ Renderizando com React 17');
            ReactDOM.render(
                React.createElement(UnidadesSaudeReact, window.unidadesSaudeData),
                container
            );
        }
    } else {
        console.error('❌ Erro: Container ou dados não encontrados', {
            container: container,
            dados: window.unidadesSaudeData
        });
        
        // Fallback simples
        if (container) {
            container.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <h4 class="alert-heading">⚠️ Erro de Carregamento</h4>
                    <p>Não foi possível carregar o componente React. Verifique se todas as dependências estão carregadas.</p>
                    <hr>
                    <p class="mb-0">
                        <strong>Status:</strong><br>
                        Container: ${container ? '✅ Encontrado' : '❌ Não encontrado'}<br>
                        Dados: ${window.unidadesSaudeData ? '✅ Disponíveis' : '❌ Não disponíveis'}<br>
                        React: ${typeof React !== 'undefined' ? '✅ Disponível' : '❌ Não disponível'}<br>
                        ReactDOM: ${typeof ReactDOM !== 'undefined' ? '✅ Disponível' : '❌ Não disponível'}
                    </p>
                </div>
            `;
        }
    }
}