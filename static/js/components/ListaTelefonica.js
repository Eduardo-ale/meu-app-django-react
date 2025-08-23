// ListaTelefonica.js - Componente React para Lista Telefônica

const tipos = [
  { value: '', label: 'Todos os tipos' },
  { value: 'UNIDADE_EXECUTANTE', label: 'Executante' },
  { value: 'UNIDADE_SOLICITANTE', label: 'Solicitante' },
  { value: 'EXECUTANTE_SOLICITANTE', label: 'Executante/Solicitante' },
];

class ListaTelefonica extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      unidades: [],
      busca: '',
      tipo: '',
      municipio: '',
      municipios: [],
      loading: false
    };
  }

  componentDidMount() {
    this.fetchUnidades();
    this.fetchMunicipios();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.busca !== this.state.busca ||
      prevState.tipo !== this.state.tipo ||
      prevState.municipio !== this.state.municipio
    ) {
      this.fetchUnidades();
    }
  }

  fetchMunicipios = () => {
    fetch('/accounts/api/lista-telefonica/')
      .then(res => res.json())
      .then(data => {
        const lista = [...new Set(data.unidades.map(u => u.municipio).filter(Boolean))];
        this.setState({ municipios: lista });
      })
      .catch(error => {
        console.error('Erro ao buscar municípios:', error);
      });
  }

  fetchUnidades = () => {
    this.setState({ loading: true });
    const { busca, tipo, municipio } = this.state;
    const params = new URLSearchParams();
    if (busca) params.append('busca', busca);
    if (tipo) params.append('tipo', tipo);
    if (municipio) params.append('municipio', municipio);
    
    fetch(`/accounts/api/lista-telefonica/?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        this.setState({ 
          unidades: data.unidades || [],
          loading: false 
        });
      })
      .catch(error => {
        console.error('Erro ao buscar unidades:', error);
        this.setState({ loading: false });
      });
  }

  getStyles = () => ({
    card: {
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
      padding: '2rem',
      marginBottom: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.2rem',
      border: '1px solid #f1f5f9',
      transition: 'box-shadow 0.2s',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
    },
    badge: {
      padding: '0.4rem 1rem',
      borderRadius: '20px',
      fontWeight: 600,
      fontSize: '0.9rem',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    badgeExecutante: {
      background: 'linear-gradient(90deg, #10b981, #059669)',
      color: '#fff',
    },
    badgeSolicitante: {
      background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
      color: '#fff',
    },
    badgeMista: {
      background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
      color: '#fff',
    },
    cardContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.2rem',
      alignItems: 'center',
    },
    unidadeName: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#1e293b',
      marginBottom: '0.5rem',
    },
    infoGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1rem',
      color: '#374151',
    },
    cardFooter: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem',
    },
    btnLigar: {
      background: 'linear-gradient(90deg, #10b981, #059669)',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      padding: '0.7rem 1.5rem',
      fontWeight: 600,
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      boxShadow: '0 2px 8px rgba(16,185,129,0.15)',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'background 0.2s',
    },
    btnDetalhes: {
      background: '#fff',
      color: '#2563eb',
      border: '2px solid #2563eb',
      borderRadius: '10px',
      padding: '0.7rem 1.5rem',
      fontWeight: 600,
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      boxShadow: '0 2px 8px rgba(59,130,246,0.08)',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'background 0.2s, color 0.2s',
    },
    filtroBar: {
      background: 'rgba(248, 250, 252, 0.8)',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      padding: '1.5rem',
      marginBottom: '0',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      alignItems: 'center',
      border: '1px solid rgba(226, 232, 240, 0.5)',
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flex: 1,
      minWidth: '220px',
    },
    searchInput: {
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '0.7rem 1rem',
      fontSize: '1rem',
      width: '100%',
      outline: 'none',
      background: '#f8fafc',
    },
    filterSelect: {
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '0.7rem 1rem',
      fontSize: '1rem',
      background: '#f8fafc',
      minWidth: '160px',
    },
    filterBtn: {
      background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '0.7rem 1.2rem',
      fontWeight: 600,
      fontSize: '1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'background 0.2s',
    },
    clearBtn: {
      background: '#f1f5f9',
      color: '#64748b',
      border: 'none',
      borderRadius: '8px',
      padding: '0.7rem 1.2rem',
      fontWeight: 600,
      fontSize: '1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'background 0.2s',
    },
    emptyState: {
      textAlign: 'center',
      color: '#64748b',
      padding: '3rem 0',
    },
    emptyIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
      color: '#e5e7eb',
    },
    breadcrumbContainer: {
      background: 'linear-gradient(90deg, #f8fafc 60%, #e0e7ff 100%)',
      borderRadius: '14px',
      boxShadow: '0 2px 10px rgba(59,130,246,0.07)',
      padding: '1.1rem 2rem',
      marginBottom: '2.2rem',
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #e2e8f0',
      overflowX: 'auto',
      minHeight: 56,
    },
    breadcrumbList: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      width: '100%',
    },
    breadcrumbItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1.05rem',
      fontWeight: 500,
      color: '#64748b',
    },
    breadcrumbLink: {
      color: '#2563eb',
      textDecoration: 'none',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      transition: 'color 0.2s',
    },
    breadcrumbIcon: {
      color: '#3b82f6',
      fontSize: '1.2rem',
      marginRight: 2,
    },
    breadcrumbSeparator: {
      color: '#a5b4fc',
      fontSize: '1.1rem',
      margin: '0 0.4rem',
      display: 'flex',
      alignItems: 'center',
    },
    breadcrumbCurrent: {
      color: '#1e293b',
      fontWeight: 700,
      background: 'linear-gradient(90deg, #dbeafe 60%, #f1f5f9 100%)',
      borderRadius: 8,
      padding: '0.4rem 1.1rem',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: '1.08rem',
      boxShadow: '0 2px 8px rgba(59,130,246,0.08)',
    },
  })

  render() {
    const { unidades, busca, tipo, municipio, municipios, loading } = this.state;
    const styles = this.getStyles();

  return (
    <div className="lista-telefonica-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '0' }}>

      {/* Container do formulário */}
      <div className="lista-telefonica-form-container">
        <div className="form-header-lista-telefonica">
          <h2 className="form-title-lista-telefonica">
            <i className="fas fa-search"></i>
            Buscar Contatos
          </h2>
          <p className="form-subtitle-lista-telefonica">
            {unidades.length} contatos encontrados
          </p>
        </div>

        <div className="form-body-lista-telefonica">
          <form style={styles.filtroBar} onSubmit={e => { e.preventDefault(); this.fetchUnidades(); }}>
            <div style={styles.searchBox}>
              <i className="fas fa-search" style={{ color: '#64748b', fontSize: '1.2rem' }}></i>
              <input
                type="text"
                value={busca}
                onChange={e => this.setState({ busca: e.target.value })}
                placeholder="Buscar por nome, telefone, responsável..."
                style={styles.searchInput}
              />
            </div>
            <select value={tipo} onChange={e => this.setState({ tipo: e.target.value })} style={styles.filterSelect}>
              {tipos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={municipio} onChange={e => this.setState({ municipio: e.target.value })} style={styles.filterSelect}>
              <option value="">Todos os municípios</option>
              {municipios.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <button type="submit" style={styles.filterBtn} title="Filtrar">
              <i className="fas fa-search"></i> Filtrar
            </button>
            <button type="button" style={styles.clearBtn} title="Limpar filtros" onClick={() => this.setState({ busca: '', tipo: '', municipio: '' })}>
              <i className="fas fa-times"></i> Limpar
            </button>
            <a href="/accounts/unidades-saude/criar/" className="action-btn action-btn-primary" style={{ marginLeft: 'auto', background: 'linear-gradient(90deg, #3b82f6, #2563eb)', color: '#fff', borderRadius: 10, padding: '0.7rem 1.5rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-plus"></i> Nova Unidade
            </a>
          </form>
        </div>
      </div>

      {/* Container dos Resultados */}
      <div className="lista-telefonica-form-container" style={{ marginTop: '2rem' }}>
        <div className="form-header-lista-telefonica">
          <h2 className="form-title-lista-telefonica">
            <i className="fas fa-address-book"></i>
            Resultados
          </h2>
          <p className="form-subtitle-lista-telefonica">
            {loading ? 'Carregando...' : `${unidades.length} unidades encontradas`}
          </p>
        </div>

        <div className="form-body-lista-telefonica">
          <div className="unidades-grid" id="unidadesGrid">
            {loading ? (
              <div className="text-center my-5">
                <div className="loading-spinner-lista-telefonica" style={{ margin: '2rem auto' }}></div>
                <p style={{ color: '#6b7280', marginTop: '1rem' }}>Carregando contatos...</p>
              </div>
            ) : unidades.length > 0 ? (
              unidades.map(unidade => (
                <div className="unidade-card" key={unidade.id} data-tipo={unidade.tipo} data-nome={unidade.nome.toLowerCase()} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div>
                      {unidade.tipo === 'UNIDADE_EXECUTANTE' && <span style={{ ...styles.badge, ...styles.badgeExecutante }}><i className="fas fa-hospital"></i> Executante</span>}
                      {unidade.tipo === 'UNIDADE_SOLICITANTE' && <span style={{ ...styles.badge, ...styles.badgeSolicitante }}><i className="fas fa-phone-alt"></i> Solicitante</span>}
                      {unidade.tipo === 'EXECUTANTE_SOLICITANTE' && <span style={{ ...styles.badge, ...styles.badgeMista }}><i className="fas fa-hospital-user"></i> Executante/Solicitante</span>}
                    </div>
                    <a href={`/accounts/unidades-saude/${unidade.id}/visualizar/`} className="menu-trigger" title="Visualizar detalhes" style={{ color: '#2563eb', fontSize: '1.3rem' }}>
                      <i className="fas fa-eye"></i>
                    </a>
                  </div>
                  <div style={styles.cardContent}>
                    <div>
                      <div style={styles.unidadeName}>{unidade.nome}</div>
                      <div style={styles.infoGrid}>
                        <div style={styles.infoItem}><i className="fas fa-phone info-icon"></i> <span style={{ color: '#10b981', fontWeight: 600 }}><a href={`tel:${unidade.telefone}`} style={{ color: '#10b981', textDecoration: 'none' }}>{unidade.telefone}</a></span></div>
                        <div style={styles.infoItem}><i className="fas fa-user-tie info-icon"></i> <span>Responsável</span>: <span style={{ fontWeight: 500 }}>{unidade.responsavel || 'Não informado'}</span></div>
                        <div style={styles.infoItem}><i className="fas fa-map-marked-alt info-icon"></i> <span>Município</span>: <span style={{ fontWeight: 500 }}>{unidade.municipio || 'Não informado'}</span></div>
                        <div style={styles.infoItem}><i className="fas fa-certificate info-icon"></i> <span>CNES</span>: <span style={{ fontWeight: 500 }}>{unidade.cnes || 'Não informado'}</span></div>
                      </div>
                    </div>
                  </div>
                  <div style={styles.cardFooter}>
                    <a href={`tel:${unidade.telefone}`} style={styles.btnLigar}><i className="fas fa-phone"></i> Ligar</a>
                    <a href={`/accounts/unidades-saude/${unidade.id}/visualizar/`} style={styles.btnDetalhes}><i className="fas fa-info-circle"></i> Detalhes</a>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}><i className="fas fa-phone-slash"></i></div>
                <h3>Nenhum contato encontrado</h3>
                <p>Não foram encontradas unidades de saúde com os filtros aplicados.</p>
                <div className="empty-actions" style={{ marginTop: 16 }}>
                  <button className="btn btn-primary" style={styles.filterBtn} onClick={() => this.setState({ busca: '', tipo: '', municipio: '' })}>
                    <i className="fas fa-refresh"></i> Limpar filtros
                  </button>
                  <a href="/accounts/unidades-saude/criar/" className="btn btn-outline-secondary" style={styles.btnDetalhes}>
                    <i className="fas fa-plus"></i> Adicionar unidade
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    );
  }
}

// Função de renderização
function renderListaTelefonica() {
    console.log('🔍 Debug - Tentando renderizar ListaTelefonica');
    
    const container = document.getElementById('lista-telefonica-root');
    console.log('🔍 Debug - Container encontrado:', container);
    
    if (container && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
        console.log('✅ Todos os requisitos atendidos, inicializando React...');
        const root = ReactDOM.createRoot ? ReactDOM.createRoot(container) : null;
        
        if (root) {
            // React 18
            console.log('✅ Renderizando com React 18');
            root.render(React.createElement(ListaTelefonica, {}));
        } else {
            // React 17
            console.log('✅ Renderizando com React 17');
            ReactDOM.render(
                React.createElement(ListaTelefonica, {}),
                container
            );
        }
    } else {
        console.error('❌ Erro: Container ou dados não encontrados', {
            container: container,
            React: typeof React,
            ReactDOM: typeof ReactDOM
        });
        
        // Fallback simples
        if (container) {
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center; background: white; border-radius: 12px; margin: 2rem;">
                    <div style="color: #dc2626; font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <h3 style="color: #374151; margin-bottom: 1rem;">Erro ao carregar lista telefônica</h3>
                    <p style="color: #6b7280; margin-bottom: 2rem;">
                        Não foi possível carregar o componente de lista telefônica.
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
window.ListaTelefonica = ListaTelefonica;

// Exportar como módulo ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ListaTelefonica;
}

// NÃO inicializar automaticamente - deixar para o template
console.log('✅ Componente ListaTelefonica registrado globalmente');

// Export para ES6 modules
export default ListaTelefonica; 