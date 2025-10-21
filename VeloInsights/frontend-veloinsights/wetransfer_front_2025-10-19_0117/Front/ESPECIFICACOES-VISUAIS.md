# 🎨 ESPECIFICAÇÕES VISUAIS - REFERÊNCIA RÁPIDA

## 📐 MEDIDAS E ESPAÇAMENTOS

### **Container Principal**
- Max-width: `1400px`
- Padding: `20px`
- Margin: `0 auto` (centralizado)

### **Header**
- Border-radius: `20px`
- Padding: `20px 30px`
- Margin-bottom: `30px`
- Gap entre elementos: `15-20px`

### **Cards**
- Border-radius: `20px`
- Padding: `30px`
- Border: `1px solid var(--border-color)`
- Box-shadow: `0 8px 32px var(--shadow-color)`

### **Cards Pequenos (Indicadores)**
- Border-radius: `16px`
- Padding: `20px`
- Gap no grid: `20px`
- Min-width: `150px`

### **Modal Container**
- Max-width: `900px` (padrão) / `700px` (operador) / `1000px` (exportação)
- Width: `90%`
- Border-radius: `20px`

### **Botões**
- Padding: `12px 24px`
- Border-radius: `50px` (pílula completa)
- Border: `2px solid var(--brand-secondary)`
- Font-size: `14px`
- Font-weight: `600`

### **Botões de Tema/Logout**
- Width: `50px`
- Height: `50px`
- Border-radius: `50%` (círculo perfeito)
- Font-size: `22px`

---

## 🎨 CORES PRINCIPAIS

### **Tema Claro**
```css
/* Backgrounds */
--bg-primary: #F3F7FC;        /* Fundo da página */
--bg-secondary: #FFFFFF;       /* Cards e modais */
--bg-tertiary: #F3F7FC;        /* Elementos internos */

/* Texto */
--text-primary: #272A30;       /* Texto principal */
--text-muted: #6c757d;         /* Texto secundário */

/* Marca */
--brand-primary: #1634FF;      /* Azul principal */
--brand-secondary: #1694FF;    /* Azul claro */

/* Bordas e Sombras */
--border-color: rgba(22, 52, 255, 0.1);
--shadow-color: rgba(39, 42, 48, 0.08);

/* Estados */
--hover-bg: rgba(22, 148, 255, 0.05);

/* Feedback */
--success-color: #28a745;
--danger-color: #dc3545;
--warning-color: #ffc107;
```

### **Tema Escuro**
```css
/* Backgrounds */
--bg-primary: #121212;         /* Fundo da página */
--bg-secondary: #1e1e1e;       /* Cards e modais */
--bg-tertiary: #2a2a2a;        /* Elementos internos */

/* Texto */
--text-primary: #FFFFFF;       /* Texto principal */
--text-muted: rgba(255, 255, 255, 0.7);

/* Marca */
--brand-primary: #4FC3F7;      /* Azul claro (invertido) */
--brand-secondary: #1694FF;

/* Feedback */
--success-color: #20c997;
--danger-color: #ff6b6b;
--warning-color: #ffd60a;
```

### **Cores de Ranking**
```css
/* Medalhas */
--rank-gold: #FFD700;          /* 1º lugar */
--rank-silver: #C0C0C0;        /* 2º lugar */
--rank-bronze: #CD7F32;        /* 3º lugar */
```

### **Gradientes**
```css
--gradient-primary: linear-gradient(135deg, #1634FF, #1694FF);
--success-gradient: linear-gradient(135deg, #28a745, #218838);
```

---

## 📝 TIPOGRAFIA

### **Fontes**
```css
/* Corpo do texto */
font-family: 'Poppins', sans-serif;

/* Logo e títulos especiais */
font-family: 'Anton', sans-serif;
```

### **Tamanhos de Fonte**

| Elemento | Tamanho | Peso |
|----------|---------|------|
| Logo | `32px` | `400` |
| Título de Card | `24px` | `400` (Anton) |
| Título de Modal | `18px` | `600` |
| Título de Página | `28px` | `600` |
| Nav Tab | `14px` | `500` |
| Texto de Card | `16px` | `600` |
| Detalhes/Subtítulo | `12-15px` | `500` |
| Label de Indicador | `11px` | `500` |
| Valor de Indicador | `28px` | `700` |
| Nome de Operador | `14px` | `600` |

### **Transformações de Texto**
```css
/* Labels de indicadores */
text-transform: uppercase;
letter-spacing: 0.5px;
```

---

