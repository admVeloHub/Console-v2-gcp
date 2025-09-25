# Deploy Log - Console de Conteúdo VeloHub
<!-- VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team -->

## GitHub Push - 2024-12-19 19:30

### Informações do Deploy
- **Tipo:** GitHub Push
- **Data/Hora:** 2024-12-19 19:30 BRT
- **Versão:** v3.0.0
- **Branch:** master
- **Repositório:** https://github.com/admVeloHub/front-console.git
- **Commit Hash:** 9bd90b9

### Arquivos Modificados
- ✅ **Novos arquivos criados:**
  - `src/App.jsx` - Aplicação React principal
  - `src/index.js` - Entry point React
  - `src/pages/DashboardPage.jsx` - Dashboard principal
  - `src/pages/IGPPage.jsx` - Página IGP
  - `src/pages/ArtigosPage.jsx` - Página Artigos
  - `src/pages/VelonewsPage.jsx` - Página Velonews
  - `src/pages/BotPerguntasPage.jsx` - Página Bot Perguntas
  - `src/components/common/Header.jsx` - Componente Header
  - `src/components/Dashboard/DashboardCard.jsx` - Componente Card
  - `src/services/api.js` - Serviço de API
  - `src/styles/theme.js` - Tema Material-UI
  - `src/styles/globals.css` - Estilos globais
  - `backend/server.js` - Servidor Express
  - `backend/config/database.js` - Configuração MongoDB
  - `backend/models/Artigos.js` - Modelo Artigos
  - `backend/models/Velonews.js` - Modelo Velonews
  - `backend/models/BotPerguntas.js` - Modelo Bot Perguntas
  - `backend/routes/artigos.js` - Rotas Artigos
  - `backend/routes/velonews.js` - Rotas Velonews
  - `backend/routes/botPerguntas.js` - Rotas Bot Perguntas
  - `backend/routes/igp.js` - Rotas IGP
  - `public/index.html` - HTML principal
  - `package.json` - Dependências unificadas
  - `package-lock.json` - Lock de dependências
  - `.cursorrules` - Diretrizes de trabalho
  - `LAYOUT_GUIDELINES.md` - Guia de layout
  - `README.md` - Documentação

- ❌ **Arquivos removidos:**
  - `igp-src/` - Pasta IGP antiga (migrada para React)
  - `js/app.js` - JavaScript antigo
  - `index.html` - HTML antigo
  - `velonews.html` - HTML antigo
  - `public/artigos.html` - HTML antigo
  - `public/velonews.html` - HTML antigo
  - `public/bot-perguntas.html` - HTML antigo
  - `public/backend-monitor.html` - HTML antigo
  - `public/backend-status.html` - HTML antigo
  - `public/css/styles.css` - CSS antigo
  - `public/js/app.js` - JS antigo

### Descrição das Alterações
**Migração completa para React + MongoDB:**
- ✅ Unificação Console + IGP em aplicação React única
- ✅ Backend Express.js com MongoDB real
- ✅ Frontend React com Material-UI e roteamento
- ✅ APIs funcionais para Artigos, Velonews, Bot Perguntas
- ✅ Persistência de dados no MongoDB
- ✅ Tema VeloHub implementado
- ✅ Estrutura moderna e escalável

### Status do Deploy
- **Status:** ✅ Sucesso
- **Arquivos enviados:** 42 objetos (219.39 KiB)
- **Compressão:** Delta compression com 4 threads
- **Tempo:** ~2 segundos

### Observações
- Migração completa de arquitetura HTML/JS para React
- Implementação de banco de dados MongoDB real
- Remoção de arquivos obsoletos e node_modules antigos
- Estrutura de projeto modernizada e unificada

---

## GitHub Push - 2024-12-19 20:10

### Informações do Deploy
- **Tipo:** GitHub Push
- **Data/Hora:** 2024-12-19 20:10 BRT
- **Versão:** v3.1.0
- **Branch:** master
- **Repositório:** https://github.com/admVeloHub/back-console.git
- **Commit Hash:** 86b53b1

### Arquivos Modificados
- ✅ **Arquivos atualizados:**
  - `src/pages/ArtigosPage.jsx` - Sistema de abas e categorias corretas
  - `src/pages/DashboardPage.jsx` - Reordenação dos cards
  - `src/pages/VelonewsPage.jsx` - Adicionado botão voltar
  - `src/pages/BotPerguntasPage.jsx` - Adicionado botão voltar
  - `src/pages/IGPPage.jsx` - Desconectado da API, botão voltar
  - `src/services/api.js` - URL atualizada para produção
  - `.cursorrules` - Atualizado

- ✅ **Novos arquivos criados:**
  - `src/components/common/BackButton.jsx` - Componente botão voltar
  - `backend-deploy/` - Pasta para deploy separado do backend

### Descrição das Alterações
**Melhorias de UX e funcionalidades:**
- ✅ Sistema de abas na página Artigos (Adicionar/Gerenciar)
- ✅ Botão "Voltar" em todas as páginas
- ✅ Categorias de artigos corrigidas conforme especificação
- ✅ Reordenação do dashboard (IGP por último)
- ✅ URL da API atualizada para produção
- ✅ IGP desconectado da API (dados locais)
- ✅ Pasta backend-deploy criada para deploy separado

