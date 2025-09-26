# 📋 CHECKLIST DE IMPLEMENTAÇÃO - MÓDULO QUALIDADE

## 🎯 PÁGINAS IDENTIFICADAS

### 1. Página de Funcionários (`/funcionarios`)
**Funcionalidades:**
- ✅ Lista de funcionários com filtros
- ✅ Formulário de cadastro/edição de funcionários
- ✅ Gestão de acessos por funcionário
- ✅ Toolbar com exportação (Excel/PDF) e importação
- ✅ Sincronização de dados
- ✅ Filtros por nome, empresa, atuação, status, escala

### 2. Página do Módulo de Qualidade (`/qualidade-module`)
**Funcionalidades:**
- ✅ Navegação entre 4 seções: Avaliações, Relatório do Agente, Relatório da Gestão, Agente GPT
- ✅ **Avaliações:** CRUD completo, upload de áudio, formulário de avaliação
- ✅ **Relatório do Agente:** Relatório individual por colaborador
- ✅ **Relatório da Gestão:** Relatório gerencial com rankings
- ✅ **Agente GPT:** Análise automática de ligações com IA

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### FASE 1: Estrutura Base ✅
- [x] **1.1** Migrar tipos TypeScript → JavaScript (`src/types/qualidade.js`)
- [x] **1.2** Migrar serviços de storage (`src/services/qualidadeStorage.js`)
- [x] **1.3** Migrar utilitários de exportação (`src/services/qualidadeExport.js`)
- [x] **1.4** Migrar serviços GPT (`src/services/gptService.js`)

### FASE 2: Página de Funcionários ✅
- [x] **2.1** Implementar `FuncionariosPage.jsx` com estrutura completa
- [x] **2.2** Migrar `FuncionarioList` component (integrado na página)
- [x] **2.3** Migrar `FuncionarioForm` component (integrado nos modais)
- [x] **2.4** Migrar `FuncionarioToolbar` component (integrado na toolbar)
- [x] **2.5** Migrar `AcessoForm` component (integrado no modal de acessos)
- [x] **2.6** Implementar filtros e busca
- [x] **2.7** Implementar CRUD de funcionários
- [x] **2.8** Implementar gestão de acessos

### FASE 3: Página do Módulo de Qualidade ✅
- [x] **3.1** Implementar `QualidadeModulePage.jsx` com navegação
- [x] **3.2** Migrar `AvaliacaoList` component (integrado na página)
- [x] **3.3** Migrar `AvaliacaoForm` component (modal implementado)
- [x] **3.4** Migrar `RelatorioAgente` component (estrutura criada)
- [x] **3.5** Migrar `RelatorioGestao` component (estrutura criada)
- [x] **3.6** Migrar `GPTIntegration` component (modal implementado)
- [x] **3.7** Implementar upload de áudio (preparado para implementação)
- [x] **3.8** Implementar análise GPT (modal funcional)

#### **✅ MODAIS IMPLEMENTADOS:**

**Modal de Avaliação:**
- ✅ Formulário completo com todos os campos
- ✅ Seleção de colaborador (dropdown)
- ✅ Critérios de avaliação com botões visuais
- ✅ Sistema de pontuação automático
- ✅ Validação de campos obrigatórios
- ✅ Integração com storage (add/update/delete)
- ✅ Design responsivo seguindo LAYOUT_GUIDELINES

**Modal de Análise GPT:**
- ✅ Exibição de informações da avaliação
- ✅ Botão para iniciar análise GPT
- ✅ Loading state durante análise
- ✅ Exibição de resultados da IA
- ✅ Interface responsiva e intuitiva

**Funcionalidades dos Botões:**
- ✅ "Nova Avaliação" → Abre modal de criação
- ✅ "Editar" → Abre modal de edição
- ✅ "Análise GPT" → Abre modal GPT
- ✅ "Excluir" → Exclui com confirmação

