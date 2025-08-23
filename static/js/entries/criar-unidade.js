// Entry point para componente CriarUnidadeReact
import React from 'react';
import ReactDOM from 'react-dom';
import CriarUnidadeReact from '../components/CriarUnidadeReact';

// Garantir que React está disponível globalmente
if (typeof window.React === 'undefined') {
    window.React = React;
}
if (typeof window.ReactDOM === 'undefined') {
    window.ReactDOM = ReactDOM;
}

// Exportar componente para window (essencial para o sistema de inicialização)
window.CriarUnidadeReact = CriarUnidadeReact;

// Log de carregamento
console.log('✅ CriarUnidadeReact carregado e disponível globalmente');

// Verificar se o componente foi exportado corretamente
if (typeof window.CriarUnidadeReact === 'function') {
    console.log('✅ window.CriarUnidadeReact está disponível como função');
} else {
    console.error('❌ Falha ao exportar CriarUnidadeReact para window');
}