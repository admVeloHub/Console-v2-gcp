# Configuração do Sistema de Backup Automático

## Visão Geral
Este sistema implementa um backup automático diário para garantir a segurança dos dados do módulo de qualidade. O backup é executado automaticamente todas as noites às 23:00.

## Arquivos de Backup
- `backup_script.bat` - Script principal de backup
- `CONFIGURACAO_BACKUP.md` - Este arquivo de instruções

## Configuração do Backup Automático

### 1. Executar o Script Manualmente (Teste)
1. Clique duas vezes no arquivo `backup_script.bat`
2. Verifique se o backup foi criado em `C:\Backups\Velotax\Qualidade\`
3. Confirme que não houve erros

### 2. Configurar Agendador de Tarefas do Windows

#### Opção A: Via Interface Gráfica
1. Pressione `Win + R`, digite `taskschd.msc` e pressione Enter
2. No painel direito, clique em "Criar Tarefa Básica..."
3. Nome: `Velotax Qualidade - Backup Diário`
4. Descrição: `Backup automático diário do sistema de qualidade`
5. Trigger: Diariamente
6. Hora de início: 23:00
7. Ação: Iniciar um programa
8. Programa: `C:\Windows\System32\cmd.exe`
9. Argumentos: `/c "C:\Users\[SEU_USUARIO]\Documents\Sistemas\HCs_v2\backup_script.bat"`
10. Marque "Abrir as propriedades desta tarefa quando clicar em Concluir"
11. Na aba "Geral":
    - Marque "Executar independentemente do usuário estar logado"
    - Marque "Executar com privilégios mais altos"
12. Na aba "Configurações":
    - Marque "Permitir que a tarefa seja executada sob demanda"
    - Marque "Se a tarefa falhar, reiniciar a cada: 1 minuto, até 3 tentativas"
13. Clique em OK

#### Opção B: Via Linha de Comando (Administrador)
```cmd
schtasks /create /tn "Velotax Qualidade - Backup Diário" /tr "C:\Windows\System32\cmd.exe /c \"%USERPROFILE%\Documents\Sistemas\HCs_v2\backup_script.bat\"" /sc daily /st 23:00 /ru "SYSTEM" /f
```

### 3. Verificar Configuração
1. No Agendador de Tarefas, procure pela tarefa criada
2. Clique com botão direito → "Executar" para testar
3. Verifique se o backup foi criado em `C:\Backups\Velotax\Qualidade\`

## Estrutura de Diretórios de Backup
```
C:\Backups\Velotax\Qualidade\
├── backup_qualidade_2025-01-15_23-00-00.zip
├── backup_qualidade_2025-01-16_23-00-00.zip
├── backup_qualidade_2025-01-17_23-00-00.zip
├── backup_log.txt
└── ...
```

## Arquivos Incluídos no Backup
- Todos os arquivos do projeto
- Dados do localStorage (funcionários, avaliações, etc.)
- Configurações do sistema
- Componentes e utilitários

## Retenção de Backups
- **Duração**: 30 dias
- **Limpeza**: Automática (executada após cada backup)
- **Formato**: Arquivos ZIP com timestamp

## Monitoramento
- **Log**: `C:\Backups\Velotax\Qualidade\backup_log.txt`
- **Verificação**: Diária após 23:00
- **Notificações**: Via log de eventos do Windows

## Solução de Problemas

### Backup Falha
1. Verificar permissões de escrita em `C:\Backups\`
2. Confirmar que o diretório fonte existe
3. Verificar espaço em disco disponível
4. Consultar log de eventos do Windows

### Tarefa Não Executa
1. Verificar se o Agendador de Tarefas está ativo
2. Confirmar configuração da tarefa
3. Verificar privilégios de administrador
4. Testar execução manual

### Arquivo de Backup Corrompido
1. Verificar integridade do arquivo ZIP
2. Restaurar backup anterior
3. Executar backup manual
4. Verificar log de erros

## Restauração de Dados
1. Parar o sistema
2. Fazer backup do estado atual
3. Extrair arquivo de backup desejado
4. Substituir arquivos corrompidos
5. Reiniciar sistema
6. Verificar integridade dos dados

## Manutenção
- **Mensal**: Verificar espaço em disco
- **Trimestral**: Testar restauração de backup
- **Anual**: Revisar política de retenção
- **Sempre**: Monitorar logs de erro

## Contato de Suporte
Em caso de problemas com o sistema de backup:
1. Consultar este documento
2. Verificar logs do sistema
3. Testar backup manual
4. Contatar equipe de TI

---
**Última atualização**: Janeiro 2025
**Versão**: 1.0
**Responsável**: Sistema de Qualidade Velotax
