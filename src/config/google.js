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
// VERSION: v3.5.8 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
// Fallback hardcoded como precaução - prioriza variável de ambiente se disponível

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '278491073220-eb4ogvn3aifu0ut9mq3rvu5r9r9l3137.apps.googleusercontent.com';

if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
  console.warn('⚠️ REACT_APP_GOOGLE_CLIENT_ID não configurada. Usando Client ID hardcoded como fallback.');
  console.warn('Configure REACT_APP_GOOGLE_CLIENT_ID como build arg durante o build do Docker para produção.');
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
