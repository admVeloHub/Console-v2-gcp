/**
 * TranscricaoIaModal.jsx
 * Modal scrollável com transcrição em formato diálogo + export PDF.
 *
 * VERSION: v1.0.0
 * DATE: 2026-06-05
 * AUTHOR: VeloHub Development Team
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { exportTranscricaoIaPdf } from '../../services/qualidadeTranscricaoExport';
import { formatDataHoraLigacao } from '../../utils/qualidadeDataLigacao';

const TranscricaoIaModal = ({
  open,
  onClose,
  transcricao = [],
  colaboradorNome,
  dataLigacao,
  horaLigacao,
  nomeArquivoAudio,
  avaliacaoRef
}) => {
  const handleExportPdf = () => {
    try {
      const dataFmt = dataLigacao
        ? formatDataHoraLigacao(dataLigacao, horaLigacao, avaliacaoRef)
        : '';
      exportTranscricaoIaPdf(transcricao, {
        colaboradorNome,
        dataLigacao: dataFmt,
        nomeArquivoAudio
      });
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      alert('Erro ao exportar transcrição para PDF.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '6px' } }}
    >
      <DialogTitle
        sx={{
          fontFamily: 'Poppins',
          fontWeight: 600,
          color: 'var(--blue-dark)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pr: 1
        }}
      >
        Transcrição da Ligação
        <IconButton onClick={onClose} size="small" aria-label="Fechar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          maxHeight: '65vh',
          overflow: 'auto',
          px: 2,
          py: 1.5
        }}
      >
        {(!transcricao || transcricao.length === 0) ? (
          <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#666666' }}>
            Transcrição não disponível.
          </Typography>
        ) : (
          transcricao.map((turno, index) => (
            <Box key={index}>
              {index > 0 && (
                <Divider
                  sx={{
                    my: 1.25,
                    borderColor: 'rgba(0, 0, 88, 0.12)'
                  }}
                />
              )}
              <Typography
                component="div"
                variant="body2"
                sx={{ fontFamily: 'Poppins', lineHeight: 1.6, mb: 0.5 }}
              >
                <Box component="span" sx={{ fontWeight: 700, color: 'var(--blue-dark)' }}>
                  {turno.role}:
                </Box>{' '}
                <Box component="span" sx={{ fontStyle: 'italic', color: '#444444' }}>
                  {turno.fala}
                </Box>
              </Typography>
            </Box>
          ))
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5, gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PdfIcon />}
          disabled={!transcricao || transcricao.length === 0}
          onClick={handleExportPdf}
          sx={{
            fontFamily: 'Poppins',
            textTransform: 'none',
            borderColor: 'var(--blue-medium)',
            color: 'var(--blue-medium)'
          }}
        >
          Exportar PDF
        </Button>
        <Button
          onClick={onClose}
          sx={{ fontFamily: 'Poppins', textTransform: 'none', color: '#666666' }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TranscricaoIaModal;
