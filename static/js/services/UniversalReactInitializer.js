/**
 * UniversalReactInitializer - Sistema universal e robusto de inicialização React
 * Corrige problemas de carregamento e garante inicialização adequada de componentes
 */
window.UniversalReactInitializer = {
    
    // Configuração global
    config: {
        maxRetries: 3,
        retryDelay: 1000,
        dependencyTimeout: 10000,
        enableDebugMode: true,
        fallbackEnabled: true
    },

    // Estado interno
    state: {
        initialized: false,
        componentsLoaded: new Set(),
        failedComponents: new Set(),
        dependenciesReady: false
    },

    /**
     * Inicializar o sistema universal
     */
    async init() {
        if (this.state.initialized) {
            this.log('Sistema já inicializado', 'info');
            return Promise.resolve();
        }

        this.log('🚀 Inicializando UniversalReactInitializer...', 'info');
        
        try {
            await this.checkAndLoadDependencies();
            this.state.initialized = true;
            this.state.dependenciesReady = true;
            this.log('✅ Sistema inicializado com sucesso', 'success');
            this.setupGlobalErrorHandling();
            return true;
        } catch (error) {
            this.log('❌ Falha na inicialização: ' + error.message, 'error');
            throw error;
        }
    },

    /**
     * Verificar e carregar dependências React
     */
    checkAndLoadDependencies: function() {
        return new Promise((resolve, reject) => {
            // Verificar se React e ReactDOM já estão disponíveis
            if (this.areDependenciesLoaded()) {
                this.log('✅ Dependências React já carregadas', 'success');
                resolve();
                return;
            }

            this.log('🔍 Verificando dependências React...', 'info');
            
            // Aguardar carregamento das dependências
            this.waitForDependencies(['React', 'ReactDOM'], this.config.dependencyTimeout)
                .then(() => {
                    this.log('✅ Dependências carregadas com sucesso', 'success');
                    resolve();
                })
                .catch(error => {
                    this.log('⚠️ Tentando carregar dependências via CDN...', 'warning');
                    this.loadDependenciesViaCDN()
                        .then(() => resolve())
                        .catch(cdnError => {
                            this.log('❌ Falha ao carregar dependências: ' + cdnError.message, 'error');
                            reject(cdnError);
                        });
                });
        });
    },

    /**
     * Carregar dependências via CDN como fallback
     */
    loadDependenciesViaCDN: function() {
        return new Promise((resolve, reject) => {
            const reactScript = document.createElement('script');
            reactScript.src = 'https://unpkg.com/react@18/umd/react.development.js';
            reactScript.crossOrigin = 'anonymous';
            
            reactScript.onload = () => {
                const reactDOMScript = document.createElement('script');
                reactDOMScript.src = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js';
                reactDOMScript.crossOrigin = 'anonymous';
                
                reactDOMScript.onload = () => {
                    this.log('✅ React e ReactDOM carregados via CDN', 'success');
                    resolve();
                };
                
                reactDOMScript.onerror = () => {
                    reject(new Error('Falha ao carregar ReactDOM via CDN'));
                };
                
                document.head.appendChild(reactDOMScript);
            };
            
            reactScript.onerror = () => {
                reject(new Error('Falha ao carregar React via CDN'));
            };
            
            document.head.appendChild(reactScript);
        });
    },

    /**
     * Aguardar carregamento de dependências
     */
    waitForDependencies: function(dependencies, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkInterval = 100;

            const checkDependencies = () => {
                const missing = dependencies.filter(dep => typeof window[dep] === 'undefined');
                
                if (missing.length === 0) {
                    resolve();
                    return;
                }

                if (Date.now() - startTime > timeout) {
                    reject(new Error(`Timeout aguardando dependências: ${missing.join(', ')}`));
                    return;
                }

                setTimeout(checkDependencies, checkInterval);
            };

            checkDependencies();
        });
    },

    /**
     * Verificar se dependências estão carregadas
     */
    areDependenciesLoaded: function() {
        return typeof React !== 'undefined' && typeof ReactDOM !== 'undefined';
    },

    /**
     * Inicializar componente React de forma segura
     */
    initComponent: function(componentName, containerId, props = {}, options = {}) {
        const defaultOptions = {
            enableErrorBoundary: true,
            showLoadingIndicator: true,
            fallbackMessage: 'Componente React não disponível. Usando versão HTML.',
            onSuccess: null,
            onError: null,
            onFallback: null
        };

        const config = { ...defaultOptions, ...options };
        
        this.log(`🔧 Inicializando componente ${componentName}...`, 'info');

        // Verificar se o sistema foi inicializado
        if (!this.state.initialized) {
            this.log('⚠️ Sistema não inicializado. Inicializando automaticamente...', 'warning');
            return this.init().then(() => {
                return this.initComponent(componentName, containerId, props, config);
            });
        }

        // Verificar se dependências estão prontas
        if (!this.state.dependenciesReady) {
            this.log('⚠️ Dependências não estão prontas. Aguardando...', 'warning');
            return this.waitForDependencies(['React', 'ReactDOM'])
                .then(() => {
                    this.state.dependenciesReady = true;
                    return this.initComponent(componentName, containerId, props, config);
                });
        }

        return this.performComponentInitialization(componentName, containerId, props, config);
    },

    /**
     * Executar inicialização do componente
     */
    performComponentInitialization: function(componentName, containerId, props, config) {
        return new Promise((resolve, reject) => {
            const container = document.getElementById(containerId);
            
            if (!container) {
                const error = new Error(`Container '${containerId}' não encontrado`);
                this.log(`❌ ${error.message}`, 'error');
                reject(error);
                return;
            }

            // Mostrar indicador de carregamento
            if (config.showLoadingIndicator) {
                this.showLoadingIndicator(container);
            }

            // Tentar renderizar o componente
            this.attemptComponentRender(componentName, container, props, config)
                .then(success => {
                    if (success) {
                        this.state.componentsLoaded.add(componentName);
                        this.log(`✅ Componente ${componentName} carregado com sucesso`, 'success');
                        
                        if (config.onSuccess) {
                            config.onSuccess(componentName, container);
                        }
                        resolve(true);
                    } else {
                        this.handleComponentFailure(componentName, container, config);
                        resolve(false);
                    }
                })
                .catch(error => {
                    this.log(`❌ Erro ao carregar ${componentName}: ${error.message}`, 'error');
                    this.handleComponentFailure(componentName, container, config, error);
                    
                    if (config.onError) {
                        config.onError(error, componentName, container);
                    }
                    resolve(false);
                });
        });
    },

    /**
     * Tentar renderizar componente
     */
    attemptComponentRender: function(componentName, container, props, config) {
        return new Promise((resolve, reject) => {
            try {
                // Verificar se o componente existe
                if (!window[componentName]) {
                    throw new Error(`Componente ${componentName} não encontrado no escopo global`);
                }

                // Verificar se React está disponível
                if (!this.areDependenciesLoaded()) {
                    throw new Error('React ou ReactDOM não estão disponíveis');
                }

                // Preparar props com dados padrão
                const finalProps = this.prepareComponentProps(props);

                // Criar elemento React
                let componentElement;
                if (config.enableErrorBoundary && window.ReactErrorBoundary) {
                    componentElement = React.createElement(
                        window.ReactErrorBoundary,
                        { componentName: componentName },
                        React.createElement(window[componentName], finalProps)
                    );
                } else {
                    componentElement = React.createElement(window[componentName], finalProps);
                }

                // Renderizar usando método apropriado
                if (ReactDOM.createRoot) {
                    // React 18+
                    const root = ReactDOM.createRoot(container);
                    root.render(componentElement);
                } else {
                    // React 17 e anteriores
                    ReactDOM.render(componentElement, container);
                }

                // Remover indicador de carregamento
                this.hideLoadingIndicator(container);
                
                resolve(true);

            } catch (error) {
                this.hideLoadingIndicator(container);
                reject(error);
            }
        });
    },

    /**
     * Preparar props do componente com dados padrão
     */
    prepareComponentProps: function(customProps) {
        const standardProps = {
            // CSRF Token
            csrfToken: this.getCSRFToken(),
            
            // Data atual
            dataAtual: new Date().toISOString().split('T')[0],
            
            // Informações do usuário (se disponível)
            usuario: this.getUserInfo(),
            
            // URLs da aplicação
            urls: this.getAppUrls()
        };

        return { ...standardProps, ...customProps };
    },

    /**
     * Obter CSRF token
     */
    getCSRFToken: function() {
        // Tentar obter do meta tag
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        
        // Tentar obter de input hidden
        const hiddenInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
        if (hiddenInput) {
            return hiddenInput.value;
        }
        
        // Tentar obter do cookie
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
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
        
        return null;
    },

    /**
     * Obter URLs da aplicação
     */
    getAppUrls: function() {
        if (window.djangoData && window.djangoData.urls) {
            return window.djangoData.urls;
        }
        
        // URLs padrão
        return {
            home: '/',
            unidades_saude: '/unidades/',
            criar_unidade: '/unidades/criar/',
            registro_chamada: '/registro/'
        };
    },

    /**
     * Lidar com falha do componente
     */
    handleComponentFailure: function(componentName, container, config, error = null) {
        this.state.failedComponents.add(componentName);
        this.hideLoadingIndicator(container);
        
        // Mostrar fallback
        this.showFallback(container, componentName, config.fallbackMessage);
        
        if (config.onFallback) {
            config.onFallback(componentName, container);
        }
    },

    /**
     * Mostrar indicador de carregamento
     */
    showLoadingIndicator: function(container) {
        const existingIndicator = container.querySelector('.universal-loading-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'universal-loading-indicator';
        loadingDiv.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border: 2px dashed #cbd5e1;
                border-radius: 16px;
                margin: 15px 0;
                animation: fadeIn 0.3s ease-in;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e2e8f0;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                "></div>
                <div style="
                    color: #64748b;
                    font-size: 16px;
                    font-weight: 600;
                    text-align: center;
                    margin-bottom: 8px;
                ">
                    ⚛️ Carregando Componente React
                </div>
                <div style="
                    color: #94a3b8;
                    font-size: 14px;
                    text-align: center;
                ">
                    Inicializando interface interativa...
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            </style>
        `;
        
        container.insertBefore(loadingDiv, container.firstChild);
    },

    /**
     * Ocultar indicador de carregamento
     */
    hideLoadingIndicator: function(container) {
        const indicator = container.querySelector('.universal-loading-indicator');
        if (indicator) {
            indicator.remove();
        }
    },

    /**
     * Mostrar fallback
     */
    showFallback: function(container, componentName, message) {
        // Procurar por container de fallback existente
        const fallbackContainer = container.querySelector('.fallback-container');
        
        if (fallbackContainer) {
            fallbackContainer.style.display = 'block';
            this.addFallbackWarning(container, message);
        } else {
            this.createGenericFallback(container, componentName, message);
        }
    },

    /**
     * Adicionar aviso de fallback
     */
    addFallbackWarning: function(container, message) {
        if (container.querySelector('.universal-fallback-warning')) {
            return;
        }

        const warning = document.createElement('div');
        warning.className = 'universal-fallback-warning';
        warning.style.cssText = `
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #f59e0b;
            color: #92400e;
            padding: 16px 20px;
            margin-bottom: 20px;
            border-radius: 12px;
            font-size: 14px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
            animation: slideInDown 0.3s ease-out;
        `;
        
        warning.innerHTML = `
            <div style="font-size: 20px; flex-shrink: 0;">⚠️</div>
            <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 4px; color: #78350f;">
                    Modo de Compatibilidade Ativado
                </div>
                <div style="line-height: 1.4; color: #92400e;">
                    ${message}
                </div>
                <div style="font-size: 12px; color: #a16207; margin-top: 8px; font-style: italic;">
                    💡 A funcionalidade permanece disponível através da interface HTML.
                </div>
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: none; border: none; color: #92400e; cursor: pointer;
                font-size: 18px; padding: 4px; border-radius: 4px;
                transition: background 0.2s ease; flex-shrink: 0;
            " onmouseover="this.style.background='rgba(146, 64, 14, 0.1)'" 
               onmouseout="this.style.background='none'">×</button>
            <style>
                @keyframes slideInDown {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            </style>
        `;
        
        container.insertBefore(warning, container.firstChild);
    },

    /**
     * Criar fallback genérico
     */
    createGenericFallback: function(container, componentName, message) {
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'universal-generic-fallback';
        fallbackDiv.innerHTML = `
            <div style="
                padding: 60px 40px;
                text-align: center;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border: 2px dashed #cbd5e1;
                border-radius: 20px;
                color: #64748b;
                margin: 20px 0;
                animation: fadeInUp 0.4s ease-out;
            ">
                <div style="font-size: 72px; margin-bottom: 24px; filter: grayscale(0.3);">⚛️</div>
                <h3 style="margin: 0 0 16px 0; color: #475569; font-weight: 700; font-size: 1.5rem;">
                    ${componentName}
                </h3>
                <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #64748b; max-width: 500px; margin-left: auto; margin-right: auto;">
                    ${message}
                </p>
                <button onclick="window.location.reload()" style="
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white; border: none; padding: 12px 24px; border-radius: 10px;
                    font-size: 14px; font-weight: 600; cursor: pointer;
                    transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.3)'" 
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    🔄 Recarregar Página
                </button>
            </div>
            <style>
                @keyframes fadeInUp {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            </style>
        `;
        
        this.addFallbackWarning(container, message);
        container.appendChild(fallbackDiv);
    },

    /**
     * Configurar tratamento global de erros
     */
    setupGlobalErrorHandling: function() {
        // Capturar erros JavaScript globais
        window.addEventListener('error', (event) => {
            if (event.filename && event.filename.includes('react')) {
                this.log(`🚨 Erro JavaScript React: ${event.message} em ${event.filename}:${event.lineno}`, 'error');
            }
        });

        // Capturar promises rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && event.reason.message && event.reason.message.includes('React')) {
                this.log(`🚨 Promise rejeitada React: ${event.reason.message}`, 'error');
            }
        });
    },

    /**
     * Sistema de logging
     */
    log: function(message, level = 'info') {
        if (!this.config.enableDebugMode) return;

        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[UniversalReactInitializer ${timestamp}]`;
        
        switch (level) {
            case 'success':
                console.log(`%c${prefix} ${message}`, 'color: #10b981; font-weight: bold;');
                break;
            case 'warning':
                console.warn(`%c${prefix} ${message}`, 'color: #f59e0b; font-weight: bold;');
                break;
            case 'error':
                console.error(`%c${prefix} ${message}`, 'color: #ef4444; font-weight: bold;');
                break;
            default:
                console.log(`%c${prefix} ${message}`, 'color: #3b82f6; font-weight: bold;');
        }
    },

    /**
     * Diagnóstico do sistema
     */
    diagnose: function() {
        const diagnosis = {
            systemInitialized: this.state.initialized,
            dependenciesReady: this.state.dependenciesReady,
            reactAvailable: typeof React !== 'undefined',
            reactDOMAvailable: typeof ReactDOM !== 'undefined',
            reactVersion: typeof React !== 'undefined' ? React.version : null,
            componentsLoaded: Array.from(this.state.componentsLoaded),
            failedComponents: Array.from(this.state.failedComponents),
            availableComponents: this.getAvailableComponents()
        };

        console.group('🔍 Diagnóstico UniversalReactInitializer');
        console.table(diagnosis);
        console.groupEnd();

        return diagnosis;
    },

    /**
     * Obter componentes disponíveis
     */
    getAvailableComponents: function() {
        const components = [];
        for (const key in window) {
            if (key.endsWith('React') && typeof window[key] === 'function') {
                components.push(key);
            }
        }
        return components;
    },

    /**
     * Configurar dados Django globais
     */
    setDjangoData: function(data) {
        window.djangoData = data;
        this.log('📊 Dados Django configurados', 'info');
    }
};

// Função de conveniência global
window.initUniversalReactComponent = function(componentName, containerId, props, options) {
    return window.UniversalReactInitializer.initComponent(componentName, containerId, props, options);
};

// Auto-inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    window.UniversalReactInitializer.init().catch(error => {
        console.error('Falha na inicialização automática do UniversalReactInitializer:', error);
    });
});