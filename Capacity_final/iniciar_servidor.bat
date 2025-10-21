@echo off
chcp 65001 >nul
echo ========================================
echo   VELOTAX CAPACITY - SERVIDOR WEB
echo ========================================
echo.
echo Iniciando servidor web para o sistema de dimensionamento...
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

echo ✅ Node.js encontrado! Versao:
node --version
echo.

REM Verificar se NPM está funcionando
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: NPM nao esta funcionando!
    echo.
    echo Tente reinstalar o Node.js
    echo.
    pause
    exit /b 1
)

echo ✅ NPM encontrado! Versao:
npm --version
echo.

REM Verificar se as dependencias estao instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo ❌ ERRO: Falha ao instalar dependencias!
        echo.
        echo Tente executar manualmente: npm install
        echo.
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas com sucesso!
    echo.
) else (
    echo ✅ Dependencias ja estao instaladas
    echo.
)

REM Verificar se http-server está disponível
npx http-server --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: http-server nao esta disponivel!
    echo.
    echo Tentando instalar http-server globalmente...
    npm install -g http-server
    if %errorlevel% neq 0 (
        echo ❌ Falha ao instalar http-server globalmente
        echo.
        echo Tente executar: npm install -g http-server
        echo.
        pause
        exit /b 1
    )
)

echo ========================================
echo   CONFIGURACOES DO SERVIDOR
echo ========================================
echo.
echo 🌐 Porta: 8080
echo 🏠 IP Local: http://localhost:8080
echo 🌍 IP Rede: http://[SEU_IP]:8080
echo.
echo 📱 Para acessar de outros computadores:
echo 1. Descubra seu IP local (ipconfig)
echo 2. Acesse: http://[SEU_IP]:8080
echo.
echo 🔐 Senha de acesso: velotax2024
echo.
echo Pressione qualquer tecla para iniciar o servidor...
pause >nul

echo.
echo 🚀 Iniciando servidor...
echo.
echo ⚠️  Para parar o servidor: Ctrl+C
echo.
echo ========================================
echo   SERVIDOR INICIADO!
echo ========================================
echo.

REM Tentar diferentes metodos para iniciar o servidor
echo 🔄 Tentando metodo 1: npm run start-network...
npm run start-network
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Metodo 1 falhou, tentando metodo 2: npx http-server...
    echo.
    npx http-server -p 8080 -a 0.0.0.0 -o --cors
    if %errorlevel% neq 0 (
        echo.
        echo ⚠️  Metodo 2 falhou, tentando metodo 3: http-server direto...
        echo.
        http-server -p 8080 -a 0.0.0.0 -o --cors
        if %errorlevel% neq 0 (
            echo.
            echo ❌ Todos os metodos falharam!
            echo.
            echo Solucoes possiveis:
            echo 1. Execute: npm install
            echo 2. Execute: npm install -g http-server
            echo 3. Verifique se a porta 8080 esta livre
            echo.
            pause
            exit /b 1
        )
    )
)

echo.
echo 🛑 Servidor parado.
echo.
pause
