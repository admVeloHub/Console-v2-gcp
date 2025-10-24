// Configuração do Vercel Blob Storage
export const VERCEL_BLOB_CONFIG = {
  // 🔑 CONFIGURAR NO VERCEL:
  // 1. Acesse: https://vercel.com/dashboard
  // 2. Vá para seu projeto
  // 3. Vá para Settings → Environment Variables
  // 4. Adicione: BLOB_READ_WRITE_TOKEN
  // 5. Copie o token e cole aqui
  
  // Token será obtido das variáveis de ambiente
  token: process.env.BLOB_READ_WRITE_TOKEN || '',
  
  // Configurações de upload
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedMimeTypes: [
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/wma',
    'audio/aac'
  ],
  
  // 📁 ESTRUTURA DE PASTAS
  folderStructure: {
    base: 'hcs-velotax',
    audio: 'audio-files',
    evaluations: 'evaluations'
  },
  
  // 🔒 SEGURANÇA
  security: {
    // URLs expiram em 1 hora por padrão
    urlExpiration: 3600, // 1 hora em segundos
    // Permitir apenas uploads autenticados
    requireAuth: true
  }
};

// 📋 INSTRUÇÕES DE CONFIGURAÇÃO:
// 1. Deploy seu projeto no Vercel
// 2. Configure a variável de ambiente BLOB_READ_WRITE_TOKEN
// 3. Os arquivos serão salvos automaticamente no Vercel Blob
// 4. URLs de acesso são geradas automaticamente
