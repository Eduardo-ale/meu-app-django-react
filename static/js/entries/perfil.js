import React from 'react';
import { createRoot } from 'react-dom/client';
import PerfilReact from '../components/PerfilReact';

// Aguardar o DOM estar pronto
document.addEventListener('DOMContentLoaded', function() {
    const rootDiv = document.getElementById('perfil-react-root');
    if (rootDiv) {
        // Buscar props do window se disponível
        const props = window.perfilProps || {};
        
        const root = createRoot(rootDiv);
        root.render(React.createElement(PerfilReact, props));
        
        console.log('✅ PerfilReact renderizado com props:', props);
    }
});