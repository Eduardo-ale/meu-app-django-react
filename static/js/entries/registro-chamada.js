import React from 'react';
import { createRoot } from 'react-dom/client';
import RegistroChamadaReact from '../components/RegistroChamadaReact';

// Exportar componente para window (para testes e uso global)
window.RegistroChamadaReact = RegistroChamadaReact;

// Renderizar automaticamente se container existir
const rootDiv = document.getElementById('registro-chamada-root');
if (rootDiv) {
  const root = createRoot(rootDiv);
  root.render(React.createElement(RegistroChamadaReact));
}