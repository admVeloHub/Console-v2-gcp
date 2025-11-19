@echo off
REM VERSION: v2.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
REM Script de Setup para Desenvolvimento Local - Console de Conteúdo VeloHub

echo 🚀 Configurando ambiente de desenvolvimento local...

REM Verificar se o arquivo .env já existe
if exist ".env" (
    echo ⚠️  Arquivo .env já existe!
    set /p choice="Deseja sobrescrever? (y/N): "
    if /i not "%choice%"=="y" (
        echo ❌ Operação cancelada.
        exit /b 1
    )
)

REM Copiar arquivo de exemplo
echo 📋 Copiando env.local.example para .env...
copy env.local.example .env >nul

REM Verificar se a cópia foi bem-sucedida
if exist ".env" (
    echo ✅ Arquivo .env criado com sucesso!
    echo.
    echo 📝 Configurações aplicadas:
    echo    - API URL: https://backend-gcp-278491073220.us-east1.run.app/api
    echo    - Dev Mode: true
    echo    - CORS: http://localhost:3000
    echo.
    echo 📌 IMPORTANTE:
    echo    - Variáveis sensíveis são gerenciadas via Firebase Hosting (produção)
    echo    - Secrets do backend são gerenciados via Secret Manager do GCP
    echo    - Para desenvolvimento local, configure REACT_APP_GOOGLE_CLIENT_ID no .env se necessário
    echo.
    echo 🔧 Para personalizar, edite o arquivo .env
    echo.
    echo 🚀 Para executar o projeto:
    echo    npm install
    echo    npm start
    echo.
    echo 🌐 Acesse: http://localhost:3000
) else (
    echo ❌ Erro ao criar arquivo .env
    exit /b 1
)

echo ✨ Setup concluído com sucesso!
pause
