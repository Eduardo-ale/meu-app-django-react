// Script específico para testar carregamento de bundles e identificar erros de renderização
console.log('🔍 Iniciando teste específico de carregamento de bundles...');

// Função para testar carregamento de um bundle específico
function testBundleLoad(bundlePath) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = bundlePath;
        
        script.onload = () => {
            console.log(`✅ Bundle carregado com sucesso: ${bundlePath}`);
            resolve({ success: true, path: bundlePath });
        };
        
        script.onerror = (error) => {
            console.error(`❌ Erro ao carregar bundle: ${bundlePath}`, error);
            reject({ success: false, path: bundlePath, error });
        };
        
        document.head.appendChild(script);
    });
}

// Função para testar se um componente React pode ser renderizado
function testComponentRendering(componentName, containerId) {
    console.log(`🧪 Testando renderização do componente: ${componentName}`);
    
    if (typeof React === 'undefined') {
        console.error('❌ React não está disponível');
        return false;
    }
    
    if (typeof ReactDOM === 'undefined') {
        console.error('❌ ReactDOM não está disponível');
        return false;
    }
    
    if (!window[componentName]) {
        console.error(`❌ Componente ${componentName} não está disponível`);
        return false;
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ Container ${containerId} não encontrado`);
        return false;
    }
    
    try {
        // Tentar renderizar o componente
        const component = React.createElement(window[componentName], {
            // Props básicas de teste
            usuario: { id: 1, username: 'teste', full_name: 'Usuário Teste' },
            dataAtual: new Date().toISOString(),
            csrfToken: 'test-token'
        });
        
        if (ReactDOM.createRoot) {
            const root = ReactDOM.createRoot(container);
            root.render(component);
        } else {
            ReactDOM.render(component, container);
        }
        
        console.log(`✅ Componente ${componentName} renderizado com sucesso`);
        return true;
    } catch (error) {
        console.error(`❌ Erro ao renderizar ${componentName}:`, error);
        return false;
    }
}

// Função para verificar erros específicos de sintaxe nos bundles
async function checkBundleSyntax(bundlePath) {
    try {
        const response = await fetch(bundlePath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const content = await response.text();
        
        // Verificar se o bundle tem conteúdo
        if (content.length === 0) {
            console.error(`❌ Bundle vazio: ${bundlePath}`);
            return false;
        }
        
        // Verificar se parece ser JavaScript válido
        if (!content.includes('function') && !content.includes('=>') && !content.includes('var')) {
            console.error(`❌ Bundle não parece conter JavaScript válido: ${bundlePath}`);
            return false;
        }
        
        console.log(`✅ Bundle parece válido: ${bundlePath} (${content.length} bytes)`);
        return true;
    } catch (error) {
        console.error(`❌ Erro ao verificar bundle ${bundlePath}:`, error);
        return false;
    }
}

// Função principal de diagnóstico
async function runBundleDiagnostic() {
    console.log('🚀 Iniciando diagnóstico completo de bundles...');
    
    const bundles = [
        '/static/js/dist/react-services.bundle.js',
        '/static/js/dist/criar-unidade.bundle.js',
        '/static/js/dist/registro-chamada.bundle.js',
        '/static/js/dist/home.bundle.js'
    ];
    
    // Verificar sintaxe dos bundles
    console.log('📝 Verificando sintaxe dos bundles...');
    for (const bundle of bundles) {
        await checkBundleSyntax(bundle);
    }
    
    // Verificar se React está disponível
    console.log('⚛️ Verificando disponibilidade do React...');
    if (typeof React === 'undefined') {
        console.error('❌ React não está carregado. Tentando carregar...');
        
        // Tentar carregar React via CDN
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/react@18/umd/react.development.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Carregar bundles sequencialmente
    console.log('📦 Carregando bundles sequencialmente...');
    for (const bundle of bundles) {
        try {
            await testBundleLoad(bundle);
            // Aguardar um pouco entre carregamentos
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`❌ Falha ao carregar ${bundle}:`, error);
        }
    }
    
    // Verificar componentes disponíveis
    console.log('🧩 Verificando componentes disponíveis...');
    const expectedComponents = [
        'CriarUnidadeReact',
        'RegistroChamadaReact',
        'HomeReact'
    ];
    
    expectedComponents.forEach(componentName => {
        if (window[componentName]) {
            console.log(`✅ Componente disponível: ${componentName}`);
        } else {
            console.error(`❌ Componente não disponível: ${componentName}`);
        }
    });
    
    // Verificar serviços React
    console.log('🛠️ Verificando serviços React...');
    const expectedServices = [
        'ReactErrorHandling',
        'SafeComponentLoader',
        'ReactDebugger',
        'ReactInitializer'
    ];
    
    expectedServices.forEach(serviceName => {
        if (window[serviceName]) {
            console.log(`✅ Serviço disponível: ${serviceName}`);
        } else {
            console.error(`❌ Serviço não disponível: ${serviceName}`);
        }
    });
    
    console.log('🏁 Diagnóstico de bundles concluído!');
}

// Função para testar renderização específica
function testSpecificRendering() {
    console.log('🎨 Testando renderização específica...');
    
    // Criar container de teste
    const testContainer = document.createElement('div');
    testContainer.id = 'test-render-container';
    testContainer.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 300px;
        height: 200px;
        background: white;
        border: 2px solid #007bff;
        border-radius: 8px;
        padding: 1rem;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(testContainer);
    
    // Testar renderização de componente simples
    if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
        try {
            const TestComponent = React.createElement('div', {
                style: { textAlign: 'center', padding: '1rem' }
            }, 
                React.createElement('h4', { style: { color: '#28a745', margin: '0 0 0.5rem 0' } }, '✅ React OK'),
                React.createElement('p', { style: { margin: '0', fontSize: '0.9rem' } }, 'Renderização funcionando'),
                React.createElement('button', {
                    onClick: () => testContainer.remove(),
                    style: {
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '0.5rem'
                    }
                }, 'Fechar')
            );
            
            if (ReactDOM.createRoot) {
                const root = ReactDOM.createRoot(testContainer);
                root.render(TestComponent);
            } else {
                ReactDOM.render(TestComponent, testContainer);
            }
            
            console.log('✅ Teste de renderização bem-sucedido');
        } catch (error) {
            console.error('❌ Erro no teste de renderização:', error);
            testContainer.innerHTML = `
                <div style="color: #dc3545; text-align: center;">
                    <h4>❌ Erro de Renderização</h4>
                    <p style="font-size: 0.8rem;">${error.message}</p>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">
                        Fechar
                    </button>
                </div>
            `;
        }
    } else {
        testContainer.innerHTML = `
            <div style="color: #dc3545; text-align: center;">
                <h4>❌ React Indisponível</h4>
                <p style="font-size: 0.8rem;">React ou ReactDOM não carregados</p>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">
                    Fechar
                </button>
            </div>
        `;
    }
}

// Exportar funções para uso global
window.BundleTestTools = {
    runBundleDiagnostic,
    testSpecificRendering,
    testBundleLoad,
    testComponentRendering,
    checkBundleSyntax
};

// Executar diagnóstico automaticamente quando carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, aguardando para executar diagnóstico...');
    setTimeout(() => {
        runBundleDiagnostic();
    }, 2000);
});

console.log('🛠️ Ferramentas de teste de bundle disponíveis em window.BundleTestTools');