# 🚀 Instruções de Deploy - Módulo de Qualidade

## 📋 Visão Geral
Este documento contém as instruções para fazer o deploy do Módulo de Qualidade Velotax em produção, permitindo que ele funcione online e seja integrado ao Console de Conteúdo principal.

## 🎯 Objetivo
- ✅ Deploy do projeto QUALIDADE online
- ✅ Integração com Console de Conteúdo via iframe
- ✅ Funcionamento independente de localhost
- ✅ Acesso via URL pública

## 🛠️ Pré-requisitos

### 1. Conta Vercel
- [ ] Conta criada em [vercel.com](https://vercel.com)
- [ ] Projeto conectado ao GitHub (recomendado)
- [ ] Vercel CLI instalado (opcional)

### 2. Configurações do Projeto
- [ ] `package.json` atualizado com scripts de deploy
- [ ] `vercel.json` configurado
- [ ] `vite.config.ts` otimizado para produção

## 🚀 Opções de Deploy

### Opção 1: Deploy via Vercel Dashboard (Recomendado)

#### Passo 1: Preparar Repositório
```bash
# 1. Criar repositório no GitHub
git init
git add .
git commit -m "Initial commit - Módulo de Qualidade v1.1.0"
git branch -M main
git remote add origin https://github.com/seu-usuario/velohub-qualidade.git
git push -u origin main
```

#### Passo 2: Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Importe o repositório GitHub
4. Configure:
   - **Project Name:** `velohub-qualidade`
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (raiz)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Clique em **"Deploy"**

#### Passo 3: Configurar Domínio
- **URL automática:** `https://velohub-qualidade.vercel.app`
- **Domínio customizado:** `https://qualidade-velohub.vercel.app` (recomendado)

### Opção 2: Deploy via Vercel CLI

#### Instalação do CLI
```bash
npm install -g vercel
```

#### Deploy
```bash
# 1. Login no Vercel
vercel login

# 2. Deploy de produção
npm run deploy

# 3. Ou deploy de preview
npm run deploy:preview
```

## 🔧 Configurações Pós-Deploy

### 1. Variáveis de Ambiente (Opcional)
No dashboard do Vercel, adicione:
```
NODE_ENV=production
VITE_APP_VERSION=1.1.0
```

### 2. Configurar Headers de Segurança
O `vercel.json` já inclui:
- ✅ `X-Frame-Options: SAMEORIGIN` (permite iframe)
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`

### 3. Testar Funcionalidades
- [ ] Acesso direto à URL
- [ ] Carregamento em iframe
- [ ] Funcionalidades do sistema
- [ ] Responsividade mobile

## 🔗 Integração com Console Principal

### 1. Atualizar URL no Console
No arquivo `src/pages/QualidadePage.jsx`:
```javascript
const QUALIDADE_URL = 'https://qualidade-velohub.vercel.app';
```

### 2. Configurar Variável de Ambiente
No `.env` do Console principal:
```
REACT_APP_QUALIDADE_URL=https://qualidade-velohub.vercel.app
```

### 3. Testar Integração
- [ ] Card "Qualidade" no dashboard
- [ ] Navegação para `/qualidade`
- [ ] Carregamento do iframe
- [ ] Funcionalidades completas

## 📊 Monitoramento

### 1. Analytics do Vercel
- [ ] Acessos e performance
- [ ] Erros e logs
- [ ] Uso de bandwidth

### 2. Logs de Aplicação
- [ ] Console do navegador
- [ ] Network tab
- [ ] Erros de iframe

## 🔄 Atualizações

### Deploy de Novas Versões
```bash
# 1. Atualizar código
git add .
git commit -m "Update: v1.1.1 - Nova funcionalidade"
git push origin main

# 2. Deploy automático (se configurado)
# Ou deploy manual via Vercel CLI
npm run deploy
```

### Versionamento
- ✅ Atualizar `package.json` version
- ✅ Atualizar comentários de versão nos arquivos
- ✅ Documentar mudanças no CHANGELOG

## 🛡️ Segurança

### 1. Configurações de Segurança
- ✅ Headers de segurança configurados
- ✅ CORS habilitado para iframe
- ✅ Content Security Policy (se necessário)

### 2. Acesso e Permissões
- ✅ Sistema de autenticação do Console principal
- ✅ Permissões de usuário
- ✅ Proteção de rotas

## 🚨 Solução de Problemas

### Problema: Iframe não carrega
**Solução:**
1. Verificar URL do iframe
2. Confirmar headers de segurança
3. Testar acesso direto

### Problema: Erro de CORS
**Solução:**
1. Verificar configuração do Vercel
2. Confirmar headers no `vercel.json`
3. Testar em diferentes navegadores

### Problema: Performance lenta
**Solução:**
1. Verificar otimizações do build
2. Analisar bundle size
3. Configurar CDN se necessário

## 📞 Suporte

### Contatos
- **Desenvolvimento:** Equipe VeloHub
- **Deploy:** Vercel Support
- **Infraestrutura:** Equipe de TI

### Recursos
- [Documentação Vercel](https://vercel.com/docs)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deploy](https://reactrouter.com/en/main/routers/create-browser-router)

---

## ✅ Checklist de Deploy

### Pré-Deploy
- [ ] Código testado localmente
- [ ] Build funcionando (`npm run build`)
- [ ] Configurações atualizadas
- [ ] Documentação atualizada

### Deploy
- [ ] Repositório GitHub criado
- [ ] Projeto Vercel configurado
- [ ] Deploy executado com sucesso
- [ ] URL de produção funcionando

### Pós-Deploy
- [ ] Teste de acesso direto
- [ ] Teste de integração com Console
- [ ] Verificação de funcionalidades
- [ ] Monitoramento configurado

### Integração
- [ ] URL atualizada no Console principal
- [ ] Variáveis de ambiente configuradas
- [ ] Teste completo de navegação
- [ ] Documentação atualizada

---

**🎉 Deploy concluído com sucesso!**

**URL de Produção:** `https://qualidade-velohub.vercel.app`  
**Versão:** 1.1.0  
**Status:** ✅ Pronto para integração