### FASE 4: Armazenamento Online (MongoDB)
- [ ] **4.1** Configurar conexão com MongoDB
- [ ] **4.2** Criar collection `qualidade_avaliacoes` no MongoDB
- [ ] **4.3** Implementar schema de validação para avaliações
- [ ] **4.4** Criar função de upsert para avaliações
- [ ] **4.5** Implementar sincronização automática (localStorage ↔ MongoDB)
- [ ] **4.6** Criar collection `qualidade_funcionarios` no MongoDB
- [ ] **4.7** Implementar função de upsert para funcionários
- [ ] **4.8** Criar collection `qualidade_avaliacoes_gpt` no MongoDB
- [ ] **4.9** Implementar backup automático no MongoDB
- [ ] **4.10** Criar sistema de logs de operações no MongoDB
- [ ] **4.11** Implementar fallback (MongoDB → localStorage)
- [ ] **4.12** Testar sincronização em tempo real
- [ ] **4.13** Implementar controle de versão de dados
- [ ] **4.14** Criar sistema de migração de dados existentes

### FASE 5: Implementação das Abas Vazias
- [ ] **5.1** Implementar aba "Relatório do Agente"
  - [ ] **5.1.1** Migrar componente `RelatorioAgente.tsx` → `RelatorioAgente.jsx`
  - [ ] **5.1.2** Adaptar TypeScript → JavaScript (interfaces → JSDoc)
  - [ ] **5.1.3** Converter Tailwind CSS → Material-UI (sx props)
  - [ ] **5.1.4** Substituir Lucide React → Material-UI Icons
  - [ ] **5.1.5** Integrar função `gerarRelatorioAgente` do `qualidadeStorage.js`
  - [ ] **5.1.6** Implementar seleção de colaborador (dropdown)
  - [ ] **5.1.7** Implementar filtros por período (mês/ano)
  - [ ] **5.1.8** Implementar visualização de métricas (média, tendência, histórico)
  - [ ] **5.1.9** Aplicar LAYOUT_GUIDELINES (cores, tipografia, containers)
  - [ ] **5.1.10** Testar funcionalidade completa

- [ ] **5.2** Implementar aba "Relatório da Gestão"
  - [ ] **5.2.1** Migrar componente `RelatorioGestao.tsx` → `RelatorioGestao.jsx`
  - [ ] **5.2.2** Adaptar TypeScript → JavaScript (interfaces → JSDoc)
  - [ ] **5.2.3** Converter Tailwind CSS → Material-UI (sx props)
  - [ ] **5.2.4** Substituir Lucide React → Material-UI Icons
  - [ ] **5.2.5** Integrar função `gerarRelatorioGestao` do `qualidadeStorage.js`
  - [ ] **5.2.6** Implementar filtros por mês/ano
  - [ ] **5.2.7** Implementar ranking de colaboradores (top 3 melhores/piores)
  - [ ] **5.2.8** Implementar estatísticas gerais (média da equipe, total de avaliações)
  - [ ] **5.2.9** Implementar visualização de performance por colaborador
  - [ ] **5.2.10** Aplicar LAYOUT_GUIDELINES (cores, tipografia, containers)
  - [ ] **5.2.11** Testar funcionalidade completa

- [ ] **5.3** Implementar aba "Análise GPT"
  - [ ] **5.3.1** Migrar componente `GPTIntegration.tsx` → `GPTIntegration.jsx`
  - [ ] **5.3.2** Adaptar TypeScript → JavaScript (interfaces → JSDoc)
  - [ ] **5.3.3** Converter Tailwind CSS → Material-UI (sx props)
  - [ ] **5.3.4** Substituir Lucide React → Material-UI Icons
  - [ ] **5.3.5** Integrar serviço `gptService.js` existente
  - [ ] **5.3.6** Implementar verificação de arquivo de áudio
  - [ ] **5.3.7** Implementar botão de análise GPT
  - [ ] **5.3.8** Implementar loading state durante análise
  - [ ] **5.3.9** Implementar exibição de resultados da IA
  - [ ] **5.3.10** Implementar sistema de moderação
  - [ ] **5.3.11** Implementar configuração de API GPT
  - [ ] **5.3.12** Aplicar LAYOUT_GUIDELINES (cores, tipografia, containers)
  - [ ] **5.3.13** Testar funcionalidade completa

