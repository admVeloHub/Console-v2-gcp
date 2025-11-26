# Plano de Deprecação: Collection `qualidade_avaliacoes_gpt`

## Análise da Redundância

### Collection Redundante: `qualidade_avaliacoes_gpt`
**Endpoint:** POST `/api/qualidade/avaliacoes-gpt`

### Collection Principal: `audio_analise_results`
**Fonte única de verdade para análises GPT**

### Comparação de Dados

| Campo `qualidade_avaliacoes_gpt` | Campo `audio_analise_results.gptAnalysis` | Status |
|----------------------------------|-------------------------------------------|--------|
| `analiseGPT` (String) | `analysis` (String) | ✅ Redundante |
| `pontuacaoGPT` (0-100) | `pontuacao` (-160 a 100) | ⚠️ Faixa diferente |
| `criteriosGPT` (Object) | `criterios` (Object) | ✅ Redundante |
| `confianca` (0-100) | `confianca` (0-100) | ✅ Redundante |
| `palavrasCriticas` (Array) | `palavrasCriticas` (Array) | ✅ Redundante |
| `calculoDetalhado` (Array) | ❌ Não existe | ⚠️ Único campo adicional |
| `avaliacao_id` (ObjectId) | `avaliacaoMonitorId` (ObjectId) | ✅ Mesma referência |

## Endpoints Afetados

### Backend (`EXP - SKYNET + GPT/backend/routes/qualidade.js`)

1. **POST `/api/qualidade/avaliacoes-gpt`** (linha 1122)
   - Criar nova avaliação GPT
   - **STATUS:** Redundante - dados já existem em `audio_analise_results`

2. **GET `/api/qualidade/avaliacoes-gpt`** (linha 1037)
   - Listar todas as avaliações GPT
   - **STATUS:** Pode ser substituído por busca em `audio_analise_results`

3. **GET `/api/qualidade/avaliacoes-gpt/:id`** (linha 1066)
   - Obter avaliação GPT por `_id`
   - **STATUS:** Pode ser substituído por busca em `audio_analise_results`

4. **GET `/api/qualidade/avaliacoes-gpt/avaliacao/:avaliacao_id`** (linha 1094)
   - Obter avaliação GPT por `avaliacao_id`
   - **STATUS:** Pode ser substituído por busca em `audio_analise_results` usando `avaliacaoMonitorId`

5. **PUT `/api/qualidade/avaliacoes-gpt/:id`** (linha 1169)
   - Atualizar avaliação GPT
   - **STATUS:** Redundante - atualizações devem ser feitas em `audio_analise_results.gptAnalysis`

6. **DELETE `/api/qualidade/avaliacoes-gpt/:id`** (linha 1221)
   - Deletar avaliação GPT
   - **STATUS:** Pode ser removido se não houver dependências

### Frontend (`EXP - Console + GPT/src/services/qualidadeAPI.js`)

1. **`createAvaliacaoGPT`** (linha 828)
   - **STATUS:** ❌ NÃO ESTÁ SENDO USADO
   - Função existe mas não é chamada em nenhum lugar do código
   - **AÇÃO:** Pode ser removida imediatamente

2. **`getAvaliacoesGPT`** (linha 785)
   - Listar avaliações GPT
   - **STATUS:** ⚠️ NÃO ESTÁ SENDO USADO
   - **AÇÃO:** Pode ser removida

3. **`getAvaliacaoGPTById`** (linha 806)
   - Obter avaliação GPT por ID
   - **STATUS:** ⚠️ NÃO ESTÁ SENDO USADO
   - **AÇÃO:** Pode ser removida

4. **`getAvaliacaoGPTByAvaliacaoId`** (linha 818)
   - Obter avaliação GPT por `avaliacao_id`
   - **STATUS:** ✅ ESTÁ SENDO USADO
   - **LOCAL:** `qualidadeAPI.js` linhas 638 e 657
   - **CONTEXTO:** Usado em função que busca avaliações GPT para adicionar aos dados das avaliações (para cards e gráficos)
   - **AÇÃO:** Substituir por busca em `audio_analise_results` via endpoint `/api/audio-analise/result/:id`

