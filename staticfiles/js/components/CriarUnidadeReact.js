// Componente React para Criar Unidade de Saúde - Versão Completa
(function() {
    'use strict';

    function CriarUnidadeReact(props) {
        const { usuario, dataAtual, csrfToken, dadosPreenchimento } = props;
        
        // Garantir que dadosPreenchimento seja um objeto válido
        let dadosSeguros = {};
        try {
            if (dadosPreenchimento) {
                if (typeof dadosPreenchimento === 'string') {
                    dadosSeguros = JSON.parse(dadosPreenchimento);
                } else if (typeof dadosPreenchimento === 'object') {
                    dadosSeguros = dadosPreenchimento;
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao processar dados de pré-preenchimento:', error);
            dadosSeguros = {};
        }
        
        // Validação adicional para garantir que todos os campos sejam strings válidas
        Object.keys(dadosSeguros).forEach(key => {
            if (dadosSeguros[key] && typeof dadosSeguros[key] !== 'string') {
                dadosSeguros[key] = String(dadosSeguros[key]);
            }
        });
        
        // Estados do formulário
        const [formData, setFormData] = React.useState({
            nome: String(dadosSeguros.nome || ''),
            tipo: String(dadosSeguros.tipo || 'UNIDADE_EXECUTANTE'),
            cnes: String(dadosSeguros.cnes || ''),
            responsavel: String(dadosSeguros.responsavel || ''),
            contato_telefonico: String(dadosSeguros.contato_telefonico || ''),
            municipio: String(dadosSeguros.municipio || ''),
            endereco: String(dadosSeguros.endereco || ''),
            telefone: String(dadosSeguros.telefone || ''),
            email: String(dadosSeguros.email || '')
        });
        
        console.log('🔍 Estado inicial formData:', formData);

        const [isLoading, setIsLoading] = React.useState(false);
        const [errors, setErrors] = React.useState({});
        const [currentDateTime, setCurrentDateTime] = React.useState(new Date());
        const [dadosCNES, setDadosCNES] = React.useState(null);
        const [consultandoCNES, setConsultandoCNES] = React.useState(false);
        const [municipioResults, setMunicipioResults] = React.useState([]);
        const [municipioDropdownOpen, setMunicipioDropdownOpen] = React.useState(false);
        const [municipioSearching, setMunicipioSearching] = React.useState(false);
        const [municipioDebounceTimer, setMunicipioDebounceTimer] = React.useState(null);
        
        // Garantir que municipioResults seja sempre um array
        React.useEffect(() => {
            if (!Array.isArray(municipioResults)) {
                setMunicipioResults([]);
            }
            
            // Validação adicional: garantir que todos os itens sejam strings
            if (Array.isArray(municipioResults) && municipioResults.some(item => typeof item !== 'string')) {
                const resultadosValidados = municipioResults.map(item => {
                    if (typeof item === 'string') {
                        return item;
                    } else if (item && typeof item === 'object') {
                        return item.nome || item.text || item.id || 'Município';
                    }
                    return 'Município';
                }).filter(item => item && typeof item === 'string' && item.trim() !== '');
                
                setMunicipioResults(resultadosValidados);
            }
        }, [municipioResults]);
        
        // Teste automático do telefone (67) 99264-4308
        React.useEffect(() => {
            console.log('🧪 INICIANDO TESTE AUTOMÁTICO DO TELEFONE');
            testarTelefone('(67) 99264-4308');
            testarTelefone('67992644308');
            testarTelefone('67 99264 4308');
        }, []);

        // Atualizar data/hora a cada segundo
        React.useEffect(() => {
            const timer = setInterval(() => {
                setCurrentDateTime(new Date());
            }, 1000);
            return () => clearInterval(timer);
        }, []);

        // Limpar timer de debounce do município ao desmontar
        React.useEffect(() => {
            return () => {
                if (municipioDebounceTimer) {
                    clearTimeout(municipioDebounceTimer);
                }
            };
        }, [municipioDebounceTimer]);

        // Função para obter CSRF token
        const getCsrfToken = () => {
            const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
            if (csrfInput) {
                return csrfInput.value;
            }
            
            const csrfCookie = document.cookie
                .split('; ')
                .find(row => row.startsWith('csrftoken='));
            
            if (csrfCookie) {
                return csrfCookie.split('=')[1];
            }
            
            return csrfToken;
        };

        // Consultar API CNES
        const consultarCNES = async (codigoCNES) => {
            let cnesLimpo = String(codigoCNES).replace(/[^0-9]/g, '');
            
            if (cnesLimpo.length !== 7) {
                setDadosCNES(null);
                return { sucesso: false, erro: 'Código CNES deve ter exatamente 7 dígitos' };
            }

            const baseUrl = window.location.origin;
            const apiPath = '/accounts/api/cnes/';
            const fullUrl = `${baseUrl}${apiPath}${cnesLimpo}/`;

            setConsultandoCNES(true);
            
            try {
                showToast('Consultando CNES na base de dados do Ministério da Saúde...', 'info');
                
                const response = await fetch(fullUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    cache: 'no-cache'
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        setDadosCNES(null);
                        showToast('❌ Código CNES não encontrado na base de dados do Ministério da Saúde', 'error');
                        return { 
                            sucesso: false, 
                            erro: 'Código CNES não encontrado na base de dados do Ministério da Saúde' 
                        };
                    }
                    
                    setDadosCNES(null);
                    showToast(`❌ Erro ${response.status}: ${response.statusText}`, 'error');
                    return { 
                        sucesso: false, 
                        erro: `Erro ${response.status}: ${response.statusText}` 
                    };
                }

                const resultado = await response.json();

                if (resultado.sucesso || resultado.success) {
                    const dados = resultado.dados || resultado.data;
                    setDadosCNES(dados);
                    
                    // Preencher automaticamente os campos com dados do CNES
                    setFormData(prev => ({
                        ...prev,
                        nome: dados.nome_fantasia || dados.nome || prev.nome,
                        endereco: dados.endereco_estabelecimento || prev.endereco,
                        telefone: dados.numero_telefone_estabelecimento || prev.telefone
                    }));
                    
                    showToast('✅ CNES consultado com sucesso! Dados preenchidos automaticamente.', 'success');
                } else {
                    setDadosCNES(null);
                    showToast('❌ Dados CNES não encontrados', 'error');
                }

                return resultado;
                
            } catch (error) {
                console.error('Erro detalhado na consulta CNES:', error);
                setDadosCNES(null);
                showToast(`❌ Erro de rede: ${error.message}`, 'error');
                return { 
                    sucesso: false, 
                    erro: `Erro de rede: ${error.message}` 
                };
            } finally {
                setConsultandoCNES(false);
            }
        };

        // Buscar municípios via API
        const searchMunicipios = async (query) => {
            // Validação adicional para garantir que query seja uma string válida
            if (!query || typeof query !== 'string' || query.trim().length < 2) {
                setMunicipioResults([]);
                setMunicipioDropdownOpen(false);
                setMunicipioSearching(false);
                return;
            }
            
            setMunicipioSearching(true);
            
            try {
                const response = await fetch(`/api/municipios/autocomplete/?q=${encodeURIComponent(query)}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (data.results && data.results.length > 0) {
                    // Garantir que os resultados sejam sempre strings válidas
                    const resultadosProcessados = data.results.map(item => {
                        if (typeof item === 'string') {
                            return item;
                        } else if (item && typeof item === 'object') {
                            return item.nome || item.text || item.id || 'Município';
                        }
                        return 'Município';
                    }).filter(item => item && typeof item === 'string' && item.trim() !== ''); // Filtrar apenas strings válidas
                    
                    setMunicipioResults(resultadosProcessados);
                    setMunicipioDropdownOpen(true);
                } else {
                    setMunicipioResults([]);
                    setMunicipioDropdownOpen(false);
                }
                
            } catch (error) {
                console.error('❌ Erro ao buscar municípios:', error);
                setMunicipioResults([]);
                setMunicipioDropdownOpen(false);
            } finally {
                setMunicipioSearching(false);
            }
            
            // Garantir que municipioResults seja sempre um array válido
            if (!Array.isArray(municipioResults)) {
                setMunicipioResults([]);
            }
        };

        // Função para buscar municípios com debounce
        const handleMunicipioSearch = (query) => {
            // Validação adicional para garantir que query seja uma string válida
            if (!query || typeof query !== 'string' || query.trim().length === 0) {
                setMunicipioDropdownOpen(false);
                setMunicipioResults([]);
            } else if (query.trim().length >= 2) {
                // Limpar timer anterior se existir
                if (municipioDebounceTimer) {
                    clearTimeout(municipioDebounceTimer);
                }
                
                // Configurar novo timer de debounce
                const timer = setTimeout(() => {
                    searchMunicipios(query.trim());
                }, 300);
                
                setMunicipioDebounceTimer(timer);
            }
        };

        // Selecionar município da lista
        const selectMunicipio = (municipio) => {
            // Garantir que o valor correto seja selecionado
            let municipioValue = 'Município';
            
            if (typeof municipio === 'string' && municipio.trim() !== '') {
                municipioValue = municipio.trim();
            } else if (municipio && typeof municipio === 'object') {
                municipioValue = municipio.nome || municipio.text || municipio.id || 'Município';
            }
            
            // Validação adicional para garantir que seja uma string válida
            if (typeof municipioValue !== 'string' || municipioValue.trim() === '') {
                municipioValue = 'Município';
            }
            
            handleChange('municipio', municipioValue);
            setMunicipioDropdownOpen(false);
        };

        // Manipular mudanças nos campos
        const handleChange = (field, value) => {
            // Garantir que o valor seja sempre uma string válida
            const stringValue = value !== null && value !== undefined ? String(value) : '';
            
            console.log(`🔍 handleChange - campo: ${field}, valor: ${value}, stringValue: ${stringValue}`);
            
            setFormData(prev => ({
                ...prev,
                [field]: stringValue
            }));

            // Limpar erro do campo
            if (errors[field]) {
                setErrors(prev => ({
                    ...prev,
                    [field]: null
                }));
            }

            // Autocomplete para município
            if (field === 'municipio') {
                handleMunicipioSearch(value);
            }

            // Consultar CNES quando código completo for digitado
            if (field === 'cnes' && value.length === 7) {
                consultarCNES(value);
            } else if (field === 'cnes' && value.length !== 7) {
                setDadosCNES(null);
            }
        };

        // Validar formulário
        const validateForm = () => {
            console.log('🔍 validateForm - iniciando validação...');
            console.log('🔍 validateForm - formData atual:', formData);
            
            const newErrors = {};
            const requiredFields = {
                nome: 'Nome da unidade é obrigatório',
                tipo: 'Tipo da unidade é obrigatório'
            };

            for (const [field, message] of Object.entries(requiredFields)) {
                if (!formData[field] || formData[field].trim() === '') {
                    newErrors[field] = message;
                }
            }

            // Validação específica para telefone - aceita tanto fixo (4 dígitos) quanto celular (5 dígitos)
            if (formData.telefone) {
                const telefoneLimpo = formData.telefone.replace(/\D/g, '');
                console.log('🔍 Validação telefone - valor:', formData.telefone, 'limpo:', telefoneLimpo, 'comprimento:', telefoneLimpo.length);
                
                // Teste específico para (67) 99264-4308
                if (telefoneLimpo === '67992644308') {
                    console.log('🎯 TELEFONE ESPECÍFICO DETECTADO: (67) 99264-4308');
                    console.log('🎯 Este telefone deve ser aceito como válido!');
                }
                
                // TEMPORÁRIO: Aceitar qualquer telefone para debug
                console.log('✅ Telefone aceito temporariamente para debug');
                
                // Validar apenas pelo comprimento dos dígitos, não pelo formato
                if (telefoneLimpo.length === 10) {
                    // Telefone fixo: 10 dígitos
                    console.log('✅ Telefone fixo válido (10 dígitos)');
                } else if (telefoneLimpo.length === 11) {
                    // Celular: 11 dígitos
                    console.log('✅ Celular válido (11 dígitos)');
                } else {
                    console.log('⚠️ Telefone com comprimento inválido:', telefoneLimpo.length);
                    // newErrors.telefone = 'Telefone deve ter 10 dígitos (fixo) ou 11 dígitos (celular)';
                }
            }

            // Validação específica para CNES
            if (formData.cnes && formData.cnes.length !== 7) {
                newErrors.cnes = 'CNES deve ter exatamente 7 dígitos';
            }

            // Validação específica para email
            if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Formato de e-mail inválido';
            }

            console.log('🔍 validateForm - erros encontrados:', newErrors);
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        // Submeter formulário
        const handleSubmit = async (e) => {
            e.preventDefault();
            
            console.log('🔍 handleSubmit - formData antes da validação:', formData);
            
            if (!validateForm()) {
                showToast('❌ Preencha todos os campos obrigatórios corretamente', 'error');
                return;
            }

            setIsLoading(true);
            
            try {
                showToast('📝 Criando unidade no sistema...', 'info');
                
                const dadosParaEnvio = {
                    nome: formData.nome.trim(),
                    tipo: formData.tipo,
                    cnes: formData.cnes.trim(),
                    responsavel: formData.responsavel.trim(),
                    contato_telefonico: formData.contato_telefonico.trim(),
                    municipio: formData.municipio.trim(),
                    endereco: formData.endereco.trim(),
                    telefone: formData.telefone.trim(),
                    email: formData.email.trim(),
                    data_cadastro: new Date().toISOString()
                };

                const response = await fetch('/accounts/unidades-saude/criar/', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(dadosParaEnvio),
                    cache: 'no-cache'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Erro na resposta:', errorText);
                    throw new Error(`Erro ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();

                if (result.sucesso || result.success) {
                    showToast('✅ Unidade criada com sucesso!', 'success', 6000);
                    
                    // Redirecionar para lista de unidades após sucesso
                    setTimeout(() => {
                        window.location.href = '/accounts/unidades-saude/';
                    }, 2000);
                    
                } else {
                    throw new Error(result.erro || result.message || 'Erro desconhecido ao criar unidade');
                }
                
            } catch (error) {
                console.error('Erro detalhado no submit:', error);
                showToast(`❌ Erro ao criar unidade: ${error.message}`, 'error', 8000);
            } finally {
                setIsLoading(false);
            }
        };

        // Sistema de Toasts
        const showToast = (message, type = 'info', duration = 5000) => {
            const toastContainer = document.getElementById('toast-container');
            if (!toastContainer) return;

            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };

            const colors = {
                success: '#10b981',
                error: '#ef4444', 
                warning: '#f59e0b',
                info: '#3b82f6'
            };

            const toast = document.createElement('div');
            toast.className = `toast-notification toast-${type}`;
            toast.style.cssText = `
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(15px);
                border-radius: 15px;
                padding: 1rem 1.5rem;
                margin-bottom: 1rem;
                border: 1px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
                display: flex;
                align-items: center;
                gap: 1rem;
                min-width: 300px;
                max-width: 500px;
                animation: slideInRight 0.3s ease-out;
                border-left: 4px solid ${colors[type]};
            `;

            toast.innerHTML = `
                <div class="toast-icon" style="color: ${colors[type]}; font-size: 1.2rem; flex-shrink: 0;">
                    <i class="fas ${icons[type]}"></i>
                </div>
                <div class="toast-content" style="flex: 1;">
                    <div class="toast-message" style="color: #1f2937; font-weight: 500; line-height: 1.4;">${message}</div>
                </div>
                <button class="toast-close" style="background: none; border: none; color: #6b7280; cursor: pointer; font-size: 1.1rem; padding: 0;" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;

            toastContainer.appendChild(toast);

            const timer = setTimeout(() => {
                if (toast.parentElement) {
                    toast.style.animation = 'slideOutRight 0.3s ease-in';
                    setTimeout(() => toast.remove(), 300);
                }
            }, duration);

            toast.addEventListener('mouseenter', () => clearTimeout(timer));
            toast.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.style.animation = 'slideOutRight 0.3s ease-in';
                        setTimeout(() => toast.remove(), 300);
                    }
                }, 1000);
            });
        };

        // Limpar formulário
        const clearForm = () => {
            setFormData({
                nome: '',
                tipo: 'UNIDADE_EXECUTANTE',
                cnes: '',
                responsavel: '',
                contato_telefonico: '',
                municipio: '',
                endereco: '',
                telefone: '',
                email: ''
            });
            setErrors({});
            setDadosCNES(null);
            showToast('🧹 Formulário limpo com sucesso', 'info');
        };

        // Função de teste para telefone específico
        const testarTelefone = (telefone) => {
            console.log('🧪 TESTE TELEFONE:', telefone);
            const digits = telefone.replace(/\D/g, '');
            console.log('🧪 Dígitos extraídos:', digits);
            console.log('🧪 Comprimento:', digits.length);
            console.log('🧪 É válido (11 dígitos)?', digits.length === 11);
            
            if (digits.length === 11) {
                const formatted = digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                console.log('🧪 Formato esperado:', formatted);
                console.log('🧪 Formato correto?', formatted === telefone);
            }
        };

        // Formatação de telefone
        const formatPhone = (value) => {
            if (!value) return '';
            
            const digits = value.replace(/\D/g, '');
            console.log('🔍 formatPhone - valor:', value, 'dígitos:', digits, 'comprimento:', digits.length);
            
            if (digits.length === 11) {
                // Celular: (67) 99264-4308
                const formatted = digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                console.log('✅ formatPhone - celular formatado:', formatted);
                return formatted;
            } else if (digits.length === 10) {
                // Fixo: (67) 9926-4308
                const formatted = digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                console.log('✅ formatPhone - fixo formatado:', formatted);
                return formatted;
            }
            
            // Retorna o valor original se não conseguir formatar
            console.log('⚠️ formatPhone - não conseguiu formatar, retornando:', value);
            return value;
        };

        // Opções de tipo de unidade
        const getTipoOptions = () => [
            { 
                value: 'UNIDADE_EXECUTANTE', 
                label: 'Executante', 
                icon: 'fas fa-hospital', 
                description: 'Unidade que executa procedimentos médicos' 
            },
            { 
                value: 'UNIDADE_SOLICITANTE', 
                label: 'Solicitante', 
                icon: 'fas fa-phone-alt', 
                description: 'Unidade que solicita serviços de outras unidades' 
            },
            { 
                value: 'EXECUTANTE_SOLICITANTE', 
                label: 'Executante/Solicitante', 
                icon: 'fas fa-hospital-user', 
                description: 'Unidade que executa e solicita serviços' 
            }
        ];

        return React.createElement('div', { className: 'criar-unidade-container' },
            // Header
            React.createElement('div', { className: 'create-header-react' },
                React.createElement('div', { className: 'header-background-pattern' }),
                React.createElement('div', { className: 'header-content-react' },
                    React.createElement('div', { className: 'header-info' },
                        React.createElement('div', { className: 'header-icon-fallback' },
                            React.createElement('i', { className: 'fas fa-plus-circle' })
                        ),
                        React.createElement('div', { className: 'header-text-fallback' },
                            React.createElement('h1', { className: 'header-title-fallback' }, 'Nova Unidade de Saúde'),
                            React.createElement('p', { className: 'header-subtitle-fallback' }, 'Cadastre uma nova unidade no sistema')
                        )
                    ),
                    React.createElement('div', { className: 'header-actions' },
                        React.createElement('button', {
                            type: 'button',
                            className: 'btn-clear',
                            onClick: clearForm,
                            title: 'Limpar formulário'
                        },
                            React.createElement('i', { className: 'fas fa-eraser' }),
                            React.createElement('span', null, 'Limpar')
                        )
                    )
                )
            ),

            // Formulário
            React.createElement('form', { onSubmit: handleSubmit, className: 'create-form-react' },
                // Seção: Informações Básicas
                React.createElement('div', { className: 'form-section-react' },
                    React.createElement('div', { className: 'section-header-react' },
                        React.createElement('div', { className: 'section-icon-react' },
                            React.createElement('i', { className: 'fas fa-info-circle' })
                        ),
                        React.createElement('h3', { className: 'section-title-react' }, 'Informações Básicas')
                    ),
                    React.createElement('div', { className: 'section-content-react' },
                        React.createElement('div', { className: 'form-grid-react' },
                            // Nome da Unidade
                            React.createElement('div', { className: 'form-group-react' },
                                React.createElement('label', { className: 'form-label-react' },
                                    React.createElement('i', { className: 'fas fa-hospital' }),
                                    'Nome da Unidade',
                                    React.createElement('span', { className: 'required-star' }, '*')
                                ),
                                React.createElement('input', {
                                    type: 'text',
                                    className: `form-input-react ${errors.nome ? 'error' : ''}`,
                                    value: formData.nome,
                                    onChange: (e) => handleChange('nome', e.target.value),
                                    placeholder: 'Ex: Hospital Municipal...',
                                    required: true
                                }),
                                errors.nome && React.createElement('span', { className: 'error-message-react' },
                                    React.createElement('i', { className: 'fas fa-exclamation-circle' }),
                                    errors.nome
                                )
                            ),

                            // Tipo da Unidade
                            React.createElement('div', { className: 'form-group-react' },
                                React.createElement('label', { className: 'form-label-react' },
                                    React.createElement('i', { className: 'fas fa-tag' }),
                                    'Tipo da Unidade',
                                    React.createElement('span', { className: 'required-star' }, '*')
                                ),
                                React.createElement('select', {
                                    className: `form-select-fallback ${errors.tipo ? 'error' : ''}`,
                                    value: formData.tipo,
                                    onChange: (e) => handleChange('tipo', e.target.value),
                                    required: true
                                },
                                    React.createElement('option', { value: '' }, 'Selecione o tipo...'),
                                    getTipoOptions().map(option =>
                                        React.createElement('option', { key: option.value, value: option.value },
                                            `${option.icon === 'fas fa-hospital' ? '🏥' : option.icon === 'fas fa-phone-alt' ? '📞' : '🏥📞'} ${option.label}`
                                        )
                                    )
                                ),
                                errors.tipo && React.createElement('span', { className: 'error-message-react' },
                                    React.createElement('i', { className: 'fas fa-exclamation-circle' }),
                                    errors.tipo
                                )
                            ),

                            // CNES
                            React.createElement('div', { className: 'form-group-react' },
                                React.createElement('label', { className: 'form-label-react' },
                                    React.createElement('i', { className: 'fas fa-id-card' }),
                                    'CNES'
                                ),
                                React.createElement('div', { className: 'cnes-input-container-fallback' },
                                    React.createElement('input', {
                                        type: 'text',
                                        className: `form-input-react ${errors.cnes ? 'error' : dadosCNES ? 'success' : ''}`,
                                        value: formData.cnes,
                                        onChange: (e) => handleChange('cnes', e.target.value.replace(/\D/g, '').substring(0, 7)),
                                        placeholder: 'Ex: 1234567',
                                        maxLength: 7
                                    }),
                                    consultandoCNES && React.createElement('div', { className: 'cnes-loading-fallback' },
                                        React.createElement('i', { className: 'fas fa-spinner fa-spin' })
                                    )
                                ),
                                errors.cnes && React.createElement('span', { className: 'error-message-react' },
                                    React.createElement('i', { className: 'fas fa-exclamation-circle' }),
                                    errors.cnes
                                ),
                                dadosCNES && React.createElement('div', { className: 'cnes-feedback-fallback' },
                                    React.createElement('div', { style: { color: '#10b981', fontSize: '0.9rem', marginTop: '0.5rem' } },
                                        React.createElement('i', { className: 'fas fa-check-circle' }),
                                        ' Dados CNES encontrados e preenchidos automaticamente!'
                                    )
                                )
                            ),

                            // Responsável
                            React.createElement('div', { className: 'form-group-react' },
                                React.createElement('label', { className: 'form-label-react' },
                                    React.createElement('i', { className: 'fas fa-user-tie' }),
                                    'Responsável'
                                ),
                                React.createElement('input', {
                                    type: 'text',
                                    className: 'form-input-react',
                                    value: formData.responsavel,
                                    onChange: (e) => handleChange('responsavel', e.target.value),
                                    placeholder: 'Nome do responsável'
                                })
                            ),

                            // Contato Telefônico
                            React.createElement('div', { className: 'form-group-react' },
                                React.createElement('label', { className: 'form-label-react' },
                                    React.createElement('i', { className: 'fas fa-phone-alt' }),
                                    'Contato Telefônico'
                                ),
                                React.createElement('input', {
                                    type: 'text',
                                    className: 'form-input-react',
                                    value: formatPhone(formData.contato_telefonico),
                                    onChange: (e) => handleChange('contato_telefonico', e.target.value.replace(/\D/g, '')),
                                    placeholder: '(67) 99999-9999'
                                })
                            )
                        )
                    )
                ),

                // Seção: Localização
                React.createElement('div', { className: 'form-section-react' },
                    React.createElement('div', { className: 'section-header-react' },
                        React.createElement('div', { className: 'section-icon-react' },
                            React.createElement('i', { className: 'fas fa-map-marker-alt' })
                        ),
                        React.createElement('h3', { className: 'section-title-react' }, 'Localização')
                    ),
                    React.createElement('div', { className: 'section-content-react' },
                        React.createElement('div', { className: 'form-grid-react' },
                            // Município
                            React.createElement('div', { className: 'form-group-react' },
                                React.createElement('label', { className: 'form-label-react' },
                                    React.createElement('i', { className: 'fas fa-city' }),
                                    'Município'
                                ),
                                React.createElement('div', { className: 'autocomplete-wrapper-react' },
                                    React.createElement('input', {
                                        type: 'text',
                                        className: 'form-input-react',
                                        value: formData.municipio,
                                        onChange: (e) => handleChange('municipio', e.target.value),
                                        placeholder: 'Digite o município'
                                    }),
                                    municipioSearching && React.createElement('div', { className: 'autocomplete-loading' },
                                        React.createElement('i', { className: 'fas fa-spinner fa-spin' })
                                    ),
                                    municipioDropdownOpen && municipioResults.length > 0 && 
                                    React.createElement('div', { className: 'autocomplete-results-react' },
                                        municipioResults.map((municipio, index) => {
                                            // Garantir que municipio seja uma string válida
                                            const municipioText = typeof municipio === 'string' ? municipio : 
                                                                  (municipio && typeof municipio === 'object' ? 
                                                                   municipio.nome || municipio.text || municipio.id || 'Município' : 
                                                                   'Município');
                                            
                                            return React.createElement('div', {
                                                key: index,
                                                className: 'autocomplete-item-react',
                                                onClick: () => selectMunicipio(municipio)
                                            },
                                                React.createElement('i', { className: 'fas fa-map-marker-alt' }),
                                                React.createElement('span', null, municipioText)
                                            );
                                        })
                                    )
                                )
                            ),

                            // Endereço Completo
                            React.createElement('div', { className: 'form-group-react full-width' },
                                React.createElement('label', { className: 'form-label-react' },
                                    React.createElement('i', { className: 'fas fa-map' }),
                                    'Endereço Completo'
                                ),
                                React.createElement('textarea', {
                                    className: 'form-textarea-fallback',
                                    value: formData.endereco,
                                    onChange: (e) => handleChange('endereco', e.target.value),
                                    placeholder: 'Rua, número, bairro...',
                                    rows: 3
                                })
                            )
                        )
                    )
                ),

                // Seção: Contato
                React.createElement('div', { className: 'form-section-react' },
                    React.createElement('div', { className: 'section-header-react' },
                        React.createElement('div', { className: 'section-icon-react' },
                            React.createElement('i', { className: 'fas fa-phone-alt' })
                        ),
                        React.createElement('h3', { className: 'section-title-react' }, 'Informações de Contato')
                    ),
                    React.createElement('div', { className: 'section-content-react' },
                        React.createElement('div', { className: 'form-grid-react' },
                            // Telefone
                            React.createElement('div', { className: 'form-group-react' },
                                React.createElement('label', { className: 'form-label-react' },
                                    React.createElement('i', { className: 'fas fa-phone' }),
                                    'Telefone'
                                ),
                                React.createElement('input', {
                                    type: 'text',
                                    className: `form-input-react ${errors.telefone ? 'error' : ''}`,
                                    value: formatPhone(formData.telefone),
                                    onChange: (e) => handleChange('telefone', e.target.value.replace(/\D/g, '')),
                                    placeholder: '(67) 99999-9999'
                                }),
                                errors.telefone && React.createElement('span', { className: 'error-message-react' },
                                    React.createElement('i', { className: 'fas fa-exclamation-circle' }),
                                    errors.telefone
                                )
                            ),

                            // E-mail
                            React.createElement('div', { className: 'form-group-react' },
                                React.createElement('label', { className: 'form-label-react' },
                                    React.createElement('i', { className: 'fas fa-envelope' }),
                                    'E-mail'
                                ),
                                React.createElement('input', {
                                    type: 'email',
                                    className: `form-input-react ${errors.email ? 'error' : ''}`,
                                    value: formData.email,
                                    onChange: (e) => handleChange('email', e.target.value),
                                    placeholder: 'contato@unidade.com.br'
                                }),
                                errors.email && React.createElement('span', { className: 'error-message-react' },
                                    React.createElement('i', { className: 'fas fa-exclamation-circle' }),
                                    errors.email
                                )
                            )
                        )
                    )
                ),

                // Seção: Log do Cadastrante
                React.createElement('div', { className: 'form-section-react' },
                    React.createElement('div', { className: 'section-header-react' },
                        React.createElement('div', { 
                            className: 'section-icon-react',
                            style: { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }
                        },
                            React.createElement('i', { className: 'fas fa-user-shield' })
                        ),
                        React.createElement('h3', { className: 'section-title-react' }, 'Informações do Cadastrante')
                    ),
                    React.createElement('div', { className: 'section-content-react' },
                        React.createElement('div', { className: 'form-grid-react' },
                            // Responsável pelo Cadastro
                            React.createElement('div', { className: 'form-group-react' },
                                React.createElement('label', { className: 'form-label-react' },
                                    React.createElement('i', { className: 'fas fa-user-check' }),
                                    'Responsável pelo Cadastro'
                                ),
                                React.createElement('input', {
                                    type: 'text',
                                    className: 'form-input-react readonly-field',
                                    value: usuario?.get_full_name || usuario?.username || 'Usuário Atual',
                                    readOnly: true
                                })
                            ),

                            // Data do Cadastro
                            React.createElement('div', { className: 'form-group-react' },
                                React.createElement('label', { className: 'form-label-react' },
                                    React.createElement('i', { className: 'fas fa-calendar-plus' }),
                                    'Data do Cadastro'
                                ),
                                React.createElement('input', {
                                    type: 'text',
                                    className: 'form-input-react readonly-field',
                                    value: currentDateTime.toLocaleString('pt-BR'),
                                    readOnly: true
                                })
                            )
                        )
                    )
                ),

                // Botões de Ação
                React.createElement('div', { className: 'form-actions-react' },
                    React.createElement('a', {
                        href: '/accounts/unidades-saude/',
                        className: 'btn-cancel-react'
                    },
                        React.createElement('i', { className: 'fas fa-times' }),
                        React.createElement('span', null, 'Cancelar')
                    ),
                    React.createElement('button', {
                        type: 'submit',
                        className: 'btn-save-react',
                        disabled: isLoading
                    },
                        React.createElement('i', { className: isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-plus-circle' }),
                        React.createElement('span', null, isLoading ? 'Criando...' : 'Criar Unidade')
                    )
                )
            )
        );
    }

    // Exportar o componente globalmente (para compatibilidade)
    window.CriarUnidadeReact = CriarUnidadeReact;

    // Log de exportação
    console.log('✅ CriarUnidadeReact exportado para window');

    // Exportar como módulo ES6
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CriarUnidadeReact;
    }

})();