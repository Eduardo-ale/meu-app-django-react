// Versão simplificada do componente HomeReact para testes
function HomeReactSimple(props) {
    return React.createElement('div', { className: 'home-react-container' },
        React.createElement('h1', null, 'Dashboard'),
        React.createElement('p', null, 'Versão simplificada do dashboard para testes'),
        React.createElement('pre', null, JSON.stringify(props, null, 2))
    );
}

// Exportar o componente globalmente
window.HomeReactSimple = HomeReactSimple;

// Export para ES6 modules
export default HomeReactSimple;