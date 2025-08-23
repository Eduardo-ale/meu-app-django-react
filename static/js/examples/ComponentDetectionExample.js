/**
 * Exemplo de como detectar e diagnosticar problemas com componentes React
 * Use este script no console do navegador para debug
 */

window.ComponentDetectionExample = {
  
  /**
   * Verifica o status de todos os componentes React
   */
  checkAllComponents: function() {
    console.log('🔍 Verificando status dos componentes React...\n');
    
    const expectedComponents = [
      'CriarUnidadeReact',
      'RegistroChamadaReact',
      'ReactErrorBoundary',
      'SafeComponentLoader',
      'ReactDebugger'
    ];
    
    const results = {
      loaded: [],
      missing: [],
      containers: []
    };
    
    // Verificar componentes
    expectedComponents.forEach(componentName => {
      if (window[componentName]) {
        results.loaded.push(componentName);
        console.log(`✅ ${componentName} - Carregado`);
      } else {
        results.missing.push(componentName);
        console.log(`❌ ${componentName} - Não encontrado`);
      }
    });
    
    // Verificar containers
    const expectedContainers = [
      'criar-unidade-root',
      'registro-chamada-root',
      'component-root'
    ];
    
    expectedContainers.forEach(containerId => {
      const element = document.getElementById(containerId);
      if (element) {
        results.containers.push(containerId);
        console.log(`📦 Container ${containerId} - Encontrado`);
      } else {
        console.log(`📦 Container ${containerId} - Não encontrado`);
      }
    });
    
    // Resumo
    console.log('\n📊 RESUMO:');
    console.log(`Componentes carregados: ${results.loaded.length}/${expectedComponents.length}`);
    console.log(`Containers encontrados: ${results.containers.length}/${expectedContainers.length}`);
    
    return results;
  },
  
  /**
   * Verifica se os bundles JavaScript foram carregados
   */
  checkBundles: function() {
    console.log('🔍 Verificando bundles JavaScript...\n');
    
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const bundles = scripts.filter(script => 
      script.src.includes('.bundle.js') || 
      script.src.includes('/dist/')
    );
    
    console.log(`📦 Total de scripts: ${scripts.length}`);
    console.log(`📦 Bundles encontrados: ${bundles.length}`);
    
    bundles.forEach(bundle => {
      console.log(`✅ Bundle: ${bundle.src}`);
    });
    
    if (bundles.length === 0) {
      console.log('❌ Nenhum bundle encontrado! Execute:');
      console.log('   npm run build');
      console.log('   python manage.py collectstatic');
    }
    
    return bundles;
  },
  
  /**
   * Testa o carregamento de um componente específico
   */
  testComponent: function(componentName, containerId) {
    console.log(`🧪 Testando componente ${componentName}...`);
    
    // Verificar se componente existe
    if (!window[componentName]) {
      console.log(`❌ Componente ${componentName} não encontrado`);
      return false;
    }
    
    // Verificar se container existe
    const container = document.getElementById(containerId);
    if (!container) {
      console.log(`❌ Container ${containerId} não encontrado`);
      return false;
    }
    
    // Tentar renderizar
    try {
      if (window.SafeComponentLoader) {
        window.SafeComponentLoader.render(componentName, {}, containerId);
        console.log(`✅ Componente ${componentName} renderizado com sucesso`);
        return true;
      } else {
        console.log('❌ SafeComponentLoader não disponível');
        return false;
      }
    } catch (error) {
      console.log(`❌ Erro ao renderizar ${componentName}:`, error);
      return false;
    }
  },
  
  /**
   * Verifica problemas de rede (404s, etc)
   */
  checkNetworkErrors: function() {
    console.log('🌐 Verificando erros de rede...\n');
    
    // Esta função deve ser chamada após carregar a página
    // para capturar erros de carregamento de recursos
    
    const performanceEntries = performance.getEntriesByType('resource');
    const failedResources = performanceEntries.filter(entry => 
      entry.transferSize === 0 && entry.decodedBodySize === 0
    );
    
    if (failedResources.length > 0) {
      console.log('❌ Recursos que falharam ao carregar:');
      failedResources.forEach(resource => {
        console.log(`   ${resource.name}`);
      });
    } else {
      console.log('✅ Todos os recursos carregaram corretamente');
    }
    
    return failedResources;
  },
  
  /**
   * Diagnóstico completo do sistema
   */
  fullDiagnosis: function() {
    console.log('🏥 DIAGNÓSTICO COMPLETO DO SISTEMA REACT\n');
    console.log('=' .repeat(50));
    
    const results = {
      components: this.checkAllComponents(),
      bundles: this.checkBundles(),
      networkErrors: this.checkNetworkErrors()
    };
    
    console.log('\n🎯 RECOMENDAÇÕES:');
    
    if (results.components.missing.length > 0) {
      console.log('1. Componentes ausentes detectados. Execute:');
      console.log('   npm run build');
    }
    
    if (results.bundles.length === 0) {
      console.log('2. Bundles não encontrados. Execute:');
      console.log('   npm run build');
      console.log('   python manage.py collectstatic');
    }
    
    if (results.networkErrors.length > 0) {
      console.log('3. Erros de rede detectados. Verifique:');
      console.log('   - Servidor Django rodando');
      console.log('   - Arquivos estáticos configurados');
    }
    
    console.log('\n✨ Para solução rápida, execute:');
    console.log('npm install && npm run build && python manage.py collectstatic');
    
    return results;
  }
};

// Executar diagnóstico automático se estiver em modo debug
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('🚀 Sistema de diagnóstico React carregado!');
  console.log('💡 Use: ComponentDetectionExample.fullDiagnosis() para diagnóstico completo');
}