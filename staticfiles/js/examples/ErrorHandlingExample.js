/**
 * Exemplo prático de como usar o sistema de tratamento de erros React
 * Este arquivo demonstra as melhores práticas para debug e resolução de problemas
 */

window.ErrorHandlingExample = {
  
  /**
   * Exemplo de como capturar e tratar erros de componentes React
   */
  demonstrateErrorHandling: function() {
    console.log('🛠️ Demonstração do Sistema de Tratamento de Erros\n');
    
    // Simular diferentes cenários de erro
    const scenarios = [
      {
        name: 'Componente não encontrado',
        test: () => !window.ComponenteInexistente,
        solution: 'Verificar se o bundle foi carregado corretamente'
      },
      {
        name: 'Container não existe',
        test: () => !document.getElementById('container-inexistente'),
        solution: 'Verificar se o ID do container está correto no HTML'
      },
      {
        name: 'React não carregado',
        test: () => !window.React,
        solution: 'Verificar se React CDN ou bundle está carregado'
      },
      {
        name: 'ReactDOM não carregado',
        test: () => !window.ReactDOM,
        solution: 'Verificar se ReactDOM CDN ou bundle está carregado'
      }
    ];
    
    scenarios.forEach(scenario => {
      const hasError = scenario.test();
      const status = hasError ? '❌' : '✅';
      console.log(`${status} ${scenario.name}`);
      
      if (hasError) {
        console.log(`   💡 Solução: ${scenario.solution}`);
      }
    });
    
    return scenarios;
  },
  
  /**
   * Exemplo de renderização segura de componente
   */
  safeRenderExample: function(componentName, props = {}, containerId = 'demo-container') {
    console.log(`🧪 Exemplo de renderização segura: ${componentName}`);
    
    // Criar container de demonstração se não existir
    if (!document.getElementById(containerId)) {
      const container = document.createElement('div');
      container.id = containerId;
      container.style.cssText = `
        border: 2px dashed #ccc;
        padding: 20px;
        margin: 10px 0;
        border-radius: 8px;
        background: #f9f9f9;
      `;
      container.innerHTML = `
        <h3>Container de Demonstração: ${containerId}</h3>
        <p>Aguardando componente React...</p>
      `;
      document.body.appendChild(container);
    }
    
    // Usar SafeComponentLoader se disponível
    if (window.SafeComponentLoader) {
      try {
        const result = window.SafeComponentLoader.render(componentName, props, containerId);
        console.log(`✅ Componente renderizado:`, result);
        return result;
      } catch (error) {
        console.log(`❌ Erro na renderização:`, error);
        this.showErrorInContainer(containerId, error);
        return false;
      }
    } else {
      console.log('❌ SafeComponentLoader não disponível');
      this.showErrorInContainer(containerId, new Error('SafeComponentLoader não encontrado'));
      return false;
    }
  },
  
  /**
   * Mostrar erro no container de forma visual
   */
  showErrorInContainer: function(containerId, error) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div style="color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 4px;">
          <h4>❌ Erro no Componente React</h4>
          <p><strong>Erro:</strong> ${error.message}</p>
          <p><strong>Container:</strong> ${containerId}</p>
          <details>
            <summary>Detalhes técnicos</summary>
            <pre style="background: #f5f5f5; padding: 10px; margin-top: 10px; border-radius: 4px; overflow-x: auto;">${error.stack || 'Stack trace não disponível'}</pre>
          </details>
          <div style="margin-top: 15px;">
            <button onclick="location.reload()" style="background: #1976d2; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
              🔄 Recarregar Página
            </button>
          </div>
        </div>
      `;
    }
  },
  
  /**
   * Exemplo de como testar CSRF token
   */
  testCSRFToken: function() {
    console.log('🔐 Testando CSRF Token...');
    
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    
    if (csrfToken) {
      console.log('✅ CSRF Token encontrado:', csrfToken.value.substring(0, 10) + '...');
      
      // Exemplo de como usar em fetch
      const exampleFetch = `
fetch('/api/exemplo/', {
  method: 'POST',
  headers: {
    'X-CSRFToken': '${csrfToken.value}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});`;
      
      console.log('💡 Exemplo de uso em fetch:');
      console.log(exampleFetch);
      
      return csrfToken.value;
    } else {
      console.log('❌ CSRF Token não encontrado');
      console.log('💡 Adicione ao template: {% csrf_token %}');
      return null;
    }
  },
  
  /**
   * Exemplo de como debugar props de componente
   */
  debugComponentProps: function(componentName, expectedProps = {}) {
    console.log(`🔍 Debug de Props: ${componentName}`);
    
    // Verificar se componente existe
    if (!window[componentName]) {
      console.log(`❌ Componente ${componentName} não encontrado`);
      return false;
    }
    
    console.log(`✅ Componente ${componentName} encontrado`);
    
    // Exemplo de props esperadas vs recebidas
    console.log('📋 Props esperadas:', expectedProps);
    
    // Simular renderização com props de teste
    const testProps = {
      ...expectedProps,
      debug: true,
      onError: (error) => console.log('Erro capturado:', error)
    };
    
    console.log('🧪 Props de teste:', testProps);
    
    return testProps;
  },
  
  /**
   * Exemplo completo de workflow de debug
   */
  fullDebugWorkflow: function(componentName, containerId) {
    console.log('🔧 WORKFLOW COMPLETO DE DEBUG\n');
    console.log('=' .repeat(50));
    
    const steps = [
      {
        name: '1. Verificar dependências básicas',
        action: () => this.demonstrateErrorHandling()
      },
      {
        name: '2. Testar CSRF Token',
        action: () => this.testCSRFToken()
      },
      {
        name: '3. Debug de props do componente',
        action: () => this.debugComponentProps(componentName, { teste: true })
      },
      {
        name: '4. Tentativa de renderização segura',
        action: () => this.safeRenderExample(componentName, { debug: true }, containerId)
      }
    ];
    
    const results = {};
    
    steps.forEach(step => {
      console.log(`\n🔄 ${step.name}`);
      try {
        results[step.name] = step.action();
        console.log(`✅ ${step.name} - Concluído`);
      } catch (error) {
        console.log(`❌ ${step.name} - Erro:`, error);
        results[step.name] = { error: error.message };
      }
    });
    
    console.log('\n📊 RESUMO DO DEBUG:');
    Object.entries(results).forEach(([step, result]) => {
      const status = result && !result.error ? '✅' : '❌';
      console.log(`${status} ${step}`);
    });
    
    return results;
  },
  
  /**
   * Criar ambiente de teste para componentes
   */
  createTestEnvironment: function() {
    console.log('🏗️ Criando ambiente de teste...');
    
    // Criar container de teste
    const testContainer = document.createElement('div');
    testContainer.id = 'react-test-environment';
    testContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      max-height: 500px;
      background: white;
      border: 2px solid #2196f3;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      overflow-y: auto;
      font-family: monospace;
      font-size: 12px;
    `;
    
    testContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #2196f3;">🧪 React Test Environment</h3>
        <button onclick="this.parentElement.parentElement.remove()" style="background: #f44336; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">×</button>
      </div>
      
      <div id="test-controls" style="margin-bottom: 15px;">
        <button onclick="ErrorHandlingExample.demonstrateErrorHandling()" style="margin: 2px; padding: 5px 10px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
          🔍 Check System
        </button>
        <button onclick="ErrorHandlingExample.testCSRFToken()" style="margin: 2px; padding: 5px 10px; background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
          🔐 Test CSRF
        </button>
        <button onclick="ComponentDetectionExample.fullDiagnosis()" style="margin: 2px; padding: 5px 10px; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
          🏥 Full Diagnosis
        </button>
      </div>
      
      <div id="test-output" style="background: #f5f5f5; padding: 10px; border-radius: 4px; min-height: 100px; max-height: 300px; overflow-y: auto;">
        <p>🚀 Ambiente de teste carregado!</p>
        <p>Use os botões acima para executar testes.</p>
        <p>Verifique o console do navegador para logs detalhados.</p>
      </div>
    `;
    
    // Remover ambiente anterior se existir
    const existing = document.getElementById('react-test-environment');
    if (existing) {
      existing.remove();
    }
    
    document.body.appendChild(testContainer);
    
    console.log('✅ Ambiente de teste criado! Verifique o canto superior direito da página.');
    
    return testContainer;
  }
};

// Auto-inicialização em desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('🧪 Sistema de Exemplos de Error Handling carregado!');
  console.log('💡 Comandos disponíveis:');
  console.log('   ErrorHandlingExample.demonstrateErrorHandling()');
  console.log('   ErrorHandlingExample.safeRenderExample("ComponentName")');
  console.log('   ErrorHandlingExample.fullDebugWorkflow("ComponentName", "container-id")');
  console.log('   ErrorHandlingExample.createTestEnvironment()');
}