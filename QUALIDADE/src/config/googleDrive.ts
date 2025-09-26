// Configuração do Google Drive
export const GOOGLE_DRIVE_CONFIG = {
  // 🔑 CONFIGURAR NO GOOGLE CLOUD CONSOLE:
  // 1. Acesse: https://console.cloud.google.com/
  // 2. Crie um novo projeto ou selecione existente
  // 3. Ative a Google Drive API
  // 4. Configure tela de consentimento OAuth
  // 5. Crie credenciais OAuth 2.0
  
  clientId: 'YOUR_CLIENT_ID_AQUI', // Substitua pelo seu Client ID
  apiKey: 'YOUR_API_KEY_AQUI', // Substitua pela sua API Key
  
  // Escopo de permissões
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
  
  // 📁 PASTA ESPECÍFICA NO GOOGLE DRIVE
  // Configure aqui a pasta onde os arquivos serão salvos
  targetFolder: {
    name: 'HCs_Velotax_Audio_Files', // Nome da pasta
    createIfNotExists: true, // Criar pasta se não existir
    description: 'Arquivos de áudio do sistema HCs Velotax'
  },
  
  // 🔒 CONTA ESPECÍFICA
  // Os arquivos serão salvos na conta do Google que fizer login
  // Recomenda-se usar uma conta corporativa específica para o projeto
  accountInfo: {
    recommended: 'contacorporativa@velotax.com.br', // Conta recomendada
    permissions: 'Apenas arquivos criados pela aplicação',
    scope: 'drive.file (mínimo necessário)'
  }
};

// 📋 INSTRUÇÕES DE CONFIGURAÇÃO:
// 1. Use uma conta Google corporativa específica
// 2. Configure a pasta "HCs_Velotax_Audio_Files" no Google Drive
// 3. Os arquivos serão salvos automaticamente nesta pasta
// 4. Apenas usuários autorizados terão acesso aos arquivos
