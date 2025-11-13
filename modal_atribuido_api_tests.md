# Testes de Integração com API para Modal de Usuários Atribuídos

## Cenários de Teste

### 1. Atualização de Status
```javascript
// Teste: Atualizar status de "aberto" para "em espera"
describe('Status Update', () => {
  test('should update ticket status successfully', async () => {
    const mockTicket = {
      _id: 'TKG-001',
      _statusHub: 'aberto',
      _statusConsole: 'aberto',
      _atribuido: 'user123'
    };

    const newStatus = 'em espera';

    // Mock da API
    ticketsAPI.updateGestao = jest.fn().mockResolvedValue({
      success: true,
      data: { ...mockTicket, _statusHub: newStatus, _statusConsole: newStatus }
    });

    // Executar ação
    await handleStatusChange(newStatus);

    // Verificações
    expect(ticketsAPI.updateGestao).toHaveBeenCalledWith('TKG-001', {
      _statusHub: newStatus,
      _statusConsole: newStatus,
      _lastUpdatedBy: 'user123'
    });

    expect(selectedTicket._statusHub).toBe(newStatus);
    expect(selectedTicket._statusConsole).toBe(newStatus);
  });

  test('should handle API error gracefully', async () => {
    ticketsAPI.updateGestao = jest.fn().mockRejectedValue({
      response: { status: 500, data: { message: 'Internal Server Error' } }
    });

    await handleStatusChange('em espera');

    expect(error).toBe('Erro interno do servidor. Tente novamente mais tarde.');
  });
});
```

### 2. Adição de Mensagem
```javascript
// Teste: Adicionar nova mensagem ao ticket
describe('Add Message', () => {
  test('should add message to ticket successfully', async () => {
    const mockTicket = {
      _id: 'TKC-001',
      _corpo: [
        {
          mensagem: 'Mensagem existente',
          userName: 'Outro usuário',
          autor: 'user',
          timestamp: '2024-01-01T10:00:00Z'
        }
      ]
    };

    const newMessage = 'Nova mensagem de teste';

    ticketsAPI.updateConteudo = jest.fn().mockResolvedValue({
      success: true,
      data: {
        ...mockTicket,
        _corpo: [
          ...mockTicket._corpo,
          {
            mensagem: newMessage,
            userName: 'user123',
            autor: 'admin',
            timestamp: expect.any(String)
          }
        ]
      }
    });

    setNewMessage(newMessage);
    await handleAddMessage();

    expect(ticketsAPI.updateConteudo).toHaveBeenCalled();
    expect(selectedTicket._corpo).toHaveLength(2);
    expect(selectedTicket._corpo[1].mensagem).toBe(newMessage);
    expect(newMessage).toBe(''); // Campo limpo após envio
  });

  test('should validate message before sending', async () => {
    setNewMessage(''); // Mensagem vazia
    await handleAddMessage();

    expect(ticketsAPI.updateConteudo).not.toHaveBeenCalled();
    expect(error).toBe('A mensagem não pode estar vazia');
  });
});
```

### 3. Atualização de Processo
```javascript
// Teste: Atualizar campo de processo
describe('Process Update', () => {
  test('should update process field', async () => {
    const newProcess = 'Processo atualizado para análise';

    ticketsAPI.updateGestao = jest.fn().mockResolvedValue({
      success: true,
      data: { _processamento: newProcess }
    });

    setEditedProcess(newProcess);
    await handleProcessUpdate();

    expect(ticketsAPI.updateGestao).toHaveBeenCalledWith('TKG-001', {
      _processamento: newProcess,
      _lastUpdatedBy: 'user123'
    });
  });
});
```

## Testes de Integração Completa

