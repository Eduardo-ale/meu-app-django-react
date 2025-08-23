import React from 'react';
import { createRoot } from 'react-dom/client';
import UnidadesSaudeReact from '../components/UnidadesSaudeReact';

const rootDiv = document.getElementById('unidades-saude-react-root');
if (rootDiv) {
  const root = createRoot(rootDiv);
  root.render(<UnidadesSaudeReact />);
}