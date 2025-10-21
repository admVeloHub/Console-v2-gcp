# 🚀 GUIA RÁPIDO - VeloInsights

## Como Usar o Sistema

### 1️⃣ Abrir o Sistema
- Abra o arquivo `index.html` no seu navegador
- Ou dê duplo clique no arquivo

### 2️⃣ Login
**Opção 1 - Login rápido:**
- Clique em "Entrar com e-mail Velotax"

**Opção 2 - Login com credenciais:**
- Digite qualquer e-mail e senha
- Clique em "Entrar"

### 3️⃣ Navegar pelo Sistema

**Dashboard** (Tela principal)
- Ranking dos 10 melhores atendentes
- Indicadores gerais (KPIs)
- Gráfico de performance geral

**55pbx - Telefonia**
- Volume Histórico Geral
- CSAT (Satisfação)
- Volume por Produto URA
- Volume por Hora
- TMA por Produto
- Tempo de Pausa

**Octadesk - Tickets**
- Volume Histórico Geral
- CSAT (Satisfação)
- Volume por Assunto
- Volume por Hora
- Tempo de Resolução
- Tempo de Pausa

**Atendentes**
- Lista completa de atendentes
- Clique em qualquer um para ver detalhes

### 4️⃣ Funcionalidades

**Mudar Período**
- Clique no botão de calendário no header
- Escolha: 7 dias, 15 dias, mês atual, etc.
- Atalho: `Ctrl/Cmd + P`

**Mudar Tema**
- Clique no ícone de lua/sol
- Alterna entre claro e escuro
- Atalho: `Ctrl/Cmd + T`

**Exportar Relatórios**
- Clique no botão flutuante (canto inferior direito)
- Escolha: PDF, Excel ou CSV
- Atalho: `Ctrl/Cmd + E`
- Faz download automático do arquivo

**Buscar Atendentes**
- Na página "Atendentes", use a barra de busca
- Filtre por cargo (Supervisora, Sênior, Pleno, Júnior)
- Atalho: `Ctrl/Cmd + K`

**Ver Detalhes de Atendente**
- Clique em qualquer atendente no ranking ou lista
- Abre uma nova aba com análise completa
- Mostra gráficos de performance individual

**Notificações**
- Sistema mostra notificações para ações importantes
- Aparecem no canto superior direito
- Desaparecem automaticamente após 3 segundos

**Atalhos de Teclado**
- `Ctrl/Cmd + K` - Buscar atendente
- `Ctrl/Cmd + E` - Exportar relatório
- `Ctrl/Cmd + P` - Selecionar período
- `Ctrl/Cmd + T` - Alternar tema
- `ESC` - Fechar modais

**Sair**
- Clique no ícone de logout no header

## 📁 Arquivos do Sistema

```
index.html              - Página principal (ABRA ESTE)
app.js                  - Lógica do sistema
dashboard-charts.js     - Todos os gráficos
PeriodSelector.jsx      - Seletor de período (React)
PeriodSelector.css      - Estilos do seletor
```

## 🎯 Dados Atuais

O sistema está usando **dados de exemplo (mockados)** para demonstração.

### 10 Atendentes Mockados:
1. Ana Silva - Supervisora
2. Carlos Santos - Atendente Sênior
3. Beatriz Lima - Atendente Pleno
4. Daniel Costa - Atendente Júnior
5. Fernanda Alves - Atendente Pleno
6. Gabriel Martins - Atendente Júnior
7. Juliana Rocha - Atendente Sênior
8. Lucas Ferreira - Atendente Pleno
9. Mariana Souza - Atendente Júnior
10. Pedro Oliveira - Atendente Júnior

## 🔌 Próximos Passos

Para conectar com dados reais:

1. **Backend/API**
   - Conecte as funções em `app.js` com suas APIs
   - Endpoints necessários: 55pbx e Octadesk

2. **Autenticação Real**
   - Implemente OAuth ou JWT
   - Conecte com sistema de usuários

3. **Atualização em Tempo Real**
   - Adicione polling ou WebSockets
   - Atualize dados automaticamente

## ⚙️ Tecnologias

- HTML5 + CSS3 + JavaScript
- Chart.js (gráficos)
- BoxIcons (ícones)
- Google Fonts (tipografia)

## 💡 Dicas

- O tema escolhido é salvo automaticamente
- Todos os gráficos se adaptam ao tema
- Layout responsivo (funciona em mobile)
- Clique nos atendentes para ver detalhes

---

**Sistema desenvolvido para Velotax**

