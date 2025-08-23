// Script para testar conectividade do React DevTools
console.log('🛠️ Testando conectividade do React DevTools...\n');

function testReactDevToolsConnection() {
    const results = {
        devToolsDetected: false,
        reactDetected: false,
        reactDomDetected: false,
        componentsDetected: 0,
        fiberDetected: false,
        hookDetected: false
    };
    
    // Verificar se React DevTools está instalado
    if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined') {
        results.devToolsDetected = true;
        console.log('✅ React DevTools Global Hook detectado');
        
        const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
        
        // Verificar se há renderers registrados
        if (hook.renderers && hook.renderers.size > 0) {
            console.log(`✅ ${hook.renderers.size} renderer(s) React registrado(s)`);
        } else {
            console.log('⚠️ Nenhum renderer React registrado ainda');
        }
        
        // Verificar se há fiber roots
        if (hook.getFiberRoots) {
            const fiberRoots = hook.getFiberRoots(1); // React 16+
            if (fiberRoots && fiberRoots.size > 0) {
                results.fiberDetected = true;
                console.log(`✅ ${fiberRoots.size} Fiber root(s) detectado(s)`);
            } else {
                console.log('⚠️ Nenhum Fiber root detectado');
            }
        }
        
    } else {
        console.log('❌ React DevTools Global Hook não encontrado');
        console.log('💡 Instale a extensão React DevTools no seu navegador');
    }
    
    // Verificar React
    if (typeof React !== 'undefined') {
        results.reactDetected = true;
        console.log(`✅ React ${React.version} detectado`);
    } else {
        console.log('❌ React não detectado');
    }
    
    // Verificar ReactDOM
    if (typeof ReactDOM !== 'undefined') {
        results.reactDomDetected = true;
        console.log(`✅ ReactDOM ${ReactDOM.version} detectado`);
    } else {
        console.log('❌ ReactDOM não detectado');
    }
    
    // Contar componentes React disponíveis
    const reactComponents = [
        'CriarUnidadeReact',
        'RegistroChamadaReact',
        'ListaTelefonicaReact',
        'ConfiguracoesReact',
        'NotificacoesReact',
        'PerfilReact',
        'SenhaReact',
        'EditarUnidadeReact',
        'VisualizarUnidadeReact',
        'UnidadesSaudeReact',
        'RelatoriosReact',
        'CriarUsuarioReact',
        'HomeReact',
        'HomeSimpleReact',
        'ReactServicesReact'
    ];
    
    reactComponents.forEach(componentName => {
        if (typeof window[componentName] !== 'undefined') {
            results.componentsDetected++;
        }
    });
    
    console.log(`\n📊 Componentes React detectados: ${results.componentsDetected}/${reactComponents.length}`);
    
    // Testar renderização de um componente simples para verificar DevTools
    if (results.reactDetected && results.reactDomDetected) {
        console.log('\n🧪 Testando renderização de componente para DevTools...');
        
        try {
            // Criar um componente de teste simples
            const TestComponent = React.createElement('div', {
                id: 'devtools-test-component',
                style: { display: 'none' }
            }, 'Teste DevTools');
            
            // Criar container de teste
            const testContainer = document.createElement('div');
            testContainer.id = 'devtools-test-container';
            testContainer.style.display = 'none';
            document.body.appendChild(testContainer);
            
            // Renderizar componente
            ReactDOM.render(TestComponent, testContainer);
            
            console.log('✅ Componente de teste renderizado com sucesso');
            
            // Verificar se DevTools consegue detectar
            setTimeout(() => {
                if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && 
                    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.size > 0) {
                    console.log('✅ DevTools conseguiu detectar o componente renderizado');
                    results.hookDetected = true;
                } else {
                    console.log('⚠️ DevTools não conseguiu detectar o componente');
                }
                
                // Limpar teste
                document.body.removeChild(testContainer);
                
                // Mostrar resultado final
                showFinalResults(results);
            }, 1000);
            
        } catch (error) {
            console.log('❌ Erro ao testar renderização:', error.message);
            showFinalResults(results);
        }
    } else {
        showFinalResults(results);
    }
    
    return results;
}

function showFinalResults(results) {
    console.log('\n📋 RESUMO DO TESTE DE DEVTOOLS:');
    console.log('================================');
    console.log(`React DevTools Instalado: ${results.devToolsDetected ? '✅' : '❌'}`);
    console.log(`React Carregado: ${results.reactDetected ? '✅' : '❌'}`);
    console.log(`ReactDOM Carregado: ${results.reactDomDetected ? '✅' : '❌'}`);
    console.log(`Componentes Detectados: ${results.componentsDetected}/15`);
    console.log(`Fiber Roots Detectados: ${results.fiberDetected ? '✅' : '❌'}`);
    console.log(`Hook Funcionando: ${results.hookDetected ? '✅' : '❌'}`);
    
    const allGood = results.devToolsDetected && results.reactDetected && 
                   results.reactDomDetected && results.componentsDetected > 0;
    
    console.log(`\n${allGood ? '🎉' : '⚠️'} STATUS GERAL: ${allGood ? 'TUDO OK!' : 'PROBLEMAS DETECTADOS'}`);
    
    if (!results.devToolsDetected) {
        console.log('\n💡 DICAS PARA RESOLVER:');
        console.log('1. Instale a extensão React DevTools no Chrome/Firefox');
        console.log('2. Recarregue a página após instalar');
        console.log('3. Abra as ferramentas de desenvolvedor (F12)');
        console.log('4. Procure pelas abas "Components" e "Profiler"');
    }
    
    if (results.componentsDetected === 0) {
        console.log('\n💡 NENHUM COMPONENTE DETECTADO:');
        console.log('1. Verifique se os bundles foram carregados');
        console.log('2. Execute o build: npm run build:all');
        console.log('3. Verifique se não há erros 404 no console');
    }
}

// Executar teste
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testReactDevToolsConnection);
} else {
    testReactDevToolsConnection();
}

// Exportar para uso manual
window.testReactDevToolsConnection = testReactDevToolsConnection;