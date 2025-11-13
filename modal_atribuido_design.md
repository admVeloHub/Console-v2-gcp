# Design da Interface do Modal para Usuários Atribuídos

## Layout Geral do Modal

### Header
```
[Título do Ticket] - [Tipo] - [Assunto]
┌─────────────────────────────────────────────────┐
│ [Título]                                       [X] │
└─────────────────────────────────────────────────┘
```

### Corpo Principal - Grid de Informações (2 colunas)
```
┌─────────────────┬─────────────────┐
│ Solicitante:    │ Email:          │
│ [Nome]          │ [email]         │
├─────────────────┼─────────────────┤
│ Data:           │ SLA:            │
│ [DD/MM/YYYY]    │ [2d]            │
├─────────────────┼─────────────────┤
│ Assunto:        │ Atribuído:      │
│ [Texto]         │ [Nome]          │
├─────────────────┼─────────────────┤
│ Processo:       │ Status:         │
│ [EDITÁVEL]      │ [DROPDOWN]      │
└─────────────────┴─────────────────┘
```

### Seção de Mensagens
```
Corpo da Mensagem:
┌─────────────────────────────────────────────────┐
│ [Histórico de mensagens]                        │
│                                                 │
│ [Mensagem 1 - Autor - Data/Hora]                │
│ Texto da mensagem...                            │
│                                                 │
│ [Mensagem 2 - Autor - Data/Hora]                │
│ Texto da mensagem...                            │
└─────────────────────────────────────────────────┘

Adicionar Nova Mensagem:
┌─────────────────────────────────────────────────┐
│ [Campo de texto multilinha]                     │
└─────────────────────────────────────────────────┘
```

### Footer com Ações
```
┌─────────────────────────────────────────────────┐
│ [Salvar Alterações] [Marcar Resolvido] [Fechar] │
└─────────────────────────────────────────────────┘
```

## Campos Editáveis

### 1. Status (Select Dropdown)
- Opções: Novo, Aberto, Em Espera, Pendente, Resolvido
- Cores específicas por status
- Atualização imediata ao selecionar

### 2. Processo em Andamento (TextField)
- Campo de texto simples
- Placeholder: "Descreva o processo atual..."
- Auto-save ou botão salvar

### 3. Nova Mensagem (TextField Multilinha)
- Campo textarea
- Placeholder: "Digite sua mensagem..."
- Botão "Enviar Mensagem" adjacente

## Estados Visuais

### Loading States
- Spinner durante salvamento
- Disabled fields durante operações

### Success/Error States
- Snackbar verde para sucesso
- Snackbar vermelho para erro
- Bordas vermelhas em campos com erro

### Edit Mode Indicators
- Ícone de lápis nos campos editáveis
- Destaque visual (borda azul) quando em foco

## Componentes Material-UI Utilizados

- `Dialog` - Container principal
- `DialogTitle` - Header
- `DialogContent` - Corpo
- `DialogActions` - Footer
- `TextField` - Campos editáveis
- `Select` - Dropdown de status
- `Button` - Ações
- `Chip` - Status display
- `CircularProgress` - Loading
- `Alert` - Mensagens de erro/sucesso

## Responsividade

### Desktop (>768px)
- Grid 2 colunas para informações
- Largura máxima do modal: 800px

### Tablet (768px - 480px)
- Grid 1 coluna para informações
- Largura máxima: 90vw

### Mobile (<480px)
- Layout vertical completo
- Campos full-width
- Botões empilhados

## Acessibilidade

- Labels adequados para todos os campos
- Navegação por teclado (Tab)
- ARIA labels para ações
- Contraste de cores adequado
- Focus indicators visuais

## Interações

### Hover Effects
- Botões: background color change
- Campos editáveis: border highlight

### Focus States
- Outline azul para campos ativos
- Shadow para elementos focados

### Transitions
- Smooth transitions para mudanças de estado
- Fade in/out para loading states