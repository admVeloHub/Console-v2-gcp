# Plano do Modal para Usuários Atribuídos

## Funcionalidades Atuais do Modal (Para Todos os Usuários)
- Visualização apenas leitura de detalhes do ticket
- Exibe informações básicas: solicitante, email, data, SLA, assunto, atribuído, processo, status
- Mostra histórico de mensagens/corpo do ticket
- Botão "Fechar" apenas

## Funcionalidades Planejadas para Modal de Usuários Atribuídos

### 1. **Editar Status do Ticket**
- Campo select editável para alterar status (novo, aberto, em espera, pendente, resolvido)
- Atualização automática via API quando alterado
- Validação para garantir que apenas o usuário atribuído pode alterar

### 2. **Adicionar Nova Mensagem**
- Campo de texto para nova mensagem
- Botão "Enviar Mensagem"
- Adiciona mensagem ao corpo do ticket com timestamp e autor
- Atualização em tempo real no histórico

### 3. **Atualizar Processo em Andamento**
- Campo editável para atualizar o campo "_processamento"
- Salva automaticamente ou com botão de confirmação

### 4. **Reatribuir Ticket** (opcional)
- Possibilidade de transferir para outro usuário
- Campo select com lista de usuários disponíveis

### 5. **Ações Específicas**
- Botão "Marcar como Resolvido" - muda status para resolvido
- Botão "Salvar Alterações" - para mudanças em lote
- Confirmação antes de fechar se houver mudanças não salvas

## Estrutura Condicional do Modal

```javascript
const isAssignedToCurrentUser = selectedTicket._atribuido === currentUserId;

if (isAssignedToCurrentUser) {
  // Renderizar modal com funcionalidades de edição
  return <AssignedUserModal ticket={selectedTicket} onClose={handleCloseDialog} />;
} else {
  // Renderizar modal apenas leitura
  return <ReadOnlyModal ticket={selectedTicket} onClose={handleCloseDialog} />;
}
```

## Componentes Necessários

### AssignedUserModal
- Header com título e botão fechar
- Grid de informações (parcialmente editável)
- Seção de mensagens (com campo para adicionar nova)
- Actions com botões específicos

### Campos Editáveis
- Status: Select dropdown
- Processo: TextField
- Nova Mensagem: TextField + Button

## Validações e Segurança
- Verificar se usuário está atribuído antes de permitir edições
- Validar mensagens não vazias
- Confirmar mudanças críticas (ex: marcar como resolvido)
- Tratamento de erros de API

## API Integration
- `updateTicketStatus(ticketId, newStatus)`
- `addMessageToTicket(ticketId, message)`
- `updateProcess(ticketId, processText)`
- Recarregar lista após mudanças

## Design Considerations
- Manter consistência visual com o resto da aplicação
- Usar cores do tema (blue-dark, blue-medium, etc.)
- Layout responsivo
- Feedback visual para ações (loading, success, error)