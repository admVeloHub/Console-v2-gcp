/**
 * Configuração do Google Sheets API
 * Para integração com planilha privada usando OAuth2
 */

// ID da planilha (extraído da URL)
export const SPREADSHEET_ID = '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA'

// Range da planilha (ajustar conforme necessário)
export const SHEET_RANGE = 'Sheet1!A:Z' // Lê todas as colunas da primeira aba

// Configurações OAuth2
export const OAUTH_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:3000',
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly'
  ]
}

// Configurações da API
export const API_CONFIG = {
  discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  scope: OAUTH_CONFIG.scopes.join(' ')
}

// Mapeamento de colunas esperadas na planilha
export const COLUMN_MAPPING = {
  date: 'Data',
  operator: 'Nome do Atendente',
  duration: 'Tempo Falado',
  ratingAttendance: 'Pergunta2 1 PERGUNTA ATENDENTE',
  ratingSolution: 'Pergunta2 2 PERGUNTA SOLUCAO',
  callStatus: 'Chamada',
  disconnection: 'Desconexão',
  pauseDuration: 'Duração',
  pauseReason: 'Motivo da Pausa',
  pauseDate: 'Data Inicial',
  avgLoggedTime: 'T M Logado / Dia',
  avgPausedTime: 'T M Pausado'
}

// Configurações de cache
export const CACHE_CONFIG = {
  // Cache por 1 hora (dados atualizados semanalmente)
  ttl: 60 * 60 * 1000, // 1 hora em ms
  key: 'veloinsights_sheets_data'
}
