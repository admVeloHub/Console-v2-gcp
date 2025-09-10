# 🎨 Console de Conteúdo - Frontend

Frontend para o Console de Conteúdo da VeloAcademy.

## 📁 Estrutura

```
frontend/
├── index.html              # Página principal
├── artigos.html            # Formulário de artigos
├── velonews.html           # Formulário de velonews
├── bot-perguntas.html      # Formulário de perguntas do bot
├── css/
│   └── styles.css          # Estilos CSS
├── js/
│   └── app.js              # JavaScript principal
├── console.png             # Logo
├── success.gif             # GIF de sucesso
├── package.json            # Dependências
├── vercel.json            # Configuração do Vercel
└── README.md              # Este arquivo
```

## 🚀 Como Executar

### Desenvolvimento Local
```bash
npm install
npm start
```

### Produção
Deploy automático no Vercel.

## ⚙️ Configuração

### API Backend
O frontend se conecta automaticamente ao backend:
- **Desenvolvimento**: `http://localhost:3002`
- **Produção**: `https://back-console.vercel.app`

### Variáveis de Ambiente
- `API_URL`: URL do backend (configurado automaticamente)

## 🔧 Funcionalidades

- ✅ Interface responsiva
- ✅ Formulários para Artigos, Velonews e Bot Perguntas
- ✅ Feedback visual com animações
- ✅ Tema claro/escuro
- ✅ Validação de formulários
- ✅ Integração com backend via API

## 📡 Páginas

### Dashboard Principal (`index.html`)
- Visão geral do sistema
- Navegação para formulários
- Status de conexão com MongoDB

### Formulários
- **Artigos** (`artigos.html`): Criar e gerenciar artigos
- **Velonews** (`velonews.html`): Publicar notícias e alertas
- **Bot Perguntas** (`bot-perguntas.html`): Configurar perguntas do chatbot

## 🎨 Design

- Interface moderna e intuitiva
- Animações suaves
- Feedback visual para todas as ações
- Responsivo para mobile e desktop

## 🔗 Integração com Backend

O frontend se comunica com o backend através de:
- **API REST**: Endpoints `/api/submit` e `/api/data/:collection`
- **CORS**: Configurado no backend
- **JSON**: Todas as requisições e respostas

## 🚀 Deploy

### Vercel
1. Conecte o repositório ao Vercel
2. Deploy automático
3. URL: `https://front-console.vercel.app`

### Outros
- Pode ser deployado em qualquer servidor estático
- Configure o CORS no backend adequadamente

## 📈 Performance

- Carregamento rápido
- Otimizado para mobile
- Cache de recursos estáticos
- Compressão automática no Vercel
