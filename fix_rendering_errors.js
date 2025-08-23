// Script para identificar e corrigir erros específicos de renderização React
console.log('🔧 Iniciando correção de erros de renderização...');

// Função para verificar e corrigir problemas de inicialização
function fixInitializationIssues() {
    console.log('🔍 Verificando problemas de inicialização...');
    
    // 1. Verificar se React está disponível
    if (typeof React === 'undefined') {
        console.error('❌ PROBLEMA: React não está carregado');
        console.log('💡 SOLUÇÃO: Verificar se o script do React está sendo carregado antes dos componentes');
        return false;
    }
    
    if (typeof ReactDOM === 'undefined') {
        console.error('❌ PROBLEMA: ReactDOM não está carregado');
        console.log('💡 SOLUÇÃO: Verificar se o script do ReactDOM está sendo carregado');
        return false;
    }
    
    console.log('✅ React e ReactDOM estão disponíveis');
    return true;
}

// Função para verificar problemas de componentes
function checkComponentIssues() {
    console.log('🧩 Verificando problemas de componentes...');
    
    const expectedComponents = ['CriarUnidadeReact', 'RegistroChamadaReact', 'HomeReact'];
    const missingComponents = [];
    
    expectedComponents.forEach(componentName => {
        if (!window[componentName]) {
            missingComponents.push(componentName);
            console.error(`❌ PROBLEMA: Componente ${componentName} não encontrado`);
        } else {
            console.log(`✅ Componente ${componentName} disponível`);
        }
    });
    
    if (missingComponents.length > 0) {
        console.log('💡 SOLUÇÕES para componentes ausentes:');
        console.log('1. Verificar se os bundles estão sendo carregados corretamente');
        console.log('2. Verificar se há erros de sintaxe nos componentes');
        console.log('3. Verificar se os entry points estão configurados corretamente');
        return false;
    }
    
    return true;
}

// Função para verificar problemas de containers
function checkContainerIssues() {
    console.log('🎯 Verificando problemas de containers...');
    
    const containers = [
        'criar-unidade-react-root',
        'registro-chamada-react-root',
        'home-react-root'
    ];
    
    let foundContainers = 0;
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            foundContainers++;
            console.log(`✅ Container encontrado: ${containerId}`);
            
            // Verificar se o container tem conteúdo React
            if (container.innerHTML.includes('data-reactroot') || 
                container._reactInternalInstance ||
                container._reactInternalFiber) {
                console.log(`✅ Container ${containerId} tem conteúdo React`);
            } else {
                console.warn(`⚠️ Container ${containerId} não tem conteúdo React renderizado`);
            }
        } else {
            console.log(`ℹ️ Container ${containerId} não encontrado (normal se não estiver na página)`);
        }
    });
    
    return foundContainers > 0;
}

