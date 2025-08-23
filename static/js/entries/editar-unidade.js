import React from 'react';
import { createRoot } from 'react-dom/client';
import EditarUnidadeReact from '../components/EditarUnidadeReact';

const rootDiv = document.getElementById('editar-unidade-root');
if (rootDiv) {
  const root = createRoot(rootDiv);
  root.render(<EditarUnidadeReact />);
}