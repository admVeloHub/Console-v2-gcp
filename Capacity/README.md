# 📊 **Velotax Capacity - Sistema de Dimensionamento de Call Center**

Sistema profissional para cálculo de capacidade de call center utilizando o modelo matemático **Erlang C**, desenvolvido especificamente para a Velotax.

## 🔐 **Sistema de Segurança**

O sistema possui proteção por senha para garantir acesso controlado:

- **Senha Padrão:** `velotax2024`
- **Sessão Persistente:** A sessão é mantida até logout ou fechamento do navegador
- **Logout Seguro:** Botão de logout no cabeçalho para encerrar a sessão
- **Proteção Total:** Todas as funcionalidades são protegidas até autenticação

> **⚠️ Importante:** Para produção, recomenda-se alterar a senha padrão no arquivo `script.js` (linha 2: `const SYSTEM_PASSWORD = 'velotax2024';`) para uma senha mais segura.

## 🎯 **Objetivo**

Calcular a quantidade ideal de pessoas (HCs) necessárias para atender a demanda de ligações em um call center, considerando diferentes jornadas de trabalho para dias úteis e sábados.

## 📈 **Metodologia**

Utiliza o modelo matemático **Erlang C** para análise de filas, considerando:
- Volume de ligações por intervalo
- Tempo médio de atendimento (TMA)
- Nível de serviço desejado
- Jornadas de trabalho diferenciadas (dias úteis vs. sábado)

## 📊 **Entrada de Dados**

Arquivos com **2 colunas obrigatórias** nos formatos:
- **Excel (.xlsx, .xls)**
- **CSV (.csv)**

**Colunas obrigatórias:**
1. **"Intervalo de ligações"** - Horário do intervalo (ex: 8, 9, 10 ou 8:00, 9:00, 10:00)
2. **"Quantidade média de ligações recebidas por intervalo"** - Volume de chamadas

### **Formato de Arquivo**
```csv
Intervalo de ligações,Quantidade média de ligações recebidas por intervalo
8,30
9,45
10,60
11,50
12,70
13,45
14,35
15,30
16,25
17,20
```

**Formatos aceitos:**
- ✅ **Excel (.xlsx)** - Formato moderno do Excel
- ✅ **Excel (.xls)** - Formato legado do Excel  
- ✅ **CSV (.csv)** - Arquivo de texto separado por vírgulas

## ⚙️ **Parâmetros do Sistema**

### **📅 Dias Úteis (Segunda à Sexta)**
- **Horário de Trabalho:** 9 horas/dia
- **Horário de Almoço:** 1 hora
- **Outras Pausas:** 30 minutos
- **Horas Efetivas:** 7.5 horas
- **Capacidade por HC:** 15 ligações/hora
- **Capacidade Segura:** 11.25 ligações/hora

### **📅 Sábado**
- **Horário de Trabalho:** 6 horas/dia
- **Horário de Almoço:** 0 horas (sem almoço)
- **Outras Pausas:** 30 minutos
- **Horas Efetivas:** 5.5 horas
- **Capacidade por HC:** 11 ligações/hora
- **Capacidade Segura:** 8.25 ligações/hora

### **🌍 Parâmetros Globais**
- **Tempo Médio de Atendimento (TMA):** 5 minutos (300 segundos)
- **Nível de Serviço:** 80% das ligações atendidas em até 20 segundos
- **Abandono:** 5%

## 📝 **Funcionalidades**

### **🔐 Autenticação Segura**
- Tela de login com senha
- Sessão persistente
- Logout seguro
- Proteção de todas as funcionalidades

### **📁 Upload de Arquivos**
- Upload separado para dias úteis e sábado
- **Suporte completo:** Excel (.xlsx, .xls) e CSV (.csv)
- Validação automática de formato
- Processamento inteligente por tipo de arquivo
- Feedback visual do status do upload