## 🔲 SOMBRAS E ELEVAÇÕES

### **Níveis de Elevação**

**Nível 1 - Repouso:**
```css
box-shadow: 0 2px 8px var(--shadow-color);
```

**Nível 2 - Card Padrão:**
```css
box-shadow: 0 4px 20px var(--shadow-color);
```

**Nível 3 - Card Grande:**
```css
box-shadow: 0 8px 32px var(--shadow-color);
```

**Nível 4 - Hover:**
```css
box-shadow: 0 10px 30px var(--shadow-color);
```

**Nível 5 - Modal:**
```css
box-shadow: 0 10px 40px var(--shadow-color);
```

**Especial - Botão Flutuante (FAB):**
```css
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
/* Hover */
box-shadow: 0 8px 30px var(--shadow-color);
```

---

## 🎭 ANIMAÇÕES E TRANSIÇÕES

### **Transição Padrão**
```css
transition: all 0.3s ease;
```

### **Transição de Tema**
```css
transition: background-color 0.3s ease, color 0.3s ease;
```

### **Transição do Botão de Tema**
```css
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
```

### **Transform no Hover**

**Cards de Indicador:**
```css
transform: translateY(-5px);
```

**Linhas do Ranking:**
```css
transform: translateX(5px);
```

**Modal (abertura):**
```css
/* Inicial */
transform: scale(0.95);
/* Aberto */
transform: scale(1);
```

**Botão de Fechar Modal:**
```css
transform: rotate(90deg);
```

**Botão de Tema (hover):**
```css
transform: scale(1.1) rotate(360deg);
```

### **Animação de Gradiente (Modal de Exportação)**
```css
@keyframes gradient-animation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

background-size: 200% 200%;
animation: gradient-animation 10s ease infinite;
```

---

## 🖼️ ÍCONES

### **BoxIcons**
```html
<link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
```

### **Tamanhos de Ícones**

| Contexto | Tamanho |
|----------|---------|
| Botão de Tema | `22px` |
| FAB | `28px` |
| Modal Title | `24px` |
| Nav Tab | `16px` (inline) |
| Header de Página | `40px` |
| Avatar de Operador | `60px` (detail) / `32px` (lista) |
| Cards de Métrica | `24px` |
| Exportação | `48px` |

### **Ícones Mais Usados**
```html
<!-- Tema -->
<i class='bx bx-moon'></i>
<i class='bx bx-sun'></i>

<!-- Navegação -->
<i class='bx bxs-dashboard'></i>
<i class='bx bxs-bar-chart-alt-2'></i>
<i class='bx bxs-user-account'></i>

<!-- Ações -->
<i class='bx bx-log-out'></i>
<i class='bx bxs-file-export'></i>
<i class='bx bx-search-alt'></i>
<i class='bx bx-arrow-back'></i>

<!-- Período -->
<i class='bx bxs-calendar'></i>
<i class='bx bx-calendar-event'></i>
<i class='bx bx-calendar-star'></i>

<!-- Métricas -->
<i class='bx bx-trending-up'></i>
<i class='bx bx-phone-call'></i>
<i class='bx bx-time-five'></i>
<i class='bx bx-star'></i>
<i class='bx bx-check-circle'></i>

<!-- Operadores -->
<i class='bx bxs-user-circle'></i>
<i class='bx bxs-user-detail'></i>
```

---

## 📊 GRÁFICOS (CHART.JS)

### **Configurações Globais**
```javascript
{
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: var(--chart-text-color),
        usePointStyle: true,
        padding: 15
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: var(--chart-text-color),
        font: { size: 12 }
      },
      grid: {
        color: var(--chart-grid-color)
      }
    },
    y: {
      ticks: {
        color: var(--chart-text-color),
        font: { size: 12 }
      },
      grid: {
        color: var(--chart-grid-color)
      }
    }
  }
}
```

### **Cores dos Gráficos**
```javascript
// Pegar cores das variáveis CSS
const style = getComputedStyle(document.documentElement);
const brandPrimary = style.getPropertyValue('--brand-primary').trim();
const successColor = style.getPropertyValue('--success-color').trim();
```

### **Altura dos Containers**
- Gráficos do dashboard: `300px`
- Gráficos da página de gráficos: `280px`
- Gráfico de performance do operador: `300px`

### **Configurações Específicas**

**Barras Horizontais:**
```javascript
{
  indexAxis: 'y',
  borderRadius: 8,
  borderSkipped: false
}
```

