# 🔍 DIAGNÓSTICO - Timeouts no Módulo Hub Analises
<!-- VERSION: v1.0.0 | DATE: 2025-02-09 | AUTHOR: VeloHub Development Team -->

## 📋 **PROBLEMAS IDENTIFICADOS**

### **1. Endpoint `/usuarios-online-offline` - Performance Crítica**

**Problema:**
- Está fazendo `HubSessions.getAll()` que busca **TODAS as sessões** do banco sem limite
- Depois filtra no código JavaScript apenas as ativas
- Com muitas sessões históricas, isso pode levar vários segundos

**Código Problemático:**
```javascript
// Linha 114 em hubAnalises.js
const sessionsResult = await HubSessions.getAll(); // ❌ Busca TODAS as sessões
```

**Impacto:**
- Se houver 10.000+ sessões históricas, a query pode levar 5-10 segundos
- Timeout de 30s pode ser atingido em casos extremos

---

### **2. Endpoint `/ciencia-por-noticia` - Problema N+1**

**Problema:**
- Busca todas as confirmações com `VelonewsAcknowledgments.getAll()`
- Depois faz um loop e para cada notícia única faz `Velonews.getById()` individualmente
- Isso é um problema clássico N+1: 1 query para confirmações + N queries para notícias

**Código Problemático:**
```javascript
// Linha 197 em hubAnalises.js
const acknowledgmentsResult = await VelonewsAcknowledgments.getAll(); // ❌ Busca TODAS

// Linha 211-226 - Loop com queries individuais
for (const acknowledgment of acknowledgmentsResult.data) {
  // ...
  const newsResult = await Velonews.getById(newsId.toString()); // ❌ Query individual por notícia
}
```

**Impacto:**
- Se houver 100 notícias diferentes, serão 101 queries ao banco (1 + 100)
- Cada query individual pode levar 100-500ms
- Total: 10-50 segundos apenas em queries

---

### **3. Endpoint `/hub-sessions` - Sem Limite/Paginação**

**Problema:**
- Busca todas as sessões sem limite ou paginação
- Frontend recebe todos os dados de uma vez

**Código Problemático:**
```javascript
// Linha 35 em hubAnalises.js
result = await HubSessions.getAll(); // ❌ Sem limite
```

**Impacto:**
- Com muitas sessões, a resposta pode ser muito grande
- Transferência de dados pode levar vários segundos
- Processamento no frontend também fica lento

---

### **4. Falta de Índices MongoDB**

**Problemas:**
- Não há índices otimizados para as queries mais comuns
- Queries por `isActive`, `colaboradorNome`, `newsId` podem ser lentas sem índices

**Índices Necessários:**
- `hub_sessions`: `{ isActive: 1, colaboradorNome: 1 }`
- `hub_sessions`: `{ createdAt: -1 }`
- `velonews_acknowledgments`: `{ newsId: 1, acknowledgedAt: -1 }`
- `velonews_acknowledgments`: `{ userEmail: 1 }`

---

## ✅ **SOLUÇÕES PROPOSTAS**

### **Solução 1: Otimizar `/usuarios-online-offline`**

**Mudança:**
- Buscar apenas sessões ativas diretamente no MongoDB
- Usar `getActiveSessions()` em vez de `getAll()` + filtro

**Código Otimizado:**
```javascript
// Em vez de:
const sessionsResult = await HubSessions.getAll();
const activeSessions = sessionsResult.data.filter(s => s.isActive === true);

// Usar:
const sessionsResult = await HubSessions.getActiveSessions();
```

**Benefício:**
- Reduz dados transferidos em 90%+ (apenas ativas)
- Query MongoDB mais rápida com índice em `isActive`
- Reduz tempo de processamento de segundos para milissegundos

---

### **Solução 2: Resolver Problema N+1 em `/ciencia-por-noticia`**

**Mudança:**
- Buscar todas as notícias de uma vez usando `$in` ou aggregation
- Fazer join no código em vez de queries individuais

