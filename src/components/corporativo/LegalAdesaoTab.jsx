// VERSION: v1.0.1 | DATE: 2026-06-01 | AUTHOR: VeloHub Development Team
import React, { useCallback, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { corporativoLegalAPI } from '../../services/corporativoAPI';
import { qualidadeFuncionariosAPI } from '../../services/api';
import AcknowledgmentEmployeeChips from './AcknowledgmentEmployeeChips';

const normalizeData = (response) => {
  if (Array.isArray(response)) return response;
  if (response?.success && response?.data) return response.data;
  if (response?.data) return response.data;
  return [];
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const LegalAdesaoTab = () => {
  const [documentos, setDocumentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFuncionarios, setLoadingFuncionarios] = useState(true);
  const [error, setError] = useState(null);
  const [expandedKey, setExpandedKey] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [cienciaRes, funcRes] = await Promise.all([
        corporativoLegalAPI.getCienciaPorDocumento(),
        qualidadeFuncionariosAPI.getAtivos(),
      ]);
      const docs = normalizeData(cienciaRes);
      const sorted = [...docs].sort(
        (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
      setDocumentos(sorted);
      setFuncionarios(normalizeData(funcRes));
    } catch (err) {
      setError(err.message || 'Erro ao carregar lista de adesão');
      setDocumentos([]);
    } finally {
      setLoading(false);
      setLoadingFuncionarios(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress sx={{ color: 'var(--blue-medium)' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
        {error}
      </Alert>
    );
  }

  if (documentos.length === 0) {
    return (
      <Alert severity="info" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
        Nenhum documento com registro de adesão encontrado.
      </Alert>
    );
  }

  return (
    <Box>
      {documentos.map((doc) => {
        const key = `${doc.documentId}-${doc.versaoId || doc.versao}`;
        const isExpanded = expandedKey === key;

        return (
          <Accordion
            key={key}
            expanded={isExpanded}
            onChange={(_e, expanded) => setExpandedKey(expanded ? key : null)}
            sx={{
              mb: 1,
              backgroundColor: 'var(--cor-container)',
              boxShadow: 'none',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore sx={{ color: 'var(--blue-medium)' }} />}
              sx={{ fontFamily: 'Poppins' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  pr: 1,
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontFamily: 'Poppins',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      color: 'var(--blue-dark)',
                    }}
                  >
                    {doc.titulo} — v{doc.versao}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '0.65rem',
                      color: 'var(--gray)',
                      mt: 0.4,
                    }}
                  >
                    Criado: {formatDate(doc.createdAt)} · Atualizado: {formatDate(doc.updatedAt)}
                  </Typography>
                </Box>
                <Chip
                  label={`${doc.totalAgentes ?? doc.agentes?.length ?? 0}/${funcionarios.length} confirmado(s)`}
                  size="small"
                  sx={{
                    backgroundColor: 'var(--blue-medium)',
                    color: 'white',
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: '0.55rem',
                    height: '20px',
                    '& .MuiChip-label': { px: 0.8 },
                  }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: 'var(--cor-container)' }}>
              <AcknowledgmentEmployeeChips
                funcionarios={funcionarios}
                agentes={doc.agentes || []}
                loading={loadingFuncionarios}
              />
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default LegalAdesaoTab;