### FASE 5.4: Implementação do Upload de Áudio para Análise GPT
- [ ] **5.4.1** Implementar funcionalidade do botão de áudio na tabela de avaliações
  - [ ] **5.4.1.1** Modificar estado do ícone `MicOff` (cinza, desabilitado) → `Mic` (azul, ativo)
  - [ ] **5.4.1.2** Implementar clique no botão para abrir modal de upload
  - [ ] **5.4.1.3** Adicionar tooltip explicativo no botão
  - [ ] **5.4.1.4** Implementar verificação de arquivo existente

- [ ] **5.4.2** Criar modal de upload de áudio
  - [ ] **5.4.2.1** Criar componente `AudioUploadModal.jsx`
  - [ ] **5.4.2.2** Implementar interface de upload com Material-UI
  - [ ] **5.4.2.3** Adicionar botão "Adicionar Áudio" no modal
  - [ ] **5.4.2.4** Implementar input de arquivo oculto (accept=".mp3,.wav")
  - [ ] **5.4.2.5** Adicionar validação de formato (MP3, WAV)
  - [ ] **5.4.2.6** Implementar validação de tamanho (máximo 50MB)
  - [ ] **5.4.2.7** Adicionar preview do arquivo selecionado
  - [ ] **5.4.2.8** Implementar botões "Cancelar" e "Salvar"

- [ ] **5.4.3** Implementar lógica de upload e armazenamento
  - [ ] **5.4.3.1** Integrar função `saveAudioFile` do `qualidadeStorage.js`
  - [ ] **5.4.3.2** Implementar conversão para Base64 (arquivos pequenos)
  - [ ] **5.4.3.3** Implementar upload para Vercel Blob (arquivos grandes)
  - [ ] **5.4.3.4** Implementar fallback para Google Drive (se configurado)
  - [ ] **5.4.3.5** Adicionar loading state durante upload
  - [ ] **5.4.3.6** Implementar tratamento de erros de upload

- [ ] **5.4.4** Atualizar estado visual do botão após upload
  - [ ] **5.4.4.1** Alterar ícone de `MicOff` para `Mic` (azul)
  - [ ] **5.4.4.2** Remover estado desabilitado do botão
  - [ ] **5.4.4.3** Adicionar tooltip "Áudio disponível para análise"
  - [ ] **5.4.4.4** Implementar hover effect no botão ativo

- [ ] **5.4.5** Integrar com análise GPT
  - [ ] **5.4.5.1** Verificar se arquivo existe antes de permitir análise GPT
  - [ ] **5.4.5.2** Passar arquivo de áudio para `gptService.js`
  - [ ] **5.4.5.3** Implementar validação de arquivo na análise
  - [ ] **5.4.5.4** Adicionar mensagem de erro se não houver áudio

- [ ] **5.4.6** Implementar funcionalidades adicionais
  - [ ] **5.4.6.1** Adicionar opção de remover áudio (botão X)
  - [ ] **5.4.6.2** Implementar preview/play do áudio (opcional)
  - [ ] **5.4.6.3** Adicionar informações do arquivo (nome, tamanho, duração)
  - [ ] **5.4.6.4** Implementar drag & drop de arquivos (opcional)