**Linhas:**
```javascript
{
  fill: true,
  tension: 0.4,
  pointRadius: 5,
  pointHoverRadius: 7
}
```

---

## 🎯 ESTADOS INTERATIVOS

### **Hover em Botões**
```css
.nav-tab:hover:not(.active) {
  background-color: var(--brand-secondary);
  color: #FFFFFF;
  border-color: var(--brand-secondary);
}
```

### **Active em Tabs**
```css
.nav-tab.active {
  background: var(--gradient-primary);
  color: #FFFFFF;
  border-color: var(--brand-primary);
}
```

### **Hover em Cards**
```css
.indicator-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px var(--shadow-color);
  border-color: var(--brand-secondary);
}
```

### **Hover em Linhas do Ranking**
```css
.operator-row:hover {
  background-color: var(--hover-bg);
  transform: translateX(5px);
}
```

### **Hover em Nomes Clicáveis**
```css
.operator-name.clickable:hover {
  color: var(--brand-secondary);
}
```

---

## 📱 BREAKPOINTS DE RESPONSIVIDADE

### **Tablet (1200px e abaixo)**
```css
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .ranking-section {
    flex-direction: column;
  }
}
```

### **Mobile (768px e abaixo)**
```css
@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
  .header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  .nav-tabs {
    flex-wrap: wrap;
    justify-content: center;
  }
  .chart-container {
    height: 250px;
  }
  .modal-body {
    padding: 20px;
  }
  .charts-grid,
  .export-options-grid {
    grid-template-columns: 1fr;
  }
}
```

### **Mobile Pequeno (480px e abaixo)**
```css
@media (max-width: 480px) {
  .selector-card {
    min-width: unset;
    max-width: 98vw !important;
  }
}
```

---

## 🔘 ELEMENTOS ESPECIAIS

### **Círculos de Ranking**
```css
.rank-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  margin-right: 15px;
  color: #272A30;
}
```

### **Badge de Posição do Operador**
```css
.operator-rank-badge {
  display: inline-block;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #FFFFFF;
  background: var(--gradient-primary);
}
```

### **Botão Flutuante (FAB)**
```css
.fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: var(--gradient-primary);
  border-radius: 50%;
  border: none;
  color: #FFFFFF;
  font-size: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 999;
}
```

### **Overlay de Modal**
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(10, 10, 10, 0.6);
  backdrop-filter: blur(5px);
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.modal-overlay.active {
  opacity: 1;
  pointer-events: auto;
}
```

### **Input de Data (Calendar Icon)**
```css
input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(var(--calendar-icon-filter, 0));
}

[data-theme="dark"] {
  --calendar-icon-filter: 1;
}
```

---

## ✨ DETALHES FINAIS

### **Cursor Pointer**
Adicionar em todos os elementos clicáveis:
- Botões
- Tabs de navegação
- Nomes de operadores clicáveis
- Items de dropdown
- Cards de período
- Opções de exportação
- Botão de fechar modal

### **User Select**
Desabilitar seleção de texto em elementos UI:
```css
-webkit-user-select: none;
-moz-user-select: none;
user-select: none;
```

### **Scroll Suave**
```css
html {
  scroll-behavior: smooth;
}
```

### **Scrollbar Customizada (opcional)**
```css
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--brand-secondary);
}
```

---

## 📋 CHECKLIST DE VERIFICAÇÃO VISUAL

Antes de considerar uma seção completa, verifique:

- [ ] Cores correspondem exatamente (use color picker)
- [ ] Espaçamentos são iguais (use DevTools)
- [ ] Border-radius está correto
- [ ] Sombras têm a profundidade certa
- [ ] Fontes e tamanhos estão corretos
- [ ] Hover effects funcionam
- [ ] Transições são suaves (0.3s)
- [ ] Ícones têm o tamanho certo
- [ ] Layout responsivo funciona
- [ ] Tema escuro funciona perfeitamente
- [ ] Gráficos têm as cores corretas
- [ ] Modais abrem/fecham suavemente
- [ ] Nenhum elemento "pula" ou muda tamanho inesperadamente

---

## 🎯 TESTE FINAL

Abra **lado a lado**:
1. `REFERENCIA-LAYOUT-COMPLETO.html` no navegador
2. Sistema real no navegador

Compare **pixel por pixel**:
- Header
- Dashboard
- Cards
- Gráficos
- Modais
- Página de operadores
- Responsividade
- Tema escuro

Se algo estiver diferente, consulte esta especificação! ✅

---

**Use este documento como referência rápida durante a implementação! 📏**

