/**
 * Configuração do Google Sheets API com Service Account
 * Para integração com planilha privada usando Service Account
 */

// IDs das planilhas (extraídos das URLs)
export const MAIN_SPREADSHEET_ID = '1MNzzH0NoAtG41DjR7dZ9BOkMS73RZSEO' // Nova planilha - dados principais
export const PAUSE_SPREADSHEET_ID = '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA' // Planilha atual - dados de pausa

// Ranges das planilhas
export const MAIN_SHEET_RANGE = 'Base!A1:AC150000' // Nova planilha - aba Base (range específico)
export const PAUSE_SHEET_RANGE = 'Pausas!A1:AB150000' // Planilha atual - aba Pausas (range específico)

// Compatibilidade com código existente
export const SPREADSHEET_ID = MAIN_SPREADSHEET_ID
export const SHEET_RANGE = MAIN_SHEET_RANGE

// Configurações Service Account
export const SERVICE_ACCOUNT_CONFIG = {
  email: 'veloinsights-service@veloinsights.iam.gserviceaccount.com',
  // As credenciais serão carregadas do arquivo JSON
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly'
  ]
}

// Configurações OAuth2 (mantidas para compatibilidade)
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
  operator: 'Operador',
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
