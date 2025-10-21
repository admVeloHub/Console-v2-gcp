

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Processa arquivo CSV ou Excel no servidor
 * @param {string} filePath - Caminho do arquivo
 * @param {string} fileType - Tipo do arquivo (.csv, .xlsx, .xls)
 * @returns {Object} - {rows: Array, errors: Array, totalRows: number}
 */
async function processFile(filePath, fileType) {
  console.log('🔄 Iniciando processamento no servidor...');
  
  try {
    let rawData = [];
    
    if (fileType === '.csv') {
      rawData = await processCSVFile(filePath);
    } else if (fileType === '.xlsx' || fileType === '.xls') {
      rawData = await processExcelFile(filePath);
    } else {
      throw new Error('Tipo de arquivo não suportado');
    }
    
    console.log(`📊 Dados brutos extraídos: ${rawData.length} linhas`);
    
    // Processar dados
    const result = processData(rawData);
    
    console.log(`✅ Processamento concluído: ${result.rows.length} válidos, ${result.errors.length} erros`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    throw error;
  }
}

/**
 * Processa arquivo CSV
 * @param {string} filePath - Caminho do arquivo CSV
 * @returns {Array} - Dados brutos
 */
async function processCSVFile(filePath) {
  console.log('📄 Processando arquivo CSV...');
  
  const csvContent = fs.readFileSync(filePath, 'utf8');
  const lines = csvContent.split('\n');
  
  if (lines.length === 0) {
    throw new Error('Arquivo CSV vazio');
  }
  
  // Parsear CSV manualmente (simples)
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }
  }
  
  return data;
}

/**
 * Processa arquivo Excel
 * @param {string} filePath - Caminho do arquivo Excel
 * @returns {Array} - Dados brutos
 */
async function processExcelFile(filePath) {
  console.log('📊 Processando arquivo Excel...');
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
      raw: false,
      dateNF: 'yyyy-mm-dd'
    });
    
    if (data.length === 0) {
      throw new Error('Planilha Excel vazia');
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Erro ao processar Excel:', error);
    throw new Error(`Erro ao processar Excel: ${error.message}`);
  }
}

/**
 * Processa dados brutos e valida
 * @param {Array} rawData - Dados brutos
 * @returns {Object} - {rows: Array, errors: Array, totalRows: number}
 */
function processData(rawData) {
  console.log('🔍 Processando e validando dados...');
  
  const rows = [];
  const errors = [];
  const totalRows = rawData.length;
  
  // Detectar se é dados da Velotax
  const isVelotaxData = detectVelotaxData(rawData);
  console.log(`📋 Tipo de dados detectado: ${isVelotaxData ? 'Velotax' : 'Padrão'}`);
  
  rawData.forEach((record, index) => {
    try {
      let processedRecord;
      
      if (isVelotaxData) {
        processedRecord = mapVelotaxRecord(record, index + 1);
      } else {
        processedRecord = mapStandardRecord(record, index + 1);
      }
      
      if (processedRecord) {
        rows.push(processedRecord);
      } else {
        errors.push({
          row: index + 1,
          data: record,
          error: 'Dados inválidos ou incompletos'
        });
      }
      
    } catch (error) {
      errors.push({
        row: index + 1,
        data: record,
        error: `Erro ao processar: ${error.message}`
      });
    }
  });
  
  return {
    rows,
    errors,
    totalRows,
    isVelotaxData
  };
}

/**
 * Detecta se os dados são da Velotax
 * @param {Array} rawData - Dados brutos
 * @returns {boolean}
 */
function detectVelotaxData(rawData) {
  if (!rawData || rawData.length === 0) return false;
  
  const firstRecord = rawData[0];
  const headers = Object.keys(firstRecord).map(h => h.toLowerCase());
  
  // Campos específicos da Velotax
  const velotaxFields = [
    'operador',
    'tempo total',
    'pergunta2 1 pergunta atendente',
    'pergunta2 2 pergunta solucao',
    'chamada',
    'id ligação',
    'fila',
    'cpf/cnpj'
  ];
  
  const foundFields = velotaxFields.filter(field => 
    headers.some(header => header.includes(field))
  );
  
  return foundFields.length >= 4; // Pelo menos 4 campos da Velotax
}

/**
 * Mapeia registro da Velotax para formato padrão
 * @param {Object} record - Registro da Velotax
 * @param {number} rowNumber - Número da linha
 * @returns {Object|null}
 */
