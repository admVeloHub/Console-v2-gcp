# 🔍 **Diagnóstico do Problema de Acesso ao Servidor**

## 🚨 **Problema: "Não é possível aceder a este site" em localhost:8080**

### **📋 Checklist de Diagnóstico:**

#### **1. Verificar se o Servidor está Rodando**
```bash
# No PowerShell, execute:
netstat -ano | findstr :8080
```
- **Se não retornar nada:** Servidor não está rodando
- **Se retornar algo:** Servidor está rodando, problema é outro

#### **2. Verificar Dependências**
```bash
# Verificar se node_modules existe
dir node_modules

# Se não existir, instalar:
npm install
```

#### **3. Verificar Porta Livre**
```bash
# Verificar se porta 8080 está ocupada
netstat -ano | findstr :8080

# Se estiver ocupada, encerrar processo:
taskkill /PID [PID_NUMERO] /F
```

#### **4. Testar Servidor Simples**
```bash
# Executar arquivo de teste:
teste_servidor.bat
```

## 🔧 **Soluções por Prioridade:**

### **Solução 1: Servidor de Teste (Recomendado)**
1. **Execute:** `teste_servidor.bat`
2. **Aguarde:** Servidor iniciar
3. **Acesse:** http://localhost:8080/teste_servidor.html
4. **Se funcionar:** O problema é com o index.html
5. **Se não funcionar:** Problema é com o servidor

### **Solução 2: Comando Manual**
```bash
# Abrir PowerShell como Administrador
cd "C:\Users\Velotax0961\Documents\Sistemas\Capacity"

# Instalar dependências
npm install

# Iniciar servidor
npx http-server -p 8080 -a 0.0.0.0 -o teste_servidor.html
```

### **Solução 3: Porta Diferente**
```bash
# Se porta 8080 não funcionar, tente 8081:
npx http-server -p 8081 -a 0.0.0.0 -o teste_servidor.html

# Acesse: http://localhost:8081/teste_servidor.html
```

### **Solução 4: Servidor Local Apenas**
```bash
# Servidor apenas para localhost (sem rede):
npx http-server -p 8080 -o teste_servidor.html

# Acesse: http://localhost:8080/teste_servidor.html
```

## 🧪 **Testes de Diagnóstico:**

### **Teste 1: Página de Teste**
- **Arquivo:** `teste_servidor.html`
- **URL:** http://localhost:8080/teste_servidor.html
- **Resultado Esperado:** Página colorida com informações

### **Teste 2: Sistema Principal**
- **Arquivo:** `index.html`
- **URL:** http://localhost:8080/
- **Resultado Esperado:** Tela de login do sistema

### **Teste 3: Arquivo CSV**
- **Arquivo:** `teste_debug_hcs.csv`
- **URL:** http://localhost:8080/teste_debug_hcs.csv
- **Resultado Esperado:** Download do arquivo

## 🚨 **Problemas Comuns e Soluções:**

### **Problema 1: "Servidor não responde"**
- **Causa:** Servidor não iniciou
- **Solução:** Execute `teste_servidor.bat`

### **Problema 2: "Página em branco"**
- **Causa:** Erro no HTML/JavaScript
- **Solução:** Verificar console do navegador (F12)

### **Problema 3: "Erro 404"**
- **Causa:** Arquivo não encontrado
- **Solução:** Verificar se arquivos estão na pasta correta

### **Problema 4: "Acesso negado"**
- **Causa:** Problema de permissão
- **Solução:** Executar como Administrador

## 📊 **Logs de Diagnóstico:**

### **Verificar Logs do Servidor:**
```bash
# Iniciar com logs detalhados:
npx http-server -p 8080 -a 0.0.0.0 -o teste_servidor.html --log-ip
```

### **Verificar Console do Navegador:**
1. Pressione **F12**
2. Vá para aba **Console**
3. Recarregue a página
4. Verifique mensagens de erro

### **Verificar Terminal:**
- Mensagens de erro ao iniciar servidor
- Logs de acesso
- Erros de dependências

## 🎯 **Passos de Resolução:**

### **Passo 1: Diagnóstico Básico**
1. Execute `teste_servidor.bat`
2. Verifique se servidor inicia
3. Teste acesso a `teste_servidor.html`

### **Passo 2: Teste Sistema Principal**
1. Se teste funcionar, acesse `index.html`
2. Verifique se tela de login aparece
3. Teste com senha `velotax2024`

### **Passo 3: Verificação de Rede**
1. Teste acesso local: http://localhost:8080
2. Teste acesso em rede: http://[SEU_IP]:8080
3. Verifique firewall/antivírus

### **Passo 4: Solução de Problemas**
1. Se servidor não inicia: Verificar Node.js
2. Se página não carrega: Verificar arquivos HTML
3. Se sistema não funciona: Verificar JavaScript

## 📞 **Informações para Suporte:**

### **Dados Necessários:**
- **Versão do Windows:** `winver`
- **Versão do Node.js:** `node --version`
- **Versão do NPM:** `npm --version`
- **Mensagens de erro:** Do terminal e navegador
- **Status da porta:** `netstat -ano | findstr :8080`

### **Arquivos de Teste:**
- `teste_servidor.html` - Página de teste simples
- `teste_servidor.bat` - Script de teste do servidor
- `teste_debug_hcs.csv` - Arquivo de teste do sistema

---

**✅ Execute `teste_servidor.bat` primeiro para diagnosticar o problema!**
