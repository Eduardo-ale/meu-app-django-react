/**
 * ReactComponentInitializer - Sistema robusto de inicialização de componentes React
 * Corrige problemas de carregamento e garante renderização adequada
 */
window.ReactComponentInitializer = {
    
    // Configuração
    config: {
        maxRetries: 3,
        retryDelay: 1000,
        dependencyTimeout: 15000,
        enableDebugMode: true,
        fallbackEnabled: true
    },

    // Estado interno
    state: {
        initialized: false,
        dependenciesLoaded: false,
        componentsRegistry: new Map(),
        initializationQueue: new Set(),
        failedComponents: new Set()
    },

    /**
     * Inicializar o sistema
     */
    async initialize() {
        if (this.state.initialized) {
            this.log('✅ Sistema já inicializado', 'info');
            return true;
        }

        this.log('🚀 Inicializando ReactComponentInitializer...', 'info');
        
        try {
            // Verificar e garantir dependências React
            await this.ensureReactDependencies();
            
            // Configurar tratamento de erros
            this.setupErrorHandling();
            
            // Registrar componentes disponíveis
            this.registerAvailableComponents();
            
            this.state.initialized = true;
            this.log('✅ ReactComponentInitializer inicializado com sucesso', 'success');
            
            return true;
        } catch (error) {
            this.log(`❌ Falha na inicialização: ${error.message}`, 'error');
            throw error;
        }
    },

    /**
     * Garantir que dependências React estão carregadas adequadamente
     */
    async ensureReactDependencies() {
        this.log('🔍 Verificando dependências React...', 'info');
        
        // Verificar se React e ReactDOM já estão disponíveis
        if (this.areReactDependenciesLoaded()) {
            this.state.dependenciesLoaded = true;
            this.log('✅ Dependências React já carregadas', 'success');
            this.validateReactEnvironment();
            return;
        }

        // Aguardar carregamento das dependências
        try {
            await this.waitForDependencies(['React', 'ReactDOM'], this.config.dependencyTimeout);
            this.state.dependenciesLoaded = true;
            this.log('✅ Dependências React carregadas', 'success');
            this.validateReactEnvironment();
        } catch (error) {
            this.log('⚠️ Tentando carregar dependências via CDN...', 'warning');
            await this.loadReactViaCDN();
            this.state.dependenciesLoaded = true;
            this.validateReactEnvironment();
        }
    },

    /**
     * Verificar se dependências React estão carregadas
     */
    areReactDependenciesLoaded() {
        const reactLoaded = typeof React !== 'undefined' && React.version !== undefined;
        const reactDOMLoaded = typeof ReactDOM !== 'undefined';
        
        if (reactLoaded && reactDOMLoaded) {
            // Verificar métodos essenciais
            const hasCreateElement = typeof React.createElement === 'function';
            const hasRender = typeof ReactDOM.render === 'function' || typeof ReactDOM.createRoot === 'function';
            
            return hasCreateElement && hasRender;
        }
        
        return false;
    },

    /**
     * Validar ambiente React
     */
    validateReactEnvironment() {
        const validation = {
            react: typeof React !== 'undefined',
            reactDOM: typeof ReactDOM !== 'undefined',
            createElement: typeof React?.createElement === 'function',
            render: typeof ReactDOM?.render === 'function',
            createRoot: typeof ReactDOM?.createRoot === 'function',
            version: React?.version
        };

        this.log(`🔍 Validação do ambiente React:`, 'info');
        console.table(validation);

        // Verificar se há problemas críticos
        if (!validation.react || !validation.reactDOM || !validation.createElement) {
            throw new Error('Ambiente React não está funcionalmente completo');
        }

        if (!validation.render && !validation.createRoot) {
            throw new Error('Nenhum método de renderização disponível no ReactDOM');
        }

        this.log(`✅ Ambiente React validado - Versão: ${validation.version}`, 'success');
    },

    /**
     * Aguardar carregamento de dependências
     */
    waitForDependencies(dependencies, timeout = 10000) {
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
     * Carregar React via CDN como fallback
     */
    async loadReactViaCDN() {
        return new Promise((resolve, reject) => {
            // Verificar se já existe script React
            if (document.querySelector('script[src*="react"]')) {
                this.log('⚠️ Scripts React já existem, aguardando carregamento...', 'warning');
                setTimeout(() => {
                    if (this.areReactDependenciesLoaded()) {
                        resolve();
                    } else {
                        reject(new Error('React não carregou mesmo com scripts presentes'));
                    }
                }, 3000);
                return;
            }

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
     * Registrar componentes disponíveis
     */
    registerAvailableComponents() {
        const components = [];
        
        // Procurar por componentes React no escopo global
        for (const key in window) {
            if (key.endsWith('React') && typeof window[key] === 'function') {
                this.state.componentsRegistry.set(key, {
                    name: key,
                    component: window[key],
                    loaded: true,
                    loadTime: Date.now()
                });
                components.push(key);
            }
        }
        
        this.log(`📦 Componentes registrados: ${components.join(', ') || 'Nenhum'}`, 'info');
    },

    /**
     * Inicializar componente React de forma robusta
     */
    async initComponent(componentName, containerId, props = {}, options = {}) {
        const defaultOptions = {
            enableErrorBoundary: true,
            showLoadingIndicator: true,
            fallbackMessage: 'Componente React não disponível. Usando versão HTML.',
            retryAttempts: this.config.maxRetries,
            onSuccess: null,
            onError: null,
            onFallback: null
        };

        const config = { ...defaultOptions, ...options };
        
        this.log(`🔧 Inicializando componente ${componentName}...`, 'info');

        // Garantir que o sistema está inicializado
        if (!this.state.initialized) {
            await this.initialize();
        }

        // Verificar se dependências estão prontas
        if (!this.state.dependenciesLoaded) {
            await this.ensureReactDependencies();
        }

        return this.performComponentInitialization(componentName, containerId, props, config);
    },

    /**
     * Executar inicialização do componente
     */
    async performComponentInitialization(componentName, containerId, props, config) {
        const container = document.getElementById(containerId);
        
        if (!container) {
            const error = new Error(`Container '${containerId}' não encontrado`);
            this.log(`❌ ${error.message}`, 'error');
            throw error;
        }

        // Adicionar à fila de inicialização
        this.state.initializationQueue.add(componentName);

        try {
            // Mostrar indicador de carregamento
            if (config.showLoadingIndicator) {
                this.showLoadingIndicator(container, componentName);
            }

            // Tentar inicializar o componente com retry
            const success = await this.attemptComponentInitializationWithRetry(
                componentName, 
                container, 
                props, 
                config
            );

            if (success) {
                this.log(`✅ Componente ${componentName} inicializado com sucesso`, 'success');
                
                if (config.onSuccess) {
                    config.onSuccess(componentName, container);
                }
                
                return true;
            } else {
                this.handleComponentFailure(componentName, container, config);
                return false;
            }

        } catch (error) {
            this.log(`❌ Erro ao inicializar ${componentName}: ${error.message}`, 'error');
            this.handleComponentFailure(componentName, container, config, error);
            
            if (config.onError) {
                config.onError(error, componentName, container);
            }
            
            return false;
        } finally {
            this.state.initializationQueue.delete(componentName);
        }
    },

    /**
     * Tentar inicializar componente com retry
     */
    async attemptComponentInitializationWithRetry(componentName, container, props, config) {
        let lastError = null;
        
        for (let attempt = 0; attempt <= config.retryAttempts; attempt++) {
            try {
                if (attempt > 0) {
                    this.log(`🔄 Tentativa ${attempt + 1}/${config.retryAttempts + 1} para ${componentName}`, 'info');
                    await this.delay(this.config.retryDelay * attempt);
                }

                const success = await this.renderComponent(componentName, container, props, config);
                
                if (success) {
                    return true;
                }
                
            } catch (error) {
                lastError = error;
                this.log(`⚠️ Tentativa ${attempt + 1} falhou: ${error.message}`, 'warning');
            }
        }

        throw lastError || new Error(`Falha após ${config.retryAttempts + 1} tentativas`);
    },

    /**
     * Renderizar componente React
     */
    async renderComponent(componentName, container, props, config) {
        // Verificar se o componente existe
        if (!window[componentName]) {
            throw new Error(`Componente ${componentName} não encontrado no escopo global`);
        }

        // Verificar se React está disponível
        if (!this.areReactDependenciesLoaded()) {
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
        try {
            if (ReactDOM.createRoot) {
                // React 18+
                const root = ReactDOM.createRoot(container);
                root.render(componentElement);
                this.log(`✅ Componente renderizado com React 18+ (createRoot)`, 'success');
            } else if (ReactDOM.render) {
                // React 17 e anteriores
                ReactDOM.render(componentElement, container);
                this.log(`✅ Componente renderizado com React 17- (render)`, 'success');
            } else {
                throw new Error('Nenhum método de renderização disponível no ReactDOM');
            }
        } catch (renderError) {
            this.log(`❌ Erro na renderização: ${renderError.message}`, 'error');
            throw renderError;
        }

        // Remover indicador de carregamento
        this.hideLoadingIndicator(container);
        
        // Registrar componente como carregado
        this.state.componentsRegistry.set(componentName, {
            name: componentName,
            component: window[componentName],
            loaded: true,
            loadTime: Date.now(),
            container: container
        });

        return true;
    },

    /**
     * Preparar props do componente
     */
    prepareComponentProps(customProps) {
        const standardProps = {
            // CSRF Token
            csrfToken: this.getCSRFToken(),
            
            // Data atual
            dataAtual: new Date().toISOString().split('T')[0],
            
            // Informações do usuário
            usuario: this.getUserInfo(),
            
            // URLs da aplicação
            urls: this.getAppUrls()
        };

        return { ...standardProps, ...customProps };
    },

    /**
     * Obter CSRF token
     */
    getCSRFToken() {
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
    getUserInfo() {
        if (window.djangoData && window.djangoData.user) {
            return window.djangoData.user;
        }
        
        if (window.REACT_CONFIG && window.REACT_CONFIG.user) {
            return window.REACT_CONFIG.user;
        }
        
        return null;
    },

    /**
     * Obter URLs da aplicação
     */
    getAppUrls() {
        if (window.djangoData && window.djangoData.urls) {
            return window.djangoData.urls;
        }
        
        if (window.REACT_CONFIG && window.REACT_CONFIG.urls) {
            return window.REACT_CONFIG.urls;
        }
        
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
    handleComponentFailure(componentName, container, config, error = null) {
        this.state.failedComponents.add(componentName);
        this.hideLoadingIndicator(container);
        
        // Mostrar fallback
        this.showFallback(container, componentName, config.fallbackMessage);
        
        if (config.onFallback) {
            config.onFallback(componentName, container);
        }
    },

    /**
     * Mostrar indicador de carregamento aprimorado
     */
    showLoadingIndicator(container, componentName) {
        const existingIndicator = container.querySelector('.react-component-loading');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'react-component-loading';
        loadingDiv.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 50px 30px;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border: 2px dashed #cbd5e1;
                border-radius: 20px;
                margin: 20px 0;
                animation: fadeIn 0.3s ease-in;
                position: relative;
                overflow: hidden;
            ">
                <div style="
                    position: absolute;
                    top: -30px;
                    right: -30px;
                    width: 120px;
                    height: 120px;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
                    border-radius: 50%;
                "></div>
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 5px solid #e2e8f0;
                    border-top: 5px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 25px;
                    position: relative;
                    z-index: 2;
                "></div>
                <div style="
                    color: #64748b;
                    font-size: 18px;
                    font-weight: 700;
                    text-align: center;
                    margin-bottom: 10px;
                    position: relative;
                    z-index: 2;
                ">
                    ⚛️ Carregando ${componentName}
                </div>
                <div style="
                    color: #94a3b8;
                    font-size: 14px;
                    text-align: center;
                    position: relative;
                    z-index: 2;
                ">
                    Inicializando interface interativa...
                </div>
                <div style="
                    width: 100%;
                    max-width: 300px;
                    height: 4px;
                    background: #e2e8f0;
                    border-radius: 2px;
                    margin-top: 20px;
                    overflow: hidden;
                    position: relative;
                    z-index: 2;
                ">
                    <div style="
                        width: 0%;
                        height: 100%;
                        background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                        border-radius: 2px;
                        animation: progressFill 3s ease-in-out infinite;
                    "></div>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes progressFill {
                    0% { width: 0%; }
                    50% { width: 80%; }
                    100% { width: 100%; }
                }
            </style>
        `;
        
        container.insertBefore(loadingDiv, container.firstChild);
    },

    /**
     * Ocultar indicador de carregamento
     */
    hideLoadingIndicator(container) {
        const indicator = container.querySelector('.react-component-loading');
        if (indicator) {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateY(-20px)';
            setTimeout(() => indicator.remove(), 300);
        }
    },

    /**
     * Mostrar fallback
     */
    showFallback(container, componentName, message) {
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
    addFallbackWarning(container, message) {
        if (container.querySelector('.react-fallback-warning')) {
            return;
        }

        const warning = document.createElement('div');
        warning.className = 'react-fallback-warning';
        warning.style.cssText = `
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #f59e0b;
            color: #92400e;
            padding: 18px 22px;
            margin-bottom: 25px;
            border-radius: 15px;
            font-size: 15px;
            display: flex;
            align-items: flex-start;
            gap: 15px;
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.25);
            animation: slideInDown 0.4s ease-out;
        `;
        
        warning.innerHTML = `
            <div style="font-size: 24px; flex-shrink: 0; margin-top: 2px;">⚠️</div>
            <div style="flex: 1;">
                <div style="font-weight: 700; margin-bottom: 6px; color: #78350f; font-size: 16px;">
                    Modo de Compatibilidade Ativado
                </div>
                <div style="line-height: 1.5; color: #92400e; margin-bottom: 10px;">
                    ${message}
                </div>
                <div style="font-size: 13px; color: #a16207; font-style: italic; display: flex; align-items: center; gap: 6px;">
                    💡 <span>A funcionalidade permanece disponível através da interface HTML tradicional.</span>
                </div>
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: none; border: none; color: #92400e; cursor: pointer;
                font-size: 20px; padding: 6px; border-radius: 6px;
                transition: background 0.2s ease; flex-shrink: 0;
                font-weight: bold;
            " onmouseover="this.style.background='rgba(146, 64, 14, 0.15)'" 
               onmouseout="this.style.background='none'" title="Fechar aviso">×</button>
            <style>
                @keyframes slideInDown {
                    0% { opacity: 0; transform: translateY(-25px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            </style>
        `;
        
        container.insertBefore(warning, container.firstChild);
    },

    /**
     * Criar fallback genérico
     */
    createGenericFallback(container, componentName, message) {
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'react-generic-fallback';
        fallbackDiv.innerHTML = `
            <div style="
                padding: 70px 50px;
                text-align: center;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border: 3px dashed #cbd5e1;
                border-radius: 25px;
                color: #64748b;
                margin: 25px 0;
                position: relative;
                overflow: hidden;
                animation: fadeInUp 0.5s ease-out;
            ">
                <div style="
                    position: absolute;
                    top: -40px;
                    right: -40px;
                    width: 150px;
                    height: 150px;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
                    border-radius: 50%;
                "></div>
                <div style="font-size: 80px; margin-bottom: 30px; filter: grayscale(0.2); position: relative; z-index: 2;">⚛️</div>
                <h3 style="margin: 0 0 20px 0; color: #475569; font-weight: 800; font-size: 1.8rem; position: relative; z-index: 2;">
                    ${componentName}
                </h3>
                <p style="margin: 0 0 30px 0; font-size: 17px; line-height: 1.6; color: #64748b; max-width: 600px; margin-left: auto; margin-right: auto; position: relative; z-index: 2;">
                    ${message}
                </p>
                <div style="display: flex; justify-content: center; gap: 20px; position: relative; z-index: 2;">
                    <button onclick="window.location.reload()" style="
                        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                        color: white; border: none; padding: 15px 30px; border-radius: 12px;
                        font-size: 15px; font-weight: 700; cursor: pointer;
                        transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 10px;
                        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
                    " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(59, 130, 246, 0.4)'" 
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(59, 130, 246, 0.3)'">
                        🔄 Recarregar Página
                    </button>
                    <button onclick="this.parentElement.parentElement.style.display='none'" style="
                        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
                        color: white; border: none; padding: 15px 30px; border-radius: 12px;
                        font-size: 15px; font-weight: 700; cursor: pointer;
                        transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 10px;
                        box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
                    " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(107, 114, 128, 0.4)'" 
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(107, 114, 128, 0.3)'">
                        ✕ Ocultar Aviso
                    </button>
                </div>
            </div>
            <style>
                @keyframes fadeInUp {
                    0% { opacity: 0; transform: translateY(40px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            </style>
        `;
        
        this.addFallbackWarning(container, message);
        container.appendChild(fallbackDiv);
    },

    /**
     * Configurar tratamento de erros
     */
    setupErrorHandling() {
        // Capturar erros JavaScript relacionados ao React
        window.addEventListener('error', (event) => {
            if (event.filename && (event.filename.includes('react') || event.filename.includes('React'))) {
                this.log(`🚨 Erro JavaScript React: ${event.message} em ${event.filename}:${event.lineno}`, 'error');
            }
        });

        // Capturar promises rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && event.reason.message && 
                (event.reason.message.includes('React') || event.reason.message.includes('Component'))) {
                this.log(`🚨 Promise rejeitada React: ${event.reason.message}`, 'error');
            }
        });
    },

    /**
     * Utilitário para delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Sistema de logging aprimorado
     */
    log(message, level = 'info') {
        if (!this.config.enableDebugMode) return;

        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[ReactComponentInitializer ${timestamp}]`;
        
        const styles = {
            success: 'color: #10b981; font-weight: bold; background: #f0fdf4; padding: 2px 6px; border-radius: 4px;',
            warning: 'color: #f59e0b; font-weight: bold; background: #fffbeb; padding: 2px 6px; border-radius: 4px;',
            error: 'color: #ef4444; font-weight: bold; background: #fef2f2; padding: 2px 6px; border-radius: 4px;',
            info: 'color: #3b82f6; font-weight: bold; background: #eff6ff; padding: 2px 6px; border-radius: 4px;'
        };
        
        const style = styles[level] || styles.info;
        
        switch (level) {
            case 'success':
                console.log(`%c${prefix} ${message}`, style);
                break;
            case 'warning':
                console.warn(`%c${prefix} ${message}`, style);
                break;
            case 'error':
                console.error(`%c${prefix} ${message}`, style);
                break;
            default:
                console.log(`%c${prefix} ${message}`, style);
        }
    },

    /**
     * Diagnóstico completo do sistema
     */
    diagnose() {
        const diagnosis = {
            systemInitialized: this.state.initialized,
            dependenciesLoaded: this.state.dependenciesLoaded,
            reactAvailable: typeof React !== 'undefined',
            reactDOMAvailable: typeof ReactDOM !== 'undefined',
            reactVersion: typeof React !== 'undefined' ? React.version : null,
            componentsInRegistry: Array.from(this.state.componentsRegistry.keys()),
            componentsInitializing: Array.from(this.state.initializationQueue),
            failedComponents: Array.from(this.state.failedComponents),
            availableComponents: this.getAvailableComponents(),
            supportServices: {
                ReactErrorBoundary: typeof window.ReactErrorBoundary !== 'undefined',
                ReactDebugger: typeof window.ReactDebugger !== 'undefined',
                SafeComponentLoader: typeof window.SafeComponentLoader !== 'undefined'
            }
        };

        console.group('🔍 Diagnóstico ReactComponentInitializer');
        console.table(diagnosis);
        
        if (diagnosis.failedComponents.length > 0) {
            console.warn('⚠️ Componentes com falha:', diagnosis.failedComponents);
        }
        
        if (diagnosis.componentsInitializing.length > 0) {
            console.info('🔄 Componentes inicializando:', diagnosis.componentsInitializing);
        }
        
        console.groupEnd();

        return diagnosis;
    },

    /**
     * Obter componentes disponíveis
     */
    getAvailableComponents() {
        const components = [];
        for (const key in window) {
            if (key.endsWith('React') && typeof window[key] === 'function') {
                components.push(key);
            }
        }
        return components;
    }
};

// Função de conveniência global
window.initReactComponent = function(componentName, containerId, props, options) {
    return window.ReactComponentInitializer.initComponent(componentName, containerId, props, options);
};

// Auto-inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    window.ReactComponentInitializer.initialize().catch(error => {
        console.error('Falha na inicialização automática do ReactComponentInitializer:', error);
    });
});