**Código Otimizado:**
```javascript
// 1. Buscar confirmações
const acknowledgmentsResult = await VelonewsAcknowledgments.getAll();

// 2. Extrair IDs únicos de notícias
const newsIds = [...new Set(acknowledgmentsResult.data.map(a => a.newsId.toString()))];

// 3. Buscar TODAS as notícias de uma vez
const newsMap = new Map();
if (newsIds.length > 0) {
  const newsResult = await Velonews.getByIds(newsIds); // ✅ Nova função batch
  newsResult.data.forEach(news => {
    newsMap.set(news._id.toString(), news);
  });
}

// 4. Processar confirmações usando o mapa
for (const acknowledgment of acknowledgmentsResult.data) {
  const newsId = acknowledgment.newsId.toString();
  const news = newsMap.get(newsId);
  // ...
}
```

**Benefício:**
- Reduz de N+1 queries para 2 queries (confirmações + notícias)
- Reduz tempo de 10-50s para 1-2s

---

### **Solução 3: Adicionar Paginação/Limite em `/hub-sessions`**

**Mudança:**
- Adicionar parâmetros de paginação (`limit`, `skip`)
- Limitar resultados padrão (ex: últimos 1000)

**Código Otimizado:**
```javascript
// Adicionar método no HubSessions.js
async getAllPaginated(limit = 1000, skip = 0) {
  const collection = this.getCollection();
  const sessions = await collection
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .toArray();
  
  return {
    success: true,
    data: sessions,
    count: sessions.length,
    limit,
    skip,
    hasMore: sessions.length === limit
  };
}
```

**Benefício:**
- Resposta mais rápida (menos dados)
- Frontend pode carregar mais dados sob demanda
- Evita timeouts mesmo com muitos dados históricos

---

### **Solução 4: Criar Índices MongoDB**

**Script de Índices:**
```javascript
// Executar no MongoDB
db.hub_sessions.createIndex({ isActive: 1, colaboradorNome: 1 });
db.hub_sessions.createIndex({ createdAt: -1 });
db.hub_sessions.createIndex({ userEmail: 1 });

db.velonews_acknowledgments.createIndex({ newsId: 1, acknowledgedAt: -1 });
db.velonews_acknowledgments.createIndex({ userEmail: 1 });
db.velonews_acknowledgments.createIndex({ acknowledgedAt: -1 });
```

**Benefício:**
- Queries 10-100x mais rápidas
- Reduz carga no servidor MongoDB
- Melhora tempo de resposta geral

---

## 📊 **ESTIMATIVA DE MELHORIA**

| Endpoint | Tempo Atual | Tempo Otimizado | Melhoria |
|----------|-------------|-----------------|----------|
| `/usuarios-online-offline` | 5-10s | 0.5-1s | **90%** |
| `/ciencia-por-noticia` | 10-50s | 1-2s | **95%** |
| `/hub-sessions` | 3-8s | 0.5-1s | **85%** |

---

## 🚀 **PRIORIDADE DE IMPLEMENTAÇÃO**

1. **🔴 CRÍTICO:** Solução 2 (N+1) - Maior impacto
2. **🟡 ALTA:** Solução 1 (usuarios-online-offline) - Muito usado
3. **🟡 ALTA:** Solução 4 (Índices) - Melhora geral
4. **🟢 MÉDIA:** Solução 3 (Paginação) - Melhora UX

---

## 📍 **DIVISÃO DE RESPONSABILIDADES: CONSOLE vs SKYNET**

### **🔵 SKYNET (Backend) - Mudanças Necessárias**

#### **Solução 1: Otimizar `/usuarios-online-offline`**
- **Arquivo:** `Dev - SKYNET/backend/routes/hubAnalises.js`
- **Linha:** ~114
- **Mudança:** Trocar `HubSessions.getAll()` por `HubSessions.getActiveSessions()`
- **Status:** ✅ Método `getActiveSessions()` já existe no modelo

