// Script de diagnóstico para problemas do dashboard home
console.log('🔍 Iniciando diagnóstico do dashboard home...');

// 1. Verificar se React está carregado
console.log('📦 Verificando React...');
if (typeof React !== 'undefined') {
    console.log('✅ React carregado:', React.version);
} else {
    console.error('❌ React não está carregado');
}

if (typeof ReactDOM !== 'undefined') {
    console.log('✅ ReactDOM carregado');
} else {
    console.error('❌ ReactDOM não está carregado');
}

// 2. Verificar serviços React
console.log('🔧 Verificando serviços React...');
const services = [
    'ReactDebugger',
    'ReactErrorBoundary', 
    'ReactDependencyChecker',
    'ReactComponentInitializer',
    'SafeComponentLoader',
    'ReactErrorHandling',
    'ReactInitializer',
    'ComponentDetectionSystem'
];

services.forEach(service => {
    if (typeof window[service] !== 'undefined') {
        console.log(`✅ ${service} disponível`);
    } else {
        console.error(`❌ ${service} não disponível`);
    }
});

// 3. Verificar componente HomeReact
console.log('🏠 Verificando componente HomeReact...');
if (typeof window.HomeReact !== 'undefined') {
    console.log('✅ HomeReact disponível');
} else {
    console.error('❌ HomeReact não disponível');
}

// 4. Verificar container
console.log('📦 Verificando container...');
const container = document.getElementById('home-react-root');
if (container) {
    console.log('✅ Container home-react-root encontrado');
} else {
    console.error('❌ Container home-react-root não encontrado');
}

// 5. Verificar bundles carregados
console.log('📦 Verificando bundles...');
const scripts = document.querySelectorAll('script[src]');
const loadedScripts = Array.from(scripts).map(script => script.src);

console.log('📜 Scripts carregados:');
loadedScripts.forEach(src => {
    if (src.includes('react') || src.includes('bundle')) {
        console.log(`  - ${src}`);
    }
});

// 6. Testar renderização simples
console.log('🧪 Testando renderização simples...');
if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined' && container) {
    try {
        const testElement = React.createElement('div', {
            style: { 
                padding: '20px', 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '10px',
                color: 'white',
                textAlign: 'center'
            }
        }, '🧪 Teste de renderização React funcionando!');
        
        if (ReactDOM.createRoot) {
            const root = ReactDOM.createRoot(container);
            root.render(testElement);
        } else {
            ReactDOM.render(testElement, container);
        }
        
        console.log('✅ Teste de renderização bem-sucedido');
    } catch (error) {
        console.error('❌ Erro no teste de renderização:', error);
    }
}

// 7. Verificar erros de rede
console.log('🌐 Verificando erros de rede...');
const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        if (entry.name.includes('.js') && entry.responseStatus >= 400) {
            console.error(`❌ Erro de rede: ${entry.name} - Status: ${entry.responseStatus}`);
        }
    });
});
observer.observe({entryTypes: ['navigation', 'resource']});

console.log('🔍 Diagnóstico concluído. Verifique os logs acima para identificar problemas.');