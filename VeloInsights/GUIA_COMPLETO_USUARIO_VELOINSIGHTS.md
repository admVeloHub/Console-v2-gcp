# 📚 GUIA COMPLETO DO USUÁRIO - VeloInsights

## 🎯 Visão Geral do Sistema

O **VeloInsights** é um dashboard analítico para análise de dados de call center e tickets de atendimento. O sistema oferece métricas em tempo real, análise por operador e visualizações interativas para tomada de decisões estratégicas.

---

## 🔐 1. ACESSO E AUTENTICAÇÃO

### 1.1 Primeiro Acesso
1. **Acesse o sistema**: Abra o navegador e vá para a URL do VeloInsights
2. **Login com Google**: Clique em "Entrar com Google"
3. **Autorização**: Aceite as permissões solicitadas pelo Google
4. **Seleção de Cargo**: Após o login, escolha seu cargo:
   - 👑 **Administrador** (acesso total)
   - 👔 **Gestão** (acesso gerencial)
   - 📊 **Monitor** (acesso de monitoramento)
   - 👤 **Editor** (acesso limitado)

### 1.2 Troca de Cargo
- **Como**: Clique no seu nome no canto superior direito → "Trocar Cargo"
- **Disponível**: Cada cargo pode assumir cargos de nível igual ou inferior
- **Efeito**: As permissões e dados visíveis mudam conforme o cargo selecionado

---

## 📊 2. DASHBOARD PRINCIPAL

### 2.1 Métricas Gerais (55PBX - Ligações)
O dashboard principal mostra métricas de ligações do sistema 55PBX:

#### 📈 Cards de Métricas:
- **📞 Total de Chamadas**: Número total de ligações recebidas
- **⏳ Retida na URA**: Chamadas que não foram atendidas
- **✅ Atendida**: Chamadas efetivamente atendidas
- **❌ Abandonada**: Chamadas desligadas pelo cliente
- **⏱️ Tempo Médio de Espera**: Tempo médio na fila
- **📞 Tempo Médio de Atendimento**: Duração média das ligações
- **📊 Taxa de Atendimento**: Percentual de chamadas atendidas

#### 🎯 Funcionalidades:
- **Filtros por Período**: 
  - Últimos 7 dias
  - Últimos 15 dias
  - Últimos 30 dias
  - Últimos 60 dias
  - Mês atual
  - Mês anterior
  - Período personalizado
  - Todos os registros

### 2.2 Métricas OCTA (Tickets)
Seção dedicada à análise de tickets de atendimento:

#### 📋 Cards de Métricas:
- **🎫 Total de Tickets**: Número total de tickets no sistema
- **❓ Tickets não designados**: Tickets sem responsável atribuído
- **📈 Performance Geral**: Percentual de avaliações positivas
- **✅ Tickets Avaliados**: Total de tickets com avaliação
- **👍 Bom**: Avaliações positivas sem comentário
- **👍 Bom com comentário**: Avaliações positivas com comentário
- **👎 Ruim**: Avaliações negativas sem comentário
- **👎 Ruim com comentário**: Avaliações negativas com comentário

---

## 👤 3. VISUALIZAR POR AGENTE

### 3.1 Acesso
- **Menu**: Sidebar → "Visualizar por Agente"
- **Disponível**: Apenas para cargos Administrador, Gestão e Monitor
- **Operadores**: Não têm acesso a esta seção

### 3.2 Seleção de Operador
1. **Lista de Operadores**: Visualize todos os operadores disponíveis
2. **Informações Exibidas**:
   - Nome do operador
   - Total de chamadas
   - Taxa de atendimento
   - Ranking de performance
3. **Seleção**: Clique no operador desejado

### 3.3 Seleção de Período
Após selecionar um operador, escolha o período de análise:

#### 📅 Opções Disponíveis:
- **Últimos 7 dias**
- **Últimos 15 dias**
- **Últimos 30 dias**
- **Mês atual**
- **Mês anterior**
- **Período personalizado**: Defina datas específicas

### 3.4 Análise Detalhada
Quando há dados para o período selecionado:

#### 📊 Métricas do Operador:
- **Total de chamadas**: Número de ligações do operador
- **Taxa de atendimento**: Percentual de chamadas atendidas
- **Tempo médio de atendimento**: Duração média das ligações
- **Performance geral**: Pontuação consolidada

#### 📈 Gráfico de Evolução:
- **Eixo X**: Meses analisados
- **Eixo Y**: Pontuação de performance (0-100)
- **Visualização**: Linha de tendência da performance

### 3.5 Casos Especiais

#### ❌ Nenhum Dado Encontrado
Quando não há dados para o período selecionado:

