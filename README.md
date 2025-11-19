# 🚀 Console de Conteúdo VeloHub - Frontend
<!-- VERSION: v3.8.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team -->

## 📋 **Descrição**
Aplicação React completa para o Console de Conteúdo VeloHub. Sistema unificado que integra todas as funcionalidades de gestão de conteúdo, incluindo dashboard, artigos, velonews, bot perguntas, serviços e sistema de usuários com autenticação Google OAuth.

## 🎯 **Funcionalidades Principais**

### **🔐 Sistema de Autenticação**
- **Google OAuth 2.0** - Login seguro com Google
- **Sistema de Permissões** - Controle granular de acesso
- **Gerenciamento de Usuários** - CRUD completo via ConfigPage
- **Proteção de Rotas** - Acesso baseado em permissões

### **📊 Dashboard Unificado**
- **Cards Dinâmicos** - Renderização baseada em permissões
- **Navegação Intuitiva** - Interface limpa e organizada
- **Status da API** - Monitoramento em tempo real
- **Tema Escuro/Claro** - Alternância com persistência

### **📝 Módulos de Conteúdo**
- **Artigos** - Criação e gerenciamento com categorias
- **Velonews** - Publicação de notícias e alertas
- **Bot Perguntas** - Configuração de FAQ do chatbot
- **VeloInsights** - Dashboard analítico completo de call center e tickets

### **📊 VeloInsights - Dashboard Analítico**
- **Dashboard Principal** - Métricas gerais de call center e tickets
- **Gráficos Detalhados** - Visualizações avançadas com Chart.js
- **Análise por Agente** - Relatórios individuais de operadores
- **Sistema de Filtros** - Por período, operador, tipo de chamada
- **Exportação** - PDF/Excel para relatórios
- **Integração Google Sheets** - Dados em tempo real
- **Sistema de Permissões** - Controle granular de acesso

### **⚙️ Sistema de Serviços**
- **5 Módulos de Serviços** - Crédito Trabalhador, Crédito Pessoal, Antecipação, Pagamento Antecipado, IRPF
- **3 Status por Serviço** - Verde (On), Amarelo (Revisão), Vermelho (Off)
- **Integração Backend** - API completa para controle de status
- **Interface de Controle** - Console dedicado para administração

### **👥 Gestão de Usuários**
- **Página de Configuração** - Gerenciamento completo de usuários
- **Sistema de Permissões** - Controle granular por módulo
- **Tipos de Tickets** - Configuração de categorias
- **Modal de 2 Etapas** - Interface intuitiva para criação

## 🛠️ **Tecnologias**

### **Frontend**
- **React 18** - Framework principal
- **Material-UI** - Componentes e tema
- **React Router** - Navegação
- **Google OAuth** - Autenticação
- **Axios** - Requisições HTTP
- **Recharts** - Gráficos e visualizações
- **Chart.js** - Gráficos avançados (VeloInsights)
- **React-ChartJS-2** - Integração Chart.js com React
- **DnD Kit** - Drag and drop (VeloInsights)

### **Estilização**
- **CSS Custom Properties** - Variáveis de tema
- **Material-UI Theme** - Sistema de temas
- **Responsive Design** - Mobile-first
- **Animações CSS** - Transições suaves

### **Fontes**
- **Poppins** - Fonte principal
- **Anton** - Fonte secundária

## 🚀 **Instalação e Execução**

### **Pré-requisitos**
- Node.js >= 16.0.0
- npm >= 8.0.0
- Conta Google para OAuth (opcional)

### **Instalação Rápida**
```bash
# Clonar repositório
git clone https://github.com/admVeloHub/front-console.git
cd front-console

# Instalar dependências
npm install

# Configurar ambiente de desenvolvimento (automático)
# Linux/Mac:
./setup-env.sh
# Windows:
setup-env.bat

# Executar em desenvolvimento
npm start
```

### **Configuração Manual**
```bash
# Copiar arquivo de exemplo
cp env.local.example .env

# Editar .env com suas configurações
# O arquivo já vem configurado para usar a API de produção
```

### **Variáveis de Ambiente**

#### **Desenvolvimento Local**
```bash
# API Backend (configurado automaticamente)
REACT_APP_API_URL=https://backend-gcp-278491073220.us-east1.run.app/api

# Modo de desenvolvimento (configurado automaticamente)
REACT_APP_DEV_MODE=true

# Google OAuth (opcional - para desenvolvimento local)
# REACT_APP_GOOGLE_CLIENT_ID=seu_google_client_id_aqui
```

**Nota:** O arquivo `.env` é criado automaticamente com as configurações corretas para desenvolvimento local usando a API de produção.

