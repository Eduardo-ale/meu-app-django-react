/**
 * SafeComponentLoader - Sistema de carregamento seguro de componentes React
 * Implementa fallback graceful e tratamento de erros
 */
window.SafeComponentLoader = {
    
    /**
     * Renderizar componente de forma segura com tratamento de erros
     * @param {string} componentName - Nome do componente (ex: 'CriarUnidadeReact')
     * @param {object} props - Props para passar ao componente
     * @param {string} containerId - ID do elemento container
     * @param {object} options - Opções adicionais
     */
    safeRenderComponent: function(componentName, props = {}, containerId, options = {}) {
        const defaultOptions = {
            showLoadingIndicator: true,
            fallbackMessage: 'Componente React não disponível. Usando versão HTML.',
            retryAttempts: 1,
            retryDelay: 1000,
            onSuccess: null,
            onError: null,
            onFallback: null
        };

        const config = { ...defaultOptions, ...options };
        const container = document.getElementById(containerId);

        if (!container) {
            ReactDebugger.logWarning(`Container '${containerId}' não encontrado para componente ${componentName}`);
            return false;
        }

        // Mostrar indicador de carregamento se habilitado
        if (config.showLoadingIndicator) {
            this._showLoadingIndicator(container);
        }

        // Tentar renderizar o componente
        this._attemptRender(componentName, props, container, config, 0);
    },

    /**
     * Tentar renderizar componente com retry
     */
    _attemptRender: function(componentName, props, container, config, attempt) {
        const timerName = window.ReactDebugger ? window.ReactDebugger.startPerformanceTimer(componentName) : null;

        try {
            // Verificar se o componente existe
            if (!window[componentName]) {
                throw new Error(`Componente ${componentName} não encontrado no escopo global`);
            }

            // Verificar se React está disponível
            if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
                throw new Error('React ou ReactDOM não estão disponíveis');
            }

            // Criar elemento - com ou sem ErrorBoundary
            let componentElement;
            if (window.ReactErrorBoundary) {
                componentElement = React.createElement(
                    window.ReactErrorBoundary,
                    { componentName: componentName },
                    React.createElement(window[componentName], props)
                );
            } else {
                // Renderizar sem ErrorBoundary se não estiver disponível
                console.warn(`⚠️ ReactErrorBoundary não disponível para ${componentName}. Renderizando sem proteção de erro.`);
                componentElement = React.createElement(window[componentName], props);
            }

            // Renderizar o componente usando método apropriado
            if (ReactDOM.createRoot) {
                // React 18+
                const root = ReactDOM.createRoot(container);
                root.render(componentElement);
            } else {
                // React 17 e anteriores
                ReactDOM.render(componentElement, container);
            }

            // Log de sucesso
            if (window.ReactDebugger) {
                window.ReactDebugger.logComponentLoad(componentName, true);
                window.ReactDebugger.endPerformanceTimer(timerName);
            }

            // Callback de sucesso
            if (config.onSuccess) {
                config.onSuccess(componentName, container);
            }

            return true;

        } catch (error) {
            if (window.ReactDebugger) {
                window.ReactDebugger.endPerformanceTimer(timerName);
                window.ReactDebugger.logComponentLoad(componentName, false, error);
            }

            // Tentar novamente se ainda há tentativas
            if (attempt < config.retryAttempts) {
                if (window.ReactDebugger) {
                    window.ReactDebugger.logInfo(`Tentando novamente carregar ${componentName} (tentativa ${attempt + 2}/${config.retryAttempts + 1})`);
                }
                
                setTimeout(() => {
                    this._attemptRender(componentName, props, container, config, attempt + 1);
                }, config.retryDelay);
                
                return;
            }

            // Callback de erro
            if (config.onError) {
                config.onError(error, componentName, container);
            }

            // Mostrar fallback
            this._showFallback(container, componentName, config.fallbackMessage);
            
            // Callback de fallback
            if (config.onFallback) {
                config.onFallback(componentName, container);
            }

            return false;
        }
    },

    /**
     * Mostrar indicador de carregamento aprimorado
     */
    _showLoadingIndicator: function(container) {
        // Remover indicador existente se houver
        const existingIndicator = container.querySelector('.react-loading-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'react-loading-indicator';
        loadingDiv.innerHTML = `
            <div class="loading-container" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 30px 20px;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border: 2px dashed #cbd5e1;
                border-radius: 12px;
                margin: 10px 0;
                animation: fadeIn 0.3s ease-in;
            ">
                <div class="loading-spinner" style="
                    width: 32px;
                    height: 32px;
                    border: 3px solid #e2e8f0;
                    border-top: 3px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 15px;
                "></div>
                <div class="loading-text" style="
                    color: #64748b;
                    font-size: 14px;
                    font-weight: 500;
                    text-align: center;
                    margin-bottom: 8px;
                ">
                    ⚛️ Carregando componente React...
                </div>
                <div class="loading-subtext" style="
                    color: #94a3b8;
                    font-size: 12px;
                    text-align: center;
                ">
                    Aguarde enquanto inicializamos a interface
                </div>
                <div class="loading-progress" style="
                    width: 100%;
                    max-width: 200px;
                    height: 3px;
                    background: #e2e8f0;
                    border-radius: 2px;
                    margin-top: 15px;
                    overflow: hidden;
                ">
                    <div class="progress-bar" style="
                        width: 0%;
                        height: 100%;
                        background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                        border-radius: 2px;
                        animation: progressFill 2s ease-in-out infinite;
                    "></div>
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
                @keyframes progressFill {
                    0% { width: 0%; }
                    50% { width: 70%; }
                    100% { width: 100%; }
                }
            </style>
        `;
        
        // Inserir no início do container
        container.insertBefore(loadingDiv, container.firstChild);
        
        // Log do indicador de carregamento
        if (window.ReactDebugger) {
            window.ReactDebugger.logDebug('🔄 Indicador de carregamento exibido');
        }
    },

    /**
     * Mostrar fallback quando componente falha
     */
    _showFallback: function(container, componentName, fallbackMessage) {
        // Remover indicador de carregamento
        const loadingIndicator = container.querySelector('.react-loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }

        // Procurar por container de fallback existente
        const fallbackContainer = container.querySelector('.fallback-container');
        
        if (fallbackContainer) {
            // Mostrar fallback existente
            fallbackContainer.style.display = 'block';
            
            // Adicionar mensagem de aviso
            this._addFallbackWarning(container, fallbackMessage);
            
            if (window.ReactDebugger) {
                window.ReactDebugger.logInfo(`Exibindo fallback HTML para ${componentName}`);
            }
        } else {
            // Criar fallback genérico se não existir
            this._createGenericFallback(container, componentName, fallbackMessage);
        }
    },

    /**
     * Adicionar mensagem de aviso aprimorada sobre fallback
     */
    _addFallbackWarning: function(container, message) {
        // Verificar se já existe aviso
        if (container.querySelector('.react-fallback-warning')) {
            return;
        }

        const warning = document.createElement('div');
        warning.className = 'react-fallback-warning';
        warning.style.cssText = `
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #f59e0b;
            color: #92400e;
            padding: 15px 18px;
            margin-bottom: 20px;
            border-radius: 12px;
            font-size: 14px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
            animation: slideInDown 0.3s ease-out;
            position: relative;
            overflow: hidden;
        `;
        
        warning.innerHTML = `
            <div style="
                font-size: 18px;
                flex-shrink: 0;
                margin-top: 1px;
            ">⚠️</div>
            <div style="flex: 1;">
                <div style="
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: #78350f;
                ">Modo de Compatibilidade Ativado</div>
                <div style="
                    line-height: 1.4;
                    color: #92400e;
                ">${message}</div>
                <div style="
                    font-size: 12px;
                    color: #a16207;
                    margin-top: 8px;
                    font-style: italic;
                ">💡 A funcionalidade permanece disponível através da interface HTML tradicional.</div>
            </div>
            <button onclick="this.parentElement.style.display='none'" style="
                background: none;
                border: none;
                color: #92400e;
                cursor: pointer;
                font-size: 16px;
                padding: 4px;
                border-radius: 4px;
                transition: background 0.2s ease;
                flex-shrink: 0;
            " onmouseover="this.style.background='rgba(146, 64, 14, 0.1)'" onmouseout="this.style.background='none'">×</button>
            <style>
                @keyframes slideInDown {
                    0% { 
                        opacity: 0; 
                        transform: translateY(-20px); 
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
            </style>
        `;
        
        container.insertBefore(warning, container.firstChild);
        
        // Log da mensagem de aviso
        if (window.ReactDebugger) {
            window.ReactDebugger.logWarning(`⚠️ Mensagem de fallback exibida: ${message}`);
        }
    },

    /**
     * Criar fallback genérico aprimorado
     */
    _createGenericFallback: function(container, componentName, message) {
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'generic-fallback';
        fallbackDiv.style.cssText = `
            padding: 50px 30px;
            text-align: center;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 2px dashed #cbd5e1;
            border-radius: 16px;
            color: #64748b;
            margin: 20px 0;
            position: relative;
            overflow: hidden;
            animation: fadeInUp 0.4s ease-out;
        `;
        
        fallbackDiv.innerHTML = `
            <div style="
                position: absolute;
                top: -20px;
                right: -20px;
                width: 100px;
                height: 100px;
                background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
                border-radius: 50%;
            "></div>
            <div style="
                font-size: 64px; 
                margin-bottom: 20px;
                filter: grayscale(0.3);
                position: relative;
                z-index: 2;
            ">⚛️</div>
            <h3 style="
                margin: 0 0 12px 0; 
                color: #475569;
                font-weight: 600;
                font-size: 1.4rem;
                position: relative;
                z-index: 2;
            ">Componente ${componentName}</h3>
            <p style="
                margin: 0 0 20px 0; 
                font-size: 15px;
                line-height: 1.5;
                color: #64748b;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
                position: relative;
                z-index: 2;
            ">${message}</p>
            <div style="
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-top: 25px;
                position: relative;
                z-index: 2;
            ">
                <button onclick="window.location.reload()" style="
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    🔄 Recarregar Página
                </button>
                <button onclick="this.parentElement.parentElement.style.display='none'" style="
                    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(107, 114, 128, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    ✕ Ocultar Aviso
                </button>
            </div>
            <style>
                @keyframes fadeInUp {
                    0% { 
                        opacity: 0; 
                        transform: translateY(30px); 
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
            </style>
        `;
        
        // Adicionar mensagem de aviso também
        this._addFallbackWarning(container, message);
        
        container.appendChild(fallbackDiv);
        
        if (window.ReactDebugger) {
            window.ReactDebugger.logInfo(`📦 Fallback genérico criado para ${componentName}`);
        }
    },

    /**
     * Verificar se componente está disponível
     */
    isComponentAvailable: function(componentName) {
        return typeof window[componentName] === 'function';
    },

    /**
     * Verificar se React está disponível
     */
    isReactAvailable: function() {
        return typeof React !== 'undefined' && typeof ReactDOM !== 'undefined';
    },

    /**
     * Listar componentes disponíveis
     */
    listAvailableComponents: function() {
        const components = [];
        
        for (const key in window) {
            if (key.endsWith('React') && typeof window[key] === 'function') {
                components.push(key);
            }
        }
        
        if (window.ReactDebugger) {
            window.ReactDebugger.logInfo('Componentes React disponíveis:', components);
        }
        return components;
    },

    /**
     * Verificar status de componente específico
     */
    checkComponentStatus: function(componentName) {
        const status = {
            name: componentName,
            exists: this.isComponentAvailable(componentName),
            type: typeof window[componentName],
            isReactComponent: false,
            hasRender: false,
            dependencies: {
                react: this.isReactAvailable(),
                errorBoundary: typeof window.ReactErrorBoundary !== 'undefined',
                debugger: typeof window.ReactDebugger !== 'undefined'
            }
        };

        // Verificar se é um componente React válido
        if (status.exists && typeof window[componentName] === 'function') {
            try {
                const component = window[componentName];
                status.isReactComponent = true;
                status.hasRender = typeof component.prototype?.render === 'function' || 
                                  component.toString().includes('React.createElement');
            } catch (e) {
                status.error = e.message;
            }
        }

        return status;
    },

    /**
     * Verificar múltiplos componentes
     */
    checkMultipleComponents: function(componentNames) {
        const results = {};
        componentNames.forEach(name => {
            results[name] = this.checkComponentStatus(name);
        });
        return results;
    },

    /**
     * Detectar componentes ausentes em uma página
     */
    detectMissingComponents: function() {
        const missingComponents = [];
        const containers = document.querySelectorAll('[id*="react"], [class*="react"]');
        
        containers.forEach(container => {
            const id = container.id;
            const classes = container.className;
            
            // Tentar inferir nome do componente baseado no ID ou classe
            let possibleComponentName = null;
            
            if (id.includes('react')) {
                possibleComponentName = this._inferComponentName(id);
            } else if (classes.includes('react')) {
                possibleComponentName = this._inferComponentName(classes);
            }
            
            if (possibleComponentName && !this.isComponentAvailable(possibleComponentName)) {
                missingComponents.push({
                    componentName: possibleComponentName,
                    containerId: id,
                    containerClasses: classes,
                    element: container
                });
            }
        });

        if (missingComponents.length > 0 && window.ReactDebugger) {
            window.ReactDebugger.logWarning(`🔍 Componentes ausentes detectados:`, missingComponents);
        }

        return missingComponents;
    },

    /**
     * Inferir nome do componente baseado em ID ou classe
     */
    _inferComponentName: function(str) {
        // Converter kebab-case ou snake_case para PascalCase
        const cleaned = str.replace(/[-_]/g, ' ')
                          .replace(/react/gi, '')
                          .trim()
                          .split(' ')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join('');
        
        return cleaned ? cleaned + 'React' : null;
    },

    /**
     * Monitorar carregamento de componentes
     */
    monitorComponentLoading: function(componentNames, callback, timeout = 10000) {
        const startTime = Date.now();
        const checkInterval = 500;
        const results = {};
        
        const monitor = () => {
            let allLoaded = true;
            
            componentNames.forEach(name => {
                if (!results[name]) {
                    if (this.isComponentAvailable(name)) {
                        results[name] = {
                            loaded: true,
                            loadTime: Date.now() - startTime
                        };
                        if (window.ReactDebugger) {
                            window.ReactDebugger.logInfo(`✅ Componente ${name} carregado em ${results[name].loadTime}ms`);
                        }
                    } else {
                        allLoaded = false;
                    }
                }
            });
            
            if (allLoaded) {
                callback(results, 'success');
                return;
            }
            
            if (Date.now() - startTime > timeout) {
                // Marcar componentes não carregados
                componentNames.forEach(name => {
                    if (!results[name]) {
                        results[name] = {
                            loaded: false,
                            error: 'Timeout'
                        };
                    }
                });
                callback(results, 'timeout');
                return;
            }
            
            setTimeout(monitor, checkInterval);
        };
        
        monitor();
    },

    /**
     * Criar indicador de status de componente
     */
    createComponentStatusIndicator: function(componentName, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const status = this.checkComponentStatus(componentName);
        const indicator = document.createElement('div');
        indicator.className = 'component-status-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            cursor: pointer;
        `;

        if (status.exists && status.isReactComponent) {
            indicator.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            indicator.style.color = 'white';
            indicator.innerHTML = `✅ ${componentName} Ativo`;
        } else {
            indicator.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            indicator.style.color = 'white';
            indicator.innerHTML = `⚠️ ${componentName} Fallback`;
        }

        // Remover após 5 segundos
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.opacity = '0';
                indicator.style.transform = 'translateX(100%)';
                setTimeout(() => indicator.remove(), 300);
            }
        }, 5000);

        // Clique para remover
        indicator.addEventListener('click', () => {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateX(100%)';
            setTimeout(() => indicator.remove(), 300);
        });

        document.body.appendChild(indicator);
    },

    /**
     * Diagnóstico do ambiente React
     */
    diagnoseEnvironment: function() {
        const diagnosis = {
            reactAvailable: this.isReactAvailable(),
            reactVersion: typeof React !== 'undefined' ? React.version : null,
            reactDOMAvailable: typeof ReactDOM !== 'undefined',
            errorBoundaryAvailable: typeof window.ReactErrorBoundary !== 'undefined',
            debuggerAvailable: typeof window.ReactDebugger !== 'undefined',
            availableComponents: this.listAvailableComponents(),
            missingComponents: this.detectMissingComponents(),
            environment: window.ReactDebugger ? window.ReactDebugger.getEnvironmentInfo() : null
        };

        console.group('🔍 Diagnóstico do Ambiente React');
        console.table(diagnosis);
        
        if (diagnosis.missingComponents.length > 0) {
            console.warn('⚠️ Componentes ausentes detectados:', diagnosis.missingComponents);
        }
        
        console.groupEnd();

        return diagnosis;
    }
};

// Função de conveniência global
window.safeRenderComponent = window.SafeComponentLoader.safeRenderComponent.bind(window.SafeComponentLoader);