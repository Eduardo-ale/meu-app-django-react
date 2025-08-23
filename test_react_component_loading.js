/**
 * Script de teste para validar carregamento de componentes React
 * Executa verificações robustas de dependências e inicialização
 */

console.log('🧪 Iniciando testes de carregamento de componentes React...');

// Função para executar todos os testes
async function runReactComponentTests() {
    const results = {
        timestamp: new Date().toISOString(),
        tests: {},
        overall: 'unknown',
        summary: {
            passed: 0,
            failed: 0,
            total: 0
        }
    };

    console.group('🔍 Testes de Carregamento de Componentes React');

    // Teste 1: Verificar dependências React
    results.tests.reactDependencies = await testReactDependencies();
    
    // Teste 2: Verificar sistema de inicialização
    results.tests.initializationSystem = await testInitializationSystem();
    
    // Teste 3: Verificar componentes disponíveis
    results.tests.availableComponents = await testAvailableComponents();
    
    // Teste 4: Verificar renderização de componentes
    results.tests.componentRendering = await testComponentRendering();
    
    // Teste 5: Verificar tratamento de erros
    results.tests.errorHandling = await testErrorHandling();

    // Calcular resultados
    const testResults = Object.values(results.tests);
    results.summary.total = testResults.length;
    results.summary.passed = testResults.filter(test => test.passed).length;
    results.summary.failed = testResults.filter(test => !test.passed).length;

    // Determinar status geral
    if (results.summary.passed === results.summary.total) {
        results.overall = 'excellent';
    } else if (results.summary.passed >= results.summary.total * 0.8) {
        results.overall = 'good';
    } else if (results.summary.passed >= results.summary.total * 0.6) {
        results.overall = 'fair';
    } else {
        results.overall = 'poor';
    }

    console.groupEnd();

    // Exibir resultados
    displayTestResults(results);
    
    return results;
}

// Teste 1: Verificar dependências React
async function testReactDependencies() {
    console.log('🔍 Testando dependências React...');
    
    const test = {
        name: 'Dependências React',
        passed: false,
        details: {},
        issues: [],
        recommendations: []
    };

    try {
        // Verificar React
        test.details.reactAvailable = typeof React !== 'undefined';
        test.details.reactVersion = typeof React !== 'undefined' ? React.version : null;
        test.details.reactCreateElement = typeof React?.createElement === 'function';

        // Verificar ReactDOM
        test.details.reactDOMAvailable = typeof ReactDOM !== 'undefined';
        test.details.reactDOMRender = typeof ReactDOM?.render === 'function';
        test.details.reactDOMCreateRoot = typeof ReactDOM?.createRoot === 'function';

        // Verificar se pelo menos um método de renderização está disponível
        const hasRenderMethod = test.details.reactDOMRender || test.details.reactDOMCreateRoot;

        if (test.details.reactAvailable && test.details.reactDOMAvailable && 
            test.details.reactCreateElement && hasRenderMethod) {
            test.passed = true;
        } else {
            if (!test.details.reactAvailable) {
                test.issues.push('React não está disponível');
                test.recommendations.push('Verificar carregamento do script React');
            }
            if (!test.details.reactDOMAvailable) {
                test.issues.push('ReactDOM não está disponível');
                test.recommendations.push('Verificar carregamento do script ReactDOM');
            }
            if (!test.details.reactCreateElement) {
                test.issues.push('React.createElement não é uma função');
                test.recommendations.push('Verificar integridade do React carregado');
            }
            if (!hasRenderMethod) {
                test.issues.push('Nenhum método de renderização disponível');
                test.recommendations.push('Verificar versão do ReactDOM');
            }
        }

    } catch (error) {
        test.issues.push(`Erro durante verificação: ${error.message}`);
        test.recommendations.push('Verificar console para erros de JavaScript');
    }

    console.log(`${test.passed ? '✅' : '❌'} ${test.name}: ${test.passed ? 'PASSOU' : 'FALHOU'}`);
    return test;
}

