(function() {
    'use strict';
    
    console.log('🔄 [CRIAR USUÁRIO SIMPLE] Carregando componente simplificado...');
    
    function CriarUsuarioReactSimple(props) {
        console.log('🎯 [CRIAR USUÁRIO SIMPLE] Componente inicializado com props:', props);
        
        return React.createElement('div', { className: 'criar-usuario-simple' },
            React.createElement('h1', null, 'Criar Novo Usuário'),
            React.createElement('p', null, 'Versão simplificada funcionando!'),
            React.createElement('div', null, 
                'Total de usuários: ', 
                props.estatisticas_usuarios ? JSON.stringify(props.estatisticas_usuarios) : 'Não carregado'
            )
        );
    }
    
    // Disponibilizar o componente globalmente
    window.CriarUsuarioReactSimple = CriarUsuarioReactSimple;
    console.log('✅ [CRIAR USUÁRIO SIMPLE] Componente CriarUsuarioReactSimple definido globalmente');
    
})(); 