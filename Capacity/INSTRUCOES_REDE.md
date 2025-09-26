# 🌐 **Instruções para Acesso em Rede - Velotax Capacity**

## 🔐 **Sistema de Senha**

**IMPORTANTE:** O sistema agora possui proteção por senha. Ao acessar de qualquer dispositivo (local ou rede), será necessário digitar a senha de acesso.

- **Senha Padrão:** `velotax2024`
- **Proteção:** Todas as funcionalidades são protegidas até autenticação
- **Sessão:** Mantida durante toda a navegação
- **Logout:** Botão "🚪 Sair" no cabeçalho

> **💡 Dica:** Para alterar a senha, edite o arquivo `script.js` na linha 2.

## 🚀 **Como Iniciar o Servidor**

### **Opção 1: Arquivo BAT (Recomendado)**
1. **Clique duas vezes** no arquivo `iniciar_servidor.bat`
2. **Aguarde** a verificação automática do Node.js
3. **Aguarde** a instalação das dependências (primeira vez)
4. **O navegador abrirá automaticamente** com o sistema
5. **Digite a senha:** `velotax2024`

### **Opção 2: Comando Manual**
1. **Abra o PowerShell** na pasta do projeto
2. **Execute:** `npm install` (primeira vez)
3. **Execute:** `npm run start-network`
4. **Abra o navegador** e acesse `http://localhost:8080`
5. **Digite a senha:** `velotax2024`

## 🌍 **Acessos Disponíveis**

### **Acesso Local (mesmo computador)**
- **URL:** `http://localhost:8080`
- **Senha:** `velotax2024`
- **Funcionalidades:** Todas disponíveis após login

### **Acesso em Rede (outros computadores)**
- **URL:** `http://[SEU_IP]:8080`
- **Senha:** `velotax2024`
- **Funcionalidades:** Todas disponíveis após login
- **Requisito:** Mesma rede local

### **Exemplo Prático**
- **Seu IP:** 192.168.1.100
- **URL de Acesso:** `http://192.168.1.100:8080`
- **Senha:** `velotax2024`
- **Resultado:** Sistema funcionando normalmente

## 🔍 **Como Descobrir seu IP Local**

### **Windows (PowerShell/CMD)**
```bash
ipconfig
```
**Procure por:** "IPv4 Address" ou "Endereço IPv4"

### **Exemplo de Saída:**
```
Adaptador Ethernet Ethernet:
   Endereço IPv4. . . . . . . . . . . . . . . : 192.168.1.100
   Máscara de sub-rede . . . . . . . . . . . . : 255.255.255.0
```

### **Linux/Mac (Terminal)**
```bash
ifconfig
# ou
ip addr show
```

## 📋 **Exemplo de Uso em Rede**

### **Cenário: Escritório com 3 Computadores**
1. **Computador A (Servidor):** Execute `iniciar_servidor.bat`
2. **Computador B:** Acesse `http://192.168.1.100:8080`
3. **Computador C:** Acesse `http://192.168.1.100:8080`
4. **Todos:** Digitem a senha `velotax2024`
5. **Resultado:** Sistema funcionando em todos simultaneamente

### **Vantagens do Acesso em Rede**
- ✅ **Compartilhamento:** Múltiplos usuários simultâneos
- ✅ **Centralização:** Dados e configurações centralizados
- ✅ **Colaboração:** Equipe pode trabalhar em conjunto
- ✅ **Manutenção:** Atualizações em um local só
- ✅ **Backup:** Dados centralizados para backup

## ⚠️ **Requisitos Importantes**

### **Rede Local**
- ✅ **Mesma rede Wi-Fi/LAN** (192.168.x.x, 10.x.x.x)
- ✅ **Firewall desabilitado** ou porta 8080 liberada
- ✅ **Antivírus** não bloqueando conexões
- ✅ **Node.js** instalado no servidor

### **Segurança**
- ✅ **Senha configurada** (padrão: `velotax2024`)
- ✅ **Rede confiável** (evite redes públicas)
- ✅ **Usuários autorizados** apenas
- ✅ **Logout** ao terminar o uso

## 🛠️ **Solução de Problemas**

