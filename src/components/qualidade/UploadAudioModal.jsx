/**
 * UploadAudioModal.jsx
 * Modal para upload de arquivos de áudio para análise GPT
 * 
 * VERSION: v2.0.0
 * DATE: 2025-01-30
 * AUTHOR: VeloHub Development Team
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
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import {
  uploadAudioParaAnalise,
  monitorarProcessamento,
  validarArquivoAudio,
  formatarTamanhoArquivo,
  getStatusText,
  getStatusColor
} from '../../services/qualidadeAudioService';

const UploadAudioModal = ({ 
  open, 
  onClose, 
  onUpload, 
  avaliacaoId,
  avaliacaoNome 
}) => {
  // Estados do modal
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioId, setAudioId] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null); // 'uploading', 'processing', 'completed', 'error'
  const [statusMessage, setStatusMessage] = useState('');
  
  // Ref para função de desconexão do monitoramento
  const stopMonitoringRef = useRef(null);
  
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

  // Validação de arquivo usando serviço
  const validateFile = (file) => {
    const validation = validarArquivoAudio(file);
    if (!validation.isValid) {
      showSnackbar(validation.errors.join(', '), 'error');
      return false;
    }
    return true;
  };

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

    try {
      setUploading(true);
      setUploadProgress(0);
      setProcessingStatus('uploading');
      setStatusMessage('Preparando upload...');

      // 1. Fazer upload para GCS com progresso real
      const result = await uploadAudioParaAnalise(
        avaliacaoId, 
        selectedFile,
        (progress) => {
          setUploadProgress(Math.min(progress, 95)); // Máximo 95% durante upload
          setStatusMessage(`Enviando para GCS... ${Math.round(progress)}%`);
        }
      );
      
      // Upload concluído
      setUploadProgress(100);
      setAudioId(result.audioId);
      setStatusMessage('Upload concluído! Iniciando processamento...');
      
      // Chamar callback do componente pai se fornecido
      if (onUpload && typeof onUpload === 'function') {
        onUpload(result);
      }

      // 2. Iniciar monitoramento do processamento
      setProcessingStatus('processing');
      setStatusMessage('Processando áudio com IA...');

      const stopMonitoring = monitorarProcessamento(
        result.audioId,
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
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
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
          📤 Upload de Áudio para Análise GPT
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {/* Informações da avaliação */}
          {avaliacaoNome && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'var(--cor-fundo)', borderRadius: '8px' }}>
              <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                Avaliação: <strong>{avaliacaoNome}</strong>
              </Typography>
            </Box>
          )}

          {/* Zona de drop */}
          {!uploading && (
            <Box
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              sx={{
                border: `2px dashed ${dragActive ? 'var(--blue-medium)' : 'var(--blue-opaque)'}`,
                borderRadius: '8px',
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
              borderRadius: '8px',
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
                  borderRadius: 4,
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
            {processingStatus === 'completed' ? 'Fechar' : 'Cancelar'}
          </Button>
          
          {!uploading && (
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
