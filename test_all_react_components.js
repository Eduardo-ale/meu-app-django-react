// Comprehensive React Component Testing Script
console.log('🧪 Starting comprehensive React component testing...');

// List of all React components that should be available
const expectedComponents = [
    'CriarUnidadeReact',
    'RegistroChamadaReact',
    'ListaTelefonicaReact',
    'NotificacoesReact',
    'ConfiguracoesReact',
    'RelatoriosReact',
    'UnidadesSaudeReact',
    'PerfilReact',
    'SenhaReact',
    'CriarUsuarioReact',
    'EditarUnidadeReact',
    'VisualizarUnidadeReact',
    'HomeReact',
    'HomeSimpleReact'
];

// Test results storage
const testResults = {
    bundleLoading: {},
    componentAvailability: {},
    reactDevTools: false,
    errors: []
};

// Function to test if a bundle loads without 404 errors
function testBundleLoading(bundleName) {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = `/static/${bundleName}.bundle.js`;
        
        script.onload = () => {
            console.log(`✅ Bundle loaded successfully: ${bundleName}`);
            testResults.bundleLoading[bundleName] = { success: true, error: null };
            resolve(true);
        };
        
        script.onerror = (error) => {
            console.error(`❌ Failed to load bundle: ${bundleName}`, error);
            testResults.bundleLoading[bundleName] = { success: false, error: error.toString() };
            resolve(false);
        };
        
        document.head.appendChild(script);
    });
}

// Function to test component availability
function testComponentAvailability(componentName) {
    const isAvailable = typeof window[componentName] !== 'undefined';
    testResults.componentAvailability[componentName] = isAvailable;
    
    if (isAvailable) {
        console.log(`✅ Component available: ${componentName}`);
        
        // Test if component can be instantiated
        try {
            const testElement = React.createElement(window[componentName], {});
            console.log(`✅ Component can be instantiated: ${componentName}`);
        } catch (error) {
            console.error(`❌ Component instantiation failed: ${componentName}`, error);
            testResults.errors.push(`${componentName} instantiation failed: ${error.message}`);
        }
    } else {
        console.warn(`⚠️ Component not available: ${componentName}`);
    }
    
    return isAvailable;
}

// Function to test React DevTools connection
function testReactDevTools() {
    // Check if React DevTools extension is available
    const hasDevTools = typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined';
    testResults.reactDevTools = hasDevTools;
    
    if (hasDevTools) {
        console.log('✅ React DevTools detected');
        
        // Check if React is properly registered with DevTools
        if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers && 
            window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.size > 0) {
            console.log('✅ React renderers registered with DevTools');
        } else {
            console.warn('⚠️ No React renderers registered with DevTools yet');
        }
    } else {
        console.warn('⚠️ React DevTools not detected (extension may not be installed)');
    }
    
    return hasDevTools;
}

// Function to test network requests for static files
async function testStaticFileAccess() {
    const staticFiles = [
        '/static/criar-unidade.bundle.js',
        '/static/registro-chamada.bundle.js',
        '/static/lista-telefonica.bundle.js',
        '/static/notificacoes.bundle.js',
        '/static/configuracoes.bundle.js'
    ];
    
    console.log('🌐 Testing static file access...');
    
    for (const file of staticFiles) {
        try {
            const response = await fetch(file, { method: 'HEAD' });
            if (response.ok) {
                console.log(`✅ Static file accessible: ${file}`);
            } else {
                console.error(`❌ Static file not accessible: ${file} (Status: ${response.status})`);
                testResults.errors.push(`Static file ${file} returned status ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ Network error accessing: ${file}`, error);
            testResults.errors.push(`Network error for ${file}: ${error.message}`);
        }
    }
}

// Function to test React and ReactDOM availability
function testReactLibraries() {
    console.log('📚 Testing React libraries...');
    
    if (typeof React !== 'undefined') {
        console.log(`✅ React available (version: ${React.version || 'unknown'})`);
    } else {
        console.error('❌ React not available');
        testResults.errors.push('React library not loaded');
    }
    
    if (typeof ReactDOM !== 'undefined') {
        console.log('✅ ReactDOM available');
    } else {
        console.error('❌ ReactDOM not available');
        testResults.errors.push('ReactDOM library not loaded');
    }
}

// Function to test error handling systems
function testErrorHandlingSystems() {
    console.log('🛡️ Testing error handling systems...');
    
    // Test ReactErrorBoundary
    if (typeof window.ReactErrorBoundary !== 'undefined') {
        console.log('✅ ReactErrorBoundary available');
    } else {
        console.warn('⚠️ ReactErrorBoundary not available');
    }
    
    // Test SafeComponentLoader
    if (typeof window.SafeComponentLoader !== 'undefined') {
        console.log('✅ SafeComponentLoader available');
    } else {
        console.warn('⚠️ SafeComponentLoader not available');
    }
    
    // Test ReactDebugger
    if (typeof window.ReactDebugger !== 'undefined') {
        console.log('✅ ReactDebugger available');
    } else {
        console.warn('⚠️ ReactDebugger not available');
    }
}

// Main testing function
async function runComprehensiveTests() {
    console.log('🚀 Starting comprehensive React component tests...');
    console.log('=' .repeat(60));
    
    // Test 1: React libraries
    testReactLibraries();
    console.log('');
    
    // Test 2: Error handling systems
    testErrorHandlingSystems();
    console.log('');
    
    // Test 3: Static file access
    await testStaticFileAccess();
    console.log('');
    
    // Test 4: Component availability
    console.log('🔍 Testing component availability...');
    expectedComponents.forEach(testComponentAvailability);
    console.log('');
    
    // Test 5: React DevTools
    console.log('🔧 Testing React DevTools...');
    testReactDevTools();
    console.log('');
    
    // Generate summary report
    generateTestReport();
}

// Function to generate test report
function generateTestReport() {
    console.log('📊 TEST SUMMARY REPORT');
    console.log('=' .repeat(60));
    
    // Bundle loading results
    const bundleResults = Object.entries(testResults.bundleLoading);
    const successfulBundles = bundleResults.filter(([_, result]) => result.success).length;
    console.log(`📦 Bundle Loading: ${successfulBundles}/${bundleResults.length} successful`);
    
    // Component availability results
    const componentResults = Object.entries(testResults.componentAvailability);
    const availableComponents = componentResults.filter(([_, available]) => available).length;
    console.log(`⚛️ Component Availability: ${availableComponents}/${componentResults.length} available`);
    
    // React DevTools
    console.log(`🔧 React DevTools: ${testResults.reactDevTools ? 'Available' : 'Not Available'}`);
    
    // Errors
    if (testResults.errors.length > 0) {
        console.log(`❌ Errors Found: ${testResults.errors.length}`);
        testResults.errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
        });
    } else {
        console.log('✅ No errors found');
    }
    
    console.log('=' .repeat(60));
    
    // Overall status
    const hasErrors = testResults.errors.length > 0;
    const allComponentsAvailable = availableComponents === expectedComponents.length;
    
    if (!hasErrors && allComponentsAvailable) {
        console.log('🎉 ALL TESTS PASSED! React components are working correctly.');
    } else {
        console.log('⚠️ Some issues found. Please review the errors above.');
    }
    
    // Store results globally for inspection
    window.testResults = testResults;
    console.log('💾 Test results stored in window.testResults for inspection');
}

// Auto-run tests when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runComprehensiveTests);
} else {
    runComprehensiveTests();
}

// Export for manual testing
window.runReactComponentTests = runComprehensiveTests;