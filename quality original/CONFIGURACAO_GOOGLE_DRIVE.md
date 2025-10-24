# 🔧 Configuração do Google Drive para HCs Velotax

## 📋 Passo a Passo Completo

### 1. **Criar Projeto no Google Cloud Console**
- Acesse: https://console.cloud.google.com/
- Crie um novo projeto: `HCs-Velotax-Sistema`
- Anote o ID do projeto

### 2. **Ativar Google Drive API**
- Vá para: APIs e serviços → Biblioteca
- Pesquise: "Google Drive API"
- Clique em "Ativar"

### 3. **Configurar OAuth Consent Screen**
- Vá para: APIs e serviços → Tela de consentimento OAuth
- Selecione: "Externo"
- Preencha:
  - Nome: `HCs Velotax Sistema`
  - Email: `seu-email@velotax.com.br`
- Adicione escopo: `https://www.googleapis.com/auth/drive.file`
- Adicione usuários de teste (emails que vão usar o sistema)

### 4. **Criar Credenciais**
- Vá para: APIs e serviços → Credenciais
- Crie "ID do cliente OAuth 2.0":
  - Tipo: Aplicativo da Web
  - Origens autorizadas: `http://localhost:3005`
- Crie "Chave de API"

### 5. **Configurar no Código**
Edite o arquivo `src/config/googleDrive.ts`:

```typescript
export const GOOGLE_DRIVE_CONFIG = {
  clientId: 'SEU_CLIENT_ID_AQUI.apps.googleusercontent.com',
  apiKey: 'SUA_API_KEY_AQUI',
  // ... resto da configuração
};
```

### 6. **Testar a Configuração**
1. Reinicie o servidor de desenvolvimento
2. Tente fazer upload de um arquivo > 3MB
3. Deve aparecer popup de login do Google
4. Após login, arquivo deve ser salvo no Google Drive

## 🔒 Segurança

### Conta Recomendada
- Use uma conta Google corporativa específica
- Exemplo: `hcs.velotax@gmail.com`
- Configure permissões adequadas

### Pasta no Google Drive
- Os arquivos serão salvos em: `HCs_Velotax_Audio_Files`
- Pasta será criada automaticamente
- Apenas usuários autorizados terão acesso

## 🚨 Troubleshooting

### Erro: "This app isn't verified"
- Clique em "Advanced" → "Go to HCs Velotax Sistema (unsafe)"
- Isso é normal para aplicações em desenvolvimento

### Erro: "Access blocked"
- Verifique se o email está na lista de usuários de teste
- Verifique se o domínio está nas origens autorizadas

### Arquivo não aparece no Drive
- Verifique se fez login com a conta correta
- Verifique se a pasta `HCs_Velotax_Audio_Files` foi criada
- Verifique os logs no console do navegador

## 📞 Suporte
Se tiver problemas, verifique:
1. Console do navegador (F12)
2. Logs do Google Cloud Console
3. Permissões da conta Google
