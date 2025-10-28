#!/bin/bash

# VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
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
    echo "   - API URL: https://back-console.vercel.app/api"
    echo "   - Dev Mode: true"
    echo "   - CORS: http://localhost:3000"
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
