// Componente React para Configurações - Versão sem JSX
(function() {
    'use strict';

    function ConfiguracoesReact(props) {
        const { usuario, dataAtual, estatisticas, totalUsuarios, isStaff, messages } = props;
        const [activeSection, setActiveSection] = React.useState('sistema');
        const [showToast, setShowToast] = React.useState(false);
        const [toastMessage, setToastMessage] = React.useState('');
        const [toastType, setToastType] = React.useState('success');

        React.useEffect(() => {
            // Adicionar estilos ao head
            const style = document.createElement('style');
            style.id = 'configuracoes-react-styles';
            style.textContent = `
                .configuracoes-react {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 2rem 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .main-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                .modern-breadcrumb {
                    margin-bottom: 2rem;
                    animation: slideInLeft 0.8s ease-out;
                }

                .breadcrumb-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    padding: 1rem 1.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                }

                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }

                .breadcrumb-link {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: rgba(255, 255, 255, 0.9);
                    text-decoration: none;
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    font-size: 0.95rem;
                }

                .breadcrumb-link:hover {
                    background: rgba(255, 255, 255, 0.15);
                    color: white;
                    text-decoration: none;
                    transform: translateY(-1px);
                }

                .breadcrumb-link i {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }

                .breadcrumb-arrow {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.8rem;
                    margin: 0 0.2rem;
                }

                .breadcrumb-current {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: white;
                    font-weight: 600;
                    padding: 0.5rem 0.75rem;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    font-size: 0.95rem;
                }

                .breadcrumb-current i {
                    font-size: 0.9rem;
                    opacity: 0.9;
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

                .header-right {
                    display: flex;
                    gap: 2rem;
                }

                .header-info {
                    text-align: center;
                    color: white;
                }

                .header-info .value {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }

                .header-info .label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }

                .navigation-tabs {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    overflow-x: auto;
                    padding: 0.5rem;
                    animation: slideInLeft 0.8s ease-out;
                }

                .nav-tab {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    border-radius: 15px;
                    padding: 1rem 2rem;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(5px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .nav-tab:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }

                .nav-tab.active {
                    background: rgba(255, 255, 255, 0.3);
                    border-color: rgba(255, 255, 255, 0.5);
                    transform: translateY(-2px);
                }

                .content-section {
                    animation: fadeIn 0.6s ease-out;
                }

                .section-title {
                    color: white;
                    font-size: 1.8rem;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    font-weight: 600;
                }

                .modern-card {
                    border-radius: 20px;
                    overflow: hidden;
                    position: relative;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    margin-bottom: 1.5rem;
                    height: 300px;
                }

                .modern-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }

                .card-content {
                    position: relative;
                    z-index: 2;
                    padding: 2rem;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    color: white;
                }

                .card-icon {
                    text-align: center;
                    margin-bottom: 1rem;
                    font-size: 3rem;
                    opacity: 0.9;
                }

                .card-body {
                    flex: 1;
                    text-align: center;
                }

                .card-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .card-description {
                    font-size: 1rem;
                    opacity: 0.9;
                    margin-bottom: 1rem;
                }

                .card-details {
                    font-size: 0.85rem;
                    opacity: 0.7;
                    display: block;
                    margin-bottom: 1.5rem;
                }

                .card-action {
                    text-align: center;
                }

                .btn-action {
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 25px;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    font-weight: 500;
                    backdrop-filter: blur(5px);
                }

                .btn-action:hover {
                    background: rgba(255, 255, 255, 0.3);
                    color: white;
                    transform: translateY(-2px);
                    text-decoration: none;
                }

                .btn-action.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .card-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.1);
                    z-index: 1;
                }

                .back-button {
                    position: fixed;
                    bottom: 2rem;
                    left: 2rem;
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 25px;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 500;
                    z-index: 100;
                }

                .back-button:hover {
                    background: rgba(255, 255, 255, 0.3);
                    color: white;
                    transform: translateY(-2px);
                    text-decoration: none;
                }

                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                @media (max-width: 768px) {
                    .header-content {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .header-right {
                        justify-content: center;
                    }
                    
                    .navigation-tabs {
                        justify-content: center;
                    }
                    
                    .nav-tab {
                        padding: 0.75rem 1.5rem;
                    }
                    
                    .back-button {
                        position: static;
                        margin: 2rem auto;
                        display: inline-flex;
                    }
                }
            `;
            
            // Remove estilo antigo se existir
            const oldStyle = document.getElementById('configuracoes-react-styles');
            if (oldStyle) {
                oldStyle.remove();
            }
            
            document.head.appendChild(style);
            
            return () => {
                const currentStyle = document.getElementById('configuracoes-react-styles');
                if (currentStyle) {
                    currentStyle.remove();
                }
            };
        }, []);

        React.useEffect(() => {
            if (messages && messages.length > 0) {
                setToastMessage(messages[0].message);
                setToastType(messages[0].tags || 'info');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 5000);
            }
        }, [messages]);

        const sections = [
            { id: 'sistema', icon: 'fas fa-server', title: 'Sistema' },
            { id: 'usuario', icon: 'fas fa-user', title: 'Usuário' },
            ...(isStaff ? [{ id: 'gerenciamento', icon: 'fas fa-users-cog', title: 'Gerenciamento' }] : []),
            { id: 'ajuda', icon: 'fas fa-question-circle', title: 'Ajuda' }
        ];

        const getSectionCards = (sectionId) => {
            switch(sectionId) {
                case 'sistema':
                    return [
                        {
                            icon: 'fas fa-database',
                            title: 'Backup',
                            description: 'Faça backup dos dados do sistema',
                            details: `${estatisticas.total_unidades} unidades • ${estatisticas.total_chamadas} chamadas`,
                            action: 'Fazer Backup',
                            url: '/accounts/sistema/backup/',
                            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        },
                        {
                            icon: 'fas fa-chart-bar',
                            title: 'Relatórios',
                            description: 'Visualize relatórios do sistema',
                            details: 'Estatísticas • Análises',
                            action: 'Ver Relatórios',
                            url: '/accounts/sistema/relatorios/',
                            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                        }
                    ];
                case 'usuario':
                    return [
                        {
                            icon: 'fas fa-user-edit',
                            title: 'Editar Perfil',
                            description: 'Altere seus dados pessoais',
                            details: 'Nome • Email • Foto',
                            action: 'Editar',
                            url: '/accounts/configuracoes/perfil/',
                            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                        },
                        {
                            icon: 'fas fa-key',
                            title: 'Alterar Senha',
                            description: 'Modifique sua senha de acesso',
                            details: 'Segurança • Privacidade',
                            action: 'Alterar',
                            url: '/accounts/configuracoes/senha/',
                            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                        },
                        {
                            icon: 'fas fa-bell',
                            title: 'Notificações',
                            description: 'Configure alertas e avisos',
                            details: 'Email • Sistema',
                            action: 'Configurar',
                            url: '/accounts/configuracoes/notificacoes/',
                            gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                        }
                    ];
                case 'gerenciamento':
                    return [
                        {
                            icon: 'fas fa-user-plus',
                            title: 'Criar Usuário',
                            description: 'Adicione novos usuários ao sistema',
                            details: `${totalUsuarios} usuários cadastrados`,
                            action: 'Criar',
                            url: '/accounts/usuarios/criar/',
                            gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
                        },
                        {
                            icon: 'fas fa-users',
                            title: 'Gerenciar Usuários',
                            description: 'Edite e gerencie usuários existentes',
                            details: 'Editar • Desativar • Permissões',
                            action: 'Gerenciar',
                            url: '/accounts/usuarios/gerenciar/',
                            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }
                    ];
                case 'ajuda':
                    return [
                        {
                            icon: 'fas fa-book',
                            title: 'Manual',
                            description: 'Guia completo de uso do sistema',
                            details: 'Documentação • Tutoriais',
                            action: 'Acessar Manual',
                            url: '/accounts/configuracoes/manual/',
                            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        },
                        {
                            icon: 'fas fa-headset',
                            title: 'Suporte',
                            description: 'Entre em contato com o suporte técnico',
                            details: 'Chat • Email',
                            action: 'Em Breve',
                            url: '#',
                            gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
                            disabled: true
                        },
                        {
                            icon: 'fas fa-info-circle',
                            title: 'Sobre',
                            description: 'Informações sobre o sistema',
                            details: 'Versão 1.0 • Central de Regulação - MS',
                            action: 'Em Breve',
                            url: '#',
                            gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                            disabled: true
                        }
                    ];
                default:
                    return [];
            }
        };

        const activeCards = getSectionCards(activeSection);
        const currentSection = sections.find(s => s.id === activeSection);

        return React.createElement('div', { className: 'configuracoes-react' },
            React.createElement('div', { className: 'main-container' },
                // Breadcrumb moderno
                React.createElement('div', { className: 'modern-breadcrumb' },
                    React.createElement('div', { className: 'breadcrumb-card' },
                        React.createElement('nav', { className: 'breadcrumb-nav' },
                            React.createElement('a', { 
                                href: '/accounts/', 
                                className: 'breadcrumb-link'
                            },
                                React.createElement('i', { className: 'fas fa-home' }),
                                React.createElement('span', null, 'Dashboard')
                            ),
                            React.createElement('div', { className: 'breadcrumb-arrow' },
                                React.createElement('i', { className: 'fas fa-chevron-right' })
                            ),
                            React.createElement('span', { className: 'breadcrumb-current' },
                                React.createElement('i', { className: 'fas fa-cog' }),
                                React.createElement('span', null, 'Configurações')
                            )
                        )
                    )
                ),

                // Header
                React.createElement('div', { className: 'header-section' },
                    React.createElement('div', { className: 'header-content' },
                        React.createElement('div', { className: 'header-left' },
                            React.createElement('div', { className: 'header-icon' },
                                React.createElement('i', { className: 'fas fa-cog' })
                            ),
                            React.createElement('div', { className: 'header-text' },
                                React.createElement('h1', null, 'Configurações do Sistema'),
                                React.createElement('p', null, 'Gerencie configurações e preferências do usuário')
                            )
                        ),
                        React.createElement('div', { className: 'header-right' },
                            React.createElement('div', { className: 'header-info' },
                                React.createElement('div', { className: 'value' }, usuario.first_name || usuario.username),
                                React.createElement('div', { className: 'label' }, 'Usuário')
                            ),
                            React.createElement('div', { className: 'header-info' },
                                React.createElement('div', { className: 'value' }, dataAtual),
                                React.createElement('div', { className: 'label' }, 'Data')
                            )
                        )
                    )
                ),

                // Navigation Tabs
                React.createElement('div', { className: 'navigation-tabs' },
                    sections.map(section =>
                        React.createElement('button', {
                            key: section.id,
                            className: `nav-tab ${activeSection === section.id ? 'active' : ''}`,
                            onClick: () => setActiveSection(section.id)
                        },
                            React.createElement('i', { className: section.icon }),
                            section.title
                        )
                    )
                ),

                // Content
                React.createElement('div', { className: 'content-section' },
                    React.createElement('h2', { className: 'section-title' },
                        React.createElement('i', { className: currentSection?.icon }),
                        ' ',
                        currentSection?.title
                    ),
                    React.createElement('div', { className: 'row' },
                        activeCards.map((card, index) =>
                            React.createElement('div', {
                                key: index,
                                className: 'col-lg-6 col-xl-4 mb-4',
                                style: { animation: `slideInUp 0.6s ease-out ${index * 0.1}s both` }
                            },
                                React.createElement('div', {
                                    className: 'modern-card h-100',
                                    style: { background: card.gradient }
                                },
                                    React.createElement('div', { className: 'card-content' },
                                        React.createElement('div', { className: 'card-icon' },
                                            React.createElement('i', { className: `${card.icon} fa-2x` })
                                        ),
                                        React.createElement('div', { className: 'card-body' },
                                            React.createElement('h5', { className: 'card-title' }, card.title),
                                            React.createElement('p', { className: 'card-description' }, card.description),
                                            React.createElement('small', { className: 'card-details' }, card.details)
                                        ),
                                        React.createElement('div', { className: 'card-action' },
                                            React.createElement('a', {
                                                href: card.url,
                                                className: `btn btn-action ${card.disabled ? 'disabled' : ''}`,
                                                style: { pointerEvents: card.disabled ? 'none' : 'auto' }
                                            },
                                                React.createElement('i', { className: `fas ${card.icon.split(' ')[1]} me-2` }),
                                                card.action
                                            )
                                        )
                                    ),
                                    React.createElement('div', { className: 'card-overlay' })
                                )
                            )
                        )
                    )
                ),

                // Back Button
                React.createElement('a', {
                    href: '/accounts/',
                    className: 'back-button'
                },
                    React.createElement('i', { className: 'fas fa-arrow-left' }),
                    'Voltar ao Dashboard'
                )
            )
        );
    }

    // Exportar o componente globalmente (para compatibilidade)
    window.ConfiguracoesReact = ConfiguracoesReact;

    // Exportar como módulo ES6
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ConfiguracoesReact;
    }

})(); 