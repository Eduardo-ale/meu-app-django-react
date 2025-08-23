// Componente React para Relatórios do Sistema
(function() {
    'use strict';

    function RelatoriosReact(props) {
        const { usuario, dataAtual, statsGerais, usuariosStats, unidadesStats, chamadasStats, analises, graficosData, exportUrls } = props;
        const [activeTab, setActiveTab] = React.useState('geral');
        const [selectedPeriod, setSelectedPeriod] = React.useState('12');
        const [showFilter, setShowFilter] = React.useState(false);
        const [showPeriodDropdown, setShowPeriodDropdown] = React.useState(false);

        // Definição das abas de navegação modernizadas
        const tabs = [
            { 
                id: 'geral', 
                title: 'Visão Geral', 
                icon: 'fas fa-chart-line',
                description: 'Estatísticas gerais do sistema',
                color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            { 
                id: 'usuarios', 
                title: 'Usuários', 
                icon: 'fas fa-users',
                description: 'Relatórios de usuários',
                color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
            },
            { 
                id: 'unidades', 
                title: 'Unidades', 
                icon: 'fas fa-hospital',
                description: 'Dados das unidades de saúde',
                color: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)'
            },
            { 
                id: 'chamadas', 
                title: 'Chamadas', 
                icon: 'fas fa-phone',
                description: 'Análise de chamadas',
                color: 'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)'
            },
            { 
                id: 'analises', 
                title: 'Insights', 
                icon: 'fas fa-lightbulb',
                description: 'Análises e insights',
                color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
            }
        ];

        // Função para lidar com mudança de período
        const handlePeriodChange = (period) => {
            setSelectedPeriod(period);
            setShowPeriodDropdown(false);
            console.log(`Período alterado para: ${period} meses`);
        };

        // Função para fazer download
        const handleExport = (format) => {
            let url;
            switch(format) {
                case 'excel':
                    url = exportUrls?.geral_excel || '/accounts/sistema/relatorios/export-excel/';
                    break;
                case 'csv':
                    url = exportUrls?.geral_csv || '/accounts/sistema/relatorios/export-csv/';
                    break;
                case 'pdf':
                    url = exportUrls?.geral_pdf || '/accounts/sistema/relatorios/export-pdf/';
                    break;
                default:
                    return;
            }
            
            console.log(`Exportando relatório em formato ${format} via ${url}`);
            window.open(url, '_blank');
        };

        React.useEffect(() => {
            // Fechar dropdown quando clicar fora
            const handleClickOutside = (event) => {
                if (showPeriodDropdown && !event.target.closest('.period-selector-container')) {
                    setShowPeriodDropdown(false);
                }
            };

            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }, [showPeriodDropdown]);

        React.useEffect(() => {
            // Adicionar estilos ao head
            const style = document.createElement('style');
            style.id = 'relatorios-react-styles';
            style.textContent = `
                .relatorios-react {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 2rem 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    position: relative;
                    overflow-x: hidden;
                }

                .relatorios-react::before {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: 
                        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
                    pointer-events: none;
                    z-index: 0;
                }

                .main-container {
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 0 1rem;
                    position: relative;
                    z-index: 1;
                }

                .header-section {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    animation: fadeInDown 0.8s ease-out;
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex: 1;
                }

                .header-icon {
                    width: 80px;
                    height: 80px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 2rem;
                    animation: pulse 2s infinite;
                }

                .header-text h1 {
                    color: white;
                    margin: 0;
                    font-size: 2.5rem;
                    font-weight: 700;
                }

                .header-text p {
                    color: rgba(255, 255, 255, 0.8);
                    margin: 0;
                    font-size: 1.1rem;
                }

                .header-controls {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    flex-wrap: wrap;
                    overflow: visible;
                    position: relative;
                }

                .export-buttons {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }

                .export-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 10px;
                    padding: 0.5rem 1rem;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }

                .export-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    color: white;
                    text-decoration: none;
                    transform: translateY(-2px);
                }

                .export-btn.excel {
                    background: rgba(33, 150, 83, 0.3);
                    border-color: rgba(33, 150, 83, 0.5);
                }

                .export-btn.csv {
                    background: rgba(52, 152, 219, 0.3);
                    border-color: rgba(52, 152, 219, 0.5);
                }

                .export-btn.pdf {
                    background: rgba(231, 76, 60, 0.3);
                    border-color: rgba(231, 76, 60, 0.5);
                }

                .period-selector {
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 15px;
                    padding: 0.75rem 1rem;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .period-selector:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .period-selector-container {
                    position: relative;
                    overflow: visible;
                    z-index: 10000;
                }

                .period-selector {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 15px;
                    padding: 0.75rem 1rem;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 200px;
                }

                .period-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    padding: 0.5rem;
                    margin-top: 0.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    z-index: 10005;
                    animation: fadeInDown 0.3s ease-out;
                    max-height: 200px;
                    overflow-y: auto;
                }

                .period-option {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    color: #333;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.2s ease;
                }

                .period-option:hover {
                    background: rgba(102, 126, 234, 0.1);
                    color: #667eea;
                }

                .period-option i {
                    font-size: 0.8rem;
                    color: #667eea;
                }

                .navigation-tabs {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 1rem;
                    margin-bottom: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    animation: slideInLeft 0.8s ease-out 0.2s both;
                }

                .tab-buttons {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .tab-button {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 15px;
                    padding: 1rem 1.5rem;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 500;
                }

                .tab-button.active {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                }

                .tab-button:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-1px);
                }

                .content-section {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    animation: slideInUp 0.8s ease-out 0.4s both;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
                    border-radius: 15px;
                    padding: 1.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    transition: all 0.3s ease;
                    animation: fadeIn 0.6s ease-out;
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%);
                }

                .stat-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }

                .stat-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.5rem;
                }

                .stat-icon.users { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                .stat-icon.active { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
                .stat-icon.admin { background: linear-gradient(135deg, #fc466b 0%, #3f5efb 100%); }
                .stat-icon.units { background: linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%); }
                .stat-icon.calls { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }

                .stat-title {
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 600;
                    opacity: 0.9;
                }

                .stat-value {
                    color: white;
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin: 0.5rem 0;
                }

                .stat-change {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.8rem;
                }

                .users-table {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 15px;
                    overflow: hidden;
                    margin-bottom: 2rem;
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .users-table th,
                .users-table td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .users-table th {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .users-table tbody tr {
                    transition: all 0.3s ease;
                }
                
                .users-table tbody tr:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .chart-card {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 15px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                }
                
                .chart-header {
                    margin-bottom: 1.5rem;
                }
                
                .chart-title {
                    color: white;
                    font-size: 1.3rem;
                    font-weight: 600;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .chart-content {
                    color: white;
                }

                .table-header {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .table-title {
                    color: white;
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin: 0;
                }

                .table-content {
                    padding: 1rem;
                }

                .user-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    margin-bottom: 0.5rem;
                    transition: all 0.3s ease;
                }

                .user-row:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateX(5px);
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex: 1;
                }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                }

                .user-details h4 {
                    color: white;
                    margin: 0;
                    font-size: 1rem;
                }

                .user-details p {
                    color: rgba(255, 255, 255, 0.7);
                    margin: 0;
                    font-size: 0.8rem;
                }

                .user-stats {
                    display: flex;
                    gap: 2rem;
                    align-items: center;
                }

                .user-stat {
                    text-align: center;
                }

                .user-stat-value {
                    color: white;
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin: 0;
                }

                .user-stat-label {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.7rem;
                    margin: 0;
                }

                .user-badge {
                    padding: 0.3rem 0.8rem;
                    border-radius: 15px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .badge-gold { background: linear-gradient(135deg, #f39c12 0%, #f1c40f 100%); color: #2c3e50; }
                .badge-silver { background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%); color: #2c3e50; }
                .badge-bronze { background: linear-gradient(135deg, #d35400 0%, #e67e22 100%); color: white; }
                .badge-blue { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; }

                .insights-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .insight-card {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 15px;
                    padding: 1.5rem;
                    border-left: 4px solid;
                    transition: all 0.3s ease;
                }

                .insight-card.positivo { border-left-color: #27ae60; }
                .insight-card.negativo { border-left-color: #e74c3c; }
                .insight-card.alerta { border-left-color: #f39c12; }
                .insight-card.destaque { border-left-color: #9b59b6; }
                .insight-card.info { border-left-color: #3498db; }

                .insight-card:hover {
                    transform: translateY(-3px);
                    background: rgba(255, 255, 255, 0.15);
                }

                .insight-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                    color: white;
                }

                .insight-icon.positivo { background: #27ae60; }
                .insight-icon.negativo { background: #e74c3c; }
                .insight-icon.alerta { background: #f39c12; }
                .insight-icon.destaque { background: #9b59b6; }
                .insight-icon.info { background: #3498db; }

                .insight-title {
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0 0 0.5rem 0;
                }

                .insight-description {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.9rem;
                    line-height: 1.5;
                    margin: 0;
                }

                .chart-container {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 15px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .chart-title {
                    color: white;
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin: 0 0 1rem 0;
                    text-align: center;
                }

                .progress-container {
                    margin-bottom: 1rem;
                }

                .progress-label {
                    display: flex;
                    justify-content: space-between;
                    color: white;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }

                .progress-bar {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    height: 8px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    border-radius: 10px;
                    transition: width 1s ease-out;
                    animation: progressFill 1.5s ease-out;
                }

                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-50px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-50px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                @keyframes progressFill {
                    from { width: 0; }
                }

                /* ===== NAVIGATION TABS MODERNIZADAS ===== */
                .navigation-tabs {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    animation: slideInUp 0.8s ease-out 0.2s both;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .nav-tab {
                    background: rgba(255, 255, 255, 0.08);
                    border: 2px solid rgba(255, 255, 255, 0.15);
                    color: rgba(255, 255, 255, 0.9);
                    padding: 1rem 1.5rem;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
                    font-family: inherit;
                    font-size: 0.95rem;
                    font-weight: 600;
                    backdrop-filter: blur(15px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    position: relative;
                    overflow: hidden;
                    min-width: 120px;
                    text-align: center;
                }

                .nav-tab::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                    transition: left 0.6s ease;
                }

                .nav-tab:hover::before {
                    left: 100%;
                }

                .nav-tab i {
                    font-size: 1.25rem;
                    margin-bottom: 0.25rem;
                    position: relative;
                    z-index: 1;
                }

                .nav-tab span {
                    font-size: 0.85rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    position: relative;
                    z-index: 1;
                }

                .nav-tab.active {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.4);
                    color: white;
                    transform: translateY(-4px) scale(1.05);
                    box-shadow: 
                        0 10px 30px rgba(0, 0, 0, 0.3),
                        0 0 0 1px rgba(255, 255, 255, 0.2);
                }

                .nav-tab:hover {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                    color: white;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                }

                .nav-tab:active {
                    transform: translateY(-1px);
                }

                /* ===== RESPONSIVIDADE AVANÇADA ===== */
                @media (max-width: 1024px) {
                    .navigation-tabs {
                        gap: 0.75rem;
                        padding: 0.75rem;
                    }
                    
                    .nav-tab {
                        min-width: 100px;
                        padding: 0.75rem 1rem;
                    }
                }

                @media (max-width: 768px) {
                    .header-content {
                        flex-direction: column;
                        text-align: center;
                        gap: 1.5rem;
                    }

                    .header-text h1 {
                        font-size: 2rem;
                    }

                    .navigation-tabs {
                        gap: 0.5rem;
                        padding: 0.75rem;
                        flex-wrap: wrap;
                    }

                    .nav-tab {
                        min-width: 80px;
                        padding: 0.75rem;
                        font-size: 0.85rem;
                    }

                    .nav-tab i {
                        font-size: 1.1rem;
                    }

                    .nav-tab span {
                        font-size: 0.75rem;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .user-stats {
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .insights-grid {
                        grid-template-columns: 1fr;
                    }

                    .export-buttons {
                        flex-wrap: wrap;
                        justify-content: center;
                        gap: 0.5rem;
                    }

                    .header-controls {
                        flex-direction: column;
                        width: 100%;
                    }
                }
            `;

            if (!document.head.querySelector('#relatorios-react-styles')) {
                document.head.appendChild(style);
            }

            return () => {
                const existingStyle = document.head.querySelector('#relatorios-react-styles');
                if (existingStyle) {
                    existingStyle.remove();
                }
            };
        }, []);

        const renderStatsCard = (title, value, description, icon, color = 'rgba(255, 255, 255, 0.2)') => (
            React.createElement('div', { className: 'stat-card' },
                React.createElement('div', { className: 'stat-header' },
                    React.createElement('div', { className: 'stat-icon', style: { background: color } },
                        React.createElement('i', { className: icon })
                    ),
                    React.createElement('div', { className: 'stat-title' }, title)
                ),
                React.createElement('div', { className: 'stat-value' }, value),
                React.createElement('div', { className: 'stat-description' }, description)
            )
        );

        const renderTopUsers = () => {
            if (!usuariosStats.top_usuarios || usuariosStats.top_usuarios.length === 0) {
                return React.createElement('div', { className: 'chart-content' },
                    React.createElement('p', null, 'Nenhum dado de usuário disponível')
                );
            }

            return React.createElement('table', { className: 'users-table' },
                React.createElement('thead', null,
                    React.createElement('tr', null,
                        React.createElement('th', null, 'Usuário'),
                        React.createElement('th', null, 'Chamadas'),
                        React.createElement('th', null, 'Resolvidas'),
                        React.createElement('th', null, 'Taxa'),
                        React.createElement('th', null, 'Nível'),
                        React.createElement('th', null, 'Atividade')
                    )
                ),
                React.createElement('tbody', null,
                    usuariosStats.top_usuarios.slice(0, 10).map((user, index) =>
                        React.createElement('tr', { key: index },
                            React.createElement('td', null,
                                React.createElement('div', { className: 'user-info' },
                                    React.createElement('div', { className: 'user-avatar' },
                                        (user.usuario.get_full_name ? user.usuario.get_full_name() : user.usuario.username).charAt(0).toUpperCase()
                                    ),
                                    React.createElement('div', null,
                                        React.createElement('div', { className: 'user-name' },
                                            user.usuario.get_full_name ? user.usuario.get_full_name() : user.usuario.username
                                        ),
                                        React.createElement('div', { className: 'user-role' },
                                            user.usuario.is_staff ? 'Administrador' : 'Usuário'
                                        )
                                    )
                                )
                            ),
                            React.createElement('td', null, user.total_chamadas),
                            React.createElement('td', null, user.chamadas_resolvidas),
                            React.createElement('td', null,
                                React.createElement('div', null,
                                    `${user.taxa_resolucao}%`,
                                    React.createElement('div', { className: 'progress-bar' },
                                        React.createElement('div', {
                                            className: 'progress-fill',
                                            style: { width: `${user.taxa_resolucao}%` }
                                        })
                                    )
                                )
                            ),
                            React.createElement('td', null,
                                React.createElement('span', {
                                    className: `badge badge-${user.cor_nivel}`
                                }, user.nivel)
                            ),
                            React.createElement('td', null, user.atividade_recente)
                        )
                    )
                )
            );
        };

        const renderContent = () => {
            switch (activeTab) {
                case 'geral':
                    return React.createElement('div', null,
                        React.createElement('div', { className: 'stats-grid' },
                            renderStatsCard(
                                'Total de Usuários',
                                statsGerais.total_usuarios,
                                'Usuários cadastrados no sistema',
                                'fas fa-users',
                                'rgba(59, 130, 246, 0.3)'
                            ),
                            renderStatsCard(
                                'Usuários Ativos',
                                statsGerais.usuarios_ativos,
                                'Usuários ativos atualmente',
                                'fas fa-user-check',
                                'rgba(34, 197, 94, 0.3)'
                            ),
                            renderStatsCard(
                                'Total de Unidades',
                                statsGerais.total_unidades,
                                'Unidades de saúde cadastradas',
                                'fas fa-hospital',
                                'rgba(168, 85, 247, 0.3)'
                            ),
                            renderStatsCard(
                                'Total de Chamadas',
                                statsGerais.total_chamadas,
                                'Chamadas registradas no sistema',
                                'fas fa-phone',
                                'rgba(239, 68, 68, 0.3)'
                            )
                        ),
                        React.createElement('div', { className: 'export-buttons' },
                            React.createElement('a', {
                                href: exportUrls?.geral_excel || '#',
                                className: 'export-btn excel',
                                onClick: () => handleExport('excel')
                            },
                                React.createElement('i', { className: 'fas fa-file-excel' }),
                                'Excel'
                            ),
                            React.createElement('a', {
                                href: exportUrls?.geral_csv || '#',
                                className: 'export-btn csv',
                                onClick: () => handleExport('csv')
                            },
                                React.createElement('i', { className: 'fas fa-file-csv' }),
                                'CSV'
                            ),
                            React.createElement('a', {
                                href: exportUrls?.geral_pdf || '#',
                                className: 'export-btn pdf',
                                onClick: () => handleExport('pdf')
                            },
                                React.createElement('i', { className: 'fas fa-file-pdf' }),
                                'PDF'
                            )
                        )
                    );

                case 'usuarios':
                    return React.createElement('div', null,
                        React.createElement('div', { className: 'stats-grid' },
                            renderStatsCard(
                                'Usuários Comuns',
                                usuariosStats.por_tipo.usuarios_comuns,
                                'Usuários sem privilégios administrativos',
                                'fas fa-user'
                            ),
                            renderStatsCard(
                                'Administradores',
                                usuariosStats.por_tipo.administradores,
                                'Usuários com privilégios administrativos',
                                'fas fa-user-shield'
                            ),
                            renderStatsCard(
                                'Novos Este Mês',
                                usuariosStats.usuarios_mes_atual,
                                'Usuários cadastrados este mês',
                                'fas fa-user-plus'
                            )
                        ),
                        React.createElement('div', { className: 'chart-card' },
                            React.createElement('div', { className: 'chart-header' },
                                React.createElement('h3', { className: 'chart-title' },
                                    React.createElement('i', { className: 'fas fa-trophy' }),
                                    ' Top Usuários Mais Ativos'
                                )
                            ),
                            renderTopUsers()
                        )
                    );

                case 'unidades':
                    return React.createElement('div', null,
                        React.createElement('div', { className: 'stats-grid' },
                            Object.entries(unidadesStats.por_tipo).map(([tipo, count]) =>
                                renderStatsCard(
                                    tipo,
                                    count,
                                    `Unidades do tipo ${tipo}`,
                                    'fas fa-hospital'
                                )
                            )
                        ),
                        React.createElement('div', { className: 'chart-card' },
                            React.createElement('div', { className: 'chart-header' },
                                React.createElement('h3', { className: 'chart-title' },
                                    React.createElement('i', { className: 'fas fa-map-marker-alt' }),
                                    ' Unidades por Município'
                                )
                            ),
                            React.createElement('div', { className: 'chart-content' },
                                React.createElement('table', { className: 'users-table' },
                                    React.createElement('thead', null,
                                        React.createElement('tr', null,
                                            React.createElement('th', null, 'Município'),
                                            React.createElement('th', null, 'Quantidade'),
                                            React.createElement('th', null, 'Percentual')
                                        )
                                    ),
                                    React.createElement('tbody', null,
                                        Object.entries(unidadesStats.por_municipio).map(([municipio, count]) =>
                                            React.createElement('tr', { key: municipio },
                                                React.createElement('td', null, municipio),
                                                React.createElement('td', null, count),
                                                React.createElement('td', null,
                                                    React.createElement('div', { className: 'progress-bar' },
                                                        React.createElement('div', {
                                                            className: 'progress-fill',
                                                            style: { width: `${(count / statsGerais.total_unidades * 100)}%` }
                                                        })
                                                    ),
                                                    `${((count / statsGerais.total_unidades) * 100).toFixed(1)}%`
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    );

                case 'chamadas':
                    // Se é administrador, mostra total de chamadas por usuário
                    if (chamadasStats.usuario_eh_admin) {
                        return React.createElement('div', null,
                            React.createElement('div', { className: 'stats-grid' },
                                renderStatsCard(
                                    'Total de Chamadas no Sistema',
                                    statsGerais.total_chamadas,
                                    'Todas as chamadas registradas no sistema',
                                    'fas fa-phone',
                                    'rgba(59, 130, 246, 0.3)'
                                )
                            ),
                            React.createElement('div', { className: 'chart-card' },
                                React.createElement('div', { className: 'chart-header' },
                                    React.createElement('h3', { className: 'chart-title' },
                                        React.createElement('i', { className: 'fas fa-users' }),
                                        ' Chamadas Registradas por Usuário'
                                    )
                                ),
                                React.createElement('div', { className: 'chart-content' },
                                    Object.keys(chamadasStats.por_usuario).length > 0 ? 
                                        React.createElement('table', { className: 'users-table' },
                                            React.createElement('thead', null,
                                                React.createElement('tr', null,
                                                    React.createElement('th', null, 'Usuário'),
                                                    React.createElement('th', null, 'Total de Chamadas'),
                                                    React.createElement('th', null, 'Percentual')
                                                )
                                            ),
                                            React.createElement('tbody', null,
                                                Object.entries(chamadasStats.por_usuario)
                                                    .sort(([,a], [,b]) => b - a) // Ordenar por quantidade (maior primeiro)
                                                    .map(([usuario, count]) =>
                                                        React.createElement('tr', { key: usuario },
                                                            React.createElement('td', null,
                                                                React.createElement('div', { className: 'user-info' },
                                                                    React.createElement('div', { className: 'user-avatar' },
                                                                        usuario.charAt(0).toUpperCase()
                                                                    ),
                                                                    React.createElement('div', { className: 'user-details' },
                                                                        React.createElement('h4', null, usuario),
                                                                        React.createElement('p', null, 'Usuário do sistema')
                                                                    )
                                                                )
                                                            ),
                                                            React.createElement('td', null,
                                                                React.createElement('div', { style: { 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    gap: '0.5rem',
                                                                    fontSize: '1.2rem',
                                                                    fontWeight: '600',
                                                                    color: 'white'
                                                                }},
                                                                    React.createElement('i', { 
                                                                        className: 'fas fa-phone',
                                                                        style: { color: '#3b82f6' }
                                                                    }),
                                                                    count
                                                                )
                                                            ),
                                                            React.createElement('td', null,
                                                                React.createElement('div', null,
                                                                    React.createElement('div', { className: 'progress-bar' },
                                                                        React.createElement('div', {
                                                                            className: 'progress-fill',
                                                                            style: { 
                                                                                width: `${(count / statsGerais.total_chamadas * 100)}%`,
                                                                                background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
                                                                            }
                                                                        })
                                                                    ),
                                                                    React.createElement('span', {
                                                                        style: { 
                                                                            fontSize: '0.9rem',
                                                                            fontWeight: '600',
                                                                            color: 'rgba(255, 255, 255, 0.9)'
                                                                        }
                                                                    }, `${((count / statsGerais.total_chamadas) * 100).toFixed(1)}%`)
                                                                )
                                                            )
                                                        )
                                                    )
                                            )
                                        ) :
                                        React.createElement('div', { className: 'chart-content' },
                                            React.createElement('p', {
                                                style: { 
                                                    textAlign: 'center',
                                                    color: 'rgba(255, 255, 255, 0.8)',
                                                    fontSize: '1.1rem',
                                                    padding: '2rem'
                                                }
                                            }, 'Nenhuma chamada foi registrada ainda no sistema')
                                        )
                                )
                            )
                        );
                    } else {
                        // Para usuários não-administradores, mostrar apenas suas chamadas
                        return React.createElement('div', null,
                            React.createElement('div', { className: 'stats-grid' },
                                renderStatsCard(
                                    'Suas Chamadas',
                                    chamadasStats.total_chamadas_usuario_atual,
                                    'Chamadas que você registrou no sistema',
                                    'fas fa-phone',
                                    'rgba(59, 130, 246, 0.3)'
                                )
                            ),
                            React.createElement('div', { className: 'chart-content' },
                                React.createElement('p', {
                                    style: { 
                                        textAlign: 'center',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        fontSize: '1.1rem',
                                        padding: '2rem'
                                    }
                                }, 'Para ver estatísticas detalhadas de chamadas, entre em contato com um administrador.')
                            )
                        );
                    }

                case 'analises':
                    return React.createElement('div', null,
                        React.createElement('h3', { style: { color: 'white', marginBottom: '2rem', textAlign: 'center' } },
                            React.createElement('i', { className: 'fas fa-lightbulb' }),
                            ' Insights do Sistema'
                        ),
                        analises.insights.map((insight, index) =>
                            React.createElement('div', {
                                key: index,
                                className: `insight-card insight-${insight.tipo}`
                            },
                                React.createElement('div', { className: 'insight-header' },
                                    React.createElement('div', { className: 'insight-icon' },
                                        React.createElement('i', {
                                            className: insight.tipo === 'positivo' ? 'fas fa-check-circle' : 'fas fa-star'
                                        })
                                    ),
                                    React.createElement('div', { className: 'insight-title' }, insight.titulo)
                                ),
                                React.createElement('div', { className: 'insight-description' }, insight.descricao)
                            )
                        ),
                        analises.insights.length === 0 && React.createElement('div', { className: 'chart-content' },
                            React.createElement('p', null, 'Nenhum insight disponível no momento.')
                        )
                    );

                default:
                    return React.createElement('div', null, 'Conteúdo não encontrado');
            }
        };

        return React.createElement('div', { className: 'relatorios-react' },
            React.createElement('div', { className: 'main-container' },
                // Breadcrumb
                React.createElement('div', { className: 'breadcrumb-container' },
                    React.createElement('nav', { className: 'breadcrumb' },
                        React.createElement('a', { 
                            href: '/accounts/', 
                            className: 'breadcrumb-item' 
                        },
                            React.createElement('i', { className: 'fas fa-home' }),
                            'Início'
                        ),
                        React.createElement('span', { className: 'breadcrumb-separator' }, 
                            React.createElement('i', { className: 'fas fa-chevron-right' })
                        ),
                        React.createElement('a', { 
                            href: '/accounts/configuracoes/', 
                            className: 'breadcrumb-item' 
                        },
                            React.createElement('i', { className: 'fas fa-cog' }),
                            'Configurações'
                        ),
                        React.createElement('span', { className: 'breadcrumb-separator' }, 
                            React.createElement('i', { className: 'fas fa-chevron-right' })
                        ),
                        React.createElement('span', { className: 'breadcrumb-item active' },
                            React.createElement('i', { className: 'fas fa-chart-line' }),
                            'Relatórios'
                        )
                    )
                ),

                // Header
                React.createElement('div', { className: 'header-section' },
                    React.createElement('div', { className: 'header-content' },
                        React.createElement('div', { className: 'header-left' },
                            React.createElement('div', { className: 'header-icon' },
                                React.createElement('i', { className: 'fas fa-chart-line' })
                            ),
                            React.createElement('div', { className: 'header-text' },
                                React.createElement('h1', null, 'Relatórios do Sistema'),
                                React.createElement('p', null, 'Análises e estatísticas detalhadas')
                            )
                        ),
                        React.createElement('div', { className: 'header-controls' },
                            React.createElement('div', { className: 'period-selector-container' },
                                React.createElement('div', { 
                                    className: 'period-selector',
                                    onClick: () => setShowPeriodDropdown(!showPeriodDropdown)
                                },
                                    React.createElement('i', { className: 'fas fa-calendar-alt' }),
                                    React.createElement('span', null, 
                                        selectedPeriod === '12' ? 'Últimos 12 meses' :
                                        selectedPeriod === '9' ? 'Últimos 9 meses' :
                                        selectedPeriod === '6' ? 'Últimos 6 meses' :
                                        selectedPeriod === '3' ? 'Últimos 3 meses' :
                                        selectedPeriod === '1' ? 'Último mês' :
                                        selectedPeriod === '30' ? 'Últimos 30 dias' :
                                        'Últimos 12 meses'
                                    ),
                                    React.createElement('i', { className: 'fas fa-chevron-down' })
                                ),
                                showPeriodDropdown && React.createElement('div', { className: 'period-dropdown' },
                                    React.createElement('div', { 
                                        className: 'period-option',
                                        onClick: () => handlePeriodChange('30')
                                    },
                                        React.createElement('i', { className: 'fas fa-circle' }),
                                        React.createElement('span', null, 'Últimos 30 dias')
                                    ),
                                    React.createElement('div', { 
                                        className: 'period-option',
                                        onClick: () => handlePeriodChange('1')
                                    },
                                        React.createElement('i', { className: 'fas fa-circle' }),
                                        React.createElement('span', null, 'Último mês')
                                    ),
                                    React.createElement('div', { 
                                        className: 'period-option',
                                        onClick: () => handlePeriodChange('3')
                                    },
                                        React.createElement('i', { className: 'fas fa-circle' }),
                                        React.createElement('span', null, 'Últimos 3 meses')
                                    ),
                                    React.createElement('div', { 
                                        className: 'period-option',
                                        onClick: () => handlePeriodChange('6')
                                    },
                                        React.createElement('i', { className: 'fas fa-circle' }),
                                        React.createElement('span', null, 'Últimos 6 meses')
                                    ),
                                    React.createElement('div', { 
                                        className: 'period-option',
                                        onClick: () => handlePeriodChange('9')
                                    },
                                        React.createElement('i', { className: 'fas fa-circle' }),
                                        React.createElement('span', null, 'Últimos 9 meses')
                                    ),
                                    React.createElement('div', { 
                                        className: 'period-option',
                                        onClick: () => handlePeriodChange('12')
                                    },
                                        React.createElement('i', { className: 'fas fa-circle' }),
                                        React.createElement('span', null, 'Últimos 12 meses')
                                    )
                                )
                            ),
                            React.createElement('div', { className: 'export-section' },
                                React.createElement('div', { className: 'export-label' },
                                    React.createElement('i', { className: 'fas fa-download' }),
                                    React.createElement('span', null, 'Exportar Dados')
                                ),
                                React.createElement('div', { className: 'export-buttons' },
                                    React.createElement('button', {
                                        className: 'export-btn excel-btn',
                                        onClick: () => handleExport('excel'),
                                        title: 'Exportar para Excel'
                                    },
                                        React.createElement('div', { className: 'btn-content' },
                                            React.createElement('i', { className: 'fas fa-file-excel' }),
                                            React.createElement('span', { className: 'btn-text' }, 'Excel'),
                                            React.createElement('div', { className: 'btn-description' }, '.xlsx')
                                        )
                                    ),
                                    React.createElement('button', {
                                        className: 'export-btn csv-btn',
                                        onClick: () => handleExport('csv'),
                                        title: 'Exportar para CSV'
                                    },
                                        React.createElement('div', { className: 'btn-content' },
                                            React.createElement('i', { className: 'fas fa-file-csv' }),
                                            React.createElement('span', { className: 'btn-text' }, 'CSV'),
                                            React.createElement('div', { className: 'btn-description' }, '.csv')
                                        )
                                    ),
                                    React.createElement('button', {
                                        className: 'export-btn pdf-btn',
                                        onClick: () => handleExport('pdf'),
                                        title: 'Exportar para PDF'
                                    },
                                        React.createElement('div', { className: 'btn-content' },
                                            React.createElement('i', { className: 'fas fa-file-pdf' }),
                                            React.createElement('span', { className: 'btn-text' }, 'PDF'),
                                            React.createElement('div', { className: 'btn-description' }, '.pdf')
                                        )
                                    )
                                )
                            )
                        )
                    )
                ),

                // Navigation Tabs
                React.createElement('div', { className: 'navigation-tabs' },
                    tabs.map(tab =>
                        React.createElement('button', {
                            key: tab.id,
                            className: `nav-tab ${activeTab === tab.id ? 'active' : ''}`,
                            onClick: () => setActiveTab(tab.id),
                            title: tab.description
                        },
                            React.createElement('i', { className: tab.icon }),
                            React.createElement('span', null, tab.title)
                        )
                    )
                ),

                // Content
                React.createElement('div', { className: 'content-section' },
                    renderContent()
                ),

                // Back Button
                React.createElement('a', {
                    href: '/accounts/configuracoes/',
                    className: 'back-button'
                },
                    React.createElement('i', { className: 'fas fa-arrow-left' }),
                    'Voltar às Configurações'
                )
            )
        );
    }

    // Exportar o componente globalmente (para compatibilidade)
    window.RelatoriosReact = RelatoriosReact;

    // Exportar como módulo ES6
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = RelatoriosReact;
    }

})();

// Export para ES6 modules
 