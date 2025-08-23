import React from 'react';
import { createRoot } from 'react-dom/client';
import RelatoriosReact from '../components/RelatoriosReact';

const rootDiv = document.getElementById('relatorios-root');
if (rootDiv) {
  const root = createRoot(rootDiv);
  root.render(<RelatoriosReact />);
}