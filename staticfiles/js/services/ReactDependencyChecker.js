/**
 * ReactDependencyChecker - Sistema de verificação robusta de dependências React
 * Identifica e corrige problemas de carregamento de React e ReactDOM
 */
window.ReactDependencyChecker = {
    
    /**
     * Verificar todas as dependências React necessárias
     */
    checkAllDependencies: function() {
        const results = {
            timestamp: new Date().toISOString(),
            react: this.checkReact(),
            reactDOM: this.checkReactDOM(),
            errorBoundary: this.checkErrorBoundary(),
            safeLoader: this.checkSafeLoader(),
            debugger: this.checkDebugger(),
            initializer: this.checkInitializer(),
            overall: 'unknown'
        };

        // Determinar status geral
        const criticalDeps = ['react', 'reactDOM'];
        const allCriticalOk = criticalDeps.every(dep => results[dep].status === 'ok');
        
        if (allCriticalOk) {
            results.overall = 'ok';
        } else {
            results.overall = 'error';
        }

        // Log dos resultados
        this.logDependencyResults(results);
        
        return results;
    },

    /**
     * Verificar React
     */
    checkReact: function() {
        const result = {
            name: 'React',
            status: 'unknown',
            version: null,
            source: null,
            issues: [],
            recommendations: []
        };

        try {
            if (typeof React === 'undefined') {
                result.status = 'missing';
                result.issues.push('React não está definido no escopo global');
                result.recommendations.push('Verificar se o script do React está sendo carregado corretamente');
                result.recommendations.push('Verificar se não há erros de rede ao carregar React CDN');
            } else if (typeof React !== 'object') {
                result.status = 'invalid';
                result.issues.push(`React tem tipo inválido: ${typeof React}`);
                result.recommendations.push('Verificar se há conflitos de variáveis globais');
            } else {
                result.status = 'ok';
                result.version = React.version || 'Desconhecida';
                
                // Detectar fonte do React
                if (React.version) {
                    if (React.version.includes('18')) {
                        result.source = 'React 18 (CDN ou local)';
                    } else if (React.version.includes('17')) {
                        result.source = 'React 17 (CDN ou local)';
                    } else {
                        result.source = `React ${React.version}`;
                    }
                }

                // Verificar métodos essenciais
                const essentialMethods = ['createElement', 'Component'];
                essentialMethods.forEach(method => {
                    if (typeof React[method] !== 'function') {
                        result.issues.push(`Método React.${method} não disponível`);
                        result.status = 'incomplete';
                    }
                });
            }
        } catch (error) {
            result.status = 'error';
            result.issues.push(`Erro ao verificar React: ${error.message}`);
            result.recommendations.push('Verificar console do navegador para erros de JavaScript');
        }

        return result;
    },

    /**
     * Verificar ReactDOM
     */
    checkReactDOM: function() {
        const result = {
            name: 'ReactDOM',
            status: 'unknown',
            version: null,
            source: null,
            issues: [],
            recommendations: []
        };

        try {
            if (typeof ReactDOM === 'undefined') {
                result.status = 'missing';
                result.issues.push('ReactDOM não está definido no escopo global');
                result.recommendations.push('Verificar se o script do ReactDOM está sendo carregado corretamente');
                result.recommendations.push('Verificar ordem de carregamento: React deve vir antes de ReactDOM');
            } else if (typeof ReactDOM !== 'object') {
                result.status = 'invalid';
                result.issues.push(`ReactDOM tem tipo inválido: ${typeof ReactDOM}`);
                result.recommendations.push('Verificar se há conflitos de variáveis globais');
            } else {
                result.status = 'ok';
                result.version = ReactDOM.version || React.version || 'Desconhecida';
                result.source = 'ReactDOM (CDN ou local)';

                // Verificar métodos essenciais
                const essentialMethods = ['render'];
                const modernMethods = ['createRoot']; // React 18+

                essentialMethods.forEach(method => {
                    if (typeof ReactDOM[method] !== 'function') {
                        result.issues.push(`Método ReactDOM.${method} não disponível`);
                        result.status = 'incomplete';
                    }
                });

                // Verificar se é React 18+ e tem createRoot
                if (React.version && React.version.startsWith('18')) {
                    modernMethods.forEach(method => {
                        if (typeof ReactDOM[method] !== 'function') {
                            result.issues.push(`Método moderno ReactDOM.${method} não disponível (React 18+)`);
                            result.recommendations.push('Considerar usar ReactDOM.createRoot para React 18+');
                        }
                    });
                }
            }
        } catch (error) {
            result.status = 'error';
            result.issues.push(`Erro ao verificar ReactDOM: ${error.message}`);
            result.recommendations.push('Verificar console do navegador para erros de JavaScript');
        }

        return result;
    },

    /**
     * Verificar ReactErrorBoundary
     */
    checkErrorBoundary: function() {
        const result = {
            name: 'ReactErrorBoundary',
            status: 'unknown',
            issues: [],
            recommendations: []
        };

        try {
            if (typeof window.ReactErrorBoundary === 'undefined') {
                result.status = 'missing';
                result.issues.push('ReactErrorBoundary não está disponível');
                result.recommendations.push('Carregar script ReactErrorBoundary.js');
            } else if (typeof window.ReactErrorBoundary !== 'function') {
                result.status = 'invalid';
                result.issues.push(`ReactErrorBoundary tem tipo inválido: ${typeof window.ReactErrorBoundary}`);
            } else {
                result.status = 'ok';
            }
        } catch (error) {
            result.status = 'error';
            result.issues.push(`Erro ao verificar ReactErrorBoundary: ${error.message}`);
        }

        return result;
    },

    /**
     * Verificar SafeComponentLoader
     */
    checkSafeLoader: function() {
        const result = {
            name: 'SafeComponentLoader',
            status: 'unknown',
            issues: [],
            recommendations: []
        };

        try {
            if (typeof window.SafeComponentLoader === 'undefined') {
                result.status = 'missing';
                result.issues.push('SafeComponentLoader não está disponível');
                result.recommendations.push('Carregar script SafeComponentLoader.js');
            } else if (typeof window.SafeComponentLoader !== 'object') {
                result.status = 'invalid';
                result.issues.push(`SafeComponentLoader tem tipo inválido: ${typeof window.SafeComponentLoader}`);
            } else {
                result.status = 'ok';
                
                // Verificar métodos essenciais
                const essentialMethods = ['safeRenderComponent', 'isComponentAvailable'];
                essentialMethods.forEach(method => {
                    if (typeof window.SafeComponentLoader[method] !== 'function') {
                        result.issues.push(`Método SafeComponentLoader.${method} não disponível`);
                        result.status = 'incomplete';
                    }
                });
            }
        } catch (error) {
            result.status = 'error';
            result.issues.push(`Erro ao verificar SafeComponentLoader: ${error.message}`);
        }

        return result;
    },

    /**
     * Verificar ReactDebugger
     */
    checkDebugger: function() {
        const result = {
            name: 'ReactDebugger',
            status: 'unknown',
            issues: [],
            recommendations: []
        };

        try {
            if (typeof window.ReactDebugger === 'undefined') {
                result.status = 'missing';
                result.issues.push('ReactDebugger não está disponível');
                result.recommendations.push('Carregar script ReactDebugger.js');
            } else if (typeof window.ReactDebugger !== 'object') {
                result.status = 'invalid';
                result.issues.push(`ReactDebugger tem tipo inválido: ${typeof window.ReactDebugger}`);
            } else {
                result.status = 'ok';
            }
        } catch (error) {
            result.status = 'error';
            result.issues.push(`Erro ao verificar ReactDebugger: ${error.message}`);
        }

        return result;
    },

    /**
     * Verificar ReactInitializer
     */
    checkInitializer: function() {
        const result = {
            name: 'ReactInitializer',
            status: 'unknown',
            issues: [],
            recommendations: []
        };

        try {
            if (typeof window.ReactInitializer === 'undefined') {
                result.status = 'missing';
                result.issues.push('ReactInitializer não está disponível');
                result.recommendations.push('Carregar script ReactInitializer.js');
            } else if (typeof window.ReactInitializer !== 'object') {
                result.status = 'invalid';
                result.issues.push(`ReactInitializer tem tipo inválido: ${typeof window.ReactInitializer}`);
            } else {
                result.status = 'ok';
                
                // Verificar métodos essenciais
                const essentialMethods = ['initComponent', 'areDependenciesLoaded'];
                essentialMethods.forEach(method => {
                    if (typeof window.ReactInitializer[method] !== 'function') {
                        result.issues.push(`Método ReactInitializer.${method} não disponível`);
                        result.status = 'incomplete';
                    }
                });
            }
        } catch (error) {
            result.status = 'error';
            result.issues.push(`Erro ao verificar ReactInitializer: ${error.message}`);
        }

        return result;
    },

    /**
     * Aguardar carregamento de dependências com timeout
     */
    waitForDependencies: function(dependencies = ['React', 'ReactDOM'], timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkInterval = 100;

            const checkDependencies = () => {
                const missing = dependencies.filter(dep => typeof window[dep] === 'undefined');
                
                if (missing.length === 0) {
                    resolve({
                        success: true,
                        loadTime: Date.now() - startTime,
                        message: `Todas as dependências carregadas em ${Date.now() - startTime}ms`
                    });
                    return;
                }

                if (Date.now() - startTime > timeout) {
                    reject({
                        success: false,
                        missing: missing,
                        timeout: timeout,
                        message: `Timeout aguardando dependências: ${missing.join(', ')}`
                    });
                    return;
                }

                setTimeout(checkDependencies, checkInterval);
            };

            checkDependencies();
        });
    },

    /**
     * Verificação robusta e inicialização automática de componentes
     */
    ensureReactEnvironment: function() {
        return new Promise((resolve, reject) => {
            console.log('🔍 Verificando ambiente React...');
            
            // Verificar dependências críticas
            const results = this.checkAllDependencies();
            
            if (results.overall === 'ok') {
                console.log('✅ Ambiente React está pronto');
                resolve(results);
                return;
            }

            console.log('🔧 Ambiente React precisa de correções. Iniciando diagnóstico automático...');
            
            // Tentar correção automática
            this.diagnoseAndFix()
                .then((fixedResults) => {
                    console.log('✅ Ambiente React corrigido automaticamente');
                    resolve(fixedResults);
                })
                .catch((error) => {
                    console.error('❌ Falha na correção automática do ambiente React:', error);
                    reject(error);
                });
        });
    },

    /**
     * Inicializar componente com verificação robusta de dependências
     */
    initializeComponentSafely: function(componentName, containerId, props = {}, options = {}) {
        console.log(`🚀 Inicializando ${componentName} com verificação robusta...`);
        
        return this.ensureReactEnvironment()
            .then(() => {
                // Verificar se o componente específico existe
                if (typeof window[componentName] === 'undefined') {
                    throw new Error(`Componente ${componentName} não encontrado no escopo global`);
                }

                // Usar ReactInitializer se disponível
                if (window.ReactInitializer) {
                    return window.ReactInitializer.initComponent(componentName, containerId, props, options);
                } else {
                    // Fallback para renderização direta
                    return this._directComponentRender(componentName, containerId, props, options);
                }
            })
            .catch((error) => {
                console.error(`❌ Falha ao inicializar ${componentName}:`, error);
                this._handleComponentInitializationFailure(componentName, containerId, error, options);
                return false;
            });
    },

    /**
     * Renderização direta de componente (fallback)
     */
    _directComponentRender: function(componentName, containerId, props, options) {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Container ${containerId} não encontrado`);
            }

            const element = React.createElement(window[componentName], props);
            
            if (ReactDOM.createRoot) {
                // React 18+
                const root = ReactDOM.createRoot(container);
                root.render(element);
            } else {
                // React 17 e anteriores
                ReactDOM.render(element, container);
            }

            console.log(`✅ ${componentName} renderizado diretamente com sucesso`);
            
            if (options.onSuccess) {
                options.onSuccess(componentName, container);
            }
            
            return true;

        } catch (error) {
            console.error(`❌ Falha na renderização direta de ${componentName}:`, error);
            throw error;
        }
    },

    /**
     * Lidar com falha na inicialização de componente
     */
    _handleComponentInitializationFailure: function(componentName, containerId, error, options) {
        console.log(`⚠️ Ativando fallback para ${componentName} devido a: ${error.message}`);
        
        const container = document.getElementById(containerId);
        if (!container) return;

        // Procurar por fallback HTML existente
        const fallbackContainer = container.querySelector('.fallback-container');
        if (fallbackContainer) {
            fallbackContainer.style.display = 'block';
            
            // Adicionar mensagem de erro específica
            const errorMessage = document.createElement('div');
            errorMessage.style.cssText = `
                background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                border: 2px solid #ef4444;
                color: #dc2626;
                padding: 15px;
                margin-bottom: 20px;
                border-radius: 12px;
                font-size: 14px;
                display: flex;
                align-items: flex-start;
                gap: 10px;
            `;
            errorMessage.innerHTML = `
                <span style="font-size: 18px; flex-shrink: 0;">⚠️</span>
                <div>
                    <strong>Problema de Carregamento</strong><br>
                    Componente ${componentName} não pôde ser carregado: ${error.message}<br>
                    <small style="opacity: 0.8; margin-top: 5px; display: block;">
                        Usando versão HTML como alternativa.
                    </small>
                </div>
            `;
            container.insertBefore(errorMessage, fallbackContainer);
        }

        // Callback de fallback
        if (options.onFallback) {
            options.onFallback(componentName, container);
        }
    },

    /**
     * Tentar carregar dependências ausentes
     */
    loadMissingDependencies: function() {
        const results = this.checkAllDependencies();
        const promises = [];

        // Tentar carregar React se ausente
        if (results.react.status === 'missing') {
            promises.push(this.loadReact());
        }

        // Tentar carregar ReactDOM se ausente
        if (results.reactDOM.status === 'missing') {
            promises.push(this.loadReactDOM());
        }

        return Promise.all(promises);
    },

    /**
     * Carregar React via CDN
     */
    loadReact: function() {
        return new Promise((resolve, reject) => {
            if (typeof React !== 'undefined') {
                resolve('React já carregado');
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/react@18/umd/react.development.js';
            script.crossOrigin = 'anonymous';
            
            script.onload = () => {
                console.log('✅ React carregado via CDN');
                resolve('React carregado com sucesso');
            };
            
            script.onerror = () => {
                console.error('❌ Falha ao carregar React via CDN');
                reject('Falha ao carregar React');
            };

            document.head.appendChild(script);
        });
    },

    /**
     * Carregar ReactDOM via CDN
     */
    loadReactDOM: function() {
        return new Promise((resolve, reject) => {
            if (typeof ReactDOM !== 'undefined') {
                resolve('ReactDOM já carregado');
                return;
            }

            // Aguardar React estar disponível primeiro
            if (typeof React === 'undefined') {
                reject('React deve ser carregado antes de ReactDOM');
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js';
            script.crossOrigin = 'anonymous';
            
            script.onload = () => {
                console.log('✅ ReactDOM carregado via CDN');
                resolve('ReactDOM carregado com sucesso');
            };
            
            script.onerror = () => {
                console.error('❌ Falha ao carregar ReactDOM via CDN');
                reject('Falha ao carregar ReactDOM');
            };

            document.head.appendChild(script);
        });
    },

    /**
     * Log detalhado dos resultados da verificação
     */
    logDependencyResults: function(results) {
        console.group('🔍 Verificação de Dependências React');
        
        console.log(`📊 Status Geral: ${results.overall === 'ok' ? '✅ OK' : '❌ PROBLEMAS DETECTADOS'}`);
        console.log(`⏰ Verificação realizada em: ${results.timestamp}`);
        
        Object.entries(results).forEach(([key, result]) => {
            if (key === 'timestamp' || key === 'overall') return;
            
            const statusIcon = result.status === 'ok' ? '✅' : 
                              result.status === 'missing' ? '❌' : 
                              result.status === 'invalid' ? '⚠️' : 
                              result.status === 'incomplete' ? '🔶' : '❓';
            
            console.group(`${statusIcon} ${result.name}`);
            console.log(`Status: ${result.status}`);
            
            if (result.version) {
                console.log(`Versão: ${result.version}`);
            }
            
            if (result.source) {
                console.log(`Fonte: ${result.source}`);
            }
            
            if (result.issues.length > 0) {
                console.warn('Problemas encontrados:', result.issues);
            }
            
            if (result.recommendations.length > 0) {
                console.info('Recomendações:', result.recommendations);
            }
            
            console.groupEnd();
        });
        
        console.groupEnd();
    },

    /**
     * Executar diagnóstico completo e tentar correções automáticas
     */
    async diagnoseAndFix() {
        console.log('🔧 Iniciando diagnóstico e correção automática...');
        
        const results = this.checkAllDependencies();
        
        if (results.overall === 'ok') {
            console.log('✅ Todas as dependências estão OK!');
            return results;
        }

        console.log('🔧 Tentando carregar dependências ausentes...');
        
        try {
            await this.loadMissingDependencies();
            console.log('✅ Dependências carregadas, verificando novamente...');
            
            await this.waitForDependencies(['React', 'ReactDOM'], 8000);
            
            const newResults = this.checkAllDependencies();
            console.log('🎉 Correção automática concluída!');
            return newResults;
        } catch (error) {
            console.error('❌ Falha na correção automática:', error);
            throw error;
        }
    },

    /**
     * Verificar se ambiente React está completamente funcional
     */
    validateReactEnvironment: function() {
        const validation = {
            timestamp: new Date().toISOString(),
            tests: {},
            overall: 'unknown',
            issues: [],
            recommendations: []
        };

        // Teste 1: Verificar React básico
        validation.tests.reactBasic = this.testReactBasic();
        
        // Teste 2: Verificar ReactDOM
        validation.tests.reactDOM = this.testReactDOM();
        
        // Teste 3: Verificar criação de elementos
        validation.tests.createElement = this.testCreateElement();
        
        // Teste 4: Verificar renderização
        validation.tests.rendering = this.testRendering();
        
        // Teste 5: Verificar Error Boundary
        validation.tests.errorBoundary = this.testErrorBoundary();

        // Determinar status geral
        const passedTests = Object.values(validation.tests).filter(test => test.passed).length;
        const totalTests = Object.keys(validation.tests).length;
        
        if (passedTests === totalTests) {
            validation.overall = 'excellent';
        } else if (passedTests >= totalTests * 0.8) {
            validation.overall = 'good';
        } else if (passedTests >= totalTests * 0.6) {
            validation.overall = 'fair';
        } else {
            validation.overall = 'poor';
        }

        // Coletar problemas e recomendações
        Object.entries(validation.tests).forEach(([testName, result]) => {
            if (!result.passed) {
                validation.issues.push(`${testName}: ${result.error}`);
                if (result.recommendation) {
                    validation.recommendations.push(result.recommendation);
                }
            }
        });

        this.logValidationResults(validation);
        return validation;
    },

    /**
     * Testar React básico
     */
    testReactBasic: function() {
        try {
            if (typeof React === 'undefined') {
                return {
                    passed: false,
                    error: 'React não está definido',
                    recommendation: 'Carregar React via CDN ou bundle'
                };
            }

            if (!React.version) {
                return {
                    passed: false,
                    error: 'React carregado mas sem versão',
                    recommendation: 'Verificar se React foi carregado corretamente'
                };
            }

            if (typeof React.createElement !== 'function') {
                return {
                    passed: false,
                    error: 'React.createElement não é uma função',
                    recommendation: 'Verificar integridade do React carregado'
                };
            }

            return {
                passed: true,
                version: React.version,
                message: 'React básico funcionando'
            };
        } catch (error) {
            return {
                passed: false,
                error: error.message,
                recommendation: 'Verificar console para erros de JavaScript'
            };
        }
    },

    /**
     * Testar ReactDOM
     */
    testReactDOM: function() {
        try {
            if (typeof ReactDOM === 'undefined') {
                return {
                    passed: false,
                    error: 'ReactDOM não está definido',
                    recommendation: 'Carregar ReactDOM via CDN ou bundle'
                };
            }

            const hasRender = typeof ReactDOM.render === 'function';
            const hasCreateRoot = typeof ReactDOM.createRoot === 'function';

            if (!hasRender && !hasCreateRoot) {
                return {
                    passed: false,
                    error: 'ReactDOM não tem métodos de renderização',
                    recommendation: 'Verificar se ReactDOM foi carregado corretamente'
                };
            }

            return {
                passed: true,
                hasRender: hasRender,
                hasCreateRoot: hasCreateRoot,
                message: 'ReactDOM funcionando'
            };
        } catch (error) {
            return {
                passed: false,
                error: error.message,
                recommendation: 'Verificar console para erros de JavaScript'
            };
        }
    },

    /**
     * Testar criação de elementos
     */
    testCreateElement: function() {
        try {
            if (typeof React === 'undefined') {
                return {
                    passed: false,
                    error: 'React não disponível para teste',
                    recommendation: 'Carregar React primeiro'
                };
            }

            const element = React.createElement('div', { className: 'test' }, 'Teste');
            
            if (!element || typeof element !== 'object') {
                return {
                    passed: false,
                    error: 'React.createElement não retornou elemento válido',
                    recommendation: 'Verificar integridade do React'
                };
            }

            if (element.type !== 'div' || element.props.className !== 'test') {
                return {
                    passed: false,
                    error: 'Elemento criado com propriedades incorretas',
                    recommendation: 'Verificar versão do React'
                };
            }

            return {
                passed: true,
                message: 'Criação de elementos funcionando'
            };
        } catch (error) {
            return {
                passed: false,
                error: error.message,
                recommendation: 'Verificar compatibilidade do React'
            };
        }
    },

    /**
     * Testar renderização
     */
    testRendering: function() {
        try {
            if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
                return {
                    passed: false,
                    error: 'React ou ReactDOM não disponíveis',
                    recommendation: 'Carregar dependências React'
                };
            }

            // Criar container de teste temporário
            const testContainer = document.createElement('div');
            testContainer.id = 'react-test-container-' + Date.now();
            testContainer.style.display = 'none';
            document.body.appendChild(testContainer);

            try {
                const testElement = React.createElement('div', { 'data-test': 'react-render-test' }, 'Teste de Renderização');
                
                if (ReactDOM.createRoot) {
                    // React 18+
                    const root = ReactDOM.createRoot(testContainer);
                    root.render(testElement);
                } else {
                    // React 17 e anteriores
                    ReactDOM.render(testElement, testContainer);
                }

                // Verificar se renderizou
                const renderedElement = testContainer.querySelector('[data-test="react-render-test"]');
                
                if (!renderedElement) {
                    return {
                        passed: false,
                        error: 'Elemento não foi renderizado no DOM',
                        recommendation: 'Verificar compatibilidade React/ReactDOM'
                    };
                }

                return {
                    passed: true,
                    message: 'Renderização funcionando',
                    method: ReactDOM.createRoot ? 'createRoot' : 'render'
                };
            } finally {
                // Limpar container de teste
                document.body.removeChild(testContainer);
            }
        } catch (error) {
            return {
                passed: false,
                error: error.message,
                recommendation: 'Verificar erros de renderização no console'
            };
        }
    },

    /**
     * Testar Error Boundary
     */
    testErrorBoundary: function() {
        try {
            if (typeof window.ReactErrorBoundary === 'undefined') {
                return {
                    passed: false,
                    error: 'ReactErrorBoundary não está disponível',
                    recommendation: 'Carregar ReactErrorBoundary.js'
                };
            }

            if (typeof window.ReactErrorBoundary !== 'function') {
                return {
                    passed: false,
                    error: 'ReactErrorBoundary não é uma função/classe',
                    recommendation: 'Verificar implementação do ReactErrorBoundary'
                };
            }

            // Verificar se é uma classe React válida
            const errorBoundary = new window.ReactErrorBoundary({});
            
            if (typeof errorBoundary.componentDidCatch !== 'function') {
                return {
                    passed: false,
                    error: 'ReactErrorBoundary não implementa componentDidCatch',
                    recommendation: 'Verificar implementação completa do Error Boundary'
                };
            }

            return {
                passed: true,
                message: 'ReactErrorBoundary funcionando'
            };
        } catch (error) {
            return {
                passed: false,
                error: error.message,
                recommendation: 'Verificar implementação do ReactErrorBoundary'
            };
        }
    },

    /**
     * Log dos resultados de validação
     */
    logValidationResults: function(validation) {
        console.group('🧪 Validação do Ambiente React');
        
        const statusEmoji = {
            excellent: '🟢',
            good: '🟡',
            fair: '🟠',
            poor: '🔴'
        };
        
        console.log(`${statusEmoji[validation.overall]} Status Geral: ${validation.overall.toUpperCase()}`);
        console.log(`📊 Testes: ${Object.values(validation.tests).filter(t => t.passed).length}/${Object.keys(validation.tests).length} aprovados`);
        
        // Log de cada teste
        Object.entries(validation.tests).forEach(([testName, result]) => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`${icon} ${testName}: ${result.passed ? result.message : result.error}`);
        });
        
        if (validation.issues.length > 0) {
            console.warn('⚠️ Problemas encontrados:', validation.issues);
        }
        
        if (validation.recommendations.length > 0) {
            console.info('💡 Recomendações:', validation.recommendations);
        }
        
        console.groupEnd();
    },

    /**
     * Verificar se ambiente está pronto para componentes React
     */
    isEnvironmentReady: function() {
        const results = this.checkAllDependencies();
        return results.overall === 'ok' && 
               results.react.status === 'ok' && 
               results.reactDOM.status === 'ok';
    },

    /**
     * Obter relatório resumido
     */
    getSummaryReport: function() {
        const results = this.checkAllDependencies();
        
        const summary = {
            ready: results.overall === 'ok',
            criticalIssues: [],
            warnings: [],
            recommendations: []
        };

        Object.entries(results).forEach(([key, result]) => {
            if (key === 'timestamp' || key === 'overall') return;
            
            if (result.status === 'missing' || result.status === 'error') {
                summary.criticalIssues.push(`${result.name}: ${result.issues.join(', ')}`);
            } else if (result.status === 'invalid' || result.status === 'incomplete') {
                summary.warnings.push(`${result.name}: ${result.issues.join(', ')}`);
            }
            
            summary.recommendations.push(...result.recommendations);
        });

        return summary;
    }
};

// Auto-executar verificação em desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            window.ReactDependencyChecker.checkAllDependencies();
        }, 1000);
    });
}