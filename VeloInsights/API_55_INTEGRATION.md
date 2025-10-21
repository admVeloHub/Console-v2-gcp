# 🚀 Integração com API da 55

## 📋 **Visão Geral**

Este sistema integra com a API da 55 para sincronização automática de dados de chamadas e pausas, armazenando-os no MongoDB Atlas.

## 🔧 **Configuração**

### 1. **Variáveis de Ambiente**

Copie o arquivo `55-api.env.example` para `.env` e configure:

```bash
# MongoDB Atlas
MONGODB_URI=mongodb+srv://REDACTED_ATLAS_URI

# API da 55 - Configure com suas credenciais reais
API_55_BASE_URL=https://api.55pbx.com
API_55_KEY=sua_chave_da_api_aqui
API_55_USERNAME=seu_usuario_aqui
API_55_PASSWORD=sua_senha_aqui
```

### 2. **Instalar Dependências**

```bash
npm install node-cron
```

## 🚀 **Executar Serviços**

### **Serviços Disponíveis:**

```bash
# Frontend (porta 3000)
npm run dev

# MongoDB API (porta 3001)
npm run mongodb-api

# API 55 Integration (porta 3002)
npm run api-55
```

### **Executar Todos os Serviços:**

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: MongoDB API
npm run mongodb-api

# Terminal 3: API 55 Integration
npm run api-55
```

## 📊 **Endpoints da API 55**

### **1. Testar Conexão**
```bash
GET http://localhost:3002/api/test-55-connection
```

### **2. Status da API**
```bash
GET http://localhost:3002/api/55-status
```

### **3. Sincronização Manual**
```bash
POST http://localhost:3002/api/sync-55
Content-Type: application/json

{
  "date": "2024-01-15" // Opcional, usa ontem se não especificado
}
```

## ⏰ **Sincronização Automática**

- **Frequência:** Diária às 6:00
- **Dados:** D-1 (dados do dia anterior)
- **Logs:** Salvos na collection `sync_logs`

## 🔄 **Fluxo de Dados**

```
API da 55 → Autenticação → Buscar Dados → Converter Formato → MongoDB Atlas
```

### **Mapeamento de Dados:**

#### **Chamadas (calls):**
- `id` → `call_id`
- `operator` → `operator_name`
- `date` → `call_date`
- `start_time` → `start_time`
- `end_time` → `end_time`
- `duration` → `total_time`
- `wait_time` → `wait_time`
- `ura_time` → `time_in_ura`
- `question_attendant` → `question_attendant`
- `question_solution` → `question_solution`
- `queue` → `queue_name`
- `recording` → `recording_url`

#### **Pausas (pauses):**
- `operator` → `operator_name`
- `activity` → `activity_name`
- `start_date` → `start_date`
- `start_time` → `start_time`
- `end_date` → `end_date`
- `end_time` → `end_time`
- `duration` → `duration`
- `reason` → `pause_reason`

## 📝 **Logs de Sincronização**

Os logs são salvos na collection `sync_logs`:

```javascript
{
  date: Date,
  source: '55_api',
  calls_synced: Number,
  pauses_synced: Number,
  status: 'success' | 'error',
  error: String, // Apenas se status = 'error'
  created_at: Date
}
```

## 🔧 **Troubleshooting**

### **Erro de Autenticação:**
- Verifique as credenciais da API da 55
- Confirme se a URL base está correta
- Teste a conexão com `GET /api/test-55-connection`

### **Erro de Conexão MongoDB:**
- Verifique a string de conexão
- Confirme se o cluster está ativo
- Teste com `GET /api/55-status`

### **Dados Não Sincronizados:**
- Verifique os logs na collection `sync_logs`
- Confirme se os endpoints da API da 55 estão corretos
- Teste a sincronização manual

## 🎯 **Próximos Passos**

1. **Configurar credenciais reais** da API da 55
2. **Testar conexão** com `GET /api/test-55-connection`
3. **Executar sincronização manual** para validar
4. **Configurar sincronização automática** diária
5. **Integrar com frontend** para exibir dados em tempo real

## 📞 **Suporte**

Para dúvidas ou problemas:
- Verifique os logs do console
- Consulte a collection `sync_logs` no MongoDB
- Teste os endpoints individualmente
