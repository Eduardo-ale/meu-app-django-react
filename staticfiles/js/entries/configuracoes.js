import React from 'react';
import { createRoot } from 'react-dom/client';
import ConfiguracoesReact from '../components/ConfiguracoesReact';

const rootDiv = document.getElementById('configuracoes-root');
if (rootDiv) {
  const root = createRoot(rootDiv);
  root.render(<ConfiguracoesReact />);
}