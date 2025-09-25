# Configuração do Google Console - VeloHub

## 🚨 ERRO ATUAL: "The given origin is not allowed for the given client ID"

### 📋 Solução Rápida:

#### 1. Acesse o Google Cloud Console:
- URL: https://console.developers.google.com/
- Projeto: VeloHub Console

#### 2. Vá para Credenciais OAuth:
- Menu lateral → "APIs e serviços" → "Credenciais"
- Clique no Client ID: `278491073220-eb4ogvn3aifu0ut9mq3rvu5r9r9l3137.apps.googleusercontent.com`

#### 3. Adicione URIs Autorizados:
```
http://localhost:3000
```

#### 4. Salve as alterações

### 🔧 Configuração Completa:

#### **URIs de Redirecionamento Autorizados:**
```
http://localhost:3000
https://front-console.vercel.app
https://seu-dominio.com
```

#### **Origens JavaScript Autorizadas:**
```
http://localhost:3000
https://front-console.vercel.app
https://seu-dominio.com
```

### ⚡ Teste Rápido:

1. **Configure o domínio** no Google Console
2. **Aguarde 5-10 minutos** para propagação
3. **Teste o login** em http://localhost:3000
4. **Verifique** se o erro desaparece

### 🔍 Verificação:

#### **Console do Navegador:**
- ❌ `The given origin is not allowed` → Domínio não configurado
- ✅ Login bem-sucedido → Domínio configurado corretamente

#### **Network Tab:**
- Verifique se as requisições para `accounts.google.com` retornam 200
- Verifique se não há erros CORS

### 📝 Notas Importantes:

- **Propagação:** Mudanças podem levar até 10 minutos
- **Cache:** Limpe o cache do navegador se necessário
- **HTTPS:** Em produção, use sempre HTTPS
- **Domínios:** Adicione todos os domínios que usarão o OAuth

---

**Client ID:** `278491073220-eb4ogvn3aifu0ut9mq3rvu5r9r9l3137.apps.googleusercontent.com`  
**Versão:** v3.3.4  
**Data:** 2024-12-19