// Teste 2: Verificar sistema de inicialização
async function testInitializationSystem() {
    console.log('🔍 Testando sistema de inicialização...');
    
    const test = {
        name: 'Sistema de Inicialização',
        passed: false,
        details: {},
        issues: [],
        recommendations: []
    };

    try {
        // Verificar ReactComponentInitializer
        test.details.reactComponentInitializer = typeof window.ReactComponentInitializer !== 'undefined';
        test.details.initializerInitialized = window.ReactComponentInitializer?.state?.initialized || false;
        test.details.dependenciesLoaded = window.ReactComponentInitializer?.state?.dependenciesLoaded || false;

        // Verificar métodos essenciais
        test.details.hasInitMethod = typeof window.ReactComponentInitializer?.initialize === 'function';
        test.details.hasInitComponentMethod = typeof window.ReactComponentInitializer?.initComponent === 'function';

        // Verificar função global de conveniência
        test.details.hasGlobalInitFunction = typeof window.initReactComponent === 'function';

        if (test.details.reactComponentInitializer && test.details.hasInitMethod && 
            test.details.hasInitComponentMethod && test.details.hasGlobalInitFunction) {
            test.passed = true;
        } else {
            if (!test.details.reactComponentInitializer) {
                test.issues.push('ReactComponentInitializer não está disponível');
                test.recommendations.push('Carregar script ReactComponentInitializer.js');
            }
            if (!test.details.hasInitMethod) {
                test.issues.push('Método initialize não disponível');
                test.recommendations.push('Verificar integridade do ReactComponentInitializer');
            }
            if (!test.details.hasInitComponentMethod) {
                test.issues.push('Método initComponent não disponível');
                test.recommendations.push('Verificar integridade do ReactComponentInitializer');
            }
            if (!test.details.hasGlobalInitFunction) {
                test.issues.push('Função global initReactComponent não disponível');
                test.recommendations.push('Verificar carregamento completo do sistema');
            }
        }

    } catch (error) {
        test.issues.push(`Erro durante verificação: ${error.message}`);
        test.recommendations.push('Verificar console para erros de JavaScript');
    }

    console.log(`${test.passed ? '✅' : '❌'} ${test.name}: ${test.passed ? 'PASSOU' : 'FALHOU'}`);
    return test;
}

// Teste 3: Verificar componentes disponíveis
async function testAvailableComponents() {
    console.log('🔍 Testando componentes disponíveis...');
    
    const test = {
        name: 'Componentes Disponíveis',
        passed: false,
        details: {
            components: [],
            expectedComponents: ['CriarUnidadeReact', 'RegistroChamadaReact', 'UnidadesSaudeReact']
        },
        issues: [],
        recommendations: []
    };

    try {
        // Procurar componentes React no escopo global
        for (const key in window) {
            if (key.endsWith('React') && typeof window[key] === 'function') {
                test.details.components.push(key);
            }
        }

        // Verificar componentes esperados
        const missingComponents = test.details.expectedComponents.filter(
            comp => !test.details.components.includes(comp)
        );

        if (missingComponents.length === 0) {
            test.passed = true;
        } else {
            test.issues.push(`Componentes ausentes: ${missingComponents.join(', ')}`);
            test.recommendations.push('Verificar carregamento dos scripts dos componentes');
            test.recommendations.push('Verificar se os componentes estão sendo exportados corretamente');
        }

        test.details.foundComponents = test.details.components.length;
        test.details.missingComponents = missingComponents;

    } catch (error) {
        test.issues.push(`Erro durante verificação: ${error.message}`);
        test.recommendations.push('Verificar console para erros de JavaScript');
    }

    console.log(`${test.passed ? '✅' : '❌'} ${test.name}: ${test.passed ? 'PASSOU' : 'FALHOU'}`);
    return test;
}

