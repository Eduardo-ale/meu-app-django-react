// Fallback simples para UnidadesSaudeReact
function UnidadesSaudeSimpleFallback() {
    console.log('🔄 Carregando fallback simples para Unidades de Saúde');
    
    const container = document.getElementById('unidades-saude-react-root');
    if (!container) return;
    
    const data = window.unidadesSaudeData;
    if (!data || !data.unidades) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; background: white; border-radius: 12px; margin: 2rem;">
                <div style="color: #dc2626; font-size: 3rem; margin-bottom: 1rem;">❌</div>
                <h3>Dados não disponíveis</h3>
                <p>Não foi possível carregar os dados das unidades de saúde.</p>
                <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer;">
                    Recarregar
                </button>
            </div>
        `;
        return;
    }
    
    // Renderizar lista simples
    let html = `
        <div style="background: white; border-radius: 12px; padding: 2rem; margin: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2 style="margin: 0;">🏥 Unidades de Saúde</h2>
                <a href="/accounts/unidades-saude/criar/" 
                   style="background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 500;">
                    ➕ Nova Unidade
                </a>
            </div>
            <div style="display: grid; gap: 1rem;">
    `;
    
    data.unidades.forEach(unidade => {
        html += `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; position: relative;">
                <h4 style="margin: 0 0 0.5rem 0; color: #374151;">${unidade.nome}</h4>
                <p style="margin: 0.25rem 0; color: #6b7280;">📍 ${unidade.endereco}</p>
                <p style="margin: 0.25rem 0; color: #6b7280;">📞 ${unidade.telefone}</p>
                <p style="margin: 0.25rem 0; color: #6b7280;">🏢 ${unidade.municipio}</p>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <a href="/accounts/unidades-saude/${unidade.id}/visualizar/" 
                       style="background: #f59e0b; color: white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-size: 0.85rem;">
                        👁️ Visualizar
                    </a>
                    <a href="/accounts/unidades-saude/${unidade.id}/editar/" 
                       style="background: #8b5cf6; color: white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-size: 0.85rem;">
                        ✏️ Editar
                    </a>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    console.log('✅ Fallback simples carregado com sucesso');
}

// Tentar carregar fallback se React falhar
setTimeout(() => {
    if (document.getElementById('unidades-saude-react-root') && 
        !document.querySelector('.unidades-saude-container')) {
        console.log('⚠️ React não carregou, usando fallback simples');
        UnidadesSaudeSimpleFallback();
    }
}, 3000); 