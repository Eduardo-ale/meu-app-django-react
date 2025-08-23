/**
 * ReactInitializer - Sistema padronizado de inicialização de componentes React
 * Fornece interface consistente para carregar componentes com props padronizadas
 */
window.ReactInitializer = {
    
    /**
     * Configuração padrão para todos os componentes
     */
    defaultConfig: {
        showLoadingIndicator: true,
        fallbackMessage: 'Componente React não disponível. Usando versão HTML.',
        retryAttempts: 1,
        retryDelay: 1000,
        enableErrorBoundary: true
    },

    /**
     * Inicializar componente React com configuração padronizada
     * @param {string} componentName - Nome do componente
     * @param {string} containerId - ID do container
     * @param {object} customProps - Props específicas do componente
     * @param {object} options - Opções de configuração
     */
    initComponent: function(componentName, containerId, customProps = {}, options = {}) {
        // Verificação robusta de dependências usando o novo sistema
        if (window.ReactDependencyChecker) {
            const dependencyCheck = window.ReactDependencyChecker.checkAllDependencies();
            
            if (dependencyCheck.overall !== 'ok') {
                console.log(`🔧 Dependências não estão OK para ${componentName}. Tentando correção automática...`);
                
                return window.ReactDependencyChecker.diagnoseAndFix()
                    .then(() => {
                        console.log(`✅ Dependências corrigidas. Inicializando ${componentName}...`);
                        return this._performInitialization(componentName, containerId, customProps, options);
                    })
                    .catch(error => {
                        console.error(`❌ Falha na correção de dependências para ${componentName}:`, error);
                        return this._handleDependencyFailure(componentName, containerId, customProps, options);
                    });
            }
        } else {
            // Fallback para verificação básica se ReactDependencyChecker não estiver disponível
            if (!this.areDependenciesLoaded()) {
                console.warn(`⚠️ Dependências básicas não carregadas para ${componentName}. Aguardando...`);
                return this.waitAndInit(componentName, containerId, customProps, options);
            }
        }

        // Prosseguir com inicialização normal
        return this._performInitialization(componentName, containerId, customProps, options);
    },

    /**
     * Executar a inicialização do componente
     */
    _performInitialization: function(componentName, containerId, customProps = {}, options = {}) {

        // Combinar configurações
        const config = { 
            ...this.defaultConfig, 
            ...options,
            // Callbacks aprimorados
            onSuccess: (compName, container) => {
                // Criar indicador de status se habilitado
                if (config.showStatusIndicator !== false && window.SafeComponentLoader) {
                    window.SafeComponentLoader.createComponentStatusIndicator(compName, containerId);
                }
                
                // Callback personalizado
                if (options.onSuccess) {
                    options.onSuccess(compName, container);
                }
                
                if (window.ReactDebugger) {
                    window.ReactDebugger.logInfo(`✅ ${compName} inicializado com sucesso`);
                }
            },
            onFallback: (compName, container) => {
                // Log detalhado do fallback
                if (window.ReactDebugger) {
                    window.ReactDebugger.logWarning(`⚠️ Fallback ativado para ${compName}`, {
                        container: containerId,
                        reason: 'Componente não disponível ou falha na renderização'
                    });
                }
                
                // Callback personalizado
                if (options.onFallback) {
                    options.onFallback(compName, container);
                }
            },
            onError: (error, compName, container) => {
                // Log detalhado do erro
                if (window.ReactDebugger) {
                    window.ReactDebugger.logComponentError(compName, error, {
                        componentStack: `Erro em ${compName} no container ${containerId}`
                    });
                }
                
                // Callback personalizado
                if (options.onError) {
                    options.onError(error, compName, container);
                }
            }
        };
        
        // Obter props padrão do sistema
        const standardProps = this.getStandardProps();
        
        // Combinar props padrão com props customizadas
        const finalProps = { ...standardProps, ...customProps };
        
        // Log de inicialização
        if (window.ReactDebugger) {
            window.ReactDebugger.logInfo(`🚀 Inicializando componente ${componentName}`, {
                container: containerId,
                props: Object.keys(finalProps),
                config: Object.keys(config)
            });
        }
        
        // Verificar se componente existe antes de tentar renderizar
        if (window.SafeComponentLoader && !window.SafeComponentLoader.isComponentAvailable(componentName)) {
            if (window.ReactDebugger) {
                window.ReactDebugger.logWarning(`🔍 Componente ${componentName} não encontrado. Verificando dependências...`);
            }
            
            // Tentar aguardar carregamento do componente
            return this.waitForComponent(componentName, () => {
                return window.SafeComponentLoader.safeRenderComponent(
                    componentName,
                    finalProps,
                    containerId,
                    config
                );
            }, 3000);
        }
        
        // Usar SafeComponentLoader para renderizar
        if (window.SafeComponentLoader) {
            return window.SafeComponentLoader.safeRenderComponent(
                componentName,
                finalProps,
                containerId,
                config
            );
        } else {
            // Fallback direto se SafeComponentLoader não estiver disponível
            console.warn('⚠️ SafeComponentLoader não está disponível. Tentando renderização direta...');
            return this._directRender(componentName, finalProps, containerId, config);
        }
    },

    /**
     * Lidar com falha de dependências
     */
    _handleDependencyFailure: function(componentName, containerId, customProps, options) {
        console.error(`❌ Não foi possível carregar dependências para ${componentName}`);
        
        const container = document.getElementById(containerId);
        if (container) {
            // Mostrar fallback HTML se disponível
            const fallbackContainer = container.querySelector('.fallback-container');
            if (fallbackContainer) {
                fallbackContainer.style.display = 'block';
                
                // Adicionar aviso sobre dependências
                const warning = document.createElement('div');
                warning.style.cssText = `
                    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                    border: 2px solid #ef4444;
                    color: #dc2626;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 12px;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                `;
                warning.innerHTML = `
                    <span style="font-size: 18px;">⚠️</span>
                    <div>
                        <strong>Problema de Dependências</strong><br>
                        Não foi possível carregar as dependências React necessárias. 
                        Usando versão HTML como alternativa.
                    </div>
                `;
                container.insertBefore(warning, fallbackContainer);
            }
            
            // Callback de fallback
            if (options.onFallback) {
                options.onFallback(componentName, container);
            }
        }
        
        return false;
    },

    /**
     * Renderização direta sem SafeComponentLoader (último recurso)
     */
    _directRender: function(componentName, props, containerId, config) {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Container ${containerId} não encontrado`);
            }

            if (!window[componentName]) {
                throw new Error(`Componente ${componentName} não encontrado`);
            }

            if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
                throw new Error('React ou ReactDOM não disponíveis');
            }

            // Renderizar diretamente
            const element = React.createElement(window[componentName], props);
            
            if (ReactDOM.createRoot) {
                // React 18+
                const root = ReactDOM.createRoot(container);
                root.render(element);
            } else {
                // React 17 e anteriores
                ReactDOM.render(element, container);
            }

            console.log(`✅ ${componentName} renderizado diretamente`);
            
            if (config.onSuccess) {
                config.onSuccess(componentName, container);
            }
            
            return true;

        } catch (error) {
            console.error(`❌ Falha na renderização direta de ${componentName}:`, error);
            
            if (config.onError) {
                config.onError(error, componentName, document.getElementById(containerId));
            }
            
            return false;
        }
    },

    /**
     * Obter props padrão do sistema Django
     */
    getStandardProps: function() {
        const props = {};
        
        // CSRF Token
        const csrfToken = this.getCSRFToken();
        if (csrfToken) {
            props.csrfToken = csrfToken;
        }
        
        // Informações do usuário
        const userInfo = this.getUserInfo();
        if (userInfo) {
            props.usuario = userInfo;
        }
        
        // Data atual
        props.dataAtual = new Date().toISOString().split('T')[0];
        
        // URLs da aplicação
        props.urls = this.getAppUrls();
        
        return props;
    },

    /**
     * Obter CSRF token do Django
     */
    getCSRFToken: function() {
        // Tentar obter do meta tag
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        
        // Tentar obter do cookie
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        
        // Tentar obter de input hidden
        const hiddenInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
        if (hiddenInput) {
            return hiddenInput.value;
        }
        
        return null;
    },

    /**
     * Obter informações do usuário
     */
    getUserInfo: function() {
        // Tentar obter de variáveis globais Django
        if (window.djangoData && window.djangoData.user) {
            return window.djangoData.user;
        }
        
        // Tentar obter de meta tags
        const userIdMeta = document.querySelector('meta[name="user-id"]');
        const usernameMeta = document.querySelector('meta[name="username"]');
        const fullNameMeta = document.querySelector('meta[name="user-fullname"]');
        
        if (userIdMeta || usernameMeta) {
            return {
                id: userIdMeta ? parseInt(userIdMeta.getAttribute('content')) : null,
                username: usernameMeta ? usernameMeta.getAttribute('content') : null,
                full_name: fullNameMeta ? fullNameMeta.getAttribute('content') : null
            };
        }
        
        return null;
    },

    /**
     * Obter URLs da aplicação
     */
    getAppUrls: function() {
        const urls = {};
        
        // Tentar obter de variáveis globais Django
        if (window.djangoData && window.djangoData.urls) {
            return window.djangoData.urls;
        }
        
        // URLs padrão baseadas na estrutura atual
        urls.home = '/';
        urls.unidades_saude = '/unidades/';
        urls.criar_unidade = '/unidades/criar/';
        urls.registro_chamada = '/registro/';
        
        return urls;
    },

    /**
     * Configurar dados globais do Django (para ser chamado pelos templates)
     */
    setDjangoData: function(data) {
        window.djangoData = data;
    },

    /**
     * Inicializar múltiplos componentes
     */
    initMultipleComponents: function(components) {
        const results = {};
        
        for (const [componentName, config] of Object.entries(components)) {
            const { containerId, props = {}, options = {} } = config;
            results[componentName] = this.initComponent(componentName, containerId, props, options);
        }
        
        return results;
    },

    /**
     * Aguardar carregamento de dependências e inicializar componente
     */
    waitAndInit: function(componentName, containerId, customProps = {}, options = {}, maxWaitTime = 5000) {
        const startTime = Date.now();
        const checkInterval = 100;
        
        const checkAndInit = () => {
            // Verificar se todas as dependências estão carregadas
            if (this.areDependenciesLoaded()) {
                return this.initComponent(componentName, containerId, customProps, options);
            }
            
            // Verificar timeout
            if (Date.now() - startTime > maxWaitTime) {
                console.error(`❌ Timeout aguardando dependências para ${componentName}`);
                return false;
            }
            
            // Tentar novamente
            setTimeout(checkAndInit, checkInterval);
        };
        
        checkAndInit();
    },

    /**
     * Verificar se todas as dependências estão carregadas
     */
    areDependenciesLoaded: function() {
        const criticalDeps = typeof React !== 'undefined' && typeof ReactDOM !== 'undefined';
        const supportDeps = typeof window.ReactErrorBoundary !== 'undefined' &&
                           typeof window.SafeComponentLoader !== 'undefined' &&
                           typeof window.ReactDebugger !== 'undefined';
        
        // Retornar true se pelo menos as dependências críticas estão carregadas
        return criticalDeps;
    },

    /**
     * Verificar se todas as dependências (incluindo suporte) estão carregadas
     */
    areAllDependenciesLoaded: function() {
        return (
            typeof React !== 'undefined' &&
            typeof ReactDOM !== 'undefined' &&
            typeof window.ReactErrorBoundary !== 'undefined' &&
            typeof window.SafeComponentLoader !== 'undefined' &&
            typeof window.ReactDebugger !== 'undefined'
        );
    },

    /**
     * Aguardar carregamento de componente específico
     */
    waitForComponent: function(componentName, callback, timeout = 5000) {
        const startTime = Date.now();
        const checkInterval = 200;
        
        const checkComponent = () => {
            if (window.SafeComponentLoader && window.SafeComponentLoader.isComponentAvailable(componentName)) {
                ReactDebugger.logInfo(`✅ Componente ${componentName} carregado após ${Date.now() - startTime}ms`);
                return callback();
            }
            
            if (Date.now() - startTime > timeout) {
                ReactDebugger.logWarning(`⏰ Timeout aguardando componente ${componentName}. Ativando fallback.`);
                return false;
            }
            
            setTimeout(checkComponent, checkInterval);
        };
        
        checkComponent();
    },

    /**
     * Verificar saúde do sistema de componentes
     */
    healthCheck: function() {
        const health = {
            timestamp: new Date().toISOString(),
            dependencies: {
                react: typeof React !== 'undefined',
                reactDOM: typeof ReactDOM !== 'undefined',
                errorBoundary: typeof window.ReactErrorBoundary !== 'undefined',
                safeLoader: typeof window.SafeComponentLoader !== 'undefined',
                debugger: typeof window.ReactDebugger !== 'undefined'
            },
            components: {},
            issues: []
        };

        // Verificar componentes conhecidos
        const knownComponents = ['CriarUnidadeReact', 'RegistroChamadaReact'];
        knownComponents.forEach(name => {
            if (window.SafeComponentLoader) {
                health.components[name] = window.SafeComponentLoader.checkComponentStatus(name);
            }
        });

        // Identificar problemas
        Object.entries(health.dependencies).forEach(([dep, available]) => {
            if (!available) {
                health.issues.push(`Dependência ausente: ${dep}`);
            }
        });

        Object.entries(health.components).forEach(([name, status]) => {
            if (!status.exists) {
                health.issues.push(`Componente ausente: ${name}`);
            }
        });

        // Log do health check
        if (health.issues.length === 0) {
            ReactDebugger.logInfo('💚 Sistema de componentes saudável');
        } else {
            ReactDebugger.logWarning('⚠️ Problemas detectados no sistema:', health.issues);
        }

        return health;
    },

    /**
     * Inicializar sistema de monitoramento automático
     */
    startAutoMonitoring: function(interval = 30000) {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        this.monitoringInterval = setInterval(() => {
            const health = this.healthCheck();
            
            // Detectar componentes ausentes
            if (window.SafeComponentLoader) {
                const missing = window.SafeComponentLoader.detectMissingComponents();
                if (missing.length > 0) {
                    ReactDebugger.logWarning('🔍 Monitoramento: Componentes ausentes detectados', missing);
                }
            }
        }, interval);

        ReactDebugger.logInfo(`🔄 Monitoramento automático iniciado (intervalo: ${interval}ms)`);
    },

    /**
     * Parar monitoramento automático
     */
    stopAutoMonitoring: function() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            ReactDebugger.logInfo('⏹️ Monitoramento automático parado');
        }
    },

    /**
     * Diagnóstico completo do sistema
     */
    diagnose: function() {
        console.group('🔍 Diagnóstico ReactInitializer');
        
        console.log('📋 Configuração padrão:', this.defaultConfig);
        console.log('🔧 Props padrão:', this.getStandardProps());
        console.log('📦 Dependências carregadas:', this.areDependenciesLoaded());
        
        // Health check
        const health = this.healthCheck();
        console.log('💊 Saúde do sistema:', health);
        
        if (window.SafeComponentLoader) {
            window.SafeComponentLoader.diagnoseEnvironment();
        }
        
        console.groupEnd();
        
        return health;
    }
};

// Função de conveniência global
window.initReactComponent = window.ReactInitializer.initComponent.bind(window.ReactInitializer);