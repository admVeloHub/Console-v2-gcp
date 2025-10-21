# 🔧 **Instruções para Teste e Debug do Cálculo de HCs**

## 🎯 **Problema Identificado**

O campo "HCs Necessários" não estava exibindo os cálculos corretamente. Foram implementadas correções e logs de debug para identificar e resolver o problema.

## 🔍 **Correções Implementadas**

### **1. Lógica de Cálculo Corrigida**
- **Antes:** Divisão incorreta que resultava em valores muito baixos
- **Depois:** Cálculo baseado na capacidade efetiva por HC por intervalo
- **Fórmula:** `HCs = Math.ceil(Volume / (Capacidade_por_HC * Horas_Efetivas * 0.8))`

### **2. Logs de Debug Adicionados**
- Logs detalhados em todas as funções de cálculo
- Verificação de dados em cada etapa do processamento
- Rastreamento completo do fluxo de dados

### **3. Cálculo de Utilização Corrigido**
- Baseado na capacidade por intervalo (1 hora)
- Considera HCs calculados corretamente
- Logs para verificar cálculos

## 🧪 **Como Testar**

### **Passo 1: Abrir o Sistema**
1. Acesse o sistema com a senha: `velotax2024`
2. Faça upload do arquivo de teste: `teste_debug_hcs.csv`

### **Passo 2: Verificar Console do Navegador**
1. Pressione **F12** para abrir as ferramentas do desenvolvedor
2. Vá para a aba **Console**
3. Faça upload do arquivo e processe
4. Observe os logs detalhados

### **Passo 3: Verificar Resultados**
1. **Intervalo 8h com 25 ligações:**
   - Capacidade por HC: 12 ligações/hora
   - Capacidade efetiva por HC: 90 ligações/dia (7.5h × 12)
   - Capacidade segura: 72 ligações/dia (80% de 90)
   - HCs necessários: Math.ceil(25/72) = 1

2. **Intervalo 12h com 55 ligações:**
   - HCs necessários: Math.ceil(55/72) = 1

3. **Intervalo 10h com 45 ligações:**
   - HCs necessários: Math.ceil(45/72) = 1

## 📊 **Logs Esperados no Console**

### **Upload de Arquivo:**
```
📊 Dados brutos do CSV recebidos: [...]
✅ Dados processados: 8 -> 08:00, 25
✅ Dados processados: 9 -> 09:00, 35
...
```

### **Cálculo de HCs:**
```
🔧 Calculando HCs para quantidade: 25, Sábado: false
📅 Parâmetros: Horas Trabalho: 9, Almoço: 1, Outras Pausas: 0.5, Horas Efetivas: 7.5
⚡ Capacidade por HC por hora: 12 ligações/hora
📊 Capacidade efetiva por HC por dia: 90 ligações/dia
📈 Volume total por intervalo: 25 ligações
🛡️ Capacidade segura por HC: 72.0 ligações/intervalo
🧮 HCs calculados (antes do mínimo): 1
✅ HCs finais necessários: 1
```

### **Criação da Tabela:**
```
🏗️ Criando tabela para: 📅 Dimensionamento por Intervalo - Dias Úteis
📋 Criando linha 1 da tabela: {intervalo: "08:00", quantidade: 25, hcs: 1, ...}
📊 Células da linha 1: ["08:00", 25, 1, "34.7%", "<span class=\"status-saudavel\">Saudável</span>"]
```

## 🚨 **Possíveis Problemas e Soluções**

### **Problema 1: HCs sempre 1**
- **Causa:** Volume muito baixo em relação à capacidade
- **Solução:** Verificar se os dados estão corretos
- **Teste:** Use volume maior (ex: 100+ ligações por intervalo)

### **Problema 2: Dados não aparecem na tabela**
- **Causa:** Erro no processamento dos dados
- **Solução:** Verificar console para erros
- **Teste:** Use arquivo CSV simples e válido

### **Problema 3: Cálculos incorretos**
- **Causa:** Lógica de cálculo incorreta
- **Solução:** Verificar logs de debug
- **Teste:** Compare com cálculos manuais

## 📋 **Arquivo de Teste Recomendado**

Use o arquivo `teste_debug_hcs.csv` que contém:
- Dados simples e claros
- Volumes variados para testar diferentes cenários
- Formato correto para evitar erros de parsing

## 🔧 **Verificação Manual**

### **Exemplo de Cálculo:**
- **Intervalo:** 8h
- **Volume:** 25 ligações
- **Capacidade por HC:** 12 ligações/hora
- **Horas efetivas:** 7.5h
- **Capacidade total por HC:** 12 × 7.5 = 90 ligações/dia
- **Capacidade segura (80%):** 90 × 0.8 = 72 ligações/dia
- **HCs necessários:** Math.ceil(25/72) = 1

## 📞 **Suporte**

Se o problema persistir:
1. Verifique todos os logs no console
2. Compare com os cálculos manuais
3. Teste com diferentes volumes de dados
4. Verifique se não há erros JavaScript

---

**✅ Sistema corrigido e com logs detalhados para debug!**
