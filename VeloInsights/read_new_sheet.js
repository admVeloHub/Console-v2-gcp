/**
 * Script para ler dados da nova planilha Google Sheets
 * Colunas específicas: N, O, AC, AD
 */

// ID da nova planilha
const NEW_SPREADSHEET_ID = '1QkDmUTGAQQ7uF4ZBnHHcdrCyvjN76I_TN-RwTgvyn0o'

// Configurações OAuth2 (usando as mesmas do sistema atual)
const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.VITE_GOOGLE_CLIENT_SECRET

// Função para ler dados da nova planilha
async function readNewSheetData(accessToken) {
  try {
    console.log('🔍 Lendo dados da nova planilha...')
    console.log('📋 Planilha ID:', NEW_SPREADSHEET_ID)
    
    // Ler apenas as colunas específicas: N, O, AC, AD
    // Range: N1:AD1000 (colunas N até AD, linhas 1 a 1000)
    const range = 'Sheet1!N1:AD1000'
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${NEW_SPREADSHEET_ID}/values/${range}?access_token=${accessToken}`
    
    console.log('🔗 URL da API:', url.replace(accessToken, '***'))
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: ${response.statusText}`)
    }
    
    const result = await response.json()
    
    if (result.values && result.values.length > 0) {
      console.log(`✅ ${result.values.length} linhas obtidas da nova planilha`)
      
      // Analisar as colunas específicas
      const headers = result.values[0] // Primeira linha são os cabeçalhos
      const dataRows = result.values.slice(1) // Resto são os dados
      
      console.log('📋 Cabeçalhos encontrados:')
      headers.forEach((header, index) => {
        const columnLetter = String.fromCharCode(78 + index) // N=78, O=79, etc.
        console.log(`  Coluna ${columnLetter} (índice ${index}): "${header}"`)
      })
      
      // Mapear as colunas específicas solicitadas
      const columnMapping = {
        responsavelTicket: headers[0], // Coluna N (índice 0 no range N:AD)
        tipoAvaliacao: headers[1],    // Coluna O (índice 1 no range N:AD)
        dia: headers[28],              // Coluna AC (índice 28 no range N:AD)
        mes: headers[29]               // Coluna AD (índice 29 no range N:AD)
      }
      
      console.log('🎯 Colunas específicas mapeadas:')
      console.log('  Responsável do ticket (N):', columnMapping.responsavelTicket)
      console.log('  Tipo de avaliação (O):', columnMapping.tipoAvaliacao)
      console.log('  Dia (AC):', columnMapping.dia)
      console.log('  Mês (AD):', columnMapping.mes)
      
      // Analisar os dados das colunas específicas
      const analysis = {
        totalRows: dataRows.length,
        responsavelTicket: {
          values: [],
          uniqueValues: new Set(),
          emptyCount: 0
        },
        tipoAvaliacao: {
          values: [],
          uniqueValues: new Set(),
          emptyCount: 0
        },
        dia: {
          values: [],
          uniqueValues: new Set(),
          emptyCount: 0
        },
        mes: {
          values: [],
          uniqueValues: new Set(),
          emptyCount: 0
        }
      }
      
      // Processar cada linha de dados
      dataRows.forEach((row, index) => {
        // Responsável do ticket (coluna N - índice 0)
        const responsavel = row[0] || ''
        analysis.responsavelTicket.values.push(responsavel)
        if (responsavel.trim()) {
          analysis.responsavelTicket.uniqueValues.add(responsavel.trim())
        } else {
          analysis.responsavelTicket.emptyCount++
        }
        
        // Tipo de avaliação (coluna O - índice 1)
        const tipoAvaliacao = row[1] || ''
        analysis.tipoAvaliacao.values.push(tipoAvaliacao)
        if (tipoAvaliacao.trim()) {
          analysis.tipoAvaliacao.uniqueValues.add(tipoAvaliacao.trim())
        } else {
          analysis.tipoAvaliacao.emptyCount++
        }
        
        // Dia (coluna AC - índice 28)
        const dia = row[28] || ''
        analysis.dia.values.push(dia)
        if (dia.trim()) {
          analysis.dia.uniqueValues.add(dia.trim())
        } else {
          analysis.dia.emptyCount++
        }
        
        // Mês (coluna AD - índice 29)
        const mes = row[29] || ''
        analysis.mes.values.push(mes)
        if (mes.trim()) {
          analysis.mes.uniqueValues.add(mes.trim())
        } else {
          analysis.mes.emptyCount++
        }
      })
      
      // Converter Sets para Arrays para facilitar análise
      analysis.responsavelTicket.uniqueValues = Array.from(analysis.responsavelTicket.uniqueValues)
      analysis.tipoAvaliacao.uniqueValues = Array.from(analysis.tipoAvaliacao.uniqueValues)
      analysis.dia.uniqueValues = Array.from(analysis.dia.uniqueValues)
      analysis.mes.uniqueValues = Array.from(analysis.mes.uniqueValues)
      
      console.log('\n📊 ANÁLISE DOS DADOS:')
      console.log('='.repeat(50))
      
      console.log(`\n📋 Total de linhas de dados: ${analysis.totalRows}`)
      
      console.log(`\n👤 RESPONSÁVEL DO TICKET (Coluna N):`)
      console.log(`  - Valores únicos: ${analysis.responsavelTicket.uniqueValues.length}`)
      console.log(`  - Campos vazios: ${analysis.responsavelTicket.emptyCount}`)
      console.log(`  - Primeiros 10 valores únicos:`, analysis.responsavelTicket.uniqueValues.slice(0, 10))
      
      console.log(`\n📝 TIPO DE AVALIAÇÃO (Coluna O):`)
      console.log(`  - Valores únicos: ${analysis.tipoAvaliacao.uniqueValues.length}`)
      console.log(`  - Campos vazios: ${analysis.tipoAvaliacao.emptyCount}`)
      console.log(`  - Valores únicos encontrados:`, analysis.tipoAvaliacao.uniqueValues)
      
      console.log(`\n📅 DIA (Coluna AC):`)
      console.log(`  - Valores únicos: ${analysis.dia.uniqueValues.length}`)
      console.log(`  - Campos vazios: ${analysis.dia.emptyCount}`)
      console.log(`  - Primeiros 10 valores únicos:`, analysis.dia.uniqueValues.slice(0, 10))
      
      console.log(`\n📆 MÊS (Coluna AD):`)
      console.log(`  - Valores únicos: ${analysis.mes.uniqueValues.length}`)
      console.log(`  - Campos vazios: ${analysis.mes.emptyCount}`)
      console.log(`  - Valores únicos encontrados:`, analysis.mes.uniqueValues)
      
      // Mostrar algumas linhas de exemplo
      console.log('\n📋 EXEMPLOS DE DADOS (primeiras 5 linhas):')
      console.log('='.repeat(50))
      dataRows.slice(0, 5).forEach((row, index) => {
        console.log(`\nLinha ${index + 1}:`)
        console.log(`  Responsável: "${row[0] || ''}"`)
        console.log(`  Tipo Avaliação: "${row[1] || ''}"`)
        console.log(`  Dia: "${row[28] || ''}"`)
        console.log(`  Mês: "${row[29] || ''}"`)
      })
      
      return {
        success: true,
        totalRows: analysis.totalRows,
        headers: headers,
        columnMapping: columnMapping,
        analysis: analysis,
        sampleData: dataRows.slice(0, 10) // Primeiras 10 linhas como exemplo
      }
      
    } else {
      console.log('⚠️ Nenhum dado encontrado na nova planilha')
      return {
        success: false,
        error: 'Nenhum dado encontrado'
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao ler nova planilha:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Função para testar com token de acesso (simulação)
async function testNewSheetAccess() {
  console.log('🧪 Testando acesso à nova planilha...')
  console.log('📋 Planilha ID:', NEW_SPREADSHEET_ID)
  
  // Verificar se temos as configurações necessárias
  if (!CLIENT_ID) {
    console.error('❌ CLIENT_ID não configurado')
    return
  }
  
  if (!CLIENT_SECRET) {
    console.error('❌ CLIENT_SECRET não configurado')
    return
  }
  
  console.log('✅ Configurações encontradas')
  console.log('📝 Para usar este script, você precisa:')
  console.log('  1. Obter um token de acesso válido')
  console.log('  2. Chamar a função readNewSheetData(accessToken)')
  console.log('  3. Ou integrar com o sistema de autenticação existente')
}

// Exportar funções para uso
module.exports = {
  readNewSheetData,
  testNewSheetAccess,
  NEW_SPREADSHEET_ID
}

// Se executado diretamente, fazer teste
if (require.main === module) {
  testNewSheetAccess()
}
