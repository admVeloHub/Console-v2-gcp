# Configuração do Google OAuth - Console de Conteúdo VeloHub

## 📋 Pré-requisitos

1. Conta Google com acesso ao Google Cloud Console
2. Projeto no Google Cloud Platform

## 🔧 Passo a Passo

### 1. Criar Projeto no Google Cloud Console

1. Acesse: https://console.developers.google.com/
2. Clique em "Selecionar um projeto" → "Novo projeto"
3. Nome: `VeloHub Console`
4. Clique em "Criar"

### 2. Ativar APIs Necessárias

1. No menu lateral, vá em "APIs e serviços" → "Biblioteca"
2. Procure e ative:
   - **Google+ API** (ou Google Identity API)
   - **Google OAuth2 API**

### 3. Configurar Tela de Consentimento OAuth

1. Vá em "APIs e serviços" → "Tela de consentimento OAuth"
2. Escolha "Externo" (para contas Google corporativas)
3. Preencha os campos obrigatórios:
   - **Nome do aplicativo:** `VeloHub Console`
   - **Email de suporte:** `lucas.gravina@velotax.com.br`
   - **Email de contato do desenvolvedor:** `lucas.gravina@velotax.com.br`

### 4. Criar Credenciais OAuth 2.0

1. Vá em "APIs e serviços" → "Credenciais"
2. Clique em "Criar credenciais" → "ID do cliente OAuth 2.0"
3. Tipo de aplicativo: **Aplicativo da Web**
4. Nome: `VeloHub Console Web Client`

### 5. Configurar URIs Autorizados

#### Para Desenvolvimento:
```
http://localhost:3000
```

#### Para Produção:
```
https://seu-dominio.com
https://front-console.vercel.app
```

### 6. Obter Client ID

1. Após criar as credenciais, copie o **Client ID**
2. **Client ID Configurado:** `278491073220-eb4ogvn3aifu0ut9mq3rvu5r9r9l3137.apps.googleusercontent.com`

### 7. Configurar Variáveis de Ambiente

#### Arquivo `.env` (criar na raiz do projeto):
```env
REACT_APP_GOOGLE_CLIENT_ID=278491073220-eb4ogvn3aifu0ut9mq3rvu5r9r9l3137.apps.googleusercontent.com
```

#### Arquivo `env.example` (já atualizado):
```env
REACT_APP_GOOGLE_CLIENT_ID=278491073220-eb4ogvn3aifu0ut9mq3rvu5r9r9l3137.apps.googleusercontent.com
```

### 8. Configurar Emails Autorizados

Edite o arquivo `src/config/google.js`:

```javascript
export const AUTHORIZED_EMAILS = [
  'lucas.gravina@velotax.com.br',
  'outro.email@velotax.com.br'  // Adicione outros emails conforme necessário
];
```

## 🔒 Segurança

### Domínios Autorizados
- ✅ `localhost:3000` (desenvolvimento)
- ✅ `seu-dominio.com` (produção)
- ❌ Não adicione domínios não confiáveis

### Emails Autorizados
- ✅ Apenas emails corporativos da VeloTax
- ✅ Lista controlada em `src/config/google.js`
- ❌ Não permita emails pessoais

## 🚀 Teste da Configuração

1. Inicie o servidor: `npm start`
2. Acesse: `http://localhost:3000`
3. Clique em "Entrar com Google"
4. Faça login com `lucas.gravina@velotax.com.br`
5. Verifique se o login é bem-sucedido

## ❌ Solução de Problemas

### Erro: "Acesso não autorizado"
- Verifique se o email está em `AUTHORIZED_EMAILS`
- Confirme se o Client ID está correto

### Erro: "Invalid client"
- Verifique se o Client ID está correto no `.env`
- Confirme se o domínio está autorizado no Google Console

### Erro: "Redirect URI mismatch"
- Adicione `http://localhost:3000` nas URIs autorizadas
- Para produção, adicione o domínio correto

## 📝 Notas Importantes

- **Nunca** commite o arquivo `.env` no Git
- **Sempre** use HTTPS em produção
- **Mantenha** a lista de emails autorizados atualizada
- **Monitore** os logs de acesso no Google Console

## 🔄 Atualizações Futuras

Para adicionar novos usuários:
1. Adicione o email em `AUTHORIZED_EMAILS`
2. Configure as permissões em `src/contexts/AuthContext.jsx`
3. Teste o acesso

---

**Versão:** v3.3.2  
**Data:** 2024-12-19  
**Autor:** VeloHub Development Team
