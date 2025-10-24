# Novos Critérios de Avaliação - Módulo Qualidade

<!-- VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team -->

## 📋 Resumo das Mudanças

Implementação de novos critérios de avaliação no módulo de qualidade, com ajustes nas pontuações e adição de 2 novos critérios.

## 🔄 Mudanças nos Critérios

### Critérios Modificados:
- **Escuta Ativa / Sondagem:** 25 → 15 pontos (-10)
- **Resolução Questão / Seguiu o procedimento:** 40 → 25 pontos (-15)

### Novos Critérios:
- **Clareza e Objetividade:** +10 pontos
- **Domínio no assunto abordado:** +15 pontos

### Critérios Mantidos:
- **Saudação Adequada:** +10 pontos
- **Empatia / Cordialidade:** +15 pontos
- **Direcionou para pesquisa de satisfação:** +10 pontos
- **Colaborador repassou um procedimento incorreto:** -60 pontos
- **Colaborador encerrou o contato de forma brusca / Derrubou a ligação:** -100 pontos

## 📊 Nova Estrutura de Pontuação

| Critério | Pontuação | Tipo |
|----------|-----------|------|
| Saudação Adequada | +10 | Positivo |
| Escuta Ativa / Sondagem | +15 | Positivo |
| Clareza e Objetividade | +10 | Positivo |
| Resolução Questão / Seguiu o procedimento | +25 | Positivo |
| Domínio no assunto abordado | +15 | Positivo |
| Empatia / Cordialidade | +15 | Positivo |
| Direcionou para pesquisa de satisfação | +10 | Positivo |
| Colaborador repassou um procedimento incorreto | -60 | Negativo |
| Colaborador encerrou o contato de forma brusca / Derrubou a ligação | -100 | Negativo |

**Pontuação máxima:** 100 pontos
**Pontuação mínima:** -60 pontos

## 🗄️ Schema MongoDB - Novos Campos

### console_analises.qualidade_avaliacoes
Adicionar os seguintes campos:
```javascript
clarezaObjetividade: Boolean,    // Critério de avaliação (NOVO)
dominioAssunto: Boolean,         // Critério de avaliação (NOVO)
```

### console_analises.qualidade_avaliacoes_gpt.criteriosGPT
Adicionar os seguintes campos:
```javascript
clarezaObjetividade: Boolean,    // NOVO critério
dominioAssunto: Boolean,         // NOVO critério
```

## 🔧 Compatibilidade Retroativa

### Estratégia de Implementação:
- **Campos novos são opcionais** (Boolean, default: false)
- **Avaliações antigas** continuam funcionando normalmente
- **Cálculo de pontuação** verifica se campos existem antes de somar
- **Migração de dados** será feita via script no banco de dados

### Exemplo de Payload para Nova Avaliação:
```javascript
{
  colaboradorNome: "João Silva",
  avaliador: "Maria Santos",
  mes: "Dezembro",
  ano: 2024,
  dataAvaliacao: "2024-12-19T10:30:00Z",
  // Critérios existentes
  saudacaoAdequada: true,
  escutaAtiva: true,
  resolucaoQuestao: true,
  empatiaCordialidade: true,
  direcionouPesquisa: false,
  procedimentoIncorreto: false,
  encerramentoBrusco: false,
  // Novos critérios
  clarezaObjetividade: true,     // NOVO
  dominioAssunto: true,          // NOVO
  // Outros campos
  moderado: false,
  observacoesModeracao: "",
  pontuacaoTotal: 85,            // Calculado automaticamente
  createdAt: "2024-12-19T10:30:00Z",
  updatedAt: "2024-12-19T10:30:00Z"
}
```

## 🎯 Endpoints Afetados

### POST /api/qualidade/avaliacoes
- Aceitar novos campos `clarezaObjetividade` e `dominioAssunto`
- Calcular `pontuacaoTotal` considerando novos critérios

### PUT /api/qualidade/avaliacoes/:id
- Permitir atualização dos novos campos
- Recalcular `pontuacaoTotal` se necessário

### GET /api/qualidade/avaliacoes
- Retornar novos campos nas consultas
- Manter compatibilidade com avaliações antigas

## 🤖 Análise GPT

### Atualização do GPT Service:
- Incluir novos critérios na análise automática
- Atualizar prompt para considerar "Clareza e Objetividade" e "Domínio no Assunto"
- Manter compatibilidade com análises antigas

### Exemplo de Prompt Atualizado:
```
Analise a ligação considerando os seguintes critérios:
1. Saudação Adequada
2. Escuta Ativa / Sondagem
3. Clareza e Objetividade (NOVO)
4. Resolução Questão / Seguiu o procedimento
5. Domínio no assunto abordado (NOVO)
6. Empatia / Cordialidade
7. Direcionou para pesquisa de satisfação
8. Colaborador repassou um procedimento incorreto (negativo)
9. Colaborador encerrou o contato de forma brusca (negativo)
```

## 📈 Relatórios

### Relatório do Agente:
- Incluir novos critérios nas estatísticas
- Calcular médias considerando todos os critérios
- Manter compatibilidade com dados antigos

### Relatório de Gestão:
- Atualizar métricas para incluir novos critérios
- Recalcular indicadores de qualidade
- Manter histórico de avaliações antigas

## 🚀 Checklist de Implementação Backend

- [ ] Adicionar novos campos ao schema MongoDB
- [ ] Atualizar validações de entrada
- [ ] Modificar cálculo de pontuação
- [ ] Atualizar endpoints de CRUD
- [ ] Modificar análise GPT
- [ ] Atualizar relatórios
- [ ] Testar compatibilidade retroativa
- [ ] Executar script de migração de dados (se necessário)

## 📞 Contato

Para dúvidas sobre a implementação, contatar:
- **Frontend:** VeloHub Development Team
- **Data:** 2024-12-19
- **Versão:** v1.0.0
