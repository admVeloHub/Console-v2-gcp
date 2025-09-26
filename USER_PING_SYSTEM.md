# Sistema de Ping do Usuário

## 📋 **Visão Geral**

O sistema de ping do usuário foi implementado para enviar automaticamente informações do usuário logado para o backend, permitindo rastreamento e controle de acesso baseado em permissões.

## 🎯 **Funcionalidade**

### **Quando é Executado:**
- ✅ Automaticamente após login bem-sucedido
- ✅ Tanto para login via Google OAuth quanto para login de desenvolvimento
- ✅ Não interrompe o processo de login em caso de falha
- ✅ **Pulado automaticamente** se usuário não tem permissões para collections

### **Dados Enviados:**
```json
{
  "_userId": "string",
  "_collectionId": "string"
}
```

## 🔧 **Como Funciona**

### **1. Geração do UserId**
- **Formato:** `nome_sobrenome`
- **Exemplo:** `lucas_gravina`
- **Processo:**
  - Remove acentos e caracteres especiais
  - Converte para minúsculas
  - Pega as duas primeiras palavras do nome
  - Junta com underscore

### **2. Determinação do CollectionId**

#### **Lógica de Permissões:**
```javascript
// Tipos de tickets para "tk_conteudos"
const conteudosTypes = ['artigos', 'processos', 'roteiros', 'treinamentos', 'recursos'];

// Tipos de tickets para "tk_gestão"  
const gestaoTypes = ['funcionalidades', 'gestao', 'rhFin', 'facilities'];
```

#### **Regras de Determinação:**
1. **`console_chamados`** - Se tem acesso a AMBAS as listas
2. **`tk_conteudos`** - Se tem acesso apenas à lista de conteúdos
3. **`tk_gestão`** - Se tem acesso apenas à lista de gestão
4. **`null`** - Se não tem acesso a nenhuma das listas (ping não enviado)

## 📁 **Arquivos Implementados**

### **1. `src/services/userPingService.js`** ✅
- ✅ `determineCollectionId()` - Determina collectionId baseado em permissões
- ✅ `generateUserId()` - Gera userId no formato nome_sobrenome
- ✅ `sendUserPing()` - Envia ping para o backend
- ✅ `debugUserPermissions()` - Função de debug para desenvolvimento

### **2. `src/contexts/AuthContext.jsx`** ✅
- ✅ Função `login()` atualizada para ser assíncrona
- ✅ Integração automática do ping após login
- ✅ Tratamento de erros sem interromper o login
- ✅ Debug em modo desenvolvimento

### **3. `src/pages/LoginPage.jsx`** ✅
- ✅ Funções de login atualizadas para aguardar o ping
- ✅ Compatibilidade com Google OAuth e login de desenvolvimento

## 🌐 **Configuração do Backend**

### **Endpoint:**
```
POST /api/user-ping
```

### **URL do Backend:**
- **Desenvolvimento:** `http://localhost:3001`
- **Produção:** Configurável via `REACT_APP_BACKEND_URL`

### **Headers:**
```json
{
  "Content-Type": "application/json"
}
```

## 🧪 **Teste e Debug**

### **1. Console do Navegador:**
- ✅ Logs detalhados do processo de ping
- ✅ Debug das permissões em modo desenvolvimento
- ✅ Informações de sucesso/erro

### **2. Exemplo de Debug:**
```javascript
🔍 Debug - Permissões do Usuário
Nome: Lucas Gravina
Email: lucas.gravina@velotax.com.br
UserId gerado: lucas_gravina
CollectionId determinado: console_chamados
Tipos de Tickets: {artigos: true, processos: true, ...}
Tipos de Conteúdo ativos: ["artigos", "processos", "roteiros", "treinamentos", "recursos"]
Tipos de Gestão ativos: ["funcionalidades", "gestao", "rhFin", "facilities"]
```

### **3. Exemplo de Debug - Usuário sem Permissões:**
```javascript
🔍 Debug - Permissões do Usuário
Nome: Ana Silva
Email: ana.silva@velotax.com.br
UserId gerado: ana_silva
CollectionId determinado: null (sem permissões)
Tipos de Tickets: {artigos: false, processos: false, ...}
Tipos de Conteúdo ativos: []
Tipos de Gestão ativos: []
⚠️ Usuário sem permissões para nenhuma collection - ping não será enviado
```

### **4. Exemplo de Ping Enviado:**
```json
{
  "_userId": "lucas_gravina",
  "_collectionId": "console_chamados"
}
```

### **5. Exemplo de Ping Pulado:**
```javascript
⏭️ Ping do usuário pulado: Usuário sem permissões para collections
```

## ⚙️ **Configurações**

### **Variáveis de Ambiente:**
```env
# URL do backend (opcional)
REACT_APP_BACKEND_URL=http://localhost:3001

# Modo de desenvolvimento (automático)
NODE_ENV=development
```

## 🔒 **Segurança**

### **Características:**
- ✅ Não expõe dados sensíveis
- ✅ Falha silenciosa (não interrompe login)
- ✅ Logs apenas em desenvolvimento
- ✅ Validação de dados antes do envio

### **Tratamento de Erros:**
- ✅ Timeout de rede
- ✅ Backend indisponível
- ✅ Dados inválidos
- ✅ Falhas de autenticação

## 📊 **Monitoramento**

### **Logs de Sucesso:**
```
✅ Ping do usuário enviado com sucesso para o backend
```

### **Logs de Ping Pulado:**
```
⏭️ Ping do usuário pulado: Usuário sem permissões para collections
```

### **Logs de Erro:**
```
⚠️ Falha ao enviar ping do usuário: HTTP error! status: 500
❌ Erro ao processar ping do usuário: Network error
```

## 🚀 **Status da Implementação**

- ✅ **Análise do sistema de autenticação** - Concluído
- ✅ **Função de determinação de collectionId** - Concluído  
- ✅ **Função de ping para o backend** - Concluído
- ✅ **Integração no processo de login** - Concluído
- ✅ **Teste da funcionalidade** - Concluído
- ✅ **Implementação de ping pulado** - Concluído

## 📝 **Próximos Passos**

1. **Testar com backend real** - Verificar se o endpoint `/api/user-ping` está funcionando
2. **Configurar URL de produção** - Definir `REACT_APP_BACKEND_URL` para ambiente de produção
3. **Monitorar logs** - Acompanhar sucesso/falha dos pings em produção
4. **Otimizar performance** - Considerar cache ou debounce se necessário

---

**Versão:** v1.1.0  
**Data:** 2024-12-19  
**Autor:** VeloHub Development Team
