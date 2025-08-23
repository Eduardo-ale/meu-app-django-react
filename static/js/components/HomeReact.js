import React, { useState, useEffect } from 'react';

    function HomeReact(props) {
    // Adicionando valores padrão para evitar erro caso usuario ou estatisticas venham undefined
    const { usuario = {}, estatisticas = {}, ultimas_unidades = [], ultimas_chamadas = [] } = props;
    const [currentTime, setCurrentTime] = useState(new Date());

        // Atualizar hora em tempo real
    useEffect(() => {
            const timer = setInterval(() => {
                setCurrentTime(new Date());
            }, 1000);
            return () => clearInterval(timer);
        }, []);

        // Função para formatar data e hora
        const formatDateTime = (date) => {
            return date.toLocaleString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        };

        // Função para obter saudação baseada na hora
        const getSaudacao = () => {
            const hora = currentTime.getHours();
            if (hora < 12) return 'Bom dia';
            if (hora < 18) return 'Boa tarde';
            return 'Boa noite';
        };

        // Renderizar card de estatística principal
        const renderStatCard = (icon, number, label, description, colorClass, trend = '+') => (
            React.createElement('div', { className: `stat-card-modern ${colorClass}` },
                React.createElement('div', { className: 'stat-card-bg' }),
                React.createElement('div', { className: 'stat-header' },
                    React.createElement('div', { className: 'stat-icon-container' },
                        React.createElement('div', { className: 'stat-icon-modern' },
                            React.createElement('i', { className: icon }),
                            React.createElement('div', { className: 'icon-pulse-ring' })
                        )
                    ),
                    React.createElement('div', { className: 'stat-trend positive' },
                        React.createElement('i', { className: 'fas fa-arrow-up' }),
                        React.createElement('span', null, `${trend}`)
                    )
                ),
                React.createElement('div', { className: 'stat-content' },
                    React.createElement('div', { className: 'stat-number-large' }, number),
                    React.createElement('div', { className: 'stat-label-modern' }, label),
                    React.createElement('div', { className: 'stat-description' }, description)
                ),
                React.createElement('div', { className: 'stat-footer' },
                    React.createElement('div', { className: 'stat-progress' },
                        React.createElement('div', { className: 'progress-bar' },
                            React.createElement('div', { 
                                className: 'progress-fill',
                                style: { width: '85%' }
                            })
                        )
                    )
                )
            )
        );

        // Renderizar mini estatística
        const renderMiniStat = (icon, number, label, colorClass) => (
            React.createElement('div', { className: `mini-stat-card ${colorClass}` },
                React.createElement('div', { className: 'mini-stat-icon' },
                    React.createElement('i', { className: icon })
                ),
                React.createElement('div', { className: 'mini-stat-content' },
                    React.createElement('div', { className: 'mini-stat-number' }, number),
                    React.createElement('div', { className: 'mini-stat-label' }, label)
                )
            )
        );

        // Renderizar card de menu
        const renderMenuCard = (href, icon, title, description, badge, badgeClass = '', features = [], cardClass = '') => (
            React.createElement('a', { 
                href: href, 
                className: `menu-card-modern ${cardClass}`,
                style: cardClass === 'disabled' ? { pointerEvents: 'none' } : {}
            },
                React.createElement('div', { className: 'menu-card-bg' }),
                React.createElement('div', { className: 'menu-card-header' },
                    React.createElement('div', { className: 'menu-icon-modern' },
                        React.createElement('i', { className: icon })
                    ),
                    badge && React.createElement('div', { className: `menu-badge ${badgeClass}` }, badge)
                ),
                React.createElement('div', { className: 'menu-card-content' },
                    React.createElement('h3', { className: 'menu-title' }, title),
                    React.createElement('p', { className: 'menu-description' }, description),
                    features.length > 0 && React.createElement('div', { className: 'menu-features' },
                        features.map((feature, index) => 
                            React.createElement('span', { 
                                key: index, 
                                className: `feature-tag ${cardClass === 'disabled' ? 'disabled' : ''}` 
                            }, feature)
                        )
                    )
                ),
                React.createElement('div', { className: 'menu-arrow' },
                    React.createElement('i', { 
                        className: cardClass === 'disabled' ? 'fas fa-lock' : 'fas fa-arrow-right' 
                    })
                )
            )
        );

        return React.createElement('div', { className: 'home-react-container' },
            // Background animado
            React.createElement('div', { className: 'animated-background' },
                React.createElement('div', { className: 'floating-shape shape-1' }),
                React.createElement('div', { className: 'floating-shape shape-2' }),
                React.createElement('div', { className: 'floating-shape shape-3' })
            ),

            // Container principal
            React.createElement('div', { className: 'main-container' },
                // Breadcrumb
                React.createElement('div', { className: 'breadcrumb-container' },
                    React.createElement('nav', { className: 'breadcrumb-modern' },
                        React.createElement('div', { className: 'breadcrumb-item active' },
                            React.createElement('i', { className: 'fas fa-home' }),
                            React.createElement('span', null, 'Dashboard')
                        )
                    )
                ),

                // Header principal melhorado
                React.createElement('div', { className: 'hero-section' },
                    React.createElement('div', { className: 'hero-content' },
                        React.createElement('div', { className: 'hero-main' },
                            React.createElement('div', { className: 'welcome-badge' },
                                React.createElement('i', { className: 'fas fa-user-md' }),
                                React.createElement('span', null, 'Bem-vindo ao Sistema')
                            ),
                            React.createElement('h1', { className: 'hero-title' },
                            `${getSaudacao()}, ${usuario.first_name || usuario.username || 'Usuário'}!`
                            ),
                            React.createElement('p', { className: 'hero-subtitle' },
                                'Sistema de Registro de Chamadas Médicas'
                            ),
                            React.createElement('div', { className: 'hero-time' },
                                React.createElement('i', { className: 'fas fa-clock' }),
                                React.createElement('span', null, formatDateTime(currentTime))
                            )
                        ),
                        React.createElement('div', { 
                            className: 'user-profile-section',
                            'data-tooltip': usuario.avatar_url ? 'Clique para alterar sua foto' : 'Clique para adicionar sua foto'
                        },
                            usuario.avatar_url ?
                                React.createElement('img', {
                                    src: usuario.avatar_url,
                                    alt: 'Foto do usuário',
                                    className: 'user-avatar-img',
                                    onClick: () => window.openAvatarModal()
                                }) :
                                React.createElement('div', {
                                    className: 'user-avatar-placeholder',
                                    onClick: () => window.openAvatarModal()
                                },
                                    React.createElement('i', { className: 'fas fa-camera' }),
                                    React.createElement('span', { className: 'avatar-text' }, 'Adicionar Foto')
                                )
                        )
                    ),
                    React.createElement('div', { className: 'hero-decoration' },
                        React.createElement('div', { className: 'decoration-circle circle-1' }),
                        React.createElement('div', { className: 'decoration-circle circle-2' }),
                        React.createElement('div', { className: 'decoration-circle circle-3' })
                    )
                ),

                // Estatísticas principais modernizadas
                React.createElement('div', { className: 'stats-section' },
                    React.createElement('div', { className: 'section-header' },
                        React.createElement('h2', { className: 'section-title' },
                            React.createElement('i', { className: 'fas fa-chart-line' }),
                            'Estatísticas do Sistema'
                        ),
                        React.createElement('div', { className: 'section-subtitle' },
                            'Visão geral em tempo real'
                        )
                    ),
                    React.createElement('div', { className: 'stats-grid' },
                        renderStatCard(
                            'fas fa-hospital-alt',
                            estatisticas.total_unidades,
                            'Total de Unidades',
                            'Cadastradas no sistema',
                            'primary'
                        ),
                        renderStatCard(
                            'fas fa-phone-alt',
                            estatisticas.total_chamadas,
                            'Total de Chamadas',
                            'Registradas no sistema',
                            'success'
                        ),
                        renderStatCard(
                            'fas fa-calendar-day',
                            estatisticas.chamadas_hoje,
                            'Chamadas Hoje',
                            'Registradas hoje',
                            'warning'
                        ),
                        renderStatCard(
                            'fas fa-calendar-alt',
                            estatisticas.chamadas_mes,
                            'Chamadas Este Mês',
                            'Neste mês',
                            'info'
                        )
                    )
                ),

                // Distribuição de unidades
                React.createElement('div', { className: 'distribution-section' },
                    React.createElement('div', { className: 'section-header' },
                        React.createElement('h3', { className: 'section-title small' },
                            React.createElement('i', { className: 'fas fa-chart-pie' }),
                            'Distribuição de Unidades por Tipo'
                        )
                    ),
                    React.createElement('div', { className: 'mini-stats-grid' },
                        renderMiniStat(
                            'fas fa-play-circle',
                            estatisticas.executantes,
                            'Executante',
                            'executante'
                        ),
                        renderMiniStat(
                            'fas fa-hand-paper',
                            estatisticas.solicitantes,
                            'Solicitante',
                            'solicitante'
                        ),
                        renderMiniStat(
                            'fas fa-hospital-user',
                            estatisticas.executante_solicitante,
                            'Ambos',
                            'mista'
                        )
                    )
                ),

                // Menu de acesso rápido modernizado
                React.createElement('div', { className: 'quick-access-section' },
                    React.createElement('div', { className: 'section-header' },
                        React.createElement('h2', { className: 'section-title' },
                            React.createElement('i', { className: 'fas fa-th-large' }),
                            'Acesso Rápido'
                        ),
                        React.createElement('div', { className: 'section-subtitle' },
                            'Navegue rapidamente para as principais funcionalidades'
                        )
                    ),
                    React.createElement('div', { className: 'menu-grid-modern' },
                        renderMenuCard(
                            '/accounts/unidades-saude/',
                            'fas fa-hospital-alt',
                            'Unidades de Saúde',
                            'Gerencie e visualize todas as unidades de saúde cadastradas',
                            estatisticas.total_unidades,
                            'primary',
                            ['Visualizar', 'Editar', 'Exportar']
                        ),
                        renderMenuCard(
                            '/accounts/registro-chamada/',
                            'fas fa-phone-volume',
                            'Registro de Chamadas',
                            'Registre suas chamadas e ligações',
                            estatisticas.chamadas_hoje,
                            'urgent',
                            ['Emergência', 'Registro', 'Histórico']
                        ),
                        renderMenuCard(
                            '/accounts/lista-telefonica/',
                            'fas fa-phone-alt',
                            'Lista Telefônica',
                            'Consulte contatos e números de emergência',
                            'Ativo',
                            'available',
                            ['Contatos', 'Emergência', 'Busca']
                        ),
                        renderMenuCard(
                            '/accounts/historico/',
                            'fas fa-history',
                            'Histórico',
                            'Visualize o histórico completo de atendimentos',
                            'Ativo',
                            'info',
                            ['Histórico', 'Filtros', 'Relatórios']
                        ),
                        // Mostrar Relatórios apenas para administradores
                        (() => {
                            try {
                                const user = window.REACT_CONFIG?.user;
                                const isAdmin = user && (user.is_staff === true || user.is_superuser === true);
                                console.log('🔍 Verificando Relatórios - User:', user, 'isAdmin:', isAdmin);
                                
                                if (!isAdmin) {
                                    console.log('❌ Usuário não é admin - Relatórios oculto');
                                    return null;
                                }
                                
                                console.log('✅ Usuário é admin - Relatórios visível');
                                return renderMenuCard(
                                    '/accounts/sistema/relatorios/',
                                    'fas fa-chart-bar',
                                    'Relatórios',
                                    'Acesse relatórios detalhados e estatísticas',
                                    'Ativo',
                                    'warning',
                                    ['Gráficos', 'Estatísticas', 'Exportar']
                                );
                            } catch (error) {
                                console.error('❌ Erro ao verificar permissões para Relatórios:', error);
                                return null;
                            }
                        })(),
                        // Mostrar Configurações apenas para administradores
                        (() => {
                            try {
                                const user = window.REACT_CONFIG?.user;
                                const isAdmin = user && (user.is_staff === true || user.is_superuser === true);
                                console.log('🔍 Verificando Configurações - User:', user, 'isAdmin:', isAdmin);
                                
                                if (!isAdmin) {
                                    console.log('❌ Usuário não é admin - Configurações oculto');
                                    return null;
                                }
                                
                                console.log('✅ Usuário é admin - Configurações visível');
                                return renderMenuCard(
                                    '/accounts/configuracoes/',
                                    'fas fa-cog',
                                    'Configurações',
                                    'Gerencie configurações do sistema e usuários',
                                    'Ativo',
                                    'info',
                                    ['Sistema', 'Usuários', 'Backup']
                                );
                            } catch (error) {
                                console.error('❌ Erro ao verificar permissões para Configurações:', error);
                                return null;
                            }
                        })()
                    )
                ),

                // Atividades recentes modernizadas
                React.createElement('div', { className: 'activities-section' },
                    React.createElement('div', { className: 'section-header' },
                        React.createElement('h2', { className: 'section-title' },
                            React.createElement('i', { className: 'fas fa-clock' }),
                            'Atividades Recentes'
                        ),
                        React.createElement('div', { className: 'section-subtitle' },
                            'Últimas atualizações do sistema'
                        )
                    ),
                    React.createElement('div', { className: 'activities-grid' },
                        // Últimas unidades
                        React.createElement('div', { className: 'activity-panel' },
                            React.createElement('div', { className: 'panel-header' },
                                React.createElement('h3', { className: 'panel-title' },
                                    React.createElement('i', { className: 'fas fa-hospital-alt' }),
                                    'Unidades Recentes'
                                ),
                                React.createElement('a', { 
                                    href: '/accounts/unidades-saude/', 
                                    className: 'view-all-btn' 
                                },
                                    'Ver todas ',
                                    React.createElement('i', { className: 'fas fa-arrow-right' })
                                )
                            ),
                            React.createElement('div', { className: 'activity-list' },
                                ultimas_unidades.length > 0 ? 
                                    ultimas_unidades.slice(0, 3).map((unidade, index) =>
                                        React.createElement('div', { 
                                            key: index, 
                                            className: 'activity-item-modern' 
                                        },
                                            React.createElement('div', { 
                                                className: `activity-icon ${unidade.tipo.toLowerCase()}` 
                                            },
                                                React.createElement('i', { className: 'fas fa-hospital' })
                                            ),
                                            React.createElement('div', { className: 'activity-content' },
                                                React.createElement('div', { className: 'activity-title' }, 
                                                    unidade.nome
                                                ),
                                                React.createElement('div', { className: 'activity-meta' },
                                                    React.createElement('span', { className: 'activity-type' }, 
                                                        unidade.tipo_display || unidade.tipo
                                                    ),
                                                    React.createElement('span', { className: 'activity-date' }, 
                                                        new Date(unidade.created_at).toLocaleDateString('pt-BR')
                                                    )
                                                )
                                            ),
                                            React.createElement('a', { 
                                                href: `/accounts/unidades-saude/${unidade.id}/visualizar/`,
                                                className: 'activity-action'
                                            },
                                                React.createElement('i', { className: 'fas fa-eye' })
                                            )
                                        )
                                    ) :
                                    React.createElement('div', { className: 'empty-state' },
                                        React.createElement('i', { className: 'fas fa-inbox' }),
                                        React.createElement('span', null, 'Nenhuma unidade cadastrada ainda')
                                    )
                            )
                        ),

                        // Últimas chamadas
                        React.createElement('div', { className: 'activity-panel' },
                            React.createElement('div', { className: 'panel-header' },
                                React.createElement('h3', { className: 'panel-title' },
                                    React.createElement('i', { className: 'fas fa-phone-volume' }),
                                    'Chamadas Recentes'
                                ),
                                React.createElement('a', { 
                                    href: '/accounts/historico/', 
                                    className: 'view-all-btn' 
                                },
                                    'Ver todas ',
                                    React.createElement('i', { className: 'fas fa-arrow-right' })
                                )
                            ),
                            React.createElement('div', { className: 'activity-list' },
                                ultimas_chamadas.length > 0 ? 
                                    ultimas_chamadas.slice(0, 3).map((chamada, index) =>
                                        React.createElement('div', { 
                                            key: index, 
                                            className: 'activity-item-modern' 
                                        },
                                            React.createElement('div', { 
                                                className: `activity-icon chamada ${chamada.tipo_chamada === 'EMERGENCIA' ? 'emergency' : 'normal'}` 
                                            },
                                                React.createElement('i', { className: 'fas fa-phone' })
                                            ),
                                            React.createElement('div', { className: 'activity-content' },
                                                React.createElement('div', { className: 'activity-title' }, 
                                                    chamada.nome_contato
                                                ),
                                                React.createElement('div', { className: 'activity-meta' },
                                                    React.createElement('span', { className: 'activity-type' }, 
                                                        chamada.tipo_chamada_display || chamada.tipo_chamada
                                                    ),
                                                    React.createElement('span', { className: 'activity-date' }, 
                                                        new Date(chamada.data_criacao).toLocaleDateString('pt-BR')
                                                    )
                                                )
                                            ),
                                            React.createElement('div', { className: 'activity-status' },
                                                React.createElement('span', { 
                                                    className: `status-badge ${chamada.status === 'CONCLUIDO' ? 'success' : chamada.status === 'EM_ANDAMENTO' ? 'warning' : 'info'}`
                                                }, chamada.status_display || chamada.status)
                                            )
                                        )
                                    ) :
                                    React.createElement('div', { className: 'empty-state' },
                                        React.createElement('i', { className: 'fas fa-phone-slash' }),
                                        React.createElement('span', null, 'Nenhuma chamada registrada ainda')
                                    )
                            )
                        )
                    )
                )
            )
        );
    }

export default HomeReact; 