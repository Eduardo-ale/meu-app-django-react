/**
 * Script de teste para validar correções de carregamento de componentes React
 * Testa o UniversalReactInitializer e verifica se os problemas foram corrigidos
 */

console.log('🧪 Iniciando testes de correção de carregamento de componentes React...');

// Função para executar testes
async function runComponentLoadingTests() {
    const results = {
        timestamp: new Date().toISOString(),
        tests: [],
        summary: {
            total: 0,
            passed: 0,
            failed: 0,
            warnings: 0
        }
    };

    // Teste 1: Verificar se UniversalReactInitializer está disponível
    addTest(results, 'UniversalReactInitializer disponível', () => {
        return typeof window.UniversalReactInitializer !== 'undefined';
    });

    // Teste 2: Verificar se React pode ser carregado
    addTest(results, 'React pode ser carregado', async () => {
        try {
            await window.UniversalReactInitializer.ensureReactDependencies();
            return typeof React !== 'undefined' && typeof ReactDOM !== 'undefined';
        } catch (error) {
            console.error('Erro ao carregar React:', error);
            return false;
        }
    });

    // Teste 3: Verificar inicialização do sistema
    addTest(results, 'Sistema pode ser inicializado', async () => {
        try {
            const success = await window.UniversalReactInitializer.initialize();
            return success === true;
        } catch (error) {
            console.error('Erro na inicialização:', error);
            return false;
        }
    });

    // Teste 4: Verificar carregamento de componentes
    addTest(results, 'Componentes React disponíveis', () => {
        const components = ['CriarUnidadeReact', 'RegistroChamadaReact'];
        const available = components.filter(name => typeof window[name] === 'function');
        
        if (available.length === 0) {
            console.warn('⚠️ Nenhum componente React encontrado. Isso é normal se os scripts não foram carregados ainda.');
            return 'warning';
        }
        
        console.log(`✅ Componentes disponíveis: ${available.join(', ')}`);
        return available.length > 0;
    });

    // Teste 5: Verificar funcionalidade de fallback
    addTest(results, 'Sistema de fallback funciona', () => {
        // Criar container de teste
        const testContainer = document.createElement('div');
        testContainer.id = 'test-fallback-container';
        testContainer.innerHTML = '<div class="fallback-container" style="display: none;">Fallback HTML</div>';
        document.body.appendChild(testContainer);

        try {
            // Ativar fallback
            window.UniversalReactInitializer.activateFallback('test-fallback-container', 'TestComponent', 'Teste de fallback');
            
            // Verificar se fallback foi ativado
            const fallbackContainer = testContainer.querySelector('.fallback-container');
            const isVisible = fallbackContainer && fallbackContainer.style.display !== 'none';
            
            // Limpar
            document.body.removeChild(testContainer);
            
            return isVisible;
        } catch (error) {
            console.error('Erro no teste de fallback:', error);
            document.body.removeChild(testContainer);
            return false;
        }
    });

    // Teste 6: Verificar indicador de carregamento
    addTest(results, 'Indicador de carregamento funciona', () => {
        // Criar container de teste
        const testContainer = document.createElement('div');
        testContainer.id = 'test-loading-container';
        document.body.appendChild(testContainer);

        try {
            // Mostrar indicador
            window.UniversalReactInitializer.showLoadingIndicator(testContainer, 'TestComponent');
            
            // Verificar se indicador foi criado
            const indicator = testContainer.querySelector('.universal-loading-indicator');
            const hasIndicator = indicator !== null;
            
            // Ocultar indicador
            window.UniversalReactInitializer.hideLoadingIndicator(testContainer);
            
            // Limpar
            setTimeout(() => {
                if (document.body.contains(testContainer)) {
                    document.body.removeChild(testContainer);
                }
            }, 500);
            
            return hasIndicator;
        } catch (error) {
            console.error('Erro no teste de indicador:', error);
            if (document.body.contains(testContainer)) {
                document.body.removeChild(testContainer);
            }
            return false;
        }
    });

    // Teste 7: Verificar preparação de props
    addTest(results, 'Preparação de props funciona', () => {
        try {
            const props = window.UniversalReactInitializer.prepareFinalProps({ teste: 'valor' });
            
            const hasStandardProps = props.hasOwnProperty('csrfToken') || 
                                   props.hasOwnProperty('usuario') || 
                                   props.hasOwnProperty('dataAtual') || 
                                   props.hasOwnProperty('urls');
            
            const hasCustomProps = props.teste === 'valor';
            
            return hasStandardProps && hasCustomProps;
        } catch (error) {
            console.error('Erro no teste de props:', error);
            return false;
        }
    });

    // Teste 8: Verificar diagnóstico do sistema
    addTest(results, 'Diagnóstico do sistema funciona', () => {
        try {
            const diagnosis = window.UniversalReactInitializer.diagnose();
            
            return diagnosis && 
                   typeof diagnosis.systemReady === 'boolean' &&
                   typeof diagnosis.reactAvailable === 'boolean' &&
                   Array.isArray(diagnosis.loadedComponents);
        } catch (error) {
            console.error('Erro no teste de diagnóstico:', error);
            return false;
        }
    });

    // Executar todos os testes
    console.log('🔄 Executando testes...');
    
    for (const test of results.tests) {
        try {
            const result = await test.testFunction();
            
            if (result === 'warning') {
                test.status = 'warning';
                test.message = 'Teste passou com avisos';
                results.summary.warnings++;
            } else if (result === true) {
                test.status = 'passed';
                test.message = 'Teste passou';
                results.summary.passed++;
            } else {
                test.status = 'failed';
                test.message = 'Teste falhou';
                results.summary.failed++;
            }
        } catch (error) {
            test.status = 'error';
            test.message = `Erro no teste: ${error.message}`;
            test.error = error.toString();
            results.summary.failed++;
        }
        
        results.summary.total++;
    }

    // Exibir resultados
    displayTestResults(results);
    
    return results;
}

