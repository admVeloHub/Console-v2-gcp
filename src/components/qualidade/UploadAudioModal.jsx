/**
 * UploadAudioModal.jsx
 * Modal para upload de arquivos de áudio para análise GPT
 * 
 * VERSION: v2.5.0
 * DATE: 2026-04-15
 * AUTHOR: VeloHub Development Team
 * CHANGELOG: v2.5.0 - fetch status/reenvio: base via getResolvedApiOrigin (dev → localhost)
 * CHANGELOG: v2.4.1 - Release push GitHub 2026-04-10
 * CHANGELOG: v2.4.0 - Status do modal alinhado à linha da tabela (fallback se GET status-por-avaliacao falhar ou data null); normalizeAvaliacaoIdForFetch para URL ($oid / ObjectId)
 * CHANGELOG: v2.3.0 - Reenvio manual só após audioTreated failed + audioManualReenvioDisponivelEm; chip Processado aligned pending/done/failed
 * CHANGELOG: v2.2.0 - Botão "Enviar para Análise" é ocultado após upload concluído para evitar reenvios acidentais
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
  LinearProgress,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  AudioFile as AudioFileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  uploadAudioParaAnalise,
  monitorarProcessamento,
  validarArquivoAudio,
  formatarTamanhoArquivo,
  getStatusText,
  getStatusColor,
  reenviarAudioPubSub
} from '../../services/qualidadeAudioService';
import { getResolvedApiOrigin } from '../../services/api';

/** ID seguro para path da API (evita [object Object] quando _id vem como objeto Mongo). */
const normalizeAvaliacaoIdForFetch = (raw) => {
  if (raw == null || raw === '') return '';
  if (typeof raw === 'string' || typeof raw === 'number') return String(raw).trim();
  if (typeof raw === 'object') {
    if (typeof raw.$oid === 'string') return raw.$oid;
    if (raw._id != null) return normalizeAvaliacaoIdForFetch(raw._id);
    if (typeof raw.toString === 'function') {
      const s = raw.toString();
      if (s && s !== '[object Object]') return s;
    }
  }
  return '';
};