### Teste de Fluxo Completo
```javascript
describe('Complete Ticket Workflow', () => {
  test('should handle full ticket management flow', async () => {
    // 1. Abrir modal
    const ticket = await renderModal('TKG-001');

    // 2. Verificar se é usuário atribuído
    expect(isAssignedToCurrentUser).toBe(true);

    // 3. Atualizar status
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'em espera');
    expect(selectedTicket._statusHub).toBe('em espera');

    // 4. Adicionar mensagem
    await userEvent.type(screen.getByLabelText('Nova Mensagem'), 'Mensagem de teste');
    await userEvent.click(screen.getByText('Enviar Mensagem'));
    expect(selectedTicket._corpo).toHaveLength(1);

    // 5. Atualizar processo
    await userEvent.type(screen.getByLabelText('Processo'), 'Novo processo');
    await userEvent.click(screen.getByText('Salvar Processo'));
    expect(selectedTicket._processamento).toBe('Novo processo');

    // 6. Marcar como resolvido
    await userEvent.click(screen.getByText('Marcar como Resolvido'));
    expect(mockConfirm).toHaveBeenCalled();
    expect(selectedTicket._statusHub).toBe('resolvido');
  });
});
```

## Testes de Erro e Edge Cases

### Testes de Rede
```javascript
describe('Network Error Handling', () => {
  test('should retry on network failure', async () => {
    let attempts = 0;
    ticketsAPI.updateGestao = jest.fn()
      .mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject({ code: 'NETWORK_ERROR' });
        }
        return Promise.resolve({ success: true });
      });

    await handleStatusChange('em espera');

    expect(ticketsAPI.updateGestao).toHaveBeenCalledTimes(3);
  });

  test('should show appropriate error for 403', async () => {
    ticketsAPI.updateGestao = jest.fn().mockRejectedValue({
      response: { status: 403 }
    });

    await handleStatusChange('em espera');

    expect(error).toBe('Você não tem permissão para esta ação');
  });
});
```

### Testes de Validação
```javascript
describe('Validation Tests', () => {
  test('should prevent empty message submission', async () => {
    setNewMessage('');
    await handleAddMessage();

    expect(ticketsAPI.updateConteudo).not.toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalledWith('A mensagem não pode estar vazia', 'error');
  });

  test('should prevent overly long messages', async () => {
    const longMessage = 'a'.repeat(1001);
    setNewMessage(longMessage);
    await handleAddMessage();

    expect(ticketsAPI.updateConteudo).not.toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalledWith('A mensagem deve ter no máximo 1000 caracteres', 'error');
  });
});
```

## Testes de Performance

### Teste de Debounce
```javascript
describe('Performance Tests', () => {
  test('should debounce rapid status changes', async () => {
    jest.useFakeTimers();

    // Simular mudanças rápidas de status
    handleStatusChange('em espera');
    handleStatusChange('aberto');
    handleStatusChange('pendente');

    jest.advanceTimersByTime(500);

    expect(ticketsAPI.updateGestao).toHaveBeenCalledTimes(1);
    expect(ticketsAPI.updateGestao).toHaveBeenCalledWith('TKG-001', {
      _statusHub: 'pendente',
      _statusConsole: 'pendente',
      _lastUpdatedBy: 'user123'
    });
  });
});
```

## Testes de Segurança

### Testes de Permissões
```javascript
describe('Security Tests', () => {
  test('should prevent unauthorized status changes', async () => {
    // Mock ticket não atribuído ao usuário
    const ticket = { _atribuido: 'otherUser' };

    expect(() => checkUserPermissions(ticket, user)).toThrow('Você não tem permissão para editar este ticket');
  });

  test('should validate user session', async () => {
    // Mock usuário não autenticado
    const invalidUser = null;

    await expect(handleStatusChange('aberto')).rejects.toThrow('Usuário não autenticado');
  });
});
```

## Mocks Necessários

### Mock da API
```javascript
jest.mock('../services/ticketsAPI', () => ({
  updateGestao: jest.fn(),
  updateConteudo: jest.fn(),
  getAll: jest.fn()
}));
```

### Mock do Context
```javascript
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      _userId: 'user123',
      email: 'user@example.com'
    }
  })
}));
```

## Configuração de Testes

### Setup do Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
};
```

### Setup de Testes
```javascript
// src/setupTests.js
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());