1. **Mensagem Informativa**: "Infelizmente não pude localizar dados para [Operador] neste período"
2. **Opções Disponíveis**:
   - **📧 Contatar suporte para análise**: Abre modal de suporte
   - **📅 Selecionar outro período**: Volta ao seletor de período
   - **👥 Voltar à lista de operadores**: Retorna à seleção de operadores

#### 📧 Sistema de Suporte
- **Acesso**: Clique em "Contatar suporte para análise"
- **Modal**: Abre card para envio de solicitação
- **Preenchimento**: Descreva o problema encontrado
- **Envio**: Clique em "Enviar" para abrir cliente de email
- **Destinatário**: gabriel.araujo@velotax.com.br

---

## 📋 4. ANÁLISE DE TICKET POR OPERADOR

### 4.1 Acesso
- **Menu**: Sidebar → "Análise de Ticket por Operador"
- **Disponível**: Para todos os cargos
- **Fonte**: Dados da planilha OCTA

### 4.2 Seleção de Operador
1. **Dropdown**: Selecione o operador desejado
2. **Opções**: Todos os operadores com tickets atribuídos

### 4.3 Controles de Visualização
Três botões horizontais para diferentes visualizações:

#### 🎫 Número do Ticket
- **Visualização**: Lista de tickets com números
- **Formato**: "Ticket #99953580"
- **Links**: Números são clicáveis e abrem no OCTA
- **URL**: `https://app.octadesk.com/ticket/edit/{numero}`

#### 👥 Responsáveis
- **Visualização**: Lista de operadores responsáveis
- **Agrupamento**: Tickets agrupados por responsável

#### 📊 Quantidade de Avaliações
- **Visualização**: Contadores de avaliações
- **Categorias**: Bom, Ruim, com/sem comentário

### 4.4 Métricas do Operador Selecionado

#### 📈 Cards de Performance:
- **Total de tickets**: Todos os tickets do operador
- **Tickets com avaliação**: Tickets que foram avaliados
- **Tickets sem avaliação**: Tickets sem avaliação
- **Média de Performance**: Percentual de avaliações positivas

#### 📋 Detalhamento das Avaliações:

##### ✅ Notas Boas
- **Formato**: "Ticket #99953580 - Bom" ou "Ticket #99953580 - Bom com comentário"
- **Comentários**: Clique para revelar/ocultar comentários
- **Links**: Números de ticket são clicáveis

##### ❌ Notas Ruins
- **Formato**: "Ticket #99953580 - Ruim" ou "Ticket #99953580 - Ruim com comentário"
- **Comentários**: Clique para revelar/ocultar comentários
- **Links**: Números de ticket são clicáveis

---

## 📈 5. GRÁFICOS DETALHADOS

### 5.1 Acesso
- **Menu**: Sidebar → "Gráficos Detalhados"
- **Disponível**: Quando há dados carregados
- **Conteúdo**: Visualizações avançadas das métricas

### 5.2 Tipos de Gráficos
- **Gráficos de linha**: Evolução temporal
- **Gráficos de barras**: Comparativos
- **Gráficos de pizza**: Distribuições percentuais
- **Gráficos de área**: Volume acumulado

---

## ⚙️ 6. CONFIGURAÇÕES E PREFERÊNCIAS

### 6.1 Tema
- **Alternância**: Botão no cabeçalho (🌙/☀️)
- **Opções**: Tema claro e tema escuro
- **Persistência**: Configuração salva automaticamente

### 6.2 Preferências do Usuário
- **Acesso**: Clique no seu nome → "Preferências"
- **Configurações**: Personalizações do dashboard
- **Salvamento**: Automático

---

## 🔍 7. FILTROS E PERÍODOS

### 7.1 Filtros Disponíveis
- **Por Período**: Datas específicas ou períodos predefinidos
- **Por Operador**: Análise individual
- **Por Tipo de Chamada**: Atendida, abandonada, retida na URA
- **Por Avaliação**: Bom, ruim, com/sem comentário

### 7.2 Períodos Predefinidos
- **Últimos 7 dias**
- **Últimos 15 dias**
- **Últimos 30 dias**
- **Últimos 60 dias**
- **Mês atual**
- **Mês anterior**
- **Período personalizado**
- **Todos os registros**

### 7.3 Período Personalizado
1. **Seleção**: Escolha "Período personalizado"
2. **Data Inicial**: Defina a data de início
3. **Data Final**: Defina a data de fim
4. **Validação**: Sistema verifica se datas são válidas
5. **Aplicação**: Clique em "Aplicar Filtro"

---

