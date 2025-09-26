@echo off
REM Script de Backup Automático para Sistema de Qualidade Velotax
REM Este script deve ser executado diariamente via Agendador de Tarefas do Windows

echo ========================================
echo SISTEMA DE BACKUP VELOTAX - QUALIDADE
echo ========================================
echo Data/Hora: %date% %time%
echo.

REM Definir variáveis
set "BACKUP_DIR=C:\Backups\Velotax\Qualidade"
set "SOURCE_DIR=%USERPROFILE%\Documents\Sistemas\HCs_v2"
set "DATE_FORMAT=%date:~-4,4%-%date:~3,2%-%date:~0,2%"
set "BACKUP_FILE=backup_qualidade_%DATE_FORMAT%_%time:~0,2%-%time:~3,2%-%time:~6,2%.zip"
set "BACKUP_FILE=%BACKUP_FILE: =0%"

REM Criar diretório de backup se não existir
if not exist "%BACKUP_DIR%" (
    echo Criando diretório de backup: %BACKUP_DIR%
    mkdir "%BACKUP_DIR%"
)

echo Iniciando backup...
echo Diretório fonte: %SOURCE_DIR%
echo Diretório destino: %BACKUP_DIR%
echo Arquivo de backup: %BACKUP_FILE%
echo.

REM Verificar se o diretório fonte existe
if not exist "%SOURCE_DIR%" (
    echo ERRO: Diretório fonte não encontrado: %SOURCE_DIR%
    echo Backup falhou!
    pause
    exit /b 1
)

REM Fazer backup dos dados do localStorage (se existir)
echo Fazendo backup dos dados do sistema...

REM Criar arquivo de backup com timestamp
powershell -Command "Compress-Archive -Path '%SOURCE_DIR%\*' -DestinationPath '%BACKUP_DIR%\%BACKUP_FILE%' -Force"

if %ERRORLEVEL% EQU 0 (
    echo Backup concluído com sucesso!
    echo Arquivo: %BACKUP_FILE%
    
    REM Limpar backups antigos (manter apenas últimos 30 dias)
    echo.
    echo Limpando backups antigos...
    forfiles /p "%BACKUP_DIR%" /s /m *.zip /d -30 /c "cmd /c del @path" 2>nul
    echo Limpeza concluída.
    
    REM Criar log de backup
    echo %date% %time% - Backup realizado com sucesso: %BACKUP_FILE% >> "%BACKUP_DIR%\backup_log.txt"
    
) else (
    echo ERRO: Falha no backup!
    echo %date% %time% - ERRO no backup >> "%BACKUP_DIR%\backup_log.txt"
    pause
    exit /b 1
)

echo.
echo ========================================
echo BACKUP CONCLUIDO
echo ========================================
echo Arquivo: %BACKUP_FILE%
echo Tamanho: 
dir "%BACKUP_DIR%\%BACKUP_FILE%" | find "bytes"
echo.
echo Log salvo em: %BACKUP_DIR%\backup_log.txt
echo.

REM Aguardar 5 segundos antes de fechar
timeout /t 5 /nobreak >nul
exit /b 0
