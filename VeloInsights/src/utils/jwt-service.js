// jwt-service.js
// Implementação JWT para Service Account do Google

// Função para criar JWT para Google Service Account
export async function createGoogleJWT(credentials) {
  try {
    console.log('🔑 Criando JWT para Google Service Account...')
    
    // Header JWT
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    }
    
    // Payload JWT
    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: credentials.token_uri,
      exp: now + 3600, // 1 hora
      iat: now
    }
    
    // Para simplificar, vamos usar uma abordagem diferente
    // Em vez de implementar JWT completo, vamos usar uma biblioteca
    
    console.log('📋 JWT Header:', header)
    console.log('📋 JWT Payload:', payload)
    
    // Retornar um token mock por enquanto
    return 'mock_jwt_token_' + Date.now()
    
  } catch (error) {
    console.error('❌ Erro ao criar JWT:', error)
    throw error
  }
}

// Função para obter access token do Google
export async function getGoogleAccessToken(credentials) {
  try {
    console.log('🔑 Obtendo access token do Google...')
    
    // Criar JWT
    const jwt = await createGoogleJWT(credentials)
    
    // Fazer requisição para obter access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro ao obter access token:', errorText)
      throw new Error(`Erro ao obter token: ${response.status} - ${errorText}`)
    }
    
    const tokenData = await response.json()
    console.log('✅ Access token obtido!')
    return tokenData.access_token
    
  } catch (error) {
    console.error('❌ Erro ao obter access token:', error)
    throw error
  }
}

// Função para testar acesso à planilha com Service Account
export async function testServiceAccountAccess(credentials, spreadsheetId) {
  try {
    console.log('🔐 Testando acesso à planilha com Service Account...')
    
    // Obter access token
    const accessToken = await getGoogleAccessToken(credentials)
    
    // Testar acesso à planilha
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Base!A1:AC10`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro ao acessar planilha:', errorText)
      throw new Error(`Erro ao acessar planilha: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log('✅ Acesso à planilha funcionando!')
    console.log('📊 Dados obtidos:', data.values?.length || 0, 'linhas')
    
    return {
      success: true,
      accessToken: accessToken,
      data: data
    }
    
  } catch (error) {
    console.error('❌ Erro no teste de acesso:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
