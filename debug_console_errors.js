// Script de diagnóstico para identificar erros do console
console.log('🔍 Iniciando diagnóstico de erros do console...');

// 1. Verificar se React está carregado
console.log('📦 Verificando React...');
if (typeof React !== 'undefined') {
    console.log('✅ React carregado:', React.version);
} else {
    console.error('❌ React não encontrado');
}

if (typeof ReactDOM !== 'undefined') {
    console.log('✅ ReactDOM carregado');
} else {
    console.error('❌ ReactDOM não encontrado');
}

// 2. Verificar componentes globais
console.log('🧩 Verificando componentes globais...');
const expectedComponents = [
    'HomeReact',
    'CriarUnidadeReact', 
    'RegistroChamadaReact',
    'UnidadesSaudeReact',
    'ListaTelefonica'
];

expectedComponents.forEach(componentName => {
    if (window[componentName]) {
        console.log(`✅ ${componentName} encontrado`);
    } else {
        console.warn(`⚠️ ${componentName} não encontrado`);
    }
});

// 3. Verificar serviços React
console.log('🛠️ Verificando serviços React...');
const expectedServices = [
    'ReactErrorHandling',
    'SafeComponentLoader',
    'ReactDebugger',
    'ComponentDetectionSystem'
];

expectedServices.forEach(serviceName => {
    if (window[serviceName]) {
        console.log(`✅ ${serviceName} encontrado`);
    } else {
        console.warn(`⚠️ ${serviceName} não encontrado`);
    }
});

// 4. Testar carregamento de bundles
console.log('📦 Testando carregamento de bundles...');
const bundles = [
    '/static/js/dist/react-services.bundle.js',
    '/static/js/dist/home.bundle.js',
    '/static/js/dist/criar-unidade.bundle.js',
    '/static/js/dist/registro-chamada.bundle.js'
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

// 5. Verificar erros de sintaxe nos scripts
console.log('🔍 Verificando erros de sintaxe...');
const scripts = document.querySelectorAll('script[src*="bundle.js"]');
console.log(`📄 Encontrados ${scripts.length} scripts de bundle`);

scripts.forEach((script, index) => {
    console.log(`📄 Script ${index + 1}: ${script.src}`);
    
    script.addEventListener('error', (e) => {
        console.error(`❌ Erro ao carregar script: ${script.src}`, e);
    });
    
    script.addEventListener('load', (e) => {
        console.log(`✅ Script carregado: ${script.src}`);
    });
});

// 6. Verificar containers React
console.log('🎯 Verificando containers React...');
const containers = [
    'home-react-root',
    'criar-unidade-react-root',
    'registro-chamada-react-root'
];

containers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (container) {
        console.log(`✅ Container encontrado: ${containerId}`);
    } else {
        console.log(`ℹ️ Container não encontrado: ${containerId} (normal se não estiver na página)`);
    }
});

// 7. Verificar configuração de arquivos estáticos
console.log('📁 Verificando configuração de arquivos estáticos...');
console.log('🔗 Base URL:', window.location.origin);
console.log('📍 Página atual:', window.location.pathname);

// 8. Testar React DevTools
console.log('🛠️ Verificando React DevTools...');
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools hook encontrado');
} else {
    console.log('ℹ️ React DevTools hook não encontrado (normal se não instalado)');
}

console.log('🏁 Diagnóstico concluído!');