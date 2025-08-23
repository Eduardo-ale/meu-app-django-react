// Teste para validar se o bundle está funcionando corretamente
// Execute este arquivo no console do navegador na página de criar unidade

console.log('🧪 Iniciando validação do bundle...');

// Teste 1: Verificar se React está disponível
console.log('📦 Teste 1: Verificando React...');
if (typeof React !== 'undefined') {
    console.log('✅ React disponível:', React.version);
} else {
    console.error('❌ React não disponível');
}

// Teste 2: Verificar se ReactDOM está disponível
console.log('📦 Teste 2: Verificando ReactDOM...');
if (typeof ReactDOM !== 'undefined') {
    console.log('✅ ReactDOM disponível');
} else {
    console.error('❌ ReactDOM não disponível');
}

// Teste 3: Verificar se o componente está disponível
console.log('📦 Teste 3: Verificando CriarUnidadeReact...');
if (typeof window.CriarUnidadeReact !== 'undefined') {
    console.log('✅ CriarUnidadeReact disponível:', typeof window.CriarUnidadeReact);
    
    // Teste 3.1: Verificar se é uma função
    if (typeof window.CriarUnidadeReact === 'function') {
        console.log('✅ CriarUnidadeReact é uma função válida');
        
        // Teste 3.2: Tentar criar um elemento
        try {
            const testProps = {
                dadosPreenchimento: {},
                municipios: [],
                tiposUnidade: []
            };
            const element = React.createElement(window.CriarUnidadeReact, testProps);
            console.log('✅ Elemento React criado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao criar elemento React:', error);
        }
    } else {
        console.error('❌ CriarUnidadeReact não é uma função');
    }
} else {
    console.error('❌ CriarUnidadeReact não disponível no escopo global');
}

// Teste 4: Verificar serviços de suporte
console.log('📦 Teste 4: Verificando serviços de suporte...');
const services = [
    'ReactInitializer',
    'SafeComponentLoader',
    'ReactDebugger',
    'ReactDependencyChecker'
];

services.forEach(service => {
    if (typeof window[service] !== 'undefined') {
        console.log(`✅ ${service} disponível`);
    } else {
        console.warn(`⚠️ ${service} não disponível`);
    }
});

// Teste 5: Verificar container
console.log('📦 Teste 5: Verificando container...');
const container = document.getElementById('criar-unidade-react-root');
if (container) {
    console.log('✅ Container encontrado:', container);
    console.log('📏 Container innerHTML length:', container.innerHTML.length);
} else {
    console.error('❌ Container não encontrado');
}

// Teste 6: Tentar renderização manual
console.log('📦 Teste 6: Tentando renderização manual...');
if (typeof React !== 'undefined' && 
    typeof ReactDOM !== 'undefined' && 
    typeof window.CriarUnidadeReact !== 'undefined' &&
    container) {
    
    try {
        const testProps = {
            dadosPreenchimento: {},
            municipios: [],
            tiposUnidade: [
                { value: 'UNIDADE_EXECUTANTE', label: '🏥 Executante' },
                { value: 'UNIDADE_SOLICITANTE', label: '📞 Solicitante' },
                { value: 'EXECUTANTE_SOLICITANTE', label: '🏥📞 Executante/Solicitante' }
            ]
        };
        
        const element = React.createElement(window.CriarUnidadeReact, testProps);
        
        // Criar um container de teste
        const testContainer = document.createElement('div');
        testContainer.id = 'test-container';
        testContainer.style.cssText = 'border: 2px solid red; padding: 10px; margin: 10px;';
        document.body.appendChild(testContainer);
        
        if (ReactDOM.createRoot) {
            const root = ReactDOM.createRoot(testContainer);
            root.render(element);
            console.log('✅ Renderização manual com createRoot bem-sucedida');
        } else {
            ReactDOM.render(element, testContainer);
            console.log('✅ Renderização manual com render bem-sucedida');
        }
        
    } catch (error) {
        console.error('❌ Erro na renderização manual:', error);
    }
} else {
    console.error('❌ Não é possível fazer renderização manual - dependências ausentes');
}

console.log('🏁 Validação do bundle concluída');