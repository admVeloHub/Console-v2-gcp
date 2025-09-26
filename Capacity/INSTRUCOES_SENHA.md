# 🔐 **Instruções do Sistema de Senha - Velotax Capacity**

## 🎯 **Visão Geral**

O sistema Velotax Capacity agora possui proteção por senha para garantir acesso controlado e seguro. Todas as funcionalidades são protegidas até que o usuário seja autenticado.

## 🔑 **Senha Padrão**

- **Senha Atual:** `velotax2024`
- **Localização:** Arquivo `script.js`, linha 2
- **Formato:** Texto simples (não criptografado)

## 🚀 **Como Acessar o Sistema**

### **1. Primeiro Acesso**
1. Abra o sistema no navegador
2. A tela de login será exibida automaticamente
3. Digite a senha: `velotax2024`
4. Clique em "🔓 Acessar Sistema"
5. O sistema redirecionará para a interface principal

### **2. Acessos Subsequentes**
- A sessão é mantida até logout ou fechamento do navegador
- Não é necessário digitar a senha novamente na mesma sessão
- Para acessar de outro dispositivo ou navegador, digite a senha novamente

## 🔒 **Recursos de Segurança**

### **Proteção Total**
- ✅ Interface principal oculta até autenticação
- ✅ Upload de arquivos protegido
- ✅ Processamento protegido
- ✅ Exportação protegida
- ✅ Todas as funcionalidades protegidas

### **Sessão Segura**
- **Persistência:** Mantida durante toda a sessão
- **Logout:** Botão visível no cabeçalho
- **Expiração:** Sessão expira ao fechar o navegador
- **Isolamento:** Cada navegador/dispositivo tem sessão independente

### **Validação de Senha**
- **Campo Obrigatório:** Senha não pode estar vazia
- **Verificação em Tempo Real:** Validação imediata
- **Feedback Visual:** Mensagens de erro claras
- **Foco Automático:** Campo de senha recebe foco após erro

## 🛠️ **Como Alterar a Senha**

### **Opção 1: Edição Manual (Recomendado)**
1. Abra o arquivo `script.js` em um editor de texto
2. Localize a linha 2:
   ```javascript
   const SYSTEM_PASSWORD = 'velotax2024';
   ```
3. Altere `'velotax2024'` para sua nova senha desejada
4. Salve o arquivo
5. Recarregue o sistema no navegador

### **Opção 2: Editor de Código**
1. Abra o projeto no VS Code, Sublime Text ou similar
2. Navegue até `script.js`
3. Use Ctrl+F para localizar `SYSTEM_PASSWORD`
4. Altere a senha
5. Salve e teste

### **Exemplo de Alteração**
```javascript
// ANTES
const SYSTEM_PASSWORD = 'velotax2024';

// DEPOIS
const SYSTEM_PASSWORD = 'minhaNovaSenha123';
```

## ⚠️ **Recomendações de Segurança**

### **Senhas Fortes**
- **Mínimo:** 8 caracteres
- **Recomendado:** 12+ caracteres
- **Incluir:** Letras maiúsculas, minúsculas, números e símbolos
- **Exemplo:** `Vel0t@x2024!`

### **Boas Práticas**
- ✅ Use senhas únicas para cada sistema
- ✅ Evite informações pessoais (nomes, datas)
- ✅ Altere a senha periodicamente
- ✅ Não compartilhe a senha por email ou mensagem
- ✅ Use um gerenciador de senhas se possível

### **Senhas a Evitar**
- ❌ `123456` ou `password`
- ❌ `admin` ou `user`
- ❌ Nome da empresa ou produto
- ❌ Datas de nascimento ou aniversário
- ❌ Sequências de teclado (`qwerty`)

## 🔄 **Gerenciamento de Sessões**

### **Iniciar Sessão**
1. Digite a senha correta
2. Clique em "🔓 Acessar Sistema"
3. Sistema redireciona para interface principal
4. Sessão é criada e mantida

### **Manter Sessão**
- Sessão permanece ativa durante navegação
- Não é necessário reautenticar
- Funciona em todas as abas do mesmo navegador

