(function() {
    'use strict';
    
    function NotificacoesReact(props) {
        // Estados do componente
        const [configEmail, setConfigEmail] = React.useState({
            chamadas: true,
            status: true,
            relatorios: false,
            seguranca: true
        });
        
        const [configSistema, setConfigSistema] = React.useState({
            alertas: true,
            popups: true,
            badge: true,
            som: false
        });
        
        const [configHorario, setConfigHorario] = React.useState({
            frequencia: 'imediato',
            horario_inicio: '08:00',
            horario_fim: '18:00'
        });
        
        const [isLoading, setIsLoading] = React.useState(false);
        const [showSuccessAnimation, setShowSuccessAnimation] = React.useState(false);
        const [previewMode, setPreviewMode] = React.useState(null);
        const [activeSection, setActiveSection] = React.useState('email');
        const [hasChanges, setHasChanges] = React.useState(false);
        
        // Dados das props
        const { usuario, config_atual, estatisticas, csrf_token } = props;
        
        // Inicializar configurações com dados existentes
        React.useEffect(() => {
            if (config_atual) {
                if (config_atual.email) {
                    setConfigEmail(config_atual.email);
                }
                if (config_atual.sistema) {
                    setConfigSistema(config_atual.sistema);
                }
                if (config_atual.configuracoes) {
                    setConfigHorario(config_atual.configuracoes);
                }
            }
        }, [config_atual]);
        
        // Função para atualizar configurações de email
        const handleEmailChange = (key, value) => {
            setConfigEmail(prev => ({
                ...prev,
                [key]: value
            }));
            setHasChanges(true);
        };
        
        // Função para atualizar configurações do sistema
        const handleSistemaChange = (key, value) => {
            setConfigSistema(prev => ({
                ...prev,
                [key]: value
            }));
            setHasChanges(true);
            
            // Mostrar preview do tipo de notificação
            if (value && key !== 'som') {
                showNotificationPreview(key);
            }
        };
        
        // Função para atualizar configurações de horário
        const handleHorarioChange = (key, value) => {
            setConfigHorario(prev => ({
                ...prev,
                [key]: value
            }));
            setHasChanges(true);
        };
        
        // Função para mostrar preview de notificação
        const showNotificationPreview = (type) => {
            const previews = {
                alertas: { 
                    title: 'Alerta em Tempo Real', 
                    message: 'Nova chamada registrada!', 
                    icon: 'fas fa-exclamation-triangle',
                    style: 'alert'
                },
                popups: { 
                    title: 'Notificação Toast', 
                    message: 'Configuração salva com sucesso', 
                    icon: 'fas fa-check-circle',
                    style: 'toast'
                },
                badge: { 
                    title: 'Badge de Contador', 
                    message: '3 novas notificações', 
                    icon: 'fas fa-bell',
                    style: 'badge'
                }
            };
            
            if (previews[type]) {
                setPreviewMode(previews[type]);
                setTimeout(() => setPreviewMode(null), 3000);
            }
        };
        
        // Função para enviar formulário
        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsLoading(true);
            
            try {
                const formData = new FormData();
                
                // Adicionar token CSRF
                formData.append('csrfmiddlewaretoken', csrf_token);
                
                // Configurações de email
                formData.append('email_chamadas', configEmail.chamadas ? 'on' : '');
                formData.append('email_status', configEmail.status ? 'on' : '');
                formData.append('email_relatorios', configEmail.relatorios ? 'on' : '');
                formData.append('email_seguranca', configEmail.seguranca ? 'on' : '');
                
                // Configurações do sistema
                formData.append('sistema_alertas', configSistema.alertas ? 'on' : '');
                formData.append('sistema_popups', configSistema.popups ? 'on' : '');
                formData.append('sistema_badge', configSistema.badge ? 'on' : '');
                formData.append('sistema_som', configSistema.som ? 'on' : '');
                
                // Configurações de horário
                formData.append('frequencia', configHorario.frequencia);
                formData.append('horario_inicio', configHorario.horario_inicio);
                formData.append('horario_fim', configHorario.horario_fim);
                
                const response = await fetch('/accounts/configuracoes/notificacoes/', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    setShowSuccessAnimation(true);
                    setHasChanges(false);
                    setTimeout(() => {
                        setShowSuccessAnimation(false);
                        // Opcional: redirecionar ou mostrar outra mensagem
                    }, 3000);
                } else {
                    throw new Error('Erro ao salvar configurações');
                }
            } catch (error) {
                console.error('Erro:', error);
                // Aqui você pode mostrar uma mensagem de erro
            } finally {
                setIsLoading(false);
            }
        };
        
        // Função para resetar configurações
        const handleReset = () => {
            setConfigEmail({
                chamadas: true,
                status: true,
                relatorios: false,
                seguranca: true
            });
            setConfigSistema({
                alertas: true,
                popups: true,
                badge: true,
                som: false
            });
            setConfigHorario({
                frequencia: 'imediato',
                horario_inicio: '08:00',
                horario_fim: '18:00'
            });
            setHasChanges(true);
        };
        
        // Função para calcular estatísticas das configurações
        const getConfigStats = () => {
            const emailAtivas = Object.values(configEmail).filter(Boolean).length;
            const sistemaAtivas = Object.values(configSistema).filter(Boolean).length;
            
            return {
                emailAtivas,
                sistemaAtivas,
                totalAtivas: emailAtivas + sistemaAtivas,
                emailPorcentagem: (emailAtivas / 4) * 100,
                sistemaPorcentagem: (sistemaAtivas / 4) * 100
            };
        };
        
        const stats = getConfigStats();
        
        // Renderização do componente
        return React.createElement('div', { className: 'notificacoes-react' },
            // Background animado
            React.createElement('div', { className: 'background-animation' },
                React.createElement('div', { className: 'floating-shape shape-1' }),
                React.createElement('div', { className: 'floating-shape shape-2' }),
                React.createElement('div', { className: 'floating-shape shape-3' }),
                React.createElement('div', { className: 'floating-shape shape-4' }),
                React.createElement('div', { className: 'floating-shape shape-5' }),
                React.createElement('div', { className: 'floating-shape shape-6' })
            ),
            
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
                            React.createElement('a', { 
                                href: '/accounts/configuracoes/', 
                                className: 'breadcrumb-link'
                            },
                                React.createElement('i', { className: 'fas fa-cog' }),
                                React.createElement('span', null, 'Configurações')
                            ),
                            React.createElement('div', { className: 'breadcrumb-arrow' },
                                React.createElement('i', { className: 'fas fa-chevron-right' })
                            ),
                            React.createElement('span', { className: 'breadcrumb-current' },
                                React.createElement('i', { className: 'fas fa-bell' }),
                                React.createElement('span', null, 'Notificações')
                            )
                        )
                    )
                ),
                
                // Header da página modernizado
                React.createElement('div', { className: 'modern-header' },
                    React.createElement('div', { className: 'header-content' },
                        React.createElement('div', { className: 'header-main' },
                            React.createElement('div', { className: 'header-icon-wrapper' },
                                React.createElement('div', { className: 'header-icon' },
                                    React.createElement('i', { className: 'fas fa-bell' })
                                ),
                                React.createElement('div', { className: 'header-icon-pulse' })
                            ),
                            React.createElement('div', { className: 'header-text' },
                                React.createElement('h1', { className: 'modern-title' }, 'Central de Notificações'),
                                React.createElement('p', { className: 'modern-subtitle' }, 
                                    'Configure como e quando você deseja receber alertas do sistema'
                                ),
                                React.createElement('div', { className: 'stats-indicators' },
                                    React.createElement('div', { className: 'stat-card' },
                                        React.createElement('div', { className: 'stat-icon email' },
                                            React.createElement('i', { className: 'fas fa-envelope' })
                                        ),
                                        React.createElement('div', { className: 'stat-info' },
                                            React.createElement('span', { className: 'stat-number' }, stats.emailAtivas),
                                            React.createElement('span', { className: 'stat-label' }, 'Email ativas')
                                        )
                                    ),
                                    React.createElement('div', { className: 'stat-card' },
                                        React.createElement('div', { className: 'stat-icon sistema' },
                                            React.createElement('i', { className: 'fas fa-desktop' })
                                        ),
                                        React.createElement('div', { className: 'stat-info' },
                                            React.createElement('span', { className: 'stat-number' }, stats.sistemaAtivas),
                                            React.createElement('span', { className: 'stat-label' }, 'Sistema ativas')
                                        )
                                    ),
                                    React.createElement('div', { className: 'stat-card' },
                                        React.createElement('div', { className: 'stat-icon total' },
                                            React.createElement('i', { className: 'fas fa-chart-pie' })
                                        ),
                                        React.createElement('div', { className: 'stat-info' },
                                            React.createElement('span', { className: 'stat-number' }, stats.totalAtivas),
                                            React.createElement('span', { className: 'stat-label' }, 'Total ativas')
                                        )
                                    )
                                )
                            )
                        )
                    )
                ),
                
                // Preview de notificação
                previewMode && React.createElement('div', { className: `notification-preview ${previewMode.style}` },
                    React.createElement('div', { className: 'preview-content' },
                        React.createElement('div', { className: 'preview-icon' },
                            React.createElement('i', { className: previewMode.icon })
                        ),
                        React.createElement('div', { className: 'preview-text' },
                            React.createElement('h4', null, previewMode.title),
                            React.createElement('p', null, previewMode.message)
                        ),
                        React.createElement('button', { 
                            className: 'preview-close',
                            onClick: () => setPreviewMode(null)
                        },
                            React.createElement('i', { className: 'fas fa-times' })
                        )
                    )
                ),
                
                // Animação de sucesso
                showSuccessAnimation && React.createElement('div', { className: 'success-overlay-modern' },
                    React.createElement('div', { className: 'success-card' },
                        React.createElement('div', { className: 'success-animation-wrapper' },
                            React.createElement('div', { className: 'success-checkmark' },
                                React.createElement('i', { className: 'fas fa-check' })
                            ),
                            React.createElement('div', { className: 'success-ripple' })
                        ),
                        React.createElement('h2', { className: 'success-title' }, 'Configurações Salvas!'),
                        React.createElement('p', { className: 'success-message' }, 
                            'Suas preferências de notificação foram atualizadas com sucesso'
                        )
                    )
                ),
                
                // Navegação por seções
                React.createElement('div', { className: 'section-navigation' },
                    React.createElement('div', { className: 'nav-tabs' },
                        React.createElement('button', {
                            className: `nav-tab ${activeSection === 'email' ? 'active' : ''}`,
                            onClick: () => setActiveSection('email')
                        },
                            React.createElement('i', { className: 'fas fa-envelope' }),
                            React.createElement('span', null, 'Email'),
                            React.createElement('div', { className: 'tab-badge' }, stats.emailAtivas)
                        ),
                        React.createElement('button', {
                            className: `nav-tab ${activeSection === 'sistema' ? 'active' : ''}`,
                            onClick: () => setActiveSection('sistema')
                        },
                            React.createElement('i', { className: 'fas fa-desktop' }),
                            React.createElement('span', null, 'Sistema'),
                            React.createElement('div', { className: 'tab-badge' }, stats.sistemaAtivas)
                        ),
                        React.createElement('button', {
                            className: `nav-tab ${activeSection === 'horario' ? 'active' : ''}`,
                            onClick: () => setActiveSection('horario')
                        },
                            React.createElement('i', { className: 'fas fa-clock' }),
                            React.createElement('span', null, 'Horários'),
                            React.createElement('div', { className: 'tab-indicator' },
                                React.createElement('i', { className: 'fas fa-check' })
                            )
                        )
                    )
                ),
                
                // Formulário moderno
                React.createElement('form', { 
                    onSubmit: handleSubmit,
                    className: 'notifications-form-modern'
                },
                    React.createElement('div', { className: 'form-sections' },
                        // Seção Email
                        React.createElement('div', { 
                            className: `form-section ${activeSection === 'email' ? 'active' : ''}`,
                            'data-section': 'email'
                        },
                            React.createElement('div', { className: 'section-card' },
                                React.createElement('div', { className: 'section-header' },
                                    React.createElement('div', { className: 'section-icon email' },
                                        React.createElement('i', { className: 'fas fa-envelope' })
                                    ),
                                    React.createElement('div', { className: 'section-info' },
                                        React.createElement('h2', null, 'Notificações por Email'),
                                        React.createElement('p', null, 'Receba alertas diretamente em seu email'),
                                        React.createElement('div', { className: 'section-progress' },
                                            React.createElement('div', { className: 'progress-bar' },
                                                React.createElement('div', { 
                                                    className: 'progress-fill',
                                                    style: { width: `${stats.emailPorcentagem}%` }
                                                })
                                            ),
                                            React.createElement('span', { className: 'progress-text' }, 
                                                `${stats.emailAtivas}/4 ativas`
                                            )
                                        )
                                    )
                                ),
                                React.createElement('div', { className: 'section-content' },
                                    React.createElement('div', { className: 'options-grid' },
                                        // Chamadas Registradas
                                        React.createElement('div', { className: 'option-card' },
                                            React.createElement('div', { className: 'option-header' },
                                                React.createElement('div', { className: 'option-icon' },
                                                    React.createElement('i', { className: 'fas fa-phone-plus' })
                                                ),
                                                React.createElement('div', { className: 'option-info' },
                                                    React.createElement('h3', null, 'Chamadas Registradas'),
                                                    React.createElement('p', null, 'Confirmação quando uma chamada for registrada')
                                                )
                                            ),
                                            React.createElement('div', { className: 'option-control' },
                                                React.createElement('label', { className: 'modern-switch' },
                                                    React.createElement('input', {
                                                        type: 'checkbox',
                                                        checked: configEmail.chamadas,
                                                        onChange: (e) => handleEmailChange('chamadas', e.target.checked)
                                                    }),
                                                    React.createElement('span', { className: 'switch-slider' })
                                                )
                                            )
                                        ),
                                        
                                        // Status de Chamadas
                                        React.createElement('div', { className: 'option-card' },
                                            React.createElement('div', { className: 'option-header' },
                                                React.createElement('div', { className: 'option-icon' },
                                                    React.createElement('i', { className: 'fas fa-sync-alt' })
                                                ),
                                                React.createElement('div', { className: 'option-info' },
                                                    React.createElement('h3', null, 'Status de Chamadas'),
                                                    React.createElement('p', null, 'Atualizações sobre mudanças de status')
                                                )
                                            ),
                                            React.createElement('div', { className: 'option-control' },
                                                React.createElement('label', { className: 'modern-switch' },
                                                    React.createElement('input', {
                                                        type: 'checkbox',
                                                        checked: configEmail.status,
                                                        onChange: (e) => handleEmailChange('status', e.target.checked)
                                                    }),
                                                    React.createElement('span', { className: 'switch-slider' })
                                                )
                                            )
                                        ),
                                        
                                        // Relatórios Automáticos
                                        React.createElement('div', { className: 'option-card' },
                                            React.createElement('div', { className: 'option-header' },
                                                React.createElement('div', { className: 'option-icon' },
                                                    React.createElement('i', { className: 'fas fa-chart-line' })
                                                ),
                                                React.createElement('div', { className: 'option-info' },
                                                    React.createElement('h3', null, 'Relatórios Automáticos'),
                                                    React.createElement('p', null, 'Relatórios periódicos por email')
                                                )
                                            ),
                                            React.createElement('div', { className: 'option-control' },
                                                React.createElement('label', { className: 'modern-switch' },
                                                    React.createElement('input', {
                                                        type: 'checkbox',
                                                        checked: configEmail.relatorios,
                                                        onChange: (e) => handleEmailChange('relatorios', e.target.checked)
                                                    }),
                                                    React.createElement('span', { className: 'switch-slider' })
                                                )
                                            )
                                        ),
                                        
                                        // Alertas de Segurança
                                        React.createElement('div', { className: 'option-card' },
                                            React.createElement('div', { className: 'option-header' },
                                                React.createElement('div', { className: 'option-icon' },
                                                    React.createElement('i', { className: 'fas fa-shield-alt' })
                                                ),
                                                React.createElement('div', { className: 'option-info' },
                                                    React.createElement('h3', null, 'Alertas de Segurança'),
                                                    React.createElement('p', null, 'Login e alterações na conta')
                                                )
                                            ),
                                            React.createElement('div', { className: 'option-control' },
                                                React.createElement('label', { className: 'modern-switch' },
                                                    React.createElement('input', {
                                                        type: 'checkbox',
                                                        checked: configEmail.seguranca,
                                                        onChange: (e) => handleEmailChange('seguranca', e.target.checked)
                                                    }),
                                                    React.createElement('span', { className: 'switch-slider' })
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        ),
                        
                        // Seção Sistema
                        React.createElement('div', { 
                            className: `form-section ${activeSection === 'sistema' ? 'active' : ''}`,
                            'data-section': 'sistema'
                        },
                            React.createElement('div', { className: 'section-card' },
                                React.createElement('div', { className: 'section-header' },
                                    React.createElement('div', { className: 'section-icon sistema' },
                                        React.createElement('i', { className: 'fas fa-desktop' })
                                    ),
                                    React.createElement('div', { className: 'section-info' },
                                        React.createElement('h2', null, 'Notificações no Sistema'),
                                        React.createElement('p', null, 'Alertas visuais e sonoros na interface'),
                                        React.createElement('div', { className: 'section-progress' },
                                            React.createElement('div', { className: 'progress-bar' },
                                                React.createElement('div', { 
                                                    className: 'progress-fill',
                                                    style: { width: `${stats.sistemaPorcentagem}%` }
                                                })
                                            ),
                                            React.createElement('span', { className: 'progress-text' }, 
                                                `${stats.sistemaAtivas}/4 ativas`
                                            )
                                        )
                                    )
                                ),
                                React.createElement('div', { className: 'section-content' },
                                    React.createElement('div', { className: 'options-grid' },
                                        // Alertas em Tempo Real
                                        React.createElement('div', { className: 'option-card' },
                                            React.createElement('div', { className: 'option-header' },
                                                React.createElement('div', { className: 'option-icon' },
                                                    React.createElement('i', { className: 'fas fa-exclamation-triangle' })
                                                ),
                                                React.createElement('div', { className: 'option-info' },
                                                    React.createElement('h3', null, 'Alertas em Tempo Real'),
                                                    React.createElement('p', null, 'Pop-ups instantâneos para eventos importantes')
                                                )
                                            ),
                                            React.createElement('div', { className: 'option-control' },
                                                React.createElement('label', { className: 'modern-switch' },
                                                    React.createElement('input', {
                                                        type: 'checkbox',
                                                        checked: configSistema.alertas,
                                                        onChange: (e) => handleSistemaChange('alertas', e.target.checked)
                                                    }),
                                                    React.createElement('span', { className: 'switch-slider' })
                                                )
                                            )
                                        ),
                                        
                                        // Notificações Toast
                                        React.createElement('div', { className: 'option-card' },
                                            React.createElement('div', { className: 'option-header' },
                                                React.createElement('div', { className: 'option-icon' },
                                                    React.createElement('i', { className: 'fas fa-comment-dots' })
                                                ),
                                                React.createElement('div', { className: 'option-info' },
                                                    React.createElement('h3', null, 'Notificações Toast'),
                                                    React.createElement('p', null, 'Mensagens discretas no canto da tela')
                                                )
                                            ),
                                            React.createElement('div', { className: 'option-control' },
                                                React.createElement('label', { className: 'modern-switch' },
                                                    React.createElement('input', {
                                                        type: 'checkbox',
                                                        checked: configSistema.popups,
                                                        onChange: (e) => handleSistemaChange('popups', e.target.checked)
                                                    }),
                                                    React.createElement('span', { className: 'switch-slider' })
                                                )
                                            )
                                        ),
                                        
                                        // Badge de Contadores
                                        React.createElement('div', { className: 'option-card' },
                                            React.createElement('div', { className: 'option-header' },
                                                React.createElement('div', { className: 'option-icon' },
                                                    React.createElement('i', { className: 'fas fa-bell' })
                                                ),
                                                React.createElement('div', { className: 'option-info' },
                                                    React.createElement('h3', null, 'Badge de Contadores'),
                                                    React.createElement('p', null, 'Números de notificações não lidas')
                                                )
                                            ),
                                            React.createElement('div', { className: 'option-control' },
                                                React.createElement('label', { className: 'modern-switch' },
                                                    React.createElement('input', {
                                                        type: 'checkbox',
                                                        checked: configSistema.badge,
                                                        onChange: (e) => handleSistemaChange('badge', e.target.checked)
                                                    }),
                                                    React.createElement('span', { className: 'switch-slider' })
                                                )
                                            )
                                        ),
                                        
                                        // Alertas Sonoros
                                        React.createElement('div', { className: 'option-card' },
                                            React.createElement('div', { className: 'option-header' },
                                                React.createElement('div', { className: 'option-icon' },
                                                    React.createElement('i', { className: 'fas fa-volume-up' })
                                                ),
                                                React.createElement('div', { className: 'option-info' },
                                                    React.createElement('h3', null, 'Alertas Sonoros'),
                                                    React.createElement('p', null, 'Sons para eventos críticos')
                                                )
                                            ),
                                            React.createElement('div', { className: 'option-control' },
                                                React.createElement('label', { className: 'modern-switch' },
                                                    React.createElement('input', {
                                                        type: 'checkbox',
                                                        checked: configSistema.som,
                                                        onChange: (e) => handleSistemaChange('som', e.target.checked)
                                                    }),
                                                    React.createElement('span', { className: 'switch-slider' })
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        ),
                        
                        // Seção Horários
                        React.createElement('div', { 
                            className: `form-section ${activeSection === 'horario' ? 'active' : ''}`,
                            'data-section': 'horario'
                        },
                            React.createElement('div', { className: 'section-card' },
                                React.createElement('div', { className: 'section-header' },
                                    React.createElement('div', { className: 'section-icon horario' },
                                        React.createElement('i', { className: 'fas fa-clock' })
                                    ),
                                    React.createElement('div', { className: 'section-info' },
                                        React.createElement('h2', null, 'Configurações de Horário'),
                                        React.createElement('p', null, 'Defina quando e como receber notificações'),
                                        React.createElement('div', { className: 'time-preview' },
                                            React.createElement('i', { className: 'fas fa-clock' }),
                                            React.createElement('span', null, 
                                                `${configHorario.horario_inicio} - ${configHorario.horario_fim}`
                                            )
                                        )
                                    )
                                ),
                                React.createElement('div', { className: 'section-content' },
                                    React.createElement('div', { className: 'schedule-grid' },
                                        React.createElement('div', { className: 'schedule-item' },
                                            React.createElement('label', { className: 'field-label-modern' },
                                                React.createElement('i', { className: 'fas fa-repeat' }),
                                                React.createElement('span', null, 'Frequência das Notificações')
                                            ),
                                            React.createElement('select', {
                                                className: 'select-modern',
                                                value: configHorario.frequencia,
                                                onChange: (e) => handleHorarioChange('frequencia', e.target.value)
                                            },
                                                React.createElement('option', { value: 'imediato' }, 'Imediato'),
                                                React.createElement('option', { value: 'a_cada_hora' }, 'A cada hora'),
                                                React.createElement('option', { value: 'diario' }, 'Diário (resumo)'),
                                                React.createElement('option', { value: 'semanal' }, 'Semanal (resumo)')
                                            )
                                        ),
                                        React.createElement('div', { className: 'schedule-item' },
                                            React.createElement('label', { className: 'field-label-modern' },
                                                React.createElement('i', { className: 'fas fa-sun' }),
                                                React.createElement('span', null, 'Horário de Início')
                                            ),
                                            React.createElement('input', {
                                                type: 'time',
                                                className: 'input-modern',
                                                value: configHorario.horario_inicio,
                                                onChange: (e) => handleHorarioChange('horario_inicio', e.target.value)
                                            })
                                        ),
                                        React.createElement('div', { className: 'schedule-item' },
                                            React.createElement('label', { className: 'field-label-modern' },
                                                React.createElement('i', { className: 'fas fa-moon' }),
                                                React.createElement('span', null, 'Horário de Fim')
                                            ),
                                            React.createElement('input', {
                                                type: 'time',
                                                className: 'input-modern',
                                                value: configHorario.horario_fim,
                                                onChange: (e) => handleHorarioChange('horario_fim', e.target.value)
                                            })
                                        )
                                    ),
                                    React.createElement('div', { className: 'schedule-info' },
                                        React.createElement('div', { className: 'info-card' },
                                            React.createElement('i', { className: 'fas fa-info-circle' }),
                                            React.createElement('div', { className: 'info-content' },
                                                React.createElement('h4', null, 'Horário Atual do Sistema'),
                                                React.createElement('p', null, 'As notificações seguirão este fuso horário')
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    ),
                    
                    // Footer do formulário
                    React.createElement('div', { className: 'form-footer-modern' },
                        React.createElement('div', { className: 'footer-content-modern' },
                            React.createElement('div', { className: 'footer-info' },
                                React.createElement('div', { className: 'info-item' },
                                    React.createElement('i', { className: 'fas fa-shield-alt' }),
                                    React.createElement('span', null, 'Dados seguros')
                                ),
                                React.createElement('div', { className: 'info-item' },
                                    React.createElement('i', { className: 'fas fa-save' }),
                                    React.createElement('span', null, hasChanges ? 'Alterações pendentes' : 'Configurações salvas')
                                )
                            ),
                            React.createElement('div', { className: 'form-actions' },
                                React.createElement('button', {
                                    type: 'button',
                                    className: 'btn-modern btn-secondary',
                                    onClick: handleReset
                                },
                                    React.createElement('i', { className: 'fas fa-undo' }),
                                    React.createElement('span', null, 'Resetar')
                                ),
                                React.createElement('a', {
                                    href: '/accounts/configuracoes/',
                                    className: 'btn-modern btn-tertiary'
                                },
                                    React.createElement('i', { className: 'fas fa-arrow-left' }),
                                    React.createElement('span', null, 'Voltar')
                                ),
                                React.createElement('button', {
                                    type: 'submit',
                                    className: `btn-modern btn-primary ${hasChanges ? 'has-changes' : ''}`,
                                    disabled: isLoading
                                },
                                    isLoading ? 
                                        React.createElement(React.Fragment, null,
                                            React.createElement('div', { className: 'loading-spinner' }),
                                            React.createElement('span', null, 'Salvando...')
                                        ) :
                                        React.createElement(React.Fragment, null,
                                            React.createElement('i', { className: 'fas fa-save' }),
                                            React.createElement('span', null, hasChanges ? 'Salvar Alterações' : 'Configurações Salvas')
                                        )
                                )
                            )
                        )
                    )
                )
            )
        );
    }
    
    // Disponibilizar o componente globalmente (para compatibilidade)
    window.NotificacoesReact = NotificacoesReact;

    // Exportar como módulo ES6
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = NotificacoesReact;
    }
    
})();

// Export para ES6 modules
 