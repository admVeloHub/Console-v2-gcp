// VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
// Configurações do VeloInsights integrado ao Console

export const VELOINSIGHTS_CONFIG = {
  // ID da planilha Google Sheets do VeloInsights
  SPREADSHEET_ID: '1F1VJrAzGage7YyX1tLCUCaIgB2GhvHSqJRVnmwwYhkA',
  
  // Configurações de autenticação (reutilizar do Console)
  GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  GOOGLE_API_KEY: process.env.REACT_APP_GOOGLE_API_KEY,
  
  // Configurações de permissões
  PERMISSIONS: {
    // Hierarquia: Avaliador < Auditor < Relatórios de Gestão
    AVALIADOR: 'avaliador',
    AUDITOR: 'auditor', 
    RELATORIOS_GESTAO: 'relatoriosGestao'
  }
}

export default VELOINSIGHTS_CONFIG
