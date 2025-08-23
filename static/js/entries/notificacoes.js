import React from 'react';
import { createRoot } from 'react-dom/client';
import NotificacoesReact from '../components/NotificacoesReact';

const rootDiv = document.getElementById('notificacoes-root');
if (rootDiv) {
  const root = createRoot(rootDiv);
  root.render(<NotificacoesReact />);
}