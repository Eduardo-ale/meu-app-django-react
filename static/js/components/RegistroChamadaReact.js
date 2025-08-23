// Componente React para Registro de Chamadas - Versão Melhorada
(function() {
    'use strict';

    function RegistroChamadaReact(props) {
        const { usuario, dataAtual, csrfToken } = props;
        
        // Estados do formulário
        const [formData, setFormData] = React.useState({
            nome: '',
            telefone: '',
            funcao: '',
            setor: '',
            tipo_chamada: '',
            status: '',
            descricao: '',
            unidade: '',
            municipio: '',
            cnes: '',
            contato_telefonico_cnes: '',
            nome_atendente: '',
            solucao: ''
        });

        const [isLoading, setIsLoading] = React.useState(false);
        const [errors, setErrors] = React.useState({});
        const [municipioSugestoes, setMunicipioSugestoes] = React.useState([]);
        const [showMunicipioDropdown, setShowMunicipioDropdown] = React.useState(false);
        const [currentDateTime, setCurrentDateTime] = React.useState(new Date());
        const [progress, setProgress] = React.useState({ percent: 0, filled: 0, total: 13 });
        const [unidadeVerificada, setUnidadeVerificada] = React.useState(null);
        const [verificandoUnidade, setVerificandoUnidade] = React.useState(false);
        const [dadosCNES, setDadosCNES] = React.useState(null);
        const [consultandoCNES, setConsultandoCNES] = React.useState(false);

        // Estados adicionais para modal CNES
        const [modalCNESAberto, setModalCNESAberto] = React.useState(false);
        
        // Estados para autocomplete de municípios
        const [municipioSearching, setMunicipioSearching] = React.useState(false);
        const [municipioResults, setMunicipioResults] = React.useState([]);
        const [municipioDropdownOpen, setMunicipioDropdownOpen] = React.useState(false);
        const [municipioDebounceTimer, setMunicipioDebounceTimer] = React.useState(null);
        const [municipioHelpText, setMunicipioHelpText] = React.useState('⚡ Digite 2+ caracteres • 🔄 Busca inteligente • 📊 Máx. 10 resultados');

        // Atualizar data/hora a cada segundo
        React.useEffect(() => {
            const timer = setInterval(() => {
                setCurrentDateTime(new Date());
            }, 1000);
            return () => clearInterval(timer);
        }, []);

        // Calcular progresso do formulário
        React.useEffect(() => {
            const requiredFields = [
                'nome', 'telefone', 'tipo_chamada', 'status', 'descricao',
                'unidade', 'municipio', 'nome_atendente'
            ];
            
            const filledFields = requiredFields.filter(field => 
                formData[field] && formData[field].trim() !== ''
            ).length;
            
            const percent = Math.round((filledFields / requiredFields.length) * 100);
            
            setProgress({
                percent,
                filled: filledFields,
                total: requiredFields.length
            });
        }, [formData]);

        // Limpar timer de debounce do município ao desmontar
        React.useEffect(() => {
            return () => {
                if (municipioDebounceTimer) {
                    clearTimeout(municipioDebounceTimer);
                }
            };
        }, [municipioDebounceTimer]);

        // Monitorar estados do dropdown de municípios
        React.useEffect(() => {
            console.log('🔄 Estado do dropdown mudou:', {
                dropdownOpen: municipioDropdownOpen,
                resultsCount: municipioResults.length,
                results: municipioResults
            });
        }, [municipioDropdownOpen, municipioResults]);

        // Fechar modal com tecla ESC
        React.useEffect(() => {
            const handleEsc = (event) => {
                if (event.keyCode === 27 && modalCNESAberto) {
                    fecharModalCNES();
                }
            };
            
            if (modalCNESAberto) {
                document.addEventListener('keydown', handleEsc);
                // Impedir scroll do body quando modal está aberto
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
            
            return () => {
                document.removeEventListener('keydown', handleEsc);
                document.body.style.overflow = 'auto';
            };
        }, [modalCNESAberto]);

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
            
            return csrfToken; // Usar o token passado via props
        };

        // Verificar unidade no sistema (EXATAMENTE como na página original)
        const verificarUnidade = async (nomeUnidade) => {
            if (!nomeUnidade || nomeUnidade.trim() === '') {
                setUnidadeVerificada(null);
                return { sucesso: false, erro: 'Nome da unidade não pode estar vazio' };
            }

            setVerificandoUnidade(true);
            
            try {
                showToast('Verificando se a unidade está cadastrada no sistema...', 'info');
                
                const response = await fetch('/accounts/api/unidade-saude/', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({
                        nome_unidade: nomeUnidade.trim()
                    }),
                    cache: 'no-cache'
                });

                console.log('Status da resposta:', response.status);

                if (!response.ok) {
                    if (response.status === 404) {
                        try {
                            const errorData = await response.json();
                            console.warn('📋 Unidade não encontrada:', errorData);
                            
                            setUnidadeVerificada({
                                encontrada: false,
                                dados: null,
                                unidadesDisponiveis: errorData.todas_unidades || [],
                                unidadesSimilares: errorData.unidades_similares || []
                            });
                            
                            return { 
                                sucesso: false, 
                                erro: errorData.erro || 'Unidade não encontrada',
                                naoEncontrada: true,
                                unidadesDisponiveis: errorData.todas_unidades || [],
                                unidadesSimilares: errorData.unidades_similares || []
                            };
                        } catch (e) {
                            setUnidadeVerificada({
                                encontrada: false,
                                dados: null
                            });
                            return { 
                                sucesso: false, 
                                erro: 'Unidade não encontrada',
                                naoEncontrada: true 
                            };
                        }
                    }
                    
                    const errorText = await response.text();
                    console.error('Erro na resposta:', errorText);
                    setUnidadeVerificada({
                        encontrada: false,
                        dados: null
                    });
                    return { 
                        sucesso: false, 
                        erro: `Erro ${response.status}: ${response.statusText}` 
                    };
                }

                const resultado = await response.json();
                console.log('Resultado da consulta:', resultado);

                if (resultado.sucesso && resultado.unidade) {
                    setUnidadeVerificada({
                        encontrada: true,
                        dados: resultado.unidade
                    });
                    
                    // Preencher automaticamente os campos (como na página original)
                    setFormData(prev => ({
                        ...prev,
                        municipio: resultado.unidade.municipio || prev.municipio,
                        cnes: resultado.unidade.cnes || prev.cnes,
                        contato_telefonico_cnes: resultado.unidade.telefone || prev.contato_telefonico_cnes
                    }));

                    showToast(`✅ Unidade "${resultado.unidade.nome}" encontrada no sistema!`, 'success');
                    
                    return {
                        sucesso: true,
                        unidade: resultado.unidade
                    };
                } else {
                    setUnidadeVerificada({
                        encontrada: false,
                        dados: null,
                        unidadesDisponiveis: resultado.todas_unidades || [],
                        unidadesSimilares: resultado.unidades_similares || []
                    });
                    
                    showToast('❌ Unidade não encontrada no sistema', 'error');
                    
                    return {
                        sucesso: false,
                        erro: resultado.erro || 'Unidade não encontrada no sistema',
                        naoEncontrada: true,
                        unidadesDisponiveis: resultado.todas_unidades || [],
                        unidadesSimilares: resultado.unidades_similares || []
                    };
                }
                
            } catch (error) {
                console.error('Erro detalhado na consulta da unidade:', error);
                setUnidadeVerificada({
                    encontrada: false,
                    dados: null
                });
                showToast(`Erro de rede: ${error.message}`, 'error');
                return { 
                    sucesso: false, 
                    erro: `Erro de rede: ${error.message}` 
                };
            } finally {
                setVerificandoUnidade(false);
            }
        };

        // Consultar API CNES (EXATAMENTE como na página original)
        const consultarCNES = async (codigoCNES) => {
            // Limpar completamente o código CNES
            let cnesLimpo = String(codigoCNES).replace(/[^0-9]/g, '');
            
            // Validar se tem exatamente 7 dígitos
            if (cnesLimpo.length !== 7) {
                console.warn('CNES inválido - deve ter 7 dígitos:', cnesLimpo);
                setDadosCNES(null);
                return { sucesso: false, erro: 'Código CNES deve ter exatamente 7 dígitos' };
            }

            // Construir URL de forma segura
            const baseUrl = window.location.origin;
            const apiPath = '/accounts/api/cnes/';
            const fullUrl = `${baseUrl}${apiPath}${cnesLimpo}/`;
            
            console.log('=== DEBUG CONSULTA CNES ===');
            console.log('Código original:', codigoCNES);
            console.log('Código limpo:', cnesLimpo);
            console.log('URL completa:', fullUrl);
            console.log('=========================');

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

                console.log('Status da resposta:', response.status);
                console.log('URL da requisição:', response.url);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Erro na resposta:', errorText);
                    
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
                console.log('Resultado da consulta CNES:', resultado);

                if (resultado.sucesso || resultado.success) {
                    // Armazenar dados CNES
                    window.ultimosDadosCNES = resultado.dados || resultado.data;
                    setDadosCNES(resultado.dados || resultado.data);
                    
                    // ABRIR MODAL CNES (como na página original)
                    setModalCNESAberto(true);
                    
                    showToast('✅ CNES consultado com sucesso! Modal aberto com detalhes.', 'success');
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

        // Manipular mudanças nos campos
        const handleChange = (field, value) => {
            setFormData(prev => ({
                ...prev,
                [field]: value
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

            // Verificar unidade quando nome mudar
            if (field === 'unidade') {
                verificarUnidade(value);
            }

            // Consultar CNES quando código completo for digitado
            if (field === 'cnes' && value.length === 7) {
                consultarCNES(value);
            } else if (field === 'cnes' && value.length !== 7) {
                setDadosCNES(null);
            }
        };

        // Função para buscar municípios via API com debounce
        const handleMunicipioSearch = (query) => {
            // Atualizar help text baseado no comprimento da query
            if (query.length === 0) {
                setMunicipioHelpText('⚡ Digite 2+ caracteres • 🔄 Busca inteligente • 📊 Máx. 10 resultados');
                setMunicipioDropdownOpen(false);
                setMunicipioResults([]);
            } else if (query.length === 1) {
                setMunicipioHelpText('⚡ Digite mais 1 caractere para iniciar a busca...');
                setMunicipioDropdownOpen(false);
            } else {
                setMunicipioHelpText('🔄 Buscando municípios do MS...');
                
                // Limpar timer anterior se existir
                if (municipioDebounceTimer) {
                    clearTimeout(municipioDebounceTimer);
                }
                
                // Configurar novo timer de debounce
                const timer = setTimeout(() => {
                    searchMunicipios(query);
                }, 300);
                
                setMunicipioDebounceTimer(timer);
            }
        };

        // Buscar municípios via API
        const searchMunicipios = async (query) => {
            console.log('🔍 Buscando municípios para:', query);
            setMunicipioSearching(true);
            
            try {
                const response = await fetch(`/api/municipios/autocomplete/?q=${encodeURIComponent(query)}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                console.log('📊 Resultados da API:', data);
                console.log('📋 Municípios encontrados:', data.results);
                console.log('📋 Número de resultados:', data.results?.length || 0);
                
                if (data.results && data.results.length > 0) {
                    setMunicipioResults(data.results);
                    setMunicipioDropdownOpen(true);
                    setMunicipioHelpText(`✅ ${data.results.length} município(s) encontrado(s)`);
                    console.log('✅ Dropdown aberto com', data.results.length, 'resultados');
                } else {
                    setMunicipioResults([]);
                    setMunicipioDropdownOpen(false);
                    setMunicipioHelpText('❌ Nenhum município encontrado no MS');
                    console.log('❌ Nenhum resultado encontrado');
                }
                
            } catch (error) {
                console.error('❌ Erro ao buscar municípios:', error);
                setMunicipioResults([]);
                setMunicipioDropdownOpen(false);
                setMunicipioHelpText('❌ Erro na busca. Tente novamente.');
            } finally {
                setMunicipioSearching(false);
            }
        };

        // Selecionar município da lista
        const selectMunicipio = (municipio) => {
            handleChange('municipio', municipio);
            setMunicipioDropdownOpen(false);
            setMunicipioHelpText(`✅ Município selecionado: ${municipio}`);
        };

        // Validar formulário
        const validateForm = () => {
            const newErrors = {};
            const requiredFields = {
                nome: 'Nome do solicitante é obrigatório',
                telefone: 'Telefone é obrigatório',
                tipo_chamada: 'Tipo de chamada é obrigatório',
                status: 'Status é obrigatório',
                descricao: 'Descrição é obrigatória',
                unidade: 'Nome da unidade é obrigatório',
                municipio: 'Município é obrigatório',
                nome_atendente: 'Nome do atendente é obrigatório'
            };

            for (const [field, message] of Object.entries(requiredFields)) {
                if (!formData[field] || formData[field].trim() === '') {
                    newErrors[field] = message;
                }
            }

            // Validação específica para telefone
            if (formData.telefone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
                newErrors.telefone = 'Formato de telefone inválido. Use: (XX) XXXXX-XXXX';
            }

            // Validação específica para CNES
            if (formData.cnes && formData.cnes.length !== 7) {
                newErrors.cnes = 'CNES deve ter exatamente 7 dígitos';
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        // Submeter formulário (EXATAMENTE como na página original)
        const handleSubmit = async (e) => {
            e.preventDefault();
            
            console.log('=== INÍCIO DO SUBMIT ===');
            console.log('Dados do formulário:', formData);
            console.log('========================');
            
            if (!validateForm()) {
                showToast('❌ Preencha todos os campos obrigatórios corretamente', 'error');
                return;
            }

            setIsLoading(true);
            
            try {
                showToast('📝 Registrando chamada no sistema...', 'info');
                
                // Preparar dados exatamente como na página original
                const dadosParaEnvio = {
                    // Dados do Solicitante
                    nome: formData.nome.trim(),
                    telefone: formData.telefone.trim(),
                    funcao: formData.funcao.trim(),
                    setor: formData.setor.trim(),
                    
                    // Dados da Unidade
                    unidade: formData.unidade.trim(),
                    municipio: formData.municipio.trim(),
                    cnes: formData.cnes.trim(),
                    contato_telefonico_cnes: formData.contato_telefonico_cnes.trim(),
                    
                    // Dados da Chamada
                    tipo_chamada: formData.tipo_chamada,
                    status: formData.status,
                    nome_atendente: formData.nome_atendente.trim(),
                    descricao: formData.descricao.trim(),
                    solucao: formData.solucao.trim(),
                    
                    // Metadados
                    data_registro: new Date().toISOString()
                };
                
                console.log('Dados preparados para envio:', dadosParaEnvio);

                const response = await fetch('/accounts/registro-chamada/', {
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

                console.log('Status da resposta:', response.status);
                console.log('Headers da resposta:', response.headers);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Erro na resposta:', errorText);
                    throw new Error(`Erro ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                console.log('Resultado:', result);

                if (result.sucesso || result.success) {
                    // Success feedback
                    showToast('✅ Chamada registrada com sucesso no sistema!', 'success', 6000);
                    
                    // Limpar formulário
                    setFormData({
                        nome: '',
                        telefone: '',
                        funcao: '',
                        setor: '',
                        tipo_chamada: '',
                        status: '',
                        descricao: '',
                        unidade: '',
                        municipio: '',
                        cnes: '',
                        contato_telefonico_cnes: '',
                        nome_atendente: '',
                        solucao: ''
                    });
                    
                    // Limpar verificações
                    setUnidadeVerificada(null);
                    setDadosCNES(null);
                    setErrors({});
                    
                    // Scroll para o topo
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    
                    console.log('✅ Formulário limpo e resetado com sucesso');
                    
                } else {
                    throw new Error(result.erro || result.message || 'Erro desconhecido ao registrar chamada');
                }
                
            } catch (error) {
                console.error('Erro detalhado no submit:', error);
                showToast(`❌ Erro ao registrar chamada: ${error.message}`, 'error', 8000);
            } finally {
                setIsLoading(false);
                console.log('=== FIM DO SUBMIT ===');
            }
        };

        // Sistema de Toasts (EXATAMENTE como na página original)
        const showToast = (message, type = 'info', duration = 5000) => {
            const toastContainer = document.getElementById('toast-container');
            if (!toastContainer) return;

            // Definir ícones por tipo
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };

            // Definir cores por tipo
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

            // Remover após duração especificada
            const timer = setTimeout(() => {
                if (toast.parentElement) {
                    toast.style.animation = 'slideOutRight 0.3s ease-in';
                    setTimeout(() => toast.remove(), 300);
                }
            }, duration);

            // Pausar timer ao hover
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

        // Sistema de Toast Manager (como na página original)
        window.ToastManager = {
            success: (message, duration = 4000) => showToast(message, 'success', duration),
            error: (message, duration = 6000) => showToast(message, 'error', duration),
            warning: (message, duration = 5000) => showToast(message, 'warning', duration),
            info: (message, duration = 3000) => showToast(message, 'info', duration)
        };

        // Fechar modal CNES
        const fecharModalCNES = () => {
            setModalCNESAberto(false);
        };

        // Preencher formulário com dados do CNES (EXATAMENTE como na página original)
        const preencherComDadosCNES = () => {
            if (!dadosCNES) return;

            try {
                const nomeUnidade = dadosCNES.nome_fantasia || dadosCNES.nome || '';
                const telefoneUnidade = dadosCNES.numero_telefone_estabelecimento || '';
                const municipioUnidade = dadosCNES.descricao_municipio || dadosCNES.municipio || '';

                // Preencher campos do formulário
                setFormData(prev => ({
                    ...prev,
                    unidade: nomeUnidade,
                    municipio: municipioUnidade,
                    contato_telefonico_cnes: telefoneUnidade
                }));

                // Fechar modal
                setModalCNESAberto(false);

                // Feedback visual
                showToast(`✅ Dados preenchidos automaticamente! Nome: "${nomeUnidade}", Telefone: "${telefoneUnidade}"`, 'success', 6000);

                // Auto-verificar unidade se preenchida
                if (nomeUnidade.trim() !== '') {
                    setTimeout(() => {
                        verificarUnidade(nomeUnidade);
                    }, 1000);
                }

            } catch (error) {
                console.error('Erro ao preencher dados do CNES:', error);
                showToast('❌ Erro ao preencher dados automaticamente', 'error');
            }
        };

        // Redirecionar para cadastro de unidade com dados do CNES
        const redirecionarParaCadastroUnidade = () => {
            if (!dadosCNES) {
                showToast('❌ Nenhum dado do CNES disponível para pré-preenchimento', 'error');
                return;
            }

            try {
                // Construir URL com parâmetros dos dados do CNES
                const params = new URLSearchParams();
                
                // Nome da unidade
                const nomeUnidade = dadosCNES.nome_fantasia || dadosCNES.nome_razao_social || dadosCNES.nome || '';
                if (nomeUnidade) params.set('nome', nomeUnidade);
                
                // CNES
                const codigoCNES = dadosCNES.codigo_cnes || dadosCNES.codigo || '';
                if (codigoCNES) params.set('cnes', codigoCNES);
                
                // Município
                const municipio = dadosCNES.descricao_municipio || dadosCNES.municipio || '';
                if (municipio) params.set('municipio', municipio);
                
                // Telefone
                const telefone = dadosCNES.numero_telefone_estabelecimento || dadosCNES.telefone || '';
                if (telefone) params.set('contato_telefonico', telefone);
                
                // Endereço
                const endereco = dadosCNES.endereco_estabelecimento || dadosCNES.endereco || '';
                if (endereco) params.set('endereco', endereco);

                // Construir URL completa
                const baseUrl = window.location.origin;
                const createUrl = `${baseUrl}/accounts/unidades-saude/criar/?${params.toString()}`;
                
                console.log('🔄 Redirecionando para cadastro de unidade com dados:', {
                    nome: nomeUnidade,
                    cnes: codigoCNES,
                    municipio: municipio,
                    telefone: telefone,
                    endereco: endereco,
                    url: createUrl
                });

                // Redirecionar
                window.location.href = createUrl;

            } catch (error) {
                console.error('Erro ao redirecionar para cadastro:', error);
                showToast('❌ Erro ao redirecionar para cadastro de unidade', 'error');
            }
        };

        // Formatar data e hora
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

        // Mascarar telefone
        const maskTelefone = (value) => {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length <= 10) {
                return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            } else {
                return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            }
        };

        // Mascarar CNES
        const maskCNES = (value) => {
            return value.replace(/\D/g, '').slice(0, 7);
        };

        // Função para limpar o formulário
        const limparFormulario = () => {
            setFormData({
                nome: '',
                telefone: '',
                funcao: '',
                setor: '',
                tipo_chamada: '',
                status: '',
                descricao: '',
                unidade: '',
                municipio: '',
                cnes: '',
                contato_telefonico_cnes: '',
                nome_atendente: '',
                solucao: ''
            });
            setUnidadeVerificada(null);
            setDadosCNES(null);
            setErrors({});
            showToast('Formulário limpo com sucesso!', 'success');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        return React.createElement('div', { className: 'main-container' },
            React.createElement('div', { className: 'content-wrapper' },
                // Breadcrumb
                React.createElement('div', { className: 'modern-breadcrumb' },
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
                            href: '/accounts/unidades-saude/', 
                            className: 'breadcrumb-link' 
                        },
                            React.createElement('i', { className: 'fas fa-hospital-alt' }),
                            React.createElement('span', null, 'Unidades de Saúde')
                        ),
                        React.createElement('div', { className: 'breadcrumb-arrow' },
                            React.createElement('i', { className: 'fas fa-chevron-right' })
                        ),
                        React.createElement('span', { className: 'breadcrumb-current' },
                            React.createElement('i', { className: 'fas fa-phone-alt' }),
                            React.createElement('span', null, 'Registro de Chamada')
                        )
                    )
                ),

                // Header da página
                React.createElement('div', { className: 'page-header' },
                    React.createElement('div', { className: 'header-content' },
                        React.createElement('div', { className: 'header-main' },
                            React.createElement('div', { className: 'header-icon' },
                                React.createElement('i', { className: 'fas fa-phone-alt' })
                            ),
                            React.createElement('div', { className: 'header-text' },
                                React.createElement('h1', null, 'Registro de Chamada'),
                                React.createElement('p', { className: 'header-subtitle' }, 
                                    'Sistema de controle e acompanhamento de chamadas médicas'
                                )
                            )
                        ),
                        React.createElement('div', { className: 'header-status' },
                            React.createElement('div', { className: 'status-badge' },
                                React.createElement('i', { className: 'fas fa-circle' }),
                                React.createElement('span', null, 'Sistema Online')
                            )
                        )
                    )
                ),

                // Indicador de progresso
                React.createElement('div', { className: 'progress-container' },
                    React.createElement('div', { className: 'progress-circle' },
                        React.createElement('svg', { 
                            className: 'progress-ring', 
                            width: '120', 
                            height: '120' 
                        },
                            React.createElement('circle', {
                                className: 'progress-ring-bg',
                                cx: '60',
                                cy: '60',
                                r: '50'
                            }),
                            React.createElement('circle', {
                                className: 'progress-ring-fill',
                                cx: '60',
                                cy: '60',
                                r: '50',
                                style: {
                                    strokeDashoffset: 314 - (314 * progress.percent / 100)
                                }
                            })
                        ),
                        React.createElement('div', { className: 'progress-text' }, 
                            `${progress.percent}%`
                        )
                    ),
                    React.createElement('div', { className: 'progress-label' },
                        `Progresso do Formulário (${progress.filled}/${progress.total} campos obrigatórios)`
                    )
                ),

                // Data e hora
                React.createElement('div', { className: 'datetime-section' },
                    React.createElement('div', { className: 'datetime-label' },
                        React.createElement('i', { className: 'far fa-clock' }),
                        React.createElement('span', null, 'Data e Hora do Registro')
                    ),
                    React.createElement('div', { className: 'datetime-value' },
                        formatDateTime(currentDateTime)
                    )
                ),

                // Seção Informações do Cadastrante (IGUAL À PÁGINA ORIGINAL)
                React.createElement('div', { className: 'cadastrante-section' },
                    React.createElement('div', { className: 'cadastrante-header' },
                        React.createElement('div', { className: 'cadastrante-icon' },
                            React.createElement('i', { className: 'fas fa-user-tie' })
                        ),
                        React.createElement('div', null,
                            React.createElement('h3', { className: 'cadastrante-title' }, 
                                'Informações do Cadastrante'
                            ),
                            React.createElement('p', { className: 'cadastrante-subtitle' }, 
                                'Dados sobre quem está realizando este cadastro'
                            )
                        )
                    ),
                    React.createElement('div', { className: 'cadastrante-content' },
                        React.createElement('div', { className: 'cadastrante-grid' },
                            // Responsável pelo Cadastro
                            React.createElement('div', { className: 'cadastrante-item' },
                                React.createElement('div', { className: 'cadastrante-label' },
                                    React.createElement('i', { className: 'fas fa-user' }),
                                    'Responsável pelo Cadastro'
                                ),
                                React.createElement('div', { className: 'cadastrante-value' },
                                    React.createElement('i', { className: 'fas fa-user-circle' }),
                                    usuario.first_name || usuario.username || 'Usuário'
                                ),
                                React.createElement('div', { className: 'cadastrante-hint' },
                                    React.createElement('i', { className: 'fas fa-info-circle' }),
                                    'Usuário logado responsável por este registro'
                                )
                            ),

                            // Data do Cadastro
                            React.createElement('div', { className: 'cadastrante-item' },
                                React.createElement('div', { className: 'cadastrante-label' },
                                    React.createElement('i', { className: 'fas fa-calendar-alt' }),
                                    'Data do Cadastro'
                                ),
                                React.createElement('div', { className: 'cadastrante-value' },
                                    React.createElement('i', { className: 'fas fa-clock' }),
                                    new Date().toLocaleString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })
                                ),
                                React.createElement('div', { className: 'cadastrante-hint' },
                                    React.createElement('i', { className: 'fas fa-info-circle' }),
                                    'Data e hora atual do sistema'
                                )
                            )
                        )
                    )
                ),

                // Seção de Verificação de Unidade
                React.createElement('div', { className: 'form-section verification-section' },
                    React.createElement('div', { className: 'section-header' },
                        React.createElement('div', { className: 'section-icon' },
                            React.createElement('i', { className: 'fas fa-hospital-alt' })
                        ),
                        React.createElement('div', null,
                            React.createElement('h3', { className: 'section-title' }, 
                                'Unidade de Saúde'
                            ),
                            React.createElement('p', { className: 'section-subtitle' }, 
                                'Identificação e verificação da unidade'
                            )
                        )
                    ),
                    React.createElement('div', { className: 'section-content' },
                        React.createElement('div', { className: 'field-group' },
                            React.createElement('label', { className: 'field-label' },
                                React.createElement('i', { className: 'fas fa-hospital' }),
                                'Nome da Unidade de Saúde',
                                React.createElement('span', { className: 'required-star' }, '*')
                            ),
                            React.createElement('div', { className: 'verification-input-group' },
                                React.createElement('input', {
                                    type: 'text',
                                    className: `form-control verification-input ${errors.unidade ? 'is-invalid' : ''}`,
                                    value: formData.unidade,
                                    onChange: (e) => handleChange('unidade', e.target.value),
                                    placeholder: 'HOSPITAL JULIO MAIA'
                                }),
                                React.createElement('button', {
                                    type: 'button',
                                    className: 'btn btn-verify',
                                    disabled: verificandoUnidade || !formData.unidade || formData.unidade.length < 3,
                                    onClick: () => verificarUnidade(formData.unidade)
                                },
                                    verificandoUnidade ? 
                                        React.createElement('i', { className: 'fas fa-spinner fa-spin' }) :
                                        React.createElement('i', { className: 'fas fa-search' }),
                                    ' VERIFICAR'
                                )
                            ),
                            errors.unidade && React.createElement('div', { 
                                className: 'field-hint',
                                style: { color: '#ef4444' }
                            }, errors.unidade),
                            React.createElement('div', { className: 'field-hint' },
                                React.createElement('i', { className: 'fas fa-info-circle' }),
                                'Digite o nome da unidade e clique em verificar'
                            )
                        ),

                        // Resultado da verificação
                        unidadeVerificada && React.createElement('div', { 
                            className: `verification-result ${unidadeVerificada.encontrada ? 'success' : 'not-found'}` 
                        },
                            unidadeVerificada.encontrada ? (
                                React.createElement('div', null,
                                    React.createElement('div', { className: 'verification-header' },
                                        React.createElement('div', { className: 'verification-status' },
                                            React.createElement('i', { className: 'fas fa-check-circle' }),
                                            React.createElement('span', null, 'Unidade Cadastrada'),
                                            React.createElement('span', { className: 'status-badge-active' }, 'Ativa')
                                        )
                                    ),
                                    React.createElement('div', { className: 'unidade-card' },
                                        React.createElement('div', { className: 'unidade-title' },
                                            React.createElement('i', { className: 'fas fa-hospital' }),
                                            React.createElement('span', null, unidadeVerificada.dados.nome)
                                        ),
                                        React.createElement('div', { className: 'unidade-dados-grid' },
                                            React.createElement('div', { className: 'unidade-dado-item' },
                                                React.createElement('div', { className: 'unidade-dado-label' },
                                                    React.createElement('i', { className: 'fas fa-map-marker-alt' }),
                                                    'MUNICÍPIO'
                                                ),
                                                React.createElement('div', { className: 'unidade-dado-value' },
                                                    unidadeVerificada.dados.municipio
                                                )
                                            ),
                                            React.createElement('div', { className: 'unidade-dado-item' },
                                                React.createElement('div', { className: 'unidade-dado-label' },
                                                    React.createElement('i', { className: 'fas fa-phone' }),
                                                    'TELEFONE'
                                                ),
                                                React.createElement('div', { className: 'unidade-dado-value' },
                                                    unidadeVerificada.dados.telefone || 'Não informado'
                                                )
                                            ),
                                            React.createElement('div', { className: 'unidade-dado-item' },
                                                React.createElement('div', { className: 'unidade-dado-label' },
                                                    React.createElement('i', { className: 'fas fa-user' }),
                                                    'RESPONSÁVEL'
                                                ),
                                                React.createElement('div', { className: 'unidade-dado-value' },
                                                    unidadeVerificada.dados.responsavel || 'Não informado'
                                                )
                                            ),
                                            React.createElement('div', { className: 'unidade-dado-item' },
                                                React.createElement('div', { className: 'unidade-dado-label' },
                                                    React.createElement('i', { className: 'fas fa-home' }),
                                                    'ENDEREÇO'
                                                ),
                                                React.createElement('div', { className: 'unidade-dado-value' },
                                                    unidadeVerificada.dados.endereco || 'Não informado'
                                                )
                                            ),
                                            React.createElement('div', { className: 'unidade-dado-item' },
                                                React.createElement('div', { className: 'unidade-dado-label' },
                                                    React.createElement('i', { className: 'fas fa-id-card' }),
                                                    'CNES'
                                                ),
                                                React.createElement('div', { className: 'unidade-dado-value' },
                                                    unidadeVerificada.dados.cnes || 'Não informado'
                                                )
                                            ),
                                            React.createElement('div', { className: 'unidade-dado-item' },
                                                React.createElement('div', { className: 'unidade-dado-label' },
                                                    React.createElement('i', { className: 'fas fa-tag' }),
                                                    'TIPO'
                                                ),
                                                React.createElement('div', { className: 'unidade-dado-value' },
                                                    unidadeVerificada.dados.tipo || 'Não informado'
                                                )
                                            )
                                        ),
                                        React.createElement('div', { className: 'unidade-card-footer' },
                                            React.createElement('i', { className: 'fas fa-database' }),
                                            React.createElement('span', null, 'Dados obtidos do sistema de cadastro')
                                        )
                                    )
                                )
                            ) : (
                                React.createElement('div', { className: 'not-found-container' },
                                    React.createElement('div', { className: 'not-found-message' },
                                        React.createElement('i', { className: 'fas fa-exclamation-triangle' }),
                                        React.createElement('span', null, 'Unidade não cadastrada no sistema')
                                    ),
                                    React.createElement('div', { className: 'not-found-description' },
                                        'A unidade "', formData.unidade, '" não foi encontrada na base de dados. É necessário cadastrá-la primeiro para prosseguir.'
                                    ),
                                    React.createElement('div', { className: 'not-found-info' },
                                        React.createElement('i', { className: 'fas fa-info-circle' }),
                                        React.createElement('span', null, 'O formulário de cadastro será pré-preenchido automaticamente com os dados da consulta CNES (se disponível). Após cadastrar, volte aqui e clique em "Verificar novamente".')
                                    ),
                                    React.createElement('div', { className: 'not-found-actions' },
                                        React.createElement('button', {
                                            type: 'button',
                                            className: 'btn-create-unit',
                                            onClick: redirecionarParaCadastroUnidade,
                                            disabled: !dadosCNES
                                        },
                                            React.createElement('i', { className: 'fas fa-plus-circle' }),
                                            'CADASTRAR UNIDADE DE SAÚDE'
                                        ),
                                        React.createElement('button', {
                                            type: 'button',
                                            className: 'btn-verify-again',
                                            onClick: () => verificarUnidade(formData.unidade)
                                        },
                                            React.createElement('i', { className: 'fas fa-sync-alt' }),
                                            'VERIFICAR NOVAMENTE'
                                        )
                                    )
                                )
                            )
                        )
                    )
                ),

                // Formulário
                React.createElement('form', { onSubmit: handleSubmit },
                    // Seção 1: Informações do Solicitante
                    React.createElement('div', { className: 'form-section' },
                        React.createElement('div', { className: 'section-header' },
                            React.createElement('div', { className: 'section-icon' },
                                React.createElement('i', { className: 'fas fa-user' })
                            ),
                            React.createElement('div', null,
                                React.createElement('h3', { className: 'section-title' }, 
                                    'Informações do Solicitante'
                                ),
                                React.createElement('p', { className: 'section-subtitle' }, 
                                    'Dados da pessoa que está fazendo a solicitação'
                                )
                            )
                        ),
                        React.createElement('div', { className: 'section-content' },
                            React.createElement('div', { className: 'fields-grid' },
                                // Nome
                                React.createElement('div', { className: 'field-group' },
                                    React.createElement('label', { className: 'field-label' },
                                        React.createElement('i', { className: 'fas fa-user' }),
                                        'Nome Completo',
                                        React.createElement('span', { className: 'required-star' }, '*')
                                    ),
                                    React.createElement('input', {
                                        type: 'text',
                                        className: `form-control ${errors.nome ? 'is-invalid' : ''}`,
                                        value: formData.nome,
                                        onChange: (e) => handleChange('nome', e.target.value),
                                        placeholder: 'Digite o nome completo do solicitante'
                                    }),
                                    errors.nome && React.createElement('div', { 
                                        className: 'field-hint',
                                        style: { color: '#ef4444' }
                                    }, errors.nome)
                                ),

                                // Telefone
                                React.createElement('div', { className: 'field-group' },
                                    React.createElement('label', { className: 'field-label' },
                                        React.createElement('i', { className: 'fas fa-phone' }),
                                        'Telefone',
                                        React.createElement('span', { className: 'required-star' }, '*')
                                    ),
                                    React.createElement('input', {
                                        type: 'text',
                                        className: `form-control ${errors.telefone ? 'is-invalid' : ''}`,
                                        value: formData.telefone,
                                        onChange: (e) => handleChange('telefone', maskTelefone(e.target.value)),
                                        placeholder: '(XX) XXXXX-XXXX'
                                    }),
                                    errors.telefone && React.createElement('div', { 
                                        className: 'field-hint',
                                        style: { color: '#ef4444' }
                                    }, errors.telefone)
                                ),

                                // Função
                                React.createElement('div', { className: 'field-group' },
                                    React.createElement('label', { className: 'field-label' },
                                        React.createElement('i', { className: 'fas fa-briefcase' }),
                                        'Função/Cargo'
                                    ),
                                    React.createElement('input', {
                                        type: 'text',
                                        className: 'form-control',
                                        value: formData.funcao,
                                        onChange: (e) => handleChange('funcao', e.target.value),
                                        placeholder: 'Ex: Médico, Enfermeiro, Técnico...'
                                    })
                                ),

                                // Setor
                                React.createElement('div', { className: 'field-group' },
                                    React.createElement('label', { className: 'field-label' },
                                        React.createElement('i', { className: 'fas fa-building' }),
                                        'Setor de Atuação'
                                    ),
                                    React.createElement('input', {
                                        type: 'text',
                                        className: 'form-control',
                                        value: formData.setor,
                                        onChange: (e) => handleChange('setor', e.target.value),
                                        placeholder: 'Ex: Emergência, UTI, Clínica...'
                                    })
                                )
                            )
                        )
                    ),

                    // Seção 2: Dados da Unidade de Saúde
                    React.createElement('div', { className: 'form-section' },
                        React.createElement('div', { className: 'section-header' },
                            React.createElement('div', { className: 'section-icon' },
                                React.createElement('i', { className: 'fas fa-hospital' })
                            ),
                            React.createElement('div', null,
                                React.createElement('h3', { className: 'section-title' }, 
                                    'Dados da Unidade de Saúde'
                                ),
                                React.createElement('p', { className: 'section-subtitle' }, 
                                    'Informações da unidade que está fazendo a solicitação'
                                )
                            )
                        ),
                        React.createElement('div', { className: 'section-content' },
                            React.createElement('div', { className: 'fields-grid' },

                                // Município
                                React.createElement('div', { className: 'field-group autocomplete-container' },
                                    React.createElement('label', { className: 'field-label' },
                                        React.createElement('i', { className: 'fas fa-map-marker-alt' }),
                                        'Município',
                                        React.createElement('span', { className: 'required-star' }, '*')
                                    ),
                                    React.createElement('div', { className: 'position-relative' },
                                        React.createElement('input', {
                                            type: 'text',
                                            className: `form-control ${errors.municipio ? 'is-invalid' : ''}`,
                                            value: formData.municipio,
                                            onChange: (e) => handleChange('municipio', e.target.value),
                                            placeholder: 'Digite o município (MS)',
                                            autoComplete: 'off'
                                        }),
                                        municipioSearching && React.createElement('div', { 
                                            className: 'autocomplete-loading show'
                                        },
                                            React.createElement('i', { className: 'fas fa-spinner fa-spin' })
                                        )
                                    ),
                                    municipioDropdownOpen && municipioResults.length > 0 && React.createElement('div', { 
                                        className: 'autocomplete-dropdown show',
                                        style: {
                                            position: 'absolute',
                                            top: '100%',
                                            left: '0',
                                            right: '0',
                                            zIndex: 99999,
                                            backgroundColor: 'white',
                                            border: '2px solid #ef4444',
                                            borderTop: 'none',
                                            borderRadius: '0 0 10px 10px',
                                            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)',
                                            maxHeight: '600px',
                                            overflowY: 'auto'
                                        }
                                    },
                                        React.createElement('div', {
                                            style: {
                                                padding: '8px 16px',
                                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                                borderBottom: '1px solid #e9ecef',
                                                fontSize: '0.8rem',
                                                color: '#6c757d',
                                                display: 'flex',
                                                justifyContent: 'space-between'
                                            }
                                        },
                                            React.createElement('span', {},
                                                React.createElement('i', { className: 'fas fa-map-marker-alt' }),
                                                ` ${municipioResults.length} município(s)`
                                            ),
                                            React.createElement('span', {},
                                                React.createElement('i', { className: 'fas fa-clock' }),
                                                ' MS - Brasil'
                                            )
                                        ),
                                        municipioResults.map((municipio, index) => 
                                            React.createElement('div', {
                                                key: `municipio-${index}`,
                                                style: {
                                                    padding: '12px 16px',
                                                    cursor: 'pointer',
                                                    borderBottom: index < municipioResults.length - 1 ? '1px solid #f1f3f4' : 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    transition: 'all 0.2s ease',
                                                    fontSize: '0.95rem'
                                                },
                                                onClick: () => selectMunicipio(municipio.nome),
                                                onMouseEnter: (e) => {
                                                    e.target.style.background = 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
                                                    e.target.style.color = '#15803d';
                                                    e.target.style.transform = 'translateX(4px)';
                                                },
                                                onMouseLeave: (e) => {
                                                    e.target.style.background = 'white';
                                                    e.target.style.color = 'inherit';
                                                    e.target.style.transform = 'translateX(0)';
                                                }
                                            }, 
                                                React.createElement('span', { style: { marginRight: '8px' } }, '📍'),
                                                municipio.nome
                                            )
                                        )
                                    ),
                                    React.createElement('div', { 
                                        className: 'field-hint',
                                        style: { 
                                            marginTop: '4px',
                                            fontSize: '12px',
                                            color: municipioHelpText.includes('✅') ? '#10b981' : '#6b7280'
                                        }
                                    },
                                        React.createElement('i', { className: 'fas fa-info-circle' }),
                                        ' ' + municipioHelpText
                                    ),
                                    errors.municipio && React.createElement('div', { 
                                        className: 'field-hint',
                                        style: { color: '#ef4444' }
                                    }, errors.municipio)
                                ),

                                // CNES
                                React.createElement('div', { className: 'field-group cnes-field-group' },
                                    React.createElement('label', { className: 'field-label' },
                                        React.createElement('i', { className: 'fas fa-id-card' }),
                                        'Código CNES'
                                    ),
                                    React.createElement('div', { className: 'cnes-input-container' },
                                        React.createElement('input', {
                                            type: 'text',
                                            className: `form-control ${errors.cnes ? 'is-invalid' : ''}`,
                                            value: formData.cnes,
                                            onChange: (e) => handleChange('cnes', maskCNES(e.target.value)),
                                            placeholder: '1234567'
                                        }),
                                        consultandoCNES && React.createElement('div', { className: 'cnes-loading' },
                                            React.createElement('i', { className: 'fas fa-spinner fa-spin' })
                                        )
                                    ),
                                    React.createElement('div', { className: 'field-hint' },
                                        React.createElement('i', { className: 'fas fa-info-circle' }),
                                        'Código de 7 dígitos do CNES (opcional)'
                                    ),
                                    errors.cnes && React.createElement('div', { 
                                        className: 'field-hint',
                                        style: { color: '#ef4444' }
                                    }, errors.cnes),

                                    // Resultado da consulta CNES
                                    dadosCNES && React.createElement('div', { className: 'cnes-result' },
                                        React.createElement('div', { className: 'cnes-status' },
                                            React.createElement('span', { className: 'cnes-badge' }, 'AUXÍLIO'),
                                            React.createElement('span', { className: 'cnes-title' }, 'Cadastro Nacional de Estabelecimentos de Saúde (Campo auxiliar)')
                                        ),
                                        React.createElement('div', { className: 'cnes-info' },
                                            React.createElement('i', { className: 'fas fa-info-circle' }),
                                            React.createElement('span', null, 'AUXÍLIO: O código CNES é um campo auxiliar que ajudará na identificação da unidade com dados do Ministério da Saúde')
                                        ),
                                        React.createElement('div', { className: 'cnes-data' },
                                            React.createElement('span', null, `${formData.cnes} (opcional)`)
                                        )
                                    )
                                ),

                                // Contato Telefônico CNES
                                React.createElement('div', { className: 'field-group' },
                                    React.createElement('label', { className: 'field-label' },
                                        React.createElement('i', { className: 'fas fa-phone-alt' }),
                                        'Contato Telefônico da Unidade'
                                    ),
                                    React.createElement('input', {
                                        type: 'text',
                                        className: 'form-control',
                                        value: formData.contato_telefonico_cnes,
                                        onChange: (e) => handleChange('contato_telefonico_cnes', maskTelefone(e.target.value)),
                                        placeholder: '(XX) XXXXX-XXXX'
                                    })
                                )
                            )
                        )
                    ),

                    // Seção 3: Detalhes da Chamada
                    React.createElement('div', { className: 'form-section' },
                        React.createElement('div', { className: 'section-header' },
                            React.createElement('div', { className: 'section-icon' },
                                React.createElement('i', { className: 'fas fa-phone-volume' })
                            ),
                            React.createElement('div', null,
                                React.createElement('h3', { className: 'section-title' }, 
                                    'Detalhes da Chamada'
                                ),
                                React.createElement('p', { className: 'section-subtitle' }, 
                                    'Informações específicas sobre a solicitação'
                                )
                            )
                        ),
                        React.createElement('div', { className: 'section-content' },
                            React.createElement('div', { className: 'fields-grid' },
                                // Tipo de Chamada
                                React.createElement('div', { className: 'field-group' },
                                    React.createElement('label', { className: 'field-label' },
                                        React.createElement('i', { className: 'fas fa-tag' }),
                                        'Tipo de Chamada',
                                        React.createElement('span', { className: 'required-star' }, '*')
                                    ),
                                    React.createElement('select', {
                                        className: `form-select ${errors.tipo_chamada ? 'is-invalid' : ''}`,
                                        value: formData.tipo_chamada,
                                        onChange: (e) => handleChange('tipo_chamada', e.target.value)
                                    },
                                        React.createElement('option', { value: '' }, 'Selecione o tipo de chamada'),
                                        React.createElement('option', { value: 'REGULACAO_AMBULATORIAL' }, 'Regulação Ambulatorial'),
                                        React.createElement('option', { value: 'REGULACAO_HOSPITALAR' }, 'Regulação Hospitalar'),
                                        React.createElement('option', { value: 'TRANSPORTE_SANITARIO' }, 'Transporte Sanitário'),
                                        React.createElement('option', { value: 'EMERGENCIA_MEDICA' }, 'Emergência Médica'),
                                        React.createElement('option', { value: 'CONSULTA_ESPECIALIZADA' }, 'Consulta Especializada'),
                                        React.createElement('option', { value: 'EXAME_DIAGNOSTICO' }, 'Exame Diagnóstico'),
                                        React.createElement('option', { value: 'INTERNACAO_HOSPITALAR' }, 'Internação Hospitalar'),
                                        React.createElement('option', { value: 'OUTROS' }, 'Outros')
                                    ),
                                    errors.tipo_chamada && React.createElement('div', { 
                                        className: 'field-hint',
                                        style: { color: '#ef4444' }
                                    }, errors.tipo_chamada)
                                ),

                                // Status
                                React.createElement('div', { className: 'field-group' },
                                    React.createElement('label', { className: 'field-label' },
                                        React.createElement('i', { className: 'fas fa-flag' }),
                                        'Status',
                                        React.createElement('span', { className: 'required-star' }, '*')
                                    ),
                                    React.createElement('select', {
                                        className: `form-select ${errors.status ? 'is-invalid' : ''}`,
                                        value: formData.status,
                                        onChange: (e) => handleChange('status', e.target.value)
                                    },
                                        React.createElement('option', { value: '' }, 'Selecione o status'),
                                        React.createElement('option', { value: 'PENDENTE' }, 'Pendente'),
                                        React.createElement('option', { value: 'EM_ANDAMENTO' }, 'Em Andamento'),
                                        React.createElement('option', { value: 'RESOLVIDO' }, 'Resolvido'),
                                        React.createElement('option', { value: 'CANCELADO' }, 'Cancelado')
                                    ),
                                    errors.status && React.createElement('div', { 
                                        className: 'field-hint',
                                        style: { color: '#ef4444' }
                                    }, errors.status)
                                ),

                                // Nome do Atendente
                                React.createElement('div', { className: 'field-group' },
                                    React.createElement('label', { className: 'field-label' },
                                        React.createElement('i', { className: 'fas fa-user-md' }),
                                        'Nome do Atendente',
                                        React.createElement('span', { className: 'required-star' }, '*')
                                    ),
                                    React.createElement('input', {
                                        type: 'text',
                                        className: `form-control ${errors.nome_atendente ? 'is-invalid' : ''}`,
                                        value: formData.nome_atendente,
                                        onChange: (e) => handleChange('nome_atendente', e.target.value),
                                        placeholder: 'Nome de quem atendeu a chamada'
                                    }),
                                    errors.nome_atendente && React.createElement('div', { 
                                        className: 'field-hint',
                                        style: { color: '#ef4444' }
                                    }, errors.nome_atendente)
                                )
                            ),

                            // Descrição da Solicitação (campo grande)
                            React.createElement('div', { className: 'field-group', style: { marginTop: '1.5rem' } },
                                React.createElement('label', { className: 'field-label' },
                                    React.createElement('i', { className: 'fas fa-file-alt' }),
                                    'Descrição da Solicitação',
                                    React.createElement('span', { className: 'required-star' }, '*')
                                ),
                                React.createElement('textarea', {
                                    className: `form-control ${errors.descricao ? 'is-invalid' : ''}`,
                                    value: formData.descricao,
                                    onChange: (e) => handleChange('descricao', e.target.value),
                                    placeholder: 'Descreva detalhadamente a solicitação...',
                                    rows: 4
                                }),
                                errors.descricao && React.createElement('div', { 
                                    className: 'field-hint',
                                    style: { color: '#ef4444' }
                                }, errors.descricao)
                            ),

                            // Solução/Encaminhamento (campo grande)
                            React.createElement('div', { className: 'field-group', style: { marginTop: '1.5rem' } },
                                React.createElement('label', { className: 'field-label' },
                                    React.createElement('i', { className: 'fas fa-check-circle' }),
                                    'Solução/Encaminhamento'
                                ),
                                React.createElement('textarea', {
                                    className: 'form-control',
                                    value: formData.solucao,
                                    onChange: (e) => handleChange('solucao', e.target.value),
                                    placeholder: 'Descreva a solução dada ou encaminhamento realizado...',
                                    rows: 3
                                }),
                                React.createElement('div', { className: 'field-hint' },
                                    React.createElement('i', { className: 'fas fa-info-circle' }),
                                    'Campo opcional - pode ser preenchido posteriormente'
                                )
                            )
                        )
                    ),

                    // Botões de ação (IGUAL À PÁGINA ORIGINAL)
                    React.createElement('div', { className: 'action-buttons' },
                        React.createElement('button', {
                            type: 'submit',
                            className: 'btn btn-primary',
                            disabled: isLoading
                        },
                            React.createElement('i', { className: isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-save' }),
                            isLoading ? 'REGISTRANDO...' : 'REGISTRAR CHAMADA'
                        ),
                        React.createElement('button', {
                            type: 'button',
                            className: 'btn btn-secondary',
                            onClick: limparFormulario
                        },
                            React.createElement('i', { className: 'fas fa-sync-alt' }),
                            'LIMPAR FORMULÁRIO'
                        )
                    )
                ),

                // Modal CNES (EXATAMENTE como na página original)
                modalCNESAberto && dadosCNES && React.createElement('div', { 
                    className: 'cnes-modal',
                    onClick: fecharModalCNES 
                },
                    React.createElement('div', { 
                        className: 'cnes-modal-content',
                        onClick: (e) => e.stopPropagation()
                    },
                        // Header do Modal
                        React.createElement('div', { className: 'cnes-modal-header' },
                            React.createElement('div', { className: 'cnes-modal-title' },
                                React.createElement('i', { className: 'fas fa-hospital-alt' }),
                                `CNES: ${dadosCNES.codigo_cnes || dadosCNES.codigo || formData.cnes}`
                            ),
                            React.createElement('button', {
                                className: 'cnes-modal-close',
                                onClick: fecharModalCNES
                            },
                                React.createElement('i', { className: 'fas fa-times' })
                            )
                        ),

                        // Body do Modal
                        React.createElement('div', { className: 'cnes-modal-body' },
                            // Header do Estabelecimento
                            React.createElement('div', { className: 'cnes-estabelecimento-header' },
                                React.createElement('div', { className: 'cnes-estabelecimento-title' },
                                    React.createElement('i', { className: 'fas fa-hospital' }),
                                    'Estabelecimento Encontrado'
                                ),
                                React.createElement('div', { className: 'cnes-badge-ministerio' },
                                    'Ministério da Saúde'
                                )
                            ),

                            // Nome Principal
                            React.createElement('div', { className: 'cnes-nome-principal' },
                                dadosCNES.nome_fantasia || dadosCNES.nome || 'Nome não informado'
                            ),

                            // Razão Social
                            React.createElement('div', { className: 'cnes-razao-social' },
                                React.createElement('i', { className: 'fas fa-building' }),
                                dadosCNES.nome_razao_social || 'Razão social não informada'
                            ),

                            // Grid de Informações
                            React.createElement('div', { className: 'cnes-info-grid' },
                                // Localização
                                React.createElement('div', { className: 'cnes-info-item' },
                                    React.createElement('div', { className: 'cnes-info-label' },
                                        React.createElement('i', { className: 'fas fa-map-marker-alt' }),
                                        'Localização'
                                    ),
                                    React.createElement('div', { className: 'cnes-info-value' },
                                        `${dadosCNES.descricao_municipio || dadosCNES.municipio || 'Não informado'} - ${dadosCNES.sigla_uf || dadosCNES.uf || 'N/A'}`
                                    )
                                ),

                                // Tipo de Unidade
                                React.createElement('div', { className: 'cnes-info-item' },
                                    React.createElement('div', { className: 'cnes-info-label' },
                                        React.createElement('i', { className: 'fas fa-hospital-alt' }),
                                        'Tipo de Unidade'
                                    ),
                                    React.createElement('div', { className: 'cnes-info-value' },
                                        dadosCNES.tipo_unidade || 'Não informado'
                                    )
                                ),

                                // Endereço
                                React.createElement('div', { className: 'cnes-info-item' },
                                    React.createElement('div', { className: 'cnes-info-label' },
                                        React.createElement('i', { className: 'fas fa-map-signs' }),
                                        'Endereço'
                                    ),
                                    React.createElement('div', { className: 'cnes-info-value' },
                                        `${dadosCNES.endereco_estabelecimento || dadosCNES.endereco || 'Não informado'}${dadosCNES.numero_estabelecimento ? ', ' + dadosCNES.numero_estabelecimento : ''}`
                                    )
                                ),

                                // Bairro/CEP
                                React.createElement('div', { className: 'cnes-info-item' },
                                    React.createElement('div', { className: 'cnes-info-label' },
                                        React.createElement('i', { className: 'fas fa-location-arrow' }),
                                        'Bairro/CEP'
                                    ),
                                    React.createElement('div', { className: 'cnes-info-value' },
                                        `${dadosCNES.bairro || 'CENTRO'} - CEP: ${dadosCNES.cep || '79670000'}`
                                    )
                                ),

                                // Telefone
                                React.createElement('div', { className: 'cnes-info-item' },
                                    React.createElement('div', { className: 'cnes-info-label' },
                                        React.createElement('i', { className: 'fas fa-phone' }),
                                        'Telefone'
                                    ),
                                    React.createElement('div', { className: 'cnes-info-value' },
                                        dadosCNES.numero_telefone_estabelecimento || dadosCNES.telefone || 'Não informado'
                                    )
                                ),

                                // E-mail
                                React.createElement('div', { className: 'cnes-info-item' },
                                    React.createElement('div', { className: 'cnes-info-label' },
                                        React.createElement('i', { className: 'fas fa-envelope' }),
                                        'E-mail'
                                    ),
                                    React.createElement('div', { className: 'cnes-info-value' },
                                        dadosCNES.email || 'Não informado'
                                    )
                                ),

                                // CNPJ
                                React.createElement('div', { className: 'cnes-info-item' },
                                    React.createElement('div', { className: 'cnes-info-label' },
                                        React.createElement('i', { className: 'fas fa-file-alt' }),
                                        'CNPJ'
                                    ),
                                    React.createElement('div', { className: 'cnes-info-value' },
                                        dadosCNES.numero_cnpj_entidade || 'Não informado'
                                    )
                                ),

                                // Gestão
                                React.createElement('div', { className: 'cnes-info-item' },
                                    React.createElement('div', { className: 'cnes-info-label' },
                                        React.createElement('i', { className: 'fas fa-users-cog' }),
                                        'Gestão'
                                    ),
                                    React.createElement('div', { className: 'cnes-info-value' },
                                        dadosCNES.gestao || 'D'
                                    )
                                )
                            )
                        ),

                        // Footer do Modal
                        React.createElement('div', { className: 'cnes-modal-footer' },
                            React.createElement('button', {
                                className: 'btn-preencher',
                                onClick: preencherComDadosCNES
                            },
                                React.createElement('i', { className: 'fas fa-download' }),
                                'Preencher com os dados da unidade no formulário'
                            ),
                            React.createElement('button', {
                                className: 'btn-fechar',
                                onClick: fecharModalCNES
                            },
                                React.createElement('i', { className: 'fas fa-times' }),
                                'Fechar'
                            )
                        )
                    )
                )
            )
        );
    }

    // Exportar o componente globalmente (para compatibilidade)
    window.RegistroChamadaReact = RegistroChamadaReact;

    // Exportar como módulo ES6
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = RegistroChamadaReact;
    }

})();

// Export para ES6 modules
 