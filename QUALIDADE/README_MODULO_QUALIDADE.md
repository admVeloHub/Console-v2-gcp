# Módulo de Qualidade - Sistema Velotax

## Visão Geral
O Módulo de Qualidade é uma solução completa para avaliação e monitoramento da qualidade das ligações de atendimento ao cliente. O sistema integra avaliação manual, análise automática via GPT e relatórios gerenciais para fornecer insights sobre o desempenho da equipe.

## Funcionalidades Principais

### 1. Avaliação de Qualidade
- **Formulário Completo**: Interface intuitiva para avaliação de ligações
- **Critérios Padronizados**: 7 critérios de avaliação com pontuação automática
- **Upload de Arquivos**: Suporte para arquivos de áudio (WAV, MP3, MPEG, WMA, AAC)
- **Validação**: Verificação de formato e tamanho de arquivo (máx. 1GB)

#### Critérios de Avaliação
| Critério | Pontuação | Descrição |
|----------|-----------|-----------|
| Saudação Adequada | +10 pts | Script estabelecido seguido corretamente |
| Escuta Ativa / Sondagem | +25 pts | Atenção e diálogo adequado |
| Resolução Questão | +40 pts | Solução na primeira interação |
| Empatia / Cordialidade | +15 pts | Conduta cordial e empática |
| Direcionou Pesquisa | +10 pts | Encaminhamento para satisfação |
| Procedimento Incorreto | -60 pts | Informação inadequada |
| Encerramento Brusco | -100 pts | Contato interrompido |

### 2. Agente GPT
- **Análise Automática**: Avaliação automática de arquivos de áudio
- **Integração com Central de Artigos**: Procedimentos da Velotax
- **Módulo de Moderação**: Aprendizado contínuo do sistema
- **Confiança**: Indicador de precisão da análise (70-100%)

### 3. Relatórios
#### Relatório do Agente
- Histórico individual de avaliações
- Comparativo entre avaliador humano e GPT
- Tendências de performance
- Métricas de melhoria

#### Relatório da Gestão
- Ranking mensal da equipe
- Top 3 melhores e piores analistas
- Médias comparativas
- Análise de performance por período

### 4. Sistema de Backup
- **Backup Automático**: Diário às 23:00
- **Retenção**: 30 dias de histórico
- **Segurança**: Dados protegidos contra perda
- **Restauração**: Processo simplificado de recuperação

## Arquitetura do Sistema

### Componentes
```
src/components/
├── QualidadeModule.tsx      # Módulo principal
├── AvaliacaoForm.tsx        # Formulário de avaliação
├── AvaliacaoList.tsx        # Lista de avaliações
├── RelatorioAgente.tsx      # Relatório individual
├── RelatorioGestao.tsx      # Relatório gerencial
└── GPTIntegration.tsx       # Integração com GPT
```

### Tipos de Dados
```typescript
// Principais interfaces
interface Avaliacao {
  id: string;
  colaboradorId: string;
  avaliador: string;
  mes: string;
  ano: number;
  // ... critérios e pontuação
}

interface AvaliacaoGPT {
  analiseGPT: string;
  pontuacaoGPT: number;
  criteriosGPT: object;
  confianca: number;
}
```

### Storage
- **LocalStorage**: Persistência local dos dados
- **Backup Automático**: Segurança dos dados
- **Exportação**: Suporte para Excel e PDF

## Instalação e Configuração

### Pré-requisitos
- Node.js 16+
- npm ou yarn
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Instalação
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Configuração do Backup
1. Executar `backup_script.bat` manualmente para teste
2. Configurar Agendador de Tarefas do Windows
3. Verificar diretório de backup: `C:\Backups\Velotax\Qualidade\`

## Uso do Sistema

### 1. Criar Nova Avaliação
1. Navegar para "Módulo de Qualidade" → "Avaliações"
2. Clicar em "Nova Avaliação"
3. Selecionar colaborador (apenas ativos)
4. Preencher critérios de avaliação
5. Anexar arquivo de áudio
6. Salvar avaliação

### 2. Análise GPT
1. Selecionar avaliação na aba "Agente GPT"
2. Clicar em "Iniciar Análise GPT"
3. Aguardar processamento (simulado)
4. Revisar resultados
5. Moderar se necessário

### 3. Relatórios
1. **Individual**: Selecionar colaborador e período
2. **Gestão**: Escolher mês/ano para análise
3. **Exportar**: Dados disponíveis para download

### 4. Backup e Segurança
- Backup automático diário às 23:00
- Retenção de 30 dias
- Logs de auditoria
- Restauração simplificada

## Personalização

### Critérios de Avaliação
Os critérios podem ser modificados em `src/types/index.ts`:
```typescript
export const PONTUACAO = {
  SAUDACAO_ADEQUADA: 10,
  ESCUTA_ATIVA: 25,
  // ... outros critérios
};
```

### Formato de Arquivos
Formatos suportados configuráveis em `AvaliacaoForm.tsx`:
```typescript
const formatosPermitidos = [
  'audio/wav', 'audio/mp3', 'audio/mpeg', 
  'audio/wma', 'audio/aac'
];
```

### Períodos de Avaliação
Meses e anos configuráveis:
```typescript
export const MESES = ['Janeiro', 'Fevereiro', ...];
export const ANOS = [2025, 2026, 2027, 2028];
```

## Manutenção

### Backup
- **Verificação**: Diária após 23:00
- **Limpeza**: Automática (30 dias)
- **Logs**: `C:\Backups\Velotax\Qualidade\backup_log.txt`

### Monitoramento
- Performance do sistema
- Uso de armazenamento
- Erros e exceções
- Logs de auditoria

### Atualizações
- Manter dependências atualizadas
- Verificar compatibilidade do navegador
- Testar funcionalidades após mudanças

## Suporte e Contato

### Documentação
- `README.md` - Visão geral do sistema
- `CONFIGURACAO_BACKUP.md` - Configuração de backup
- `README_MODULO_QUALIDADE.md` - Este arquivo

### Solução de Problemas
1. Verificar console do navegador
2. Consultar logs de backup
3. Testar funcionalidades básicas
4. Verificar permissões de arquivo

### Contato
- **Equipe de TI**: Suporte técnico
- **Gestão**: Relatórios e métricas
- **Usuários**: Funcionalidades do sistema

## Roadmap Futuro

### Versão 1.1
- [ ] Integração real com API GPT
- [ ] Dashboard em tempo real
- [ ] Notificações automáticas
- [ ] Exportação avançada

### Versão 1.2
- [ ] Múltiplos idiomas
- [ ] Relatórios personalizados
- [ ] Integração com CRM
- [ ] Mobile app

### Versão 2.0
- [ ] Machine Learning avançado
- [ ] Análise de sentimento
- [ ] Predição de performance
- [ ] Integração com BI

---

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Desenvolvido por**: Sistema de Qualidade Velotax  
**Suporte**: Equipe de TI
