import React from 'react';
import { createRoot } from 'react-dom/client';
import VisualizarUnidadeReact from '../components/VisualizarUnidadeReact';

const rootDiv = document.getElementById('visualizar-unidade-root');
if (rootDiv) {
  const root = createRoot(rootDiv);
  root.render(<VisualizarUnidadeReact />);
}