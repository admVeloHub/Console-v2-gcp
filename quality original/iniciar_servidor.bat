@echo off
echo ===================================
echo   Iniciando Controles de HCs
echo   Sistema Velotax
echo ===================================
echo.

cd /d "C:\Users\Velotax0961\Documents\Sistemas\HCs"

echo Verificando se o Node.js esta instalado...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao foi encontrado!
    echo Por favor, instale o Node.js em https://nodejs.org
    pause
    exit /b 1
)

echo Node.js encontrado!
echo.

echo Instalando dependencias (caso necessario)...
call npm install

echo.
echo Iniciando o servidor de desenvolvimento...
echo.
echo O servidor sera acessivel em:
echo   Local: http://localhost:3001/
echo   Rede:  (Verifique o IP da sua maquina na saida abaixo)
echo.
echo Pressione Ctrl+C para parar o servidor.
echo.

call npm run dev -- --host

echo.
echo Servidor finalizado.
pause
