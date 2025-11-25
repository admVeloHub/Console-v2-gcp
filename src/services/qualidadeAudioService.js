/**
 * qualidadeAudioService.js
 * Serviço para upload e análise de áudios com GPT
 * 
 * VERSION: v2.0.0
 * DATE: 2025-01-30
 * AUTHOR: VeloHub Development Team
 */

// Função auxiliar para normalizar URL base (remove /api do final se existir)
const normalizeBaseUrl = (url) => {
  return url.replace(/\/api\/?$/, '');
};

const API_URL = normalizeBaseUrl(process.env.REACT_APP_API_URL || 'https://backend-gcp-278491073220.us-east1.run.app');
const SSE_URL = `${API_URL}/events`;

// Formatos aceitos (atualizado conforme backend)
const ACCEPTED_FORMATS = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/webm',
  'audio/ogg'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Gerar Signed URL para upload no GCS
 * @param {string} nomeArquivo - Nome do arquivo
 * @param {string} mimeType - Tipo MIME do arquivo
 * @param {number} fileSize - Tamanho do arquivo em bytes
 * @param {string} avaliacaoId - ID da avaliação (opcional)
 * @returns {Promise<Object>} Resposta com Signed URL e avaliacaoId
 */
export const generateUploadUrl = async (nomeArquivo, mimeType, fileSize, avaliacaoId = null) => {
  try {
    const body = {
      nomeArquivo,
      mimeType,
      fileSize
    };

    // Adicionar avaliacaoId se fornecido
    if (avaliacaoId) {
      body.avaliacaoId = avaliacaoId;
    }

    const response = await fetch(`${API_URL}/api/audio-analise/generate-upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao gerar URL de upload');
    }

    const data = await response.json();
    
    // Validar resposta
    if (!data.success || !data.data || !data.data.uploadUrl) {
      throw new Error('Resposta inválida do servidor ao gerar URL de upload');
    }

    // Retornar dados com avaliacaoId em vez de audioId
    return {
      ...data.data,
      avaliacaoId: data.data.avaliacaoId || avaliacaoId
    };
  } catch (error) {
    console.error('Erro ao gerar URL de upload:', error);
    throw error;
  }
};

/**
 * Fazer upload direto para GCS usando Signed URL
 * @param {string} signedUrl - URL assinada do GCS
 * @param {File} file - Arquivo a ser enviado
 * @param {Function} onProgress - Callback de progresso (opcional)
 * @returns {Promise<void>}
 */
export const uploadToGCS = (signedUrl, file, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Configurar timeout (5 minutos)
    xhr.timeout = 5 * 60 * 1000;

    // Progresso do upload
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    // Sucesso
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        // Tratar erros específicos
        let errorMessage = 'Erro no upload para GCS';
        
        if (xhr.status === 403) {
          errorMessage = 'URL de upload expirada. Tente novamente.';
        } else if (xhr.status === 400) {
          errorMessage = 'Arquivo inválido para upload.';
        } else if (xhr.status === 0) {
          errorMessage = 'Erro de conexão. Verifique sua internet.';
        }

        reject(new Error(`${errorMessage} (Status: ${xhr.status})`));
      }
    });

    // Erro de rede
    xhr.addEventListener('error', () => {
      reject(new Error('Erro de rede ao fazer upload. Verifique sua conexão.'));
    });

    // Timeout
    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload demorou muito tempo. Tente novamente.'));
    });

    // Abort
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelado.'));
    });

    // Iniciar upload
    xhr.open('PUT', signedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
};

/**
 * Upload de áudio para análise GPT (novo fluxo com GCS)
 * @param {string} avaliacaoId - ID da avaliação original (opcional, mantido para compatibilidade)
 * @param {File} audioFile - Arquivo de áudio
 * @param {Function} onProgress - Callback de progresso (opcional)
 * @returns {Promise<Object>} Resposta com audioId e fileName
 */
export const uploadAudioParaAnalise = async (avaliacaoId, audioFile, onProgress) => {
  try {
    // Validar arquivo antes de fazer upload
    const validation = validarArquivoAudio(audioFile);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // 1. Gerar Signed URL
    const uploadData = await generateUploadUrl(
      audioFile.name,
      audioFile.type,
      audioFile.size,
      avaliacaoId
    );

    // 2. Fazer upload direto para GCS com retry
    let uploadSuccess = false;
    let lastError = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await uploadToGCS(uploadData.uploadUrl, audioFile, onProgress);
        uploadSuccess = true;
        break;
      } catch (error) {
        lastError = error;
        
        // Se for erro 403 (URL expirada), tentar gerar nova URL
        if (error.message.includes('403') && attempt < maxRetries) {
          console.log(`Tentativa ${attempt} falhou, gerando nova URL...`);
          const newUploadData = await generateUploadUrl(
            audioFile.name,
            audioFile.type,
            audioFile.size,
            avaliacaoId
          );
          uploadData.uploadUrl = newUploadData.uploadUrl;
          uploadData.avaliacaoId = newUploadData.avaliacaoId;
          uploadData.fileName = newUploadData.fileName;
          
          // Esperar um pouco antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        // Se não for erro recuperável ou última tentativa, lançar erro
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }

    if (!uploadSuccess) {
      throw lastError || new Error('Falha no upload após múltiplas tentativas');
    }

    // 3. Retornar dados do upload
    return {
      avaliacaoId: uploadData.avaliacaoId || avaliacaoId,
      fileName: uploadData.fileName,
      status: 'uploaded',
      bucket: uploadData.bucket
    };
  } catch (error) {
    console.error('Erro no upload de áudio:', error);
    throw error;
  }
};

/**
 * Verificar status do processamento GPT
 * @param {string} avaliacaoId - ID da avaliação
 * @returns {Promise<Object>} Status do processamento
 */
export const verificarStatusAnaliseGPT = async (avaliacaoId) => {
  try {
    const response = await fetch(`${API_URL}/api/audio-analise/status/${avaliacaoId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao verificar status');
    }
    
    const data = await response.json();
    
    // Normalizar status para compatibilidade
    if (data.success && data.data) {
      return {
        success: true,
        status: data.data.status, // 'pendente', 'processando', 'concluido'
        avaliacaoId: data.data.avaliacaoId,
        nomeArquivoAudio: data.data.nomeArquivoAudio,
        sent: data.data.sent,
        treated: data.data.treated,
        audioCreatedAt: data.data.audioCreatedAt,
        audioUpdatedAt: data.data.audioUpdatedAt
      };
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    throw error;
  }
};

/**
 * Obter resultado da análise GPT
 * @param {string} avaliacaoId - ID da avaliação
 * @returns {Promise<Object>} Resultado da análise
 */
export const obterResultadoAnalise = async (avaliacaoId) => {
  try {
    const response = await fetch(`${API_URL}/api/audio-analise/result/${avaliacaoId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao obter resultado');
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao obter resultado:', error);
    throw error;
  }
};

/**
 * Criar conexão SSE para monitorar eventos de áudio
 * @param {string} avaliacaoId - ID da avaliação a monitorar
 * @param {Object} callbacks - Callbacks para eventos
 * @param {Function} callbacks.onStatusChange - Callback quando status muda
 * @param {Function} callbacks.onComplete - Callback quando processamento completa
 * @param {Function} callbacks.onError - Callback para erros
 * @returns {Function} Função para desconectar
 */
export const createSSEConnection = (avaliacaoId, callbacks = {}) => {
  let eventSource = null;
  let reconnectTimeout = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let isDisconnected = false;

  const connect = () => {
    if (isDisconnected) return;

    try {
      eventSource = new EventSource(SSE_URL);

      eventSource.addEventListener('audio-analysis', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Filtrar eventos apenas para este avaliacaoId
          if (data.avaliacaoId === avaliacaoId || data.avaliacaoId === avaliacaoId.toString()) {
            const status = data.status;

            if (callbacks.onStatusChange) {
              callbacks.onStatusChange({
                status,
                avaliacaoId: data.avaliacaoId,
                nomeArquivoAudio: data.nomeArquivoAudio,
                timestamp: data.timestamp
              });
            }

            if (status === 'concluido') {
              if (callbacks.onComplete) {
                callbacks.onComplete({
                  status,
                  avaliacaoId: data.avaliacaoId,
                  nomeArquivoAudio: data.nomeArquivoAudio,
                  timestamp: data.timestamp
                });
              }
              disconnect();
            } else if (status === 'erro') {
              if (callbacks.onError) {
                callbacks.onError(new Error(data.error || 'Erro no processamento'));
              }
              disconnect();
            }
          }
        } catch (error) {
          console.error('Erro ao processar evento SSE:', error);
          // Ignorar evento inválido e continuar
        }
      });

      eventSource.addEventListener('error', (error) => {
        console.error('Erro na conexão SSE:', error);
        
        // Tentar reconectar se não foi desconexão manual
        if (!isDisconnected && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000); // Exponential backoff, max 30s
          
          if (callbacks.onStatusChange) {
            callbacks.onStatusChange({
              status: 'reconectando',
              message: `Reconectando... (tentativa ${reconnectAttempts}/${maxReconnectAttempts})`
            });
          }

          reconnectTimeout = setTimeout(() => {
            if (eventSource) {
              eventSource.close();
            }
            connect();
          }, delay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          // Fallback para polling após muitas tentativas
          if (callbacks.onError) {
            callbacks.onError(new Error('Falha ao conectar ao SSE. Usando polling como alternativa.'));
          }
          disconnect();
        }
      });

      eventSource.addEventListener('open', () => {
        reconnectAttempts = 0; // Reset contador ao conectar com sucesso
      });

    } catch (error) {
      console.error('Erro ao criar conexão SSE:', error);
      if (callbacks.onError) {
        callbacks.onError(error);
      }
    }
  };

  const disconnect = () => {
    isDisconnected = true;
    
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };

  // Iniciar conexão
  connect();

  // Retornar função de desconexão
  return disconnect;
};

/**
 * Monitorar status do processamento com SSE (preferencial) e polling (fallback)
 * @param {string} avaliacaoId - ID da avaliação
 * @param {Function} onStatusChange - Callback para mudanças de status
 * @param {Function} onComplete - Callback quando processamento completo
 * @param {Function} onError - Callback para erros
 * @returns {Function} Função para parar o monitoramento
 */
export const monitorarProcessamento = (avaliacaoId, onStatusChange, onComplete, onError) => {
  let sseDisconnect = null;
  let pollingStop = null;
  let useSSE = true;
  let isStopped = false;

  // Tentar SSE primeiro
  try {
    sseDisconnect = createSSEConnection(avaliacaoId, {
      onStatusChange: (data) => {
        if (!isStopped) {
          onStatusChange({
            success: true,
            status: data.status,
            avaliacaoId: data.avaliacaoId,
            nomeArquivoAudio: data.nomeArquivoAudio
          });
        }
      },
      onComplete: (data) => {
        if (!isStopped) {
          onComplete({
            success: true,
            status: 'concluido',
            avaliacaoId: data.avaliacaoId,
            nomeArquivoAudio: data.nomeArquivoAudio
          });
        }
      },
      onError: (error) => {
        // Se SSE falhar, tentar polling como fallback
        if (useSSE && !isStopped) {
          console.warn('SSE falhou, usando polling como fallback:', error.message);
          useSSE = false;
          
          if (sseDisconnect) {
            sseDisconnect();
          }
          
          // Iniciar polling
          pollingStop = startPolling(avaliacaoId, onStatusChange, onComplete, onError);
        } else if (!isStopped) {
          onError(error);
        }
      }
    });
  } catch (error) {
    // Se não conseguir criar SSE, usar polling diretamente
    console.warn('SSE não disponível, usando polling:', error.message);
    useSSE = false;
    pollingStop = startPolling(avaliacaoId, onStatusChange, onComplete, onError);
  }

  // Função para parar monitoramento
  const stop = () => {
    isStopped = true;
    
    if (sseDisconnect) {
      sseDisconnect();
    }
    
    if (pollingStop) {
      pollingStop();
    }
  };

  return stop;
};

/**
 * Iniciar polling para verificar status
 * @param {string} avaliacaoId - ID da avaliação
 * @param {Function} onStatusChange - Callback para mudanças de status
 * @param {Function} onComplete - Callback quando completo
 * @param {Function} onError - Callback para erros
 * @returns {Function} Função para parar polling
 */
const startPolling = (avaliacaoId, onStatusChange, onComplete, onError) => {
  let isPolling = true;
  let pollCount = 0;
  const maxPolls = 120; // 10 minutos (5s * 120)
  const pollInterval = 5000; // 5 segundos
  
  const poll = async () => {
    if (!isPolling || pollCount >= maxPolls) {
      if (pollCount >= maxPolls) {
        onError(new Error('Timeout: Processamento demorou mais que o esperado (10 minutos)'));
      }
      return;
    }
    
    try {
      const statusData = await verificarStatusAnaliseGPT(avaliacaoId);
      
      if (statusData.success) {
        const status = statusData.status;
        
        onStatusChange(statusData);
        
        if (status === 'concluido') {
          onComplete(statusData);
          isPolling = false;
        } else if (status === 'erro') {
          onError(new Error('Erro no processamento do áudio'));
          isPolling = false;
        } else {
          // Continuar polling
          pollCount++;
          setTimeout(poll, pollInterval);
        }
      } else {
        pollCount++;
        setTimeout(poll, pollInterval);
      }
    } catch (error) {
      // Em caso de erro, continuar tentando por um tempo
      if (pollCount < 10) {
        pollCount++;
        setTimeout(poll, pollInterval);
      } else {
        onError(error);
        isPolling = false;
      }
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
    
    const response = await fetch(`${API_URL}/api/audio-analise/listar?${params}`);
    
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
 * Editar análise GPT ou Quality
 * @param {string} analiseId - ID da análise
 * @param {string} analysis - Texto da análise editado
 * @param {string} tipo - Tipo da análise ('gpt' ou 'quality')
 * @returns {Promise<Object>} Resultado da edição
 */
export const editarAnaliseGPT = async (analiseId, analysis, tipo = 'gpt') => {
  try {
    if (!analiseId) {
      throw new Error('ID da análise é obrigatório');
    }

    if (!analysis || typeof analysis !== 'string') {
      throw new Error('Campo analysis é obrigatório e deve ser uma string');
    }

    if (tipo !== 'gpt' && tipo !== 'quality') {
      throw new Error('Tipo deve ser "gpt" ou "quality"');
    }

    const response = await fetch(`${API_URL}/api/audio-analise/${analiseId}/editar-analise`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        analysis: analysis,
        tipo: tipo
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Erro ao editar análise');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao editar análise:', error);
    throw error;
  }
};

/**
 * Validação de arquivo de áudio
 * @param {File} file - Arquivo a ser validado
 * @returns {Object} Resultado da validação
 */
export const validarArquivoAudio = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('Nenhum arquivo selecionado');
  } else {
    // Validar formato
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      // Tentar validar por extensão também
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      const validExtensions = ['.mp3', '.wav', '.m4a', '.mp4', '.webm', '.ogg'];
      
      if (!validExtensions.includes(extension)) {
        errors.push(`Formato não suportado. Formatos aceitos: ${ACCEPTED_FORMATS.map(f => f.split('/')[1]).join(', ')}`);
      }
    }
    
    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`Arquivo muito grande (${formatarTamanhoArquivo(file.size)}). Tamanho máximo permitido: ${formatarTamanhoArquivo(MAX_FILE_SIZE)}`);
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
    'pendente': '#B0BEC5',      // Cinza
    'uploaded': '#FCC200',       // Amarelo
    'processando': '#FCC200',   // Amarelo
    'concluido': '#15A237',     // Verde
    'completed': '#15A237',     // Verde (compatibilidade)
    'error': '#f44336',          // Vermelho
    'erro': '#f44336'            // Vermelho
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
    'pendente': 'Aguardando envio',
    'uploaded': 'Upload concluído',
    'processando': 'Processando...',
    'concluido': 'Análise concluída',
    'completed': 'Análise concluída',
    'error': 'Erro no processamento',
    'erro': 'Erro no processamento',
    'reconectando': 'Reconectando...'
  };
  
  return texts[status] || 'Status desconhecido';
};

export default {
  generateUploadUrl,
  uploadToGCS,
  uploadAudioParaAnalise,
  verificarStatusAnaliseGPT,
  obterResultadoAnalise,
  createSSEConnection,
  monitorarProcessamento,
  listarAnalisesPorColaborador,
  auditarAvaliacaoGPT,
  validarArquivoAudio,
  formatarTamanhoArquivo,
  getStatusColor,
  getStatusText
};
