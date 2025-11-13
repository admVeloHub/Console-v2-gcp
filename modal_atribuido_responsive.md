# Design Responsivo e Acessibilidade do Modal Aprimorado

## Breakpoints e Layouts

### Desktop (>1024px)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Título do Ticket]                                                      [X] │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┐ ┌─────────────┬─────────────┐                 │
│ │ Solicitante │ Email       │ │ Data        │ SLA         │                 │
│ │ [Nome]      │ [email]     │ │ [DD/MM/YYYY]│ [2d]        │     EM ESPERA   │
| ├─────────────────────────────────────────────────────────┤                 │
│ │ Assunto     │ Atribuído   │ │ Processo    │ Status      │     RESOLVIDO   │
│ │ [Texto]     │ [Nome]      │ │ [EDITÁVEL]  │ [DROPDOWN]  │                 │
│ └─────────────┴─────────────┘ └─────────────┴─────────────┘                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ Histórico de mensagens:                                                     │
│ ┌─────────────────────────────────────────────┐                             │
│ │ Autor - Data/Hora                           │                             │
│ │ Texto da mensagem...                        │                             │
│ └─────────────────────────────────────────────┘                             │
│ ┌─────────────────────────────────────────────┐                             │
│ │ Autor - Data/Hora                           │                             │
│ │ Texto da mensagem...                        │                             │
│ └─────────────────────────────────────────────┘                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ [Campo multilinha para nova mensagem]                                   | │
│ │                                                                  [SEND] │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## CSS Grid e Flexbox Implementation

### Container Principal
```css
.modal-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 16px;
}

@media (min-width: 768px) {
  .modal-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  .modal-container {
    max-width: 800px;
    margin: 0 auto;
  }
}
```

### Grid de Informações
```css
.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```

### Seção de Mensagens
```css
.messages-section {
  grid-column: 1 / -1; /* Ocupa toda a largura */
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-history {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
}

@media (max-width: 767px) {
  .message-history {
    max-height: 200px;
  }
}
```

### Botões de Ação
```css
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

@media (max-width: 767px) {
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons .MuiButton-root {
    width: 100%;
    margin-bottom: 8px;
  }
}
```

## Acessibilidade (WCAG 2.1)

### Navegação por Teclado
- **Tab Order**: Campos devem seguir ordem lógica (esquerda para direita, cima para baixo)
- **Focus Indicators**: Outline visível em todos os elementos focáveis
- **Escape Key**: Fecha modal
- **Enter/Space**: Ativa botões e selects

```css
.focusable:focus {
  outline: 2px solid var(--blue-medium);
  outline-offset: 2px;
}

.focusable:focus:not(:focus-visible) {
  outline: none; /* Remove outline quando não é navegação por teclado */
}
```

### Screen Readers
- **Labels Adequados**: Todos os campos têm labels descritivos
- **ARIA Labels**: Para elementos complexos
- **Live Regions**: Para mensagens de erro e feedback
- **Role Attributes**: Para regiões específicas

```jsx
<TextField
  label="Processo em Andamento"
  aria-describedby="processo-help"
  aria-required="false"
/>

<div id="processo-help" className="sr-only">
  Descreva o processo atual do ticket
</div>
```

### Contraste de Cores
- **Texto Principal**: Contraste mínimo 4.5:1
- **Texto Secundário**: Contraste mínimo 4.5:1
- **Estados de Foco**: Contraste mínimo 3:1
- **Estados de Erro**: Vermelho com contraste adequado

```css
:root {
  --text-primary: #1a1a1a;     /* vs background: 18:1 */
  --text-secondary: #666666;   /* vs background: 5.9:1 */
  --error-color: #d32f2f;      /* vs background: 4.5:1 */
  --focus-outline: #1976d2;    /* vs background: 4.5:1 */
}
```

### Tamanho de Toque
- **Botões**: Mínimo 44px x 44px
- **Campos de Input**: Mínimo 44px de altura
- **Espaçamento**: Mínimo 8px entre elementos clicáveis

```css
.button-touch {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

.input-touch {
  min-height: 44px;
  padding: 12px 16px;
}
```

## Performance e UX

### Loading States
```css
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

@media (prefers-reduced-motion: reduce) {
  .loading-overlay {
    animation: none;
  }
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .modal-container {
    border: 2px solid;
  }

  .info-field {
    border: 1px solid;
    padding: 12px;
  }
}
```

## Testes de Acessibilidade

### Ferramentas Automáticas
- **Lighthouse**: Performance, acessibilidade, SEO
- **axe-core**: Testes de acessibilidade automatizados
- **WAVE**: Avaliação visual de acessibilidade

### Testes Manuais
- **Navegação por Teclado**: Tab através de todos os elementos
- **Screen Reader**: Testar com NVDA, JAWS, VoiceOver
- **Zoom**: Testar até 200% de zoom
- **Contraste**: Verificar em diferentes monitores

### Testes de Dispositivos
- **Mobile**: iOS Safari, Chrome Mobile
- **Tablet**: iPad Safari, Chrome Tablet
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Screen Readers**: NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS)

## Considerações de Performance

### Lazy Loading
- Carregar histórico de mensagens sob demanda
- Paginação para tickets com muitas mensagens

### Debounced Updates
- Evitar múltiplas chamadas de API durante digitação
- Debounce de 500ms para campos de texto

### Memory Management
- Limpar event listeners ao desmontar componente
- Evitar memory leaks em subscriptions

## Fallbacks

### JavaScript Disabled
- Modal básico com apenas visualização
- Formulários HTML nativos como fallback

### CSS Grid Support
- Flexbox como fallback para navegadores antigos
- Float-based layout para IE11

```css
@supports not (display: grid) {
  .modal-container {
    display: flex;
    flex-wrap: wrap;
  }

  .info-field {
    flex: 1 1 50%;
  }
}
