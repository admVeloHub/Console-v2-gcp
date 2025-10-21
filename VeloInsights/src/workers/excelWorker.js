// Web Worker para processamento de Excel em background
self.onmessage = function(e) {
  const { data, fileSizeMB } = e.data
  
  try {
    // Importar XLSX dinamicamente
    importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js')
    
    // Opções otimizadas para arquivos grandes
    const workbook = XLSX.read(data, { 
      type: 'array',
      cellDates: false,
      cellNF: false,
      cellStyles: false,
      bookVBA: false,
      bookProps: false,
      bookSheets: false,
      dense: true
    })
    
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      raw: false,
      blankrows: false
    })
    
    if (jsonData.length === 0) {
      self.postMessage({ error: 'Planilha Excel vazia' })
      return
    }
    
    const headers = jsonData[0]
    const CHUNK_SIZE = fileSizeMB > 30 ? 500 : fileSizeMB > 20 ? 1000 : 2000
    const totalRows = jsonData.length - 1
    const totalChunks = Math.ceil(totalRows / CHUNK_SIZE)
    const rows = []
    
    // Processar em chunks com progresso
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const startIndex = chunkIndex * CHUNK_SIZE + 1
      const endIndex = Math.min(startIndex + CHUNK_SIZE, jsonData.length)
      
      for (let i = startIndex; i < endIndex; i++) {
        const row = jsonData[i]
        const obj = {}
        headers.forEach((header, index) => {
          obj[header] = row[index] || ''
        })
        rows.push(obj)
      }
      
      // Enviar progresso
      const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100)
      self.postMessage({ 
        type: 'progress', 
        progress,
        processed: rows.length,
        total: totalRows
      })
    }
    
    // Enviar resultado final
    self.postMessage({ 
      type: 'complete', 
      data: rows,
      totalRows: rows.length
    })
    
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error.message 
    })
  }
}
