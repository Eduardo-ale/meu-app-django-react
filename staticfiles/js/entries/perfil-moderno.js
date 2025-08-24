import React from 'react';
import { createRoot } from 'react-dom/client';
import PerfilReactModerno from '../components/PerfilReactModerno';

console.log('🚀 Perfil React Moderno carregado!');

// Função para inicializar o componente
function initializePerfilModerno() {
    console.log('🎨 Inicializando Perfil React Moderno...');
    
    const rootDiv = document.getElementById('perfil-react-root');
    if (!rootDiv) {
        console.error('❌ Container perfil-react-root não encontrado!');
        return;
    }
    
    // Buscar props do window
    const props = window.perfilProps || {};
    console.log('📦 Props recebidas:', props);
    
    try {
        const root = createRoot(rootDiv);
        root.render(React.createElement(PerfilReactModerno, props));
        
        console.log('✨ Perfil React Moderno renderizado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao renderizar Perfil React Moderno:', error);
    }
}

// Aguardar DOM estar pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePerfilModerno);
} else {
    setTimeout(initializePerfilModerno, 100);
}