const UploadAudioModal = ({ 
  open, 
  onClose, 
  onUpload, 
  avaliacaoId,
  avaliacao 
}) => {
  // Estados do modal
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioId, setAudioId] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null); // 'uploading', 'processing', 'completed', 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [audioStatus, setAudioStatus] = useState(null);
  const [audioJaEnviado, setAudioJaEnviado] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  
  // Ref para função de desconexão do monitoramento
  const stopMonitoringRef = useRef(null);
  
  // Extrair avaliacaoNome do objeto avaliacao se disponível
  const avaliacaoNome = avaliacao?.colaboradorNome || null;

  const rowIdForAudioStatus =
    normalizeAvaliacaoIdForFetch(avaliacaoId) || normalizeAvaliacaoIdForFetch(avaliacao?._id);
  const rowAudioSentFlag = avaliacao?.audioSent === true;
  const rowAudioTreated = avaliacao?.audioTreated;
  const rowNomeArquivoAudio = avaliacao?.nomeArquivoAudio ?? null;
  const rowAudioCreatedAt = avaliacao?.audioCreatedAt ?? null;
  const rowAudioUpdatedAt = avaliacao?.audioUpdatedAt ?? null;
  const rowAudioUnlock = avaliacao?.audioManualReenvioDisponivelEm ?? null;
  const rowAudioAttempts = avaliacao?.audioAutoRepublishAttempts ?? 0;
  const rowAudioLastAuto = avaliacao?.audioLastAutoRepublishAt ?? null;
  
  // Estados de feedback
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const pipelineDone = (t) => t === true || t === 'done';

  const podeReenviar = () => {
    if (!audioStatus || !audioStatus.sent || pipelineDone(audioStatus.treated)) {
      return false;
    }
    if (audioStatus.treated !== 'failed') {
      return false;
    }
    const unlock = audioStatus.audioManualReenvioDisponivelEm;
    if (!unlock) return true;
    return Date.now() >= new Date(unlock).getTime();
  };

  // Função para reenviar áudio para Pub/Sub
  const handleReenviarAudio = async () => {
    // Tentar obter avaliacaoId de diferentes fontes
    const idParaUsar =
      normalizeAvaliacaoIdForFetch(avaliacaoId) ||
      normalizeAvaliacaoIdForFetch(avaliacao?._id) ||
      normalizeAvaliacaoIdForFetch(audioStatus?.avaliacaoId);
    
    if (!idParaUsar) {
      console.error('❌ avaliacaoId não encontrado:', { avaliacaoId, avaliacao, audioStatus });
      showSnackbar('ID da avaliação não encontrado', 'error');
      return;
    }

    console.log('🔄 Iniciando reenvio de áudio:', { idParaUsar, avaliacaoId, avaliacaoIdDoObjeto: avaliacao?._id });

    try {
      setReenviando(true);
      await reenviarAudioPubSub(idParaUsar);
      showSnackbar('Áudio reenviado para processamento com sucesso!', 'success');
      
      // Atualizar status do áudio após reenvio
      const baseUrl = getResolvedApiOrigin();
      const response = await fetch(`${baseUrl}/api/audio-analise/status-por-avaliacao/${idParaUsar}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAudioStatus(data.data);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao reenviar áudio:', error);
      showSnackbar(error.message || 'Erro ao reenviar áudio. Tente novamente.', 'error');
    } finally {
      setReenviando(false);
    }
  };

  // Validação de arquivo usando serviço
  const validateFile = (file) => {
    const validation = validarArquivoAudio(file);
    if (!validation.isValid) {
      showSnackbar(validation.errors.join(', '), 'error');
      return false;
    }
    return true;
  };

  // Status do áudio: GET + fallback nos mesmos campos da linha da tabela (ícone amarelo/verde).
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const fromList = rowAudioSentFlag
      ? {
          avaliacaoId: rowIdForAudioStatus || null,
          nomeArquivoAudio: rowNomeArquivoAudio,
          sent: true,
          treated: rowAudioTreated,
          audioCreatedAt: rowAudioCreatedAt,
          audioUpdatedAt: rowAudioUpdatedAt,
          audioManualReenvioDisponivelEm: rowAudioUnlock,
          audioAutoRepublishAttempts: rowAudioAttempts,
          audioLastAutoRepublishAt: rowAudioLastAuto
        }
      : null;

    if (fromList) {
      setAudioJaEnviado(true);
      setAudioStatus(fromList);
    } else {
      setAudioJaEnviado(false);
      setAudioStatus(null);
    }

    if (!rowIdForAudioStatus) {
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        const baseUrl = getResolvedApiOrigin();
        const response = await fetch(
          `${baseUrl}/api/audio-analise/status-por-avaliacao/${rowIdForAudioStatus}`
        );

        if (cancelled) return;

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setAudioStatus(data.data);
            setAudioJaEnviado(data.data.sent === true);
          } else if (fromList) {
            setAudioJaEnviado(true);
            setAudioStatus(fromList);
          } else {
            setAudioStatus(null);
            setAudioJaEnviado(false);
          }
        } else if (fromList) {
          setAudioJaEnviado(true);
          setAudioStatus(fromList);
        } else {
          setAudioStatus(null);
          setAudioJaEnviado(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('Erro ao buscar status de áudio:', error);
          if (fromList) {
            setAudioJaEnviado(true);
            setAudioStatus(fromList);
          } else {
            setAudioStatus(null);
            setAudioJaEnviado(false);
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    rowIdForAudioStatus,
    rowAudioSentFlag,
    rowAudioTreated,
    rowNomeArquivoAudio,
    rowAudioCreatedAt,
    rowAudioUpdatedAt,
    rowAudioUnlock,
    rowAudioAttempts,
    rowAudioLastAuto
  ]);

  // Limpar estados ao fechar modal
  useEffect(() => {
    if (!open) {
      // Desconectar monitoramento se estiver ativo
      if (stopMonitoringRef.current) {
        stopMonitoringRef.current();
        stopMonitoringRef.current = null;
      }
      
      // Reset estados
      setSelectedFile(null);
      setUploadProgress(0);
      setAudioId(null);
      setProcessingStatus(null);
      setStatusMessage('');
      setUploading(false);
      setAudioStatus(null);
      setAudioJaEnviado(false);
    }
  }, [open]);

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  // File input handler
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  // Upload handler com novo fluxo
  const handleUpload = async () => {
    if (!selectedFile) {
      showSnackbar('Selecione um arquivo.', 'error');
      return;
    }

    const idUpload =
      normalizeAvaliacaoIdForFetch(avaliacaoId) || normalizeAvaliacaoIdForFetch(avaliacao?._id);
    if (!idUpload) {
      showSnackbar('ID da avaliação inválido.', 'error');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setProcessingStatus('uploading');
      setStatusMessage('Preparando upload...');

      // 1. Fazer upload para GCS com progresso real
      const result = await uploadAudioParaAnalise(
        idUpload,
        selectedFile,
        (progress) => {
          setUploadProgress(Math.min(progress, 95)); // Máximo 95% durante upload
          setStatusMessage(`Enviando para GCS... ${Math.round(progress)}%`);
        }
      );
      
      // Upload concluído
      setUploadProgress(100);
      // Usar avaliacaoId em vez de audioId
      const avaliacaoIdParaMonitorar =
        normalizeAvaliacaoIdForFetch(result.avaliacaoId) || idUpload;
      setStatusMessage('Upload concluído! Iniciando processamento...');
      
      // Marcar áudio como enviado para ocultar botão e evitar reenvios acidentais
      setAudioJaEnviado(true);
      
      // Chamar callback do componente pai se fornecido
      if (onUpload && typeof onUpload === 'function') {
        onUpload(result);
      }

      // 2. Iniciar monitoramento do processamento
      setProcessingStatus('processing');
      setStatusMessage('Processando áudio com IA...');

      const stopMonitoring = monitorarProcessamento(
        avaliacaoIdParaMonitorar,
        // onStatusChange
        (statusData) => {
          const status = statusData.status || statusData.data?.status;
          
          if (status === 'processando') {
            setStatusMessage('Processando áudio com IA...');
          } else if (status === 'reconectando') {
            setStatusMessage(statusData.message || 'Reconectando...');
          }
        },
        // onComplete
        (statusData) => {
          setProcessingStatus('completed');
          setStatusMessage('Análise concluída com sucesso!');
          setUploadProgress(100);
          
          showSnackbar('Análise concluída! O resultado está disponível.', 'success');
          
          // Fechar modal após sucesso
          setTimeout(() => {
            handleClose();
          }, 2000);
        },
        // onError
        (error) => {
          setProcessingStatus('error');
          setStatusMessage(`Erro: ${error.message}`);
          
          showSnackbar(
            error.message || 'Erro no processamento. Tente novamente.',
            'error'
          );
        }
      );

      // Guardar função de desconexão
      stopMonitoringRef.current = stopMonitoring;

    } catch (error) {
      console.error('Erro no upload:', error);
      setProcessingStatus('error');
      setStatusMessage(`Erro: ${error.message}`);
      
      // Mensagens de erro mais amigáveis
      let errorMessage = error.message || 'Erro no upload do arquivo.';
      
      if (error.message.includes('expirada')) {
        errorMessage = 'URL de upload expirada. Tente novamente.';
      } else if (error.message.includes('conexão') || error.message.includes('network')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload demorou muito tempo. Tente novamente.';
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      // Não resetar uploading aqui se estiver processando
      if (processingStatus !== 'processing' && processingStatus !== 'completed') {
        setUploading(false);
      }
    }
  };

  // Fechar modal
  const handleClose = () => {
    if (!uploading || processingStatus === 'completed') {
      // Desconectar monitoramento
      if (stopMonitoringRef.current) {
        stopMonitoringRef.current();
        stopMonitoringRef.current = null;
      }
      
      setSelectedFile(null);
      setUploadProgress(0);
      setAudioId(null);
      setProcessingStatus(null);
      setStatusMessage('');
      setUploading(false);
      onClose();
    }
  };

  // Formatar tamanho do arquivo usando serviço
  const formatFileSize = (bytes) => {
    return formatarTamanhoArquivo(bytes);
  };

  // Obter cor do status
  const getStatusChipColor = () => {
    if (!processingStatus) return 'default';
    
    switch (processingStatus) {
      case 'uploading':
        return 'info';
      case 'processing':
        return 'warning';
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  // Obter ícone do status
  const getStatusIcon = () => {
    if (!processingStatus) return null;
    
    switch (processingStatus) {
      case 'uploading':
      case 'processing':
        return <CircularProgress size={20} sx={{ mr: 1 }} />;
      case 'completed':
        return <CheckCircleIcon sx={{ fontSize: 20, mr: 1, color: getStatusColor('concluido') }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 20, mr: 1, color: getStatusColor('error') }} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '6px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            maxHeight: 'none'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Poppins', 
          fontWeight: 600,
          color: 'var(--blue-dark)',
          borderBottom: '1px solid var(--blue-opaque)',
          pb: 2
        }}>
          Upload de Áudio para Análise GPT
        </DialogTitle>

        <DialogContent sx={{ pt: 3, overflow: 'visible' }}>
          {/* Informações da avaliação */}
          {avaliacaoNome && (
            <Box sx={{ mb: audioJaEnviado && !uploading ? 1.5 : 3, p: 2, bgcolor: 'var(--cor-fundo)', borderRadius: '4px' }}>
              <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                Avaliação: <strong>{avaliacaoNome}</strong>
              </Typography>
            </Box>
          )}

          {/* Mensagem quando áudio já foi enviado */}
          {audioJaEnviado && !uploading && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#E3F2FD', borderRadius: '4px', border: '1px solid #90CAF9' }}>
              <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#1976D2', mb: 1 }}>
                Um áudio já foi enviado para esta avaliação. Aguarde o processamento concluir antes de enviar um novo arquivo.
              </Typography>
            </Box>
          )}

          {/* Seção de informações após envio */}
          {audioStatus && audioStatus.sent && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'var(--cor-fundo)', borderRadius: '4px', border: '1px solid var(--blue-opaque)' }}>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: 'var(--blue-dark)', mb: 2 }}>
                Informações do Áudio Enviado
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Nome do agente */}
                {avaliacao?.colaboradorNome && (
                  <Box>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontWeight: 500, color: '#666666' }}>
                      Agente:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: 'var(--blue-dark)' }}>
                      {avaliacao.colaboradorNome}
                    </Typography>
                  </Box>
                )}
                
                {/* Nome do arquivo */}
                {(audioStatus.nomeArquivoAudio || audioStatus.nomeArquivo) && (
                  <Box>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontWeight: 500, color: '#666666' }}>
                      Arquivo:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: 'var(--blue-dark)' }}>
                      {audioStatus.nomeArquivoAudio || audioStatus.nomeArquivo}
                    </Typography>
                  </Box>
                )}
                
                {/* Data e hora da ligação */}
                {avaliacao?.dataLigacao && (
                  <Box>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontWeight: 500, color: '#666666' }}>
                      Data e Hora da Ligação:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: 'var(--blue-dark)' }}>
                      {(() => {
                        try {
                          const dataLigacao = new Date(avaliacao.dataLigacao);
                          const dia = String(dataLigacao.getDate()).padStart(2, '0');
                          const mes = String(dataLigacao.getMonth() + 1).padStart(2, '0');
                          const ano = dataLigacao.getFullYear();
                          const horas = String(dataLigacao.getHours()).padStart(2, '0');
                          const minutos = String(dataLigacao.getMinutes()).padStart(2, '0');
                          return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
                        } catch (e) {
                          return avaliacao.dataLigacao;
                        }
                      })()}
                    </Typography>
                  </Box>
                )}
                
                {/* Marcadores de status */}
                <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label="Enviado"
                    size="small"
                    sx={{
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                      backgroundColor: '#006AB9', // Azul opaco do LAYOUT_GUIDELINES.md
                      color: '#ffffff'
                    }}
                  />
                  <Chip
                    label="Processado"
                    size="small"
                    sx={{
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                      backgroundColor: pipelineDone(audioStatus.treated)
                        ? '#1634FF'
                        : audioStatus.treated === 'failed'
                          ? '#f44336'
                          : '#B0BEC5',
                      color: '#ffffff'
                    }}
                  />
                  {podeReenviar() && (
                    <Chip
                      icon={reenviando ? <CircularProgress size={14} sx={{ color: '#ffffff' }} /> : <RefreshIcon sx={{ fontSize: '14px !important', color: '#ffffff' }} />}
                      label="Reenviar"
                      size="small"
                      onClick={handleReenviarAudio}
                      disabled={reenviando}
                      sx={{
                        fontFamily: 'Poppins',
                        fontWeight: 500,
                        backgroundColor: '#f44336',
                        color: '#ffffff',
                        cursor: reenviando ? 'default' : 'pointer',
                        '&:hover': {
                          backgroundColor: reenviando ? '#f44336' : '#c62828'
                        },
                        '&:disabled': {
                          backgroundColor: '#B0BEC5',
                          opacity: 0.7
                        },
                        '& .MuiChip-icon': {
                          marginLeft: '8px',
                          marginRight: '-4px'
                        }
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          )}

          {/* Zona de drop */}
          {!uploading && !audioJaEnviado && (
            <Box
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              sx={{
                border: `2px dashed ${dragActive ? 'var(--blue-medium)' : 'var(--blue-opaque)'}`,
                borderRadius: '4px',
                padding: '32px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                bgcolor: dragActive ? 'rgba(22, 52, 255, 0.05)' : 'transparent',
                '&:hover': {
                  borderColor: 'var(--blue-medium)',
                  bgcolor: 'rgba(22, 52, 255, 0.05)'
                }
              }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <CloudUploadIcon 
                sx={{ 
                  fontSize: 48, 
                  color: dragActive ? 'var(--blue-medium)' : 'var(--blue-opaque)',
                  mb: 2
                }} 
              />
              
              <Typography variant="h6" sx={{ 
                fontFamily: 'Poppins', 
                fontWeight: 600,
                color: 'var(--blue-dark)',
                mb: 1
              }}>
                {dragActive ? 'Solte o arquivo aqui' : 'Arraste o arquivo de áudio ou clique para selecionar'}
              </Typography>
              
              <Typography variant="body2" sx={{ 
                fontFamily: 'Poppins',
                color: 'var(--gray)',
                mb: 2
              }}>
                Formatos aceitos: MP3, WAV, M4A, OGG • Tamanho máximo: 50MB
              </Typography>

              <input
                id="file-input"
                type="file"
                accept=".mp3,.wav,.m4a,.mp4,.webm,.ogg,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/webm,audio/ogg"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </Box>
          )}

          {/* Arquivo selecionado */}
          {selectedFile && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              border: '1px solid var(--blue-opaque)', 
              borderRadius: '4px',
              bgcolor: 'var(--cor-fundo)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AudioFileIcon sx={{ color: 'var(--blue-medium)' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ 
                    fontFamily: 'Poppins', 
                    fontWeight: 500,
                    color: 'var(--blue-dark)'
                  }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'Poppins',
                    color: 'var(--gray)'
                  }}>
                    {formatFileSize(selectedFile.size)}
                  </Typography>
                </Box>
                {!uploading && <CheckCircleIcon sx={{ color: 'var(--green)' }} />}
              </Box>
            </Box>
          )}

          {/* Progress bar e status */}
          {uploading && (
            <Box sx={{ mt: 3 }}>
              {/* Status chip */}
              {processingStatus && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getStatusIcon()}
                  <Chip
                    label={getStatusText(processingStatus) || statusMessage}
                    color={getStatusChipColor()}
                    size="small"
                    sx={{ fontFamily: 'Poppins', fontWeight: 500 }}
                  />
                </Box>
              )}

              {/* Mensagem de status */}
              {statusMessage && (
                <Typography variant="body2" sx={{ 
                  fontFamily: 'Poppins',
                  color: 'var(--gray)',
                  mb: 1,
                  fontStyle: processingStatus === 'error' ? 'italic' : 'normal'
                }}>
                  {statusMessage}
                </Typography>
              )}

              {/* Barra de progresso */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: 'Poppins' }}>
                  {processingStatus === 'processing' ? 'Processando...' : 'Enviando arquivo...'}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Poppins' }}>
                  {uploadProgress}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress}
                sx={{
                  height: 8,
                  borderRadius: '3.5px',
                  bgcolor: 'rgba(22, 52, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: processingStatus === 'error' 
                      ? getStatusColor('error')
                      : processingStatus === 'completed'
                      ? getStatusColor('concluido')
                      : 'var(--blue-medium)'
                  }
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleClose}
            disabled={uploading && processingStatus !== 'completed' && processingStatus !== 'error'}
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 500,
              color: 'var(--gray)'
            }}
          >
            Fechar
          </Button>
          
          {/* Ocultar botão quando upload estiver em andamento OU quando áudio já foi enviado */}
          {!uploading && !audioJaEnviado && (
            <Button
              onClick={handleUpload}
              disabled={!selectedFile}
              variant="contained"
              sx={{
                fontFamily: 'Poppins',
                fontWeight: 600,
                bgcolor: 'var(--blue-medium)',
                '&:hover': {
                  bgcolor: 'var(--blue-dark)'
                },
                '&:disabled': {
                  bgcolor: 'var(--gray)',
                  color: 'white'
                }
              }}
            >
              Enviar para Análise
            </Button>
          )}
          
          {/* Mostrar mensagem quando upload foi concluído */}
          {audioJaEnviado && uploading && (
            <Typography variant="body2" sx={{ 
              fontFamily: 'Poppins',
              color: 'var(--green)',
              fontWeight: 500,
              mr: 2
            }}>
              Áudio enviado com sucesso!
            </Typography>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            fontFamily: 'Poppins',
            '& .MuiAlert-message': {
              fontFamily: 'Poppins'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UploadAudioModal;
