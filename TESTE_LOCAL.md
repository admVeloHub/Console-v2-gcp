# 🧪 Teste Local - Integração Módulo de Qualidade

## 📋 Status dos Serviços

### ✅ **SERVIÇOS RODANDO:**
- **Console Principal:** `http://localhost:3000` ✅
- **Projeto QUALIDADE:** `http://localhost:3005` ✅

## 🎯 **Como Testar a Integração**

### **Passo 1: Acessar o Console Principal**
1. Abra o navegador
2. Acesse: `http://localhost:3000`
3. Faça login com suas credenciais Google

### **Passo 2: Navegar para o Módulo de Qualidade**
1. No dashboard, localize o card **"Qualidade"**
2. Clique no card (ícone verde com check)
3. Você será redirecionado para `/qualidade`
4. **Verificar botão "Voltar ao Dashboard"** no topo da página

### **Passo 3: Verificar Carregamento do Iframe**
1. A página deve mostrar:
   - ✅ **Botão "Voltar ao Dashboard"** no topo
   - ✅ Cabeçalho "Módulo de Qualidade" (sem descrição longa)
   - ✅ Loading inicial
   - ✅ Iframe carregando o projeto QUALIDADE
   - ✅ Interface do sistema de qualidade

### **Passo 4: Testar Funcionalidades**
1. **Gestão de Funcionários:**
   - Cadastrar novo funcionário
   - Adicionar acessos
   - Editar informações
   - Exportar relatórios

2. **Módulo de Qualidade:**
   - Criar nova avaliação
   - Testar critérios de avaliação
   - Upload de arquivos de áudio
   - Visualizar relatórios

3. **Agente GPT:**
   - Configurar API (opcional)
   - Testar análise automática
   - Verificar modo fallback

## 🔍 **Verificações Importantes**

### **✅ Interface:**
- [ ] Card "Qualidade" visível no dashboard
- [ ] Navegação funcionando
- [ ] **Botão "Voltar ao Dashboard" presente**
- [ ] Página de qualidade carregando
- [ ] Iframe funcionando corretamente
- [ ] Interface responsiva

### **✅ Funcionalidades:**
- [ ] Sistema de funcionários operacional
- [ ] Módulo de qualidade funcionando
- [ ] Upload de arquivos
- [ ] Exportação de relatórios
- [ ] Sistema de backup

### **✅ Integração:**
- [ ] Iframe carregando sem erros
- [ ] Comunicação entre sistemas
- [ ] Permissões funcionando
- [ ] Navegação fluida

## 🚨 **Possíveis Problemas e Soluções**

### **Problema: Iframe não carrega**
**Solução:**
1. Verificar se `http://localhost:3005` está acessível
2. Verificar console do navegador (F12)
3. Confirmar que não há bloqueios de CORS

### **Problema: Erro de permissão**
**Solução:**
1. Verificar se usuário tem permissão "qualidade"
2. Configurar permissões em `/config`
3. Fazer logout/login novamente

### **Problema: Interface não responsiva**
**Solução:**
1. Verificar se ambos os serviços estão rodando
2. Limpar cache do navegador
3. Recarregar a página

## 📊 **Logs e Debug**

### **Console do Navegador (F12):**
- Verificar erros de JavaScript
- Monitorar requisições de rede
- Verificar logs de carregamento

### **Terminal:**
- Verificar logs dos serviços
- Confirmar que não há erros
- Monitorar uso de recursos

## 🎉 **Teste Bem-Sucedido**

### **Indicadores de Sucesso:**
- ✅ Card "Qualidade" clicável
- ✅ Navegação para `/qualidade`
- ✅ Iframe carregando sem erros
- ✅ Interface do módulo de qualidade visível
- ✅ Funcionalidades operacionais
- ✅ Sem erros no console

## 🔄 **Próximos Passos Após Teste**

### **Se teste for bem-sucedido:**
1. ✅ Integração funcionando corretamente
2. ✅ Pronto para deploy em produção
3. ✅ Pode configurar URL de produção

### **Se houver problemas:**
1. 🔧 Corrigir problemas identificados
2. 🔄 Testar novamente
3. 📝 Documentar soluções

## 📞 **Suporte**

### **Em caso de problemas:**
1. Verificar logs do console (F12)
2. Confirmar que ambos os serviços estão rodando
3. Testar acesso direto a `http://localhost:3005`
4. Verificar configurações de rede/firewall

### **Comandos úteis:**
```bash
# Verificar portas em uso
netstat -an | findstr :3000
netstat -an | findstr :3005

# Reiniciar serviços se necessário
# Console Principal: Ctrl+C e npm start
# Projeto QUALIDADE: Ctrl+C e npm run dev
```

---

## ✅ **CHECKLIST DE TESTE**

### **Serviços:**
- [ ] Console Principal rodando em :3000
- [ ] Projeto QUALIDADE rodando em :3005
- [ ] Ambos acessíveis via navegador

### **Navegação:**
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] Card "Qualidade" visível
- [ ] Navegação para /qualidade

### **Integração:**
- [ ] Página de qualidade carregando
- [ ] Iframe funcionando
- [ ] Interface do módulo visível
- [ ] Sem erros de CORS

### **Funcionalidades:**
- [ ] Sistema de funcionários
- [ ] Módulo de qualidade
- [ ] Upload de arquivos
- [ ] Exportação de dados

---

**🎯 TESTE LOCAL CONFIGURADO E PRONTO!**

**Status:** ✅ **SERVIÇOS RODANDO**  
**Console Principal:** `http://localhost:3000`  
**Projeto QUALIDADE:** `http://localhost:3005`  
**Pronto para teste:** ✅ **SIM**