#### **Produção (Firebase Hosting)**
Para produção, configure as variáveis de ambiente no Firebase Hosting:
- `REACT_APP_API_URL` - URL do backend Cloud Run
- `REACT_APP_GOOGLE_CLIENT_ID` - Client ID do Google OAuth

**Importante:** Variáveis sensíveis (MongoDB URI, JWT Secret, API Keys) são gerenciadas via Secret Manager do GCP no backend Cloud Run.

## 📁 **Estrutura do Projeto**
```
front-console/
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── common/          # Header, Footer, BackButton
│   │   └── Dashboard/       # DashboardCard
│   ├── contexts/            # Contextos React
│   │   └── AuthContext.jsx  # Autenticação e permissões
│   ├── pages/               # Páginas da aplicação
│   │   ├── DashboardPage.jsx    # Dashboard principal
│   │   ├── ArtigosPage.jsx      # Gestão de artigos
│   │   ├── VelonewsPage.jsx     # Gestão de velonews
│   │   ├── BotPerguntasPage.jsx # Gestão de perguntas
│   │   ├── ServicosPage.jsx     # Console de serviços
│   │   ├── ConfigPage.jsx       # Configuração de usuários
│   │   ├── LoginPage.jsx        # Página de login
│   │   └── IGPPage.jsx          # Dashboard IGP
│   ├── services/            # Serviços e APIs
│   │   ├── api.js           # Cliente HTTP principal
│   │   ├── userService.js   # Serviço de usuários
│   │   └── userPingService.js # Sistema de ping
│   ├── styles/              # Estilos e temas
│   │   ├── theme.js         # Tema Material-UI
│   │   └── globals.css      # Estilos globais
│   ├── config/              # Configurações
│   │   └── google.js        # Configuração Google OAuth
│   └── App.jsx              # Componente principal
├── public/                  # Arquivos estáticos
├── package.json            # Dependências e scripts
└── README.md               # Este arquivo
```

## 🎨 **Sistema de Temas**

### **Paleta de Cores VeloHub**
```css
/* Cores Principais */
--white: #F3F7FC        /* Tom de branco */
--gray: #272A30         /* Cinza */
--blue-dark: #000058    /* Azul Escuro */
--blue-medium: #1634FF  /* Azul Médio */
--blue-light: #1694FF   /* Azul Claro */

/* Cores Secundárias */
--blue-opaque: #006AB9  /* Azul Opaco */
--yellow: #FCC200       /* Amarelo */
--green: #15A237        /* Verde */
```

### **Tema Escuro**
- **Fundo:** #272A30 (cinza escuro)
- **Containers:** #323a42 (cinza médio)
- **Header:** #006AB9 (azul opaco)
- **Textos:** #F3F7FC (branco suave)

## 🔧 **Scripts Disponíveis**

```bash
# Desenvolvimento
npm start              # Servidor de desenvolvimento (porta 3000)
npm run dev           # Alias para npm start

# Build
npm run build         # Build de produção
npm run build:analyze # Build com análise de bundle

# Testes
npm test              # Executar testes
npm run test:coverage # Testes com cobertura

# Linting
npm run lint          # ESLint
npm run lint:fix      # ESLint com correção automática
```

## 📊 **Sistema de Permissões**

### **Módulos Disponíveis**
- **artigos** - Acesso ao módulo de artigos
- **velonews** - Acesso ao módulo de velonews
- **botPerguntas** - Acesso ao módulo de perguntas
- **igp** - Acesso ao VeloInsights (dashboard analítico)
- **servicos** - Acesso ao console de serviços
- **config** - Acesso à página de configuração
- **chamadosInternos** - Acesso aos chamados internos
- **funcionarios** - Acesso ao módulo de funcionários
- **qualidade** - Acesso ao módulo de qualidade
- **capacity** - Acesso ao módulo de capacidade

### **Funções Administrativas (VeloInsights)**
- **avaliador** - Visualizar nomes de operadores
- **auditor** - Acesso a gráficos detalhados
- **relatoriosGestao** - Análise individual e exportação

### **Tipos de Tickets**
- **artigos** - Tickets relacionados a artigos
- **velonews** - Tickets relacionados a velonews
- **botPerguntas** - Tickets relacionados ao bot
- **igp** - Tickets relacionados ao IGP
- **servicos** - Tickets relacionados aos serviços
- **geral** - Tickets gerais

## 🔗 **Integração com Backend**

### **Endpoints Principais**
```javascript
// Usuários
GET    /api/users              # Listar usuários
POST   /api/users              # Criar usuário
PUT    /api/users/:email       # Atualizar usuário
DELETE /api/users/:email       # Deletar usuário

// Serviços
GET    /api/module-status      # Status dos módulos
POST   /api/module-status      # Atualizar status
PUT    /api/module-status      # Modificar status

// Ping do Usuário
POST   /api/user-ping          # Ping de usuário logado
```

