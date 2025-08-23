(function() {
    'use strict';
    
    console.log('🔄 [CRIAR USUÁRIO] Carregando componente CriarUsuarioReact...');
    
    function CriarUsuarioReact(props) {
        console.log('🎯 [CRIAR USUÁRIO] Componente inicializado com props:', props);
        // Estados do componente
        const [currentStep, setCurrentStep] = React.useState(1);
        const [formData, setFormData] = React.useState({
            first_name: '',
            last_name: '',
            username: '',
            email: '',
            password1: '',
            password2: '',
            is_active: true,
            is_staff: false
        });
        
        const [errors, setErrors] = React.useState({});
        const [fieldValidation, setFieldValidation] = React.useState({});
        const [isLoading, setIsLoading] = React.useState(false);
        const [showPasswords, setShowPasswords] = React.useState({
            password1: false,
            password2: false
        });
        const [passwordStrength, setPasswordStrength] = React.useState(0);
        const [showSuccessAnimation, setShowSuccessAnimation] = React.useState(false);
        const [usernameAvailable, setUsernameAvailable] = React.useState(null);
        const [checkingUsername, setCheckingUsername] = React.useState(false);
        const [focusedField, setFocusedField] = React.useState(null);
        const [suggestions, setSuggestions] = React.useState({});
        const [showTooltips, setShowTooltips] = React.useState(false);
        const [typingTimeout, setTypingTimeout] = React.useState(null);
        const [fieldProgress, setFieldProgress] = React.useState({});
        const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(false);
        
        // Dados das props
        const { usuario, estatisticas_usuarios, csrf_token } = props;
        
        // Função para calcular força da senha
        const calculatePasswordStrength = (password) => {
            if (!password) return 0;
            
            let strength = 0;
            const checks = [
                { regex: /.{8,}/, weight: 1 },     // Pelo menos 8 caracteres
                { regex: /[a-z]/, weight: 1 },     // Letra minúscula
                { regex: /[A-Z]/, weight: 1 },     // Letra maiúscula
                { regex: /[0-9]/, weight: 1 },     // Número
                { regex: /[^a-zA-Z0-9]/, weight: 1 }, // Caractere especial
                { regex: /.{12,}/, weight: 1 }     // Muito longo
            ];
            
            checks.forEach(check => {
                if (check.regex.test(password)) strength += check.weight;
            });
            
            return Math.min(strength, 5);
        };
        
        // Função para obter info da força da senha
        const getStrengthInfo = (strength) => {
            const levels = {
                0: { text: 'Muito Fraca', color: '#ef4444', progress: 0 },
                1: { text: 'Fraca', color: '#f97316', progress: 20 },
                2: { text: 'Regular', color: '#f59e0b', progress: 40 },
                3: { text: 'Boa', color: '#eab308', progress: 60 },
                4: { text: 'Forte', color: '#84cc16', progress: 80 },
                5: { text: 'Muito Forte', color: '#22c55e', progress: 100 }
            };
            return levels[strength] || levels[0];
        };
        
        // Função para validar campos
        const validateField = (name, value) => {
            const validations = {
                first_name: {
                    required: true,
                    minLength: 2,
                    pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
                    message: 'Nome deve ter pelo menos 2 caracteres e conter apenas letras'
                },
                username: {
                    required: true,
                    minLength: 3,
                    pattern: /^[a-zA-Z0-9_]+$/,
                    message: 'Username deve ter pelo menos 3 caracteres (apenas letras, números e _)'
                },
                email: {
                    required: false,
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email deve ter formato válido'
                },
                password1: {
                    required: true,
                    minLength: 8,
                    message: 'Senha deve ter pelo menos 8 caracteres'
                },
                password2: {
                    required: true,
                    match: 'password1',
                    message: 'Senhas devem coincidir'
                }
            };
            
            const validation = validations[name];
            if (!validation) return { valid: true };
            
            // Verificar se é obrigatório
            if (validation.required && !value) {
                return { valid: false, message: `${name.charAt(0).toUpperCase() + name.slice(1)} é obrigatório` };
            }
            
            // Se não é obrigatório e está vazio, é válido
            if (!validation.required && !value) {
                return { valid: true };
            }
            
            // Verificar comprimento mínimo
            if (validation.minLength && value.length < validation.minLength) {
                return { valid: false, message: validation.message };
            }
            
            // Verificar padrão
            if (validation.pattern && !validation.pattern.test(value)) {
                return { valid: false, message: validation.message };
            }
            
            // Verificar match (para confirmação de senha)
            if (validation.match && value !== formData[validation.match]) {
                return { valid: false, message: validation.message };
            }
            
            return { valid: true };
        };
        
        // Função para verificar disponibilidade do username
        const checkUsernameAvailability = async (username) => {
            if (!username || username.length < 3) {
                setUsernameAvailable(null);
                return;
            }
            
            setCheckingUsername(true);
            
            try {
                // Simular verificação (aqui você faria uma chamada real para o backend)
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Por enquanto, simular que usernames que terminam com 'admin' já existem
                const exists = username.toLowerCase().includes('admin');
                setUsernameAvailable(!exists);
            } catch (error) {
                console.error('Erro ao verificar username:', error);
                setUsernameAvailable(null);
            } finally {
                setCheckingUsername(false);
            }
        };
        
        // Função para gerar sugestões de username
        const generateUsernameSuggestions = (firstName, lastName) => {
            if (!firstName) return [];
            
            const suggestions = [];
            const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
            const cleanLast = lastName ? lastName.toLowerCase().replace(/[^a-z]/g, '') : '';
            
            // Diferentes combinações
            if (cleanFirst.length >= 2) {
                suggestions.push(cleanFirst);
                if (cleanLast) {
                    suggestions.push(cleanFirst + cleanLast);
                    suggestions.push(cleanFirst + '.' + cleanLast);
                    suggestions.push(cleanFirst.charAt(0) + cleanLast);
                    suggestions.push(cleanFirst + cleanLast.charAt(0));
                }
                suggestions.push(cleanFirst + Math.floor(Math.random() * 99));
                suggestions.push(cleanFirst + '2024');
            }
            
            return suggestions.slice(0, 4);
        };
        
        // Função para calcular progresso do campo
        const calculateFieldProgress = (name, value) => {
            const validation = validateField(name, value);
            let progress = 0;
            
            if (!value) return 0;
            
            switch (name) {
                case 'first_name':
                    progress = Math.min((value.length / 2) * 100, 100);
                    break;
                case 'username':
                    if (validation.valid && usernameAvailable !== false) {
                        progress = 100;
                    } else if (value.length >= 3) {
                        progress = 70;
                    } else {
                        progress = (value.length / 3) * 50;
                    }
                    break;
                case 'email':
                    if (validation.valid) {
                        progress = 100;
                    } else if (value.includes('@')) {
                        progress = 60;
                    } else {
                        progress = (value.length / 10) * 50;
                    }
                    break;
                default:
                    progress = validation.valid ? 100 : (value.length > 0 ? 50 : 0);
            }
            
            return Math.min(progress, 100);
        };
        
        // Função para atualizar campos do formulário
        const handleInputChange = (name, value) => {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            
            // Validar campo em tempo real
            const validation = validateField(name, value);
            setFieldValidation(prev => ({
                ...prev,
                [name]: validation
            }));
            
            // Calcular progresso do campo
            const progress = calculateFieldProgress(name, value);
            setFieldProgress(prev => ({
                ...prev,
                [name]: progress
            }));
            
            // Calcular força da senha
            if (name === 'password1') {
                const strength = calculatePasswordStrength(value);
                setPasswordStrength(strength);
                
                // Re-validar confirmação de senha se ela já foi preenchida
                if (formData.password2) {
                    const password2Validation = validateField('password2', formData.password2);
                    setFieldValidation(prev => ({
                        ...prev,
                        password2: password2Validation
                    }));
                }
            }
            
            // Verificar username disponibilidade
            if (name === 'username') {
                if (typingTimeout) clearTimeout(typingTimeout);
                const timeout = setTimeout(() => {
                    checkUsernameAvailability(value);
                }, 500);
                setTypingTimeout(timeout);
            }
            
            // Gerar sugestões de username quando nome é digitado
            if (name === 'first_name' || name === 'last_name') {
                const firstName = name === 'first_name' ? value : formData.first_name;
                const lastName = name === 'last_name' ? value : formData.last_name;
                const usernameSuggestions = generateUsernameSuggestions(firstName, lastName);
                setSuggestions(prev => ({
                    ...prev,
                    username: usernameSuggestions
                }));
            }
            
            // Limpar erros quando usuário digita
            if (errors[name]) {
                setErrors(prev => ({
                    ...prev,
                    [name]: ''
                }));
            }
        };
        
        // Função para alternar visibilidade da senha
        const togglePasswordVisibility = (field) => {
            setShowPasswords(prev => ({
                ...prev,
                [field]: !prev[field]
            }));
        };
        
        // Função para navegar entre etapas
        const navigateStep = (direction) => {
            const newStep = currentStep + direction;
            
            if (direction > 0) {
                // Validar etapa atual antes de avançar
                if (!validateCurrentStep()) return;
            }
            
            if (newStep >= 1 && newStep <= 3) {
                setCurrentStep(newStep);
            }
        };
        
        // Função para validar etapa atual
        const validateCurrentStep = () => {
            if (currentStep === 1) {
                const requiredFields = ['first_name', 'username'];
                for (const field of requiredFields) {
                    const validation = validateField(field, formData[field]);
                    if (!validation.valid) {
                        setFieldValidation(prev => ({
                            ...prev,
                            [field]: validation
                        }));
                        return false;
                    }
                }
                
                // Verificar se username está disponível
                if (usernameAvailable === false) {
                    return false;
                }
            }
            
            if (currentStep === 2) {
                const requiredFields = ['password1', 'password2'];
                for (const field of requiredFields) {
                    const validation = validateField(field, formData[field]);
                    if (!validation.valid) {
                        setFieldValidation(prev => ({
                            ...prev,
                            [field]: validation
                        }));
                        return false;
                    }
                }
                
                // Verificar força da senha
                if (passwordStrength < 3) {
                    setErrors(prev => ({
                        ...prev,
                        password1: 'Senha deve ser pelo menos "Boa" para continuar'
                    }));
                    return false;
                }
            }
            
            return true;
        };
        
        // Função para enviar formulário
        const handleSubmit = async (e) => {
            e.preventDefault();
            
            if (!validateCurrentStep()) return;
            
            setIsLoading(true);
            
            try {
                const response = await fetch('/accounts/usuarios/criar/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-CSRFToken': csrf_token,
                    },
                    body: new URLSearchParams(formData)
                });
                
                if (response.ok) {
                    setShowSuccessAnimation(true);
                    setTimeout(() => {
                        window.location.href = '/accounts/usuarios/gerenciar/';
                    }, 3000);
                } else {
                    const text = await response.text();
                    // Tentar extrair erros do HTML retornado
                    if (text.includes('já existe')) {
                        setErrors({ username: 'Este nome de usuário já existe' });
                    } else if (text.includes('email')) {
                        setErrors({ email: 'Este email já está em uso' });
                    } else {
                        setErrors({ general: 'Erro ao criar usuário. Verifique os dados.' });
                    }
                }
            } catch (error) {
                console.error('Erro:', error);
                setErrors({ general: 'Erro de conexão. Tente novamente.' });
            } finally {
                setIsLoading(false);
            }
        };
        
        // Função para obter critérios da senha
        const getPasswordCriteria = (password) => {
            return [
                { text: 'Pelo menos 8 caracteres', check: /.{8,}/.test(password) },
                { text: 'Letra minúscula', check: /[a-z]/.test(password) },
                { text: 'Letra maiúscula', check: /[A-Z]/.test(password) },
                { text: 'Número', check: /[0-9]/.test(password) },
                { text: 'Caractere especial', check: /[^a-zA-Z0-9]/.test(password) }
            ];
        };
        
        // Renderização do componente
        return React.createElement('div', { className: 'criar-usuario-react' },
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
                                React.createElement('i', { className: 'fas fa-user-plus' }),
                                React.createElement('span', null, 'Criar Usuário')
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
                                    React.createElement('i', { className: 'fas fa-user-plus' })
                                ),
                                React.createElement('div', { className: 'header-icon-pulse' })
                            ),
                            React.createElement('div', { className: 'header-text' },
                                React.createElement('h1', { className: 'modern-title' }, 'Criar Novo Usuário'),
                                React.createElement('p', { className: 'modern-subtitle' }, 
                                    'Configure um novo membro da equipe com acesso personalizado'
                                ),
                                                            React.createElement('div', { className: 'stats-dashboard-modern' },
                                React.createElement('div', { className: 'stats-header-modern' },
                                    React.createElement('div', { className: 'stats-title-section' },
                                        React.createElement('h3', { className: 'stats-title' }, 'Visão Geral do Sistema'),
                                        React.createElement('p', { className: 'stats-subtitle' }, 'Estatísticas em tempo real dos usuários')
                                    ),
                                    React.createElement('div', { className: 'stats-live-indicator' },
                                        React.createElement('div', { className: 'live-dot' }),
                                        React.createElement('span', null, 'Ao vivo')
                                    )
                                ),
                                
                                React.createElement('div', { className: 'stats-grid-modern' },
                                    // Card Total de Usuários
                                    React.createElement('div', { 
                                        className: 'stat-card-modern primary',
                                        'data-tooltip': 'Total de usuários cadastrados no sistema'
                                    },
                                        React.createElement('div', { className: 'stat-card-bg' }),
                                        React.createElement('div', { className: 'stat-card-header' },
                                            React.createElement('div', { className: 'stat-icon-container' },
                                                React.createElement('div', { className: 'stat-icon-modern total' },
                                                    React.createElement('i', { className: 'fas fa-users' }),
                                                    React.createElement('div', { className: 'icon-pulse-ring' })
                                                )
                                            ),
                                            React.createElement('div', { className: 'stat-trend positive' },
                                                React.createElement('i', { className: 'fas fa-arrow-up' }),
                                                React.createElement('span', null, '+12%')
                                            )
                                        ),
                                        React.createElement('div', { className: 'stat-content-modern' },
                                            React.createElement('div', { className: 'stat-number-large' }, 
                                                estatisticas_usuarios?.total_usuarios || 0
                                            ),
                                            React.createElement('div', { className: 'stat-label-modern' }, 'Total de usuários'),
                                            React.createElement('div', { className: 'stat-description' }, 'Todos os usuários registrados')
                                        ),

                                        React.createElement('div', { className: 'stat-footer-modern' },
                                            React.createElement('span', { className: 'stat-change positive' }, '+2 esta semana'),
                                            React.createElement('div', { className: 'stat-sparkline' },
                                                React.createElement('i', { className: 'fas fa-chart-line' })
                                            )
                                        )
                                    ),
                                    
                                    // Card Usuários Ativos
                                    React.createElement('div', { 
                                        className: 'stat-card-modern success',
                                        'data-tooltip': 'Usuários com acesso habilitado'
                                    },
                                        React.createElement('div', { className: 'stat-card-bg' }),
                                        React.createElement('div', { className: 'stat-card-header' },
                                            React.createElement('div', { className: 'stat-icon-container' },
                                                React.createElement('div', { className: 'stat-icon-modern active' },
                                                    React.createElement('i', { className: 'fas fa-user-check' }),
                                                    React.createElement('div', { className: 'icon-pulse-ring' })
                                                )
                                            ),
                                            React.createElement('div', { className: 'stat-trend positive' },
                                                React.createElement('i', { className: 'fas fa-arrow-up' }),
                                                React.createElement('span', null, '+8%')
                                            )
                                        ),
                                        React.createElement('div', { className: 'stat-content-modern' },
                                            React.createElement('div', { className: 'stat-number-large' }, 
                                                estatisticas_usuarios?.usuarios_ativos || 0
                                            ),
                                            React.createElement('div', { className: 'stat-label-modern' }, 'Usuários ativos'),
                                            React.createElement('div', { className: 'stat-description' }, 'Com acesso habilitado')
                                        ),

                                        React.createElement('div', { className: 'stat-footer-modern' },
                                            React.createElement('span', { className: 'stat-change positive' }, 'Taxa: 100%'),
                                            React.createElement('div', { className: 'stat-sparkline' },
                                                React.createElement('i', { className: 'fas fa-check-circle' })
                                            )
                                        )
                                    ),
                                    
                                    // Card Administradores
                                    React.createElement('div', { 
                                        className: 'stat-card-modern warning',
                                        'data-tooltip': 'Usuários com privilégios administrativos'
                                    },
                                        React.createElement('div', { className: 'stat-card-bg' }),
                                        React.createElement('div', { className: 'stat-card-header' },
                                            React.createElement('div', { className: 'stat-icon-container' },
                                                React.createElement('div', { className: 'stat-icon-modern admin' },
                                                    React.createElement('i', { className: 'fas fa-crown' }),
                                                    React.createElement('div', { className: 'icon-pulse-ring' })
                                                )
                                            ),
                                            React.createElement('div', { className: 'stat-trend stable' },
                                                React.createElement('i', { className: 'fas fa-minus' }),
                                                React.createElement('span', null, '0%')
                                            )
                                        ),
                                        React.createElement('div', { className: 'stat-content-modern' },
                                            React.createElement('div', { className: 'stat-number-large' }, 
                                                estatisticas_usuarios?.usuarios_admins || 0
                                            ),
                                            React.createElement('div', { className: 'stat-label-modern' }, 'Administradores'),
                                            React.createElement('div', { className: 'stat-description' }, 'Acesso completo')
                                        ),

                                        React.createElement('div', { className: 'stat-footer-modern' },
                                            React.createElement('span', { className: 'stat-change neutral' }, 'Controlado'),
                                            React.createElement('div', { className: 'stat-sparkline' },
                                                React.createElement('i', { className: 'fas fa-shield-alt' })
                                            )
                                        )
                                    ),
                                    
                                    // Card Novo: Usuários Recentes
                                    React.createElement('div', { 
                                        className: 'stat-card-modern info',
                                        'data-tooltip': 'Usuários criados nos últimos 30 dias'
                                    },
                                        React.createElement('div', { className: 'stat-card-bg' }),
                                        React.createElement('div', { className: 'stat-card-header' },
                                            React.createElement('div', { className: 'stat-icon-container' },
                                                React.createElement('div', { className: 'stat-icon-modern recent' },
                                                    React.createElement('i', { className: 'fas fa-user-plus' }),
                                                    React.createElement('div', { className: 'icon-pulse-ring' })
                                                )
                                            ),
                                            React.createElement('div', { className: 'stat-trend positive' },
                                                React.createElement('i', { className: 'fas fa-arrow-up' }),
                                                React.createElement('span', null, '+25%')
                                            )
                                        ),
                                        React.createElement('div', { className: 'stat-content-modern' },
                                            React.createElement('div', { className: 'stat-number-large' }, 
                                                estatisticas_usuarios?.usuarios_recentes || 0
                                            ),
                                            React.createElement('div', { className: 'stat-label-modern' }, 'Novos usuários'),
                                            React.createElement('div', { className: 'stat-description' }, 'Últimos 30 dias')
                                        ),

                                        React.createElement('div', { className: 'stat-footer-modern' },
                                            React.createElement('span', { className: 'stat-change positive' }, 'Crescimento'),
                                            React.createElement('div', { className: 'stat-sparkline' },
                                                React.createElement('i', { className: 'fas fa-trending-up' })
                                            )
                                        )
                                    )
                                ),
                                
                                // Resumo Geral
                                React.createElement('div', { className: 'stats-summary-modern' },
                                    React.createElement('div', { className: 'summary-card' },
                                        React.createElement('div', { className: 'summary-header' },
                                            React.createElement('i', { className: 'fas fa-analytics' }),
                                            React.createElement('span', null, 'Resumo Geral')
                                        ),
                                        React.createElement('div', { className: 'summary-content' },
                                            React.createElement('div', { className: 'summary-item' },
                                                React.createElement('span', { className: 'summary-label' }, 'Taxa de ativação:'),
                                                React.createElement('span', { className: 'summary-value success' }, '100%')
                                            ),
                                            React.createElement('div', { className: 'summary-item' },
                                                React.createElement('span', { className: 'summary-label' }, 'Crescimento mensal:'),
                                                React.createElement('span', { className: 'summary-value positive' }, '+12%')
                                            ),
                                            React.createElement('div', { className: 'summary-item' },
                                                React.createElement('span', { className: 'summary-label' }, 'Segurança:'),
                                                React.createElement('span', { className: 'summary-value secure' }, 'Alta')
                                            )
                                        )
                                    )
                                )
                            )
                            )
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
                        React.createElement('h2', { className: 'success-title' }, 'Usuário Criado!'),
                        React.createElement('p', { className: 'success-message' }, 
                            'Novo usuário foi criado com sucesso. Redirecionando...'
                        ),
                        React.createElement('div', { className: 'success-progress' },
                            React.createElement('div', { className: 'progress-bar' })
                        )
                    )
                ),
                
                // Indicador de progresso
                React.createElement('div', { className: 'progress-flow' },
                    React.createElement('div', { className: 'flow-line' },
                        React.createElement('div', { 
                            className: 'flow-progress',
                            style: { width: `${(currentStep / 3) * 100}%` }
                        })
                    ),
                    React.createElement('div', { className: 'flow-steps' },
                        React.createElement('div', { 
                            className: `flow-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`
                        },
                            React.createElement('div', { className: 'step-circle' },
                                React.createElement('i', { className: 'fas fa-user' })
                            ),
                            React.createElement('div', { className: 'step-content' },
                                React.createElement('div', { className: 'step-title' }, 'Dados Pessoais'),
                                React.createElement('div', { className: 'step-desc' }, 'Informações básicas')
                            )
                        ),
                        React.createElement('div', { 
                            className: `flow-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`
                        },
                            React.createElement('div', { className: 'step-circle' },
                                React.createElement('i', { className: 'fas fa-lock' })
                            ),
                            React.createElement('div', { className: 'step-content' },
                                React.createElement('div', { className: 'step-title' }, 'Credenciais'),
                                React.createElement('div', { className: 'step-desc' }, 'Senha e acesso')
                            )
                        ),
                        React.createElement('div', { 
                            className: `flow-step ${currentStep >= 3 ? 'active' : ''}`
                        },
                            React.createElement('div', { className: 'step-circle' },
                                React.createElement('i', { className: 'fas fa-shield-alt' })
                            ),
                            React.createElement('div', { className: 'step-content' },
                                React.createElement('div', { className: 'step-title' }, 'Permissões'),
                                React.createElement('div', { className: 'step-desc' }, 'Nível de acesso')
                            )
                        )
                    )
                ),
                
                // Formulário moderno
                React.createElement('div', { className: 'form-container-modern' },
                    React.createElement('div', { className: 'form-card-modern' },
                        React.createElement('form', { 
                            onSubmit: handleSubmit,
                            className: 'modern-form'
                        },
                            // Alerta de erro geral
                            errors.general && React.createElement('div', { className: 'alert-modern error' },
                                React.createElement('div', { className: 'alert-icon' },
                                    React.createElement('i', { className: 'fas fa-exclamation-triangle' })
                                ),
                                React.createElement('div', { className: 'alert-content' },
                                    React.createElement('strong', null, 'Erro:'),
                                    React.createElement('span', null, errors.general)
                                )
                            ),
                            
                            // Etapa 1: Dados Pessoais
                            currentStep === 1 && React.createElement('div', { className: 'step-panel active' },
                                React.createElement('div', { className: 'panel-header' },
                                    React.createElement('div', { className: 'panel-icon' },
                                        React.createElement('i', { className: 'fas fa-user' })
                                    ),
                                    React.createElement('div', { className: 'panel-content' },
                                        React.createElement('h2', null, 'Informações Pessoais'),
                                        React.createElement('p', null, 'Configure os dados básicos do novo usuário')
                                    )
                                ),
                                React.createElement('div', { className: 'fields-grid' },
                                    // Nome
                                    React.createElement('div', { className: 'field-group-modern' },
                                        React.createElement('label', { className: 'field-label-modern' },
                                            React.createElement('i', { className: 'fas fa-user' }),
                                            React.createElement('span', null, 'Nome Completo'),
                                            React.createElement('span', { className: 'required-star' }, ' *'),
                                            React.createElement('button', {
                                                type: 'button',
                                                className: 'tooltip-trigger',
                                                onMouseEnter: () => setShowTooltips(true),
                                                onMouseLeave: () => setShowTooltips(false)
                                            },
                                                React.createElement('i', { className: 'fas fa-info-circle' }),
                                                showTooltips && React.createElement('div', { className: 'tooltip-content' },
                                                    'Digite o nome completo do usuário. Este será o nome exibido no sistema.'
                                                )
                                            )
                                        ),
                                        React.createElement('div', { 
                                            className: `input-wrapper-modern ${focusedField === 'first_name' ? 'focused' : ''} ${fieldValidation.first_name?.valid === false ? 'invalid' : fieldValidation.first_name?.valid === true ? 'valid' : ''}`
                                        },
                                            React.createElement('div', { className: 'input-icon' },
                                                React.createElement('i', { className: 'fas fa-user' })
                                            ),
                                            React.createElement('input', {
                                                type: 'text',
                                                className: 'input-modern',
                                                value: formData.first_name,
                                                onChange: (e) => handleInputChange('first_name', e.target.value),
                                                onFocus: () => setFocusedField('first_name'),
                                                onBlur: () => setFocusedField(null),
                                                placeholder: 'Digite o nome completo',
                                                required: true
                                            }),
                                            fieldProgress.first_name > 0 && React.createElement('div', { className: 'field-progress' },
                                                React.createElement('div', { 
                                                    className: 'progress-fill',
                                                    style: { width: `${fieldProgress.first_name}%` }
                                                })
                                            )
                                        ),
                                        fieldValidation.first_name?.valid === false && React.createElement('div', { className: 'field-error-modern' },
                                            React.createElement('i', { className: 'fas fa-exclamation-circle' }),
                                            React.createElement('span', null, fieldValidation.first_name.message)
                                        ),
                                        React.createElement('div', { className: 'field-help' },
                                            'Nome que será exibido no sistema'
                                        )
                                    ),
                                    
                                    // Sobrenome
                                    React.createElement('div', { className: 'field-group-modern' },
                                        React.createElement('label', { className: 'field-label-modern' },
                                            React.createElement('i', { className: 'fas fa-user-tag' }),
                                            React.createElement('span', null, 'Sobrenome')
                                        ),
                                        React.createElement('div', { 
                                            className: `input-wrapper-modern ${focusedField === 'last_name' ? 'focused' : ''}`
                                        },
                                            React.createElement('div', { className: 'input-icon' },
                                                React.createElement('i', { className: 'fas fa-user-tag' })
                                            ),
                                            React.createElement('input', {
                                                type: 'text',
                                                className: 'input-modern',
                                                value: formData.last_name,
                                                onChange: (e) => handleInputChange('last_name', e.target.value),
                                                onFocus: () => setFocusedField('last_name'),
                                                onBlur: () => setFocusedField(null),
                                                placeholder: 'Digite o sobrenome'
                                            })
                                        ),
                                        React.createElement('div', { className: 'field-help' },
                                            'Sobrenome ou nome da família (opcional)'
                                        )
                                    ),
                                    
                                    // Username
                                    React.createElement('div', { className: 'field-group-modern' },
                                        React.createElement('label', { className: 'field-label-modern' },
                                            React.createElement('i', { className: 'fas fa-at' }),
                                            React.createElement('span', null, 'Nome de Usuário'),
                                            React.createElement('span', { className: 'required-star' }, ' *')
                                        ),
                                        React.createElement('div', { 
                                            className: `input-wrapper-modern ${focusedField === 'username' ? 'focused' : ''} ${fieldValidation.username?.valid === false || usernameAvailable === false ? 'invalid' : fieldValidation.username?.valid === true && usernameAvailable === true ? 'valid' : ''}`
                                        },
                                            React.createElement('div', { className: 'input-icon' },
                                                React.createElement('i', { className: 'fas fa-at' })
                                            ),
                                            React.createElement('input', {
                                                type: 'text',
                                                className: 'input-modern',
                                                value: formData.username,
                                                onChange: (e) => handleInputChange('username', e.target.value),
                                                onFocus: () => setFocusedField('username'),
                                                onBlur: () => setFocusedField(null),
                                                placeholder: 'usuario_sistema',
                                                required: true
                                            }),
                                            React.createElement('div', { className: 'field-status' },
                                                checkingUsername && React.createElement('i', { className: 'fas fa-spinner fa-spin' }),
                                                !checkingUsername && usernameAvailable === true && React.createElement('i', { className: 'fas fa-check', style: { color: '#22c55e' } }),
                                                !checkingUsername && usernameAvailable === false && React.createElement('i', { className: 'fas fa-times', style: { color: '#ef4444' } })
                                            ),
                                            fieldProgress.username > 0 && React.createElement('div', { className: 'field-progress' },
                                                React.createElement('div', { 
                                                    className: 'progress-fill',
                                                    style: { width: `${fieldProgress.username}%` }
                                                })
                                            )
                                        ),
                                        
                                        // Sugestões de username
                                        suggestions.username && suggestions.username.length > 0 && focusedField === 'username' && React.createElement('div', { className: 'suggestions-dropdown' },
                                            React.createElement('div', { className: 'suggestions-header' },
                                                React.createElement('i', { className: 'fas fa-lightbulb' }),
                                                React.createElement('span', null, 'Sugestões disponíveis')
                                            ),
                                            React.createElement('div', { className: 'suggestions-list' },
                                                suggestions.username.map((suggestion, index) => 
                                                    React.createElement('button', {
                                                        key: index,
                                                        type: 'button',
                                                        className: 'suggestion-item',
                                                        onClick: () => handleInputChange('username', suggestion)
                                                    },
                                                        React.createElement('i', { className: 'fas fa-magic' }),
                                                        React.createElement('span', null, suggestion),
                                                        React.createElement('div', { className: 'suggestion-action' },
                                                            React.createElement('i', { className: 'fas fa-arrow-right' })
                                                        )
                                                    )
                                                )
                                            )
                                        ),
                                        
                                        (fieldValidation.username?.valid === false || usernameAvailable === false) && React.createElement('div', { className: 'field-error-modern' },
                                            React.createElement('i', { className: 'fas fa-exclamation-circle' }),
                                            React.createElement('span', null, 
                                                usernameAvailable === false ? 'Este nome de usuário já existe' : fieldValidation.username?.message
                                            )
                                        ),
                                        React.createElement('div', { className: 'field-help' },
                                            'Nome único para login (apenas letras, números e _)'
                                        )
                                    ),
                                    
                                    // Email
                                    React.createElement('div', { className: 'field-group-modern' },
                                        React.createElement('label', { className: 'field-label-modern' },
                                            React.createElement('i', { className: 'fas fa-envelope' }),
                                            React.createElement('span', null, 'Email'),
                                            React.createElement('span', { className: 'field-badge optional' }, 'Opcional')
                                        ),
                                        React.createElement('div', { 
                                            className: `input-wrapper-modern ${focusedField === 'email' ? 'focused' : ''} ${fieldValidation.email?.valid === false ? 'invalid' : fieldValidation.email?.valid === true ? 'valid' : ''}`
                                        },
                                            React.createElement('div', { className: 'input-icon' },
                                                React.createElement('i', { className: 'fas fa-envelope' })
                                            ),
                                            React.createElement('input', {
                                                type: 'email',
                                                className: 'input-modern',
                                                value: formData.email,
                                                onChange: (e) => handleInputChange('email', e.target.value),
                                                onFocus: () => setFocusedField('email'),
                                                onBlur: () => setFocusedField(null),
                                                placeholder: 'usuario@exemplo.com'
                                            }),
                                            fieldProgress.email > 0 && React.createElement('div', { className: 'field-progress' },
                                                React.createElement('div', { 
                                                    className: 'progress-fill',
                                                    style: { width: `${fieldProgress.email}%` }
                                                })
                                            )
                                        ),
                                        fieldValidation.email?.valid === false && React.createElement('div', { className: 'field-error-modern' },
                                            React.createElement('i', { className: 'fas fa-exclamation-circle' }),
                                            React.createElement('span', null, fieldValidation.email.message)
                                        ),
                                        React.createElement('div', { className: 'field-help' },
                                            React.createElement('i', { className: 'fas fa-info-circle' }),
                                            React.createElement('span', null, 'Endereço de email para notificações e recuperação de senha')
                                        )
                                    )
                                )
                            ),
                            
                            // Etapa 2: Credenciais
                            currentStep === 2 && React.createElement('div', { className: 'step-panel active' },
                                React.createElement('div', { className: 'panel-header' },
                                    React.createElement('div', { className: 'panel-icon' },
                                        React.createElement('i', { className: 'fas fa-lock' })
                                    ),
                                    React.createElement('div', { className: 'panel-content' },
                                        React.createElement('h2', null, 'Credenciais de Acesso'),
                                        React.createElement('p', null, 'Defina uma senha segura para o usuário')
                                    )
                                ),
                                React.createElement('div', { className: 'fields-grid' },
                                    // Nova Senha
                                    React.createElement('div', { className: 'field-group-modern' },
                                        React.createElement('label', { className: 'field-label-modern' },
                                            React.createElement('i', { className: 'fas fa-key' }),
                                            React.createElement('span', null, 'Nova Senha'),
                                            React.createElement('span', { className: 'required-star' }, ' *')
                                        ),
                                        React.createElement('div', { 
                                            className: `input-wrapper-modern ${focusedField === 'password1' ? 'focused' : ''} ${fieldValidation.password1?.valid === false ? 'invalid' : ''}`
                                        },
                                            React.createElement('div', { className: 'input-icon' },
                                                React.createElement('i', { className: 'fas fa-key' })
                                            ),
                                            React.createElement('input', {
                                                type: showPasswords.password1 ? 'text' : 'password',
                                                className: 'input-modern',
                                                value: formData.password1,
                                                onChange: (e) => handleInputChange('password1', e.target.value),
                                                onFocus: () => setFocusedField('password1'),
                                                onBlur: () => setFocusedField(null),
                                                placeholder: '••••••••',
                                                required: true
                                            }),
                                            React.createElement('button', {
                                                type: 'button',
                                                className: 'toggle-password-modern',
                                                onClick: () => togglePasswordVisibility('password1')
                                            },
                                                React.createElement('i', { 
                                                    className: showPasswords.password1 ? 'fas fa-eye-slash' : 'fas fa-eye'
                                                })
                                            )
                                        ),
                                        
                                        // Indicador de força da senha
                                        formData.password1 && React.createElement('div', { className: 'password-strength-modern' },
                                            React.createElement('div', { className: 'strength-bar-container' },
                                                React.createElement('div', { 
                                                    className: 'strength-bar-fill',
                                                    style: {
                                                        width: `${getStrengthInfo(passwordStrength).progress}%`,
                                                        backgroundColor: getStrengthInfo(passwordStrength).color
                                                    }
                                                })
                                            ),
                                            React.createElement('div', { className: 'strength-info' },
                                                React.createElement('span', { 
                                                    className: 'strength-text',
                                                    style: { color: getStrengthInfo(passwordStrength).color }
                                                }, getStrengthInfo(passwordStrength).text),
                                                React.createElement('span', { className: 'strength-score' }, 
                                                    `${passwordStrength}/5`
                                                )
                                            )
                                        ),
                                        
                                        // Critérios da senha
                                        formData.password1 && React.createElement('div', { className: 'password-criteria' },
                                            React.createElement('div', { className: 'criteria-header' },
                                                React.createElement('i', { className: 'fas fa-list-check' }),
                                                React.createElement('span', null, 'Critérios da Senha')
                                            ),
                                            React.createElement('div', { className: 'criteria-list' },
                                                getPasswordCriteria(formData.password1).map((criterion, index) => 
                                                    React.createElement('div', { 
                                                        key: index, 
                                                        className: `criterion ${criterion.check ? 'met' : 'unmet'}`
                                                    },
                                                        React.createElement('i', { 
                                                            className: criterion.check ? 'fas fa-check-circle' : 'fas fa-circle'
                                                        }),
                                                        React.createElement('span', null, criterion.text)
                                                    )
                                                )
                                            )
                                        ),
                                        
                                        fieldValidation.password1?.valid === false && React.createElement('div', { className: 'field-error-modern' },
                                            React.createElement('i', { className: 'fas fa-exclamation-circle' }),
                                            React.createElement('span', null, fieldValidation.password1.message)
                                        ),
                                        errors.password1 && React.createElement('div', { className: 'field-error-modern' },
                                            React.createElement('i', { className: 'fas fa-exclamation-circle' }),
                                            React.createElement('span', null, errors.password1)
                                        )
                                    ),
                                    
                                    // Confirmar Senha
                                    React.createElement('div', { className: 'field-group-modern' },
                                        React.createElement('label', { className: 'field-label-modern' },
                                            React.createElement('i', { className: 'fas fa-check-double' }),
                                            React.createElement('span', null, 'Confirmar Senha'),
                                            React.createElement('span', { className: 'required-star' }, ' *')
                                        ),
                                        React.createElement('div', { 
                                            className: `input-wrapper-modern ${focusedField === 'password2' ? 'focused' : ''} ${fieldValidation.password2?.valid === false ? 'invalid' : fieldValidation.password2?.valid === true ? 'valid' : ''}`
                                        },
                                            React.createElement('div', { className: 'input-icon' },
                                                React.createElement('i', { className: 'fas fa-check-double' })
                                            ),
                                            React.createElement('input', {
                                                type: showPasswords.password2 ? 'text' : 'password',
                                                className: 'input-modern',
                                                value: formData.password2,
                                                onChange: (e) => handleInputChange('password2', e.target.value),
                                                onFocus: () => setFocusedField('password2'),
                                                onBlur: () => setFocusedField(null),
                                                placeholder: '••••••••',
                                                required: true
                                            }),
                                            React.createElement('button', {
                                                type: 'button',
                                                className: 'toggle-password-modern',
                                                onClick: () => togglePasswordVisibility('password2')
                                            },
                                                React.createElement('i', { 
                                                    className: showPasswords.password2 ? 'fas fa-eye-slash' : 'fas fa-eye'
                                                })
                                            )
                                        ),
                                        
                                        // Indicador de correspondência
                                        formData.password2 && React.createElement('div', { className: 'password-match' },
                                            React.createElement('div', { 
                                                className: `match-indicator ${formData.password1 === formData.password2 ? 'match' : 'no-match'}`
                                            },
                                                formData.password1 === formData.password2 ? 
                                                    React.createElement(React.Fragment, null,
                                                        React.createElement('i', { className: 'fas fa-check-circle' }),
                                                        React.createElement('span', null, 'Senhas coincidem')
                                                    ) :
                                                    React.createElement(React.Fragment, null,
                                                        React.createElement('i', { className: 'fas fa-times-circle' }),
                                                        React.createElement('span', null, 'Senhas diferentes')
                                                    )
                                            )
                                        ),
                                        
                                        fieldValidation.password2?.valid === false && React.createElement('div', { className: 'field-error-modern' },
                                            React.createElement('i', { className: 'fas fa-exclamation-circle' }),
                                            React.createElement('span', null, fieldValidation.password2.message)
                                        ),
                                        React.createElement('div', { className: 'field-help' },
                                            'Digite a senha novamente para confirmar'
                                        )
                                    )
                                )
                            ),
                            
                            // Etapa 3: Permissões
                            currentStep === 3 && React.createElement('div', { className: 'step-panel active' },
                                React.createElement('div', { className: 'panel-header' },
                                    React.createElement('div', { className: 'panel-icon' },
                                        React.createElement('i', { className: 'fas fa-shield-alt' })
                                    ),
                                    React.createElement('div', { className: 'panel-content' },
                                        React.createElement('h2', null, 'Permissões e Acesso'),
                                        React.createElement('p', null, 'Configure o nível de acesso do usuário')
                                    )
                                ),
                                React.createElement('div', { className: 'permissions-grid' },
                                    // Status do Usuário
                                    React.createElement('div', { className: 'permission-card' },
                                        React.createElement('div', { className: 'permission-header' },
                                            React.createElement('div', { className: 'permission-icon' },
                                                React.createElement('i', { className: 'fas fa-user-check' })
                                            ),
                                            React.createElement('div', { className: 'permission-info' },
                                                React.createElement('h3', null, 'Status do Usuário'),
                                                React.createElement('p', null, 'Controla se o usuário pode fazer login')
                                            )
                                        ),
                                        React.createElement('div', { className: 'permission-control' },
                                            React.createElement('label', { className: 'modern-switch' },
                                                React.createElement('input', {
                                                    type: 'checkbox',
                                                    checked: formData.is_active,
                                                    onChange: (e) => handleInputChange('is_active', e.target.checked)
                                                }),
                                                React.createElement('span', { className: 'switch-slider' }),
                                                React.createElement('span', { className: 'switch-text' }, 
                                                    formData.is_active ? 'Usuário Ativo' : 'Usuário Inativo'
                                                )
                                            )
                                        )
                                    ),
                                    
                                    // Privilégios Administrativos
                                    React.createElement('div', { className: 'permission-card' },
                                        React.createElement('div', { className: 'permission-header' },
                                            React.createElement('div', { className: 'permission-icon admin' },
                                                React.createElement('i', { className: 'fas fa-crown' })
                                            ),
                                            React.createElement('div', { className: 'permission-info' },
                                                React.createElement('h3', null, 'Privilégios Administrativos'),
                                                React.createElement('p', null, 'Permite gerenciar outros usuários')
                                            )
                                        ),
                                        React.createElement('div', { className: 'permission-control' },
                                            React.createElement('label', { className: 'modern-switch' },
                                                React.createElement('input', {
                                                    type: 'checkbox',
                                                    checked: formData.is_staff,
                                                    onChange: (e) => handleInputChange('is_staff', e.target.checked)
                                                }),
                                                React.createElement('span', { className: 'switch-slider' }),
                                                React.createElement('span', { className: 'switch-text' }, 
                                                    formData.is_staff ? 'Administrador' : 'Usuário Comum'
                                                )
                                            )
                                        )
                                    )
                                ),
                                
                                // Opções Avançadas
                                React.createElement('div', { className: 'advanced-options' },
                                    React.createElement('div', { className: 'advanced-header' },
                                        React.createElement('button', {
                                            type: 'button',
                                            className: 'advanced-toggle',
                                            onClick: () => setShowAdvancedOptions(!showAdvancedOptions)
                                        },
                                            React.createElement('i', { className: showAdvancedOptions ? 'fas fa-chevron-up' : 'fas fa-chevron-down' }),
                                            React.createElement('span', null, 'Opções Avançadas'),
                                            React.createElement('div', { className: 'advanced-badge' },
                                                React.createElement('i', { className: 'fas fa-cog' })
                                            )
                                        )
                                    ),
                                    showAdvancedOptions && React.createElement('div', { className: 'advanced-content' },
                                        React.createElement('div', { className: 'advanced-grid' },
                                            React.createElement('div', { className: 'advanced-group' },
                                                React.createElement('h4', null, 'Configurações de Conta'),
                                                React.createElement('label', { className: 'modern-checkbox' },
                                                    React.createElement('input', {
                                                        type: 'checkbox',
                                                        checked: formData.send_welcome_email || false,
                                                        onChange: (e) => handleInputChange('send_welcome_email', e.target.checked)
                                                    }),
                                                    React.createElement('span', { className: 'checkbox-mark' }),
                                                    React.createElement('span', { className: 'checkbox-text' }, 'Enviar email de boas-vindas')
                                                ),
                                                React.createElement('label', { className: 'modern-checkbox' },
                                                    React.createElement('input', {
                                                        type: 'checkbox',
                                                        checked: formData.require_password_change || false,
                                                        onChange: (e) => handleInputChange('require_password_change', e.target.checked)
                                                    }),
                                                    React.createElement('span', { className: 'checkbox-mark' }),
                                                    React.createElement('span', { className: 'checkbox-text' }, 'Exigir troca de senha no primeiro login')
                                                )
                                            ),
                                            React.createElement('div', { className: 'advanced-group' },
                                                React.createElement('h4', null, 'Data de Expiração'),
                                                React.createElement('div', { className: 'date-field' },
                                                    React.createElement('label', null, 'Conta expira em (opcional)'),
                                                    React.createElement('input', {
                                                        type: 'date',
                                                        className: 'input-modern',
                                                        value: formData.expiry_date || '',
                                                        onChange: (e) => handleInputChange('expiry_date', e.target.value),
                                                        min: (function() {
                                                            const today = new Date();
                                                            const year = today.getFullYear();
                                                            const month = String(today.getMonth() + 1).padStart(2, '0');
                                                            const day = String(today.getDate()).padStart(2, '0');
                                                            return year + '-' + month + '-' + day;
                                                        })()
                                                    })
                                                )
                                            )
                                        )
                                    )
                                ),
                                
                                // Preview do usuário
                                React.createElement('div', { className: 'user-preview' },
                                    React.createElement('div', { className: 'preview-header' },
                                        React.createElement('div', { className: 'preview-icon' },
                                            React.createElement('i', { className: 'fas fa-eye' })
                                        ),
                                        React.createElement('h3', null, 'Preview do Usuário'),
                                        React.createElement('p', null, 'Como o usuário aparecerá no sistema')
                                    ),
                                    React.createElement('div', { className: 'preview-card' },
                                        React.createElement('div', { className: 'preview-avatar' },
                                            React.createElement('div', { className: 'avatar-circle' },
                                                React.createElement('i', { className: 'fas fa-user' })
                                            ),
                                            React.createElement('div', { 
                                                className: `avatar-status ${formData.is_active ? 'active' : 'inactive'}`
                                            })
                                        ),
                                        React.createElement('div', { className: 'preview-details' },
                                            React.createElement('div', { className: 'preview-name' }, 
                                                formData.first_name && formData.last_name ? 
                                                    `${formData.first_name} ${formData.last_name}` :
                                                    formData.first_name || 'Novo Usuário'
                                            ),
                                            React.createElement('div', { className: 'preview-username' }, 
                                                `@${formData.username || 'usuario'}`
                                            ),
                                            formData.email && React.createElement('div', { className: 'preview-email' }, formData.email),
                                            React.createElement('div', { className: 'preview-badges' },
                                                React.createElement('div', { 
                                                    className: `preview-badge status ${formData.is_active ? 'active' : 'inactive'}`
                                                }, formData.is_active ? 'Ativo' : 'Inativo'),
                                                formData.is_staff && React.createElement('div', { className: 'preview-badge role' }, 'Administrador')
                                            )
                                        )
                                    )
                                )
                            ),
                            
                            // Navegação
                            React.createElement('div', { className: 'form-navigation' },
                                currentStep > 1 && React.createElement('button', {
                                    type: 'button',
                                    className: 'nav-btn-modern nav-btn-secondary',
                                    onClick: () => navigateStep(-1)
                                },
                                    React.createElement('i', { className: 'fas fa-arrow-left' }),
                                    React.createElement('span', null, 'Voltar')
                                ),
                                
                                React.createElement('div', { className: 'step-indicator' },
                                    React.createElement('span', { className: 'current-step' }, currentStep),
                                    React.createElement('span', { className: 'step-separator' }, 'de'),
                                    React.createElement('span', { className: 'total-steps' }, '3')
                                ),
                                
                                currentStep < 3 ? React.createElement('button', {
                                    type: 'button',
                                    className: 'nav-btn-modern nav-btn-primary',
                                    onClick: () => navigateStep(1)
                                },
                                    React.createElement('span', null, 'Continuar'),
                                    React.createElement('i', { className: 'fas fa-arrow-right' })
                                ) : React.createElement('button', {
                                    type: 'submit',
                                    className: 'nav-btn-modern nav-btn-success',
                                    disabled: isLoading
                                },
                                    isLoading ? 
                                        React.createElement(React.Fragment, null,
                                            React.createElement('div', { className: 'loading-spinner' }),
                                            React.createElement('span', null, 'Criando...')
                                        ) :
                                        React.createElement(React.Fragment, null,
                                            React.createElement('i', { className: 'fas fa-user-plus' }),
                                            React.createElement('span', null, 'Criar Usuário')
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
    window.CriarUsuarioReact = CriarUsuarioReact;

    // Exportar como módulo ES6
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CriarUsuarioReact;
    }
    
    console.log('✅ [CRIAR USUÁRIO] Componente CriarUsuarioReact definido globalmente');
    
})();

// Export para ES6 modules
 