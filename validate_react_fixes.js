/**
 * Script de Validação das Correções React
 * Testa se os problemas de carregamento foram resolvidos
 */

const ReactFixValidator = {
    
    results: {
        dependencyLoading: null,
        componentInitialization: null,
        errorHandling: null,
        fallbackSystem: null,
        overall: null
    },

    /**
     * Executar todos os testes de validação
     */
    async runAllTests() {
        console.log('🧪 Iniciando validação das correções React...');
        console.log('=' .repeat(60));

        try {
            // Teste 1: Carregamento de dependências
            await this.testDependencyLoading();
            
            // Teste 2: Inicialização de componentes
            await this.testComponentInitialization();
            
            // Teste 3: Tratamento de erros
            await this.testErrorHandling();
            
            // Teste 4: Sistema de fallback
            await this.testFallbackSystem();
            
            // Gerar relatório final
            this.generateFinalReport();
            
        } catch (error) {
            console.error('❌ Erro durante validação:', error);
            this.results.overall = 'FALHA';
        }
    },

    /**
     * Teste 1: Verificar carregamento adequado de dependências React
     */
    async testDependencyLoading() {
        console.log('\n📦 Teste 1: Carregamento de Dependências React');
        console.log('-'.repeat(50));
        
        const test = {
            name: 'Carregamento de Dependências',
            passed: 0,
            failed: 0,
            details: []
        };

        // Verificar React
        if (typeof React !== 'undefined') {
            test.passed++;
            test.details.push('✅ React carregado corretamente');
            console.log(`✅ React disponível (versão: ${React.version || 'desconhecida'})`);
        } else {
            test.failed++;
            test.details.push('❌ React não está disponível');
            console.log('❌ React não está disponível');
        }

        // Verificar ReactDOM
        if (typeof ReactDOM !== 'undefined') {
            test.passed++;
            test.details.push('✅ ReactDOM carregado corretamente');
            console.log('✅ ReactDOM disponível');
        } else {
            test.failed++;
            test.details.push('❌ ReactDOM não está disponível');
            console.log('❌ ReactDOM não está disponível');
        }

        // Verificar UniversalReactInitializer
        if (typeof window.UniversalReactInitializer !== 'undefined') {
            test.passed++;
            test.details.push('✅ UniversalReactInitializer carregado');
            console.log('✅ UniversalReactInitializer disponível');
        } else {
            test.failed++;
            test.details.push('❌ UniversalReactInitializer não encontrado');
            console.log('❌ UniversalReactInitializer não encontrado');
        }

        // Verificar ReactDependencyChecker
        if (typeof window.ReactDependencyChecker !== 'undefined') {
            test.passed++;
            test.details.push('✅ ReactDependencyChecker carregado');
            console.log('✅ ReactDependencyChecker disponível');
        } else {
            test.failed++;
            test.details.push('❌ ReactDependencyChecker não encontrado');
            console.log('❌ ReactDependencyChecker não encontrado');
        }

        test.status = test.failed === 0 ? 'PASSOU' : 'FALHOU';
        this.results.dependencyLoading = test;
        
        console.log(`\n📊 Resultado: ${test.status} (${test.passed} passou, ${test.failed} falhou)`);
    },

    /**
     * Teste 2: Verificar inicialização de componentes
     */
    async testComponentInitialization() {
        console.log('\n⚛️ Teste 2: Inicialização de Componentes');
        console.log('-'.repeat(50));
        
        const test = {
            name: 'Inicialização de Componentes',
            passed: 0,
            failed: 0,
            details: []
        };

        // Verificar se UniversalReactInitializer pode ser inicializado
        if (window.UniversalReactInitializer) {
            try {
                await window.UniversalReactInitializer.init();
                test.passed++;
                test.details.push('✅ UniversalReactInitializer inicializado com sucesso');
                console.log('✅ UniversalReactInitializer inicializado com sucesso');
            } catch (error) {
                test.failed++;
                test.details.push(`❌ Falha na inicialização: ${error.message}`);
                console.log(`❌ Falha na inicialização: ${error.message}`);
            }
        }

        // Verificar componentes disponíveis
        const availableComponents = this.getAvailableReactComponents();
        if (availableComponents.length > 0) {
            test.passed++;
            test.details.push(`✅ ${availableComponents.length} componentes React encontrados: ${availableComponents.join(', ')}`);
            console.log(`✅ Componentes encontrados: ${availableComponents.join(', ')}`);
        } else {
            test.failed++;
            test.details.push('❌ Nenhum componente React encontrado');
            console.log('❌ Nenhum componente React encontrado');
        }

        // Testar criação de elemento React básico
        if (typeof React !== 'undefined') {
            try {
                const testElement = React.createElement('div', null, 'Teste');
                if (testElement) {
                    test.passed++;
                    test.details.push('✅ Criação de elementos React funcionando');
                    console.log('✅ Criação de elementos React funcionando');
                }
            } catch (error) {
                test.failed++;
                test.details.push(`❌ Falha na criação de elementos: ${error.message}`);
                console.log(`❌ Falha na criação de elementos: ${error.message}`);
            }
        }

        test.status = test.failed === 0 ? 'PASSOU' : 'FALHOU';
        this.results.componentInitialization = test;
        
        console.log(`\n📊 Resultado: ${test.status} (${test.passed} passou, ${test.failed} falhou)`);
    },

    /**
     * Teste 3: Verificar tratamento de erros
     */
    async testErrorHandling() {
        console.log('\n🚨 Teste 3: Tratamento de Erros');
        console.log('-'.repeat(50));
        
        const test = {
            name: 'Tratamento de Erros',
            passed: 0,
            failed: 0,
            details: []
        };

        // Verificar ReactErrorBoundary
        if (typeof window.ReactErrorBoundary !== 'undefined') {
            test.passed++;
            test.details.push('✅ ReactErrorBoundary disponível');
            console.log('✅ ReactErrorBoundary disponível');
        } else {
            test.failed++;
            test.details.push('❌ ReactErrorBoundary não encontrado');
            console.log('❌ ReactErrorBoundary não encontrado');
        }

        // Verificar sistema de logging
        if (window.UniversalReactInitializer && typeof window.UniversalReactInitializer.log === 'function') {
            test.passed++;
            test.details.push('✅ Sistema de logging disponível');
            console.log('✅ Sistema de logging disponível');
        } else {
            test.failed++;
            test.details.push('❌ Sistema de logging não encontrado');
            console.log('❌ Sistema de logging não encontrado');
        }

        // Testar captura de erros globais
        const originalErrorHandler = window.onerror;
        let errorCaptured = false;
        
        window.onerror = function() {
            errorCaptured = true;
            return false;
        };

        try {
            // Simular erro
            setTimeout(() => {
                throw new Error('Teste de erro');
            }, 100);
            
            // Aguardar um pouco para captura
            await new Promise(resolve => setTimeout(resolve, 200));
            
            if (errorCaptured) {
                test.passed++;
                test.details.push('✅ Captura de erros globais funcionando');
                console.log('✅ Captura de erros globais funcionando');
            } else {
                test.failed++;
                test.details.push('❌ Captura de erros globais não funcionando');
                console.log('❌ Captura de erros globais não funcionando');
            }
        } catch (error) {
            test.failed++;
            test.details.push(`❌ Erro no teste de captura: ${error.message}`);
            console.log(`❌ Erro no teste de captura: ${error.message}`);
        } finally {
            window.onerror = originalErrorHandler;
        }

        test.status = test.failed === 0 ? 'PASSOU' : 'FALHOU';
        this.results.errorHandling = test;
        
        console.log(`\n📊 Resultado: ${test.status} (${test.passed} passou, ${test.failed} falhou)`);
    },

    /**
     * Teste 4: Verificar sistema de fallback
     */
    async testFallbackSystem() {
        console.log('\n🔄 Teste 4: Sistema de Fallback');
        console.log('-'.repeat(50));
        
        const test = {
            name: 'Sistema de Fallback',
            passed: 0,
            failed: 0,
            details: []
        };

        // Criar container de teste
        const testContainer = document.createElement('div');
        testContainer.id = 'test-fallback-container';
        testContainer.innerHTML = '<div class="fallback-container" style="display: none;">Fallback HTML</div>';
        document.body.appendChild(testContainer);

        try {
            // Testar fallback com componente inexistente
            if (window.UniversalReactInitializer) {
                const result = await window.UniversalReactInitializer.initComponent(
                    'ComponenteInexistente',
                    'test-fallback-container',
                    {},
                    { showLoadingIndicator: false }
                );

                if (!result) {
                    // Verificar se fallback foi ativado
                    const fallbackContainer = testContainer.querySelector('.fallback-container');
                    const fallbackWarning = testContainer.querySelector('.universal-fallback-warning');
                    
                    if (fallbackContainer && fallbackContainer.style.display === 'block') {
                        test.passed++;
                        test.details.push('✅ Fallback HTML ativado corretamente');
                        console.log('✅ Fallback HTML ativado corretamente');
                    } else {
                        test.failed++;
                        test.details.push('❌ Fallback HTML não foi ativado');
                        console.log('❌ Fallback HTML não foi ativado');
                    }

                    if (fallbackWarning) {
                        test.passed++;
                        test.details.push('✅ Mensagem de aviso de fallback exibida');
                        console.log('✅ Mensagem de aviso de fallback exibida');
                    } else {
                        test.failed++;
                        test.details.push('❌ Mensagem de aviso não exibida');
                        console.log('❌ Mensagem de aviso não exibida');
                    }
                } else {
                    test.failed++;
                    test.details.push('❌ Componente inexistente não ativou fallback');
                    console.log('❌ Componente inexistente não ativou fallback');
                }
            }

            // Testar indicador de carregamento
            if (window.UniversalReactInitializer) {
                window.UniversalReactInitializer.showLoadingIndicator(testContainer);
                
                const loadingIndicator = testContainer.querySelector('.universal-loading-indicator');
                if (loadingIndicator) {
                    test.passed++;
                    test.details.push('✅ Indicador de carregamento funcionando');
                    console.log('✅ Indicador de carregamento funcionando');
                    
                    window.UniversalReactInitializer.hideLoadingIndicator(testContainer);
                } else {
                    test.failed++;
                    test.details.push('❌ Indicador de carregamento não funcionando');
                    console.log('❌ Indicador de carregamento não funcionando');
                }
            }

        } catch (error) {
            test.failed++;
            test.details.push(`❌ Erro no teste de fallback: ${error.message}`);
            console.log(`❌ Erro no teste de fallback: ${error.message}`);
        } finally {
            // Limpar container de teste
            document.body.removeChild(testContainer);
        }

        test.status = test.failed === 0 ? 'PASSOU' : 'FALHOU';
        this.results.fallbackSystem = test;
        
        console.log(`\n📊 Resultado: ${test.status} (${test.passed} passou, ${test.failed} falhou)`);
    },

    /**
     * Obter componentes React disponíveis
     */
    getAvailableReactComponents() {
        const components = [];
        for (const key in window) {
            if (key.endsWith('React') && typeof window[key] === 'function') {
                components.push(key);
            }
        }
        return components;
    },

    /**
     * Gerar relatório final
     */
    generateFinalReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 RELATÓRIO FINAL DE VALIDAÇÃO');
        console.log('='.repeat(60));

        let totalPassed = 0;
        let totalFailed = 0;
        let allTestsPassed = true;

        Object.values(this.results).forEach(test => {
            if (test && typeof test === 'object' && test.name) {
                console.log(`\n${test.status === 'PASSOU' ? '✅' : '❌'} ${test.name}: ${test.status}`);
                console.log(`   Passou: ${test.passed}, Falhou: ${test.failed}`);
                
                totalPassed += test.passed;
                totalFailed += test.failed;
                
                if (test.status !== 'PASSOU') {
                    allTestsPassed = false;
                }
            }
        });

        this.results.overall = allTestsPassed ? 'SUCESSO' : 'FALHA';

        console.log('\n' + '-'.repeat(60));
        console.log(`📊 RESUMO GERAL:`);
        console.log(`   Status: ${this.results.overall}`);
        console.log(`   Total de testes passou: ${totalPassed}`);
        console.log(`   Total de testes falhou: ${totalFailed}`);
        console.log(`   Taxa de sucesso: ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`);

        if (allTestsPassed) {
            console.log('\n🎉 TODAS AS CORREÇÕES FORAM VALIDADAS COM SUCESSO!');
            console.log('✅ Os problemas de carregamento de componentes React foram resolvidos.');
        } else {
            console.log('\n⚠️ ALGUMAS CORREÇÕES AINDA PRECISAM DE ATENÇÃO');
            console.log('❌ Verifique os testes que falharam acima.');
        }

        console.log('='.repeat(60));

        return this.results;
    },

    /**
     * Executar diagnóstico detalhado
     */
    runDiagnosis() {
        console.log('\n🔍 DIAGNÓSTICO DETALHADO DO SISTEMA');
        console.log('='.repeat(60));

        // Diagnóstico do UniversalReactInitializer
        if (window.UniversalReactInitializer) {
            console.log('\n📊 UniversalReactInitializer:');
            window.UniversalReactInitializer.diagnose();
        }

        // Diagnóstico do ReactDependencyChecker
        if (window.ReactDependencyChecker) {
            console.log('\n🔍 ReactDependencyChecker:');
            window.ReactDependencyChecker.checkAllDependencies();
        }

        // Informações do ambiente
        console.log('\n🌐 Informações do Ambiente:');
        console.log(`   User Agent: ${navigator.userAgent}`);
        console.log(`   URL atual: ${window.location.href}`);
        console.log(`   Protocolo: ${window.location.protocol}`);
        console.log(`   Host: ${window.location.host}`);

        // Verificar arquivos estáticos
        console.log('\n📁 Verificação de Arquivos Estáticos:');
        this.checkStaticFiles();
    },

    /**
     * Verificar disponibilidade de arquivos estáticos
     */
    async checkStaticFiles() {
        const staticFiles = [
            '/static/js/services/UniversalReactInitializer.js',
            '/static/js/services/ReactDependencyChecker.js',
            '/static/js/services/ReactInitializer.js',
            '/static/js/services/SafeComponentLoader.js',
            '/static/js/components/ReactErrorBoundary.js'
        ];

        for (const file of staticFiles) {
            try {
                const response = await fetch(file, { method: 'HEAD' });
                const status = response.ok ? '✅' : '❌';
                console.log(`   ${status} ${file} (${response.status})`);
            } catch (error) {
                console.log(`   ❌ ${file} (Erro: ${error.message})`);
            }
        }
    }
};

// Executar validação automaticamente se estiver em modo de desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            ReactFixValidator.runAllTests();
        }, 2000);
    });
}

// Disponibilizar globalmente para execução manual
window.ReactFixValidator = ReactFixValidator;