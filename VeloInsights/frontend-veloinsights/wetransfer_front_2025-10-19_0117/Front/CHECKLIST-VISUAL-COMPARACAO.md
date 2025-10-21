# ✅ CHECKLIST VISUAL - COMPARAÇÃO DETALHADA

## 📸 COMO USAR ESTE CHECKLIST

1. **Abra lado a lado:**
   - `REFERENCIA-LAYOUT-COMPLETO.html` (navegador 1)
   - Sistema real (navegador 2)

2. **Vá marcando cada item** conforme verifica

3. **Se algo estiver ❌ diferente:**
   - Consulte `ESPECIFICACOES-VISUAIS.md`
   - Ajuste o código
   - Teste novamente

---

## 🎨 HEADER (Topo da Página)

### **Logo "Velodados"**
- [ ] Fonte: Anton, sans-serif
- [ ] Tamanho: 32px
- [ ] Cor: Azul (#1634FF em claro, #4FC3F7 em escuro)
- [ ] Posição: Canto superior esquerdo

### **Tabs de Navegação (Dashboard, Gráficos, Operadores)**
- [ ] 3 botões em formato de pílula (border-radius: 50px)
- [ ] Border de 2px azul (#1694FF)
- [ ] Padding: 12px 24px
- [ ] Font-size: 14px
- [ ] Font-weight: 500
- [ ] Tab ativa: fundo com gradiente azul, texto branco
- [ ] Tab inativa: fundo cinza claro, texto azul
- [ ] Hover: fundo azul, texto branco
- [ ] Gap entre tabs: 10px

### **Seletor de Período**
- [ ] Card arredondado (border-radius: 12px)
- [ ] Padding: 15px 20px
- [ ] Borda sutil (1px)
- [ ] Sombra leve
- [ ] Texto principal: "Mês atual" (16px, bold)
- [ ] Texto secundário: data + registros (12px, cinza)
- [ ] Hover: borda fica azul

### **Botão de Tema (Lua/Sol)**
- [ ] Círculo perfeito: 50px × 50px
- [ ] Border de 2px azul
- [ ] Ícone: 22px
- [ ] Cor do ícone: azul
- [ ] Hover: rotação 360° + escala 1.1 + fundo azul + ícone branco
- [ ] Transição suave (0.4s cubic-bezier)

### **Botão de Logout**
- [ ] Mesmo estilo do botão de tema
- [ ] Ícone de logout (bx-log-out)

### **Layout do Header**
- [ ] Fundo branco (claro) ou #1e1e1e (escuro)
- [ ] Border-radius: 20px
- [ ] Padding: 20px 30px
- [ ] Margin-bottom: 30px
- [ ] Sombra: 0 4px 20px
- [ ] Flexbox: space-between
- [ ] Borda sutil de 1px

---

## 📊 DASHBOARD (View Principal)

### **Card de Ranking**
- [ ] Título "Ranking de Operadores" (24px, Anton, azul)
- [ ] Fundo branco (claro) ou #1e1e1e (escuro)
- [ ] Border-radius: 20px
- [ ] Padding: 30px
- [ ] Sombra: 0 8px 32px

### **Tabela de Ranking**
- [ ] Header com gradiente azul
- [ ] Texto do header: branco, uppercase, bold
- [ ] Padding do header: 20px
- [ ] Font-size: 14px

### **Linhas do Ranking**
- [ ] Padding: 15px 20px
- [ ] Border-bottom sutil entre linhas
- [ ] Hover: fundo azul claro + deslocamento 5px à direita
- [ ] Transição suave

### **Círculos de Posição**
- [ ] Tamanho: 40px × 40px
- [ ] Border-radius: 50%
- [ ] Margin-right: 15px
- [ ] Font-size: 16px, bold
- [ ] Cor do texto: #272A30 (escuro)
- [ ] 1º lugar: fundo dourado (#FFD700) 🥇
- [ ] 2º lugar: fundo prata (#C0C0C0) 🥈
- [ ] 3º lugar: fundo bronze (#CD7F32) 🥉
- [ ] Outros: fundo cinza claro + borda 2px

### **Nomes de Operadores**
- [ ] Font-size: 14px
- [ ] Font-weight: 600
- [ ] Cor: texto principal
- [ ] Cursor: pointer
- [ ] Hover: cor muda para azul

### **Gráfico de Barras Horizontais**
- [ ] Container: mesma altura da tabela
- [ ] Fundo cinza claro
- [ ] Border-radius: 15px
- [ ] Padding: 20px
- [ ] Título centralizado
- [ ] Barras azuis com border-radius: 8px
- [ ] Eixo Y: sem grid
- [ ] Eixo X: de 0 a 10

### **Card de Indicadores Gerais**
- [ ] Título "Indicadores Gerais"
- [ ] Grid responsivo (auto-fit, minmax(150px, 1fr))
- [ ] Gap: 20px

### **Card Individual de Indicador**
- [ ] Fundo cinza claro (claro) ou #2a2a2a (escuro)
- [ ] Border-radius: 16px
- [ ] Padding: 20px
- [ ] Borda sutil 1px
- [ ] Centralizado (text-align: center)
- [ ] Hover: elevação (translateY -5px) + sombra maior + borda azul

### **Valor do Indicador**
- [ ] Font-size: 28px
- [ ] Font-weight: 700
- [ ] Cor: azul
- [ ] Margin-bottom: 8px

### **Label do Indicador**
- [ ] Font-size: 11px
- [ ] Font-weight: 500
- [ ] Cor: cinza
- [ ] Uppercase
- [ ] Letter-spacing: 0.5px

---

## 📈 PÁGINA DE GRÁFICOS

### **Header da Página**
- [ ] Ícone grande (40px) com gradiente azul
- [ ] Título "Gráficos Detalhados" (28px, bold)
- [ ] Subtítulo "Análise visual completa..." (15px, cinza)
- [ ] Centralizado
- [ ] Margin-bottom: 30px

### **Sub-navegação (Tabs Secundárias)**
- [ ] Centralizada
- [ ] 4 botões com ícones
- [ ] Border-radius: 10px
- [ ] Padding: 10px 20px
- [ ] Gap: 15px
- [ ] Flexbox com wrap
- [ ] Tab ativa: gradiente azul + texto branco
- [ ] Tab inativa: fundo branco + texto cinza + borda 1px
- [ ] Hover: borda azul + texto azul + fundo azul claro

### **Grid de Gráficos**
- [ ] Grid responsivo (auto-fit, minmax(350px, 1fr))
- [ ] Gap: 30px
- [ ] 6 cards de gráficos

### **Card de Gráfico**
- [ ] Fundo branco (claro) ou #1e1e1e (escuro)
- [ ] Border-radius: 15px
- [ ] Padding: 25px
- [ ] Borda sutil 1px

### **Header do Card**
- [ ] Ícone + título (18px, bold, com ícone azul)
- [ ] Subtítulo descritivo (13px, cinza)
- [ ] Margin-bottom: 20px

### **Container do Gráfico**
- [ ] Altura: 280px
- [ ] Position: relative

### **Tipos de Gráficos**
- [ ] Chamadas por Dia: linha azul com fill
- [ ] Notas por Operador: barras horizontais (2 datasets)
- [ ] Duração Média: barras horizontais
- [ ] Chamadas por Hora: barras verticais
- [ ] Ranking de Performance: barras verticais
- [ ] Tendência Semanal: múltiplas linhas + eixo Y duplo

---

## 👤 PÁGINA DE OPERADORES

### **Header da Página**
- [ ] Ícone de usuário (40px) com gradiente
- [ ] Título "Análise de Operador" (28px, bold)
- [ ] Subtítulo "Selecione um operador..." (15px, cinza)
- [ ] Centralizado

### **Card Seletor**
- [ ] Centralizado na página
- [ ] Max-width: 430px
- [ ] Min-width: 330px
- [ ] Margin: 32px auto
- [ ] Border-radius: 16px
- [ ] Padding: 25px
- [ ] Sombra suave

### **Título do Seletor**
- [ ] Font-size: 1.12rem
- [ ] Ícone de busca azul
- [ ] Margin-bottom: 6px

### **Botão de Seleção**
- [ ] Width: 100%
- [ ] Height: 46px
- [ ] Border-radius: 7px
- [ ] Fundo cinza claro
- [ ] Borda 1px sutil
- [ ] Flexbox: space-between
- [ ] Padding: 0 18px
- [ ] Ícone de busca + texto + chevron

### **Dropdown**
- [ ] Display: none (inicialmente)
- [ ] Width: 100%
- [ ] Margin-top: 7px
- [ ] Border-radius: 8px
- [ ] Sombra: 0 4px 16px

### **Input de Busca**
- [ ] Fundo cinza claro
- [ ] Padding: 7px 10px 5px
- [ ] Border-bottom: 1px
- [ ] Ícone de busca + input transparente

### **Lista de Operadores**
- [ ] Max-height: 160px
- [ ] Overflow-y: auto
- [ ] Scroll suave

### **Item da Lista**
- [ ] Display: flex
- [ ] Padding: 12px 15px
- [ ] Border-bottom: 1px
- [ ] Avatar (32px) + nome + meta info
- [ ] Hover: fundo azul claro
- [ ] Cursor: pointer

### **Avatar do Operador**
- [ ] Font-size: 32px
- [ ] Cor: azul
- [ ] Margin-right: 12px

### **Nome na Lista**
- [ ] Font-size: 14px
- [ ] Font-weight: 600

### **Meta Info**
- [ ] Font-size: 12px
- [ ] Cor: cinza
- [ ] "Posição #X • Score Y"

---

## 🔍 VIEW DETALHADA DO OPERADOR

### **Botão de Voltar**
- [ ] Padding: 10px 20px
- [ ] Border-radius: 50px
- [ ] Border de 2px azul
- [ ] Ícone de seta + texto
- [ ] Margin-bottom: 20px
- [ ] Hover: fundo azul + texto branco

### **Header do Operador**
- [ ] Centralizado
- [ ] Padding: 30px
- [ ] Fundo branco/escuro
- [ ] Border-radius: 20px
- [ ] Margin-bottom: 30px

### **Avatar Grande**
- [ ] Font-size: 60px
- [ ] Cor: azul
- [ ] Margin-bottom: 15px

### **Nome do Operador**
- [ ] Font-size: 24px
- [ ] Font-weight: 600
- [ ] Margin-bottom: 10px

### **Badge de Posição**
- [ ] Display: inline-block
- [ ] Padding: 5px 15px
- [ ] Border-radius: 20px
- [ ] Font-size: 13px
- [ ] Font-weight: 600
- [ ] Cor: branco
- [ ] Fundo: gradiente azul
- [ ] Texto: "Posição #X"

### **Cards de Métricas**
- [ ] Grid responsivo (auto-fit, minmax(200px, 1fr))
- [ ] Gap: 20px
- [ ] 5 cards

### **Card de Métrica**
- [ ] Fundo branco/escuro
- [ ] Border-radius: 15px
- [ ] Padding: 20px
- [ ] Border: 1px
- [ ] Display: flex
- [ ] Gap: 15px
- [ ] Hover: elevação + sombra

### **Ícone da Métrica**
- [ ] Width: 50px
- [ ] Height: 50px
- [ ] Border-radius: 12px
- [ ] Font-size: 24px
- [ ] Cor: branca
- [ ] Fundos com gradientes diferentes:
  - Score: azul (#1634FF → #1694FF)
  - Chamadas: verde (#28a745 → #218838)
  - Duração: amarelo (#ffc107 → #ff9800)
  - Atendimento: ciano (#17a2b8 → #117a8b)
  - Solução: roxo (#6f42c1 → #5a32a3)

### **Label da Métrica**
- [ ] Font-size: 12px
- [ ] Cor: cinza
- [ ] Margin-bottom: 5px

### **Valor da Métrica**
- [ ] Font-size: 24px
- [ ] Font-weight: 700
- [ ] Cor: texto principal

### **Card do Gráfico de Performance**
- [ ] Fundo branco/escuro
- [ ] Border-radius: 15px
- [ ] Padding: 25px
- [ ] Border: 1px

### **Gráfico de Linha**
- [ ] Altura: 300px
- [ ] 2 datasets (Score + Chamadas)
- [ ] Linhas com fill e tension: 0.4
- [ ] Legend no topo
- [ ] Cores azul e verde

---

## 🎯 MODAIS

### **Modal de Período**

**Overlay:**
- [ ] Position: fixed, full screen
- [ ] Background: rgba(10, 10, 10, 0.6)
- [ ] Backdrop-filter: blur(5px)
- [ ] Z-index: 1000
- [ ] Opacity: 0 (inativo) → 1 (ativo)

**Container:**
- [ ] Max-width: 900px
- [ ] Width: 90%
- [ ] Border-radius: 20px
- [ ] Sombra: 0 10px 40px
- [ ] Transform: scale(0.95) → scale(1)

**Header:**
- [ ] Padding: 20px 30px
- [ ] Border-bottom: 1px
- [ ] Título com ícone (18px, bold)
- [ ] Botão X (28px) com rotação no hover

**Grid de Opções:**
- [ ] Grid responsivo (auto-fit, minmax(250px, 1fr))
- [ ] Gap: 20px
- [ ] 6 opções pré-definidas

**Opção de Período:**
- [ ] Border: 2px (normal) ou azul (selected)
- [ ] Border-radius: 15px
- [ ] Padding: 20px
- [ ] Display: flex
- [ ] Gap: 15px
- [ ] Hover: border azul + elevação + sombra

**Ícone da Opção:**
- [ ] Font-size: 28px
- [ ] Cor: azul
- [ ] Fundo: cinza claro
- [ ] Padding: 8px
- [ ] Border-radius: 10px

**Texto da Opção:**
- [ ] Título (15px, bold)
- [ ] Subtítulo (12px, cinza)

**Contador de Registros:**
- [ ] Font-size: 18px
- [ ] Font-weight: 700
- [ ] Cor: azul
- [ ] Alinhado à direita
- [ ] Label "registros" (10px, cinza, uppercase)

**Seção Personalizada:**
- [ ] Background: cinza claro
- [ ] Border-radius: 15px
- [ ] Padding: 25px
- [ ] Margin-top: 30px
- [ ] Border-left: 4px azul

**Inputs de Data:**
- [ ] Grid: 2 colunas
- [ ] Gap: 20px
- [ ] Width: 100%
- [ ] Padding: 12px 15px
- [ ] Border-radius: 10px
- [ ] Border: 1px

**Footer:**
- [ ] Padding: 20px 30px
- [ ] Border-top: 1px
- [ ] Flexbox: flex-end
- [ ] Gap: 15px
- [ ] 2 botões (Cancelar + Aplicar)

---

### **Modal de Exportação**

**Header Especial:**
- [ ] Padding: 25px 30px
- [ ] Fundo: gradiente azul animado
- [ ] Animation: gradient-animation 10s infinite
- [ ] Background-size: 200% 200%
- [ ] Cor do texto: branco
- [ ] Botão X branco com opacity 0.8

**Grid de Opções:**
- [ ] Grid responsivo (auto-fit, minmax(260px, 1fr))
- [ ] Gap: 25px
- [ ] Padding: 30px 0
- [ ] 3 opções (Excel, PDF, CSV)

**Card de Opção:**
- [ ] Fundo: cinza claro
- [ ] Border: 1px
- [ ] Border-radius: 15px
- [ ] Padding: 25px
- [ ] Text-align: center
- [ ] Hover: elevação + borda azul (via ::before)

**Ícone de Exportação:**
- [ ] Font-size: 48px
- [ ] Margin-bottom: 15px
- [ ] Cores específicas:
  - Excel: verde (#28a745)
  - PDF: vermelho (#dc3545)
  - CSV: amarelo (#ffc107)

**Título da Opção:**
- [ ] Font-size: médio
- [ ] Font-weight: 600

**Descrição:**
- [ ] Font-size: pequeno
- [ ] Cor: cinza
- [ ] Margin: 10px 0

**Botão de Exportar:**
- [ ] Width: 100%
- [ ] Padding: 14px
- [ ] Border-radius: 10px
- [ ] Fundo: gradiente azul
- [ ] Cor: branco
- [ ] Font-weight: 600
- [ ] Ícone + texto
- [ ] Hover: elevação + sombra

**Info Box:**
- [ ] Fundo: cinza claro
- [ ] Border-radius: 15px
- [ ] Padding: 25px
- [ ] Border-left: 4px azul
- [ ] Lista com bullets
- [ ] Negrito nos labels

---

### **Modal de Detalhes do Operador**

**Max-width:**
- [ ] 700px (menor que outros modais)

**Header Interno:**
- [ ] Centralizado
- [ ] Border-bottom: 1px
- [ ] Padding-bottom: 20px
- [ ] Margin-bottom: 25px

**Nome:**
- [ ] Font-size: 24px
- [ ] Font-weight: 600
- [ ] Margin-bottom: 8px

**Badge:**
- [ ] Igual ao badge da view detalhada

**Grid de Métricas:**
- [ ] Grid responsivo (auto-fit, minmax(200px, 1fr))
- [ ] Gap: 20px
- [ ] 5 cards

**Card de Métrica:**
- [ ] Fundo: cinza claro
- [ ] Padding: 20px
- [ ] Border-radius: 15px
- [ ] Border: 1px
- [ ] Centralizado

**Label:**
- [ ] Font-size: 13px
- [ ] Font-weight: 500
- [ ] Cor: cinza
- [ ] Uppercase
- [ ] Margin-bottom: 8px

**Valor:**
- [ ] Font-size: 26px
- [ ] Font-weight: 700
- [ ] Cor: azul

---

## 🔘 BOTÃO FLUTUANTE (FAB)

- [ ] Position: fixed
- [ ] Bottom: 30px
- [ ] Right: 30px
- [ ] Width: 60px
- [ ] Height: 60px
- [ ] Border-radius: 50%
- [ ] Fundo: gradiente azul
- [ ] Border: none
- [ ] Cor: branco
- [ ] Font-size: 28px
- [ ] Sombra: 0 4px 20px rgba(0,0,0,0.3)
- [ ] Z-index: 999
- [ ] Hover: scale 1.1 + sombra maior

---

## 🌓 TEMA ESCURO

### **Verificações Essenciais**

**Backgrounds:**
- [ ] Fundo da página: #121212
- [ ] Cards: #1e1e1e
- [ ] Elementos internos: #2a2a2a

**Texto:**
- [ ] Texto principal: #FFFFFF
- [ ] Texto secundário: rgba(255,255,255,0.7)

**Marca:**
- [ ] Brand primary: #4FC3F7 (azul claro - invertido)
- [ ] Gradiente: mantém azul mas mais claro

**Gráficos:**
- [ ] Barras: #4FC3F7
- [ ] Texto: #FFFFFF
- [ ] Grid: rgba(255,255,255,0.1)

**Bordas:**
- [ ] Cor: rgba(255,255,255,0.1)

**Sombras:**
- [ ] Cor: rgba(0,0,0,0.2)

**Hover:**
- [ ] Background: rgba(22,148,255,0.1)

**Ícone de Tema:**
- [ ] Muda de lua (claro) para sol (escuro)

**Calendar Icon:**
- [ ] Filter invert(1) no escuro

---

## 📱 RESPONSIVIDADE

### **Tablet (1200px e abaixo)**
- [ ] Dashboard grid: 1 coluna
- [ ] Ranking: vertical (tabela em cima, gráfico embaixo)

### **Mobile (768px e abaixo)**
- [ ] Container padding: 15px
- [ ] Header: coluna (não mais row)
- [ ] Nav tabs: wrap
- [ ] Period selector: padding menor
- [ ] Charts: altura 250px
- [ ] Modal body: padding 20px
- [ ] Export grid: 1 coluna
- [ ] Charts grid: 1 coluna

### **Mobile Pequeno (480px e abaixo)**
- [ ] Selector card: max-width 98vw
- [ ] Min-width removido

---

## 🔍 HOVER EFFECTS

### **Elementos que DEVEM ter hover:**
- [ ] Tabs de navegação
- [ ] Botões (tema, logout, cancelar, aplicar)
- [ ] Cards de indicadores
- [ ] Linhas do ranking
- [ ] Nomes de operadores clicáveis
- [ ] Items do dropdown de operadores
- [ ] Opções de período
- [ ] Cards de exportação
- [ ] Botão flutuante (FAB)
- [ ] Sub-nav tabs
- [ ] Botão de voltar (operadores)
- [ ] Cards de métricas do operador

### **Elementos que NÃO devem ter hover:**
- [ ] Textos estáticos
- [ ] Labels
- [ ] Valores de métricas (números)
- [ ] Gráficos (a menos que Chart.js)

---

## ⚡ TRANSIÇÕES

### **Todos os elementos interativos devem ter:**
- [ ] `transition: all 0.3s ease;`

### **Exceções:**
- [ ] Botão de tema: `0.4s cubic-bezier(0.4, 0, 0.2, 1)`
- [ ] Modal overlay: `opacity 0.3s ease`
- [ ] Modal container: `transform 0.3s ease`

---

## 🎬 ANIMAÇÕES

### **Gradient Animation (Modal de Exportação)**
- [ ] Keyframes definidos
- [ ] Background-size: 200% 200%
- [ ] Animation: 10s ease infinite

### **Modal Opening**
- [ ] Overlay: opacity 0 → 1
- [ ] Container: scale(0.95) → scale(1)
- [ ] Simultâneas

### **Button Hover (Tema)**
- [ ] Rotation 360deg
- [ ] Scale 1.1
- [ ] Background change
- [ ] Simultâneos

---

## 🐛 BUGS COMUNS

### **Verifique se NÃO acontece:**
- [ ] Elementos "pulam" ao carregar
- [ ] Scroll horizontal aparece (overflow-x)
- [ ] Modal não centraliza
- [ ] Gráficos não renderizam
- [ ] Tema não persiste ao recarregar
- [ ] Navbar quebra em mobile
- [ ] Cards de indicadores desalinham
- [ ] Dropdown não fecha ao clicar fora
- [ ] Busca não filtra corretamente
- [ ] Cores hard-coded (não usa variáveis)

---

## ✨ POLISH FINAL

### **Detalhes que fazem diferença:**
- [ ] Cursor pointer em TODOS os clicáveis
- [ ] Outline removido (ou customizado) em elementos focados
- [ ] Scroll suave no dropdown
- [ ] Backdrop blur no overlay do modal
- [ ] Body.modal-open bloqueia scroll
- [ ] Sem erros no console
- [ ] Sem warnings no console
- [ ] Performance: 60fps nas animações
- [ ] Loading dos gráficos suave
- [ ] Icons carregam antes do conteúdo

---

## 📊 TESTE DE ACEITAÇÃO

### **O sistema está PRONTO quando:**

✅ **Visual:**
- Você abre lado a lado e NÃO consegue achar diferenças
- Todos os espaçamentos são idênticos
- Todas as cores são idênticas
- Todas as fontes e tamanhos são idênticos
- Todos os border-radius são idênticos
- Todas as sombras são idênticas

✅ **Funcional:**
- Todas as navegações funcionam
- Todos os modais abrem/fecham
- Tema escuro/claro funciona perfeitamente
- Todos os gráficos renderizam
- Busca de operadores funciona
- Seletor de período funciona
- Todas as interações são suaves

✅ **Responsivo:**
- Funciona em 1920px (desktop grande)
- Funciona em 1440px (desktop médio)
- Funciona em 1024px (tablet landscape)
- Funciona em 768px (tablet portrait)
- Funciona em 375px (mobile iPhone)
- Funciona em 320px (mobile pequeno)

✅ **Performance:**
- Carrega em < 3 segundos
- Transições a 60fps
- Sem lags ao trocar de view
- Sem lags ao abrir modais
- Gráficos renderizam rápido

✅ **Qualidade:**
- Sem erros no console
- Sem warnings no console
- Código limpo e comentado
- CSS usa variáveis (não hard-coded)
- HTML semântico

---

## 🎯 NOTA FINAL

Se você marcou ✅ em TODOS os itens acima, **PARABÉNS!** 🎉

O sistema está **PIXEL-PERFECT** com a referência!

Se ainda há ❌, volte às especificações e ajuste.

**Lembre-se: O objetivo é ZERO diferenças visuais e funcionais!**

---

**Boa sorte na implementação! 🚀**

