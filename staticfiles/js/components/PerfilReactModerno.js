import React from 'react';

function PerfilReactModerno(props) {
    // Estados do componente
    const [formData, setFormData] = React.useState({
        first_name: props.usuario_editado?.first_name || '',
        last_name: props.usuario_editado?.last_name || '',
        username: props.usuario_editado?.username || '',
        email: props.usuario_editado?.email || ''
    });
    
    const [errors, setErrors] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [activeField, setActiveField] = React.useState('');

    // Dados das props
    const { usuario, usuario_editado, editando_outro } = props;

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

    // Validação em tempo real
    const validateField = (field, value) => {
        let error = '';
        
        switch(field) {
            case 'first_name':
                if (!value.trim()) error = 'Nome é obrigatório';
                break;
            case 'username':
                if (!value.trim()) error = 'Nome de usuário é obrigatório';
                else if (value.length < 3) error = 'Mínimo 3 caracteres';
                break;
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Email inválido';
                }
                break;
        }
        
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
        
        return !error;
    };

    // Submit do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validar todos os campos
        const isValid = Object.keys(formData).every(field => 
            validateField(field, formData[field])
        );
        
        if (!isValid) return;
        
        setIsLoading(true);
        
        try {
            const formDataObj = new FormData();
            Object.keys(formData).forEach(key => {
                formDataObj.append(key, formData[key].trim());
            });
            
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
                setShowSuccess(true);
                setTimeout(() => {
                    if (editando_outro) {
                        window.location.href = '/accounts/usuarios/gerenciar/';
                    } else {
                        window.location.href = '/accounts/configuracoes/';
                    }
                }, 2000);
            } else {
                throw new Error('Erro ao salvar');
            }
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return React.createElement('div', { className: 'perfil-react-moderno' },
        // Estilos CSS
        React.createElement('style', null, `
            .perfil-react-moderno {
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 2rem;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            .container-moderno {
                max-width: 1200px;
                margin: 0 auto;
                display: grid;
                grid-template-columns: 1fr 400px;
                gap: 2rem;
                align-items: start;
            }
            
            .breadcrumb-container {
                grid-column: 1 / -1;
                margin-bottom: 1.5rem;
            }
            
            .breadcrumb-nav {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                padding: 1rem 1.5rem;
                border-radius: 15px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                animation: fadeInDown 0.6s ease-out;
            }
            
            .breadcrumb-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: rgba(255, 255, 255, 0.8);
                text-decoration: none;
                font-weight: 500;
                transition: all 0.3s ease;
                padding: 0.5rem 0.75rem;
                border-radius: 8px;
            }
            
            .breadcrumb-item:hover {
                color: white;
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-1px);
            }
            
            .breadcrumb-item.active {
                color: white;
                background: rgba(255, 255, 255, 0.15);
                font-weight: 600;
            }
            
            .breadcrumb-separator {
                color: rgba(255, 255, 255, 0.5);
                font-size: 0.8rem;
            }
            
            .header-moderno {
                grid-column: 1 / -1;
                text-align: center;
                margin-bottom: 2rem;
                color: white;
            }
            
            .header-moderno h1 {
                font-size: 3rem;
                font-weight: 700;
                margin: 0 0 1rem;
                text-shadow: 0 2px 10px rgba(0,0,0,0.3);
                animation: fadeInDown 0.8s ease-out;
            }
            
            .header-moderno p {
                font-size: 1.2rem;
                opacity: 0.9;
                margin: 0;
                animation: fadeInUp 0.8s ease-out 0.2s both;
            }
            
            .form-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 2.5rem;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                animation: slideInLeft 0.8s ease-out 0.4s both;
            }
            
            .form-group {
                margin-bottom: 2rem;
                position: relative;
            }
            
            .form-label {
                display: block;
                font-weight: 600;
                color: #374151;
                margin-bottom: 0.5rem;
                font-size: 0.95rem;
                transition: color 0.3s ease;
            }
            
            .form-input {
                width: 100%;
                padding: 1rem 1.2rem;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                font-size: 1rem;
                transition: all 0.3s ease;
                background: #f9fafb;
                box-sizing: border-box;
            }
            
            .form-input:focus {
                outline: none;
                border-color: #667eea;
                background: white;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                transform: translateY(-2px);
            }
            
            .form-input.error {
                border-color: #ef4444;
                background: #fef2f2;
            }
            
            .error-message {
                color: #ef4444;
                font-size: 0.875rem;
                margin-top: 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                animation: fadeIn 0.3s ease-out;
            }
            
            .submit-button {
                width: 100%;
                padding: 1.2rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .submit-button:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            }
            
            .submit-button:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }
            
            .preview-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                animation: slideInRight 0.8s ease-out 0.6s both;
                height: fit-content;
                position: sticky;
                top: 2rem;
            }
            
            .preview-header {
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .preview-header h3 {
                color: #374151;
                font-size: 1.5rem;
                margin: 0 0 0.5rem;
            }
            
            .preview-badge {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 600;
                display: inline-block;
                animation: pulse 2s infinite;
            }
            
            .avatar-section {
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .avatar-circle {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1rem;
                font-size: 3rem;
                color: white;
                font-weight: 700;
                text-transform: uppercase;
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
                transition: transform 0.3s ease;
            }
            
            .avatar-circle:hover {
                transform: scale(1.05);
            }
            
            .preview-info {
                background: #f8fafc;
                border-radius: 12px;
                padding: 1.5rem;
                margin-top: 1rem;
            }
            
            .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 0;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .info-item:last-child {
                border-bottom: none;
            }
            
            .info-label {
                font-weight: 600;
                color: #6b7280;
                font-size: 0.9rem;
            }
            
            .info-value {
                font-weight: 600;
                color: #374151;
                text-align: right;
                max-width: 60%;
                word-break: break-word;
            }
            
            .success-message {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
                z-index: 1000;
                animation: slideInRight 0.5s ease-out;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            @keyframes fadeInDown {
                from { opacity: 0; transform: translateY(-30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes slideInLeft {
                from { opacity: 0; transform: translateX(-50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            @media (max-width: 768px) {
                .container-moderno {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                    padding: 1rem;
                }
                
                .header-moderno h1 {
                    font-size: 2rem;
                }
                
                .form-card, .preview-card {
                    padding: 1.5rem;
                }
            }
        `),

        // Conteúdo principal
        React.createElement('div', { className: 'container-moderno' },
            // Breadcrumb
            React.createElement('div', { className: 'breadcrumb-container' },
                React.createElement('nav', { className: 'breadcrumb-nav' },
                    React.createElement('a', { 
                        href: '/',
                        className: 'breadcrumb-item'
                    },
                        React.createElement('i', { className: 'fas fa-home' }),
                        React.createElement('span', null, 'Dashboard')
                    ),
                    React.createElement('span', { className: 'breadcrumb-separator' }, '→'),
                    React.createElement('a', { 
                        href: '/accounts/configuracoes/',
                        className: 'breadcrumb-item'
                    },
                        React.createElement('i', { className: 'fas fa-cog' }),
                        React.createElement('span', null, 'Configurações')
                    ),
                    React.createElement('span', { className: 'breadcrumb-separator' }, '→'),
                    editando_outro && React.createElement(React.Fragment, null,
                        React.createElement('a', { 
                            href: '/accounts/usuarios/gerenciar/',
                            className: 'breadcrumb-item'
                        },
                            React.createElement('i', { className: 'fas fa-users-cog' }),
                            React.createElement('span', null, 'Gerenciar Usuários')
                        ),
                        React.createElement('span', { className: 'breadcrumb-separator' }, '→')
                    ),
                    React.createElement('span', { className: 'breadcrumb-item active' },
                        React.createElement('i', { className: 'fas fa-user-edit' }),
                        React.createElement('span', null, editando_outro ? `Editar ${usuario_editado?.username}` : 'Editar Perfil')
                    )
                )
            ),

            // Header
            React.createElement('div', { className: 'header-moderno' },
                React.createElement('h1', null, editando_outro ? `Editar ${usuario_editado?.username}` : 'Meu Perfil'),
                React.createElement('p', null, 'Mantenha suas informações sempre atualizadas')
            ),

            // Formulário
            React.createElement('div', { className: 'form-card' },
                React.createElement('form', { onSubmit: handleSubmit },
                    // Nome
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' }, '👤 Nome'),
                        React.createElement('input', {
                            type: 'text',
                            className: `form-input ${errors.first_name ? 'error' : ''}`,
                            value: formData.first_name,
                            onChange: (e) => {
                                handleInputChange('first_name', e.target.value);
                                validateField('first_name', e.target.value);
                            },
                            onFocus: () => setActiveField('first_name'),
                            onBlur: () => setActiveField(''),
                            placeholder: 'Digite seu nome'
                        }),
                        errors.first_name && React.createElement('div', { className: 'error-message' },
                            React.createElement('span', null, '⚠️'),
                            errors.first_name
                        )
                    ),

                    // Sobrenome
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' }, '👥 Sobrenome'),
                        React.createElement('input', {
                            type: 'text',
                            className: `form-input ${errors.last_name ? 'error' : ''}`,
                            value: formData.last_name,
                            onChange: (e) => handleInputChange('last_name', e.target.value),
                            placeholder: 'Digite seu sobrenome'
                        })
                    ),

                    // Username
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' }, '🔑 Nome de Usuário'),
                        React.createElement('input', {
                            type: 'text',
                            className: `form-input ${errors.username ? 'error' : ''}`,
                            value: formData.username,
                            onChange: (e) => {
                                handleInputChange('username', e.target.value);
                                validateField('username', e.target.value);
                            },
                            placeholder: 'Digite seu nome de usuário'
                        }),
                        errors.username && React.createElement('div', { className: 'error-message' },
                            React.createElement('span', null, '⚠️'),
                            errors.username
                        )
                    ),

                    // Email
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { className: 'form-label' }, '📧 Email'),
                        React.createElement('input', {
                            type: 'email',
                            className: `form-input ${errors.email ? 'error' : ''}`,
                            value: formData.email,
                            onChange: (e) => {
                                handleInputChange('email', e.target.value);
                                validateField('email', e.target.value);
                            },
                            placeholder: 'Digite seu email'
                        }),
                        errors.email && React.createElement('div', { className: 'error-message' },
                            React.createElement('span', null, '⚠️'),
                            errors.email
                        )
                    ),

                    // Botão Submit
                    React.createElement('button', {
                        type: 'submit',
                        className: 'submit-button',
                        disabled: isLoading
                    }, isLoading ? '⏳ Salvando...' : '💾 Salvar Alterações')
                )
            ),

            // Preview
            React.createElement('div', { className: 'preview-card' },
                React.createElement('div', { className: 'preview-header' },
                    React.createElement('h3', null, 'Preview'),
                    React.createElement('span', { className: 'preview-badge' }, 'Ao Vivo')
                ),

                React.createElement('div', { className: 'avatar-section' },
                    React.createElement('div', { className: 'avatar-circle' },
                        (formData.first_name.charAt(0) || 'U') + (formData.last_name.charAt(0) || 'S')
                    )
                ),

                React.createElement('div', { className: 'preview-info' },
                    React.createElement('div', { className: 'info-item' },
                        React.createElement('span', { className: 'info-label' }, 'Nome Completo'),
                        React.createElement('span', { className: 'info-value' }, 
                            `${formData.first_name} ${formData.last_name}`.trim() || 'Não informado'
                        )
                    ),
                    React.createElement('div', { className: 'info-item' },
                        React.createElement('span', { className: 'info-label' }, 'Usuário'),
                        React.createElement('span', { className: 'info-value' }, formData.username || 'Não informado')
                    ),
                    React.createElement('div', { className: 'info-item' },
                        React.createElement('span', { className: 'info-label' }, 'Email'),
                        React.createElement('span', { className: 'info-value' }, formData.email || 'Não informado')
                    )
                )
            )
        ),

        // Mensagem de sucesso
        showSuccess && React.createElement('div', { className: 'success-message' },
            React.createElement('span', null, '✅'),
            'Perfil salvo com sucesso!'
        )
    );
}

export default PerfilReactModerno;