- [ ] **5.4.7** Aplicar LAYOUT_GUIDELINES
  - [ ] **5.4.7.1** Usar cores oficiais VeloHub (#000058, #1694FF, #15A237)
  - [ ] **5.4.7.2** Aplicar tipografia Poppins
  - [ ] **5.4.7.3** Implementar containers com sombreado e bordas arredondadas
  - [ ] **5.4.7.4** Adicionar transições suaves nos hovers
  - [ ] **5.4.7.5** Implementar responsividade para mobile

- [ ] **5.4.8** Testes e validação
  - [ ] **5.4.8.1** Testar upload de arquivos MP3
  - [ ] **5.4.8.2** Testar upload de arquivos WAV
  - [ ] **5.4.8.3** Testar validação de formatos inválidos
  - [ ] **5.4.8.4** Testar validação de tamanho máximo
  - [ ] **5.4.8.5** Testar integração com análise GPT
  - [ ] **5.4.8.6** Testar remoção de arquivo
  - [ ] **5.4.8.7** Testar responsividade em diferentes dispositivos

### FASE 6: Integração e Testes
- [ ] **6.1** Aplicar LAYOUT_GUIDELINES em todos os componentes
- [ ] **6.2** Testar navegação entre páginas
- [ ] **6.3** Testar CRUD de funcionários (local + online)
- [ ] **6.4** Testar CRUD de avaliações (local + online)
- [ ] **6.5** Testar relatórios (agente e gestão)
- [ ] **6.6** Testar análise GPT
- [ ] **6.7** Testar exportação/importação
- [ ] **6.8** Testar sincronização online
- [ ] **6.9** Testar fallback offline
- [ ] **6.10** Testar performance com grandes volumes

---

## 🗄️ ARQUITETURA MONGODB

### **Collections Propostas:**

#### **1. `qualidade_avaliacoes`**
```javascript
{
  _id: ObjectId,
  id: String, // ID único da aplicação
  colaboradorId: String,
  colaboradorNome: String,
  avaliador: String,
  mes: String,
  ano: Number,
  dataAvaliacao: Date,
  arquivoLigacao: String, // Base64 ou URL
  nomeArquivo: String,
  saudacaoAdequada: Boolean,
  escutaAtiva: Boolean,
  resolucaoQuestao: Boolean,
  empatiaCordialidade: Boolean,
  direcionouPesquisa: Boolean,
  procedimentoIncorreto: Boolean,
  encerramentoBrusco: Boolean,
  moderado: Boolean,
  observacoesModeracao: String,
  pontuacaoTotal: Number,
  createdAt: Date,
  updatedAt: Date,
  version: Number // Controle de versão
}
```

#### **2. `qualidade_funcionarios`**
```javascript
{
  _id: ObjectId,
  id: String, // ID único da aplicação
  nomeCompleto: String,
  dataAniversario: Date,
  empresa: String,
  dataContratado: Date,
  telefone: String,
  atuacao: String,
  escala: String,
  acessos: [{
    id: String,
    sistema: String,
    perfil: String,
    observacoes: String,
    createdAt: Date
  }],
  desligado: Boolean,
  dataDesligamento: Date,
  afastado: Boolean,
  dataAfastamento: Date,
  createdAt: Date,
  updatedAt: Date,
  version: Number
}
```

#### **3. `qualidade_avaliacoes_gpt`**
```javascript
{
  _id: ObjectId,
  id: String, // ID único da aplicação
  avaliacaoId: String, // Referência à avaliação
  analiseGPT: String,
  pontuacaoGPT: Number,
  criteriosGPT: {
    saudacaoAdequada: Boolean,
    escutaAtiva: Boolean,
    resolucaoQuestao: Boolean,
    empatiaCordialidade: Boolean,
    direcionouPesquisa: Boolean,
    procedimentoIncorreto: Boolean,
    encerramentoBrusco: Boolean
  },
  confianca: Number, // 0-100
  palavrasCriticas: [String],
  calculoDetalhado: [String],
  createdAt: Date,
  version: Number
}
```

#### **4. `qualidade_logs`**
```javascript
{
  _id: ObjectId,
  operation: String, // CREATE, UPDATE, DELETE, SYNC
  collection: String, // avaliacoes, funcionarios, gpt
  documentId: String,
  userId: String,
  timestamp: Date,
  details: Object,
  userAgent: String,
  ip: String
}
```

### **Índices Recomendados:**
```javascript
// qualidade_avaliacoes
db.qualidade_avaliacoes.createIndex({ "id": 1 }, { unique: true })
db.qualidade_avaliacoes.createIndex({ "colaboradorId": 1 })
db.qualidade_avaliacoes.createIndex({ "mes": 1, "ano": 1 })
db.qualidade_avaliacoes.createIndex({ "avaliador": 1 })
db.qualidade_avaliacoes.createIndex({ "createdAt": 1 })

// qualidade_funcionarios
db.qualidade_funcionarios.createIndex({ "id": 1 }, { unique: true })
db.qualidade_funcionarios.createIndex({ "nomeCompleto": 1 })
db.qualidade_funcionarios.createIndex({ "empresa": 1 })
db.qualidade_funcionarios.createIndex({ "desligado": 1, "afastado": 1 })

// qualidade_avaliacoes_gpt
db.qualidade_avaliacoes_gpt.createIndex({ "id": 1 }, { unique: true })
db.qualidade_avaliacoes_gpt.createIndex({ "avaliacaoId": 1 })
```

### **Funções de Upsert:**
```javascript
// Exemplo de upsert para avaliações
const upsertAvaliacao = async (avaliacaoData) => {
  const filter = { id: avaliacaoData.id };
  const update = {
    $set: {
      ...avaliacaoData,
      updatedAt: new Date(),
      version: { $inc: 1 }
    },
    $setOnInsert: {
      createdAt: new Date(),
      version: 1
    }
  };
  
  return await db.qualidade_avaliacoes.updateOne(filter, update, { upsert: true });
};
```

### **Estratégia de Sincronização:**

#### **1. Sincronização Automática:**
- ✅ **Online First**: Tentar MongoDB primeiro, fallback para localStorage
- ✅ **Bidirectional Sync**: localStorage ↔ MongoDB
- ✅ **Conflict Resolution**: Timestamp + version control
- ✅ **Offline Support**: Funcionar sem internet

#### **2. Fluxo de Sincronização:**
```javascript
// 1. Operação local
const addAvaliacao = async (data) => {
  // Salvar no localStorage imediatamente
  const localAvaliacao = saveToLocalStorage(data);
  
  // Tentar sincronizar com MongoDB
  try {
    await syncToMongoDB(localAvaliacao);
  } catch (error) {
    // Marcar para sincronização posterior
    markForSync(localAvaliacao.id);
  }
  
  return localAvaliacao;
};

// 2. Sincronização em background
const syncPendingChanges = async () => {
  const pending = getPendingSync();
  for (const item of pending) {
    try {
      await syncToMongoDB(item);
      markAsSynced(item.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
};
```

#### **3. Resolução de Conflitos:**
```javascript
const resolveConflict = (local, remote) => {
  // Critérios de resolução:
  // 1. Maior version number
  // 2. Timestamp mais recente
  // 3. Manter dados locais se remoto for muito antigo
  
  if (remote.version > local.version) {
    return remote;
  } else if (local.updatedAt > remote.updatedAt) {
    return local;
  } else {
    return local; // Manter local por segurança
  }
};
```

---

## 📊 COMPONENTES A MIGRAR

### Da pasta `QUALIDADE/src/components/`:
- [x] `AvaliacaoForm.tsx` → `AvaliacaoForm.jsx` ✅ **IMPLEMENTADO** (integrado no modal)
- [x] `AvaliacaoList.tsx` → `AvaliacaoList.jsx` ✅ **IMPLEMENTADO** (integrado na página)
- [ ] `ConfirmationDialog.tsx` → `ConfirmationDialog.jsx`
- [ ] `EmptyState.tsx` → `EmptyState.jsx`
- [x] `FuncionarioCard.tsx` → `FuncionarioCard.jsx` ✅ **IMPLEMENTADO** (integrado na tabela)
- [x] `FuncionarioFilters.tsx` → `FuncionarioFilters.jsx` ✅ **IMPLEMENTADO** (integrado na toolbar)
- [x] `FuncionarioForm.tsx` → `FuncionarioForm.jsx` ✅ **IMPLEMENTADO** (integrado no modal)
- [x] `FuncionarioList.tsx` → `FuncionarioList.jsx` ✅ **IMPLEMENTADO** (integrado na página)
- [x] `FuncionarioToolbar.tsx` → `FuncionarioToolbar.jsx` ✅ **IMPLEMENTADO** (integrado na toolbar)
- [ ] `GPTAnalysisDetail.tsx` → `GPTAnalysisDetail.jsx` 🔄 **PENDENTE** (aba GPT)
- [ ] `GPTConfig.tsx` → `GPTConfig.jsx` 🔄 **PENDENTE** (aba GPT)
- [ ] `GPTIntegration.tsx` → `GPTIntegration.jsx` 🔄 **PENDENTE** (aba GPT)
- [ ] `RelatorioAgente.tsx` → `RelatorioAgente.jsx` 🔄 **PENDENTE** (aba Relatório Agente)
- [ ] `RelatorioGestao.tsx` → `RelatorioGestao.jsx` 🔄 **PENDENTE** (aba Relatório Gestão)
- [x] `AcessoForm.tsx` → `AcessoForm.jsx` ✅ **IMPLEMENTADO** (integrado no modal)

## 🔍 COMPONENTES ENCONTRADOS E SUAS FUNCIONALIDADES

### **1. RelatorioAgente.tsx** (QUALIDADE/src/components/)
**Funcionalidades Identificadas:**
- ✅ Seleção de colaborador via dropdown
- ✅ Filtros por período (mês/ano)
- ✅ Cálculo de métricas (média avaliador, média GPT, tendência)
- ✅ Visualização de histórico de avaliações
- ✅ Indicadores visuais de performance
- ✅ Gráficos de evolução (últimas 3 avaliações)
- ✅ Sistema de tendência (melhorando/piorando/estável)

**Funções de Suporte:**
- `gerarRelatorioAgente()` - já implementada em `qualidadeStorage.js`
- `getAvaliacoesPorColaborador()` - já implementada
- `getFuncionarioById()` - já implementada

### **2. RelatorioGestao.tsx** (QUALIDADE/src/components/)
**Funcionalidades Identificadas:**
- ✅ Filtros por mês/ano
- ✅ Ranking de colaboradores (top 3 melhores/piores)
- ✅ Estatísticas gerais (média da equipe, total de avaliações)
- ✅ Visualização de performance por colaborador
- ✅ Indicadores visuais de classificação (🥇🥈🥉)
- ✅ Cards de resumo estatístico
- ✅ Sistema de cores por performance

**Funções de Suporte:**
- `gerarRelatorioGestao()` - já implementada em `qualidadeStorage.js`
- `getAvaliacoesPorMesAno()` - já implementada

### **3. GPTIntegration.tsx** (QUALIDADE/src/components/)
**Funcionalidades Identificadas:**
- ✅ Verificação de arquivo de áudio (Base64, Google Drive, File object)
- ✅ Botão de análise GPT com estados (loading, error, success)
- ✅ Integração com `gptService.js` existente
- ✅ Sistema de moderação de resultados
- ✅ Exibição detalhada de resultados da IA
- ✅ Configuração de API GPT
- ✅ Fallback para análise simulada
- ✅ Salvamento de resultados no storage

**Funções de Suporte:**
- `analyzeCallWithGPT()` - já implementada em `gptService.js`
- `salvarAvaliacaoGPT()` - já implementada em `qualidadeStorage.js`
- `getAvaliacaoGPT()` - já implementada

## 🎵 FUNCIONALIDADES DE UPLOAD DE ÁUDIO JÁ EXISTENTES

### **Funções de Upload Disponíveis:**
- ✅ `saveAudioFile()` - função principal de upload (QUALIDADE/src/utils/googleDrive.ts)
- ✅ `convertFileToBase64()` - conversão para Base64
- ✅ `saveAudioFileToBlob()` - upload para Vercel Blob
- ✅ `isFileTooLarge()` - validação de tamanho
- ✅ `shouldUseGoogleDrive()` - lógica de seleção de storage
- ✅ `shouldUseVercelBlob()` - lógica para Vercel Blob

### **Configurações de Upload:**
- ✅ **Formatos aceitos:** MP3, WAV, MPEG, WMA, AAC
- ✅ **Tamanho máximo:** 50MB
- ✅ **Storage automático:** localStorage (< 3MB) → Vercel Blob (> 3MB) → Google Drive (fallback)
- ✅ **Validação de tipos MIME:** `audio/wav`, `audio/mp3`, `audio/mpeg`, `audio/wma`, `audio/aac`

### **Implementação Atual no AvaliacaoForm.tsx:**
- ✅ Input de arquivo com validação
- ✅ Verificação de tamanho e formato
- ✅ Conversão para Base64
- ✅ Integração com formulário de avaliação

### **Estado Atual do Botão de Áudio:**
- ❌ **Problema:** Botão `MicOff` está desabilitado e não funcional
- ❌ **Falta:** Modal de upload de áudio
- ❌ **Falta:** Integração com funções de upload existentes
- ❌ **Falta:** Atualização visual do botão após upload

### Da pasta `QUALIDADE/src/utils/`:
- [ ] `storage.ts` → `qualidadeStorage.js`
- [ ] `export.ts` → `qualidadeExport.js`
- [ ] `autoSync.ts` → `qualidadeSync.js`
- [ ] `googleDrive.ts` → `qualidadeGoogleDrive.js`
- [ ] `vercelBlob.ts` → `qualidadeVercelBlob.js`

### Da pasta `QUALIDADE/src/services/`:
- [ ] `gptService.ts` → `gptService.js`

---

## 🎨 ADAPTAÇÕES NECESSÁRIAS

### TypeScript → JavaScript:
- [ ] Converter interfaces para JSDoc ou comentários
- [ ] Remover tipagem estática
- [ ] Adaptar imports/exports
- [ ] Converter enums para constantes

### Tailwind → Material-UI:
- [ ] Converter classes Tailwind para sx props
- [ ] Adaptar componentes para MUI
- [ ] Manter funcionalidade e layout
- [ ] Aplicar LAYOUT_GUIDELINES

### Lucide React → Material-UI Icons:
- [ ] Substituir ícones do Lucide por MUI Icons
- [ ] Manter semântica dos ícones
- [ ] Ajustar tamanhos e cores

---

## 🔧 CONFIGURAÇÕES NECESSÁRIAS

### Dependências:
- [ ] Verificar se todas as dependências estão instaladas
- [ ] Adicionar dependências faltantes se necessário
- [ ] Configurar variáveis de ambiente

### Rotas:
- [ ] Adicionar rotas no `App.jsx`
- [ ] Configurar proteção de rotas
- [ ] Testar navegação

### Storage:
- [ ] Configurar localStorage
- [ ] Implementar backup automático
- [ ] Configurar sincronização

---

## ✅ CRITÉRIOS DE SUCESSO

### Funcionalidade:
- [ ] Todos os CRUDs funcionando
- [ ] Upload de arquivos funcionando
- [ ] Relatórios gerando corretamente
- [ ] Análise GPT funcionando
- [ ] Exportação/importação funcionando

### Interface:
- [ ] Layout consistente com LAYOUT_GUIDELINES
- [ ] Responsividade mantida
- [ ] Efeitos hover aplicados
- [ ] Navegação intuitiva

### Performance:
- [ ] Carregamento rápido
- [ ] Sem erros no console
- [ ] Sincronização eficiente
- [ ] Backup automático funcionando

---

## 📅 CRONOGRAMA SUGERIDO

### Semana 1: Estrutura Base
- Dias 1-2: Migrar tipos e serviços
- Dias 3-4: Configurar storage e sincronização
- Dia 5: Testes básicos

### Semana 2: Página de Funcionários
- Dias 1-2: Implementar página base e lista
- Dias 3-4: Implementar formulários e CRUD
- Dia 5: Testes e ajustes

### Semana 3: Página de Qualidade
- Dias 1-2: Implementar navegação e avaliações
- Dias 3-4: Implementar relatórios e GPT
- Dia 5: Testes e ajustes

### Semana 4: Integração e Polimento
- Dias 1-2: Aplicar LAYOUT_GUIDELINES
- Dias 3-4: Testes finais e correções
- Dia 5: Documentação e deploy

---

**Status:** 📋 Plano atualizado - Upload de áudio para GPT implementado
**Última atualização:** 2024-12-19
**Responsável:** VeloHub Development Team