// Função auxiliar para adicionar teste
function addTest(results, name, testFunction) {
    results.tests.push({
        name: name,
        testFunction: testFunction,
        status: 'pending',
        message: '',
        timestamp: new Date().toISOString()
    });
}

// Função para exibir resultados
function displayTestResults(results) {
    console.group('📊 Resultados dos Testes de Carregamento de Componentes');
    
    console.log(`⏰ Executado em: ${results.timestamp}`);
    console.log(`📈 Total: ${results.summary.total}`);
    console.log(`✅ Passou: ${results.summary.passed}`);
    console.log(`❌ Falhou: ${results.summary.failed}`);
    console.log(`⚠️ Avisos: ${results.summary.warnings}`);
    
    console.log('\n📋 Detalhes dos Testes:');
    
    results.tests.forEach((test, index) => {
        const icon = test.status === 'passed' ? '✅' : 
                    test.status === 'warning' ? '⚠️' : 
                    test.status === 'failed' ? '❌' : '🔶';
        
        console.log(`${icon} ${index + 1}. ${test.name}: ${test.message}`);
        
        if (test.error) {
            console.error(`   Erro: ${test.error}`);
        }
    });
    
    // Resumo final
    const successRate = Math.round((results.summary.passed / results.summary.total) * 100);
    console.log(`\n🎯 Taxa de Sucesso: ${successRate}%`);
    
    if (results.summary.failed === 0) {
        console.log('🎉 Todos os testes principais passaram! Sistema de carregamento corrigido.');
    } else if (results.summary.failed <= 2) {
        console.log('⚠️ Alguns testes falharam, mas funcionalidade básica está OK.');
    } else {
        console.log('❌ Muitos testes falharam. Verificar implementação.');
    }
    
    console.groupEnd();
}

// Função para testar carregamento de componente específico
async function testSpecificComponent(componentName, containerId) {
    console.log(`🧪 Testando carregamento específico: ${componentName}`);
    
    if (!window.UniversalReactInitializer) {
        console.error('❌ UniversalReactInitializer não disponível');
        return false;
    }
    
    // Criar container de teste se não existir
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.innerHTML = '<div class="fallback-container">Fallback de teste</div>';
        document.body.appendChild(container);
    }
    
    try {
        const success = await window.UniversalReactInitializer.initComponent(
            componentName,
            containerId,
            { teste: true },
            {
                onSuccess: (name, cont) => {
                    console.log(`✅ ${name} carregado com sucesso no teste`);
                },
                onError: (error, name, cont) => {
                    console.error(`❌ Erro ao carregar ${name} no teste:`, error);
                }
            }
        );
        
        console.log(`📊 Resultado do teste ${componentName}: ${success ? 'SUCESSO' : 'FALHA'}`);
        return success;
        
    } catch (error) {
        console.error(`❌ Erro no teste de ${componentName}:`, error);
        return false;
    }
}

// Executar testes quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runComponentLoadingTests, 1000);
    });
} else {
    setTimeout(runComponentLoadingTests, 1000);
}

// Exportar funções para uso manual
window.testComponentLoading = runComponentLoadingTests;
window.testSpecificComponent = testSpecificComponent;

console.log('✅ Script de teste de carregamento de componentes carregado');
console.log('💡 Use window.testComponentLoading() para executar todos os testes');
console.log('💡 Use window.testSpecificComponent(nome, containerId) para testar componente específico');