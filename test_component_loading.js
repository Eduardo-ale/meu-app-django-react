// Script de teste para verificar carregamento de componentes React
console.log('🧪 Iniciando teste de carregamento de componentes...');

// Aguardar carregamento da página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(runComponentTests, 2000);
});

function runComponentTests() {
    console.log('🔍 Executando testes de componentes...');
    
    // Test 1: Verificar se React está disponível
    if (typeof React === 'undefined') {
        console.error('❌ React não está disponível');
        return;
    }
    console.log('✅ React disponível (versão: ' + React.version + ')');
    
    // Test 2: Verificar se ReactDOM está disponível
    if (typeof ReactDOM === 'undefined') {
        console.error('❌ ReactDOM não está disponível');
        return;
    }
    console.log('✅ ReactDOM disponível');
    
    // Test 3: Verificar componentes específicos
    const componentsToTest = [
        { name: 'CriarUnidadeReact', containerId: 'criar-unidade-react-root' },
        { name: 'RegistroChamadaReact', containerId: 'registro-chamada-root' },
        { name: 'HomeReact', containerId: 'home-react-root' },
        { name: 'UnidadesSaudeReact', containerId: 'unidades-saude-react-root' }
    ];
    
    componentsToTest.forEach(comp => {
        console.log(`🔍 Testando ${comp.name}...`);
        
        // Verificar se componente está disponível
        if (typeof window[comp.name] === 'undefined') {
            console.warn(`⚠️ ${comp.name} não está disponível no window`);
            return;
        }
        console.log(`✅ ${comp.name} disponível no window`);
        
        // Verificar se container existe
        const container = document.getElementById(comp.containerId);
        if (!container) {
            console.warn(`⚠️ Container ${comp.containerId} não encontrado na página`);
            return;
        }
        console.log(`✅ Container ${comp.containerId} encontrado`);
        
        // Tentar instanciar componente
        try {
            const element = React.createElement(window[comp.name], {});
            console.log(`✅ ${comp.name} pode ser instanciado`);
            
            // Tentar renderizar (apenas se container estiver vazio)
            if (container.children.length === 0 || container.innerHTML.trim() === '') {
                console.log(`🎨 Tentando renderizar ${comp.name}...`);
                const root = ReactDOM.createRoot(container);
                root.render(element);
                console.log(`✅ ${comp.name} renderizado com sucesso`);
            } else {
                console.log(`ℹ️ Container ${comp.containerId} já tem conteúdo, pulando renderização`);
            }
            
        } catch (error) {
            console.error(`❌ Erro ao instanciar ${comp.name}:`, error);
        }
    });
    
    // Test 4: Verificar serviços React
    const services = [
        'ReactDebugger',
        'ReactErrorHandling',
        'SafeComponentLoader',
        'ReactInitializer'
    ];
    
    console.log('🛠️ Verificando serviços React...');
    services.forEach(service => {
        if (typeof window[service] !== 'undefined') {
            console.log(`✅ ${service} disponível`);
        } else {
            console.warn(`⚠️ ${service} não disponível`);
        }
    });
    
    // Test 5: Verificar erros no console
    console.log('📊 Resumo dos testes concluído');
    console.log('💡 Verifique o console para erros adicionais');
}

// Interceptar erros JavaScript
window.addEventListener('error', function(event) {
    console.error('🚨 Erro JavaScript capturado:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

// Interceptar promises rejeitadas
window.addEventListener('unhandledrejection', function(event) {
    console.error('🚨 Promise rejeitada não tratada:', event.reason);
});

console.log('✅ Sistema de teste de componentes inicializado');