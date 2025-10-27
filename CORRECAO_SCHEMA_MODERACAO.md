# Correção de Schema - Campos de Moderação

<!-- VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: Lucas Gravina - VeloHub Development Team -->

## 🚨 Problema Identificado

Os campos `moderado` e `observacoesModeracao` foram incorretamente adicionados ao schema `qualidade_avaliacoes` quando deveriam estar apenas no schema `qualidade_avaliacoes_gpt`.

## 📋 Análise do Problema

### Campos Incorretos no Schema `qualidade_avaliacoes`:
- `moderado: Boolean` - Se foi moderado
- `observacoesModeracao: String` - Observações da moderação

### Motivo da Correção:
- **Moderação é uma característica da análise GPT**, não da avaliação manual
- **Avaliações manuais** são feitas por avaliadores humanos e não precisam de moderação
- **Análises GPT** podem precisar de moderação/revisão humana

## 🔧 Correções Necessárias no Backend

### 1. Modelo `QualidadeAvaliacao.js`

**Remover os seguintes campos:**
```javascript
// REMOVER ESTES CAMPOS:
moderado: {
  type: Boolean,
  default: false
},
observacoesModeracao: {
  type: String,
  default: ''
}
```

**Schema correto deve conter apenas:**
```javascript
const QualidadeAvaliacaoSchema = new mongoose.Schema({
  colaboradorId: { type: String, required: true },
  colaboradorNome: { type: String, required: true },
  avaliador: { type: String, required: true },
  mes: { type: String, required: true },
  ano: { type: Number, required: true },
  audioUrl: { type: String },
  observacoes: { type: String },
  
  // Critérios de avaliação
  escutaAtiva: { type: Boolean, default: false },
  identificacaoProblema: { type: Boolean, default: false },
  clarezaObjetividade: { type: Boolean, default: false },
  resolucaoQuestao: { type: Boolean, default: false },
  dominioAssunto: { type: Boolean, default: false },
  empatiaCordialidade: { type: Boolean, default: false },
  direcionouPesquisa: { type: Boolean, default: false },
  procedimentoIncorreto: { type: Boolean, default: false },
  encerramentoBrusco: { type: Boolean, default: false },
  
  // Pontuação e data
  pontuacaoTotal: { type: Number, default: 0 },
  dataLigacao: { type: Date },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 2. Modelo `QualidadeAvaliacaoGPT.js`

**Manter os campos de moderação apenas aqui:**
```javascript
const QualidadeAvaliacaoGPTSchema = new mongoose.Schema({
  avaliacaoId: { type: String, required: true },
  
  // Análise GPT
  criteriosGPT: {
    escutaAtiva: { type: Boolean, default: false },
    identificacaoProblema: { type: Boolean, default: false },
    clarezaObjetividade: { type: Boolean, default: false },
    resolucaoQuestao: { type: Boolean, default: false },
    dominioAssunto: { type: Boolean, default: false },
    empatiaCordialidade: { type: Boolean, default: false },
    direcionouPesquisa: { type: Boolean, default: false },
    procedimentoIncorreto: { type: Boolean, default: false },
    encerramentoBrusco: { type: Boolean, default: false }
  },
  
  pontuacaoGPT: { type: Number, default: 0 },
  analiseGPT: { type: String },
  
  // CAMPOS DE MODERAÇÃO (MANTER APENAS AQUI):
  moderado: { type: Boolean, default: false },
  observacoesModeracao: { type: String, default: '' },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

## 📝 Exemplos de Payloads Corretos

### POST/PUT `/api/qualidade/avaliacoes` - Avaliação Manual
```json
{
  "colaboradorId": "123",
  "colaboradorNome": "João Silva",
  "avaliador": "Maria Santos",
  "mes": "dezembro",
  "ano": 2024,
  "audioUrl": "https://...",
  "observacoes": "Boa performance",
  "escutaAtiva": true,
  "identificacaoProblema": true,
  "clarezaObjetividade": true,
  "resolucaoQuestao": false,
  "dominioAssunto": true,
  "empatiaCordialidade": true,
  "direcionouPesquisa": false,
  "procedimentoIncorreto": false,
  "encerramentoBrusco": false,
  "dataLigacao": "2024-12-15T10:30:00.000Z"
}
```

### POST/PUT `/api/qualidade/avaliacoes-gpt` - Análise GPT
```json
{
  "avaliacaoId": "abc123",
  "criteriosGPT": {
    "escutaAtiva": true,
    "identificacaoProblema": true,
    "clarezaObjetividade": false,
    "resolucaoQuestao": true,
    "dominioAssunto": true,
    "empatiaCordialidade": true,
    "direcionouPesquisa": false,
    "procedimentoIncorreto": false,
    "encerramentoBrusco": false
  },
  "pontuacaoGPT": 75,
  "analiseGPT": "Análise detalhada...",
  "moderado": false,
  "observacoesModeracao": ""
}
```

## ✅ Checklist de Implementação Backend

- [ ] Remover campos `moderado` e `observacoesModeracao` do modelo `QualidadeAvaliacao.js`
- [ ] Verificar que campos de moderação estão apenas no modelo `QualidadeAvaliacaoGPT.js`
- [ ] Atualizar validações de schema nos endpoints
- [ ] Testar endpoints POST/PUT para avaliações manuais
- [ ] Testar endpoints POST/PUT para análises GPT
- [ ] Verificar que migração de dados existentes não quebra funcionalidades
- [ ] Atualizar documentação da API

## 🔄 Impacto da Correção

### Positivo:
- ✅ Separação clara entre avaliações manuais e análises GPT
- ✅ Schema mais limpo e semanticamente correto
- ✅ Prevenção de confusão conceitual
- ✅ Melhor organização dos dados

### Compatibilidade:
- ⚠️ Avaliações existentes com campos de moderação precisam ser migradas
- ⚠️ Frontend já foi corrigido para não enviar esses campos
- ✅ Novas avaliações funcionarão corretamente

## 📞 Contato

Para dúvidas sobre esta correção, contatar:
- **Frontend Team:** Lucas Gravina
- **Data:** 2024-12-19
- **Versão:** v1.0.0
