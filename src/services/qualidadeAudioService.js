// VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

import axios from 'axios';

// ===== CONFIGURAÇÕES =====
const API_CONFIG = {
  BASE_URL: 'https://back-console.vercel.app',
  ENDPOINTS: {
    UPLOAD_AUDIO: '/api/qualidade/upload-audio',
    GET_AUDIO_STATUS: '/api/qualidade/audio',
    DELETE_AUDIO: '/api/qualidade/audio'
  },
  TIMEOUT: 300000, // 5 minutos para upload e análise
  MAX_FILE_SIZE: 50 * 1024 * 1024 // 50MB
};

// ===== CONFIGURAÇÃO DO AXIOS =====
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ===== INTERCEPTOR DE RESPOSTA =====
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ [API] Resposta recebida:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ [API] Erro na requisição:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// ===== FUNÇÕES DE UPLOAD =====

/**
 * Upload de áudio com análise GPT-4o
 * @param {string} avaliacaoId - ID da avaliação
 * @param {File} audioFile - Arquivo de áudio (MP3/WAV)
 * @param {Function} onProgress - Callback para progresso do upload
 * @returns {Promise<Object>} Resultado da análise
 */
export const uploadAudioWithAnalysis = async (avaliacaoId, audioFile, onProgress = null) => {
  try {
    console.log('📤 [AUDIO_SERVICE] Iniciando upload de áudio...');
    console.log('🆔 [AUDIO_SERVICE] Avaliação ID:', avaliacaoId);
    console.log('🎤 [AUDIO_SERVICE] Arquivo:', audioFile.name, '-', audioFile.size, 'bytes');

    // Validar arquivo
    validateAudioFile(audioFile);

    // Criar FormData
    const formData = new FormData();
    formData.append('audio', audioFile);

    // Configurar requisição com progresso
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      }
    };

    // Fazer upload
    const response = await apiClient.post(
      `${API_CONFIG.ENDPOINTS.UPLOAD_AUDIO}/${avaliacaoId}`,
      formData,
      config
    );

    console.log('✅ [AUDIO_SERVICE] Upload e análise concluídos');
    console.log('📊 [AUDIO_SERVICE] Pontuação:', response.data.data.pontuacao);
    console.log('🎯 [AUDIO_SERVICE] Confiança:', response.data.data.confianca, '%');

    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ [AUDIO_SERVICE] Erro no upload:', error);
    return handleUploadError(error);
  }
};

/**
 * Verificar status do áudio de uma avaliação
 * @param {string} avaliacaoId - ID da avaliação
 * @returns {Promise<Object>} Status do áudio
 */
