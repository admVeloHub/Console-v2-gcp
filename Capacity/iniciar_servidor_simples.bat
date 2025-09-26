@echo off
chcp 65001 >nul
echo ========================================
echo   VELOTAX CAPACITY - SERVIDOR SIMPLES
echo ========================================
echo.
echo Iniciando servidor web de forma simples...
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: Node.js nao esta instalado!
    echo.
    echo Para instalar o Node.js:
    echo 1. Acesse: https://nodejs.org/
    echo 2. Baixe a versao LTS (recomendado)
    echo 3. Execute o instalador
    echo 4. Reinicie este arquivo BAT
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado!
echo.

REM Verificar se as dependencias estao instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas!
    echo.
)

echo ========================================
echo   INICIANDO SERVIDOR
echo ========================================
echo.
echo 🌐 Porta: 8080
echo 🏠 Local: http://localhost:8080
echo 🌍 Rede: http://[SEU_IP]:8080
echo 🔐 Senha: velotax2024
echo.
echo ⚠️  Para parar: Ctrl+C
echo.

REM Iniciar servidor diretamente com npx
npx http-server -p 8080 -a 0.0.0.0 -o --cors

echo.
echo 🛑 Servidor parado.
pause
