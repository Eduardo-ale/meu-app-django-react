// Componente React simples para alterar senha
const SenhaReact = () => {
    // Usar React global
    const React = window.React;
    
    // Estado do formulário
    const [formData, setFormData] = React.useState({
        old_password: '',
        new_password1: '',
        new_password2: ''
    });
    
    const [errors, setErrors] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(false);
    const [showPasswords, setShowPasswords] = React.useState({
        old: false,
        new1: false,
        new2: false
    });
    const [successMessage, setSuccessMessage] = React.useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.old_password) {
            newErrors.old_password = 'Senha atual é obrigatória';
        }
        
        if (!formData.new_password1) {
            newErrors.new_password1 = 'Nova senha é obrigatória';
        } else if (formData.new_password1.length < 8) {
            newErrors.new_password1 = 'Nova senha deve ter pelo menos 8 caracteres';
        }
        
        if (!formData.new_password2) {
            newErrors.new_password2 = 'Confirmação de senha é obrigatória';
        } else if (formData.new_password1 !== formData.new_password2) {
            newErrors.new_password2 = 'As senhas não coincidem';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await fetch('/accounts/alterar-senha/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': window.csrfToken || document.querySelector('[name=csrfmiddlewaretoken]')?.value
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                setSuccessMessage('Senha alterada com sucesso!');
                setFormData({
                    old_password: '',
                    new_password1: '',
                    new_password2: ''
                });
                setErrors({});
            } else {
                const data = await response.json();
                setErrors(data.errors || { 'general': 'Erro ao alterar senha' });
            }
        } catch (error) {
            setErrors({ 'general': 'Erro de conexão. Tente novamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Retornar elemento React simples
    return React.createElement('div', {
        style: {
            maxWidth: '800px',
            margin: '2rem auto',
            padding: '2rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }
    }, [
        // Header
        React.createElement('div', {
            key: 'header',
            style: {
                textAlign: 'center',
                marginBottom: '2.5rem',
                padding: '2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                color: 'white'
            }
        }, [
            React.createElement('h1', {
                key: 'title',
                style: {
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }
            }, '🔐 Alterar Senha'),
            React.createElement('p', {
                key: 'subtitle',
                style: {
                    fontSize: '1.2rem',
                    opacity: '0.9',
                    margin: '0',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }
            }, 'Mantenha sua conta segura com uma senha forte e única')
        ]),

        // Mensagem de sucesso
        successMessage && React.createElement('div', {
            key: 'success',
            style: {
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                textAlign: 'center',
                fontSize: '1.1rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }
        }, `🎉 ${successMessage}`),

        // Erro geral
        errors.general && React.createElement('div', {
            key: 'error',
            style: {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                textAlign: 'center',
                fontSize: '1.1rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }
        }, `❌ ${errors.general}`),

        // Formulário
        React.createElement('form', {
            key: 'form',
            onSubmit: handleSubmit,
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
            }
        }, [
            // Senha Atual
            React.createElement('div', {
                key: 'old-password',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                }
            }, [
                React.createElement('label', {
                    key: 'label-old',
                    style: {
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    React.createElement('span', {
                        key: 'badge-old',
                        style: {
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '700'
                        }
                    }, '🔑'),
                    'Senha Atual *'
                ]),
                
                React.createElement('div', {
                    key: 'input-wrapper-old',
                    style: {
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                    }
                }, [
                    React.createElement('input', {
                        key: 'input-old',
                        type: showPasswords.old ? 'text' : 'password',
                        name: 'old_password',
                        value: formData.old_password,
                        onChange: handleInputChange,
                        placeholder: 'Digite sua senha atual',
                        style: {
                            width: '100%',
                            padding: '1rem 3rem 1rem 1rem',
                            border: `2px solid ${errors.old_password ? '#ef4444' : '#d1d5db'}`,
                            borderRadius: '12px',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            background: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }
                    }),
                    
                    React.createElement('button', {
                        key: 'toggle-old',
                        type: 'button',
                        onClick: () => togglePasswordVisibility('old'),
                        style: {
                            position: 'absolute',
                            right: '1rem',
                            background: 'none',
                            border: 'none',
                            color: '#6b7280',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease'
                        }
                    }, showPasswords.old ? '👁️' : '🙈')
                ]),
                
                errors.old_password && React.createElement('div', {
                    key: 'error-old',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#ef4444',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                    }
                }, `❌ ${errors.old_password}`)
            ]),

            // Nova Senha
            React.createElement('div', {
                key: 'new-password',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                }
            }, [
                React.createElement('label', {
                    key: 'label-new',
                    style: {
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    React.createElement('span', {
                        key: 'badge-new',
                        style: {
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '700'
                        }
                    }, '✨'),
                    'Nova Senha *'
                ]),
                
                React.createElement('div', {
                    key: 'input-wrapper-new',
                    style: {
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                    }
                }, [
                    React.createElement('input', {
                        key: 'input-new',
                        type: showPasswords.new1 ? 'text' : 'password',
                        name: 'new_password1',
                        value: formData.new_password1,
                        onChange: handleInputChange,
                        placeholder: 'Digite sua nova senha',
                        style: {
                            width: '100%',
                            padding: '1rem 3rem 1rem 1rem',
                            border: `2px solid ${errors.new_password1 ? '#ef4444' : '#d1d5db'}`,
                            borderRadius: '12px',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            background: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }
                    }),
                    
                    React.createElement('button', {
                        key: 'toggle-new',
                        type: 'button',
                        onClick: () => togglePasswordVisibility('new1'),
                        style: {
                            position: 'absolute',
                            right: '1rem',
                            background: 'none',
                            border: 'none',
                            color: '#6b7280',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease'
                        }
                    }, showPasswords.new1 ? '👁️' : '🙈')
                ]),
                
                errors.new_password1 && React.createElement('div', {
                    key: 'error-new',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#ef4444',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                    }
                }, `❌ ${errors.new_password1}`)
            ]),

            // Confirmar Nova Senha
            React.createElement('div', {
                key: 'confirm-password',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                }
            }, [
                React.createElement('label', {
                    key: 'label-confirm',
                    style: {
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    React.createElement('span', {
                        key: 'badge-confirm',
                        style: {
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '700'
                        }
                    }, '🔒'),
                    'Confirmar Nova Senha *'
                ]),
                
                React.createElement('div', {
                    key: 'input-wrapper-confirm',
                    style: {
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                    }
                }, [
                    React.createElement('input', {
                        key: 'input-confirm',
                        type: showPasswords.new2 ? 'text' : 'password',
                        name: 'new_password2',
                        value: formData.new_password2,
                        onChange: handleInputChange,
                        placeholder: 'Confirme sua nova senha',
                        style: {
                            width: '100%',
                            padding: '1rem 3rem 1rem 1rem',
                            border: `2px solid ${errors.new_password2 ? '#ef4444' : '#d1d5db'}`,
                            borderRadius: '12px',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            background: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }
                    }),
                    
                    React.createElement('button', {
                        key: 'toggle-confirm',
                        type: 'button',
                        onClick: () => togglePasswordVisibility('new2'),
                        style: {
                            position: 'absolute',
                            right: '1rem',
                            background: 'none',
                            border: 'none',
                            color: '#6b7280',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease'
                        }
                    }, showPasswords.new2 ? '👁️' : '🙈')
                ]),
                
                errors.new_password2 && React.createElement('div', {
                    key: 'error-confirm',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#ef4444',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                    }
                }, `❌ ${errors.new_password2}`)
            ]),

            // Botões de ação
            React.createElement('div', {
                key: 'actions',
                style: {
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'space-between',
                    marginTop: '2rem',
                    paddingTop: '2rem',
                    borderTop: '2px solid #f3f4f6'
                }
            }, [
                React.createElement('button', {
                    key: 'cancel',
                    type: 'button',
                    onClick: () => window.history.back(),
                    style: {
                        padding: '1rem 2rem',
                        background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
                    }
                }, '← Cancelar'),
                
                React.createElement('button', {
                    key: 'submit',
                    type: 'submit',
                    disabled: isLoading,
                    style: {
                        padding: '1rem 2rem',
                        background: isLoading 
                            ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s ease',
                        boxShadow: isLoading 
                            ? '0 4px 12px rgba(156, 163, 175, 0.3)'
                            : '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }
                }, isLoading ? 'Processando...' : '🔄 Alterar Senha')
            ])
        ])
    ]);
};

// Exportar o componente
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SenhaReact;
} else {
    window.SenhaReact = SenhaReact;
}
 