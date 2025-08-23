// Script de diagnóstico para identificar erros específicos do console
console.log('🔍 Iniciando diagnóstico detalhado de erros...');

// Capturar todos os erros do console
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const capturedErrors = [];
const capturedWarnings = [];

console.error = function(...args) {
    capturedErrors.push({
        timestamp: new Date().toISOString(),
        message: args.join(' '),
        stack: new Error().stack
    });
    originalConsoleError.apply(console, args);
};

console.warn = function(...args) {
    capturedWarnings.push({
        timestamp: new Date().toISOString(),
        message: args.join(' ')
    });
    originalConsoleWarn.apply(console, args);
};

// Capturar erros JavaScript globais
window.addEventListener('error', function(e) {
    console.error(`❌ JavaScript Error: ${e.message} at ${e.filename}:${e.lineno}:${e.colno}`);
});

// Capturar erros de recursos não carregados
window.addEventListener('error', function(e) {
    if (e.target !== window) {
        console.error(`❌ Resource Error: Failed to load ${e.target.src || e.target.href}`);
    }
}, true);

// Função para testar carregamento de bundles específicos
function testBundleLoading() {
    console.log('📦 Testando carregamento de bundles...');
    
    const bundles = [
        '/static/js/dist/react-services.bundle.js',
        '/static/js/dist/criar-unidade.bundle.js',
        '/static/js/dist/registro-chamada.bundle.js',
        '/static/js/dist/home.bundle.js',
        '/static/js/dist/unidades-saude.bundle.js'
    ];

    bundles.forEach(bundlePath => {
        fetch(bundlePath)
            .then(response => {
                if (response.ok) {
                    console.log(`✅ Bundle acessível: ${bundlePath}`);
                } else {
                    console.error(`❌ Bundle com erro ${response.status}: ${bundlePath}`);
                }
            })
            .catch(error => {
                console.error(`❌ Erro ao carregar bundle ${bundlePath}:`, error);
            });
    });
}

// Função para verificar componentes React
function checkReactComponents() {
    console.log('🧩 Verificando componentes React...');
    
    // Verificar React e ReactDOM
    if (typeof React === 'undefined') {
        console.error('❌ React não está carregado');
    } else {
        console.log(`✅ React carregado (versão: ${React.version})`);
    }
    
    if (typeof ReactDOM === 'undefined') {
        console.error('❌ ReactDOM não está carregado');
    } else {
        console.log('✅ ReactDOM carregado');
    }
    
    // Verificar componentes específicos
    const expectedComponents = [
        'CriarUnidadeReact',
        'RegistroChamadaReact',
        'HomeReact',
        'UnidadesSaudeReact'
    ];
    
    expectedComponents.forEach(componentName => {
        if (window[componentName]) {
            console.log(`✅ Componente ${componentName} encontrado`);
        } else {
            console.warn(`⚠️ Componente ${componentName} não encontrado`);
        }
    });
    
    // Verificar serviços React
    const expectedServices = [
        'ReactErrorHandling',
        'SafeComponentLoader',
        'ReactDebugger',
        'ReactInitializer'
    ];
    
    expectedServices.forEach(serviceName => {
        if (window[serviceName]) {
            console.log(`✅ Serviço ${serviceName} encontrado`);
        } else {
            console.warn(`⚠️ Serviço ${serviceName} não encontrado`);
        }
    });
}

// Função para verificar containers React
function checkReactContainers() {
    console.log('🎯 Verificando containers React...');
    
    const containers = [
        'criar-unidade-react-root',
        'registro-chamada-react-root',
        'home-react-root',
        'unidades-saude-react-root'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            console.log(`✅ Container encontrado: ${containerId}`);
            
            // Verificar se há conteúdo React renderizado
            if (container.innerHTML.includes('data-reactroot') || container._reactInternalInstance) {
                console.log(`✅ Container ${containerId} tem conteúdo React renderizado`);
            } else {
                console.warn(`⚠️ Container ${containerId} não tem conteúdo React renderizado`);
            }
        } else {
            console.log(`ℹ️ Container não encontrado: ${containerId} (normal se não estiver na página)`);
        }
    });
}

// Função para verificar scripts carregados
function checkLoadedScripts() {
    console.log('📄 Verificando scripts carregados...');
    
    const scripts = document.querySelectorAll('script[src]');
    const bundleScripts = Array.from(scripts).filter(script => 
        script.src.includes('bundle.js') || script.src.includes('react')
    );
    
    console.log(`📄 Encontrados ${bundleScripts.length} scripts relevantes:`);
    
    bundleScripts.forEach((script, index) => {
        console.log(`📄 Script ${index + 1}: ${script.src}`);
        
        // Verificar se o script foi carregado com sucesso
        if (script.readyState === 'complete' || script.readyState === 'loaded') {
            console.log(`✅ Script carregado: ${script.src}`);
        } else {
            console.warn(`⚠️ Script pode não ter carregado: ${script.src}`);
        }
    });
}

// Função para gerar relatório de erros
function generateErrorReport() {
    console.log('📊 Gerando relatório de erros...');
    
    if (capturedErrors.length > 0) {
        console.log(`❌ ${capturedErrors.length} erros capturados:`);
        capturedErrors.forEach((error, index) => {
            console.log(`${index + 1}. [${error.timestamp}] ${error.message}`);
        });
    } else {
        console.log('✅ Nenhum erro capturado até agora');
    }
    
    if (capturedWarnings.length > 0) {
        console.log(`⚠️ ${capturedWarnings.length} avisos capturados:`);
        capturedWarnings.forEach((warning, index) => {
            console.log(`${index + 1}. [${warning.timestamp}] ${warning.message}`);
        });
    } else {
        console.log('✅ Nenhum aviso capturado até agora');
    }
}

// Executar diagnósticos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página carregada, iniciando diagnósticos...');
    
    // Aguardar um pouco para scripts carregarem
    setTimeout(() => {
        testBundleLoading();
        checkReactComponents();
        checkReactContainers();
        checkLoadedScripts();
        
        // Gerar relatório após 5 segundos
        setTimeout(generateErrorReport, 5000);
    }, 1000);
});

// Exportar funções para uso manual
window.DiagnosticTools = {
    testBundleLoading,
    checkReactComponents,
    checkReactContainers,
    checkLoadedScripts,
    generateErrorReport,
    getCapturedErrors: () => capturedErrors,
    getCapturedWarnings: () => capturedWarnings
};

console.log('🛠️ Ferramentas de diagnóstico disponíveis em window.DiagnosticTools');