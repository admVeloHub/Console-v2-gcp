// VERSION: v3.3.3 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

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
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '278491073220-eb4ogvn3aifu0ut9mq3rvu5r9r9l3137.apps.googleusercontent.com';

// Domínios autorizados para login
export const AUTHORIZED_EMAILS = [
  'lucas.gravina@velotax.com.br'
];

// Configurações do Google OAuth
export const GOOGLE_OAUTH_CONFIG = {
  clientId: GOOGLE_CLIENT_ID,
  scope: 'openid email profile',
  redirectUri: window.location.origin,
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent'
};
