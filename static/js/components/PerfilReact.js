import React from 'react';

function PerfilReact(props) {
        // Estados do componente
        const [formData, setFormData] = React.useState({
            first_name: props.usuario_editado?.first_name || '',
            last_name: props.usuario_editado?.last_name || '',
            username: props.usuario_editado?.username || '',
            email: props.usuario_editado?.email || ''
        });
        
        const [errors, setErrors] = React.useState({});
        const [isLoading, setIsLoading] = React.useState(false);
        const [showPreview, setShowPreview] = React.useState(true);
        
        // Dados das props
        const { usuario, usuario_editado, editando_outro, data_atual } = props;
        
        // Função para atualizar campos do formulário
        const handleInputChange = (field, value) => {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
            
            // Limpar erro do campo ao alterar
            if (errors[field]) {
                setErrors(prev => ({
                    ...prev,
                    [field]: ''
                }));
            }
        };
        
        // Validação do formulário
        const validateForm = () => {
            const newErrors = {};
            
            if (!formData.first_name.trim()) {
                newErrors.first_name = 'Nome é obrigatório';
            }
            
            if (!formData.username.trim()) {
                newErrors.username = 'Nome de usuário é obrigatório';
            } else if (formData.username.length < 3) {
                newErrors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
            }
            
            if (formData.email && !isValidEmail(formData.email)) {
                newErrors.email = 'Email inválido';
            }
            
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };
        
        // Validação de email
        const isValidEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };
        
        // Submit do formulário
        const handleSubmit = async (e) => {
            e.preventDefault();
            
            if (!validateForm()) {
                return;
            }
            
            setIsLoading(true);
            
            try {
                const formDataObj = new FormData();
                formDataObj.append('first_name', formData.first_name.trim());
                formDataObj.append('last_name', formData.last_name.trim());
                formDataObj.append('username', formData.username.trim());
                formDataObj.append('email', formData.email.trim());
                
                // Adicionar CSRF token
                const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
                if (csrfToken) {
                    formDataObj.append('csrfmiddlewaretoken', csrfToken);
                }
                
                const response = await fetch(window.location.href, {
                    method: 'POST',
                    body: formDataObj,
                    headers: {
                        'X-CSRFToken': csrfToken
                    }
                });
                
                if (response.ok) {
                    // Sucesso - redirecionar
                    if (editando_outro) {
                        window.location.href = '/accounts/usuarios/gerenciar/';
                    } else {
                        window.location.href = '/accounts/configuracoes/';
                    }
                } else {
                    const responseText = await response.text();
                    
                    // Verificar se há erros específicos na resposta
                    if (responseText.includes('já está em uso')) {
                        if (responseText.includes('nome de usuário')) {
                            setErrors({ username: 'Este nome de usuário já está em uso' });
                        } else if (responseText.includes('email')) {
                            setErrors({ email: 'Este email já está em uso' });
                        }
                    } else {
                        setErrors({ general: 'Erro ao salvar. Tente novamente.' });
                    }
                }
            } catch (error) {
                console.error('Erro:', error);
                setErrors({ general: 'Erro de conexão. Tente novamente.' });
            } finally {
                setIsLoading(false);
            }
        };
        
        // Função para voltar
        const handleBack = () => {
            if (editando_outro) {
                window.location.href = '/accounts/usuarios/gerenciar/';
            } else {
                window.location.href = '/accounts/configuracoes/';
            }
        };
        
        // Função para obter iniciais do avatar
        const getAvatarInitials = () => {
            const name = formData.first_name || formData.username || 'U';
            return name.charAt(0).toUpperCase();
        };
        
        return React.createElement('div', { className: 'perfil-react' },
            React.createElement('div', { className: 'background-animation' },
                React.createElement('div', { className: 'floating-shapes' },
                    React.createElement('div', { className: 'shape shape-1' }),
                    React.createElement('div', { className: 'shape shape-2' }),
                    React.createElement('div', { className: 'shape shape-3' }),
                    React.createElement('div', { className: 'shape shape-4' })
                )
            ),
            
            React.createElement('div', { className: 'main-container' },
                // Breadcrumb
                React.createElement('div', { className: 'breadcrumb-container' },
                    React.createElement('nav', { className: 'breadcrumb' },
                        React.createElement('a', { 
                            href: '/accounts/', 
                            className: 'breadcrumb-item' 
                        },
                            React.createElement('i', { className: 'fas fa-home' }),
                            'Dashboard'
                        ),
                        React.createElement('span', { className: 'breadcrumb-separator' }, 
                            React.createElement('i', { className: 'fas fa-chevron-right' })
                        ),
                        editando_outro ? [
                            React.createElement('a', { 
                                key: 'config',
                                href: '/accounts/configuracoes/', 
                                className: 'breadcrumb-item' 
                            },
                                React.createElement('i', { className: 'fas fa-cog' }),
                                'Configurações'
                            ),
                            React.createElement('span', { 
                                key: 'sep1',
                                className: 'breadcrumb-separator' 
                            }, 
                                React.createElement('i', { className: 'fas fa-chevron-right' })
                            ),
                            React.createElement('a', { 
                                key: 'users',
                                href: '/accounts/usuarios/gerenciar/', 
                                className: 'breadcrumb-item' 
                            },
                                React.createElement('i', { className: 'fas fa-users-cog' }),
                                'Gerenciar Usuários'
                            ),
                            React.createElement('span', { 
                                key: 'sep2',
                                className: 'breadcrumb-separator' 
                            }, 
                                React.createElement('i', { className: 'fas fa-chevron-right' })
                            ),
                            React.createElement('span', { 
                                key: 'current',
                                className: 'breadcrumb-item active' 
                            },
                                React.createElement('i', { className: 'fas fa-user-edit' }),
                                `Editar ${usuario_editado?.username || 'Usuário'}`
                            )
                        ] : [
                            React.createElement('a', { 
                                key: 'config',
                                href: '/accounts/configuracoes/', 
                                className: 'breadcrumb-item' 
                            },
                                React.createElement('i', { className: 'fas fa-cog' }),
                                'Configurações'
                            ),
                            React.createElement('span', { 
                                key: 'sep',
                                className: 'breadcrumb-separator' 
                            }, 
                                React.createElement('i', { className: 'fas fa-chevron-right' })
                            ),
                            React.createElement('span', { 
                                key: 'current',
                                className: 'breadcrumb-item active' 
                            },
                                React.createElement('i', { className: 'fas fa-user-edit' }),
                                'Editar Perfil'
                            )
                        ]
                    )
                ),
                
                // Header
                React.createElement('div', { className: 'page-header' },
                    React.createElement('div', { className: 'header-content' },
                        React.createElement('div', { className: 'header-avatar' },
                            React.createElement('div', { className: 'avatar-circle' },
                                React.createElement('span', { className: 'avatar-text' }, getAvatarInitials()),
                                React.createElement('div', { className: 'avatar-status' })
                            )
                        ),
                        React.createElement('div', { className: 'header-info' },
                            React.createElement('h1', { className: 'page-title' },
                                editando_outro ? 
                                    `Editar Usuário: ${usuario_editado?.first_name || usuario_editado?.username || 'Usuário'}` :
                                    'Editar Perfil'
                            ),
                            React.createElement('p', { className: 'page-subtitle' },
                                editando_outro ?
                                    `Atualize as informações do usuário ${usuario_editado?.username || ''}` :
                                    'Mantenha suas informações atualizadas e personalize sua experiência'
                            ),
                            React.createElement('div', { className: 'user-meta' },
                                React.createElement('span', { className: 'meta-item' },
                                    React.createElement('i', { className: 'fas fa-calendar-alt' }),
                                    `Membro desde ${new Date(usuario_editado?.date_joined || Date.now()).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`
                                ),
                                React.createElement('span', { className: 'meta-item' },
                                    React.createElement('i', { className: 'fas fa-shield-check' }),
                                    'Conta verificada'
                                ),
                                editando_outro && React.createElement('span', { className: 'meta-item' },
                                    React.createElement('i', { className: 'fas fa-user-edit' }),
                                    'Editando como administrador'
                                )
                            )
                        )
                    )
                ),
                
                // Main Content
                React.createElement('div', { className: 'content-grid' },
                    // Form Section
                    React.createElement('section', { className: 'form-section' },
                        React.createElement('div', { className: 'form-card' },
                            React.createElement('div', { className: 'card-header' },
                                React.createElement('div', { className: 'header-icon' },
                                    React.createElement('i', { className: 'fas fa-user-circle' })
                                ),
                                React.createElement('div', { className: 'header-text' },
                                    React.createElement('h2', null, 'Informações Pessoais'),
                                    React.createElement('p', null, 'Atualize seus dados básicos do perfil')
                                )
                            ),
                            
                            React.createElement('form', { 
                                className: 'profile-form',
                                onSubmit: handleSubmit 
                            },
                                // Token CSRF
                                React.createElement('input', {
                                    type: 'hidden',
                                    name: 'csrfmiddlewaretoken',
                                    value: window.csrfToken || ''
                                }),
                                
                                React.createElement('div', { className: 'form-body' },
                                    // Erro geral
                                    errors.general && React.createElement('div', { className: 'error-banner' },
                                        React.createElement('i', { className: 'fas fa-exclamation-triangle' }),
                                        errors.general
                                    ),
                                    
                                    // Primeira linha - Nome e Sobrenome
                                    React.createElement('div', { className: 'form-row' },
                                        React.createElement('div', { className: 'form-group' },
                                            React.createElement('label', { className: 'form-label' },
                                                React.createElement('i', { className: 'fas fa-user' }),
                                                React.createElement('span', null, 'Nome'),
                                                React.createElement('span', { className: 'required' }, '*')
                                            ),
                                            React.createElement('div', { className: 'input-wrapper' },
                                                React.createElement('input', {
                                                    type: 'text',
                                                    className: `form-input ${errors.first_name ? 'error' : ''}`,
                                                    value: formData.first_name,
                                                    onChange: (e) => handleInputChange('first_name', e.target.value),
                                                    placeholder: editando_outro ? 'Digite o nome' : 'Digite seu nome',
                                                    required: true
                                                }),
                                                React.createElement('div', { className: 'input-focus-ring' })
                                            ),
                                            errors.first_name && React.createElement('div', { className: 'form-feedback' },
                                                React.createElement('i', { className: 'fas fa-exclamation-circle' }),
                                                errors.first_name
                                            )
                                        ),
                                        
                                        React.createElement('div', { className: 'form-group' },
                                            React.createElement('label', { className: 'form-label' },
                                                React.createElement('i', { className: 'fas fa-user' }),
                                                React.createElement('span', null, 'Sobrenome')
                                            ),
                                            React.createElement('div', { className: 'input-wrapper' },
                                                React.createElement('input', {
                                                    type: 'text',
                                                    className: 'form-input',
                                                    value: formData.last_name,
                                                    onChange: (e) => handleInputChange('last_name', e.target.value),
                                                    placeholder: editando_outro ? 'Digite o sobrenome' : 'Digite seu sobrenome'
                                                }),
                                                React.createElement('div', { className: 'input-focus-ring' })
                                            )
                                        )
                                    ),
                                    
                                    // Segunda linha - Username e Email
                                    React.createElement('div', { className: 'form-row' },
                                        React.createElement('div', { className: 'form-group' },
                                            React.createElement('label', { className: 'form-label' },
                                                React.createElement('i', { className: 'fas fa-at' }),
                                                React.createElement('span', null, 'Nome de Usuário'),
                                                React.createElement('span', { className: 'required' }, '*')
                                            ),
                                            React.createElement('div', { className: 'input-wrapper' },
                                                React.createElement('input', {
                                                    type: 'text',
                                                    className: `form-input ${errors.username ? 'error' : ''}`,
                                                    value: formData.username,
                                                    onChange: (e) => handleInputChange('username', e.target.value),
                                                    placeholder: editando_outro ? 'Digite o nome de usuário' : 'Digite seu nome de usuário',
                                                    required: true
                                                }),
                                                React.createElement('div', { className: 'input-focus-ring' })
                                            ),
                                            errors.username && React.createElement('div', { className: 'form-feedback' },
                                                React.createElement('i', { className: 'fas fa-exclamation-circle' }),
                                                errors.username
                                            ),
                                            React.createElement('small', { className: 'form-hint' },
                                                React.createElement('i', { className: 'fas fa-info-circle' }),
                                                'Este será seu identificador único no sistema'
                                            )
                                        ),
                                        
                                        React.createElement('div', { className: 'form-group' },
                                            React.createElement('label', { className: 'form-label' },
                                                React.createElement('i', { className: 'fas fa-envelope' }),
                                                React.createElement('span', null, 'Email')
                                            ),
                                            React.createElement('div', { className: 'input-wrapper' },
                                                React.createElement('input', {
                                                    type: 'email',
                                                    className: `form-input ${errors.email ? 'error' : ''}`,
                                                    value: formData.email,
                                                    onChange: (e) => handleInputChange('email', e.target.value),
                                                    placeholder: editando_outro ? 'Digite o email' : 'Digite seu email'
                                                }),
                                                React.createElement('div', { className: 'input-focus-ring' })
                                            ),
                                            errors.email && React.createElement('div', { className: 'form-feedback' },
                                                React.createElement('i', { className: 'fas fa-exclamation-circle' }),
                                                errors.email
                                            ),
                                            React.createElement('small', { className: 'form-hint' },
                                                React.createElement('i', { className: 'fas fa-info-circle' }),
                                                'Usado para notificações e recuperação de conta'
                                            )
                                        )
                                    )
                                ),
                                
                                React.createElement('div', { className: 'form-footer' },
                                    React.createElement('div', { className: 'action-buttons' },
                                        React.createElement('button', {
                                            type: 'button',
                                            className: 'btn btn-secondary',
                                            onClick: handleBack,
                                            disabled: isLoading
                                        },
                                            React.createElement('i', { className: 'fas fa-arrow-left' }),
                                            React.createElement('span', null, editando_outro ? 'Voltar para Usuários' : 'Voltar')
                                        ),
                                        React.createElement('button', {
                                            type: 'submit',
                                            className: `btn btn-primary ${isLoading ? 'loading' : ''}`,
                                            disabled: isLoading
                                        },
                                            React.createElement('i', { 
                                                className: isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-save' 
                                            }),
                                            React.createElement('span', null, isLoading ? 'Salvando...' : 'Salvar Alterações'),
                                            React.createElement('div', { className: 'btn-ripple' })
                                        )
                                    )
                                )
                            )
                        )
                    ),
                    
                    // Side Panel
                    React.createElement('aside', { className: 'side-panel' },
                        // Preview Card
                        React.createElement('div', { className: 'preview-card' },
                            React.createElement('div', { className: 'preview-header' },
                                React.createElement('h3', null, 'Prévia do Perfil'),
                                React.createElement('span', { className: 'preview-badge' }, 'Ao vivo')
                            ),
                            React.createElement('div', { className: 'preview-content' },
                                React.createElement('div', { className: 'preview-avatar' },
                                    React.createElement('span', { className: 'preview-avatar-text' }, getAvatarInitials())
                                ),
                                React.createElement('div', { className: 'preview-info' },
                                    React.createElement('h4', { className: 'preview-name' }, 
                                        formData.first_name || formData.username || 'Nome'
                                    ),
                                    React.createElement('p', { className: 'preview-username' }, 
                                        `@${formData.username || 'username'}`
                                    ),
                                    React.createElement('p', { className: 'preview-email' }, 
                                        formData.email || 'Sem email'
                                    )
                                )
                            )
                        ),
                        
                        // Quick Actions
                        React.createElement('div', { className: 'actions-card' },
                            React.createElement('h3', null, 'Ações Rápidas'),
                            React.createElement('div', { className: 'quick-actions' },
                                editando_outro ? [
                                    React.createElement('a', {
                                        key: 'manage',
                                        href: '/accounts/usuarios/gerenciar/',
                                        className: 'quick-action'
                                    },
                                        React.createElement('i', { className: 'fas fa-users-cog' }),
                                        React.createElement('span', null, 'Gerenciar Usuários'),
                                        React.createElement('i', { className: 'fas fa-chevron-right' })
                                    ),
                                    React.createElement('a', {
                                        key: 'config',
                                        href: '/accounts/configuracoes/',
                                        className: 'quick-action'
                                    },
                                        React.createElement('i', { className: 'fas fa-cog' }),
                                        React.createElement('span', null, 'Configurações'),
                                        React.createElement('i', { className: 'fas fa-chevron-right' })
                                    )
                                ] : [
                                    React.createElement('a', {
                                        key: 'password',
                                        href: '/accounts/configuracoes/senha/',
                                        className: 'quick-action'
                                    },
                                        React.createElement('i', { className: 'fas fa-key' }),
                                        React.createElement('span', null, 'Alterar Senha'),
                                        React.createElement('i', { className: 'fas fa-chevron-right' })
                                    ),
                                    React.createElement('a', {
                                        key: 'config',
                                        href: '/accounts/configuracoes/',
                                        className: 'quick-action'
                                    },
                                        React.createElement('i', { className: 'fas fa-cog' }),
                                        React.createElement('span', null, 'Configurações'),
                                        React.createElement('i', { className: 'fas fa-chevron-right' })
                                    )
                                ],
                                React.createElement('a', {
                                    href: '/accounts/',
                                    className: 'quick-action'
                                },
                                    React.createElement('i', { className: 'fas fa-tachometer-alt' }),
                                    React.createElement('span', null, 'Dashboard'),
                                    React.createElement('i', { className: 'fas fa-chevron-right' })
                                )
                            )
                        )
                    )
                )
            )
        );
    }

export default PerfilReact;
 