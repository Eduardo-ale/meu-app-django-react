// Componente de Input com validação
const InputField = ({ label, name, value, onChange, required, placeholder, type = 'text', error }) => {
    return (
        <div className="col-md-6">
            <label className="form-label">{label}</label>
            <input
                type={type}
                className={`form-control ${error ? 'is-invalid' : value ? 'is-valid' : ''}`}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
            />
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
};

// Componente de Select
const SelectField = ({ label, name, value, onChange, options, required, error }) => {
    return (
        <div className="col-md-6">
            <label className="form-label">{label}</label>
            <select 
                className={`form-select ${error ? 'is-invalid' : value ? 'is-valid' : ''}`}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
            >
                <option value="" disabled>Selecione uma opção</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
};

// Componente de TextArea
const TextAreaField = ({ label, name, value, onChange, required, rows = 4, error }) => {
    return (
        <div className="col-12">
            <label className="form-label">{label}</label>
            <textarea
                className={`form-control ${error ? 'is-invalid' : value ? 'is-valid' : ''}`}
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                required={required}
            />
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
};

// Componente Toast para mensagens de sucesso
const Toast = ({ message, type = 'success', onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`toast show position-fixed top-0 end-0 m-3 text-white bg-${type}`} role="alert">
            <div className="toast-body d-flex align-items-center">
                <i className={`me-2 ${type === 'success' ? 'bi bi-check-circle' : 'bi bi-exclamation-circle'}`}></i>
                {message}
                <button type="button" className="btn-close btn-close-white ms-auto" onClick={onClose}></button>
            </div>
        </div>
    );
};

// Componente de Verificação de Unidade
const UnidadeVerification = ({ value, onChange, onVerify, isVerified, isLoading, error }) => {
    return (
        <div className="col-12">
            <label className="form-label">Nome da Unidade</label>
            <div className="input-group input-group-verification">
                <input
                    type="text"
                    className={`form-control ${error ? 'is-invalid' : isVerified ? 'is-valid' : ''}`}
                    name="unidade"
                    value={value}
                    onChange={onChange}
                    placeholder="Digite o nome da unidade de saúde"
                    required
                />
                <button 
                    className={`btn btn-primary btn-verify ${isLoading ? 'loading' : ''}`}
                    type="button"
                    onClick={onVerify}
                    disabled={isLoading}
                >
                    <i className={`bi ${isLoading ? 'bi-hourglass-split' : 'bi-search'}`}></i>
                    {isLoading ? 'Verificando...' : 'Verificar'}
                </button>
            </div>
            {error && <div className="invalid-feedback d-block">{error}</div>}
            {isVerified && <div className="valid-feedback d-block">Unidade encontrada com sucesso!</div>}
        </div>
    );
}; 