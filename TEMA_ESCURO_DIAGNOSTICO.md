# 🔍 DIAGNÓSTICO - Tema Escuro Console GCP
<!-- VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team -->

## 📋 PROBLEMAS IDENTIFICADOS

### 1. **SISTEMA DE TEMA DUPLO**
- **Header**: Usa `.dark` e `velohub-theme` no localStorage
- **IGP**: Usa `data-theme` e `veloinsights-theme` no localStorage
- **Conflito**: Dois sistemas diferentes causam inconsistências

### 2. **CORES HARDCODED**
- **QualidadePage**: Cores hardcoded (`#ffffff`, `#000058`, etc.)
- **AcademyPage**: Cores hardcoded em vários componentes
- **DashboardPage**: Usa variáveis CSS mas não tem suporte completo ao tema escuro
- **BotAnalisesPage**: Cores hardcoded (`white`, `#d32f2f`, etc.)

### 3. **INCOMPATIBILIDADE COM LAYOUT_GUIDELINES.md**
- Cores do tema escuro não seguem exatamente as especificações:
  - Fundo: Deveria ser `#272A30` (conforme guidelines)
  - Containers: Deveriam ser `#323a42` (conforme guidelines)
  - Header: Deveria ser `#006AB9` no tema escuro (conforme guidelines)

### 4. **FALTA DE SUPORTE AO TEMA ESCURO**
- Várias páginas não têm regras CSS para `.dark`
- Componentes Material-UI não adaptam cores automaticamente
- Cards e containers não mudam de cor no tema escuro

## ✅ SOLUÇÕES PROPOSTAS

### 1. **Unificar Sistema de Tema**
- Usar apenas `.dark` no `document.documentElement`
- Unificar localStorage para `velohub-theme`
- Remover sistema `data-theme` duplicado

### 2. **Corrigir Cores Hardcoded**
- Substituir todas as cores hardcoded por variáveis CSS
- Adicionar regras `.dark` para todos os componentes
- Garantir que Material-UI use tema adaptativo

### 3. **Garantir Compatibilidade com Guidelines**
- Usar exatamente as cores especificadas no LAYOUT_GUIDELINES.md
- Aplicar regras de tema escuro em todos os componentes
- Testar todas as páginas no tema escuro

## 📝 CHECKLIST DE CORREÇÃO

- [ ] Unificar sistema de tema no Header
- [ ] Corrigir QualidadePage para usar variáveis CSS
- [ ] Corrigir AcademyPage para usar variáveis CSS
- [ ] Corrigir DashboardPage para suportar tema escuro
- [ ] Corrigir BotAnalisesPage para usar variáveis CSS
- [ ] Adicionar regras `.dark` em todos os CSS
- [ ] Atualizar Material-UI theme para suportar tema escuro
- [ ] Testar todas as páginas no tema escuro

