import React from 'react';
import { createRoot } from 'react-dom/client';
import PerfilReact from '../components/PerfilReact';

console.log('🚀 Perfil Debug Bundle carregado');
console.log('- React:', typeof React);
console.log('- createRoot:', typeof createRoot);
console.log('- PerfilReact:', typeof PerfilReact);

// Função para inicializar o componente
function initializePerfil() {
    console.log('🔄 Inicializando PerfilReact...');
    
    const rootDiv = document.getElementById('perfil-react-root');
    if (!rootDiv) {
        console.error('❌ Container perfil-react-root não encontrado!');
        return;
    }
    
    console.log('✅ Container encontrado:', rootDiv);
    
    // Buscar props do window
    const props = window.perfilProps || {};
    console.log('📦 Props recebidas:', props);
    
    try {
        const root = createRoot(rootDiv);
        root.render(React.createElement(PerfilReact, props));
        
        console.log('✅ PerfilReact renderizado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao renderizar PerfilReact:', error);
    }
}

// Aguardar DOM estar pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePerfil);
} else {
    // DOM já está pronto
    setTimeout(initializePerfil, 100);
}

// Também tentar após um delay maior
setTimeout(() => {
    if (document.getElementById('perfil-react-root')?.querySelector('.loading-spinner')) {
        console.log('⚠️ Componente ainda não renderizado, tentando novamente...');
        initializePerfil();
    }
}, 1000);







