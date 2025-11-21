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

### **Variáveis Configuradas Automaticamente**
- `NODE_ENV=production`
- `REACT_APP_API_URL=https://backend-gcp-278491073220.us-east1.run.app/api`

### **Variáveis que DEVEM ser Configuradas Manualmente**

Após o primeiro deploy, configure no Cloud Run Console:

1. Acesse: Google Cloud Console → Cloud Run → `frontend-console` → Edit & Deploy New Revision
2. Em "Variables & Secrets", adicione:
   - **REACT_APP_GOOGLE_CLIENT_ID** = `278491073220-eb4ogvn3aifu0ut9mq3rvu5r9r9l3137.apps.googleusercontent.com`

### **Configuração via gcloud CLI**

```bash
gcloud run services update frontend-console \
  --region us-east1 \
  --update-env-vars REACT_APP_GOOGLE_CLIENT_ID=278491073220-eb4ogvn3aifu0ut9mq3rvu5r9r9l3137.apps.googleusercontent.com \
  --project console-365e8
```

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
- **Frontend:** Será gerada após o primeiro deploy (formato: `https://frontend-console-[HASH]-us-east1.run.app`)

## ✅ Checklist de Deploy

- [ ] Cloud Build Trigger configurado OU GitHub Actions configurado
- [ ] Secret `REACT_APP_GOOGLE_CLIENT_ID` configurado no GitHub (se usar GitHub Actions)
- [ ] Primeiro deploy realizado
- [ ] Health check funcionando (`/health`)
- [ ] Aplicação React carregando corretamente
- [ ] Login Google OAuth funcionando

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

