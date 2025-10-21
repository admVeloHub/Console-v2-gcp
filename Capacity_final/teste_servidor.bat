@echo off
chcp 65001 >nul
echo ========================================
echo   TESTE SIMPLES DO SERVIDOR
echo ========================================
echo.
echo Iniciando teste do servidor...
echo.

REM Verificar se estamos na pasta correta
if not exist "index.html" (
    echo ❌ ERRO: index.html nao encontrado!
    echo Certifique-se de estar na pasta correta do projeto.
    pause
    exit /b 1
)

echo ✅ index.html encontrado!
echo.

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Falha ao instalar dependencias!
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas!
) else (
    echo ✅ Dependencias ja estao instaladas
)

echo.
echo ========================================
echo   INICIANDO SERVIDOR DE TESTE
echo ========================================
echo.
echo 🌐 Porta: 8080
echo 🏠 Local: http://localhost:8080
echo 📁 Teste: http://localhost:8080/teste_servidor.html
echo.
echo ⚠️  Para parar: Ctrl+C
echo.

REM Iniciar servidor de teste
echo 🚀 Iniciando servidor...
npx http-server -p 8080 -a 0.0.0.0 -o teste_servidor.html

echo.
echo 🛑 Servidor parado.
pause