5. **`updateAvaliacaoGPT`** (linha 840)
   - Atualizar avaliação GPT
   - **STATUS:** ⚠️ NÃO ESTÁ SENDO USADO
   - **AÇÃO:** Pode ser removida

6. **`deleteAvaliacaoGPT`** (linha 852)
   - Deletar avaliação GPT
   - **STATUS:** ⚠️ NÃO ESTÁ SENDO USADO
   - **AÇÃO:** Pode ser removida

## Plano de Deprecação

### Fase 1: Análise e Preparação

1. **Verificar uso atual**
   - Buscar todas as chamadas para `createAvaliacaoGPT` no frontend
   - Verificar se há código legado usando os endpoints GET/PUT/DELETE
   - Identificar dependências externas (se houver)

2. **Migração de dados (se necessário)**
   - Verificar se há dados em `qualidade_avaliacoes_gpt` que não existem em `audio_analise_results`
   - Criar script de migração para mover `calculoDetalhado` para `audio_analise_results.gptAnalysis` (se necessário)
   - Backup da collection antes de qualquer alteração

### Fase 2: Deprecação Gradual

1. **Marcar endpoints como DEPRECATED**
   - Adicionar aviso de deprecação nos endpoints GET/POST /api/qualidade/avaliacoes-gpt
   - Retornar erro 410 (Gone) ou 301 (Moved Permanently) com mensagem indicando uso de `audio_analise_results`
   - Manter endpoints GET funcionando temporariamente para compatibilidade

2. **Atualizar frontend**
   - ✅ `DetalhesAnaliseModal` já está usando `audio_analise_results` corretamente
   - ⚠️ **CRÍTICO:** Atualizar `getAvaliacaoGPTByAvaliacaoId` em `qualidadeAPI.js` (linhas 638, 657)
     - Substituir busca em `qualidade_avaliacoes_gpt` por busca em `audio_analise_results`
     - Usar endpoint `/api/audio-analise/result/:id` ao invés de `/api/qualidade/avaliacoes-gpt/avaliacao/:avaliacao_id`
     - Mapear dados de `audio_analise_results.gptAnalysis` para o formato esperado
   - Remover funções não utilizadas: `createAvaliacaoGPT`, `getAvaliacoesGPT`, `getAvaliacaoGPTById`, `updateAvaliacaoGPT`, `deleteAvaliacaoGPT`

3. **Documentação**
   - Atualizar documentação da API
   - Adicionar nota de deprecação no código
   - Criar guia de migração para desenvolvedores

### Fase 3: Remoção Completa

1. **Remover endpoints do backend**
   - Remover POST `/api/qualidade/avaliacoes-gpt`
   - Remover PUT `/api/qualidade/avaliacoes-gpt/:id`
   - Remover DELETE `/api/qualidade/avaliacoes-gpt/:id`
   - Manter GET endpoints temporariamente com aviso de deprecação (ou remover se não houver uso)

2. **Remover código do frontend**
   - Remover `createAvaliacaoGPT` de `qualidadeAPI.js`
   - Remover outras funções relacionadas se não estiverem em uso
   - Atualizar imports e referências

3. **Remover modelo e collection**
   - Remover modelo `QualidadeAvaliacaoGPT` do backend
   - Considerar manter collection vazia por período de segurança (30-60 dias)
   - Após período de segurança, arquivar ou deletar collection

## Pontos de Atenção

### Diferenças Importantes

1. **Faixa de Pontuação:**
   - `qualidade_avaliacoes_gpt.pontuacaoGPT`: 0-100
   - `audio_analise_results.gptAnalysis.pontuacao`: -160 a 100
   - **Ação:** Verificar se há necessidade de normalização

