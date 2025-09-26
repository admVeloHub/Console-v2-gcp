# 🛠️ **Solução de Problemas - Servidor Velotax Capacity**

## 🚨 **Problemas Comuns e Soluções**

### **1. Erro: "Node.js não está instalado"**

#### **Solução:**
1. Baixe o Node.js em: https://nodejs.org/
2. Escolha a versão **LTS** (recomendado)
3. Execute o instalador
4. **Reinicie o computador** após a instalação
5. Execute novamente o arquivo `.bat`

#### **Verificação:**
```bash
node --version
npm --version
```

### **2. Erro: "Falha ao instalar dependências"**

#### **Solução:**
1. Abra o **PowerShell como Administrador**
2. Navegue até a pasta do projeto:
   ```bash
   cd "C:\Users\[SEU_USUARIO]\Documents\Sistemas\Capacity"
   ```
3. Execute manualmente:
   ```bash
   npm install
   ```

#### **Se persistir:**
```bash
npm cache clean --force
npm install
```

### **3. Erro: "http-server não está disponível"**

#### **Solução:**
1. Instale o http-server globalmente:
   ```bash
   npm install -g http-server
   ```
2. Ou use npx (recomendado):
   ```bash
   npx http-server -p 8080 -a 0.0.0.0 -o --cors
   ```

### **4. Erro: "Porta 8080 já está em uso"**

#### **Solução:**
1. Encerre processos na porta 8080:
   ```bash
   netstat -ano | findstr :8080
   taskkill /PID [PID_NUMERO] /F
   ```
2. Ou use uma porta diferente:
   ```bash
   npx http-server -p 8081 -a 0.0.0.0 -o --cors
   ```

### **5. Erro: "Acesso negado" ou "Permissão"**

#### **Solução:**
1. Execute o arquivo `.bat` como **Administrador**
2. Ou execute no PowerShell como Administrador:
   ```bash
   cd "C:\Users\[SEU_USUARIO]\Documents\Sistemas\Capacity"
   npx http-server -p 8080 -a 0.0.0.0 -o --cors
   ```

## 🔧 **Métodos Alternativos de Inicialização**

### **Método 1: Arquivo BAT Principal**
```bash
iniciar_servidor.bat
```
- ✅ Verificações completas
- ✅ Múltiplos métodos de fallback
- ✅ Instalação automática de dependências

### **Método 2: Arquivo BAT Simples**
```bash
iniciar_servidor_simples.bat
```
- ✅ Mais direto
- ✅ Menos verificações
- ✅ Ideal para problemas de permissão

### **Método 3: PowerShell Manual**
```bash
# Abrir PowerShell como Administrador
cd "C:\Users\[SEU_USUARIO]\Documents\Sistemas\Capacity"
npm install
npx http-server -p 8080 -a 0.0.0.0 -o --cors
```

### **Método 4: CMD Manual**
```bash
# Abrir CMD como Administrador
cd "C:\Users\[SEU_USUARIO]\Documents\Sistemas\Capacity"
npm install
npx http-server -p 8080 -a 0.0.0.0 -o --cors
```

## 📋 **Checklist de Verificação**

### **Antes de Executar:**
- [ ] Node.js instalado (versão 14+)
- [ ] NPM funcionando
- [ ] Pasta do projeto acessível
- [ ] Porta 8080 livre
- [ ] Executando como Administrador (se necessário)

### **Durante a Execução:**
- [ ] Dependências instaladas
- [ ] http-server disponível
- [ ] Servidor iniciado na porta 8080
- [ ] Navegador abriu automaticamente
- [ ] Sistema acessível em http://localhost:8080

### **Após a Execução:**
- [ ] Sistema carrega corretamente
- [ ] Tela de login aparece
- [ ] Senha `velotax2024` funciona
- [ ] Upload de arquivos funciona
- [ ] Cálculos de HCs funcionam

## 🚀 **Comandos de Emergência**

### **Reinstalar Tudo:**
```bash
# Remover node_modules
rmdir /s node_modules

# Limpar cache npm
npm cache clean --force

# Reinstalar dependências
npm install

# Iniciar servidor
npx http-server -p 8080 -a 0.0.0.0 -o --cors
```

### **Verificar Status:**
```bash
# Verificar versões
node --version
npm --version

# Verificar dependências
npm list

# Verificar porta
netstat -ano | findstr :8080
```

### **Logs de Erro:**
```bash
# Ver logs detalhados do npm
npm install --verbose

# Ver logs do servidor
npx http-server -p 8080 -a 0.0.0.0 -o --cors --log-ip
```

## 📞 **Suporte Técnico**

### **Se Nada Funcionar:**
1. **Verifique o console** do navegador (F12)
2. **Verifique o terminal** onde executou o comando
3. **Teste com arquivo simples** primeiro
4. **Verifique firewall** e antivírus
5. **Teste em outro computador** se possível

### **Informações para Suporte:**
- Versão do Windows
- Versão do Node.js
- Versão do NPM
- Mensagens de erro exatas
- Screenshots dos problemas

---

**✅ Use o arquivo `iniciar_servidor_simples.bat` se o principal não funcionar!**