### **🚀 Processamento Inteligente**
- Cálculo automático de HCs necessários
- Análise por intervalo de tempo
- Cálculo de utilização da capacidade
- Classificação de status (Saudável, Atenção, Crítico)

### **📊 Resultados Detalhados**
- Tabelas separadas para dias úteis e sábado
- Estatísticas de utilização média
- Análise por intervalo de tempo
- Indicadores visuais de status

### **📊 Exportação para Excel**
- Múltiplas abas (Dias Úteis, Sábado, Resumo)
- Formatação preservada
- Nome de arquivo com timestamp
- Download automático

### **🌐 Acesso em Rede**
- Servidor HTTP configurado automaticamente
- Acesso local e em rede
- Compatível com todos os dispositivos
- Configuração automática de CORS

## 🚀 **Como Executar**

### **Opção 1: Acesso Local**
1. Abra o arquivo `index.html` em qualquer navegador moderno
2. Digite a senha: `velotax2024`
3. Faça upload dos arquivos CSV
4. Processe o dimensionamento

### **Opção 2: Acesso em Rede (Recomendado)**
1. Execute o arquivo `iniciar_servidor.bat`
2. Aguarde a instalação das dependências
3. O navegador abrirá automaticamente
4. Acesse de outros computadores usando `http://[SEU_IP]:8080`

### **Opção 3: Servidor Simples (Se Opção 2 falhar)**
1. Execute o arquivo `iniciar_servidor_simples.bat`
2. Mais direto e com menos verificações
3. Ideal para problemas de permissão

### **Opção 4: Comando Manual (Para usuários avançados)**
```bash
# Abrir PowerShell como Administrador
cd "C:\Users\[SEU_USUARIO]\Documents\Sistemas\Capacity"
npm install
npx http-server -p 8080 -a 0.0.0.0 -o --cors
```

## 🛠️ **Solução de Problemas**

### **Problemas Comuns do Servidor:**
- **Node.js não instalado:** Baixe em https://nodejs.org/ (versão LTS)
- **Dependências não instalam:** Execute `npm install` manualmente
- **Porta 8080 ocupada:** Use `netstat -ano | findstr :8080` para verificar
- **Permissão negada:** Execute como Administrador

### **Arquivos de Solução:**
- **`SOLUCAO_PROBLEMAS_SERVIDOR.md`** - Guia completo de troubleshooting
- **`iniciar_servidor_simples.bat`** - Versão alternativa do servidor
- **`INSTRUCOES_TESTE_HCS.md`** - Instruções para testar o sistema

### **Comandos de Emergência:**
```bash
# Reinstalar tudo
rmdir /s node_modules
npm cache clean --force
npm install

# Verificar status
node --version
npm --version
npm list
```

## 📊 **Exportação para Excel**

### **Funcionalidades da Exportação**
- **Múltiplas Abas:** Dias Úteis, Sábado e Resumo
- **Formatação Preservada:** Dados organizados e legíveis
- **Timestamp:** Nome de arquivo com data e hora
- **Download Automático:** Arquivo salvo automaticamente

### **Como Exportar**
1. Processe o dimensionamento
2. Clique no botão "📊 Exportar para Excel"
3. O arquivo será baixado automaticamente
4. Nome padrão: `Dimensionamento_CallCenter_[DATA]_[HORA].xlsx`

## 🌐 **Acesso em Rede**

### **Configuração Automática**
- **Porta:** 8080
- **IP Local:** http://localhost:8080
- **IP Rede:** http://[SEU_IP]:8080
- **CORS:** Configurado automaticamente

### **Como Descobrir seu IP**
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

### **Acesso de Outros Dispositivos**
1. Descubra seu IP local
2. Acesse: `http://[SEU_IP]:8080`
3. Digite a senha: `velotax2024`
4. Use normalmente em qualquer dispositivo

## 🛠️ **Requisitos Técnicos**