### **Erro: "Não é possível conectar"**
1. **Verifique:** Servidor está rodando (terminal mostra "Server running")
2. **Confirme:** IP correto (use `ipconfig`)
3. **Teste:** Acesso local funciona (`localhost:8080`)
4. **Verifique:** Firewall/Antivírus não bloqueando

### **Erro: "Senha incorreta"**
1. **Verifique:** Digitação correta da senha
2. **Confirme:** Senha no arquivo `script.js`
3. **Teste:** Acesso local funciona
4. **Solução:** Edite `script.js` se necessário

### **Erro: "Página não carrega"**
1. **Verifique:** Console do navegador (F12)
2. **Confirme:** Servidor rodando sem erros
3. **Teste:** Outro navegador
4. **Verifique:** Arquivos não corrompidos

### **Erro: "Upload não funciona"**
1. **Verifique:** Login realizado com sucesso
2. **Confirme:** Arquivo CSV válido
3. **Teste:** Arquivo de exemplo fornecido
4. **Verifique:** Console para erros JavaScript

## 📱 **Teste de Conectividade**

### **Teste Local (mesmo computador)**
```bash
# Teste se a porta está aberta
netstat -an | findstr :8080
```

### **Teste de Rede (outro computador)**
```bash
# Teste se consegue conectar
ping [SEU_IP]
telnet [SEU_IP] 8080
```

### **Teste no Navegador**
1. **Acesse:** `http://[SEU_IP]:8080`
2. **Verifique:** Tela de login aparece
3. **Digite:** Senha `velotax2024`
4. **Confirme:** Sistema funciona normalmente

## 🎯 **Comandos Úteis**

### **Verificar Status do Servidor**
```bash
# Ver se a porta está em uso
netstat -an | findstr :8080

# Ver processos Node.js
tasklist | findstr node
```

### **Parar Servidor**
```bash
# No terminal onde está rodando: Ctrl+C
# Ou fechar o terminal
```

### **Reiniciar Servidor**
```bash
# Parar (Ctrl+C) e executar novamente
npm run start-network
```

### **Verificar Logs**
```bash
# No terminal do servidor aparecem logs
# No navegador: F12 -> Console
```

## 🔒 **Configurações de Segurança**

### **Alterar Senha Padrão**
1. **Edite:** `script.js` linha 2
2. **Altere:** `'velotax2024'` para sua senha
3. **Salve:** Arquivo
4. **Reinicie:** Servidor

### **Configurar Firewall**
```bash
# Windows - Liberar porta 8080
netsh advfirewall firewall add rule name="Velotax Capacity" dir=in action=allow protocol=TCP localport=8080
```

### **Configurar Antivírus**
- **Adicionar exceção** para a pasta do projeto
- **Liberar porta 8080** nas configurações
- **Permitir** conexões de rede locais

## 📊 **Monitoramento de Uso**

### **Verificar Usuários Ativos**
- **Console do servidor** mostra conexões
- **Navegador** mostra sessões ativas
- **Logs** registram acessos

### **Controle de Acesso**
- **Senha única** para todos os usuários
- **Sessões independentes** por dispositivo
- **Logout automático** ao fechar navegador

## 🚀 **Próximos Passos**

### **Configuração Inicial**
1. ✅ **Servidor funcionando** localmente
2. ✅ **Acesso em rede** configurado
3. ✅ **Senha alterada** (recomendado)
4. ✅ **Teste completo** realizado

### **Uso em Produção**
1. **Treinar equipe** no uso do sistema
2. **Configurar backups** regulares
3. **Monitorar** uso e performance
4. **Atualizar** senha periodicamente

---

**💡 Dica:** Para melhor segurança em ambientes corporativos, considere implementar HTTPS e autenticação mais robusta.

**© 2024 Velotax - Sistema de Dimensionamento de Capacity**

## 📊 **Entrada de Dados**

O sistema aceita arquivos nos seguintes formatos:
- **Excel (.xlsx)** - Formato moderno do Excel
- **Excel (.xls)** - Formato legado do Excel
- **CSV (.csv)** - Arquivo de texto separado por vírgulas

**Formato obrigatório:** 2 colunas com cabeçalho "Intervalo de ligações,Quantidade média de ligações recebidas por intervalo"