function mapVelotaxRecord(record, rowNumber) {
  try {
    // Mapear campos da Velotax
    const operator = String(record['Operador'] || record['operador'] || '').trim();
    const dateStr = String(record['Data'] || record['data'] || '').trim();
    const totalTime = String(record['Tempo Total'] || record['tempo total'] || '').trim();
    const attendanceRating = parseFloat(record['Pergunta2 1 PERGUNTA ATENDENTE'] || record['pergunta2 1 pergunta atendente'] || '');
    const solutionRating = parseFloat(record['Pergunta2 2 PERGUNTA SOLUCAO'] || record['pergunta2 2 pergunta solucao'] || '');
    const callStatus = String(record['Chamada'] || record['chamada'] || '').trim();
    
    if (!operator || !dateStr) {
      return null;
    }
    
    // Converter tempo para minutos
    const totalDurationMinutes = convertTimeToMinutes(totalTime);
    
    // Definir ratings baseado no status da chamada
    let finalAttendanceRating = attendanceRating;
    let finalSolutionRating = solutionRating;
    
    if (callStatus.toLowerCase().includes('atendida')) {
      if (!finalAttendanceRating || isNaN(finalAttendanceRating)) finalAttendanceRating = 4;
      if (!finalSolutionRating || isNaN(finalSolutionRating)) finalSolutionRating = 4;
    } else {
      if (!finalAttendanceRating || isNaN(finalAttendanceRating)) finalAttendanceRating = 2;
      if (!finalSolutionRating || isNaN(finalSolutionRating)) finalSolutionRating = 2;
    }
    
    // Converter data
    let date;
    try {
      date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        date = new Date();
      }
    } catch {
      date = new Date();
    }
    
    return {
      date: date.toISOString(),
      operator: operator,
      duration_minutes: totalDurationMinutes,
      rating_attendance: finalAttendanceRating,
      rating_solution: finalSolutionRating,
      pause_minutes: 0, // Não disponível nos dados da Velotax
      call_status: callStatus,
      call_id: String(record['Id Ligação'] || record['id ligação'] || '').trim(),
      queue: String(record['Fila'] || record['fila'] || '').trim(),
      cpf_cnpj: String(record['Cpf/Cnpj'] || record['cpf/cnpj'] || '').trim(),
      ura_time: convertTimeToMinutes(record['Tempo URA'] || record['tempo ura'] || ''),
      talk_time: convertTimeToMinutes(record['Tempo Falado'] || record['tempo falado'] || ''),
      wait_time: convertTimeToMinutes(record['Tempo Espera'] || record['tempo espera'] || ''),
      overflow_count: parseInt(record['Quantidade De Transbordos'] || record['quantidade de transbordos'] || '0') || 0
    };
    
  } catch (error) {
    console.warn(`⚠️ Erro ao mapear registro da Velotax (linha ${rowNumber}):`, error.message);
    return null;
  }
}

/**
 * Mapeia registro padrão
 * @param {Object} record - Registro padrão
 * @param {number} rowNumber - Número da linha
 * @returns {Object|null}
 */
function mapStandardRecord(record, rowNumber) {
  try {
    const date = new Date(record.date || record.Date || '');
    const operator = String(record.operator || record.Operator || '').trim();
    const duration = parseFloat(record.duration_minutes || record.Duration || 0);
    const attendanceRating = parseFloat(record.rating_attendance || record.Rating_Attendance || 0);
    const solutionRating = parseFloat(record.rating_solution || record.Rating_Solution || 0);
    const pauseMinutes = parseFloat(record.pause_minutes || record.Pause_Minutes || 0);
    
    if (!operator || isNaN(date.getTime())) {
      return null;
    }
    
    return {
      date: date.toISOString(),
      operator: operator,
      duration_minutes: duration || 0,
      rating_attendance: attendanceRating || 0,
      rating_solution: solutionRating || 0,
      pause_minutes: pauseMinutes || 0
    };
    
  } catch (error) {
    console.warn(`⚠️ Erro ao mapear registro padrão (linha ${rowNumber}):`, error.message);
    return null;
  }
}

/**
 * Converte tempo (HH:MM:SS) para minutos
 * @param {string} timeStr - String de tempo
 * @returns {number} - Minutos
 */
function convertTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  
  try {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;
      return hours * 60 + minutes + seconds / 60;
    }
    return 0;
  } catch {
    return 0;
  }
}

module.exports = {
  processFile,
  processCSVFile,
  processExcelFile,
  processData,
  detectVelotaxData,
  mapVelotaxRecord,
  mapStandardRecord,
  convertTimeToMinutes
};