2. **Campo `calculoDetalhado`:**
   - Existe apenas em `qualidade_avaliacoes_gpt`
   - **Ação:** Decidir se deve ser migrado para `audio_analise_results.gptAnalysis` ou descartado

3. **Campo `recomendacoes`:**
   - Existe apenas em `audio_analise_results.gptAnalysis`
   - **Ação:** Verificar se é necessário manter

### Compatibilidade

- Manter endpoints GET funcionando durante período de transição
- Garantir que `DetalhesAnaliseModal` funcione com ambas as fontes durante migração
- Criar função helper para buscar dados de qualquer fonte durante transição

## Cronograma Sugerido

1. **Semana 1:** Análise completa e verificação de uso
2. **Semana 2:** Implementar avisos de deprecação e atualizar frontend
3. **Semana 3:** Período de observação e testes
4. **Semana 4:** Remoção completa dos endpoints POST/PUT/DELETE
5. **Semana 5-6:** Período de segurança mantendo GET endpoints
6. **Semana 7:** Remoção completa do código e modelo

## Arquivos a Modificar

### Backend
- `EXP - SKYNET + GPT/backend/routes/qualidade.js` - Remover/deprecar endpoints
  - POST `/api/qualidade/avaliacoes-gpt` (linha 1122) - REMOVER
  - PUT `/api/qualidade/avaliacoes-gpt/:id` (linha 1169) - REMOVER
  - DELETE `/api/qualidade/avaliacoes-gpt/:id` (linha 1221) - REMOVER
  - GET `/api/qualidade/avaliacoes-gpt` (linha 1037) - DEPRECAR (manter temporariamente)
  - GET `/api/qualidade/avaliacoes-gpt/:id` (linha 1066) - DEPRECAR (manter temporariamente)
  - GET `/api/qualidade/avaliacoes-gpt/avaliacao/:avaliacao_id` (linha 1094) - DEPRECAR (manter temporariamente)
- `EXP - SKYNET + GPT/backend/models/QualidadeAvaliacaoGPT.js` - Marcar como deprecated ou remover

### Frontend
- `EXP - Console + GPT/src/services/qualidadeAPI.js` - Atualizar funções
  - `getAvaliacaoGPTByAvaliacaoId` (linha 818) - SUBSTITUIR por busca em `audio_analise_results`
  - `createAvaliacaoGPT` (linha 828) - REMOVER (não está sendo usado)
  - `getAvaliacoesGPT` (linha 785) - REMOVER (não está sendo usado)
  - `getAvaliacaoGPTById` (linha 806) - REMOVER (não está sendo usado)
  - `updateAvaliacaoGPT` (linha 840) - REMOVER (não está sendo usado)
  - `deleteAvaliacaoGPT` (linha 852) - REMOVER (não está sendo usado)
- `EXP - Console + GPT/src/services/qualidadeAPI.js` (linhas 638, 657) - Atualizar chamadas para usar `audio_analise_results`
- `EXP - Console + GPT/src/components/qualidade/DetalhesAnaliseModal.jsx` - Já está usando `audio_analise_results` corretamente
- Verificar outros componentes que possam usar `qualidade_avaliacoes_gpt`

## Scripts de Migração Necessários

1. **Script de verificação:** Verificar quantos registros existem em cada collection
2. **Script de migração:** Migrar `calculoDetalhado` se necessário
3. **Script de validação:** Validar que todos os dados foram migrados corretamente

## Implementação Detalhada

### Passo 1: Substituir `getAvaliacaoGPTByAvaliacaoId`

**Arquivo:** `EXP - Console + GPT/src/services/qualidadeAPI.js`

**Função atual (linha 816):**
```javascript
export const getAvaliacaoGPTByAvaliacaoId = async (avaliacaoId) => {
  try {
    const response = await gptAPI.get(`/avaliacoes-gpt/avaliacao/${avaliacaoId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};
