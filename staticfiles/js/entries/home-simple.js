import React from 'react';
import { createRoot } from 'react-dom/client';
import HomeReactSimple from '../components/HomeReactSimple';

// Exportar componente para window (para testes e uso global)
window.HomeReactSimple = HomeReactSimple;

// Renderizar automaticamente se container existir
const rootDiv = document.getElementById('home-react-root');
if (rootDiv) {
  const root = createRoot(rootDiv);
  root.render(React.createElement(HomeReactSimple));
}