#### **Solução 2: Resolver Problema N+1 em `/ciencia-por-noticia`**
- **Arquivo 1:** `Dev - SKYNET/backend/models/Velonews.js`
- **Mudança:** Criar novo método `getByIds(ids)` para busca em batch
- **Arquivo 2:** `Dev - SKYNET/backend/routes/hubAnalises.js`
- **Linha:** ~191-276
- **Mudança:** Refatorar lógica para usar `getByIds()` em vez de loop com `getById()`

#### **Solução 3: Adicionar Paginação em `/hub-sessions`**
- **Arquivo 1:** `Dev - SKYNET/backend/models/HubSessions.js`
- **Mudança:** Criar novo método `getAllPaginated(limit, skip)`
- **Arquivo 2:** `Dev - SKYNET/backend/routes/hubAnalises.js`
- **Linha:** ~10-56
- **Mudança:** Modificar endpoint para aceitar parâmetros `limit` e `skip` e usar `getAllPaginated()`

---

### **🟢 CONSOLE (Frontend) - Mudanças Necessárias**

#### **Solução 3: Adicionar Paginação em `/hub-sessions`** (Opcional)
- **Arquivo:** `Dev - Console/src/pages/HubAnalisesPage.jsx`
- **Mudança:** Adicionar controles de paginação se necessário (já existe paginação no frontend)
- **Status:** ⚠️ Paginação já existe no frontend, pode precisar ajustar para usar parâmetros do backend

---

### **⚙️ INFRAESTRUTURA - Execução Direta**

#### **Solução 4: Criar Índices MongoDB**
- **Local:** MongoDB Atlas / MongoDB Local
- **Tipo:** Script de execução direta (não código)
- **Mudança:** Executar comandos `createIndex()` diretamente no MongoDB
- **Responsável:** DBA ou desenvolvedor com acesso ao MongoDB

---

## 📝 **PRÓXIMOS PASSOS POR PROJETO**

### **SKYNET (Backend) - Ordem de Implementação:**

1. ✅ **CRÍTICO:** Criar função `Velonews.getByIds()` em `models/Velonews.js`
2. ✅ **CRÍTICO:** Refatorar endpoint `/ciencia-por-noticia` em `routes/hubAnalises.js` (linha ~191)
3. ✅ **ALTA:** Otimizar endpoint `/usuarios-online-offline` em `routes/hubAnalises.js` (linha ~114)
4. ✅ **MÉDIA:** Criar método `getAllPaginated()` em `models/HubSessions.js`
5. ✅ **MÉDIA:** Adicionar suporte a paginação em endpoint `/hub-sessions` em `routes/hubAnalises.js` (linha ~10)

### **CONSOLE (Frontend) - Ajustes Opcionais:**

1. ⚠️ **OPCIONAL:** Verificar se paginação do frontend está compatível com novos parâmetros do backend
2. ⚠️ **OPCIONAL:** Ajustar timeout se necessário (já está em 30s)

### **INFRAESTRUTURA:**

1. ✅ **ALTA:** Executar script de criação de índices no MongoDB
2. ✅ **MÉDIA:** Monitorar performance após criação dos índices

---

## 📋 **RESUMO: ONDE FAZER AS MUDANÇAS**

| Solução | SKYNET (Backend) | CONSOLE (Frontend) | Infraestrutura |
|---------|------------------|-------------------|----------------|
| **1. usuarios-online-offline** | ✅ `routes/hubAnalises.js` | ❌ Nenhuma | ❌ Nenhuma |
| **2. ciencia-por-noticia (N+1)** | ✅ `models/Velonews.js`<br>✅ `routes/hubAnalises.js` | ❌ Nenhuma | ❌ Nenhuma |
| **3. Paginação hub-sessions** | ✅ `models/HubSessions.js`<br>✅ `routes/hubAnalises.js` | ⚠️ Opcional | ❌ Nenhuma |
| **4. Índices MongoDB** | ❌ Nenhuma | ❌ Nenhuma | ✅ MongoDB direto |

---

## ✅ **IMPLEMENTAÇÕES REALIZADAS**

