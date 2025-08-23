// Script de teste para verificar carregamento dos componentes React
console.log('🧪 Iniciando testes de carregamento dos componentes React...\n');

// Lista de componentes para testar
const componentsToTest = [
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

// Lista de bundles para verificar
const bundlesToTest = [
    'criar-unidade.bundle.js',
    'registro-chamada.bundle.js',
    'lista-telefonica.bundle.js',
    'configuracoes.bundle.js',
    'notificacoes.bundle.js',
    'perfil.bundle.js',
    'senha.bundle.js',
    'editar-unidade.bundle.js',
    'visualizar-unidade.bundle.js',
    'unidades-saude.bundle.js',
    'relatorios.bundle.js',
    'criar-usuario.bundle.js',
    'home.bundle.js',
    'home-simple.bundle.js',
    'react-services.bundle.js'
];

// Função para testar se um bundle existe
function testBundleExists(bundleName) {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = `/static/js/dist/${bundleName}`;
        
        script.onload = () => {
            console.log(`✅ Bundle ${bundleName} carregado com sucesso`);
            resolve({ bundle: bundleName, loaded: true, error: null });
        };
        
        script.onerror = (error) => {
            console.log(`❌ Erro ao carregar bundle ${bundleName}:`, error);
            resolve({ bundle: bundleName, loaded: false, error: error });
        };
        
        document.head.appendChild(script);
        
        // Timeout de 5 segundos
        setTimeout(() => {
            if (!script.onload.called && !script.onerror.called) {
                console.log(`⏰ Timeout ao carregar bundle ${bundleName}`);
                resolve({ bundle: bundleName, loaded: false, error: 'timeout' });
            }
        }, 5000);
    });
}

// Função para testar se um componente está disponível
function testComponentAvailable(componentName) {
    const isAvailable = typeof window[componentName] !== 'undefined';
    console.log(`${isAvailable ? '✅' : '❌'} Componente ${componentName}: ${isAvailable ? 'Disponível' : 'Não encontrado'}`);
    return isAvailable;
}

// Função principal de teste
async function runTests() {
    console.log('📦 Testando carregamento de bundles...\n');
    
    const bundleResults = [];
    for (const bundle of bundlesToTest) {
        const result = await testBundleExists(bundle);
        bundleResults.push(result);
        // Pequena pausa entre os testes
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🔍 Testando disponibilidade de componentes...\n');
    
    const componentResults = componentsToTest.map(component => ({
        component,
        available: testComponentAvailable(component)
    }));
    
    console.log('\n📊 RESUMO DOS TESTES:\n');
    
    // Resumo dos bundles
    const successfulBundles = bundleResults.filter(r => r.loaded).length;
    const failedBundles = bundleResults.filter(r => !r.loaded).length;
    
    console.log(`📦 Bundles: ${successfulBundles}/${bundleResults.length} carregados com sucesso`);
    if (failedBundles > 0) {
        console.log('❌ Bundles com falha:');
        bundleResults.filter(r => !r.loaded).forEach(r => {
            console.log(`   - ${r.bundle}: ${r.error}`);
        });
    }
    
    // Resumo dos componentes
    const availableComponents = componentResults.filter(r => r.available).length;
    const unavailableComponents = componentResults.filter(r => !r.available).length;
    
    console.log(`\n🧩 Componentes: ${availableComponents}/${componentResults.length} disponíveis`);
    if (unavailableComponents > 0) {
        console.log('❌ Componentes não encontrados:');
        componentResults.filter(r => !r.available).forEach(r => {
            console.log(`   - ${r.component}`);
        });
    }
    
    // Teste do React DevTools
    console.log('\n🛠️ Testando React DevTools...');
    const hasReactDevTools = typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined';
    console.log(`${hasReactDevTools ? '✅' : '❌'} React DevTools: ${hasReactDevTools ? 'Detectado' : 'Não detectado'}`);
    
    // Resultado final
    const allTestsPassed = failedBundles === 0 && unavailableComponents === 0;
    console.log(`\n${allTestsPassed ? '🎉' : '⚠️'} RESULTADO FINAL: ${allTestsPassed ? 'TODOS OS TESTES PASSARAM!' : 'ALGUNS TESTES FALHARAM'}`);
    
    return {
        bundleResults,
        componentResults,
        hasReactDevTools,
        allTestsPassed
    };
}

// Executar testes quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
} else {
    runTests();
}

// Exportar função para uso manual
window.testReactComponents = runTests;