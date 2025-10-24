// VERSION: v1.1.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import * as XLSX from 'xlsx';

class CapacityService {
  constructor() {
    // Parâmetros padrão do sistema
    this.parameters = {
      weekdays: {
        horasEfetivas: 7.5,
        capacidadePorHora: 15,
        capacidadeSegura: 11.25
      },
      saturday: {
        horasEfetivas: 5.5,
        capacidadePorHora: 11,
        capacidadeSegura: 8.25
      },
      global: {
        tma: 5, // minutos
        nivelServico: 80, // %
        tempoEspera: 20, // segundos
        abandono: 5 // %
      }
    };
  }

  // Atualizar parâmetros customizados
  updateParameters(params) {
    this.parameters = params;
  }

  // ========================================
  // FUNÇÕES DE LEITURA DE ARQUIVOS
  // ========================================

  // Ler arquivo Excel
  readExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          const processedData = this.processExcelData(jsonData);
          resolve(processedData);
        } catch (error) {
          reject(new Error(`Erro ao processar arquivo Excel: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Ler arquivo CSV
  readCSVFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const processedData = this.processCSVData(e.target.result);
          resolve(processedData);
        } catch (error) {
          reject(new Error(`Erro ao processar arquivo CSV: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }

  // ========================================
  // FUNÇÕES DE PROCESSAMENTO DE DADOS
  // ========================================

  // Processar dados do Excel
  processExcelData(jsonData) {
    const data = [];
    
    console.log('📊 Dados brutos do Excel recebidos:', jsonData);
    console.log('📊 Número de linhas:', jsonData.length);
    
    // Pular cabeçalho se existir
    const startRow = this.isHeaderRow(jsonData[0]) ? 1 : 0;
    console.log('🚀 Primeira linha de dados (índice):', startRow);
    
    for (let i = startRow; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      if (!row || row.length < 2) continue;
      
      const intervalo = row[0];
      const volume = row[1];
      
      // Validar dados
      if (this.isValidInterval(intervalo) && this.isValidVolume(volume)) {
        data.push({
          intervalo: this.normalizeInterval(intervalo),
          volume: Number(volume)
        });
      }
    }
    
    console.log(`📊 Total de registros processados: ${data.length}`);
    return data;
  }

  // Processar dados do CSV
  processCSVData(csvContent) {
    const lines = csvContent.split('\n');
    const data = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(',');
      if (columns.length < 2) continue;
      
      const intervalo = columns[0].trim();
      const volume = columns[1].trim();
      
      // Validar dados
      if (this.isValidInterval(intervalo) && this.isValidVolume(volume)) {
        data.push({
          intervalo: this.normalizeInterval(intervalo),
          volume: Number(volume)
        });
      }
    }
    
    console.log(`📊 Total de registros processados: ${data.length}`);
    return data;
  }

  // ========================================
  // FUNÇÕES DE VALIDAÇÃO
  // ========================================

  // Validar estrutura dos dados
  validateData(data) {
    const errors = [];
    
    if (!Array.isArray(data)) {
      errors.push('Dados devem ser um array');
      return { valid: false, errors };
    }
    
    if (data.length === 0) {
      errors.push('Nenhum dado encontrado');
      return { valid: false, errors };
    }
    
    // Verificar se todos os registros têm a estrutura correta
    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      
      if (!record.intervalo || !record.volume) {
        errors.push(`Registro ${i + 1}: estrutura inválida`);
      }
      
      if (!this.isValidInterval(record.intervalo)) {
        errors.push(`Registro ${i + 1}: intervalo inválido (${record.intervalo})`);
      }
      
      if (!this.isValidVolume(record.volume)) {
        errors.push(`Registro ${i + 1}: volume inválido (${record.volume})`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Verificar se é linha de cabeçalho
  isHeaderRow(row) {
    if (!row || row.length < 2) return false;
    
    const firstCell = String(row[0]).toLowerCase();
    const secondCell = String(row[1]).toLowerCase();
    
    return firstCell.includes('intervalo') || 
           firstCell.includes('hora') || 
           secondCell.includes('quantidade') || 
           secondCell.includes('volume') ||
           secondCell.includes('ligação');
  }

  // Validar intervalo
  isValidInterval(intervalo) {
    if (!intervalo) return false;
    
    const str = String(intervalo).trim();
    
    // Aceitar números (8, 9, 10)
    if (/^\d+$/.test(str)) return true;
    
    // Aceitar horários (8:00, 9:00, 10:00)
    if (/^\d{1,2}:\d{2}$/.test(str)) return true;
    
    return false;
  }

  // Validar volume
  isValidVolume(volume) {
    if (volume === null || volume === undefined) return false;
    
    const num = Number(volume);
    return !isNaN(num) && num >= 0;
  }

  // Normalizar intervalo
  normalizeInterval(intervalo) {
    const str = String(intervalo).trim();
    
    // Se for número, retornar como está
    if (/^\d+$/.test(str)) {
      return Number(str);
    }
    
    // Se for horário, extrair a hora
    if (/^\d{1,2}:\d{2}$/.test(str)) {
      return Number(str.split(':')[0]);
    }
    
    return str;
  }

  // ========================================
  // FUNÇÕES DE CÁLCULO
  // ========================================

  // Calcular fatorial
  factorial(n) {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }

  // Calcular Erlang C
  erlangC(agents, traffic) {
    if (agents <= 0 || traffic < 0) return 0;
    
    // Fórmula Erlang C
    let sum = 0;
    for (let i = 0; i < agents; i++) {
      sum += Math.pow(traffic, i) / this.factorial(i);
    }
    
    const numerator = Math.pow(traffic, agents) / this.factorial(agents);
    const denominator = sum + (Math.pow(traffic, agents) / this.factorial(agents)) * (agents / (agents - traffic));
    
    return numerator / denominator;
  }

  // Calcular HCs necessários
  calculateHCs(volume, type = 'weekdays', customParameters = null) {
    const params = customParameters || this.parameters;
    const typeParams = params[type];
    const tma = params.global.tma;
    
    // Traffic intensity (Erlangs)
    const traffic = (volume * tma) / 60; // Convertido para minutos
    
    // Capacidade por HC por hora
    const capacidadePorHC = typeParams.capacidadeSegura;
    
    // HCs necessários
    const hcs = Math.ceil(volume / capacidadePorHC);
    
    // Utilização
    const utilizacao = (volume / (hcs * capacidadePorHC)) * 100;
    
    // Status baseado na utilização
    let status = 'Saudável';
    if (utilizacao > 90) status = 'Crítico';
    else if (utilizacao > 75) status = 'Atenção';
    
    return {
      hcs,
      traffic,
      utilizacao: Math.round(utilizacao * 100) / 100,
      status,
      capacidadePorHC
    };
  }

  // Processar dados de capacidade
  processCapacityData(data, type = 'weekdays', customParameters = null) {
    const params = customParameters || this.parameters;
    const results = [];
    let totalHCs = 0;
    let totalVolume = 0;
    let totalUtilizacao = 0;
    
    for (const record of data) {
      const calculation = this.calculateHCs(record.volume, type, params);
      
      results.push({
        intervalo: record.intervalo,
        volume: record.volume,
        hcs: calculation.hcs,
        utilizacao: calculation.utilizacao,
        status: calculation.status,
        traffic: calculation.traffic
      });
      
      totalHCs += calculation.hcs;
      totalVolume += record.volume;
      totalUtilizacao += calculation.utilizacao;
    }
    
    return {
      results,
      summary: {
        totalHCs,
        totalVolume,
        utilizacaoMedia: Math.round((totalUtilizacao / results.length) * 100) / 100,
        totalRegistros: results.length
      }
    };
  }

  // ========================================
  // FUNÇÃO DE EXPORTAÇÃO
  // ========================================

  // Exportar para Excel
  exportToExcel(weekdaysResults, saturdayResults) {
    try {
      const wb = XLSX.utils.book_new();
      
      // Aba 1: Dias Úteis
      if (weekdaysResults && weekdaysResults.results) {
        const ws1 = XLSX.utils.json_to_sheet(weekdaysResults.results);
        XLSX.utils.book_append_sheet(wb, ws1, 'Dias Úteis');
      }
      
      // Aba 2: Sábado
      if (saturdayResults && saturdayResults.results) {
        const ws2 = XLSX.utils.json_to_sheet(saturdayResults.results);
        XLSX.utils.book_append_sheet(wb, ws2, 'Sábado');
      }
      
      // Aba 3: Resumo
      const summaryData = [];
      if (weekdaysResults && weekdaysResults.summary) {
        summaryData.push({
          Tipo: 'Dias Úteis',
          'Total HCs': weekdaysResults.summary.totalHCs,
          'Total Volume': weekdaysResults.summary.totalVolume,
          'Utilização Média (%)': weekdaysResults.summary.utilizacaoMedia,
          'Total Registros': weekdaysResults.summary.totalRegistros
        });
      }
      
      if (saturdayResults && saturdayResults.summary) {
        summaryData.push({
          Tipo: 'Sábado',
          'Total HCs': saturdayResults.summary.totalHCs,
          'Total Volume': saturdayResults.summary.totalVolume,
          'Utilização Média (%)': saturdayResults.summary.utilizacaoMedia,
          'Total Registros': saturdayResults.summary.totalRegistros
        });
      }
      
      if (summaryData.length > 0) {
        const ws3 = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws3, 'Resumo');
      }
      
      // Gerar nome com timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `Dimensionamento_CallCenter_${timestamp}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      
      console.log('✅ Arquivo Excel exportado com sucesso:', fileName);
      
    } catch (error) {
      console.error('❌ Erro ao exportar Excel:', error);
      throw new Error(`Erro ao exportar Excel: ${error.message}`);
    }
  }
}

// Exportar instância única
export const capacityService = new CapacityService();
