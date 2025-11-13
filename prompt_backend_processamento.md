# Prompt para Backend - Campo _processamento

## Contexto
O frontend Console implementou um novo campo `_processamento` nos tickets internos.

## Objetivo
Adicionar suporte ao campo `_processamento` nos schemas e endpoints existentes.

## Schemas MongoDB (console_chamados)

### 1. tk_gestão - Adicionar após _atribuido (linha ~125):
```
_processamento: String  // Valores: "aprovação do gestor" | "consulta viabilidade" | "processamento" (opcional)
```

### 2. tk_conteudos - Adicionar após _atribuido (linha ~151):
```
_processamento: String  // Valores: "aprovação do gestor" | "consulta viabilidade" | "processamento" (opcional)
```

## Endpoints (já existentes, apenas adicionar campo)
- PUT /api/support/tk-conteudos
- PUT /api/support/tk-gestao

## Validação
- Campo opcional (pode ser vazio ou ausente)
- Se presente, deve ser string
- Valores aceitos: "aprovação do gestor", "consulta viabilidade", "processamento", ou vazio/null

## Não alterar
- Estrutura de resposta existente
- Validações de outros campos
- Lógica de negócio atual

## Resumo
Basta adicionar o campo aos schemas e permitir recebê-lo/retorná-lo nos endpoints PUT existentes.