### **Navegador**
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### **Servidor (para acesso em rede)**
- Node.js 14+
- NPM 6+
- Windows 10/11 (para arquivo .bat)

## 📁 **Estrutura de Arquivos**

```
velotax-capacity/
├── index.html              # Interface principal
├── script.js               # Lógica do sistema
├── styles.css              # Estilos e design
├── package.json            # Dependências Node.js
├── iniciar_servidor.bat    # Script de inicialização
├── INSTRUCOES_REDE.md      # Instruções para rede
├── README.md               # Este arquivo
└── exemplos/               # Arquivos de exemplo
    ├── exemplo_exportacao.csv
    ├── teste_jornadas_diferentes.csv
    └── teste_decimal_para_horas.csv
```

## 🔧 **Instalação e Configuração**

### **Primeira Execução**
1. Baixe todos os arquivos para uma pasta
2. Execute `iniciar_servidor.bat`
3. Aguarde a instalação automática
4. O sistema abrirá no navegador

### **Configuração de Senha**
1. Abra `script.js`
2. Localize a linha 2: `const SYSTEM_PASSWORD = 'velotax2024';`
3. Altere para sua senha desejada
4. Salve o arquivo

### **Configuração de Rede**
- O sistema detecta automaticamente se está em rede
- Configura CORS automaticamente
- Permite acesso de qualquer dispositivo na rede

### **Correção de HCs (Importante)**
- ✅ **Cálculo corrigido:** HCs baseados na capacidade por hora, não por dia
- ✅ **Fórmula correta:** `HCs = Math.ceil(Volume_por_Hora / 9)`
- ✅ **Margem de segurança:** 75% da capacidade para operação estável
- ✅ **Resultados realistas:** HCs variam conforme a demanda
- 📋 **Ver detalhes:** Consulte `CORRECAO_HCS_DEFINITIVA.md`

## 📊 **Exemplos de Uso**

### **Cenário 1: Call Center Comercial**
- **Dias Úteis:** Volume alto (8h-18h)
- **Sábado:** Volume médio (8h-14h)
- **Resultado:** Dimensionamento otimizado para cada dia

### **Cenário 2: Suporte Técnico**
- **Dias Úteis:** Volume constante (9h-17h)
- **Sábado:** Volume baixo (9h-12h)
- **Resultado:** Equipe reduzida aos sábados

### **Cenário 3: Atendimento 24h**
- **Dias Úteis:** Múltiplos turnos
- **Sábado:** Turno único
- **Resultado:** Cálculo por turno específico

## 🎯 **Vantagens do Sistema**

### **📈 Precisão**
- Modelo Erlang C matematicamente comprovado
- Parâmetros configuráveis e realistas
- Cálculos baseados em dados históricos

### **⚡ Eficiência**
- Processamento automático
- Resultados instantâneos
- Interface intuitiva e responsiva

### **🔒 Segurança**
- Proteção por senha
- Sessões seguras
- Acesso controlado

### **🌐 Flexibilidade**
- Acesso local e em rede
- Compatível com todos os dispositivos
- Exportação para Excel

## 📞 **Suporte**

Para dúvidas ou suporte técnico:
1. Verifique este README
2. Consulte `INSTRUCOES_REDE.md` para questões de rede
3. Verifique os logs do console do navegador
4. Teste com os arquivos de exemplo fornecidos

## 🔄 **Atualizações**

### **Versão Atual:** 2.0
- ✅ Sistema de senha implementado
- ✅ Interface redesenhada
- ✅ Exportação para Excel
- ✅ Acesso em rede
- ✅ Jornadas diferenciadas (dias úteis vs. sábado)
- ✅ Cálculos conservadores para <10s de espera

### **Próximas Funcionalidades**
- 📊 Gráficos de utilização
- 📅 Planejamento de turnos
- 🔄 Integração com sistemas externos
- 📱 Aplicativo mobile

---

**© 2024 Velotax - Sistema de Dimensionamento de Capacity**