### Status do Deploy
- **Status:** ✅ Sucesso
- **Arquivos enviados:** 1111 objetos (7.91 MiB)
- **Compressão:** Delta compression com 4 threads
- **Tempo:** ~5 segundos
- **Tipo:** Force push (históricos não relacionados)

### Observações
- Push forçado devido a conflitos de histórico não relacionados
- Todas as funcionalidades implementadas conforme solicitado
- Frontend pronto para deploy automático no Vercel

---

## GitHub Push - 2024-12-19 21:45

### Informações do Deploy
- **Tipo:** GitHub Push
- **Data/Hora:** 2024-12-19 21:45 BRT
- **Versão:** v3.1.6
- **Branch:** master
- **Repositório:** https://github.com/admVeloHub/front-console.git
- **Commit Hash:** 98f795e

### Arquivos Modificados
- ✅ **Arquivos atualizados:**
  - `src/pages/ArtigosPage.jsx` - Correção definitiva da perda de foco
  - `src/styles/globals.css` - Otimização de transições CSS

### Descrição das Alterações
**Correção crítica da perda de foco:**
- ✅ Removido TabPanel customizado que causava re-renderizações
- ✅ Implementada renderização condicional direta
- ✅ Otimizadas transições CSS globais
- ✅ Desabilitados efeitos hover nos Cards do formulário
- ✅ Estabilizadas referências de funções com useCallback
- ✅ Problema de perda de foco no campo título RESOLVIDO

### Status do Deploy
- **Status:** ✅ Sucesso
- **Arquivos enviados:** 17 objetos (3.44 KiB)
- **Compressão:** Delta compression com 4 threads
- **Tempo:** ~2 segundos

### Observações
- Correção definitiva do problema de perda de foco
- Múltiplas tentativas de otimização aplicadas
- Solução final: renderização condicional simples
- Campo de título agora mantém foco durante digitação

---

## GitHub Push - 2024-12-19 22:15

### Informações do Deploy
- **Tipo:** GitHub Push
- **Data/Hora:** 2024-12-19 22:15 BRT
- **Versão:** v3.3.5
- **Branch:** master
- **Repositório:** https://github.com/admVeloHub/front-console.git
- **Commit Hash:** 5e754f7

### Arquivos Modificados
- ✅ **Arquivos atualizados:**
  - `src/pages/DashboardPage.jsx` - Sistema de filtro de cards baseado em permissões
  - `src/components/common/Header.jsx` - Avatar do usuário com fallback e contorno correto
  - `src/contexts/AuthContext.jsx` - Funções de verificação de permissões
  - `src/pages/LoginPage.jsx` - Integração Google SSO com captura de foto
  - `src/App.jsx` - Proteção de rotas com ProtectedRoute
  - `src/components/common/Footer.jsx` - Status da API em tempo real
  - `src/components/Dashboard/DashboardCard.jsx` - Ajustes de layout e hover
  - `src/pages/ArtigosPage.jsx` - Padding para footer fixo
  - `src/pages/BotPerguntasPage.jsx` - Padding para footer fixo
  - `src/pages/IGPPage.jsx` - Padding para footer fixo
  - `src/pages/VelonewsPage.jsx` - Padding para footer fixo
  - `package.json` - Dependência @react-oauth/google
  - `package-lock.json` - Lock atualizado
  - `env.example` - Configuração Google OAuth
  - `LAYOUT_GUIDELINES.md` - Especificações do sistema de usuário
  - `.cursorrules` - Diretrizes atualizadas

- ✅ **Novos arquivos criados:**
  - `src/config/google.js` - Configuração Google OAuth
  - `src/pages/ChamadosInternosPage.jsx` - Sistema de tickets internos
  - `src/pages/ConfigPage.jsx` - Gerenciamento de usuários e permissões
  - `src/pages/LoginPage.jsx` - Página de login com Google SSO
  - `GOOGLE_OAUTH_SETUP.md` - Documentação OAuth
  - `GOOGLE_CONSOLE_SETUP.md` - Configuração Google Console

### Descrição das Alterações
**Sistema completo de autenticação e permissões:**
- ✅ Sistema de filtro de cards no dashboard baseado em permissões
- ✅ Cards sem permissão não são mais visíveis na tela inicial
- ✅ Renderização condicional dos grids com layout adaptativo
- ✅ Mensagem de fallback para usuários sem permissões
- ✅ Integração Google SSO com captura de foto do usuário
- ✅ Botão de usuário logado com avatar, nome e logout
- ✅ Proteção de rotas com ProtectedRoute
- ✅ Sistema de tickets internos com status coloridos
- ✅ Página de configuração para gerenciar usuários e permissões
- ✅ Footer com status da API em tempo real
- ✅ Sistema de permissões granular para cards e tipos de tickets

### Status do Deploy
- **Status:** ✅ Sucesso
- **Arquivos enviados:** 40 objetos (28.64 KiB)
- **Compressão:** Delta compression com 4 threads
- **Tempo:** ~3 segundos

### Observações
- Sistema de permissões implementado completamente
- Interface adaptativa baseada nas permissões do usuário
- Google SSO funcional com captura de dados do usuário
- Sistema de tickets com categorização e status visuais
- Gerenciamento completo de usuários e permissões

---
**Próximo deploy:** Aguardando próximas alterações
