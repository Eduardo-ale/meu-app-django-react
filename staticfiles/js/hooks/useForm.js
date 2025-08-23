// Hook para gerenciar estado do formulário
const useForm = (initialState = {}) => {
    const [values, setValues] = React.useState(initialState);
    const [errors, setErrors] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(false);
    const [toast, setToast] = React.useState(null);

    const validateField = (name, value) => {
        switch (name) {
            case 'nome':
                if (!value) return 'Nome é obrigatório';
                if (value.length < 3) return 'Nome deve ter pelo menos 3 caracteres';
                break;
            case 'telefone':
                if (!value) return 'Telefone é obrigatório';
                if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)) {
                    return 'Formato inválido. Use (00) 00000-0000';
                }
                break;
            case 'funcao':
                if (!value) return 'Função é obrigatória';
                if (value.length < 3) return 'Função deve ter pelo menos 3 caracteres';
                break;
            case 'setor':
                if (!value) return 'Setor é obrigatório';
                if (value.length < 2) return 'Setor deve ter pelo menos 2 caracteres';
                break;
            case 'tipo_chamada':
                if (!value) return 'Tipo de chamada é obrigatório';
                break;
            case 'status':
                if (!value) return 'Status é obrigatório';
                break;
            case 'nome_atendente':
                if (!value) return 'Nome do atendente é obrigatório';
                if (value.length < 3) return 'Nome do atendente deve ter pelo menos 3 caracteres';
                break;
            case 'descricao':
                if (!value) return 'Descrição é obrigatória';
                if (value.length < 10) return 'Descrição deve ter pelo menos 10 caracteres';
                break;
            case 'solucao':
                if (!value) return 'Solução/Encaminhamento é obrigatório';
                if (value.length < 10) return 'Solução/Encaminhamento deve ter pelo menos 10 caracteres';
                break;
            case 'unidade':
                if (!value) return 'Nome da unidade é obrigatório';
                break;
            default:
                return '';
        }
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Validação em tempo real
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const validate = () => {
        const newErrors = {};
        
        // Validar todos os campos
        Object.keys(values).forEach(name => {
            const error = validateField(name, values[name]);
            if (error) newErrors[name] = error;
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async (e, onSubmit) => {
        e.preventDefault();
        
        if (!validate()) {
            showToast('Por favor, corrija os erros no formulário', 'danger');
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(values);
            showToast('Chamado registrado com sucesso!');
            setValues(initialState);
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            showToast('Erro ao enviar formulário. Tente novamente.', 'danger');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        values,
        errors,
        isLoading,
        toast,
        handleChange,
        handleSubmit,
        setValues,
        setErrors,
        setToast
    };
};

// Hook para gerenciar verificação de unidade
const useUnidadeVerification = () => {
    const [isVerified, setIsVerified] = React.useState(false);
    const [isVerifying, setIsVerifying] = React.useState(false);

    const verificarUnidade = async (unidade) => {
        if (!unidade) {
            alert('Digite o nome da unidade');
            return;
        }
        
        setIsVerifying(true);
        try {
            // Simular chamada à API (substitua por chamada real)
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsVerified(true);
        } catch (error) {
            setIsVerified(false);
            console.error('Erro ao verificar unidade:', error);
        } finally {
            setIsVerifying(false);
        }
    };

    return {
        isVerified,
        isVerifying,
        verificarUnidade,
        setIsVerified
    };
}; 