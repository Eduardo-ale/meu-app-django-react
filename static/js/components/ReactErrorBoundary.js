/**
 * ReactErrorBoundary - Componente para capturar e tratar erros de renderização React
 * Implementa fallback graceful quando componentes falham
 */
class ReactErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Atualiza o state para mostrar a UI de fallback
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log do erro para debug
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log usando o sistema de debug
        if (window.ReactDebugger) {
            window.ReactDebugger.logComponentError(
                this.props.componentName || 'Componente Desconhecido',
                error,
                errorInfo
            );
        }

        console.error('🚨 Erro capturado pelo ReactErrorBoundary:', error);
        console.error('📍 Informações do erro:', errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // UI de fallback customizada
            return React.createElement('div', {
                className: 'react-error-boundary',
                style: {
                    padding: '20px',
                    margin: '10px 0',
                    border: '2px solid #ff6b6b',
                    borderRadius: '8px',
                    backgroundColor: '#fff5f5',
                    color: '#c92a2a'
                }
            }, [
                React.createElement('div', {
                    key: 'icon',
                    style: { fontSize: '24px', marginBottom: '10px' }
                }, '⚠️'),
                React.createElement('h4', {
                    key: 'title',
                    style: { margin: '0 0 10px 0', color: '#c92a2a' }
                }, 'Erro no Componente React'),
                React.createElement('p', {
                    key: 'message',
                    style: { margin: '0 0 15px 0' }
                }, 'Ocorreu um erro ao carregar este componente. A versão HTML será exibida como alternativa.'),
                React.createElement('details', {
                    key: 'details',
                    style: { fontSize: '12px', color: '#666' }
                }, [
                    React.createElement('summary', {
                        key: 'summary',
                        style: { cursor: 'pointer', marginBottom: '5px' }
                    }, 'Detalhes técnicos (clique para expandir)'),
                    React.createElement('pre', {
                        key: 'error',
                        style: { 
                            whiteSpace: 'pre-wrap', 
                            fontSize: '11px',
                            backgroundColor: '#f8f8f8',
                            padding: '10px',
                            borderRadius: '4px',
                            overflow: 'auto'
                        }
                    }, this.state.error && this.state.error.toString())
                ])
            ]);
        }

        return this.props.children;
    }
}

// Disponibilizar globalmente
window.ReactErrorBoundary = ReactErrorBoundary;