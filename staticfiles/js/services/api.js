// Função para obter o token CSRF
const getCSRFToken = () => {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
};

// Configuração padrão para requisições
const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCSRFToken()
};

// Serviço de API para Registros
const RegistroService = {
    // Criar novo registro
    async criar(dados) {
        try {
            const response = await fetch('/registrar-chamada/', {
                method: 'POST',
                headers: defaultHeaders,
                body: JSON.stringify(dados)
            });

            if (!response.ok) {
                throw new Error('Erro ao criar registro');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro no serviço:', error);
            throw error;
        }
    },

    // Verificar unidade
    async verificarUnidade(nome) {
        try {
            const response = await fetch(`/verificar-unidade/?nome=${encodeURIComponent(nome)}`, {
                method: 'GET',
                headers: defaultHeaders
            });

            if (!response.ok) {
                throw new Error('Erro ao verificar unidade');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao verificar unidade:', error);
            throw error;
        }
    }
};

// Serviço para Toast Messages
const ToastService = {
    show(title, message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" width="24" height="24"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        document.getElementById('toastContainer').appendChild(toast);
        lucide.createIcons();

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
}; 