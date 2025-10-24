// EXEMPLO DE CONFIGURAÇÃO DO GOOGLE DRIVE
// Copie este exemplo para src/config/googleDrive.ts

export const GOOGLE_DRIVE_CONFIG = {
  // 🔑 SUBSTITUA PELAS SUAS CREDENCIAIS:
  clientId: '123456789-abcdefghijklmnop.apps.googleusercontent.com', // Seu Client ID
  apiKey: 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Sua API Key
  
  // Escopo de permissões (não altere)
  scope: 'https://www.googleapis.com/auth/drive.file',
  
  // Configurações de upload
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedMimeTypes: [
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/wma',
    'audio/aac'
  ],
  
  // 📁 PASTA NO GOOGLE DRIVE
  targetFolder: {
    name: 'HCs_Velotax_Audio_Files', // Nome da pasta
    createIfNotExists: true, // Criar pasta se não existir
    description: 'Arquivos de áudio do sistema HCs Velotax'
  },
  
  // 🔒 CONTA RECOMENDADA
  accountInfo: {
    recommended: 'hcs.velotax@gmail.com', // Conta corporativa
    permissions: 'Apenas arquivos criados pela aplicação',
    scope: 'drive.file (mínimo necessário)'
  }
};

// 📋 COMO OBTER AS CREDENCIAIS:
// 1. Acesse: https://console.cloud.google.com/
// 2. Crie um projeto: "HCs-Velotax-Sistema"
// 3. Ative a Google Drive API
// 4. Configure OAuth consent screen
// 5. Crie credenciais OAuth 2.0 (Client ID)
// 6. Crie uma API Key
// 7. Substitua os valores acima pelas suas credenciais
