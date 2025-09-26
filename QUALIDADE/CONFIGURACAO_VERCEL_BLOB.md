# 🚀 Configuração do Vercel Blob para HCs Velotax

## 📋 Por que Vercel Blob?

### ✅ **Vantagens:**
- 🔧 **Configuração simples** (apenas 1 variável de ambiente)
- 💰 **Custo baixo** ($0.15/GB/mês)
- ⚡ **Integração nativa** com Vercel
- 🔒 **Seguro** e confiável
- 📁 **Sem limite de tamanho** por arquivo
- 🌐 **CDN global** para acesso rápido

### ❌ **Desvantagens:**
- 💰 **Custo** (mas muito baixo)
- 🔗 **Dependência** do Vercel

## 📋 Passo a Passo Completo

### 1. **Deploy no Vercel**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy do projeto
vercel

# Seguir as instruções do CLI
```

### 2. **Configurar Vercel Blob**
1. **Acesse:** https://vercel.com/dashboard
2. **Vá para seu projeto**
3. **Clique em "Storage"** (menu lateral)
4. **Clique em "Create Database"**
5. **Selecione "Blob"**
6. **Digite o nome:** `hcs-velotax-blob`
7. **Clique em "Create"**

### 3. **Configurar Variável de Ambiente**
1. **Vá para:** Settings → Environment Variables
2. **Adicione nova variável:**
   - **Name:** `BLOB_READ_WRITE_TOKEN`
   - **Value:** (será gerado automaticamente)
   - **Environment:** Production, Preview, Development
3. **Clique em "Save"**

### 4. **Redeploy do Projeto**
```bash
# Redeploy para aplicar as variáveis
vercel --prod
```

## 🔧 Configuração Local (Desenvolvimento)

### 1. **Criar arquivo .env.local**
```bash
# .env.local
BLOB_READ_WRITE_TOKEN=seu_token_aqui
```

### 2. **Obter Token**
1. **Acesse:** https://vercel.com/dashboard
2. **Vá para:** Settings → Tokens
3. **Crie um novo token** com permissões de Blob
4. **Copie o token** e cole no .env.local

## 🧪 Testando a Configuração

### 1. **Verificar se está funcionando**
```javascript
// No console do navegador
console.log('Vercel Blob configurado:', !!process.env.BLOB_READ_WRITE_TOKEN);
```

### 2. **Testar upload**
1. **Faça upload** de um arquivo > 1MB
2. **Verifique os logs** no console
3. **Deve aparecer:** "✅ Arquivo salvo no Vercel Blob"

## 📊 Limites e Custos

### **Limites Gratuitos:**
- **Armazenamento:** 1GB
- **Bandwidth:** 1GB/mês
- **Requests:** 1000/mês

### **Custos Pós-Limite:**
- **Armazenamento:** $0.15/GB/mês
- **Bandwidth:** $0.40/GB
- **Requests:** $0.50/1000 requests

### **Exemplo de Custo:**
- **100 arquivos de 10MB cada = 1GB**
- **Custo mensal:** $0.15
- **Muito barato!**

## 🔒 Segurança

### **URLs Públicas:**
- Arquivos ficam **públicos** por padrão
- URLs são **difíceis de adivinhar**
- **Não há listagem** pública de arquivos

### **Recomendações:**
- Use **nomes únicos** para arquivos
- **Monitore** o uso de bandwidth
- **Configure** alertas de custo no Vercel

## 🚨 Troubleshooting

### **Erro: "Vercel Blob não configurado"**
- Verifique se `BLOB_READ_WRITE_TOKEN` está configurado
- Verifique se fez redeploy após configurar
- Verifique se o token tem permissões corretas

### **Erro: "Failed to upload"**
- Verifique se o arquivo não excede 100MB
- Verifique se o tipo de arquivo é suportado
- Verifique a conexão com internet

### **Arquivo não aparece**
- Verifique se o upload foi bem-sucedido
- Verifique se a URL foi salva corretamente
- Verifique os logs no console

## 📞 Suporte

### **Recursos:**
- **Documentação:** https://vercel.com/docs/storage/vercel-blob
- **Exemplos:** https://github.com/vercel/examples
- **Comunidade:** https://github.com/vercel/vercel/discussions

### **Monitoramento:**
- **Dashboard:** https://vercel.com/dashboard
- **Logs:** Vercel Dashboard → Functions → Logs
- **Métricas:** Vercel Dashboard → Analytics

## 🎯 Resultado Final

Após configurar, o sistema funcionará assim:

| Tamanho do Arquivo | Onde é Salvo |
|-------------------|--------------|
| **< 1MB** | localStorage (Base64) |
| **1MB - 100MB** | Vercel Blob |
| **> 100MB** | Rejeitado |

**Muito mais simples que o Google Drive!** 🎉