### **🔵 SKYNET (Backend) - Concluído**

#### **✅ Solução 1: Otimizar `/usuarios-online-offline`**
- **Arquivo:** `Dev - SKYNET/backend/routes/hubAnalises.js`
- **Versão:** v1.1.0
- **Mudança:** Trocado `HubSessions.getAll()` por `HubSessions.getActiveSessions()`
- **Resultado:** Reduz busca de todas as sessões para apenas ativas (90%+ menos dados)

#### **✅ Solução 2: Resolver Problema N+1 em `/ciencia-por-noticia`**
- **Arquivo 1:** `Dev - SKYNET/backend/models/Velonews.js` (v3.5.0)
- **Mudança:** Criado método `getByIds(ids)` para busca em batch
- **Arquivo 2:** `Dev - SKYNET/backend/routes/hubAnalises.js` (v1.1.0)
- **Mudança:** Refatorado endpoint para usar `getByIds()` em vez de loop com `getById()`
- **Resultado:** Reduz de N+1 queries para 2 queries (95%+ redução de tempo)

#### **✅ Solução 3: Adicionar Paginação em `/hub-sessions`**
- **Arquivo 1:** `Dev - SKYNET/backend/models/HubSessions.js` (v1.3.0)
- **Mudança:** Criado método `getAllPaginated(limit, skip)` com suporte a paginação
- **Arquivo 2:** `Dev - SKYNET/backend/routes/hubAnalises.js` (v1.1.0)
- **Mudança:** Endpoint agora aceita parâmetros `limit` e `skip` (padrão: 1000)
- **Resultado:** Resposta mais rápida, evita timeouts com grandes volumes

### **⚙️ INFRAESTRUTURA - Índices Criados**

#### **✅ Solução 4: Índices MongoDB**
- **Arquivo:** `Dev - SKYNET/backend/scripts/create-indexes-hub-analises.js`
- **Status:** ✅ **EXECUTADO COM SUCESSO** - 2025-02-09
- **Índices criados:**
  - `hub_sessions`: 
    - ✅ `isActive + colaboradorNome` (composto)
    - ✅ `createdAt` (descendente)
    - ✅ `userEmail`
    - ✅ `loginTimestamp` (descendente)
  - `velonews_acknowledgments`: 
    - ✅ `newsId + acknowledgedAt` (composto)
    - ✅ `userEmail`
    - ✅ `acknowledgedAt` (descendente)
- **Resultado:** Todos os 7 índices foram criados com sucesso no MongoDB

---

## 📊 **RESULTADOS ESPERADOS**

Após implementação completa (incluindo índices):

| Endpoint | Tempo Antes | Tempo Depois | Melhoria |
|----------|-------------|--------------|----------|
| `/usuarios-online-offline` | 5-10s | 0.5-1s | **90%** ✅ |
| `/ciencia-por-noticia` | 10-50s | 1-2s | **95%** ✅ |
| `/hub-sessions` | 3-8s | 0.5-1s | **85%** ✅ |

---

## 🚀 **PRÓXIMOS PASSOS**

1. ✅ **Concluído:** Todas as otimizações de código implementadas
2. ✅ **Concluído:** Script de criação de índices MongoDB executado (2025-02-09)
3. ⏳ **Pendente:** Testar endpoints em ambiente de produção
4. ⏳ **Pendente:** Monitorar logs e performance após deploy

---

## ✅ **STATUS FINAL**

**Status:** ✅ **COMPLETO - Todas as otimizações implementadas e índices criados**

### **Resumo da Implementação:**
- ✅ **Código otimizado:** 3 endpoints refatorados
- ✅ **Novos métodos:** `Velonews.getByIds()`, `HubSessions.getAllPaginated()`
- ✅ **Índices MongoDB:** 7 índices criados com sucesso
- ✅ **Performance esperada:** 85-95% de melhoria nos tempos de resposta

### **Próxima Ação:**
Testar os endpoints em produção e monitorar a performance para confirmar as melhorias.
