# 🚀 Console de Conteúdo VeloHub v3.0.0

## 📋 Descrição
Aplicação React unificada que integra todas as funcionalidades do Console de Conteúdo VeloHub, incluindo IGP Dashboard, Artigos, Velonews e Bot Perguntas.

## 🎯 Funcionalidades
- **Dashboard Principal**: Navegação unificada entre todas as funcionalidades
- **IGP Dashboard**: Métricas e relatórios com gráficos interativos
- **Artigos**: Criação e gerenciamento de artigos
- **Velonews**: Publicação de notícias e alertas críticos
- **Bot Perguntas**: Configuração de perguntas e respostas do chatbot
- **Tema Escuro/Claro**: Alternância de temas com persistência
- **Design Responsivo**: Interface adaptável para todos os dispositivos

## 🛠️ Tecnologias
- **Frontend**: React 18, Material-UI, Recharts
- **Backend**: Express.js, Node.js
- **Estilização**: CSS Custom Properties, Material-UI Theme
- **Fontes**: Poppins (principal), Anton (secundária)

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js >= 16.0.0
- npm >= 8.0.0

### Instalação
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Ou executar separadamente:
npm start          # Frontend React (porta 3000)
npm run server     # Backend Express (porta 3001)
```

### Build para Produção
```bash
# Build do React
npm run build

# Executar em produção
npm run build:production
```

## 📁 Estrutura do Projeto
```
console-conteudo-unified/
├── src/                    # Código fonte React
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── services/          # Serviços e APIs
│   ├── styles/            # Estilos e temas
│   └── utils/             # Utilitários
├── backend/               # Servidor Express.js
│   ├── routes/            # Rotas da API
│   └── server.js          # Servidor principal
├── public/                # Arquivos estáticos
└── package.json           # Dependências e scripts
```

## 🎨 Tema VeloHub
- **Cores Principais**: Azul (#1634FF), Azul Escuro (#000058), Azul Claro (#1694FF)
- **Cores Secundárias**: Azul Opaco (#006AB9), Amarelo (#FCC200), Verde (#15A237)
- **Tipografia**: Poppins (principal), Anton (secundária)
- **Tema Escuro**: Implementado com variáveis CSS

## 📊 API Endpoints
- `GET /api/health` - Status da API
- `GET /api/artigos` - Listar artigos
- `POST /api/artigos` - Criar artigo
- `GET /api/velonews` - Listar velonews
- `POST /api/velonews` - Criar velonews
- `GET /api/bot-perguntas` - Listar perguntas do bot
- `POST /api/bot-perguntas` - Criar pergunta do bot
- `GET /api/igp/metrics` - Obter métricas IGP
- `GET /api/igp/reports` - Obter relatórios IGP

## 🔧 Configuração
1. Copiar `.env.example` para `.env`
2. Configurar variáveis de ambiente
3. Executar `npm install`
4. Executar `npm run dev`

## 📝 Versão
- **Versão Atual**: 3.0.0
- **Data**: 2024-12-19
- **Autor**: VeloHub Development Team

## 🎯 Próximos Passos
- [ ] Integração com MongoDB real
- [ ] Sistema de autenticação
- [ ] Testes automatizados
- [ ] Deploy em produção
- [ ] Documentação da API

---
*Desenvolvido com ❤️ pela equipe VeloHub*