// Função para testar renderização manual
function testManualRendering() {
    console.log('🎨 Testando renderização manual...');
    
    if (!fixInitializationIssues()) {
        return false;
    }
    
    // Criar container de teste
    const testContainer = document.createElement('div');
    testContainer.id = 'manual-test-container';
    testContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 350px;
        min-height: 200px;
        background: white;
        border: 2px solid #007bff;
        border-radius: 12px;
        padding: 1.5rem;
        z-index: 10000;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    document.body.appendChild(testContainer);
    
    try {
        // Testar componente simples primeiro
        console.log('🧪 Testando componente simples...');
        
        const SimpleTestComponent = React.createElement('div', {
            style: { textAlign: 'center' }
        }, 
            React.createElement('h3', { 
                style: { color: '#28a745', margin: '0 0 1rem 0' } 
            }, '✅ React Funcionando'),
            React.createElement('p', { 
                style: { margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#666' } 
            }, `React versão: ${React.version}`),
            React.createElement('div', {
                style: { marginBottom: '1rem' }
            }, 
                React.createElement('strong', null, 'Componentes disponíveis:'),
                React.createElement('ul', { style: { textAlign: 'left', margin: '0.5rem 0', paddingLeft: '1.5rem' } },
                    ['CriarUnidadeReact', 'RegistroChamadaReact', 'HomeReact'].map(name => 
                        React.createElement('li', { 
                            key: name,
                            style: { 
                                color: window[name] ? '#28a745' : '#dc3545',
                                fontSize: '0.8rem'
                            }
                        }, `${window[name] ? '✅' : '❌'} ${name}`)
                    )
                )
            ),
            React.createElement('button', {
                onClick: () => {
                    testContainer.remove();
                    console.log('🗑️ Container de teste removido');
                },
                style: {
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                }
            }, 'Fechar Teste')
        );
        
        // Renderizar usando a API mais recente
        if (ReactDOM.createRoot) {
            const root = ReactDOM.createRoot(testContainer);
            root.render(SimpleTestComponent);
            console.log('✅ Renderização com createRoot bem-sucedida');
        } else {
            ReactDOM.render(SimpleTestComponent, testContainer);
            console.log('✅ Renderização com render bem-sucedida');
        }
        
        return true;
    } catch (error) {
        console.error('❌ ERRO na renderização manual:', error);
        testContainer.innerHTML = `
            <div style="color: #dc3545; text-align: center;">
                <h3 style="margin: 0 0 1rem 0;">❌ Erro de Renderização</h3>
                <p style="font-size: 0.9rem; margin: 0 0 1rem 0; word-break: break-word;">
                    ${error.message}
                </p>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
                    Fechar
                </button>
            </div>
        `;
        return false;
    }
}

// Função para testar componente específico
function testSpecificComponent(componentName, props = {}) {
    console.log(`🧪 Testando componente específico: ${componentName}`);
    
    if (!window[componentName]) {
        console.error(`❌ Componente ${componentName} não está disponível`);
        return false;
    }
    
    // Criar container de teste específico
    const testContainer = document.createElement('div');
    testContainer.id = `test-${componentName.toLowerCase()}`;
    testContainer.style.cssText = `
        position: fixed;
        top: 50px;
        left: 50px;
        width: 400px;
        height: 300px;
        background: white;
        border: 2px solid #28a745;
        border-radius: 12px;
        padding: 1rem;
        z-index: 10001;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        overflow: auto;
    `;
    document.body.appendChild(testContainer);
    
    try {
        // Props padrão para teste
        const defaultProps = {
            usuario: { id: 1, username: 'teste', full_name: 'Usuário Teste' },
            dataAtual: new Date().toISOString(),
            csrfToken: 'test-token',
            dadosPreenchimento: {},
            ...props
        };
        
        const component = React.createElement(window[componentName], defaultProps);
        
        if (ReactDOM.createRoot) {
            const root = ReactDOM.createRoot(testContainer);
            root.render(component);
        } else {
            ReactDOM.render(component, testContainer);
        }
        
        // Adicionar botão de fechar
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '❌ Fechar';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #dc3545;
            color: white;
            border: none;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
        `;
        closeButton.onclick = () => testContainer.remove();
        testContainer.appendChild(closeButton);
        
        console.log(`✅ Componente ${componentName} renderizado com sucesso`);
        return true;
    } catch (error) {
        console.error(`❌ Erro ao renderizar ${componentName}:`, error);
        testContainer.innerHTML = `
            <div style="color: #dc3545; padding: 1rem;">
                <h4>❌ Erro em ${componentName}</h4>
                <p style="font-size: 0.9rem; word-break: break-word;">${error.message}</p>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
                    Fechar
                </button>
            </div>
        `;
        return false;
    }
}

// Função para verificar problemas de bundle
async function checkBundleIssues() {
    console.log('📦 Verificando problemas de bundles...');
    
    const bundles = [
        '/static/js/dist/react-services.bundle.js',
        '/static/js/dist/criar-unidade.bundle.js',
        '/static/js/dist/registro-chamada.bundle.js'
    ];
    
    const bundleIssues = [];
    
    for (const bundlePath of bundles) {
        try {
            const response = await fetch(bundlePath);
            if (!response.ok) {
                bundleIssues.push(`${bundlePath}: HTTP ${response.status}`);
                console.error(`❌ PROBLEMA: Bundle ${bundlePath} retornou ${response.status}`);
            } else {
                const content = await response.text();
                if (content.length === 0) {
                    bundleIssues.push(`${bundlePath}: Arquivo vazio`);
                    console.error(`❌ PROBLEMA: Bundle ${bundlePath} está vazio`);
                } else {
                    console.log(`✅ Bundle ${bundlePath} OK (${content.length} bytes)`);
                }
            }
        } catch (error) {
            bundleIssues.push(`${bundlePath}: ${error.message}`);
            console.error(`❌ PROBLEMA: Erro ao carregar ${bundlePath}:`, error);
        }
    }
    
    if (bundleIssues.length > 0) {
        console.log('💡 SOLUÇÕES para problemas de bundle:');
        console.log('1. Executar: npm run build');
        console.log('2. Executar: python manage.py collectstatic');
        console.log('3. Verificar configuração do webpack');
        console.log('4. Verificar se os arquivos de entrada existem');
        return false;
    }
    
    return true;
}

// Função principal de diagnóstico e correção
async function runFullDiagnostic() {
    console.log('🚀 Executando diagnóstico completo...');
    
    const results = {
        initialization: fixInitializationIssues(),
        components: checkComponentIssues(),
        containers: checkContainerIssues(),
        bundles: await checkBundleIssues()
    };
    
    console.log('📊 Resultados do diagnóstico:');
    Object.entries(results).forEach(([test, result]) => {
        console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'OK' : 'PROBLEMA'}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('🎉 Todos os testes passaram! Sistema parece estar funcionando.');
        testManualRendering();
    } else {
        console.log('⚠️ Problemas encontrados. Verifique as soluções sugeridas acima.');
    }
    
    return results;
}

// Exportar funções para uso global
window.RenderingFixTools = {
    runFullDiagnostic,
    testManualRendering,
    testSpecificComponent,
    fixInitializationIssues,
    checkComponentIssues,
    checkContainerIssues,
    checkBundleIssues
};

// Executar diagnóstico automaticamente
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, executando diagnóstico em 3 segundos...');
    setTimeout(() => {
        runFullDiagnostic();
    }, 3000);
});

console.log('🛠️ Ferramentas de correção disponíveis em window.RenderingFixTools');