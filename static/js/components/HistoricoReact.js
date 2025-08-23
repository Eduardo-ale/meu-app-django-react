// HistoricoReact.js - Componente React para Histórico de Chamadas
class HistoricoReact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chamadas: this.props.chamadas || [],
            chamadasFiltradas: this.props.chamadas || [],
            filtros: this.props.filtros || {
                tipo: '',
                status: '',
                data_inicio: '',
                data_fim: '',
                busca: ''
            },
            isLoading: false,
            selectedChamadas: [],
            currentPage: 1,
            itemsPerPage: 10,
            sortField: 'data_criacao',
            sortDirection: 'desc',
            showExportOptions: false,
            // Novos estados para modais
            showDetalhesModal: false,
            showEditarModal: false,
            chamadaSelecionada: null,
            dadosEdicao: {},
            salvandoEdicao: false
        };
    }

    componentDidMount() {
        console.log('✅ Componente HistoricoReact iniciado');
        this.aplicarFiltros();
        this.initializeAnimations();
    }

    initializeAnimations = () => {
        // Animação de entrada para o formulário
        const formContainer = document.querySelector('.historico-form-container');
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

    handleFiltroChange = (campo, valor) => {
        this.setState(prevState => ({
            filtros: {
                ...prevState.filtros,
                [campo]: valor
            }
        }), () => {
            this.aplicarFiltros();
        });
    }

    aplicarFiltros = () => {
        const { chamadas, filtros } = this.state;
        let chamadasFiltradas = [...chamadas];

        // Filtro por busca
        if (filtros.busca) {
            const busca = filtros.busca.toLowerCase();
            chamadasFiltradas = chamadasFiltradas.filter(chamada =>
                chamada.nome_contato.toLowerCase().includes(busca) ||
                chamada.telefone.includes(busca) ||
                chamada.unidade_solicitante.nome.toLowerCase().includes(busca) ||
                chamada.unidade_executante.nome.toLowerCase().includes(busca) ||
                chamada.descricao.toLowerCase().includes(busca) ||
                chamada.nome_atendente.toLowerCase().includes(busca)
            );
        }

        // Filtro por tipo
        if (filtros.tipo) {
            chamadasFiltradas = chamadasFiltradas.filter(chamada =>
                chamada.tipo_chamada === filtros.tipo
            );
        }

        // Filtro por status
        if (filtros.status) {
            chamadasFiltradas = chamadasFiltradas.filter(chamada =>
                chamada.status === filtros.status
            );
        }

        // Filtros de data (simulação - em produção seria feito no backend)
        if (filtros.data_inicio || filtros.data_fim) {
            // Para simplificar, mantemos todas as chamadas quando há filtros de data
            // Em produção, isso seria processado no backend
        }

        this.setState({ 
            chamadasFiltradas,
            currentPage: 1 // Reset para primeira página
        });
    }

    limparFiltros = () => {
        const filtrosLimpos = {
            tipo: '',
            status: '',
            data_inicio: '',
            data_fim: '',
            busca: ''
        };

        this.setState({ 
            filtros: filtrosLimpos,
            chamadasFiltradas: this.state.chamadas,
            currentPage: 1
        });
    }

    handleSort = (field) => {
        const { sortField, sortDirection } = this.state;
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        
        this.setState({
            sortField: field,
            sortDirection: newDirection
        }, () => {
            this.sortChamadas();
        });
    }

    sortChamadas = () => {
        const { chamadasFiltradas, sortField, sortDirection } = this.state;
        
        const sorted = [...chamadasFiltradas].sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];
            
            // Tratamento especial para campos aninhados
            if (sortField === 'unidade_solicitante') {
                aValue = a.unidade_solicitante.nome;
                bValue = b.unidade_solicitante.nome;
            }
            
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        this.setState({ chamadasFiltradas: sorted });
    }

    handlePageChange = (page) => {
        this.setState({ currentPage: page });
    }

    toggleChamadaSelection = (chamadaId) => {
        this.setState(prevState => ({
            selectedChamadas: prevState.selectedChamadas.includes(chamadaId)
                ? prevState.selectedChamadas.filter(id => id !== chamadaId)
                : [...prevState.selectedChamadas, chamadaId]
        }));
    }

    selectAllChamadas = () => {
        const { chamadasFiltradas } = this.state;
        const currentPageChamadas = this.getCurrentPageChamadas();
        
        this.setState(prevState => {
            const allSelected = currentPageChamadas.every(chamada => 
                prevState.selectedChamadas.includes(chamada.id)
            );
            
            if (allSelected) {
                return {
                    selectedChamadas: prevState.selectedChamadas.filter(id => 
                        !currentPageChamadas.some(chamada => chamada.id === id)
                    )
                };
            } else {
                const newSelected = currentPageChamadas
                    .filter(chamada => !prevState.selectedChamadas.includes(chamada.id))
                    .map(chamada => chamada.id);
                
                return {
                    selectedChamadas: [...prevState.selectedChamadas, ...newSelected]
                };
            }
        });
    }

    getCurrentPageChamadas = () => {
        const { chamadasFiltradas, currentPage, itemsPerPage } = this.state;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return chamadasFiltradas.slice(startIndex, endIndex);
    }

    getTotalPages = () => {
        const { chamadasFiltradas, itemsPerPage } = this.state;
        return Math.ceil(chamadasFiltradas.length / itemsPerPage);
    }

    handleExport = (tipo) => {
        const { filtros } = this.state;
        const { urls } = this.props;
        
        // Construir URL com filtros
        const params = new URLSearchParams();
        Object.keys(filtros).forEach(key => {
            if (filtros[key]) {
                params.append(key, filtros[key]);
            }
        });
        
        let exportUrl;
        switch (tipo) {
            case 'pdf':
                exportUrl = urls.export_pdf;
                break;
            case 'excel':
                exportUrl = urls.export_excel;
                break;
            case 'csv':
                exportUrl = urls.export_csv;
                break;
            default:
                return;
        }
        
        const fullUrl = `${exportUrl}?${params.toString()}`;
        window.open(fullUrl, '_blank');
        
        this.setState({ showExportOptions: false });
        this.showNotification(`Exportação ${tipo.toUpperCase()} iniciada!`, 'success');
    }

    showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;
        notification.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                                type === 'error' ? 'fa-exclamation-circle' : 
                                type === 'warning' ? 'fa-exclamation-triangle' :
                                'fa-info-circle'}"></i>
            </div>
            <div class="toast-content">${message}</div>
            <button type="button" class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        let notificationsArea = document.querySelector('.notifications-premium');
        if (!notificationsArea) {
            notificationsArea = document.createElement('div');
            notificationsArea.className = 'notifications-premium';
            document.querySelector('.content-wrapper').prepend(notificationsArea);
        }

        notificationsArea.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Método para ver detalhes da chamada
    verDetalhes = async (chamadaId) => {
        this.setState({ isLoading: true });

        try {
            const response = await fetch(`/accounts/chamada/${chamadaId}/detalhes/`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.setState({
                        chamadaSelecionada: result.data,
                        showDetalhesModal: true,
                        isLoading: false
                    });
                } else {
                    this.showNotification(result.message || 'Erro ao carregar detalhes', 'error');
                    this.setState({ isLoading: false });
                }
            } else {
                this.showNotification('Erro ao carregar detalhes da chamada', 'error');
                this.setState({ isLoading: false });
            }
        } catch (error) {
            console.error('Erro ao buscar detalhes:', error);
            this.showNotification('Erro de conexão ao buscar detalhes', 'error');
            this.setState({ isLoading: false });
        }
    }

    // Método para abrir modal de edição
    abrirEdicao = async (chamadaId) => {
        this.setState({ isLoading: true });

        try {
            const response = await fetch(`/accounts/chamada/${chamadaId}/editar-form/`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.setState({
                        chamadaSelecionada: result.data,
                        dadosEdicao: { ...result.data },
                        showEditarModal: true,
                        isLoading: false
                    });
                } else {
                    this.showNotification(result.message || 'Erro ao carregar dados para edição', 'error');
                    this.setState({ isLoading: false });
                }
            } else {
                this.showNotification('Erro ao carregar dados para edição', 'error');
                this.setState({ isLoading: false });
            }
        } catch (error) {
            console.error('Erro ao buscar dados para edição:', error);
            this.showNotification('Erro de conexão ao buscar dados', 'error');
            this.setState({ isLoading: false });
        }
    }

    // Método para salvar edições
    salvarEdicao = async () => {
        const { dadosEdicao } = this.state;
        
        // Validações básicas
        if (!dadosEdicao.nome_contato || !dadosEdicao.telefone || !dadosEdicao.unidade) {
            this.showNotification('Preencha todos os campos obrigatórios', 'warning');
            return;
        }

        this.setState({ salvandoEdicao: true });

        try {
            const response = await fetch('/accounts/api/editar-chamada/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.props.csrfToken,
                },
                body: JSON.stringify(dadosEdicao)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Atualizar a lista de chamadas no estado
                    this.setState(prevState => ({
                        chamadas: prevState.chamadas.map(chamada => 
                            chamada.id === dadosEdicao.id 
                                ? { ...chamada, ...dadosEdicao }
                                : chamada
                        ),
                        showEditarModal: false,
                        salvandoEdicao: false,
                        chamadaSelecionada: null,
                        dadosEdicao: {}
                    }), () => {
                        this.aplicarFiltros(); // Reaplicar filtros para atualizar a visualização
                    });

                    this.showNotification('Chamada atualizada com sucesso!', 'success');
                } else {
                    this.showNotification(result.message || 'Erro ao salvar alterações', 'error');
                    this.setState({ salvandoEdicao: false });
                }
            } else {
                this.showNotification('Erro ao salvar alterações', 'error');
                this.setState({ salvandoEdicao: false });
            }
        } catch (error) {
            console.error('Erro ao salvar edição:', error);
            this.showNotification('Erro de conexão ao salvar', 'error');
            this.setState({ salvandoEdicao: false });
        }
    }

    // Método para fechar modais
    fecharModais = () => {
        this.setState({
            showDetalhesModal: false,
            showEditarModal: false,
            chamadaSelecionada: null,
            dadosEdicao: {},
            salvandoEdicao: false
        });
    }

    // Método para atualizar dados de edição
    atualizarDadosEdicao = (campo, valor) => {
        this.setState(prevState => ({
            dadosEdicao: {
                ...prevState.dadosEdicao,
                [campo]: valor
            }
        }));
    }

    formatStatus = (status) => {
        const statusMap = {
            'PENDENTE': { label: 'Pendente', class: 'warning' },
            'EM_ANDAMENTO': { label: 'Em Andamento', class: 'info' },
            'CONCLUIDA': { label: 'Concluída', class: 'success' },
            'CANCELADA': { label: 'Cancelada', class: 'danger' }
        };
        
        return statusMap[status] || { label: status, class: 'secondary' };
    }

    render() {
        const { 
            chamadasFiltradas, filtros, isLoading, selectedChamadas, 
            currentPage, itemsPerPage, sortField, sortDirection, showExportOptions,
            showDetalhesModal, showEditarModal, chamadaSelecionada, dadosEdicao, salvandoEdicao
        } = this.state;
        
        const { opcoes } = this.props;
        const currentPageChamadas = this.getCurrentPageChamadas();
        const totalPages = this.getTotalPages();
        const allCurrentPageSelected = currentPageChamadas.length > 0 && 
            currentPageChamadas.every(chamada => selectedChamadas.includes(chamada.id));

        return (
            <div className="historico-form-container">
                {isLoading && (
                    <div className="loading-overlay-historico">
                        <div className="loading-spinner-historico"></div>
                    </div>
                )}

                {/* Header do Formulário */}
                <div className="form-header-historico">
                    <h2 className="form-title-historico">
                        <i className="fas fa-filter"></i>
                        Filtros e Resultados
                    </h2>
                    <p className="form-subtitle-historico">
                        Encontrados {chamadasFiltradas.length} registros
                    </p>
                </div>

                {/* Corpo do Formulário */}
                <div className="form-body-historico">
                    {/* Seção de Filtros */}
                    <div className="filtros-section">
                        <div className="filtros-header">
                            <h3>
                                <i className="fas fa-search"></i>
                                Filtrar Chamadas
                            </h3>
                            <div className="filtros-actions">
                                <button 
                                    className="btn-filter secondary"
                                    onClick={this.limparFiltros}
                                >
                                    <i className="fas fa-broom"></i>
                                    Limpar
                                </button>
                            </div>
                        </div>

                        <div className="filtros-grid">
                            <div className="filtro-group">
                                <label>
                                    <i className="fas fa-search"></i>
                                    Buscar
                                </label>
                                <input
                                    type="text"
                                    className="filtro-input"
                                    value={filtros.busca}
                                    onChange={(e) => this.handleFiltroChange('busca', e.target.value)}
                                    placeholder="Nome, telefone, unidade..."
                                />
                            </div>

                            <div className="filtro-group">
                                <label>
                                    <i className="fas fa-list"></i>
                                    Tipo de Chamada
                                </label>
                                <select
                                    className="filtro-select"
                                    value={filtros.tipo}
                                    onChange={(e) => this.handleFiltroChange('tipo', e.target.value)}
                                >
                                    <option value="">Todos os tipos</option>
                                    {opcoes.tipos_chamada.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filtro-group">
                                <label>
                                    <i className="fas fa-flag"></i>
                                    Status
                                </label>
                                <select
                                    className="filtro-select"
                                    value={filtros.status}
                                    onChange={(e) => this.handleFiltroChange('status', e.target.value)}
                                >
                                    <option value="">Todos os status</option>
                                    {opcoes.status_choices.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filtro-group">
                                <label>
                                    <i className="fas fa-calendar"></i>
                                    Data Início
                                </label>
                                <input
                                    type="date"
                                    className="filtro-input"
                                    value={filtros.data_inicio}
                                    onChange={(e) => this.handleFiltroChange('data_inicio', e.target.value)}
                                />
                            </div>

                            <div className="filtro-group">
                                <label>
                                    <i className="fas fa-calendar"></i>
                                    Data Fim
                                </label>
                                <input
                                    type="date"
                                    className="filtro-input"
                                    value={filtros.data_fim}
                                    onChange={(e) => this.handleFiltroChange('data_fim', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seção de Resultados */}
                    <div className="resultados-section">
                        <div className="resultados-header">
                            <div className="resultados-info">
                                <h3>
                                    <i className="fas fa-table"></i>
                                    Registros
                                </h3>
                                <span className="resultados-count">
                                    {chamadasFiltradas.length} encontrados
                                </span>
                            </div>
                            
                            <div className="resultados-actions">
                                <div className="export-dropdown">
                                    <button 
                                        className="btn-export"
                                        onClick={() => this.setState({ showExportOptions: !showExportOptions })}
                                    >
                                        <i className="fas fa-download"></i>
                                        Exportar
                                        <i className="fas fa-chevron-down"></i>
                                    </button>
                                    
                                    {showExportOptions && (
                                        <div className="export-options">
                                            <button onClick={() => this.handleExport('pdf')}>
                                                <i className="fas fa-file-pdf"></i>
                                                PDF
                                            </button>
                                            <button onClick={() => this.handleExport('excel')}>
                                                <i className="fas fa-file-excel"></i>
                                                Excel
                                            </button>
                                            <button onClick={() => this.handleExport('csv')}>
                                                <i className="fas fa-file-csv"></i>
                                                CSV
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tabela */}
                        <div className="table-container">
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={allCurrentPageSelected}
                                                onChange={this.selectAllChamadas}
                                            />
                                        </th>
                                        <th 
                                            className={`sortable ${sortField === 'data_criacao' ? sortDirection : ''}`}
                                            onClick={() => this.handleSort('data_criacao')}
                                        >
                                            Data/Hora
                                            <i className="fas fa-sort"></i>
                                        </th>
                                        <th 
                                            className={`sortable ${sortField === 'nome_contato' ? sortDirection : ''}`}
                                            onClick={() => this.handleSort('nome_contato')}
                                        >
                                            Contato
                                            <i className="fas fa-sort"></i>
                                        </th>
                                        <th>Telefone</th>
                                        <th 
                                            className={`sortable ${sortField === 'unidade_solicitante' ? sortDirection : ''}`}
                                            onClick={() => this.handleSort('unidade_solicitante')}
                                        >
                                            Unidade Solicitante
                                            <i className="fas fa-sort"></i>
                                        </th>
                                        <th>Tipo</th>
                                        <th>Status</th>
                                        <th>Atendente</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPageChamadas.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="no-data">
                                                <div className="no-data-content">
                                                    <i className="fas fa-search"></i>
                                                    <h4>Nenhum registro encontrado</h4>
                                                    <p>Tente ajustar os filtros para encontrar mais resultados</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentPageChamadas.map(chamada => {
                                            const statusInfo = this.formatStatus(chamada.status);
                                            
                                            return (
                                                <tr key={chamada.id}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedChamadas.includes(chamada.id)}
                                                            onChange={() => this.toggleChamadaSelection(chamada.id)}
                                                        />
                                                    </td>
                                                    <td>{chamada.data_criacao}</td>
                                                    <td>
                                                        <div className="contact-info">
                                                            <strong>{chamada.nome_contato}</strong>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <a href={`tel:${chamada.telefone}`} className="phone-link">
                                                            {chamada.telefone}
                                                        </a>
                                                    </td>
                                                    <td>{chamada.unidade_solicitante.nome}</td>
                                                    <td>
                                                        <span className="tipo-badge">
                                                            {chamada.tipo_chamada}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${statusInfo.class}`}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>
                                                    <td>{chamada.nome_atendente}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button 
                                                                className="btn-action view"
                                                                title="Ver detalhes"
                                                                onClick={() => this.verDetalhes(chamada.id)}
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                            <button 
                                                                className="btn-action edit"
                                                                title="Editar"
                                                                onClick={() => this.abrirEdicao(chamada.id)}
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <div className="pagination-info">
                                    Página {currentPage} de {totalPages} 
                                    ({chamadasFiltradas.length} registros)
                                </div>
                                
                                <div className="pagination-controls">
                                    <button 
                                        className="pagination-btn"
                                        disabled={currentPage === 1}
                                        onClick={() => this.handlePageChange(currentPage - 1)}
                                    >
                                        <i className="fas fa-chevron-left"></i>
                                        Anterior
                                    </button>
                                    
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                                                onClick={() => this.handlePageChange(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    
                                    <button 
                                        className="pagination-btn"
                                        disabled={currentPage === totalPages}
                                        onClick={() => this.handlePageChange(currentPage + 1)}
                                    >
                                        Próximo
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal de Detalhes */}
                {showDetalhesModal && chamadaSelecionada && (
                    <div className="modal-overlay" onClick={this.fecharModais}>
                        <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>
                                    <i className="fas fa-eye"></i>
                                    Detalhes da Chamada {chamadaSelecionada.codigo}
                                </h3>
                                <button className="modal-close" onClick={this.fecharModais}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            
                            <div className="modal-body">
                                <div className="detalhes-grid">
                                    <div className="detalhe-item">
                                        <label>Contato:</label>
                                        <span>{chamadaSelecionada.nome_contato}</span>
                                    </div>
                                    <div className="detalhe-item">
                                        <label>Telefone:</label>
                                        <span>
                                            <a href={`tel:${chamadaSelecionada.telefone}`} className="phone-link">
                                                {chamadaSelecionada.telefone}
                                            </a>
                                        </span>
                                    </div>
                                    <div className="detalhe-item">
                                        <label>Função:</label>
                                        <span>{chamadaSelecionada.funcao || 'Não informado'}</span>
                                    </div>
                                    <div className="detalhe-item">
                                        <label>Setor:</label>
                                        <span>{chamadaSelecionada.setor || 'Não informado'}</span>
                                    </div>
                                    <div className="detalhe-item">
                                        <label>Unidade:</label>
                                        <span>{chamadaSelecionada.unidade}</span>
                                    </div>
                                    <div className="detalhe-item">
                                        <label>Município:</label>
                                        <span>{chamadaSelecionada.municipio || 'Não informado'}</span>
                                    </div>
                                    <div className="detalhe-item">
                                        <label>CNES:</label>
                                        <span>{chamadaSelecionada.cnes || 'Não informado'}</span>
                                    </div>
                                    <div className="detalhe-item">
                                        <label>Contato CNES:</label>
                                        <span>{chamadaSelecionada.contato_telefonico_cnes || 'Não informado'}</span>
                                    </div>
                                    <div className="detalhe-item">
                                        <label>Tipo de Chamada:</label>
                                        <span className="tipo-badge">{chamadaSelecionada.tipo_chamada}</span>
                                    </div>
                                    <div className="detalhe-item">
                                        <label>Status:</label>
                                        <span className={`status-badge ${this.formatStatus(chamadaSelecionada.status).class}`}>
                                            {chamadaSelecionada.status}
                                        </span>
                                    </div>
                                    <div className="detalhe-item">
                                        <label>Atendente:</label>
                                        <span>{chamadaSelecionada.nome_atendente}</span>
                                    </div>
                                    <div className="detalhe-item">
                                        <label>Criado por:</label>
                                        <span>{chamadaSelecionada.usuario_criador}</span>
                                    </div>
                                    <div className="detalhe-item full-width">
                                        <label>Descrição:</label>
                                        <p className="descricao-completa">{chamadaSelecionada.descricao}</p>
                                    </div>
                                    {chamadaSelecionada.solucao && (
                                        <div className="detalhe-item full-width">
                                            <label>Solução:</label>
                                            <p className="solucao-completa">{chamadaSelecionada.solucao}</p>
                                        </div>
                                    )}
                                    <div className="detalhe-item">
                                        <label>Data de Criação:</label>
                                        <span>{chamadaSelecionada.data_criacao}</span>
                                    </div>
                                    <div className="detalhe-item">
                                        <label>Última Atualização:</label>
                                        <span>{chamadaSelecionada.data_atualizacao}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Edição */}
                {showEditarModal && chamadaSelecionada && (
                    <div className="modal-overlay" onClick={this.fecharModais}>
                        <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>
                                    <i className="fas fa-edit"></i>
                                    Editar Chamada {chamadaSelecionada.codigo}
                                </h3>
                                <button className="modal-close" onClick={this.fecharModais}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            
                            <div className="modal-body">
                                <form className="edicao-form" onSubmit={(e) => { e.preventDefault(); this.salvarEdicao(); }}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="nome_contato">Nome do Contato *</label>
                                            <input
                                                type="text"
                                                id="nome_contato"
                                                value={dadosEdicao.nome_contato || ''}
                                                onChange={(e) => this.atualizarDadosEdicao('nome_contato', e.target.value)}
                                                required
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="telefone">Telefone *</label>
                                            <input
                                                type="tel"
                                                id="telefone"
                                                value={dadosEdicao.telefone || ''}
                                                onChange={(e) => this.atualizarDadosEdicao('telefone', e.target.value)}
                                                required
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="funcao">Função</label>
                                            <input
                                                type="text"
                                                id="funcao"
                                                value={dadosEdicao.funcao || ''}
                                                onChange={(e) => this.atualizarDadosEdicao('funcao', e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="setor">Setor</label>
                                            <input
                                                type="text"
                                                id="setor"
                                                value={dadosEdicao.setor || ''}
                                                onChange={(e) => this.atualizarDadosEdicao('setor', e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="unidade">Unidade *</label>
                                            <input
                                                type="text"
                                                id="unidade"
                                                value={dadosEdicao.unidade || ''}
                                                onChange={(e) => this.atualizarDadosEdicao('unidade', e.target.value)}
                                                required
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="municipio">Município</label>
                                            <input
                                                type="text"
                                                id="municipio"
                                                value={dadosEdicao.municipio || ''}
                                                onChange={(e) => this.atualizarDadosEdicao('municipio', e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="cnes">CNES</label>
                                            <input
                                                type="text"
                                                id="cnes"
                                                value={dadosEdicao.cnes || ''}
                                                onChange={(e) => this.atualizarDadosEdicao('cnes', e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="contato_telefonico_cnes">Contato CNES</label>
                                            <input
                                                type="tel"
                                                id="contato_telefonico_cnes"
                                                value={dadosEdicao.contato_telefonico_cnes || ''}
                                                onChange={(e) => this.atualizarDadosEdicao('contato_telefonico_cnes', e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="tipo_chamada">Tipo de Chamada *</label>
                                            <select
                                                id="tipo_chamada"
                                                value={dadosEdicao.tipo_chamada || ''}
                                                onChange={(e) => this.atualizarDadosEdicao('tipo_chamada', e.target.value)}
                                                required
                                            >
                                                <option value="">Selecione o tipo</option>
                                                {opcoes.tipos_chamada.map(tipo => (
                                                    <option key={tipo.value} value={tipo.value}>
                                                        {tipo.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="status">Status *</label>
                                            <select
                                                id="status"
                                                value={dadosEdicao.status || ''}
                                                onChange={(e) => this.atualizarDadosEdicao('status', e.target.value)}
                                                required
                                            >
                                                <option value="">Selecione o status</option>
                                                {opcoes.status_choices.map(status => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="nome_atendente">Atendente *</label>
                                            <input
                                                type="text"
                                                id="nome_atendente"
                                                value={dadosEdicao.nome_atendente || ''}
                                                onChange={(e) => this.atualizarDadosEdicao('nome_atendente', e.target.value)}
                                                required
                                            />
                                        </div>
                                        
                                        <div className="form-group full-width">
                                            <label htmlFor="descricao">Descrição *</label>
                                            <textarea
                                                id="descricao"
                                                rows="4"
                                                value={dadosEdicao.descricao || ''}
                                                onChange={(e) => this.atualizarDadosEdicao('descricao', e.target.value)}
                                                required
                                            ></textarea>
                                        </div>
                                        
                                        <div className="form-group full-width">
                                            <label htmlFor="solucao">Solução</label>
                                            <textarea
                                                id="solucao"
                                                rows="3"
                                                value={dadosEdicao.solucao || ''}
                                                onChange={(e) => this.atualizarDadosEdicao('solucao', e.target.value)}
                                                placeholder="Descreva a solução aplicada (opcional)"
                                            ></textarea>
                                        </div>
                                    </div>
                                    
                                    <div className="modal-footer">
                                        <button 
                                            type="button" 
                                            className="btn-cancel"
                                            onClick={this.fecharModais}
                                            disabled={salvandoEdicao}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn-save"
                                            disabled={salvandoEdicao}
                                        >
                                            {salvandoEdicao ? (
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
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

// CSS adicional para o componente
const historicoStyles = document.createElement('style');
historicoStyles.textContent = `
/* ===== SEÇÃO DE FILTROS ===== */
.filtros-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
}

.filtros-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.filtros-header h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #1f2937;
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
}

.filtros-actions {
    display: flex;
    gap: 0.75rem;
}

.btn-filter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.875rem;
}

.btn-filter.secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
}

.btn-filter.secondary:hover {
    background: #e5e7eb;
    transform: translateY(-1px);
}

.filtros-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.filtro-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filtro-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
}

.filtro-input, .filtro-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.3s ease;
    background: white;
}

.filtro-input:focus, .filtro-select:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* ===== SEÇÃO DE RESULTADOS ===== */
.resultados-section {
    margin-top: 2rem;
}

.resultados-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
}

.resultados-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.resultados-info h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #1f2937;
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
}

