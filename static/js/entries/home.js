import React from 'react';
import { createRoot } from 'react-dom/client';
import HomeReact from '../components/HomeReact';

// Exportar componente para window (para testes e uso global)
window.HomeReact = HomeReact;

// Renderizar automaticamente se container existir
const rootDiv = document.getElementById('home-react-root');
if (rootDiv) {
  const root = createRoot(rootDiv);
  root.render(React.createElement(HomeReact));
}