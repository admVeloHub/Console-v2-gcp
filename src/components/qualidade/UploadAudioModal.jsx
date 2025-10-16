/**
 * UploadAudioModal.jsx
 * Modal para upload de arquivos de áudio para análise GPT
 * 
 * VERSION: v1.0.0
 * DATE: 2024-12-19
 * AUTHOR: VeloHub Development Team
 */

import React, { useState, useCallback } from 'react';
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
  Chip
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  AudioFile as AudioFileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

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
  
  // Estados de feedback
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Validações
  const ACCEPTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Validação de arquivo
  const validateFile = (file) => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      showSnackbar('Formato não suportado. Use MP3 ou WAV.', 'error');
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      showSnackbar('Arquivo muito grande. Máximo 50MB.', 'error');
      return false;
    }
    
    return true;
  };

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

  // Upload handler
  const handleUpload = async () => {
    if (!selectedFile || !avaliacaoId) {
      showSnackbar('Selecione um arquivo e uma avaliação.', 'error');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simular progresso (será substituído por progresso real quando backend estiver pronto)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Chamar função de upload (será implementada no serviço)
      const result = await onUpload(avaliacaoId, selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      showSnackbar('Upload concluído! Processamento iniciado.', 'success');
      
      // Fechar modal após sucesso
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      console.error('Erro no upload:', error);
      showSnackbar(error.message || 'Erro no upload do arquivo.', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Fechar modal
  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setUploadProgress(0);
      onClose();
    }
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
              Formatos aceitos: MP3, WAV • Tamanho máximo: 50MB
            </Typography>

            <input
              id="file-input"
              type="file"
              accept=".mp3,.wav,audio/mpeg,audio/wav"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </Box>

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
                <CheckCircleIcon sx={{ color: 'var(--green)' }} />
              </Box>
            </Box>
          )}

          {/* Progress bar */}
          {uploading && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: 'Poppins' }}>
                  Enviando arquivo...
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
                    bgcolor: 'var(--blue-medium)'
                  }
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleClose}
            disabled={uploading}
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 500,
              color: 'var(--gray)'
            }}
          >
            Cancelar
          </Button>
          
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
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
            {uploading ? 'Enviando...' : 'Enviar para Análise'}
          </Button>
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