.resultados-count {
    background: #f3f4f6;
    color: #374151;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
}

.resultados-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
}

/* ===== DROPDOWN DE EXPORTAÇÃO ===== */
.export-dropdown {
    position: relative;
}

.btn-export {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.875rem;
}

.btn-export:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.export-options {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    margin-top: 0.5rem;
    min-width: 120px;
}

.export-options button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
}

.export-options button:hover {
    background: #f3f4f6;
    color: #6366f1;
}

.export-options button:first-child {
    border-radius: 8px 8px 0 0;
}

.export-options button:last-child {
    border-radius: 0 0 8px 8px;
}

/* ===== TABELA ===== */
.table-container {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.table-modern {
    width: 100%;
    border-collapse: collapse;
}

.table-modern th {
    background: #f8fafc;
    padding: 1rem 0.75rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
    border-bottom: 1px solid #e5e7eb;
    position: relative;
}

.table-modern th.sortable {
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
}

.table-modern th.sortable:hover {
    background: #f1f5f9;
    color: #6366f1;
}

.table-modern th.sortable i {
    margin-left: 0.5rem;
    opacity: 0.5;
}

.table-modern th.sortable.asc i:before {
    content: "\\f0de";
    opacity: 1;
    color: #6366f1;
}

.table-modern th.sortable.desc i:before {
    content: "\\f0dd";
    opacity: 1;
    color: #6366f1;
}

.table-modern td {
    padding: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
    color: #374151;
    font-size: 0.875rem;
}

.table-modern tbody tr:hover {
    background: #f8fafc;
}

.table-modern tbody tr:last-child td {
    border-bottom: none;
}

/* ===== BADGES E STATUS ===== */
.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.status-badge.success {
    background: rgba(16, 185, 129, 0.1);
    color: #047857;
}

.status-badge.warning {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
}

.status-badge.info {
    background: rgba(59, 130, 246, 0.1);
    color: #1d4ed8;
}

.status-badge.danger {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
}

.status-badge.secondary {
    background: rgba(107, 114, 128, 0.1);
    color: #4b5563;
}

.tipo-badge {
    background: #f3f4f6;
    color: #374151;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
}

/* ===== AÇÕES DA TABELA ===== */
.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.btn-action {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 0.875rem;
}

.btn-action.view {
    background: rgba(59, 130, 246, 0.1);
    color: #1d4ed8;
}

.btn-action.view:hover {
    background: rgba(59, 130, 246, 0.2);
    transform: scale(1.05);
}

.btn-action.edit {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
}

.btn-action.edit:hover {
    background: rgba(245, 158, 11, 0.2);
    transform: scale(1.05);
}

/* ===== PAGINAÇÃO ===== */
.pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

.pagination-info {
    color: #6b7280;
    font-size: 0.875rem;
}

.pagination-controls {
    display: flex;
    gap: 0.5rem;
}

.pagination-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    background: white;
    color: #374151;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
}

