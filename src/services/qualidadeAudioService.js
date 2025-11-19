/**
 * qualidadeAudioService.js
 * Serviço para upload e análise de áudios com GPT
 * 
 * VERSION: v1.2.0
 * DATE: 2024-12-19
 * AUTHOR: VeloHub Development Team
 */

const API_URL = 'https://backend-gcp-278491073220.us-east1.run.app';

/**
 * Upload de áudio para análise GPT
 * @param {string} avaliacaoId - ID da avaliação original
 * @param {File} audioFile - Arquivo de áudio
 * @returns {Promise<Object>} Resposta do servidor
 */
export const uploadAudioParaAnalise = async (avaliacaoId, audioFile) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('avaliacaoId', avaliacaoId);
    
    const response = await fetch(`${API_URL}/api/analise-audio/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro no upload');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro no upload de áudio:', error);
    throw error;
  }
};

/**
 * Verificar status do processamento GPT
 * @param {string} uploadId - ID do upload
 * @returns {Promise<Object>} Status do processamento
 */
export const verificarStatusAnaliseGPT = async (uploadId) => {
  try {
    const response = await fetch(`${API_URL}/api/analise-audio/status/${uploadId}`);
    
    if (!response.ok) {
      throw new Error('Erro ao verificar status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    throw error;
  }
};

/**
 * Obter resultado da análise GPT
 * @param {string} uploadId - ID do upload
 * @returns {Promise<Object>} Resultado da análise
 */
export const obterResultadoAnalise = async (uploadId) => {
  try {
    const response = await fetch(`${API_URL}/api/analise-audio/resultado/${uploadId}`);
    
    if (!response.ok) {
      throw new Error('Erro ao obter resultado');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao obter resultado:', error);
    throw error;
  }
};

/**
 * Listar análises GPT por colaborador
 * @param {string} colaboradorNome - Nome do colaborador
 * @param {string} mes - Mês (opcional)
 * @param {number} ano - Ano (opcional)
 * @returns {Promise<Object>} Lista de análises
 */
export const listarAnalisesPorColaborador = async (colaboradorNome, mes, ano) => {
  try {
    const params = new URLSearchParams();
    params.append('colaboradorNome', colaboradorNome);
    if (mes) params.append('mes', mes);
    if (ano) params.append('ano', ano);
    
    const response = await fetch(`${API_URL}/api/analise-audio/listar?${params}`);
    
    if (!response.ok) {
      throw new Error('Erro ao listar análises');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao listar análises:', error);
    throw error;
  }
};

/**
 * Auditar análise GPT
 * @param {string} uploadId - ID do upload
 * @param {Object} auditoriaData - Dados da auditoria
 * @returns {Promise<Object>} Resultado da auditoria
 */
export const auditarAvaliacaoGPT = async (uploadId, auditoriaData) => {
  try {
    const response = await fetch(`${API_URL}/api/analise-audio/auditar/${uploadId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(auditoriaData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao auditar');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao auditar análise:', error);
    throw error;
  }
};

/**
 * Monitorar status do processamento com polling
 * @param {string} uploadId - ID do upload
 * @param {Function} onStatusChange - Callback para mudanças de status
 * @param {Function} onComplete - Callback quando processamento completo
 * @param {Function} onError - Callback para erros
 * @returns {Function} Função para parar o polling
 */
export const monitorarProcessamento = (uploadId, onStatusChange, onComplete, onError) => {
  let isPolling = true;
  let pollCount = 0;
  const maxPolls = 60; // 5 minutos (5s * 60)
  
  const poll = async () => {
    if (!isPolling || pollCount >= maxPolls) {
      if (pollCount >= maxPolls) {
        onError(new Error('Timeout: Processamento demorou mais que o esperado'));
      }
      return;
    }
    
    try {
      const status = await verificarStatusAnaliseGPT(uploadId);
      onStatusChange(status);
      
      if (status.status === 'completed') {
        onComplete(status);
        isPolling = false;
      } else if (status.status === 'error') {
        onError(new Error(status.errorMessage || 'Erro no processamento'));
        isPolling = false;
      } else {
        // Continuar polling
        pollCount++;
        setTimeout(poll, 5000); // 5 segundos
      }
    } catch (error) {
      onError(error);
      isPolling = false;
    }
  };
  
  // Iniciar polling
  poll();
  
  // Retornar função para parar
  return () => {
    isPolling = false;
  };
};

/**
 * Validação de arquivo de áudio
 * @param {File} file - Arquivo a ser validado
 * @returns {Object} Resultado da validação
 */
export const validarArquivoAudio = (file) => {
  const ACCEPTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  
  const errors = [];
  
  if (!file) {
    errors.push('Nenhum arquivo selecionado');
  } else {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      errors.push('Formato não suportado. Use MP3 ou WAV.');
    }
    
    if (file.size > MAX_FILE_SIZE) {
      errors.push('Arquivo muito grande. Máximo 50MB.');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formatar tamanho do arquivo
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} Tamanho formatado
 */
export const formatarTamanhoArquivo = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Obter cor do status
 * @param {string} status - Status do processamento
 * @returns {string} Cor hexadecimal
 */
export const getStatusColor = (status) => {
  const colors = {
    'uploaded': '#FCC200',    // Amarelo
    'processing': '#FCC200',  // Amarelo
    'completed': '#15A237',   // Verde
    'error': '#f44336'        // Vermelho
  };
  
  return colors[status] || '#B0BEC5'; // Cinza padrão
};

/**
 * Obter texto do status
 * @param {string} status - Status do processamento
 * @returns {string} Texto do status
 */
export const getStatusText = (status) => {
  const texts = {
    'uploaded': 'Upload concluído',
    'processing': 'Processando...',
    'completed': 'Análise concluída',
    'error': 'Erro no processamento'
  };
  
  return texts[status] || 'Status desconhecido';
};

export default {
  uploadAudioParaAnalise,
  verificarStatusAnaliseGPT,
  obterResultadoAnalise,
  listarAnalisesPorColaborador,
  auditarAvaliacaoGPT,
  monitorarProcessamento,
  validarArquivoAudio,
  formatarTamanhoArquivo,
  getStatusColor,
  getStatusText
};