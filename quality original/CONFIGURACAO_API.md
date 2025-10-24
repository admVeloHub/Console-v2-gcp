# 🔑 Configuração da API OpenAI

## 📋 Pré-requisitos

Para usar as análises automáticas do Agente GPT, você precisa:

1. **Conta na OpenAI** - Acesse [platform.openai.com](https://platform.openai.com)
2. **Chave da API** - Gere uma chave de API válida
3. **Créditos** - Tenha créditos disponíveis na sua conta OpenAI

## 🚀 Como Configurar

### Passo 1: Obter Chave da API

1. Acesse [platform.openai.com](https://platform.openai.com)
2. Faça login ou crie uma conta
3. Vá para **"API Keys"** no menu lateral
4. Clique em **"Create new secret key"**
5. Copie a chave gerada (começa com `sk-`)

### Passo 2: Configurar no Sistema

1. No sistema Velotax, vá para **"Módulo de Qualidade"**
2. Clique em **"Agente GPT"**
3. Clique no botão **⚙️ Configurar** (ícone de engrenagem)
4. Cole sua chave da API no campo **"Chave da API OpenAI"**
5. Clique em **"Salvar Configuração"**
6. Teste a conexão clicando em **"Testar Conexão"**

### Passo 3: Verificar Status

Após a configuração, você verá:
- ✅ **Status**: Configurado
- ✅ **API Key**: Configurada
- ✅ **Modelo**: gpt-4o-mini (ou outro configurado)

## 🔧 Configurações Avançadas

### Variáveis de Ambiente (Opcional)

Para configuração automática, crie um arquivo `.env` na raiz do projeto:

```bash
# .env
VITE_OPENAI_API_KEY=sk-sua-chave-aqui
```

### Modelos Disponíveis

- **gpt-4o-mini** (recomendado) - Melhor custo-benefício
- **gpt-4o** - Mais preciso, mas mais caro
- **gpt-3.5-turbo** - Mais econômico, boa precisão

## 💰 Custos e Limites

### Preços (por 1K tokens)
- **gpt-4o-mini**: $0.00015
- **gpt-4o**: $0.005
- **gpt-3.5-turbo**: $0.0005

### Limites por Análise
- **Máximo de tokens**: 4.000
- **Timeout**: 30 segundos
- **Tamanho do arquivo**: Até 1GB

## 🛡️ Segurança

- ✅ Sua chave da API é armazenada **localmente** no navegador
- ✅ **NUNCA** é enviada para nossos servidores
- ✅ Use apenas em dispositivos confiáveis
- ✅ Revogue chaves antigas regularmente

## 🔄 Modo Fallback

Se a API não estiver configurada:
- ✅ Sistema continua funcionando
- ✅ Análises são simuladas
- ✅ Qualidade reduzida, mas funcional
- ✅ Pode configurar a API a qualquer momento

## 🚨 Solução de Problemas

### Erro: "API não configurada"
- Verifique se a chave foi salva corretamente
- Tente reconfigurar a API

### Erro: "Timeout na requisição"
- Verifique sua conexão com a internet
- Tente novamente em alguns minutos

### Erro: "Chave inválida"
- Verifique se a chave está correta
- Gere uma nova chave se necessário

### Erro: "Sem créditos"
- Verifique o saldo da sua conta OpenAI
- Adicione créditos se necessário

## 📞 Suporte

Para problemas técnicos:
1. Verifique os logs do console do navegador
2. Teste a conexão da API
3. Verifique sua conexão com a internet
4. Entre em contato com o suporte técnico

## 🔍 Monitoramento

O sistema registra:
- Total de análises realizadas
- Chamadas para a API OpenAI
- Usos do modo fallback
- Erros e problemas de conexão

---

**Nota**: A configuração da API OpenAI é opcional. O sistema funciona perfeitamente em modo fallback, mas as análises automáticas oferecem muito mais precisão e detalhes.