### **Sistema de Ping**
- **Automático** após login bem-sucedido
- **CollectionId** baseado em permissões
- **Tratamento de erros** sem interromper login
- **Debug** em modo desenvolvimento

## 🚀 **Deploy**

### **Vercel (Recomendado)**
1. Conecte sua conta GitHub ao Vercel
2. Selecione este repositório
3. Configure as variáveis de ambiente
4. Deploy automático a cada push

### **Netlify**
1. Conecte sua conta GitHub ao Netlify
2. Configure build command: `npm run build`
3. Configure publish directory: `build`
4. Configure variáveis de ambiente

### **GitHub Pages**
   ```bash
# Instalar gh-pages
npm install --save-dev gh-pages

# Adicionar script no package.json
"homepage": "https://admVeloHub.github.io/front-console",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# Deploy
npm run deploy
```

## 🧪 **Testes**

### **Executar Testes**
```bash
# Todos os testes
npm test

# Testes com watch
npm test -- --watch

# Testes com cobertura
npm run test:coverage
```

### **Estrutura de Testes**
```
src/
├── __tests__/           # Testes unitários
├── components/          # Testes de componentes
└── services/           # Testes de serviços
```

## 📱 **Responsividade**

### **Breakpoints**
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### **Adaptações Mobile**
- **Cards** em coluna única
- **Navegação** simplificada
- **Botões** maiores para touch
- **Textos** otimizados para leitura

## 🔒 **Segurança**

### **Autenticação**
- **Google OAuth 2.0** - Padrão da indústria
- **JWT Tokens** - Gerenciamento de sessão
- **Proteção de Rotas** - Verificação de permissões

### **Validação**
- **Input Sanitization** - Prevenção de XSS
- **CORS** - Controle de origem
- **Rate Limiting** - Prevenção de spam

## 📈 **Performance**

### **Otimizações**
- **Code Splitting** - Carregamento sob demanda
- **Lazy Loading** - Componentes preguiçosos
- **Memoização** - useMemo e useCallback
- **Bundle Analysis** - Análise de tamanho

### **Métricas**
- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Cumulative Layout Shift** < 0.1

## 🆘 **Troubleshooting**

### **Problemas Comuns**

#### **Erro de CORS**
```bash
# Verificar se o backend está configurado corretamente
# Verificar REACT_APP_API_URL no .env
```

#### **Google OAuth não funciona**
```bash
# Verificar REACT_APP_GOOGLE_CLIENT_ID
# Verificar domínios autorizados no Google Console
```

#### **Permissões não funcionam**
```bash
# Verificar se o usuário está cadastrado na ConfigPage
# Verificar se as permissões estão corretas no banco
```

### **Logs de Debug**
```bash
# Ativar modo debug
REACT_APP_DEV_MODE=true npm start

# Verificar console do navegador
# Verificar Network tab para requisições
```

## 📞 **Suporte**

### **Documentação**
- **API Docs:** [Backend Repository](https://github.com/admVeloHub/back-console)
- **Layout Guidelines:** `LAYOUT_GUIDELINES.md`
- **Deploy Log:** `DEPLOY_LOG.md`

### **Contato**
- **Equipe:** VeloHub Development Team
- **Email:** dev@velohub.com.br
- **Issues:** [GitHub Issues](https://github.com/admVeloHub/front-console/issues)

## 📝 **Changelog**

### **v3.7.1 (2024-12-19)**
- ✅ Sistema completo de serviços com 5 módulos
- ✅ Card Config reposicionado no canto inferior direito
- ✅ Nova ordem dos cards no dashboard
- ✅ Usuário gravina dev com acesso total
- ✅ Sistema de permissões completo para serviços
- ✅ Integração com back-console via servicesAPI
- ✅ Sistema de toast para notificações

### **v3.6.2 (2024-12-19)**
- ✅ Correção do modal 'Gerenciar Permissões'
- ✅ Detecção automática de formato de dados MongoDB
- ✅ Correção de referências de campos

### **v3.6.0 (2024-12-19)**
- ✅ Sistema completo de usuários integrado com MongoDB
- ✅ API de usuários completa (6 endpoints)
- ✅ Sistema de autenticação via MongoDB
- ✅ Gerenciamento de usuários na página Config

## 🎯 **Próximos Passos**
- [ ] Implementar testes automatizados
- [ ] Adicionar PWA capabilities
- [ ] Implementar cache offline
- [ ] Adicionar analytics
- [ ] Otimizar performance
- [ ] Implementar CI/CD

---

**Versão:** 3.7.1  
**Data:** 2024-12-19  
**Autor:** VeloHub Development Team
**Licença:** MIT

*Desenvolvido com ❤️ pela equipe VeloHub*