```

**Nova implementação:**
```javascript
export const getAvaliacaoGPTByAvaliacaoId = async (avaliacaoId) => {
  try {
    // Buscar de audio_analise_results ao invés de qualidade_avaliacoes_gpt
    const response = await fetch(`${API_URL}/api/audio-analise/result/${avaliacaoId}`);
    if (!response.ok) return null;
    
    const result = await response.json();
    if (!result.success || !result.data?.gptAnalysis) return null;
    
    // Mapear dados de audio_analise_results.gptAnalysis para formato esperado
    const gptAnalysis = result.data.gptAnalysis;
    return {
      _id: result.data._id,
      avaliacao_id: result.data.avaliacaoMonitorId,
      analiseGPT: gptAnalysis.analysis || '',
      pontuacaoGPT: gptAnalysis.pontuacao || 0,
      criteriosGPT: gptAnalysis.criterios || {},
      confianca: gptAnalysis.confianca || 0,
      palavrasCriticas: gptAnalysis.palavrasCriticas || [],
      calculoDetalhado: [], // Campo não existe em audio_analise_results
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt
    };
  } catch (error) {
    console.error('❌ Erro ao carregar análise GPT de audio_analise_results:', error);
    return null;
  }
};
```

### Passo 2: Adicionar Avisos de Deprecação nos Endpoints

**Arquivo:** `EXP - SKYNET + GPT/backend/routes/qualidade.js`

**POST `/api/qualidade/avaliacoes-gpt` (linha 1122):**
```javascript
router.post('/avaliacoes-gpt', validateAvaliacaoGPT, async (req, res) => {
  // DEPRECATED: Este endpoint está deprecado. Use audio_analise_results ao invés.
  return res.status(410).json({
    success: false,
    message: 'Este endpoint foi deprecado. Os dados de análise GPT agora estão em audio_analise_results. Use GET /api/audio-analise/result/:id',
    deprecated: true,
    alternative: '/api/audio-analise/result/:id'
  });
});
```

### Passo 3: Mapeamento de Dados

**Estrutura de mapeamento:**
- `qualidade_avaliacoes_gpt.analiseGPT` → `audio_analise_results.gptAnalysis.analysis`
- `qualidade_avaliacoes_gpt.pontuacaoGPT` → `audio_analise_results.gptAnalysis.pontuacao`
- `qualidade_avaliacoes_gpt.criteriosGPT` → `audio_analise_results.gptAnalysis.criterios`
- `qualidade_avaliacoes_gpt.confianca` → `audio_analise_results.gptAnalysis.confianca`
- `qualidade_avaliacoes_gpt.palavrasCriticas` → `audio_analise_results.gptAnalysis.palavrasCriticas`
- `qualidade_avaliacoes_gpt.calculoDetalhado` → ❌ Não existe em `audio_analise_results` (decidir se migrar ou descartar)

## Resumo Executivo

### Impacto
- **Alto:** Afeta funcionalidade de busca de análises GPT no frontend
- **Médio:** Requer atualização de código em `qualidadeAPI.js`
- **Baixo:** Não afeta criação de análises (já usa `audio_analise_results`)

### Risco
- **Baixo:** `createAvaliacaoGPT` não está sendo usado
- **Médio:** `getAvaliacaoGPTByAvaliacaoId` está sendo usado e precisa ser substituído
- **Alto:** Se houver código legado ou externo usando os endpoints

### Prioridade
1. **ALTA:** Substituir `getAvaliacaoGPTByAvaliacaoId` para usar `audio_analise_results`
2. **MÉDIA:** Deprecar endpoints POST/PUT/DELETE
3. **BAIXA:** Remover código não utilizado e modelo

### Benefícios
- ✅ Elimina redundância de dados
- ✅ Simplifica arquitetura (fonte única de verdade)
- ✅ Reduz manutenção (menos código para manter)
- ✅ Melhora performance (menos queries ao banco)

