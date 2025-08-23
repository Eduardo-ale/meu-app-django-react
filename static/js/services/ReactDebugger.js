/**
 * ReactDebugger - Sistema de logging e debug para componentes React
 * Fornece funcionalidades de logging, monitoramento e debug
 */
window.ReactDebugger = {
    // Configurações de debug
    config: {
        enabled: true,
        logLevel: 'info', // 'error', 'warn', 'info', 'debug'
        showTimestamp: true,
        showStackTrace: false
    },

    // Símbolos para diferentes tipos de log
    symbols: {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        loading: '⏳',
        network: '🌐',
        component: '⚛️'
    },

    /**
     * Log de carregamento de componente
     */
    logComponentLoad: function(componentName, success, error = null) {
        if (!this.config.enabled) return;

        const symbol = success ? this.symbols.success : this.symbols.error;
        const timestamp = this.config.showTimestamp ? `[${new Date().toLocaleTimeString()}] ` : '';
        
        if (success) {
            console.log(`${timestamp}${symbol} ${this.symbols.component} Componente ${componentName} carregado com sucesso`);
        } else {
            console.error(`${timestamp}${symbol} ${this.symbols.component} Falha ao carregar componente ${componentName}:`, error);
        }
    },

    /**
     * Log de erro de componente capturado pelo ErrorBoundary
     */
    logComponentError: function(componentName, error, errorInfo) {
        if (!this.config.enabled) return;

        const timestamp = this.config.showTimestamp ? `[${new Date().toLocaleTimeString()}] ` : '';
        
        console.group(`${timestamp}${this.symbols.error} ${this.symbols.component} Erro no componente ${componentName}`);
        console.error('Erro:', error);
        console.error('Stack do componente:', errorInfo.componentStack);
        
        if (this.config.showStackTrace && error.stack) {
            console.error('Stack trace completo:', error.stack);
        }
        
        console.groupEnd();

        // Enviar para sistema de monitoramento se configurado
        this._sendToMonitoring('component_error', {
            component: componentName,
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack
        });
    },

    /**
     * Log de erro de rede
     */
    logNetworkError: function(url, error, context = '') {
        if (!this.config.enabled) return;

        const timestamp = this.config.showTimestamp ? `[${new Date().toLocaleTimeString()}] ` : '';
        const contextStr = context ? ` (${context})` : '';
        
        console.error(`${timestamp}${this.symbols.network} Erro de rede ao carregar ${url}${contextStr}:`, error);
        
        this._sendToMonitoring('network_error', {
            url: url,
            error: error.message,
            context: context
        });
    },

    /**
     * Log de aviso
     */
    logWarning: function(message, data = null) {
        if (!this.config.enabled || this.config.logLevel === 'error') return;

        const timestamp = this.config.showTimestamp ? `[${new Date().toLocaleTimeString()}] ` : '';
        
        if (data) {
            console.warn(`${timestamp}${this.symbols.warning} ${message}`, data);
        } else {
            console.warn(`${timestamp}${this.symbols.warning} ${message}`);
        }
    },

    /**
     * Log de informação
     */
    logInfo: function(message, data = null) {
        if (!this.config.enabled || ['error', 'warn'].includes(this.config.logLevel)) return;

        const timestamp = this.config.showTimestamp ? `[${new Date().toLocaleTimeString()}] ` : '';
        
        if (data) {
            console.log(`${timestamp}${this.symbols.info} ${message}`, data);
        } else {
            console.log(`${timestamp}${this.symbols.info} ${message}`);
        }
    },

    /**
     * Log de debug detalhado
     */
    logDebug: function(message, data = null) {
        if (!this.config.enabled || this.config.logLevel !== 'debug') return;

        const timestamp = this.config.showTimestamp ? `[${new Date().toLocaleTimeString()}] ` : '';
        
        console.debug(`${timestamp}🔍 DEBUG: ${message}`, data || '');
    },

    /**
     * Monitorar performance de componente
     */
    startPerformanceTimer: function(componentName) {
        if (!this.config.enabled) return null;
        
        const timerName = `component_${componentName}_render`;
        console.time(timerName);
        return timerName;
    },

    endPerformanceTimer: function(timerName) {
        if (!this.config.enabled || !timerName) return;
        
        console.timeEnd(timerName);
    },

    /**
     * Coletar informações do ambiente para debug
     */
    getEnvironmentInfo: function() {
        return {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            reactVersion: React.version || 'Desconhecida',
            screenSize: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
        };
    },

    /**
     * Configurar nível de debug
     */
    setLogLevel: function(level) {
        if (['error', 'warn', 'info', 'debug'].includes(level)) {
            this.config.logLevel = level;
            this.logInfo(`Nível de log alterado para: ${level}`);
        }
    },

    /**
     * Habilitar/desabilitar debug
     */
    setEnabled: function(enabled) {
        this.config.enabled = enabled;
        console.log(`${this.symbols.info} ReactDebugger ${enabled ? 'habilitado' : 'desabilitado'}`);
    },

    /**
     * Enviar dados para sistema de monitoramento (placeholder)
     */
    _sendToMonitoring: function(eventType, data) {
        // Implementar integração com sistema de monitoramento se necessário
        // Por exemplo: Sentry, LogRocket, etc.
        if (window.Sentry) {
            window.Sentry.captureException(new Error(`${eventType}: ${JSON.stringify(data)}`));
        }
    },

    /**
     * Inicializar debugger
     */
    init: function(config = {}) {
        this.config = { ...this.config, ...config };
        
        this.logInfo('ReactDebugger inicializado', {
            config: this.config,
            environment: this.getEnvironmentInfo()
        });

        // Capturar erros JavaScript não tratados
        window.addEventListener('error', (event) => {
            this.logNetworkError(event.filename || 'Desconhecido', {
                message: event.message,
                line: event.lineno,
                column: event.colno
            }, 'Erro JavaScript global');
        });

        // Capturar promises rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            this.logWarning('Promise rejeitada não tratada:', event.reason);
        });
    }
};

// Auto-inicializar se estiver em modo de desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.ReactDebugger.init({
        logLevel: 'debug',
        showStackTrace: true
    });
} else {
    window.ReactDebugger.init({
        logLevel: 'error',
        showStackTrace: false
    });
}