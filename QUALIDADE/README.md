# Módulo de Qualidade - Velotax
<!-- VERSION: v1.1.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team -->

Um sistema completo para gerenciamento de funcionários e avaliação de qualidade de atendimentos, desenvolvido com React, TypeScript e Tailwind CSS. Integrado ao Console de Conteúdo Velotax.

## 🚀 Funcionalidades

### ✅ Cadastro de Funcionários
- Nome completo
- Data de aniversário
- Empresa
- Data de contratação
- Histórico de criação e atualização

### 🔐 Gerenciamento de Acessos
- Cadastro de acessos por funcionário
- Sistema, usuário, senha e observações
- Data do acesso
- Visualização segura de senhas (ocultas por padrão)

### 📊 Exportação de Relatórios
- Exportação para Excel (.xlsx)
- Exportação para PDF
- Relatórios completos com todos os dados

### 🎯 Módulo de Qualidade
- Avaliação de ligações por critérios específicos
- Sistema de pontuação automática
- Upload de arquivos de áudio
- Relatórios de performance por agente
- Relatórios de gestão com rankings

### 🤖 Agente GPT (IA)
- Análise automática de ligações com OpenAI GPT
- Avaliação inteligente baseada em critérios da Velotax
- Moderação humana para validação
- Sistema de fallback quando API não está disponível
- Configuração segura de chaves de API

### 🎨 Interface Moderna
- Design responsivo
- Cores personalizadas da Velotax (#000058)
- Interface intuitiva e fácil de usar
- Notificações em tempo real

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Vite** - Build tool
- **React Hook Form** - Gerenciamento de formulários
- **Lucide React** - Ícones
- **Date-fns** - Manipulação de datas
- **XLSX** - Exportação para Excel
- **jsPDF** - Exportação para PDF
- **React Hot Toast** - Notificações

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd sistema-controle-funcionarios
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto**
```bash
npm run dev
```

4. **Acesse a aplicação**
Abra seu navegador e acesse: `http://localhost:3000`

## 📋 Como Usar

### Cadastrando um Funcionário
1. Clique no botão "Novo Funcionário"
2. Preencha todos os campos obrigatórios:
   - Nome completo
   - Data de aniversário
   - Empresa
   - Data de contratação
3. Clique em "Cadastrar"

### Adicionando Acessos
1. No card do funcionário, clique no ícone de chave (🔑)
2. Preencha as informações do acesso:
   - Sistema
   - Usuário
   - Senha (opcional)
   - Observações (opcional)
   - Data do acesso
3. Clique em "Adicionar"

### Editando Informações
- Clique no ícone de edição (✏️) no card do funcionário
- Para editar acessos, clique no ícone de edição dentro da seção de acessos

### Excluindo Registros
- Clique no ícone de lixeira (🗑️) para excluir funcionários ou acessos
- Confirme a exclusão no diálogo de confirmação

### Exportando Relatórios
- Use os botões "Excel" ou "PDF" no cabeçalho
- Os arquivos serão baixados automaticamente

### Configurando o Agente GPT
1. Acesse **"Módulo de Qualidade"** → **"Agente GPT"**
2. Clique no botão **⚙️ Configurar** (ícone de engrenagem)
3. Insira sua chave da API OpenAI (obtenha em [platform.openai.com](https://platform.openai.com))
4. Clique em **"Salvar Configuração"**
5. Teste a conexão com **"Testar Conexão"**
6. Agora o sistema usará IA para análises automáticas!

**Nota**: Sem configuração da API, o sistema funciona em modo fallback (simulado).

## 🎨 Personalização

### Cores
As cores principais podem ser alteradas no arquivo `tailwind.config.js`:

```javascript
colors: {
  'velotax-blue': '#000058', // Cor principal da Velotax
}
```

### Logo
Para alterar o logo, substitua o ícone no componente `Header.tsx` ou adicione uma imagem personalizada.

## 💾 Armazenamento

Os dados são salvos no **localStorage** do navegador, garantindo:
- Persistência entre sessões
- Funcionamento offline
- Privacidade dos dados

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Smartphone

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Gera build de produção
npm run preview      # Visualiza o build de produção
npm run lint         # Executa o linter
```

## 📄 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Header.tsx      # Cabeçalho com logo e botões de exportação
│   ├── FuncionarioCard.tsx # Card de exibição do funcionário
│   ├── FuncionarioForm.tsx # Formulário de cadastro/edição
│   ├── AcessoForm.tsx  # Formulário de acessos
│   ├── EmptyState.tsx  # Estado vazio
│   └── ConfirmationDialog.tsx # Diálogos de confirmação
├── types/              # Definições TypeScript
│   └── index.ts
├── utils/              # Utilitários
│   ├── storage.ts      # Gerenciamento do localStorage
│   └── export.ts       # Funções de exportação
├── App.tsx             # Componente principal
├── main.tsx            # Ponto de entrada
└── index.css           # Estilos globais
```

## 🚀 Deploy Online

### Deploy Automático (Recomendado)
O projeto está configurado para deploy automático no Vercel:

1. **Conecte ao GitHub** e faça push do código
2. **Configure no Vercel** usando o `vercel.json` incluído
3. **Deploy automático** será executado

### Deploy Manual
```bash
# Build para produção
npm run build

# Deploy via Vercel CLI
npm run deploy
```

### URLs de Produção
- **Desenvolvimento:** `http://localhost:3005`
- **Produção:** `https://qualidade-velohub.vercel.app`
- **Integração:** Via iframe no Console de Conteúdo

### Configuração para Integração
O projeto foi adaptado para funcionar online e ser integrado ao Console de Conteúdo principal via iframe. Consulte `DEPLOY_INSTRUCTIONS.md` para detalhes completos.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou suporte, entre em contato com a equipe Velotax.

---

**Desenvolvido com ❤️ para a Velotax**
