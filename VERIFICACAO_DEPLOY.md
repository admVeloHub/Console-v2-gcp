# Verificação do Deploy - Google OAuth Client ID

## 🔍 Problema Identificado

O erro `❌ REACT_APP_GOOGLE_CLIENT_ID não configurada` indica que o Client ID não foi incorporado durante o build do React.

## ✅ Verificações Necessárias

### 1. Verificar Logs do Cloud Build

Acesse: https://console.cloud.google.com/cloud-build/builds

Procure pelo build mais recente e verifique se aparecem estas mensagens:

**✅ SUCESSO:**
```
🔍 Verificando GOOGLE_CLIENT_ID do Secret Manager...
✅ GOOGLE_CLIENT_ID obtido (primeiros 30 chars): 278491073220-7u7hh1tji5dd65qag...
```

**❌ ERRO:**
```
🔍 Verificando GOOGLE_CLIENT_ID do Secret Manager...
❌ ERRO: GOOGLE_CLIENT_ID não está disponível!
```

### 2. Verificar Secret no Secret Manager

Acesse: https://console.cloud.google.com/security/secret-manager

- Verifique se o secret `GOOGLE_ID_CONSOLE` existe
- Verifique se o valor é: `278491073220-7u7hh1tji5dd65qagkprc1acenagql5o.apps.googleusercontent.com`
- Verifique se há uma versão `latest` disponível

### 3. Verificar Permissões do Cloud Build Service Account

O Cloud Build precisa de permissão para acessar o secret.

**Passos:**
1. Acesse: https://console.cloud.google.com/security/secret-manager/secret/GOOGLE_ID_CONSOLE/permissions
2. Verifique se existe uma entrada para:
   - `PROJECT_NUMBER@cloudbuild.gserviceaccount.com` com role `Secret Manager Secret Accessor`
3. Se não existir, adicione:
   - Clique em "Adicionar principal"
   - Principal: `PROJECT_NUMBER@cloudbuild.gserviceaccount.com`
   - Role: `Secret Manager Secret Accessor`
   - Salve

**Para encontrar o PROJECT_NUMBER:**
- Acesse: https://console.cloud.google.com/iam-admin/settings
- O número do projeto está no topo da página

### 4. Verificar se o cloudbuild.yaml foi usado

No log do Cloud Build, verifique:
- Se o arquivo `cloudbuild.yaml` foi usado
- Se o step `build-image` executou o script bash com os logs de debug

## 🔧 Solução Alternativa (Se o Secret não funcionar)

Se o problema persistir, podemos usar uma substituição direta no `cloudbuild.yaml`:

```yaml
substitutions:
  _GOOGLE_CLIENT_ID: '278491073220-7u7hh1tji5dd65qagkprc1acenagql5o.apps.googleusercontent.com'
  _AUTHORIZED_DOMAIN: 'velotax.com.br'
```

E no step de build:
```yaml
--build-arg REACT_APP_GOOGLE_CLIENT_ID=${_GOOGLE_CLIENT_ID}
```

**⚠️ ATENÇÃO:** Esta solução expõe o Client ID no código, mas é aceitável pois o Client ID é público (não é um secret sensível).

## 📋 Checklist de Verificação

- [ ] Logs do Cloud Build mostram acesso ao secret
- [ ] Secret `GOOGLE_ID_CONSOLE` existe e tem valor correto
- [ ] Cloud Build Service Account tem permissão para acessar o secret
- [ ] Build completou com sucesso
- [ ] Deploy foi feito após as alterações no cloudbuild.yaml

## 🚀 Próximos Passos

1. Verifique os logs do Cloud Build conforme instruções acima
2. Se o secret não foi acessado, verifique/configure permissões
3. Se necessário, use a solução alternativa com substituição direta
4. Faça um novo deploy após corrigir o problema

