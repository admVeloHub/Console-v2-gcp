# 🔄 Recuperação de Dados - Controles de HCs

## Problema Identificado
Os dados cadastrados anteriormente na porta 3000 não aparecem mais porque o `localStorage` é específico para cada porta/domínio.

## 🚀 Soluções Disponíveis

### 1. Migração Automática (Recomendado)
1. Acesse http://localhost:3001/
2. Faça login com a senha: `velotax2024`
3. Clique no botão **"Migrar/Importar Dados"** (botão amarelo no cabeçalho)
4. Clique em **"Tentar Migração Automática"**
5. O sistema tentará recuperar dados automaticamente

### 2. 🚨 Migração Forçada (Mais Agressiva)
Se a migração automática não funcionar:
1. No mesmo modal de migração
2. Clique em **"Migração Forçada"** (botão vermelho)
3. Esta opção:
   - Limpa dados atuais
   - Busca em TODAS as chaves do localStorage
   - Tenta múltiplas estratégias de normalização
   - É mais agressiva na busca de dados

### 3. 📋 Importação Manual via JSON
Se nenhuma migração automática funcionar:

#### Passo 1: Exportar dados da porta 3000
1. Abra uma nova aba no navegador
2. Acesse http://localhost:3000/ (se ainda estiver rodando)
3. Faça login
4. Abra o Console do navegador (F12 → Console)
5. Cole e execute este comando:
```javascript
console.log(JSON.stringify(JSON.parse(localStorage.getItem('funcionarios_velotax')), null, 2))
```
6. Copie todo o resultado (JSON)

#### Passo 2: Importar na porta 3001
1. Volte para http://localhost:3001/
2. Clique em **"Migrar/Importar Dados"**
3. Cole o JSON copiado no campo de texto
4. Clique em **"Importar Dados"**

### 4. 🔍 Verificação Manual do localStorage
Se você quiser verificar manualmente:

1. Abra o Console do navegador (F12 → Console)
2. Execute estes comandos para ver todas as chaves:
```javascript
Object.keys(localStorage)
```

3. Para ver dados de uma chave específica:
```javascript
localStorage.getItem('NOME_DA_CHAVE')
```

## 🆕 Novas Funcionalidades de Migração

### Migração Automática Inteligente
- ✅ Busca em múltiplas chaves do localStorage
- ✅ Normaliza dados automaticamente
- ✅ Suporta diferentes formatos de dados
- ✅ Logs detalhados no console

### Migração Forçada
- 🚨 Limpa dados atuais para forçar nova migração
- 🔍 Busca em TODAS as chaves disponíveis
- 🧹 Normalização agressiva de dados
- 📊 Logs completos de todo o processo

## 📁 Arquivos de Backup
- O sistema agora cria automaticamente backups em JSON
- Use o botão **"Exportar Backup"** para salvar seus dados
- Guarde esses arquivos para futuras migrações

## 🆘 Se Nada Funcionar
1. Verifique se o servidor da porta 3000 ainda está rodando
2. Tente acessar http://localhost:3000/ em uma nova aba
3. Se conseguir acessar, exporte os dados manualmente
4. Se não conseguir, os dados podem ter sido perdidos

## 💡 Prevenção Futura
- Sempre use o botão **"Exportar Backup"** antes de mudar portas
- Mantenha cópias dos arquivos JSON de backup
- Use sempre a mesma porta para evitar perda de dados

## 🔧 Debug e Logs
O sistema agora inclui logs detalhados no console do navegador:
1. Abra o Console (F12 → Console)
2. Execute a migração
3. Veja todos os passos do processo
4. Identifique onde podem estar os problemas

## 📞 Suporte
Se precisar de ajuda adicional, verifique:
1. Console do navegador para logs detalhados
2. Logs do servidor
3. Status da conexão com a porta 3001
4. Mensagens de erro específicas

---
**Sistema Controles de HCs - Velotax**
*Porta atual: 3001*
*Senha: velotax2024*

## 🎯 Ordem Recomendada de Tentativas
1. **Migração Automática** (mais segura)
2. **Migração Forçada** (mais agressiva)
3. **Importação Manual** (se necessário)
4. **Verificação Manual** (para debug)
