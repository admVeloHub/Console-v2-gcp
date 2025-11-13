# Validações e Tratamento de Erros para Modal de Usuários Atribuídos

## Validações de Campos

### Validação de Mensagem
```javascript
const validateMessage = (message) => {
  const errors = [];

  if (!message || !message.trim()) {
    errors.push('A mensagem não pode estar vazia');
  }

  if (message && message.length > 1000) {
    errors.push('A mensagem deve ter no máximo 1000 caracteres');
  }

  if (message && message.trim().length < 5) {
    errors.push('A mensagem deve ter pelo menos 5 caracteres');
  }

  return errors;
};
```

### Validação de Processo
```javascript
const validateProcess = (process) => {
  const errors = [];

  if (process && process.length > 500) {
    errors.push('A descrição do processo deve ter no máximo 500 caracteres');
  }

  return errors;
};
```

### Validação de Status
```javascript
const validateStatusChange = (currentStatus, newStatus, userRole) => {
  const errors = [];

  // Verificar se o usuário tem permissão para alterar para este status
  const allowedStatuses = ['novo', 'aberto', 'em espera', 'pendente', 'resolvido'];

  if (!allowedStatuses.includes(newStatus)) {
    errors.push('Status inválido selecionado');
  }

  // Regras de negócio específicas
  if (currentStatus === 'resolvido' && newStatus !== 'resolvido') {
    errors.push('Não é possível reabrir um ticket resolvido');
  }

  return errors;
};
```

## Tratamento de Erros de API

### Estrutura de Erro Padrão
```javascript
const handleApiError = (error, operation) => {
  console.error(`Erro na operação ${operation}:`, error);

  let userMessage = 'Ocorreu um erro inesperado. Tente novamente.';

  if (error.response) {
    // Erro de resposta do servidor
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        userMessage = data.message || 'Dados inválidos enviados';
        break;
      case 401:
        userMessage = 'Sessão expirada. Faça login novamente.';
        // Redirecionar para login
        break;
      case 403:
        userMessage = 'Você não tem permissão para esta ação';
        break;
      case 404:
        userMessage = 'Ticket não encontrado';
        break;
      case 409:
        userMessage = 'O ticket foi modificado por outro usuário. Recarregue a página.';
        break;
      case 500:
        userMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
        break;
      default:
        userMessage = `Erro ${status}: ${data.message || 'Erro desconhecido'}`;
    }
  } else if (error.request) {
    // Erro de rede
    userMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  // Mostrar mensagem para o usuário
  setError(userMessage);

  // Logging adicional para debug
  if (process.env.NODE_ENV === 'development') {
    console.error('Detalhes do erro:', {
      operation,
      error: error.message,
      stack: error.stack,
      response: error.response?.data
    });
  }

  return userMessage;
};
```

## Estados de Loading e Feedback

### Loading States por Operação
```javascript
const [loadingStates, setLoadingStates] = useState({
  updatingStatus: false,
  updatingProcess: false,
  addingMessage: false,
  markingResolved: false
});

const setLoading = (operation, isLoading) => {
  setLoadingStates(prev => ({
    ...prev,
    [operation]: isLoading
  }));
};
```

### Feedback Visual para Usuário

#### Snackbar para Mensagens
```javascript
const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'info' // 'success', 'error', 'warning', 'info'
});

const showSnackbar = (message, severity = 'info') => {
  setSnackbar({
    open: true,
    message,
    severity
  });
};

const handleSnackbarClose = () => {
  setSnackbar(prev => ({ ...prev, open: false }));
};
```

#### Componente de Snackbar
```jsx
<Snackbar
  open={snackbar.open}
  autoHideDuration={6000}
  onClose={handleSnackbarClose}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert
    onClose={handleSnackbarClose}
    severity={snackbar.severity}
    sx={{ width: '100%' }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>
```

## Validações de Segurança

### Verificação de Permissões
```javascript
const checkUserPermissions = (ticket, user) => {
  const currentUserId = user._userId || user.email || user._userMail;

  // Verificar se o ticket está atribuído ao usuário atual
  if (ticket._atribuido !== currentUserId) {
    throw new Error('Você não tem permissão para editar este ticket');
  }

  // Verificar se o usuário tem role adequado (se aplicável)
  // if (!user.roles?.includes('admin') && !user.roles?.includes('support')) {
  //   throw new Error('Role insuficiente para editar tickets');
  // }

  return true;
};
```

### Prevenção de Modificações Concorrentes
```javascript
const checkTicketVersion = async (ticketId, expectedVersion) => {
  try {
    const currentTicket = await ticketsAPI.getById(ticketId);

    if (currentTicket._lastUpdated !== expectedVersion) {
      throw new Error('O ticket foi modificado por outro usuário. Recarregue a página.');
    }

    return true;
  } catch (error) {
    throw error;
  }
};
```

## Validações de Interface

### Confirmação de Ações Destrutivas
```javascript
const confirmDestructiveAction = (action, item) => {
  const messages = {
    resolve: `Tem certeza que deseja marcar o ticket "${item}" como resolvido?`,
    delete: `Tem certeza que deseja excluir "${item}"?`,
    reassign: `Tem certeza que deseja reatribuir o ticket "${item}"?`
  };

  return window.confirm(messages[action] || 'Tem certeza desta ação?');
};
```

### Validação de Campos Obrigatórios
```javascript
const validateRequiredFields = (data, requiredFields) => {
  const errors = [];

  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors.push(`O campo ${field} é obrigatório`);
    }
  });

  return errors;
};
```

## Tratamento de Erros de Rede

### Retry Logic
```javascript
const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }

      // Esperar antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
};

const isRetryableError = (error) => {
  // Erros que podem ser retentados
  return error.code === 'NETWORK_ERROR' ||
         error.response?.status >= 500 ||
         error.response?.status === 429; // Too Many Requests
};
```

## Logging e Monitoramento

### Logging Estruturado
```javascript
const logUserAction = (action, ticketId, details = {}) => {
  const logData = {
    timestamp: new Date().toISOString(),
    userId: user._userId || user.email,
    action,
    ticketId,
    ...details
  };

  // Em desenvolvimento, log no console
  if (process.env.NODE_ENV === 'development') {
    console.log('User Action:', logData);
  }

  // Em produção, enviar para serviço de logging
  // await loggingService.log(logData);
};
```

### Métricas de Uso
```javascript
const trackMetrics = (event, data = {}) => {
  // Implementar tracking de métricas
  // Ex: tempo de resposta, taxa de erro, etc.
};