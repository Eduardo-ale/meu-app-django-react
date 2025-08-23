console.log('🚀 Entry point senha.js carregado');

// Aguardar o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM carregado');
    
    const container = document.getElementById('senha-react-root');
    console.log('🔍 Container:', container);
    
    if (container) {
        console.log('✅ Container encontrado');
        
        // Primeiro, mostrar que o JavaScript está funcionando
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 2rem auto; max-width: 800px;">
                <h1 style="color: #1f2937; margin-bottom: 1rem;">🔧 Carregando React...</h1>
                <p style="color: #6b7280; margin-bottom: 2rem;">JavaScript funcionando! Agora carregando componente...</p>
                <div style="background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 1rem; border-radius: 6px;">
                    <strong>Status:</strong> Carregando React...
                </div>
            </div>
        `;
        
        console.log('✅ HTML de status renderizado');
        
        // Aguardar um pouco e tentar carregar o React
        setTimeout(function() {
            console.log('🔧 Tentando carregar React...');
            
            // Verificar se React está disponível globalmente
            if (typeof window.React === 'undefined') {
                console.error('❌ React não está disponível globalmente');
                container.innerHTML = `
                    <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 2rem auto; max-width: 800px;">
                        <h1 style="color: #1f2937; margin-bottom: 1rem;">❌ Erro: React não carregou</h1>
                        <p style="color: #6b7280; margin-bottom: 2rem;">O React não foi carregado corretamente</p>
                        <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 6px;">
                            <strong>Problema:</strong> React não está disponível globalmente
                            <br>Verifique se react_scripts_base.html está sendo incluído
                        </div>
                    </div>
                `;
                return;
            }
            
            if (typeof window.ReactDOM === 'undefined') {
                console.error('❌ ReactDOM não está disponível globalmente');
                container.innerHTML = `
                    <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 2rem auto; max-width: 800px;">
                        <h1 style="color: #1f2937; margin-bottom: 1rem;">❌ Erro: ReactDOM não carregou</h1>
                        <p style="color: #6b7280; margin-bottom: 2rem;">O ReactDOM não foi carregado corretamente</p>
                        <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 6px;">
                            <strong>Problema:</strong> ReactDOM não está disponível globalmente
                            <br>Verifique se react_scripts_base.html está sendo incluído
                        </div>
                    </div>
                `;
                return;
            }
            
            console.log('✅ React e ReactDOM disponíveis globalmente');
            
            // Tentar carregar o componente usando import dinâmico
            import('../components/SenhaReact').then(module => {
                console.log('✅ Módulo SenhaReact carregado:', module);
                
                const SenhaReact = module.default;
                console.log('✅ Componente SenhaReact:', SenhaReact);
                
                // Tentar renderizar usando React global
                try {
                    const root = window.ReactDOM.createRoot(container);
                    console.log('✅ Root criado');
                    
                    root.render(window.React.createElement(SenhaReact, window.senhaProps || {}));
                    console.log('✅ Componente renderizado com sucesso!');
                    
                    // Mostrar sucesso
                    container.innerHTML = `
                        <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 2rem auto; max-width: 800px;">
                            <h1 style="color: #1f2937; margin-bottom: 1rem;">🎉 REACT FUNCIONANDO!</h1>
                            <p style="color: #6b7280; margin-bottom: 2rem;">Componente React carregado com sucesso!</p>
                            <div style="background: #d1fae5; border: 1px solid #a7f3d0; color: #065f46; padding: 1rem; border-radius: 6px;">
                                <strong>✅ Sucesso:</strong> O React está funcionando perfeitamente!
                                <br>O componente SenhaReact foi renderizado!
                            </div>
                        </div>
                    `;
                    
                } catch (renderError) {
                    console.error('❌ Erro ao renderizar:', renderError);
                    container.innerHTML = `
                        <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 2rem auto; max-width: 800px;">
                            <h1 style="color: #1f2937; margin-bottom: 1rem;">❌ Erro de Renderização</h1>
                            <p style="color: #6b7280; margin-bottom: 2rem;">O React carregou mas falhou ao renderizar</p>
                            <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 6px;">
                                <strong>Erro:</strong> ${renderError.message}
                            </div>
                        </div>
                    `;
                }
                
            }).catch(importError => {
                console.error('❌ Erro ao importar SenhaReact:', importError);
                container.innerHTML = `
                    <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 2rem auto; max-width: 800px;">
                        <h1 style="color: #1f2937; margin-bottom: 1rem;">❌ Erro de Importação</h1>
                        <p style="color: #6b7280; margin-bottom: 2rem;">Falha ao carregar o componente SenhaReact</p>
                        <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 6px;">
                            <strong>Erro:</strong> ${importError.message}
                            <br>Verifique se o componente está sendo exportado corretamente
                        </div>
                    </div>
                `;
            });
            
        }, 1000); // Aguardar 1 segundo
        
    } else {
        console.error('❌ Container não encontrado');
    }
});