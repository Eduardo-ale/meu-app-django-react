import React from 'react';
import { createRoot } from 'react-dom/client';
import CriarUsuarioReact from '../components/CriarUsuarioReact';

const rootDiv = document.getElementById('criar-usuario-root');
if (rootDiv) {
  const root = createRoot(rootDiv);
  root.render(<CriarUsuarioReact />);
}