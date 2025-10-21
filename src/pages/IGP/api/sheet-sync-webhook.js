// api/sheet-sync-webhook.js
// Endpoint para receber notificações de atualização da planilha

export default async function handler(req, res) {
  // Verificar se é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { spreadsheetId, timestamp, source, action } = req.body

    console.log('📡 Webhook recebido:', {
      spreadsheetId,
      timestamp,
      source,
      action
    })

    // Verificar se é uma notificação válida
    if (source === 'google-apps-script' && action === 'sync_completed') {
      console.log('✅ Planilha sincronizada com sucesso!')
      
      // Aqui você pode adicionar lógica adicional, como:
      // - Invalidar cache
      // - Notificar usuários conectados
      // - Registrar no banco de dados
      
      return res.status(200).json({ 
        success: true, 
        message: 'Notificação recebida com sucesso',
        timestamp: new Date().toISOString()
      })
    }

    return res.status(400).json({ 
      error: 'Notificação inválida',
      received: { source, action }
    })

  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message
    })
  }
}
