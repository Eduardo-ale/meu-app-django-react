/**
 * ComponentDetectionSystem - Sistema avançado de detecção e fallback para componentes React
 * Fornece monitoramento em tempo real e notificações visuais sobre o status dos componentes
 */
window.ComponentDetectionSystem = {
    
    /**
     * Configuração do sistema
     */
    config: {
        enableVisualNotifications: false,
        enableStatusBar: false,
        enableConsoleLogging: true,
        notificationDuration: 5000,
        detectionInterval: 1000,
        maxRetries: 3
    },

    /**
     * Estado interno do sistema
     */
    state: {
        isMonitoring: false,
        detectedComponents: new Map(),
        missingComponents: new Set(),
        notifications: new Map(),
        performanceMetrics: new Map()
    },

    /**
     * Inicializar sistema de detecção
     */
    init: function(customConfig = {}) {
        this.config = { ...this.config, ...customConfig };
        
        ReactDebugger.logInfo('🔍 Inicializando Sistema de Detecção de Componentes');
        
        // Criar elementos visuais se habilitado
        if (this.config.enableVisualNotifications) {
            this._createNotificationContainer();
        }
        
        if (this.config.enableStatusBar) {
            this._createStatusBar();
        }
        
        // Iniciar detecção automática se habilitado
        if (this.config.enableAutoDetection) {
            this.startAutoDetection();
        }
        
        // Configurar event listeners
        this._setupEventListeners();
        
        ReactDebugger.logInfo('✅ Sistema de Detecção inicializado com sucesso');
    },

    /**
     * Iniciar detecção automática de componentes
     */
    startAutoDetection: function() {
        if (this.state.isMonitoring) {
            this.stopAutoDetection();
        }
        
        this.state.isMonitoring = true;
        
        // Primeira varredura imediata
        this._performDetectionScan();
        
        // Configurar varredura periódica
        this.detectionInterval = setInterval(() => {
            this._performDetectionScan();
        }, this.config.detectionInterval);
        
        ReactDebugger.logInfo(`🔄 Detecção automática iniciada (intervalo: ${this.config.detectionInterval}ms)`);
        this._updateStatusBar('Monitoramento ativo', 'success');
    },

    /**
     * Parar detecção automática
     */
    stopAutoDetection: function() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        this.state.isMonitoring = false;
        ReactDebugger.logInfo('⏹️ Detecção automática parada');
        this._updateStatusBar('Monitoramento pausado', 'warning');
    },

    /**
     * Realizar varredura de detecção
     */
    _performDetectionScan: function() {
        const startTime = performance.now();
        
        // Detectar containers React
        const reactContainers = this._findReactContainers();
        
        // Verificar componentes esperados
        const expectedComponents = this._getExpectedComponents();
        
        // Analisar status de cada componente
        expectedComponents.forEach(componentInfo => {
            const status = this._analyzeComponentStatus(componentInfo);
            this._updateComponentStatus(componentInfo.name, status);
        });
        
        // Detectar componentes ausentes
        const missingComponents = this._detectMissingComponents(reactContainers);
        this._handleMissingComponents(missingComponents);
        
        // Registrar métricas de performance
        const scanDuration = performance.now() - startTime;
        this.state.performanceMetrics.set('lastScanDuration', scanDuration);
        
        ReactDebugger.logDebug(`🔍 Varredura de detecção concluída em ${scanDuration.toFixed(2)}ms`);
    },

    /**
     * Encontrar containers React na página
     */
    _findReactContainers: function() {
        const containers = [];
        
        // Buscar por IDs que contenham 'react'
        const reactIds = document.querySelectorAll('[id*="react"]');
        reactIds.forEach(element => {
            containers.push({
                element: element,
                id: element.id,
                type: 'id-based',
                expectedComponent: this._inferComponentFromId(element.id)
            });
        });
        
        // Buscar por classes que contenham 'react'
        const reactClasses = document.querySelectorAll('[class*="react"]');
        reactClasses.forEach(element => {
            if (!containers.find(c => c.element === element)) {
                containers.push({
                    element: element,
                    id: element.id || 'no-id',
                    type: 'class-based',
                    expectedComponent: this._inferComponentFromClass(element.className)
                });
            }
        });
        
        return containers;
    },

    /**
     * Obter lista de componentes esperados
     */
    _getExpectedComponents: function() {
        return [
            {
                name: 'CriarUnidadeReact',
                containerId: 'criar-unidade-react-root',
                required: true,
                fallbackAvailable: true
            },
            {
                name: 'RegistroChamadaReact',
                containerId: 'registro-chamada-react-root',
                required: true,
                fallbackAvailable: true
            }
        ];
    },

    /**
     * Analisar status de um componente específico
     */
    _analyzeComponentStatus: function(componentInfo) {
        const status = {
            name: componentInfo.name,
            exists: false,
            loaded: false,
            rendered: false,
            hasContainer: false,
            containerVisible: false,
            fallbackActive: false,
            errors: []
        };

        // Verificar se componente existe no escopo global
        if (window[componentInfo.name]) {
            status.exists = true;
            status.loaded = typeof window[componentInfo.name] === 'function';
        }

        // Verificar container
        const container = document.getElementById(componentInfo.containerId);
        if (container) {
            status.hasContainer = true;
            status.containerVisible = this._isElementVisible(container);
            
            // Verificar se React foi renderizado no container
            status.rendered = this._hasReactContent(container);
            
            // Verificar se fallback está ativo
            status.fallbackActive = this._hasFallbackContent(container);
        }

        return status;
    },

    /**
     * Verificar se elemento está visível
     */
    _isElementVisible: function(element) {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && 
               window.getComputedStyle(element).display !== 'none';
    },

    /**
     * Verificar se container tem conteúdo React renderizado
     */
    _hasReactContent: function(container) {
        // Procurar por elementos com atributos React
        const reactElements = container.querySelectorAll('[data-reactroot], [data-react-component]');
        return reactElements.length > 0;
    },

    /**
     * Verificar se container tem conteúdo de fallback ativo
     */
    _hasFallbackContent: function(container) {
        const fallbackElements = container.querySelectorAll('.fallback-container, .generic-fallback, .react-fallback-warning');
        return Array.from(fallbackElements).some(el => 
            window.getComputedStyle(el).display !== 'none'
        );
    },

    /**
     * Atualizar status de componente
     */
    _updateComponentStatus: function(componentName, status) {
        const previousStatus = this.state.detectedComponents.get(componentName);
        this.state.detectedComponents.set(componentName, status);
        
        // Detectar mudanças de status
        if (previousStatus) {
            this._handleStatusChange(componentName, previousStatus, status);
        }
        
        // Atualizar barra de status
        this._updateComponentInStatusBar(componentName, status);
    },

    /**
     * Lidar com mudanças de status
     */
    _handleStatusChange: function(componentName, oldStatus, newStatus) {
        // Componente foi carregado
        if (!oldStatus.loaded && newStatus.loaded) {
            this._showNotification(
                `✅ ${componentName} carregado`,
                'Componente React está agora disponível',
                'success'
            );
        }
        
        // Componente foi renderizado
        if (!oldStatus.rendered && newStatus.rendered) {
            this._showNotification(
                `🎉 ${componentName} renderizado`,
                'Interface React ativa e funcionando',
                'success'
            );
        }
        
        // Fallback foi ativado
        if (!oldStatus.fallbackActive && newStatus.fallbackActive) {
            this._showNotification(
                `⚠️ ${componentName} em modo fallback`,
                'Usando interface HTML como alternativa',
                'warning'
            );
        }
    },

    /**
     * Detectar componentes ausentes
     */
    _detectMissingComponents: function(containers) {
        const missing = [];
        
        containers.forEach(container => {
            if (container.expectedComponent && 
                !window[container.expectedComponent]) {
                missing.push({
                    componentName: container.expectedComponent,
                    containerId: container.id,
                    containerElement: container.element
                });
            }
        });
        
        return missing;
    },

    /**
     * Lidar com componentes ausentes
     */
    _handleMissingComponents: function(missingComponents) {
        missingComponents.forEach(missing => {
            if (!this.state.missingComponents.has(missing.componentName)) {
                this.state.missingComponents.add(missing.componentName);
                
                this._showNotification(
                    `❌ ${missing.componentName} não encontrado`,
                    'Componente React não está disponível',
                    'error'
                );
                
                ReactDebugger.logWarning(`🔍 Componente ausente detectado: ${missing.componentName}`);
            }
        });
    },

    /**
     * Inferir nome do componente baseado no ID
     */
    _inferComponentFromId: function(id) {
        if (id.includes('criar-unidade')) return 'CriarUnidadeReact';
        if (id.includes('registro-chamada')) return 'RegistroChamadaReact';
        return null;
    },

    /**
     * Inferir nome do componente baseado na classe
     */
    _inferComponentFromClass: function(className) {
        if (className.includes('criar-unidade')) return 'CriarUnidadeReact';
        if (className.includes('registro-chamada')) return 'RegistroChamadaReact';
        return null;
    },

    /**
     * Criar container de notificações
     */
    _createNotificationContainer: function() {
        if (document.getElementById('component-notifications')) return;
        
        const container = document.createElement('div');
        container.id = 'component-notifications';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        
        document.body.appendChild(container);
    },

    /**
     * Mostrar notificação visual
     */
    _showNotification: function(title, message, type = 'info') {
        if (!this.config.enableVisualNotifications) return;
        
        const container = document.getElementById('component-notifications');
        if (!container) return;
        
        const notification = document.createElement('div');
        const notificationId = Date.now().toString();
        
        const colors = {
            success: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: '#10b981' },
            warning: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: '#f59e0b' },
            error: { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: '#ef4444' },
            info: { bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', border: '#3b82f6' }
        };
        
        const color = colors[type] || colors.info;
        
        notification.style.cssText = `
            background: ${color.bg};
            color: white;
            padding: 15px 18px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            border: 1px solid ${color.border};
            max-width: 350px;
            pointer-events: auto;
            animation: slideInRight 0.3s ease-out;
            position: relative;
            overflow: hidden;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="font-size: 16px; flex-shrink: 0; margin-top: 2px;">
                    ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">
                        ${title}
                    </div>
                    <div style="font-size: 13px; opacity: 0.9; line-height: 1.3;">
                        ${message}
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 18px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    opacity: 0.7;
                    transition: opacity 0.2s ease;
                    flex-shrink: 0;
                " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">×</button>
            </div>
            <style>
                @keyframes slideInRight {
                    0% { 
                        opacity: 0; 
                        transform: translateX(100%); 
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateX(0); 
                    }
                }
            </style>
        `;
        
        container.appendChild(notification);
        this.state.notifications.set(notificationId, notification);
        
        // Remover automaticamente após duração configurada
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
                setTimeout(() => {
                    notification.remove();
                    this.state.notifications.delete(notificationId);
                }, 300);
            }
        }, this.config.notificationDuration);
    },

    /**
     * Criar barra de status
     */
    _createStatusBar: function() {
        if (document.getElementById('component-status-bar')) return;
        
        const statusBar = document.createElement('div');
        statusBar.id = 'component-status-bar';
        statusBar.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-family: 'Courier New', monospace;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        
        statusBar.innerHTML = `
            <div id="status-indicator" style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #10b981;
                animation: pulse 2s infinite;
            "></div>
            <div id="status-text">Inicializando...</div>
            <div id="component-count" style="
                background: rgba(255, 255, 255, 0.1);
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
            ">0/0</div>
        `;
        
        // Clique para expandir/colapsar detalhes
        statusBar.addEventListener('click', () => {
            this._toggleStatusBarDetails();
        });
        
        document.body.appendChild(statusBar);
    },

    /**
     * Atualizar barra de status
     */
    _updateStatusBar: function(message, type = 'info') {
        const statusBar = document.getElementById('component-status-bar');
        const statusText = document.getElementById('status-text');
        const statusIndicator = document.getElementById('status-indicator');
        
        if (!statusBar || !statusText || !statusIndicator) return;
        
        statusText.textContent = message;
        
        const colors = {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        };
        
        statusIndicator.style.background = colors[type] || colors.info;
    },

    /**
     * Atualizar componente na barra de status
     */
    _updateComponentInStatusBar: function(componentName, status) {
        const componentCount = document.getElementById('component-count');
        if (!componentCount) return;
        
        const total = this._getExpectedComponents().length;
        const loaded = Array.from(this.state.detectedComponents.values())
                           .filter(s => s.loaded).length;
        
        componentCount.textContent = `${loaded}/${total}`;
    },

    /**
     * Alternar detalhes da barra de status
     */
    _toggleStatusBarDetails: function() {
        // Implementar painel de detalhes expandido
        ReactDebugger.logInfo('🔍 Status detalhado:', {
            componentes: Object.fromEntries(this.state.detectedComponents),
            ausentes: Array.from(this.state.missingComponents),
            metricas: Object.fromEntries(this.state.performanceMetrics)
        });
    },

    /**
     * Configurar event listeners
     */
    _setupEventListeners: function() {
        // Monitorar mudanças no DOM
        if (window.MutationObserver) {
            const observer = new MutationObserver((mutations) => {
                let shouldScan = false;
                
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // Verificar se novos elementos React foram adicionados
                        Array.from(mutation.addedNodes).forEach(node => {
                            if (node.nodeType === 1 && 
                                (node.id?.includes('react') || node.className?.includes('react'))) {
                                shouldScan = true;
                            }
                        });
                    }
                });
                
                if (shouldScan) {
                    ReactDebugger.logDebug('🔄 Mudanças no DOM detectadas, realizando nova varredura');
                    setTimeout(() => this._performDetectionScan(), 100);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        // Monitorar carregamento de scripts
        window.addEventListener('load', () => {
            setTimeout(() => this._performDetectionScan(), 500);
        });
    },

    /**
     * Obter relatório completo do sistema
     */
    getSystemReport: function() {
        return {
            config: this.config,
            state: {
                isMonitoring: this.state.isMonitoring,
                detectedComponents: Object.fromEntries(this.state.detectedComponents),
                missingComponents: Array.from(this.state.missingComponents),
                performanceMetrics: Object.fromEntries(this.state.performanceMetrics)
            },
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Limpar sistema e parar monitoramento
     */
    cleanup: function() {
        this.stopAutoDetection();
        
        // Remover elementos visuais
        const notifications = document.getElementById('component-notifications');
        const statusBar = document.getElementById('component-status-bar');
        
        if (notifications) notifications.remove();
        if (statusBar) statusBar.remove();
        
        // Limpar estado
        this.state.detectedComponents.clear();
        this.state.missingComponents.clear();
        this.state.notifications.clear();
        this.state.performanceMetrics.clear();
        
        ReactDebugger.logInfo('🧹 Sistema de Detecção limpo');
    }
};

// Auto-inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.ComponentDetectionSystem.init();
    });
} else {
    window.ComponentDetectionSystem.init();
}