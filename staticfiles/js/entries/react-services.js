// Entry point para carregar todos os serviços React
import React from 'react';
import ReactDOM from 'react-dom';

// Garantir que React e ReactDOM estão disponíveis globalmente
window.React = React;
window.ReactDOM = ReactDOM;

// Importar serviços (os arquivos já exportam para window automaticamente)
import '../services/ReactDebugger.js';
import '../services/SafeComponentLoader.js';
import '../services/ReactErrorHandling.js';
import '../components/ReactErrorBoundary.js';

console.log('✅ Serviços React carregados com sucesso!');