export const getAudioStatus = async (avaliacaoId) => {
  try {
    console.log('🔍 [AUDIO_SERVICE] Verificando status do áudio...');
    console.log('🆔 [AUDIO_SERVICE] Avaliação ID:', avaliacaoId);

    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.GET_AUDIO_STATUS}/${avaliacaoId}`
    );

    console.log('✅ [AUDIO_SERVICE] Status obtido:', {
      hasAudio: response.data.hasAudio,
      hasAnalysis: response.data.hasAnalysis,
      audioFile: response.data.audioFile
    });

    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error('❌ [AUDIO_SERVICE] Erro ao verificar status:', error);
    return handleApiError(error);
  }
};

/**
 * Remover áudio e análise de uma avaliação
 * @param {string} avaliacaoId - ID da avaliação
 * @returns {Promise<Object>} Resultado da remoção
 */
export const deleteAudio = async (avaliacaoId) => {
  try {
    console.log('🗑️ [AUDIO_SERVICE] Removendo áudio...');
    console.log('🆔 [AUDIO_SERVICE] Avaliação ID:', avaliacaoId);

    const response = await apiClient.delete(
      `${API_CONFIG.ENDPOINTS.DELETE_AUDIO}/${avaliacaoId}`
    );

    console.log('✅ [AUDIO_SERVICE] Áudio removido com sucesso');

    return {
      success: true,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ [AUDIO_SERVICE] Erro ao remover áudio:', error);
    return handleApiError(error);
  }
};

// ===== FUNÇÕES AUXILIARES =====

/**
 * Validar arquivo de áudio antes do upload
 * @param {File} file - Arquivo a ser validado
 */
const validateAudioFile = (file) => {
  // Verificar se é um arquivo
  if (!file || !(file instanceof File)) {
    throw new Error('Arquivo inválido');
  }

  // Verificar tamanho
  if (file.size > API_CONFIG.MAX_FILE_SIZE) {
    throw new Error(`Arquivo muito grande. Tamanho máximo: ${API_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Verificar se não está vazio
  if (file.size === 0) {
    throw new Error('Arquivo vazio');
  }

  // Verificar tipo MIME
  const allowedMimeTypes = [
    'audio/mpeg',    // MP3
    'audio/wav',     // WAV
    'audio/mp3',     // MP3 alternativo
    'audio/mpeg3',   // MP3 alternativo
    'audio/x-mpeg-3' // MP3 alternativo
  ];

  if (!allowedMimeTypes.includes(file.type)) {
    // Verificar extensão como fallback
    const allowedExtensions = ['.mp3', '.wav', '.mpeg'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error('Formato de arquivo não suportado. Use MP3 ou WAV.');
    }
  }

  console.log('✅ [AUDIO_SERVICE] Arquivo validado:', {
    name: file.name,
    type: file.type,
    size: file.size
  });
};

/**
 * Tratar erros específicos de upload
 * @param {Error} error - Erro capturado
 * @returns {Object} Resposta de erro formatada
 */
const handleUploadError = (error) => {
  if (error.response) {
    // Erro da API
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          success: false,
          error: data.error || 'Erro na validação do arquivo',
          code: data.code || 'VALIDATION_ERROR'
        };
      
      case 404:
        return {
          success: false,
          error: 'Avaliação não encontrada',
          code: 'AVALIACAO_NOT_FOUND'
        };
      
      case 413:
        return {
          success: false,
          error: 'Arquivo muito grande',
          code: 'FILE_TOO_LARGE'
        };
      
      case 500:
        return {
          success: false,
          error: data.error || 'Erro interno do servidor',
          code: 'SERVER_ERROR'
        };
      
      default:
        return {
          success: false,
          error: data.error || 'Erro desconhecido',
          code: 'UNKNOWN_ERROR'
        };
    }
  }

  if (error.code === 'ECONNABORTED') {
    return {
      success: false,
      error: 'Timeout na requisição. Arquivo muito grande ou conexão lenta.',
      code: 'TIMEOUT_ERROR'
    };
  }

  if (error.message.includes('Network Error')) {
    return {
      success: false,
      error: 'Erro de conexão. Verifique sua internet.',
      code: 'NETWORK_ERROR'
    };
  }

  // Erro de validação local
  return {
    success: false,
    error: error.message,
    code: 'VALIDATION_ERROR'
  };
};

/**
 * Tratar erros gerais da API
 * @param {Error} error - Erro capturado
 * @returns {Object} Resposta de erro formatada
 */
const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    return {
      success: false,
      error: data.error || 'Erro na API',
      code: data.code || 'API_ERROR',
      status: status
    };
  }

  return {
    success: false,
    error: error.message || 'Erro desconhecido',
    code: 'UNKNOWN_ERROR'
  };
};

// ===== UTILITÁRIOS =====

/**
 * Formatar tamanho de arquivo para exibição
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} Tamanho formatado
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Verificar se o arquivo é um áudio válido
 * @param {File} file - Arquivo a ser verificado
 * @returns {boolean} Se é válido
 */
export const isValidAudioFile = (file) => {
  try {
    validateAudioFile(file);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Obter informações do arquivo para exibição
 * @param {File} file - Arquivo
 * @returns {Object} Informações formatadas
 */
export const getFileInfo = (file) => {
  return {
    name: file.name,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    type: file.type,
    lastModified: new Date(file.lastModified).toLocaleString('pt-BR')
  };
};

// ===== EXPORTS =====
export default {
  uploadAudioWithAnalysis,
  getAudioStatus,
  deleteAudio,
  formatFileSize,
  isValidAudioFile,
  getFileInfo,
  API_CONFIG
};