.pagination-btn:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #6366f1;
    color: #6366f1;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-btn.active {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
}

/* ===== SEM DADOS ===== */
.no-data {
    text-align: center;
    padding: 3rem 1rem;
}

.no-data-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: #6b7280;
}

.no-data-content i {
    font-size: 3rem;
    opacity: 0.5;
}

.no-data-content h4 {
    color: #374151;
    margin: 0;
}

.no-data-content p {
    margin: 0;
    font-size: 0.875rem;
}

/* ===== LINKS ESPECIAIS ===== */
.phone-link {
    color: #6366f1;
    text-decoration: none;
    font-weight: 500;
}

.phone-link:hover {
    text-decoration: underline;
}

.contact-info strong {
    color: #1f2937;
}

/* ===== LOADING OVERLAY ===== */
.loading-overlay-historico {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    border-radius: 24px;
}

/* ===== MODAIS ===== */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 1rem;
}

.modal-content {
    background: white;
    border-radius: 16px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: modalSlideIn 0.3s ease-out;
}

.modal-content.modal-large {
    max-width: 900px;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.modal-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f8fafc;
}

.modal-header h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #1f2937;
    font-size: 1.25rem;
    font-weight: 600;
}

.modal-close {
    width: 40px;
    height: 40px;
    border: none;
    background: rgba(156, 163, 175, 0.1);
    border-radius: 50%;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 1.125rem;
}

