# 🚀 VeloInsights - Documentação Completa do Sistema

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Configuração e Instalação](#configuração-e-instalação)
4. [Estrutura de Dados](#estrutura-de-dados)
5. [Componentes Principais](#componentes-principais)
6. [Fluxo de Autenticação](#fluxo-de-autenticação)
7. [Processamento de Dados](#processamento-de-dados)
8. [Sistema de Permissões](#sistema-de-permissões)
9. [Temas e Interface](#temas-e-interface)
10. [Deploy e Produção](#deploy-e-produção)
11. [Troubleshooting](#troubleshooting)
12. [Manutenção e Evolução](#manutenção-e-evolução)

---

## 🎯 Visão Geral

### Propósito
Sistema de dashboard analítico para análise de dados de call center, com métricas em tempo real, gráficos interativos e análise por operador.

### Tecnologias Principais
- **Frontend**: React.js + Vite
- **Autenticação**: Google OAuth2
- **Dados**: Google Sheets API
- **Estilização**: CSS3 + Variáveis CSS
- **Deploy**: Vercel
- **Gráficos**: Chart.js + CSS puro

### Funcionalidades Core
- ✅ Dashboard principal com métricas gerais
- ✅ Análise por operador individual
- ✅ Gráficos avançados e comparativos
- ✅ Sistema de temas (claro/escuro)
- ✅ Filtros por período
- ✅ Autenticação Google
- ✅ Dados em tempo real

---

## 🏗️ Arquitetura do Sistema

### Estrutura de Diretórios
```
VeloInsights/
├── src/
│   ├── components/          # Componentes React
│   │   ├── App.jsx         # Componente principal
│   │   ├── Header.jsx      # Cabeçalho
│   │   ├── MetricsDashboard.jsx    # Dashboard principal
│   │   ├── AgentAnalysis.jsx       # Análise por agente
│   │   ├── ChartsDetailedPage.jsx  # Gráficos avançados
│   │   └── ModernChartsDashboard.jsx # Dashboard moderno
│   ├── hooks/              # Hooks customizados
│   │   └── useGoogleSheetsDirectSimple.js # Hook principal
│   ├── contexts/           # Contextos React
│   │   └── CargoContext.jsx # Contexto de cargos
│   ├── utils/              # Utilitários
│   │   ├── dataProcessor.js # Processamento de dados
│   │   └── operatorUtils.js # Utilitários de operadores
│   └── styles/             # Estilos globais
│       └── App.css
├── public/                 # Arquivos estáticos
├── api/                    # APIs e proxies
├── config/                 # Configurações
└── package.json           # Dependências
```

### Fluxo de Dados
```
Google Sheets → useGoogleSheetsDirectSimple → dataProcessor → Componentes → UI
```

---

## ⚙️ Configuração e Instalação

### 1. Pré-requisitos
- Node.js 18+ (especificado em .nvmrc)
- Conta Google com acesso ao Google Sheets
- Conta Vercel para deploy

### 2. Instalação Local
```bash
# Clone do repositório
git clone https://github.com/VeloProcess/VeloInsightss.git
cd VeloInsights

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Executar em desenvolvimento
npm run dev
```

### 3. Variáveis de Ambiente
```env
# Google Sheets
VITE_GOOGLE_CLIENT_ID=seu_client_id
VITE_GOOGLE_API_KEY=sua_api_key
VITE_SPREADSHEET_ID=id_da_planilha

# URLs da API (se aplicável)
VITE_API_BASE_URL=url_da_api
```

### 4. Configuração do Google Sheets
- Criar projeto no Google Cloud Console
- Habilitar Google Sheets API
- Criar credenciais OAuth2
- Compartilhar planilha com o email do projeto

---

## 📊 Estrutura de Dados

### Formato da Planilha Google Sheets
```
Coluna U: Id Ligação (ID da chamada)
Coluna A: Chamada (Retida na URA, Atendida, etc.)
Coluna C: Operador (Nome do operador)
Coluna D: Data (DD/MM/YYYY)
Coluna E: Hora (HH:MM:SS)
Coluna L: Tempo Na Ura (HH:MM:SS)
Coluna M: Tempo De Espera (HH:MM:SS)
Coluna N: Tempo Falado (HH:MM:SS)
Coluna O: Tempo Total (HH:MM:SS)
Coluna AB: Pergunta2 1 PERGUNTA ATENDENTE (1-5)
Coluna AC: Pergunta2 2 PERGUNTA SOLUCAO(1-5)
```

### Estrutura de Dados Processados
```javascript
const dadosProcessados = {
  totalChamadas: number,
  totalCalls: number,
  duracaoMediaAtendimento: number,
  taxaSucesso: number,
  metricasOperadores: {
    [operador]: {
      operador: string,
      totalCalls: number,
      avgRatingAttendance: number,
      avgRatingSolution: number,
      avgDuration: number,
      chamadasAvaliadas: number
    }
  },
  rankings: [
    {
      operator: string,
      calls: number,
      rating: number
    }
  ]
}
```

---

## 🧩 Componentes Principais

### 1. App.jsx (Componente Principal)
**Responsabilidades:**
- Gerenciar estado global da aplicação
- Controlar autenticação e navegação
- Coordenar carregamento de dados
- Gerenciar temas e filtros

**Estados Principais:**
```javascript
const [currentView, setCurrentView] = useState('dashboard')
const [isAuthenticated, setIsAuthenticated] = useState(false)
const [data, setData] = useState([])
const [operatorMetrics, setOperatorMetrics] = useState({})
const [theme, setTheme] = useState('dark')
const [filters, setFilters] = useState({})
```

### 2. MetricsDashboard.jsx
**Responsabilidades:**
- Exibir métricas gerais do call center
- Mostrar ranking de operadores
- Implementar filtros por período
- Gerenciar visualização de nomes (baseado em permissões)

**Métricas Calculadas:**
- Total de chamadas
- Duração média de atendimento
- Taxa de sucesso
- Satisfação média
- Ranking de operadores

### 3. AgentAnalysis.jsx
**Responsabilidades:**
- Análise detalhada por operador
- Seleção de operadores com busca
- Métricas individuais
- Comparação temporal

**Funcionalidades:**
- Lista expansível de operadores
- Busca em tempo real
- Filtros por período
- Métricas detalhadas por operador

### 4. ChartsDetailedPage.jsx
**Responsabilidades:**
- Gráficos avançados e comparativos
- Dashboard moderno
- Visualizações interativas
- Análise de tendências

**Tipos de Gráficos:**
- Gráfico de barras (distribuição de chamadas)
- Gráfico circular (métricas de qualidade)
- Gráfico de linha (tendências temporais)

---

## 🔐 Fluxo de Autenticação

### 1. Inicialização
```javascript
// Hook useGoogleSheetsDirectSimple
useEffect(() => {
  // Verificar se já está autenticado
  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    setIsAuthenticated(true)
    setUserData(gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile())
  }
}, [])
```

### 2. Processo de Login
```javascript
const signIn = async () => {
  try {
    const authInstance = gapi.auth2.getAuthInstance()
    const user = await authInstance.signIn()
    const profile = user.getBasicProfile()
    
    setIsAuthenticated(true)
    setUserData({
      name: profile.getName(),
      email: profile.getEmail(),
      imageUrl: profile.getImageUrl()
    })
    
    // Carregar dados automaticamente após login
    loadDataOnDemand('last15Days')
  } catch (error) {
    console.error('Erro no login:', error)
  }
}
```

### 3. Logout
```javascript
const signOut = async () => {
  const authInstance = gapi.auth2.getAuthInstance()
  await authInstance.signOut()
  setIsAuthenticated(false)
  setUserData(null)
  setData([])
}
```

---

## 📈 Processamento de Dados

### 1. Hook useGoogleSheetsDirectSimple.js
**Responsabilidades:**
- Gerenciar autenticação Google
- Carregar dados da planilha
- Processar e filtrar dados
- Gerenciar estados de loading

**Funções Principais:**
```javascript
// Carregar dados por período
const loadDataOnDemand = async (period) => {
  const filteredData = await filterDataByPeriod(fullDataset, period)
  const processedData = await processarDadosAssincrono(filteredData)
  setData(processedData.dadosProcessados)
  setOperatorMetrics(processedData.metricasOperadores)
}

// Filtrar dados por período
const filterDataByPeriod = (data, selectedPeriod) => {
  // Lógica de filtragem por data
  // Suporte a: last7Days, last15Days, lastMonth, etc.
}

// Processar dados assincronamente
const processarDadosAssincrono = async (dados) => {
  return processarDados(dados, processAllRecords)
}
```

### 2. dataProcessor.js
**Responsabilidades:**
- Processar dados brutos da planilha
- Calcular métricas e rankings
- Converter formatos de tempo
- Filtrar operadores inválidos

**Funções Principais:**
```javascript
// Processar dados principais
const processarDados = (dados, processAllRecords = false) => {
  const dadosProcessados = []
  const metricasOperadores = {}
  
  dados.forEach(record => {
    // Processar cada registro
    // Calcular métricas por operador
    // Filtrar dados inválidos
  })
  
  return {
    dadosProcessados,
    metricasOperadores,
    rankings: calcularRankings(metricasOperadores)
  }
}

// Calcular métricas individuais
const calcularMetricas = (operador, chamadas) => {
  return {
    operador,
    totalCalls: chamadas.length,
    avgRatingAttendance: calcularMedia(chamadas, 'notaAtendimento'),
    avgRatingSolution: calcularMedia(chamadas, 'notaSolucao'),
    avgDuration: calcularDuracaoMedia(chamadas),
    chamadasAvaliadas: chamadas.filter(c => c.notaAtendimento > 0).length
  }
}
```

### 3. Conversão de Tempo
```javascript
// Converter HH:MM:SS para minutos
const parseDurationToMinutes = (durationString) => {
  if (!durationString || typeof durationString !== 'string') return 0
  
  const timeMatch = durationString.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = parseInt(timeMatch[3], 10);
    return (hours * 60) + minutes + (seconds / 60);
  }
  
  return parseFloat(durationString) || 0;
}
```

---

## 👥 Sistema de Permissões

### Hierarquia de Cargos
```javascript
const CARGO_HIERARCHY = {
  'ADMINISTRADOR': 4,    // Acesso total
  'GESTÃO': 3,           // Acesso gerencial
  'MONITOR': 2,          // Acesso de monitoramento
  'EDITOR': 1            // Acesso limitado
}
```

### Controle de Acesso
```javascript
// Hook useAccessControl
const useAccessControl = () => {
  const { selectedCargo, userInfo } = useCargo()
  
  const hasPermission = (requiredLevel) => {
    const userLevel = CARGO_HIERARCHY[selectedCargo] || 0
    return userLevel >= requiredLevel
  }
  
  return { hasPermission }
}
```

### Regras de Visualização
- **ADMINISTRADOR**: Vê todos os dados e operadores
- **GESTÃO**: Vê métricas gerais e operadores
- **MONITOR**: Vê apenas métricas gerais
- **EDITOR**: Acesso limitado a dados básicos

---

## 🎨 Temas e Interface

### Sistema de Temas
```css
/* Variáveis CSS para tema claro */
:root {
  --color-bg-primary: #ffffff;
  --color-text-primary: #1e293b;
  --color-card-bg: #f8fafc;
  --color-blue-primary: #3b82f6;
  --color-blue-light: #60a5fa;
}

/* Variáveis CSS para tema escuro */
[data-theme="dark"] {
  --color-bg-primary: #0f172a;
  --color-text-primary: #f1f5f9;
  --color-card-bg: #1e293b;
  --color-blue-primary: #3b82f6;
  --color-blue-light: #60a5fa;
}
```

### Componentes Responsivos
```css
/* Breakpoints */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .metric-card {
    padding: 12px;
  }
}
```

---

## 🚀 Deploy e Produção

### 1. Configuração Vercel
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 2. Build de Produção
```bash
# Build otimizado
npm run build

# Verificar build
npm run preview
```

### 3. Deploy Automático
- Push para branch `master` → Deploy automático na Vercel
- Variáveis de ambiente configuradas no painel Vercel
- Domínio personalizado configurado

### 4. Monitoramento
- Logs de erro no console do navegador
- Métricas de performance na Vercel
- Monitoramento de uptime

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Autenticação Google
```javascript
// Verificar configuração OAuth2
console.log('Client ID:', process.env.VITE_GOOGLE_CLIENT_ID)
console.log('API Key:', process.env.VITE_GOOGLE_API_KEY)

// Verificar domínios autorizados no Google Console
```

#### 2. Dados não carregam
```javascript
// Verificar ID da planilha
console.log('Spreadsheet ID:', process.env.VITE_SPREADSHEET_ID)

// Verificar permissões da planilha
// Verificar se a API está habilitada
```

#### 3. Métricas zeradas
```javascript
// Verificar formato dos dados
console.log('Primeiro registro:', data[0])
console.log('Colunas disponíveis:', Object.keys(data[0]))

// Verificar conversão de tempo
const duration = parseDurationToMinutes('00:05:30')
console.log('Duração convertida:', duration)
```

#### 4. Performance lenta
```javascript
// Verificar tamanho dos dados
console.log('Total de registros:', data.length)

// Implementar paginação se necessário
const paginatedData = data.slice(0, 1000)
```

### Logs de Debug
```javascript
// Ativar logs detalhados
const DEBUG_MODE = process.env.NODE_ENV === 'development'

if (DEBUG_MODE) {
  console.log('🔍 Debug info:', {
    dataLength: data.length,
    operatorCount: Object.keys(operatorMetrics).length,
    theme: theme
  })
}
```

---

## 🔄 Manutenção e Evolução

### 1. Atualizações de Dependências
```bash
# Verificar atualizações
npm outdated

# Atualizar dependências
npm update

# Atualizar major versions
npm install package@latest
```

### 2. Adicionar Novas Métricas
```javascript
// 1. Adicionar campo na planilha
// 2. Atualizar dataProcessor.js
const novaMetrica = calcularNovaMetrica(dados)

// 3. Atualizar componente
<div className="metric-card">
  <span className="metric-label">Nova Métrica:</span>
  <span className="metric-value">{novaMetrica}</span>
</div>
```

### 3. Adicionar Novos Gráficos
```javascript
// 1. Instalar biblioteca de gráficos
npm install nova-biblioteca-graficos

// 2. Criar componente de gráfico
const NovoGrafico = ({ data }) => {
  // Implementar gráfico
}

// 3. Integrar no dashboard
<NovoGrafico data={dadosFiltrados} />
```

### 4. Backup e Versionamento
```bash
# Backup do código
git add .
git commit -m "Backup antes de mudanças"
git push origin master

# Backup dos dados (se necessário)
# Exportar planilha Google Sheets
```

---

## 📚 Referências e Recursos

### Documentação Oficial
- [React.js](https://reactjs.org/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Vercel](https://vercel.com/docs)
- [Chart.js](https://www.chartjs.org/docs)

### Arquivos de Configuração Importantes
- `package.json` - Dependências e scripts
- `vite.config.js` - Configuração do Vite
- `vercel.json` - Configuração do deploy
- `.env` - Variáveis de ambiente

### Contatos e Suporte
- **Desenvolvedor Principal**: [Seu Nome]
- **Repositório**: https://github.com/VeloProcess/VeloInsightss
- **Deploy**: https://veloinsights.vercel.app

---

## 📝 Changelog

### Versão 1.0.0 (Atual)
- ✅ Sistema base funcional
- ✅ Autenticação Google
- ✅ Dashboard principal
- ✅ Análise por operador
- ✅ Gráficos avançados
- ✅ Sistema de temas
- ✅ Deploy na Vercel

### Próximas Versões
- 🔄 Comparativos temporais
- 🔄 Filtros avançados
- 🔄 Exportação de dados
- 🔄 Notificações em tempo real

---

**📅 Última Atualização**: Outubro 2025  
**👨‍💻 Desenvolvedor**: Assistente AI + VeloProcess  
**📋 Status**: Produção Ativa  

---

*Esta documentação deve ser atualizada sempre que houver mudanças significativas no sistema.*
