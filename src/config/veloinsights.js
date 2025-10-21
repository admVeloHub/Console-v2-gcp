// VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
// Configurações do VeloInsights integrado ao Console

export const VELOINSIGHTS_CONFIG = {
  // ID da planilha Google Sheets do VeloInsights
  SPREADSHEET_ID: '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA',
  
  // Configurações de autenticação (VeloInsights específico)
  GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID || '827325386401-2g41vcepqkge5tiu380r1decb9ek5l1v.apps.googleusercontent.com',
  GOOGLE_API_KEY: process.env.VITE_GOOGLE_API_KEY || process.env.REACT_APP_GOOGLE_API_KEY,
  
  // Configurações de permissões
  PERMISSIONS: {
    // Hierarquia: Avaliador < Auditor < Relatórios de Gestão
    AVALIADOR: 'avaliador',
    AUDITOR: 'auditor', 
    RELATORIOS_GESTAO: 'relatoriosGestao'
  }
}

export default VELOINSIGHTS_CONFIG