.modal-close:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
}

.modal-body {
    padding: 2rem;
    overflow-y: auto;
    flex: 1;
}

.modal-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    background: #f8fafc;
}

/* ===== DETALHES ===== */
.detalhes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.detalhe-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.detalhe-item.full-width {
    grid-column: 1 / -1;
}

.detalhe-item label {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.detalhe-item span {
    color: #1f2937;
    font-size: 1rem;
}

.descricao-completa,
.solucao-completa {
    background: #f3f4f6;
    padding: 1rem;
    border-radius: 8px;
    color: #374151;
    line-height: 1.6;
    margin: 0;
    white-space: pre-wrap;
}

.solucao-completa {
    background: #ecfdf5;
    border-left: 4px solid #10b981;
}

/* ===== FORMULÁRIO DE EDIÇÃO ===== */
.edicao-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-group label {
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
}

.form-group input,
.form-group select,
.form-group textarea {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.3s ease;
    background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-group textarea {
    resize: vertical;
    min-height: 100px;
    font-family: inherit;
}

/* ===== BOTÕES DOS MODAIS ===== */
.btn-cancel,
.btn-save {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    font-size: 0.875rem;
}

.btn-cancel {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
}

.btn-cancel:hover:not(:disabled) {
    background: #e5e7eb;
    transform: translateY(-1px);
}

.btn-save {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white;
}

.btn-save:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
}

.btn-save:disabled,
.btn-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 768px) {
    .filtros-grid {
        grid-template-columns: 1fr;
    }
    
    .resultados-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
    
    .table-container {
        overflow-x: auto;
    }
    
    .pagination-container {
        flex-direction: column;
        gap: 1rem;
        align-items: center;
    }
    
    .pagination-controls {
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .modal-content {
        max-width: 95vw;
        margin: 0.5rem;
    }
    
    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 1rem;
    }
    
    .detalhes-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .form-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .modal-footer {
        flex-direction: column;
    }
}
`;

if (!document.querySelector('#historico-styles')) {
    historicoStyles.id = 'historico-styles';
    document.head.appendChild(historicoStyles);
}

// Função de renderização
function renderHistoricoReact() {
    console.log('🔍 Debug - Tentando renderizar HistoricoReact');
    console.log('🔍 Debug - Dados:', window.historicoData);
    
    const container = document.getElementById('historico-react-root');
    console.log('🔍 Debug - Container encontrado:', container);
    
    if (container && window.historicoData && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
        console.log('✅ Todos os requisitos atendidos, inicializando React...');
        const root = ReactDOM.createRoot ? ReactDOM.createRoot(container) : null;
        
        if (root) {
            // React 18
            console.log('✅ Renderizando com React 18');
            root.render(React.createElement(HistoricoReact, window.historicoData));
        } else {
            // React 17
            console.log('✅ Renderizando com React 17');
            ReactDOM.render(
                React.createElement(HistoricoReact, window.historicoData),
                container
            );
        }
    } else {
        console.error('❌ Erro: Container ou dados não encontrados', {
            container: container,
            dados: window.historicoData
        });
        
        // Fallback simples
        if (container) {
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center; background: white; border-radius: 12px; margin: 2rem;">
                    <div style="color: #dc2626; font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <h3 style="color: #374151; margin-bottom: 1rem;">Erro ao carregar histórico</h3>
                    <p style="color: #6b7280; margin-bottom: 2rem;">
                        Não foi possível carregar o componente de histórico.
                    </p>
                    <button onclick="window.location.reload()" style="
                        background: #6366f1; 
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
window.HistoricoReact = HistoricoReact;

// Exportar como módulo ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HistoricoReact;
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderHistoricoReact);
} else {
    renderHistoricoReact();
}

// Export para ES6 modules
export default HistoricoReact;

