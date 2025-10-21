# 🚀 Velodados - Dashboard de Análise de Atendimentos

Sistema completo de análise de dados de call center desenvolvido em **HTML, CSS e JavaScript puros**.

## 🎯 Objetivo

O Velodados é um dashboard completo para análise de atendimentos de call center, permitindo:

- 📊 **Métricas Gerais**: Total de ligações, tempo médio, avaliações, operadores ativos
- 👤 **Análise Individual**: Performance por operador, comparação com média da equipe
- 🏆 **Ranking**: Lista ordenada por quantidade, velocidade, qualidade e eficácia
- 📈 **Gráficos**: Visualizações de ligações por dia e distribuição de notas
- 🔍 **Filtros**: Por período e operador específico
- 📤 **Exportações**: Relatórios em PDF e Excel

## ⚡ Como Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- Navegador moderno

### Instalação
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd velodados

# Instale as dependências
npm install
```

### 🖥️ Opções de Execução

#### Opção 1: Apenas Frontend (Arquivos < 50MB)
```bash
npm start
```
- **URL**: `http://localhost:8080`
- **Ideal para**: Arquivos pequenos e médios
- **Limite**: 50MB

#### Opção 2: Frontend + Backend (Arquivos Grandes)
```bash
# Terminal 1 - Backend
npm run api

# Terminal 2 - Frontend  
npm start
```
- **Frontend**: `http://localhost:8080`
- **Backend**: `http://localhost:3000`
- **Ideal para**: Arquivos grandes (>50MB)
- **Limite**: 100MB

#### Opção 3: Desenvolvimento (Ambos com auto-reload)
```bash
npm run dev
```
- **Executa**: Frontend e Backend simultaneamente
- **Auto-reload**: Mudanças são aplicadas automaticamente

## 📁 Estrutura do Projeto

```
velodados/
├── api/                   # Backend (Node.js/Express)
│   ├── index.js          # Servidor principal
│   └── upload.js         # Processamento de arquivos
├── public/               # Frontend (HTML/CSS/JS)
│   ├── index.html        # Página principal
│   ├── css/              # Estilos
│   │   ├── colors.css    # Paleta de cores
│   │   └── styles.css    # Estilos principais
│   ├── js/               # Scripts JavaScript
│   │   ├── parser.js     # Parser de arquivos
│   │   ├── metrics.js    # Cálculos de métricas
│   │   ├── velotax-parser.js # Parser específico Velotax
│   │   ├── large-file-parser.js # Parser otimizado
│   │   ├── ui.js         # Interface do usuário
│   │   └── export.js     # Exportações
│   └── assets/           # Recursos estáticos
├── tests/                # Testes unitários
├── package.json          # Configurações do projeto
└── README.md            # Este arquivo
```

## 🚀 Funcionalidades

### 📤 Upload de Dados
- ✅ Suporte a arquivos CSV e Excel (.xlsx, .xls)
- ✅ Validação automática de cabeçalhos
- ✅ Processamento otimizado para arquivos grandes
- ✅ Indicador de progresso em tempo real
- ✅ Tratamento robusto de erros

### 📊 Métricas Calculadas
- **Total de ligações atendidas**
- **Tempo médio de atendimento**
- **Nota média de atendimento**
- **Nota média de solução**
- **Tempo médio logado**
- **Tempo médio pausado**

### 🏆 Ranking de Operadores
Fórmula de score:
```
score = 0.35*norm(totalAtendimentos)
      + 0.20*(1 - norm(tempoMedioAtendimento))
      + 0.20*norm(notaAtendimento)
      + 0.20*norm(notaSolucao)
      - 0.05*norm(tempoPausa)
```

### 🔍 Filtros Disponíveis
- **Período**: Ontem, Semana, Mês, Ano
- **Operador**: Seleção específica de operador

### 📤 Exportações
- **Excel**: Dados brutos + resumo em abas separadas
- **PDF**: Dashboard completo com gráficos

## 🎨 Paleta de Cores

```css
:root {
  --color-bg-light: #F3F7FC;    /* Fundo claro */
  --color-bg-dark: #272A30;     /* Fundo escuro */
  --color-blue-dark: #000058;   /* Azul escuro */
  --color-blue-primary: #1634FF; /* Azul principal */
  --color-blue-light: #1694FF;  /* Azul claro */
}
```

## 🧪 Testes

Execute os testes unitários:
```bash
npm test
```

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Gráficos**: Chart.js
- **Parsing**: PapaParse (CSV), SheetJS (Excel)
- **Exportações**: jsPDF + html2canvas
- **Servidor**: http-server

## ✨ Características Especiais

- 🚀 **Sistema Único**: Tudo funciona no frontend, sem complexidade
- 🛡️ **Robusto**: Tratamento de erros e timeouts
- ⚡ **Rápido**: Processamento otimizado para arquivos grandes
- 📱 **Responsivo**: Funciona em desktop e mobile
- 🎯 **Específico**: Parser otimizado para dados da Velotax

## 📋 Como Usar

1. **Acesse**: `http://localhost:8080`
2. **Upload**: Arraste seu arquivo CSV/Excel
3. **Aguarde**: Processamento automático com progresso
4. **Analise**: Veja métricas, gráficos e ranking
5. **Exporte**: Gere relatórios em PDF/Excel

## 🎉 Status

✅ **FASE 1 CONCLUÍDA** - Sistema completo e funcional!

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.