# 🚀 Guia de Configuração Cloud Run - Console VeloHub
<!-- VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team -->

## 📋 Visão Geral

Este projeto está 100% configurado para deploy no Google Cloud Run. O deploy pode ser feito via:
- **Cloud Build Trigger** (recomendado) - Deploy automático via Git
- **GitHub Actions** - CI/CD via workflows

## 🏗️ Arquitetura

```
Frontend React → Docker Container → Cloud Run → Internet
```

## 📁 Arquivos de Configuração

### **Dockerfile**
- Multi-stage build otimizado
- Build do React + Servidor Express
- Health check configurado
- Porta 8080 (padrão Cloud Run)

### **backend/server.js**
- Servidor Express para servir arquivos estáticos
- Health check endpoint (`/health`)
- Suporte a React Router (SPA)
- Graceful shutdown

### **cloudbuild.yaml**
- Configuração para Cloud Build
- Build, push e deploy automático
- Variáveis de ambiente pré-configuradas

### **.github/workflows/cloud-run-deploy.yml**
- Workflow GitHub Actions
- Deploy automático na branch `main`

## ⚙️ Configuração Inicial

### **1. Cloud Build Trigger (Recomendado)**

1. Acesse: Google Cloud Console → Cloud Build → Triggers
2. Clique em "Create Trigger"
3. Configure:
   - **Name:** `frontend-console-deploy`
   - **Event:** Push to a branch
   - **Branch:** `^main$`
   - **Source:** Conecte o repositório GitHub `admVeloHub/Console-v2-gcp`
   - **Configuration:** Cloud Build configuration file
   - **Location:** `cloudbuild.yaml`
   - **Service account:** Use service account com permissões adequadas

### **2. GitHub Actions (Alternativa)**

1. Configure Workload Identity Federation no GCP
2. Adicione secrets no GitHub:
   - `WIF_PROVIDER` - Provider ID do Workload Identity
   - `WIF_SERVICE_ACCOUNT` - Email da service account

## 🔐 Variáveis de Ambiente

### **Variáveis Configuradas Durante o Build**

As variáveis `REACT_APP_*` são incorporadas no build do React e **devem** estar disponíveis durante o build:

**Variáveis REACT_APP_* passadas diretamente como build args:**
- `REACT_APP_GOOGLE_CLIENT_ID` - Client ID do Google OAuth (obrigatório)
- `REACT_APP_AUTHORIZED_DOMAIN` - Domínio autorizado para login

**No cloudbuild.yaml:**
- Usa substituições `${_GOOGLE_CLIENT_ID}` e `${_AUTHORIZED_DOMAIN}`
- Passadas como `--build-arg REACT_APP_GOOGLE_CLIENT_ID` e `--build-arg REACT_APP_AUTHORIZED_DOMAIN`
- Variáveis são incorporadas no código JavaScript durante o build

**No GitHub Actions:**
- Secrets: `REACT_APP_GOOGLE_CLIENT_ID` e `REACT_APP_AUTHORIZED_DOMAIN`
- Passadas como `--build-arg REACT_APP_GOOGLE_CLIENT_ID` e `--build-arg REACT_APP_AUTHORIZED_DOMAIN`
- Variáveis são incorporadas no código JavaScript durante o build

**Importante:** 
- Variáveis `REACT_APP_*` não podem ser alteradas após o build. Elas são compiladas no JavaScript durante `npm run build`.
- Se `REACT_APP_GOOGLE_CLIENT_ID` não estiver configurada durante o build, a aplicação mostrará um erro claro e não funcionará.

### **Configuração via gcloud CLI**

**Nota:** As variáveis `REACT_APP_GOOGLE_CLIENT_ID` e `REACT_APP_AUTHORIZED_DOMAIN` devem ser passadas durante o build do Docker, não como variáveis de ambiente do container Cloud Run. Use o `cloudbuild.yaml` ou GitHub Actions para configurá-las.

## 🚀 Deploy

### **Deploy Automático**
- Push para branch `main` → Deploy automático via Cloud Build ou GitHub Actions

### **Deploy Manual**

```bash
# Build local (teste)
docker build -t frontend-console .

# Teste local
docker run -p 8080:8080 frontend-console

# Deploy via gcloud
gcloud run deploy frontend-console \
  --source . \
  --region us-east1 \
  --platform managed \
  --allow-unauthenticated \
  --project console-365e8
```

## 🔍 Verificação

### **Health Check**
```bash
curl https://[SERVICE_URL]/health
```

### **Logs**
```bash
gcloud run services logs read frontend-console \
  --region us-east1 \
  --project console-365e8
```

## 📊 Recursos Configurados

- **Memória:** 512Mi
- **CPU:** 1
- **Instâncias mínimas:** 0 (scale-to-zero)
- **Instâncias máximas:** 10
- **Timeout:** 300s
- **Porta:** 8080

## 🔗 URLs

- **Backend API:** `https://backend-gcp-278491073220.us-east1.run.app/api`
- **Frontend:** `https://console-v2-278491073220.us-east1.run.app`

**Importante:** Esta URL deve estar configurada nas "Origens JavaScript autorizadas" e "URIs de redirecionamento autorizados" do Google OAuth Console para que a autenticação funcione corretamente.

## ✅ Checklist de Deploy

- [ ] Cloud Build Trigger configurado OU GitHub Actions configurado
- [ ] Secrets `REACT_APP_GOOGLE_CLIENT_ID` e `REACT_APP_AUTHORIZED_DOMAIN` configurados no GitHub (se usar GitHub Actions)
- [ ] Variáveis `REACT_APP_GOOGLE_CLIENT_ID` e `REACT_APP_AUTHORIZED_DOMAIN` passadas como build args durante o build
- [ ] Primeiro deploy realizado
- [ ] Health check funcionando (`/health`)
- [ ] Aplicação React carregando corretamente
- [ ] URL do Cloud Run (`https://console-v2-278491073220.us-east1.run.app`) adicionada nas "Origens JavaScript autorizadas" do Google OAuth Console
- [ ] URL do Cloud Run adicionada nas "URIs de redirecionamento autorizados" do Google OAuth Console
- [ ] Login Google OAuth funcionando corretamente

## 🐛 Troubleshooting

### **Erro: "npm ci requires package-lock.json"**
- ✅ Resolvido: `package-lock.json` agora é incluído no build

### **Página do Firebase aparece**
- ✅ Resolvido: `public/index.html` atualizado para template React correto

### **Variáveis de ambiente não funcionam**
- Verifique se as variáveis estão configuradas no Cloud Run Console
- Variáveis `REACT_APP_*` precisam estar disponíveis no momento do build

### **Build falha**
- Verifique logs do Cloud Build
- Confirme que `package-lock.json` está commitado

---

**Versão:** v1.0.0  
**Data:** 2024-12-19  
**Autor:** VeloHub Development Team