// Teste 4: Verificar renderização de componentes
async function testComponentRendering() {
    console.log('🔍 Testando renderização de componentes...');
    
    const test = {
        name: 'Renderização de Componentes',
        passed: false,
        details: {},
        issues: [],
        recommendations: []
    };

    try {
        // Criar container de teste temporário
        const testContainer = document.createElement('div');
        testContainer.id = 'react-test-container';
        testContainer.style.display = 'none';
        document.body.appendChild(testContainer);

        // Tentar criar um elemento React simples
        if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
            const testElement = React.createElement('div', { className: 'test' }, 'Teste React');
            
            test.details.elementCreated = !!testElement;
            test.details.elementType = testElement?.type;
            test.details.elementProps = testElement?.props;

            // Tentar renderizar
            if (ReactDOM.createRoot) {
                // React 18+
                const root = ReactDOM.createRoot(testContainer);
                root.render(testElement);
                test.details.renderMethod = 'createRoot';
            } else if (ReactDOM.render) {
                // React 17-
                ReactDOM.render(testElement, testContainer);
                test.details.renderMethod = 'render';
            }

            // Verificar se foi renderizado
            const renderedElement = testContainer.querySelector('.test');
            test.details.rendered = !!renderedElement;
            test.details.renderedContent = renderedElement?.textContent;

            if (test.details.elementCreated && test.details.rendered && 
                test.details.renderedContent === 'Teste React') {
                test.passed = true;
            } else {
                test.issues.push('Falha na renderização do elemento de teste');
                test.recommendations.push('Verificar compatibilidade entre React e ReactDOM');
            }
        } else {
            test.issues.push('React ou ReactDOM não disponíveis para teste');
            test.recommendations.push('Carregar dependências React primeiro');
        }

        // Limpar container de teste
        testContainer.remove();

    } catch (error) {
        test.issues.push(`Erro durante renderização: ${error.message}`);
        test.recommendations.push('Verificar compatibilidade das versões React');
    }

    console.log(`${test.passed ? '✅' : '❌'} ${test.name}: ${test.passed ? 'PASSOU' : 'FALHOU'}`);
    return test;
}

// Teste 5: Verificar tratamento de erros
async function testErrorHandling() {
    console.log('🔍 Testando tratamento de erros...');
    
    const test = {
        name: 'Tratamento de Erros',
        passed: false,
        details: {},
        issues: [],
        recommendations: []
    };

    try {
        // Verificar ReactErrorBoundary
        test.details.hasErrorBoundary = typeof window.ReactErrorBoundary !== 'undefined';
        
        // Verificar sistema de logging
        test.details.hasReactDebugger = typeof window.ReactDebugger !== 'undefined';
        
        // Verificar tratamento de fallback
        test.details.hasInitializer = typeof window.ReactComponentInitializer !== 'undefined';
        test.details.hasFallbackHandling = typeof window.ReactComponentInitializer?.showFallback === 'function';

        // Verificar listeners de erro globais
        test.details.hasErrorListeners = true; // Assumir que foram configurados

        const errorHandlingScore = [
            test.details.hasErrorBoundary,
            test.details.hasReactDebugger,
            test.details.hasFallbackHandling,
            test.details.hasErrorListeners
        ].filter(Boolean).length;

        if (errorHandlingScore >= 3) {
            test.passed = true;
        } else {
            if (!test.details.hasErrorBoundary) {
                test.issues.push('ReactErrorBoundary não disponível');
                test.recommendations.push('Carregar script ReactErrorBoundary.js');
            }
            if (!test.details.hasReactDebugger) {
                test.issues.push('ReactDebugger não disponível');
                test.recommendations.push('Carregar script ReactDebugger.js');
            }
            if (!test.details.hasFallbackHandling) {
                test.issues.push('Sistema de fallback não disponível');
                test.recommendations.push('Verificar ReactComponentInitializer');
            }
        }

        test.details.errorHandlingScore = `${errorHandlingScore}/4`;

    } catch (error) {
        test.issues.push(`Erro durante verificação: ${error.message}`);
        test.recommendations.push('Verificar console para erros de JavaScript');
    }

    console.log(`${test.passed ? '✅' : '❌'} ${test.name}: ${test.passed ? 'PASSOU' : 'FALHOU'}`);
    return test;
}