### **Encerrar Sessão**
1. Clique no botão "🚪 Sair" no cabeçalho
2. Sistema retorna para tela de login
3. Sessão é destruída
4. Todas as funcionalidades são bloqueadas

### **Sessão Expirada**
- Ao fechar o navegador
- Ao limpar dados do navegador
- Ao usar modo privado/incógnito
- Necessário reautenticar

## 🚨 **Solução de Problemas**

### **Senha Não Funciona**
1. **Verifique:** Digitação correta (maiúsculas/minúsculas)
2. **Confirme:** Senha no arquivo `script.js`
3. **Teste:** Recarregue a página
4. **Verifique:** Console do navegador para erros

### **Sistema Não Carrega**
1. **Verifique:** Arquivo `script.js` não foi corrompido
2. **Confirme:** Sintaxe JavaScript válida
3. **Teste:** Console do navegador para erros
4. **Restauração:** Use backup do arquivo original

### **Sessão Perdida**
1. **Verifique:** Navegador não foi fechado
2. **Confirme:** Cookies habilitados
3. **Teste:** Modo privado/incógnito
4. **Solução:** Digite a senha novamente

### **Erro de JavaScript**
1. **Abra:** Console do navegador (F12)
2. **Verifique:** Mensagens de erro
3. **Confirme:** Sintaxe do arquivo `script.js`
4. **Corrija:** Erros de sintaxe se houver

## 📱 **Acesso Multi-Dispositivo**

### **Dispositivos Diferentes**
- Cada dispositivo requer autenticação separada
- Sessões são independentes
- Senha deve ser digitada em cada dispositivo

### **Navegadores Diferentes**
- Cada navegador tem sessão independente
- Chrome, Firefox, Edge, Safari são separados
- Modo privado/incógnito sempre requer senha

### **Redes Diferentes**
- Sessão funciona em qualquer rede
- IP local ou externo não afeta autenticação
- Sessão é baseada no navegador, não na rede

## 🔧 **Configuração Avançada**

### **Alterar Mensagens**
```javascript
// Mensagem de erro de senha incorreta
showLoginError('❌ Senha incorreta. Tente novamente.');

// Mensagem de sucesso no login
showSuccess('🔓 Acesso concedido! Bem-vindo ao sistema.');
```

### **Alterar Comportamento**
```javascript
// Tempo de sessão (em milissegundos)
const SESSION_TIMEOUT = 3600000; // 1 hora

// Número máximo de tentativas
const MAX_ATTEMPTS = 3;
```

### **Personalizar Interface**
```css
/* Cor do botão de login */
.login-btn {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

/* Cor do campo de senha */
.input-group input:focus {
    border-color: #48bb78;
}
```

## 📋 **Checklist de Segurança**

### **Configuração Inicial**
- [ ] Senha padrão alterada
- [ ] Senha forte configurada
- [ ] Sistema testado com nova senha
- [ ] Backup do arquivo original criado

### **Manutenção Regular**
- [ ] Senha alterada periodicamente
- [ ] Acesso auditado regularmente
- [ ] Backup atualizado
- [ ] Sistema testado após mudanças

### **Monitoramento**
- [ ] Logs de acesso verificados
- [ ] Tentativas de login monitoradas
- [ ] Sessões ativas controladas
- [ ] Dispositivos autorizados listados

## 🆘 **Suporte Técnico**

### **Problemas Comuns**
1. **Senha esquecida:** Edite `script.js` e altere a senha
2. **Sistema travado:** Recarregue a página
3. **Erro de JavaScript:** Verifique console do navegador
4. **Sessão perdida:** Digite a senha novamente

### **Contato para Suporte**
- **Documentação:** Consulte este arquivo
- **Logs:** Verifique console do navegador
- **Backup:** Restaure arquivo original se necessário
- **Desenvolvedor:** Entre em contato com a equipe técnica

---

**⚠️ IMPORTANTE:** Este sistema de senha é para controle de acesso básico. Para ambientes de produção com requisitos de segurança elevados, considere implementar autenticação mais robusta (HTTPS, criptografia, banco de dados de usuários, etc.).

**© 2024 Velotax - Sistema de Dimensionamento de Capacity**
