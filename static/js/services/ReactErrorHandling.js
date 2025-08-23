/**
 * ReactErrorHandling - Sistema integrado de tratamento de erros para React
 * Integra ErrorBoundary, SafeComponentLoader e ReactDebugger
 */
(function() {
    'use strict';

    /**
     * Inicializar sistema de tratamento de erros
     */
    function initializeErrorHandling() {
        // Verificar se todos os componentes necessários estão disponíveis
        if (typeof window.ReactDebugger === 'undefined') {
            console.error('❌ ReactDebugger não encontrado. Carregue ReactDebugger.js primeiro.');
            return false;
        }

        if (typeof window.SafeComponentLoader === 'undefined') {
            console.error('❌ SafeComponentLoader não encontrado. Carregue SafeComponentLoader.js primeiro.');
            return false;
        }

        if (typeof window.ReactErrorBoundary === 'undefined') {
            console.error('❌ ReactErrorBoundary não encontrado. Carregue ReactErrorBoundary.js primeiro.');
            return false;
        }

        ReactDebugger.logInfo('🛡️ Sistema de tratamento de erros React inicializado com sucesso');
        return true;
    }

    /**
     * Configuração global de tratamento de erros
     */
    window.ReactErrorHandling = {
        
        /**
         * Inicializar sistema completo
         */
        init: function(config = {}) {
            const defaultConfig = {
                enableGlobalErrorHandling: true,
                enablePerformanceMonitoring: true,
                enableNetworkErrorTracking: true,
                fallbackMessage: 'Componente React não disponível. Usando versão HTML.',
                retryAttempts: 1,
                retryDelay: 1000
            };

            this.config = { ...defaultConfig, ...config };

            if (!initializeErrorHandling()) {
                return false;
            }

            // Configurar tratamento global de erros se habilitado
            if (this.config.enableGlobalErrorHandling) {
                this._setupGlobalErrorHandling();
            }

            // Configurar monitoramento de performance se habilitado
            if (this.config.enablePerformanceMonitoring) {
                this._setupPerformanceMonitoring();
            }

            // Configurar rastreamento de erros de rede se habilitado
            if (this.config.enableNetworkErrorTracking) {
                this._setupNetworkErrorTracking();
            }

            return true;
        },

        /**
         * Renderizar componente com tratamento completo de erros
         */
        renderComponent: function(componentName, props = {}, containerId, options = {}) {
            const renderOptions = {
                fallbackMessage: this.config.fallbackMessage,
                retryAttempts: this.config.retryAttempts,
                retryDelay: this.config.retryDelay,
                ...options
            };

            return window.SafeComponentLoader.safeRenderComponent(
                componentName, 
                props, 
                containerId, 
                renderOptions
            );
        },

        /**
         * Configurar tratamento global de erros JavaScript
         */
        _setupGlobalErrorHandling: function() {
            // Capturar erros não tratados
            window.addEventListener('error', (event) => {
                ReactDebugger.logNetworkError(
                    event.filename || window.location.href,
                    {
                        message: event.message,
                        line: event.lineno,
                        column: event.colno,
                        stack: event.error ? event.error.stack : null
                    },
                    'Erro JavaScript Global'
                );
            });

            // Capturar promises rejeitadas
            window.addEventListener('unhandledrejection', (event) => {
                ReactDebugger.logWarning('Promise rejeitada não tratada:', {
                    reason: event.reason,
                    promise: event.promise
                });
                
                // Prevenir que o erro apareça no console (opcional)
                // event.preventDefault();
            });

            ReactDebugger.logInfo('✅ Tratamento global de erros configurado');
        },

        /**
         * Configurar monitoramento de performance
         */
        _setupPerformanceMonitoring: function() {
            // Monitorar carregamento da página
            window.addEventListener('load', () => {
                if (window.performance && window.performance.timing) {
                    const timing = window.performance.timing;
                    const loadTime = timing.loadEventEnd - timing.navigationStart;
                    
                    ReactDebugger.logInfo(`⏱️ Tempo de carregamento da página: ${loadTime}ms`);
                }
            });

            // Monitorar mudanças de visibilidade da página
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    ReactDebugger.logDebug('👁️ Página ficou oculta');
                } else {
                    ReactDebugger.logDebug('👁️ Página ficou visível');
                }
            });

            ReactDebugger.logInfo('✅ Monitoramento de performance configurado');
        },

        /**
         * Configurar rastreamento de erros de rede
         */
        _setupNetworkErrorTracking: function() {
            // Interceptar fetch para monitorar requisições
            if (window.fetch) {
                const originalFetch = window.fetch;
                
                window.fetch = function(...args) {
                    const url = args[0];
                    const startTime = performance.now();
                    
                    return originalFetch.apply(this, args)
                        .then(response => {
                            const endTime = performance.now();
                            const duration = Math.round(endTime - startTime);
                            
                            if (!response.ok) {
                                ReactDebugger.logNetworkError(url, {
                                    status: response.status,
                                    statusText: response.statusText,
                                    duration: duration
                                }, 'Fetch API');
                            } else {
                                ReactDebugger.logDebug(`🌐 Fetch bem-sucedido: ${url} (${duration}ms)`);
                            }
                            
                            return response;
                        })
                        .catch(error => {
                            const endTime = performance.now();
                            const duration = Math.round(endTime - startTime);
                            
                            ReactDebugger.logNetworkError(url, {
                                message: error.message,
                                duration: duration
                            }, 'Fetch API Error');
                            
                            throw error;
                        });
                };
            }

            ReactDebugger.logInfo('✅ Rastreamento de erros de rede configurado');
        },

        /**
         * Executar diagnóstico completo do sistema
         */
        diagnose: function() {
            console.group('🔍 Diagnóstico Completo do Sistema React');
            
            // Diagnóstico do ambiente
            const envDiagnosis = window.SafeComponentLoader.diagnoseEnvironment();
            
            // Diagnóstico de configuração
            console.log('⚙️ Configuração atual:', this.config);
            
            // Teste de componentes
            console.log('🧪 Testando componentes disponíveis...');
            const components = window.SafeComponentLoader.listAvailableComponents();
            
            components.forEach(componentName => {
                const isAvailable = window.SafeComponentLoader.isComponentAvailable(componentName);
                console.log(`  ${isAvailable ? '✅' : '❌'} ${componentName}`);
            });
            
            console.groupEnd();
            
            return {
                environment: envDiagnosis,
                configuration: this.config,
                availableComponents: components
            };
        },

        /**
         * Limpar todos os event listeners e resetar sistema
         */
        cleanup: function() {
            // Remover event listeners se necessário
            ReactDebugger.logInfo('🧹 Limpeza do sistema de tratamento de erros');
        }
    };

    // Auto-inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.ReactErrorHandling.init();
        });
    } else {
        // DOM já está pronto
        window.ReactErrorHandling.init();
    }

})();