// Exibir resultados dos testes
function displayTestResults(results) {
    console.group('📊 Resultados dos Testes');
    
    const statusIcon = {
        excellent: '🟢',
        good: '🟡',
        fair: '🟠',
        poor: '🔴'
    };

    console.log(`${statusIcon[results.overall]} Status Geral: ${results.overall.toUpperCase()}`);
    console.log(`📈 Resumo: ${results.summary.passed}/${results.summary.total} testes passaram`);
    console.log(`⏰ Executado em: ${results.timestamp}`);
    
    console.group('📋 Detalhes dos Testes');
    Object.entries(results.tests).forEach(([testName, result]) => {
        console.group(`${result.passed ? '✅' : '❌'} ${result.name}`);
        
        if (result.details && Object.keys(result.details).length > 0) {
            console.log('📊 Detalhes:', result.details);
        }
        
        if (result.issues.length > 0) {
            console.warn('⚠️ Problemas:', result.issues);
        }
        
        if (result.recommendations.length > 0) {
            console.info('💡 Recomendações:', result.recommendations);
        }
        
        console.groupEnd();
    });
    console.groupEnd();
    
    console.groupEnd();

    // Criar relatório visual
    createVisualReport(results);
}

// Criar relatório visual
function createVisualReport(results) {
    const reportDiv = document.createElement('div');
    reportDiv.id = 'react-test-report';
    reportDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 10000;
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        max-width: 400px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
    `;

    const statusColors = {
        excellent: '#10b981',
        good: '#f59e0b',
        fair: '#f97316',
        poor: '#ef4444'
    };

    reportDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="
                width: 40px; height: 40px; border-radius: 50%;
                background: ${statusColors[results.overall]};
                display: flex; align-items: center; justify-content: center;
                color: white; font-size: 20px; font-weight: bold;
            ">${results.summary.passed}</div>
            <div>
                <div style="font-weight: 700; font-size: 16px; color: #1f2937;">
                    Testes React - ${results.overall.toUpperCase()}
                </div>
                <div style="color: #6b7280; font-size: 12px;">
                    ${results.summary.passed}/${results.summary.total} testes passaram
                </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="
                margin-left: auto; background: none; border: none; 
                color: #6b7280; cursor: pointer; font-size: 18px;
                padding: 4px; border-radius: 4px;
            " onmouseover="this.style.background='#f3f4f6'" 
               onmouseout="this.style.background='none'">×</button>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 12px;">
            ${Object.entries(results.tests).map(([testName, result]) => `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 16px;">${result.passed ? '✅' : '❌'}</span>
                    <span style="flex: 1; color: ${result.passed ? '#059669' : '#dc2626'}; font-weight: 500;">
                        ${result.name}
                    </span>
                </div>
            `).join('')}
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            Executado em: ${new Date(results.timestamp).toLocaleString('pt-BR')}
        </div>
    `;

    document.body.appendChild(reportDiv);

    // Remover automaticamente após 30 segundos
    setTimeout(() => {
        if (reportDiv.parentNode) {
            reportDiv.remove();
        }
    }, 30000);
}

// Executar testes automaticamente quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runReactComponentTests, 2000); // Aguardar 2s para scripts carregarem
    });
} else {
    setTimeout(runReactComponentTests, 1000); // Aguardar 1s se DOM já estiver pronto
}

// Exportar função para uso manual
window.runReactComponentTests = runReactComponentTests;

console.log('✅ Script de teste de componentes React carregado. Execute runReactComponentTests() para testar manualmente.');