## 📱 8. NAVEGAÇÃO E INTERFACE

### 8.1 Menu Lateral (Sidebar)
- **Abertura**: Clique no ícone de menu (☰)
- **Fechamento**: Clique fora do menu ou no ícone novamente
- **Seções Disponíveis**:
  - 📊 Dashboard Principal
  - 📈 Gráficos Detalhados
  - 👤 Visualizar por Agente (conforme cargo)
  - 📋 Análise de Ticket por Operador

### 8.2 Cabeçalho
- **Logo**: VeloInsights
- **Tema**: Botão de alternância claro/escuro
- **Usuário**: Nome e opções do usuário
- **Cargo**: Indicador do cargo atual

### 8.3 Responsividade
- **Desktop**: Interface completa
- **Tablet**: Layout adaptado
- **Mobile**: Interface otimizada para touch

---

## 🚨 9. SITUAÇÕES ESPECIAIS

### 9.1 Sem Dados
- **Indicação**: Mensagem clara de ausência de dados
- **Ações**: Opções para contatar suporte ou alterar filtros
- **Suporte**: Sistema integrado de contato

### 9.2 Erros de Conexão
- **Indicação**: Mensagens de erro claras
- **Recuperação**: Tentativas automáticas de reconexão
- **Suporte**: Opções de contato para problemas persistentes

### 9.3 Permissões Insuficientes
- **Indicação**: Mensagem explicativa
- **Solução**: Contato com administrador
- **Alternativas**: Funcionalidades disponíveis para o cargo

---

## 📞 10. SUPORTE E CONTATO

### 10.1 Suporte Integrado
- **Acesso**: Disponível em várias seções do sistema
- **Modal**: Interface amigável para descrição do problema
- **Email**: Envio automático para gabriel.araujo@velotax.com.br

### 10.2 Informações do Sistema
- **Período**: Informações sobre o período selecionado
- **Dados**: Detalhes sobre os dados carregados
- **Status**: Indicadores de carregamento e processamento

---

## 🎯 11. FLUXOS PRINCIPAIS

### 11.1 Análise Geral de Performance
1. **Acesso**: Dashboard Principal
2. **Seleção**: Escolha período desejado
3. **Visualização**: Analise métricas gerais
4. **Comparação**: Compare com períodos anteriores

### 11.2 Análise Individual de Operador
1. **Acesso**: Visualizar por Agente
2. **Seleção**: Escolha operador específico
3. **Período**: Defina período de análise
4. **Análise**: Visualize performance individual
5. **Detalhamento**: Explore métricas específicas

### 11.3 Análise de Tickets
1. **Acesso**: Análise de Ticket por Operador
2. **Seleção**: Escolha operador
3. **Visualização**: Selecione tipo de visualização
4. **Detalhamento**: Explore tickets específicos
5. **Ação**: Clique em tickets para acessar no OCTA

### 11.4 Investigação de Problemas
1. **Identificação**: Problema encontrado no sistema
2. **Suporte**: Clique em "Contatar suporte"
3. **Descrição**: Descreva o problema detalhadamente
4. **Envio**: Envie solicitação por email
5. **Acompanhamento**: Aguarde resposta da equipe

---

## 📋 12. DICAS E BOAS PRÁTICAS

### 12.1 Navegação Eficiente
- **Use filtros**: Aplique períodos específicos para análises focadas
- **Compare períodos**: Analise tendências comparando diferentes períodos
- **Explore detalhes**: Clique em elementos para obter mais informações

### 12.2 Análise de Dados
- **Contexto**: Considere fatores externos que podem afetar as métricas
- **Tendências**: Observe padrões ao longo do tempo
- **Comparações**: Compare operadores e períodos para insights

### 12.3 Uso do Sistema
- **Atualizações**: Os dados são atualizados automaticamente
- **Performance**: Use filtros para melhorar a performance com grandes volumes
- **Suporte**: Não hesite em contatar suporte para dúvidas ou problemas

---

## 🔄 13. ATUALIZAÇÕES E MANUTENÇÃO

### 13.1 Atualizações Automáticas
- **Dados**: Atualizados em tempo real
- **Interface**: Melhorias contínuas
- **Notificações**: Informações sobre atualizações importantes

### 13.2 Manutenção Programada
- **Horários**: Geralmente fora do horário comercial
- **Notificação**: Avisos prévios sobre manutenções
- **Duração**: Tempo estimado de indisponibilidade

---

*Este guia foi criado para ajudar usuários a aproveitar ao máximo as funcionalidades do VeloInsights. Para dúvidas específicas ou problemas técnicos, utilize o sistema de suporte integrado.*
