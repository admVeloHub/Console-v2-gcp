# 📊 **Dimensionamento Comparativo por Intervalos**

## 🎯 **Nova Funcionalidade Implementada**

### **✅ O que foi adicionado:**

O sistema agora exibe **duas colunas separadas** para os cálculos de HCs:
- **HCs (Capacidade por HC)**: Cálculo baseado na capacidade máxima por HC
- **HCs (Capacidade Segura)**: Cálculo baseado na capacidade segura (reduzida)

Isso permite **comparar ambas as abordagens** e tomar decisões informadas sobre o dimensionamento.

### **📋 Nova Estrutura das Tabelas:**

#### **Colunas da Tabela de Dimensionamento:**

1. **Intervalo de Ligações** - Horário (ex: 08:00, 09:00)
2. **Quantidade Média** - Volume de ligações no intervalo
3. **🆕 Capacidade por HC** - Ligações/hora que cada HC pode atender
4. **🆕 Capacidade Segura** - Capacidade reduzida para margem de segurança
5. **🆕 HCs (Capacidade por HC)** - Cálculo baseado na capacidade máxima
6. **🆕 HCs (Capacidade Segura)** - Cálculo baseado na capacidade segura
7. **Utilização (% da capacidade)** - Percentual de uso da capacidade total
8. **Status** - Indicador visual (Saudável, Atenção, Crítico)

### **🔢 Como os Valores são Calculados:**

#### **Capacidade por HC:**
```
Capacidade por HC = (3600 ÷ TMA_em_segundos) × 0.80
```

**Exemplo com TMA = 5 minutos:**
- TMA em segundos: 300
- Capacidade teórica: 3600 ÷ 300 = 12 ligações/hora
- Capacidade por HC: 12 × 0.80 = **9.6 ligações/hora**

#### **Capacidade Segura:**
```
Capacidade Segura = Capacidade por HC × 0.80
```

**Exemplo:**
- Capacidade por HC: 9.6 ligações/hora
- Capacidade Segura: 9.6 × 0.80 = **7.7 ligações/hora**

#### **HCs Necessários - Duas Abordagens:**

**Abordagem 1 - Capacidade por HC:**
```
HCs Base = Math.ceil(Volume ÷ Capacidade por HC)
HCs Finais = Math.ceil(HCs Base × 1.3)  // +30% margem de segurança
```

**Abordagem 2 - Capacidade Segura:**
```
HCs Base = Math.ceil(Volume ÷ Capacidade Segura)
HCs Finais = Math.ceil(HCs Base × 1.3)  // +30% margem de segurança
```

**Exemplo com Volume = 30 ligações:**
- **Capacidade por HC**: 9.6 lig/h
- **Capacidade Segura**: 7.7 lig/h

**Abordagem 1 (Capacidade por HC):**
- HCs Base: Math.ceil(30 ÷ 9.6) = Math.ceil(3.13) = 4 HCs
- HCs Finais: Math.ceil(4 × 1.3) = Math.ceil(5.2) = **6 HCs**
- **Fórmula Exibida**: 
  ```
  6 HCs
  (30 ÷ 9.6 = 4 × 1.3)
  ```

**Abordagem 2 (Capacidade Segura):**
- HCs Base: Math.ceil(30 ÷ 7.7) = Math.ceil(3.90) = 4 HCs
- HCs Finais: Math.ceil(4 × 1.3) = Math.ceil(5.2) = **6 HCs**
- **Fórmula Exibida**: 
  ```
  6 HCs
  (30 ÷ 7.7 = 4 × 1.3)
  ```

### **📊 Exemplo de Tabela Completa:**

| Intervalo | Quantidade | Capacidade por HC | Capacidade Segura | HCs (Capacidade por HC) | HCs (Capacidade Segura) | Utilização | Status |
|-----------|------------|-------------------|-------------------|------------------------|-------------------------|------------|--------|
| 08:00     | 27         | 9.6 lig/h         | 7.7 lig/h         | 5 HCs<br><small>(27 ÷ 9.6 = 3 × 1.3)</small> | 6 HCs<br><small>(27 ÷ 7.7 = 4 × 1.3)</small> | 46.5%      | Saudável |
| 09:00     | 42         | 9.6 lig/h         | 7.7 lig/h         | 7 HCs<br><small>(42 ÷ 9.6 = 5 × 1.3)</small> | 8 HCs<br><small>(42 ÷ 7.7 = 6 × 1.3)</small> | 54.1%      | Saudável |
| 10:00     | 37         | 9.6 lig/h         | 7.7 lig/h         | 6 HCs<br><small>(37 ÷ 9.6 = 4 × 1.3)</small> | 7 HCs<br><small>(37 ÷ 7.7 = 5 × 1.3)</small> | 55.7%      | Saudável |

### **🔄 Recálculo Automático:**

Quando você alterar qualquer parâmetro:
- **TMA** (Tempo Médio de Atendimento)
- **Horário de Trabalho** (Dias Úteis ou Sábado)
- **Horário de Almoço** (Dias Úteis ou Sábado)
- **Outras Pausas** (Dias Úteis ou Sábado)

**Todas as colunas** são recalculadas automaticamente:
- ✅ Capacidade por HC
- ✅ Capacidade Segura
- ✅ HCs Necessários
- ✅ Utilização
- ✅ Status

### **📤 Exportação para Excel:**

A exportação para Excel agora inclui **todas as 8 colunas**:
- Planilha "Dias Úteis" com todos os detalhes
- Planilha "Sábado" com todos os detalhes
- Valores formatados e prontos para análise

### **🎯 Benefícios da Nova Funcionalidade:**

1. **Comparação Direta**: Você pode ver lado a lado ambas as abordagens de cálculo
2. **Tomada de Decisão**: Escolher entre abordagem mais conservadora (Capacidade Segura) ou mais eficiente (Capacidade por HC)
3. **Análise de Impacto**: Entender quantos HCs a mais/menos cada abordagem requer
4. **Otimização**: Encontrar o equilíbrio ideal entre eficiência e segurança
5. **Transparência Total**: Ver exatamente como cada cálculo foi feito
6. **Documentação Completa**: Exportar relatórios com ambas as opções para análise

### **🧪 Como Testar:**

1. **Recarregue a página** (Ctrl+F5)
2. **Faça upload** dos arquivos de Dias Úteis e Sábado
3. **Processe o dimensionamento**
4. **Observe as novas colunas** nas tabelas
5. **Altere o TMA** e veja os valores recalcularem
6. **Exporte para Excel** e verifique todas as colunas

### **📈 Impacto nos Cálculos:**

Esta funcionalidade **não altera** os cálculos existentes, apenas os **torna visíveis**. Os valores mostrados são exatamente os mesmos que já estavam sendo utilizados internamente pelo sistema.

---

**✅ Implementação Concluída - Sistema Comparativo Completo!**
