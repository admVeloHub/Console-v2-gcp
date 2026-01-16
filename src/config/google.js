// VERSION: v3.5.4 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

// Configuração do Google OAuth
// Para obter o Client ID:
// 1. Acesse: https://console.developers.google.com/
// 2. Crie um novo projeto ou selecione um existente
// 3. Ative a Google+ API
// 4. Crie credenciais OAuth 2.0
// 5. Adicione os domínios autorizados:
//    - http://localhost:3000 (desenvolvimento)
//    - https://seu-dominio.com (produção)

// Client ID do Google OAuth - VeloHub Console
// VERSION: v3.6.0 | DATE: 2025-01-31 | AUTHOR: VeloHub Development Team
// CHANGELOG: v3.6.0 - Atualizado para usar GOOGLE_ID_CONSOLE do Secret Manager via build arg
// IMPORTANTE: Em produção, REACT_APP_GOOGLE_CLIENT_ID é configurado via build arg do Docker
// que busca o valor do Secret Manager GOOGLE_ID_CONSOLE durante o Cloud Build

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error('❌ REACT_APP_GOOGLE_CLIENT_ID não configurada. Google OAuth não funcionará.');
  console.error('📍 SOLUÇÃO: Crie um arquivo .env na raiz do projeto React (Dev - Console/.env)');
  console.error('📍 Adicione a linha: REACT_APP_GOOGLE_CLIENT_ID=278491073220-7u7hh1tji5dd65qagkprc1acenagql5o.apps.googleusercontent.com');
  console.error('📍 Após criar o arquivo, REINICIE o servidor de desenvolvimento (npm start)');
  console.error('⚠️ IMPORTANTE: Variáveis do React precisam ter o prefixo REACT_APP_');
  console.error('⚠️ O arquivo .env deve estar em: Dev - Console/.env (não na raiz do workspace)');
} else {
  console.log('✅ Google Client ID configurado:', GOOGLE_CLIENT_ID.substring(0, 30) + '...');
  console.log('📍 Origem atual:', window.location.origin);
  console.log('📍 Client ID completo (primeiros 50 chars):', GOOGLE_CLIENT_ID.substring(0, 50));
  console.log('⚠️ Certifique-se de que esta origem está autorizada no Google Cloud Console');
  console.log('⚠️ Verifique se o Client ID acima corresponde ao configurado no Google Cloud Console');
}

export { GOOGLE_CLIENT_ID };

// Domínio autorizado para login (configurado via variável de ambiente)
const AUTHORIZED_DOMAIN = process.env.REACT_APP_AUTHORIZED_DOMAIN || 'velotax.com.br';

// Domínios autorizados para login (mantido para compatibilidade)
export const AUTHORIZED_EMAILS = [
  'lucas.gravina@velotax.com.br'
];

// Função para verificar se email pertence ao domínio autorizado
export const isAuthorizedDomain = (email) => {
  if (!email) return false;
  return email.endsWith(`@${AUTHORIZED_DOMAIN}`);
};

// Configurações do Google OAuth
export const GOOGLE_OAUTH_CONFIG = {
  clientId: GOOGLE_CLIENT_ID,
  scope: 'openid email profile',
  redirectUri: window.location.origin,
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent'
};
