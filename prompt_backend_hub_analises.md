# Prompt para Backend - Campo hubAnalises

## Contexto
O frontend Console implementou o campo `hubAnalises` no sistema de permissões de usuários.

## Objetivo
Adicionar suporte ao campo `hubAnalises` no schema de configuração de usuários e nos endpoints existentes.

## Schema MongoDB (console_config.Config)

### Atualizar _userClearance (após linha ~193):
```javascript
_userClearance: {
  artigos: Boolean,
  velonews: Boolean,
  botPerguntas: Boolean,
  botAnalises: Boolean,
  hubAnalises: Boolean,  // ADICIONAR - Permissão para Hub Análises
  chamadosInternos: Boolean,
  igp: Boolean,
  qualidade: Boolean,
  capacity: Boolean,
  config: Boolean,
  servicos: Boolean
}
```

## Endpoints Afetados

### 1. GET /api/config/users
- Garantir que o campo `hubAnalises` é retornado em `_userClearance`
- Se ausente no banco, retornar `hubAnalises: false` por padrão

### 2. POST /api/config/users (Criar usuário)
- Aceitar `hubAnalises` no objeto `_userClearance`
- Validar como Boolean
- Default: `false` se não fornecido

### 3. PUT /api/config/users/:id (Atualizar usuário)
- Aceitar `hubAnalises` no objeto `_userClearance`
- Validar como Boolean
- Manter valor existente se não fornecido

## Validação
- Campo opcional (Boolean)
- Valores aceitos: `true` | `false`
- Default: `false`

## Não Alterar
- Estrutura de resposta existente
- Validações de outros campos
- Lógica de autenticação/autorização
- Outros campos de `_userClearance`

## Migração de Dados (Opcional)
Se necessário, executar script para adicionar `hubAnalises: false` em todos os usuários existentes:

```javascript
db.Config.updateMany(
  { "_userClearance": { $exists: true } },
  { $set: { "_userClearance.hubAnalises": false } }
)
```

## Resumo
Basta adicionar o campo `hubAnalises` ao schema `_userClearance` e permitir recebê-lo/retorná-lo nos endpoints GET, POST e PUT existentes de usuários.
