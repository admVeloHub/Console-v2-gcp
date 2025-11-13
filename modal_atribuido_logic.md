# Lógica Condicional para Modal de Usuários Atribuídos

## Verificação de Atribuição

```javascript
const currentUserId = user._userId || user.email || user._userMail;
const isAssignedToCurrentUser = selectedTicket._atribuido === currentUserId;
```

## Estrutura Condicional do Modal

### Condição Principal
```javascript
{selectedTicket && (
  isAssignedToCurrentUser ? (
    <AssignedUserModal
      ticket={selectedTicket}
      onClose={handleCloseDialog}
      onUpdate={handleTicketUpdate}
      currentUser={user}
    />
  ) : (
    <ReadOnlyModal
      ticket={selectedTicket}
      onClose={handleCloseDialog}
    />
  )
)}
```

## Componente AssignedUserModal

### Estados Locais Necessários
```javascript
const [editedStatus, setEditedStatus] = useState(selectedTicket._statusHub || selectedTicket._statusConsole);
const [editedProcess, setEditedProcess] = useState(selectedTicket._processamento || '');
const [newMessage, setNewMessage] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
```

### Handlers para Ações

#### Atualizar Status
```javascript
const handleStatusChange = async (newStatus) => {
  setIsLoading(true);
  try {
    const endpoint = selectedTicket._id.startsWith('TKC-') ? 'conteudo' : 'gestao';
    const updateData = {
      _statusHub: newStatus,
      _statusConsole: newStatus,
      _lastUpdatedBy: currentUserId
    };

    if (endpoint === 'conteudo') {
      await ticketsAPI.updateConteudo(selectedTicket._id, updateData);
    } else {
      await ticketsAPI.updateGestao(selectedTicket._id, updateData);
    }

    // Atualizar ticket localmente
    setSelectedTicket(prev => ({
      ...prev,
      _statusHub: newStatus,
      _statusConsole: newStatus
    }));

    // Recarregar lista de tickets
    await loadTickets();

    setHasUnsavedChanges(false);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    setError('Erro ao atualizar status do ticket');
  } finally {
    setIsLoading(false);
  }
};
```

#### Atualizar Processo
```javascript
const handleProcessUpdate = async () => {
  if (!editedProcess.trim()) return;

  setIsLoading(true);
  try {
    const endpoint = selectedTicket._id.startsWith('TKC-') ? 'conteudo' : 'gestao';
    const updateData = {
      _processamento: editedProcess,
      _lastUpdatedBy: currentUserId
    };

    if (endpoint === 'conteudo') {
      await ticketsAPI.updateConteudo(selectedTicket._id, updateData);
    } else {
      await ticketsAPI.updateGestao(selectedTicket._id, updateData);
    }

    setSelectedTicket(prev => ({
      ...prev,
      _processamento: editedProcess
    }));

    setHasUnsavedChanges(false);
  } catch (error) {
    console.error('Erro ao atualizar processo:', error);
    setError('Erro ao atualizar processo');
  } finally {
    setIsLoading(false);
  }
};
```

#### Adicionar Mensagem
```javascript
const handleAddMessage = async () => {
  if (!newMessage.trim()) return;

  setIsLoading(true);
  try {
    const newMessageObj = {
      mensagem: newMessage,
      userName: user._userId || user.email,
      autor: 'admin',
      timestamp: new Date().toISOString()
    };

    const updatedCorpo = [...(selectedTicket._corpo || []), newMessageObj];

    const endpoint = selectedTicket._id.startsWith('TKC-') ? 'conteudo' : 'gestao';
    const updateData = {
      _corpo: updatedCorpo,
      _lastUpdatedBy: currentUserId
    };

    if (endpoint === 'conteudo') {
      await ticketsAPI.updateConteudo(selectedTicket._id, updateData);
    } else {
      await ticketsAPI.updateGestao(selectedTicket._id, updateData);
    }

    setSelectedTicket(prev => ({
      ...prev,
      _corpo: updatedCorpo
    }));

    setNewMessage('');
    setHasUnsavedChanges(false);

    // Recarregar lista de tickets
    await loadTickets();
  } catch (error) {
    console.error('Erro ao adicionar mensagem:', error);
    setError('Erro ao adicionar mensagem');
  } finally {
    setIsLoading(false);
  }
};
```

#### Marcar como Resolvido
```javascript
const handleMarkAsResolved = async () => {
  const confirmResolve = window.confirm('Tem certeza que deseja marcar este ticket como resolvido?');
  if (!confirmResolve) return;

  await handleStatusChange('resolvido');
};
```

## Validações

### Antes de Fechar Modal
```javascript
const handleCloseWithConfirmation = () => {
  if (hasUnsavedChanges) {
    const confirmClose = window.confirm('Existem alterações não salvas. Deseja realmente fechar?');
    if (!confirmClose) return;
  }
  handleCloseDialog();
};
```

### Validação de Campos
```javascript
const validateMessage = (message) => {
  if (!message.trim()) {
    return 'A mensagem não pode estar vazia';
  }
  if (message.length > 1000) {
    return 'A mensagem deve ter no máximo 1000 caracteres';
  }
  return null;
};

const validateProcess = (process) => {
  if (process.length > 500) {
    return 'O processo deve ter no máximo 500 caracteres';
  }
  return null;
};
```

## Estados de Loading e Error

### Loading States
- Desabilitar campos durante operações
- Mostrar CircularProgress nos botões
- Feedback visual claro

### Error Handling
- Snackbar para mensagens de erro
- Logging detalhado de erros
- Retry automático para falhas de rede

## Integração com API

### Endpoints Utilizados
- `ticketsAPI.updateConteudo(id, data)` - Para tickets de conteúdo
- `ticketsAPI.updateGestao(id, data)` - Para tickets de gestão
- `ticketsAPI.getAll()` - Para recarregar lista

### Estrutura de Dados
```javascript
// Update Data Structure
{
  _statusHub?: string,
  _statusConsole?: string,
  _processamento?: string,
  _corpo?: Array<{
    mensagem: string,
    userName: string,
    autor: string,
    timestamp: string
  }>,
  _lastUpdatedBy: string
}
```

## Sincronização de Estado

### Atualização Local
- Atualizar selectedTicket state imediatamente após sucesso da API
- Manter consistência entre UI e dados

### Recarregamento Global
- Chamar loadTickets() após mudanças para atualizar tabela
- Garantir que mudanças sejam refletidas em toda a aplicação