#!/bin/bash

# VERSION: v2.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
# Script de Setup para Desenvolvimento Local - Console de Conteúdo VeloHub

echo "🚀 Configurando ambiente de desenvolvimento local..."

# Verificar se o arquivo .env já existe
if [ -f ".env" ]; then
    echo "⚠️  Arquivo .env já existe!"
    read -p "Deseja sobrescrever? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operação cancelada."
        exit 1
    fi
fi

# Copiar arquivo de exemplo
echo "📋 Copiando env.local.example para .env..."
cp env.local.example .env

# Verificar se a cópia foi bem-sucedida
if [ -f ".env" ]; then
    echo "✅ Arquivo .env criado com sucesso!"
    echo ""
    echo "📝 Configurações aplicadas:"
    echo "   - API URL: https://backend-gcp-278491073220.us-east1.run.app/api"
    echo "   - Dev Mode: true"
    echo "   - CORS: http://localhost:3000"
    echo ""
    echo "📌 IMPORTANTE:"
    echo "   - Variáveis sensíveis são gerenciadas via Cloud Run (produção)"
    echo "   - Secrets do backend são gerenciados via Secret Manager do GCP"
    echo "   - Para desenvolvimento local, configure REACT_APP_GOOGLE_CLIENT_ID no .env se necessário"
    echo ""
    echo "🔧 Para personalizar, edite o arquivo .env"
    echo ""
    echo "🚀 Para executar o projeto:"
    echo "   npm install"
    echo "   npm start"
    echo ""
    echo "🌐 Acesse: http://localhost:3000"
else
    echo "❌ Erro ao criar arquivo .env"
    exit 1
fi

echo "✨ Setup concluído com sucesso!"
