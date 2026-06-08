/**
 * AnaliseGPTAccordion.jsx
 * Componente de acordeão para lista de análises IA (schema LISTA dual).
 *
 * VERSION: v2.1.0
 * DATE: 2026-06-05
 * AUTHOR: VeloHub Development Team
 * CHANGELOG: v2.1.0 - Quadros completos sempre visíveis: cards diálogo, Análise, critérios LISTA+ext, pontuação, palavras críticas, transcrição
 * CHANGELOG: v2.0.0 - Novo formato IA: analiseDialogo, criteriosDetalhados, pontuacaoCalculada, observacaoGPT, modal transcrição
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Collapse,
  Grid,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  HighlightOff as CancelXIcon,
  RecordVoiceOver as RecordVoiceOverIcon
} from '@mui/icons-material';
import {
  normalizeAudioAnaliseResult,
  ANALISE_DIALOGO_CARDS,
  CRITERIO_IA_LABELS,
  getCriteriosIaParaExibir,
  isCriterioIaDetrator
} from '../../utils/qualidadeAudioAnaliseNormalize';
import TranscricaoIaModal from './TranscricaoIaModal';

const IA_FONT_TITLE = { fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.8rem', color: '#000058' };
const IA_FONT_SECTION = { fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem', color: '#000058' };
const IA_FONT_BODY = { fontFamily: 'Poppins', fontSize: '0.75rem', color: '#666666' };
const IA_FONT_BODY_STRONG = { fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.75rem', color: '#000058' };
const IA_FONT_CHIP = { fontFamily: 'Poppins', fontSize: '0.7rem' };
const IA_FONT_BTN = { fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.75rem' };

const QUADRO_SX = {
  border: '1.5px solid var(--blue-dark)',
  borderRadius: '4px',
  p: 1.5,
  mb: 1.5,
  backgroundColor: 'var(--cor-container)'
};

const CARD_SX = {
  border: '1px solid rgba(0, 0, 88, 0.25)',
  borderRadius: '4px',
  p: 1.25,
  height: '100%',
  backgroundColor: 'transparent'
};

const QuadroSecao = ({ titulo, children }) => (
  <Box sx={QUADRO_SX}>
    <Typography variant="caption" sx={{ ...IA_FONT_SECTION, display: 'block', mb: 1 }}>
      {titulo}
    </Typography>
    {children}
  </Box>
);

const AnaliseGPTAccordion = ({ analises, loading = false }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [transcricaoModal, setTranscricaoModal] = useState({ open: false, analise: null });

  const toggleExpanded = (analiseId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [analiseId]: !prev[analiseId]
    }));
  };

  const getScoreColor = (pontuacao) => {
    if (pontuacao >= 80) return '#15A237';
    if (pontuacao >= 60) return '#FCC200';
    return '#f44336';
  };

  const getScoreLabel = (pontuacao) => {
    if (pontuacao >= 80) return 'Excelente';
    if (pontuacao >= 60) return 'Bom';
    return 'Precisa Melhorar';
  };

  const getCriterioIcon = (criterio, valor) => {
    const isDetrator = isCriterioIaDetrator(criterio);
    if (valor === undefined || valor === null) {
      return { Icon: CancelXIcon, color: '#B0BEC5' };
    }
    if (isDetrator) {
      if (valor) return { Icon: CheckCircleIcon, color: '#f44336' };
      return { Icon: CancelXIcon, color: '#15A237' };
    }
    if (valor) return { Icon: CheckCircleIcon, color: '#15A237' };
    return { Icon: CancelXIcon, color: '#FCC200' };
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" sx={IA_FONT_BODY}>
          Carregando análises IA...
        </Typography>
      </Box>
    );
  }

  if (!analises || analises.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" sx={IA_FONT_BODY}>
          Nenhuma análise IA encontrada.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" sx={{ ...IA_FONT_TITLE, mb: 1.5 }}>
        {analises.length} análise(s) encontrada(s)
      </Typography>

      {analises.map((raw) => {
        const analise = normalizeAudioAnaliseResult(raw);
        const dialogo = analise.analiseDialogo;
        const consideracoes = dialogo?.consideracoes;
        const criterios = analise.criteriosDetalhados || {};
        const criteriosLista = getCriteriosIaParaExibir(criterios);
        const pontuacao = analise.pontuacaoCalculada;
        const palavrasCriticas = analise.palavrasCriticas || [];
        const temTranscricao = Array.isArray(analise.transcricao) && analise.transcricao.length > 0;

        return (
          <Box
            key={analise._id}
            sx={{
              background: 'transparent',
              border: '1.5px solid var(--blue-dark)',
              borderRadius: '4px',
              padding: '12px',
              margin: '6px 0',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'var(--blue-medium)',
                boxShadow: '0 4px 12px rgba(22, 52, 255, 0.1)'
              }
            }}
            onClick={() => toggleExpanded(analise._id)}
          >
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                <Avatar sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#1694FF',
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}>
                  {analise.colaboradorNome?.charAt(0) || '?'}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={IA_FONT_TITLE} noWrap>
                    {analise.colaboradorNome || 'Nome não disponível'}
                  </Typography>
                  <Typography variant="caption" sx={{ ...IA_FONT_BODY, display: 'block', lineHeight: 1.3 }}>
                    {analise.mes && analise.ano ? `${analise.mes}/${analise.ano}` : ''}
                    {analise.createdAt ? ` • ${new Date(analise.createdAt).toLocaleDateString('pt-BR')}` : ''}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {pontuacao !== null && pontuacao !== undefined ? (
                  <>
                    <Chip
                      label={`${pontuacao} pts`}
                      size="small"
                      sx={{
                        ...IA_FONT_CHIP,
                        backgroundColor: getScoreColor(pontuacao),
                        color: '#ffffff',
                        height: 22
                      }}
                    />
                    <Chip
                      label={getScoreLabel(pontuacao)}
                      size="small"
                      sx={{
                        ...IA_FONT_CHIP,
                        backgroundColor: getScoreColor(pontuacao),
                        color: '#ffffff',
                        opacity: 0.8,
                        height: 22
                      }}
                    />
                  </>
                ) : (
                  <Chip
                    label="Pontuação não disponível"
                    size="small"
                    sx={{
                      ...IA_FONT_CHIP,
                      backgroundColor: '#B0BEC5',
                      color: '#ffffff',
                      height: 22
                    }}
                  />
                )}

                {palavrasCriticas.length > 0 && (
                  <Chip
                    label="Palavras Críticas"
                    size="small"
                    sx={{
                      ...IA_FONT_CHIP,
                      backgroundColor: '#f44336',
                      color: '#ffffff',
                      height: 22
                    }}
                  />
                )}

                {expandedItems[analise._id] ? (
                  <ExpandLessIcon sx={{ color: '#000058', fontSize: '1.1rem' }} />
                ) : (
                  <ExpandMoreIcon sx={{ color: '#000058', fontSize: '1.1rem' }} />
                )}
              </Box>
            </Box>

            <Collapse in={expandedItems[analise._id]} timeout="auto" unmountOnExit>
              <Box
                sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid var(--blue-opaque)' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 1 — Cards temperatura / tensão / comportamento vocal */}
                <Grid container spacing={1} sx={{ mb: 1.5 }}>
                  {ANALISE_DIALOGO_CARDS.map(({ key, label }) => {
                    const cat = dialogo?.[key];
                    return (
                      <Grid item xs={12} sm={4} key={key}>
                        <Box sx={CARD_SX}>
                          <Typography variant="caption" sx={{ ...IA_FONT_SECTION, display: 'block', mb: 0.75 }}>
                            {label}
                          </Typography>
                          {cat ? (
                            <>
                              {cat.nota != null && (
                                <Typography variant="caption" sx={{ ...IA_FONT_BODY_STRONG, display: 'block', mb: 0.5 }}>
                                  Nota: {cat.nota}
                                </Typography>
                              )}
                              {cat.classificacao && (
                                <Chip
                                  label={cat.classificacao}
                                  size="small"
                                  sx={{
                                    ...IA_FONT_CHIP,
                                    mb: 0.75,
                                    backgroundColor: 'var(--blue-opaque)',
                                    color: 'var(--blue-dark)',
                                    height: 20
                                  }}
                                />
                              )}
                              <Typography variant="caption" sx={{ ...IA_FONT_BODY, display: 'block', lineHeight: 1.5 }}>
                                {cat.avaliacao || '—'}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="caption" sx={IA_FONT_BODY}>
                              Não disponível
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* 2 — Quadro Análise (considerações) */}
                <QuadroSecao titulo="Análise">
                  {consideracoes ? (
                    <>
                      {consideracoes.classificacao && (
                        <Typography variant="caption" sx={{ ...IA_FONT_BODY_STRONG, display: 'block', mb: 0.75 }}>
                          {consideracoes.classificacao}
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ ...IA_FONT_BODY, display: 'block', lineHeight: 1.6 }}>
                        {consideracoes.avaliacao || 'Sem considerações registradas.'}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="caption" sx={IA_FONT_BODY}>
                      Considerações do diálogo não disponíveis nesta análise.
                    </Typography>
                  )}
                </QuadroSecao>

                {/* 3 — Critérios detalhados (LISTA + extensões) */}
                <QuadroSecao titulo="Critérios Detalhados">
                  <Grid container spacing={0.75}>
                    {criteriosLista.map((criterio) => {
                      const valor = Object.prototype.hasOwnProperty.call(criterios, criterio)
                        ? criterios[criterio]
                        : undefined;
                      const { Icon, color } = getCriterioIcon(criterio, valor);
                      return (
                        <Grid item xs={12} sm={6} md={4} key={criterio}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Icon sx={{ color, fontSize: '1.1rem', flexShrink: 0 }} />
                            <Typography variant="caption" sx={IA_FONT_BODY}>
                              {CRITERIO_IA_LABELS[criterio] || criterio}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </QuadroSecao>

                {/* 4 — Pontuação e Análise (pontuacaoCalculada + observacaoGPT) */}
                <QuadroSecao titulo="Pontuação e Análise">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Typography variant="caption" sx={IA_FONT_BODY_STRONG}>
                      Pontuação calculada:
                    </Typography>
                    {pontuacao !== null && pontuacao !== undefined ? (
                      <Chip
                        label={`${pontuacao} pts — ${getScoreLabel(pontuacao)}`}
                        size="small"
                        sx={{
                          ...IA_FONT_CHIP,
                          backgroundColor: getScoreColor(pontuacao),
                          color: '#ffffff',
                          height: 22
                        }}
                      />
                    ) : (
                      <Typography variant="caption" sx={IA_FONT_BODY}>Não disponível</Typography>
                    )}
                  </Box>
                  <Divider sx={{ my: 1, borderColor: 'rgba(0, 0, 88, 0.12)' }} />
                  <Typography variant="caption" sx={{ ...IA_FONT_BODY_STRONG, display: 'block', mb: 0.5 }}>
                    Observação GPT
                  </Typography>
                  <Typography variant="caption" sx={{ ...IA_FONT_BODY, display: 'block', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {analise.observacaoGPT || 'Observação técnica não disponível.'}
                  </Typography>
                </QuadroSecao>

                {/* 5 — Palavras críticas */}
                <QuadroSecao titulo="Palavras Críticas">
                  {palavrasCriticas.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {palavrasCriticas.map((palavra, index) => (
                        <Chip
                          key={index}
                          label={palavra}
                          size="small"
                          sx={{
                            ...IA_FONT_CHIP,
                            backgroundColor: '#f44336',
                            color: '#ffffff',
                            height: 20
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={IA_FONT_BODY}>
                      Nenhuma palavra crítica detectada.
                    </Typography>
                  )}
                </QuadroSecao>

                {/* 6 — Transcrição */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 0.5 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RecordVoiceOverIcon />}
                    disabled={!temTranscricao}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTranscricaoModal({ open: true, analise });
                    }}
                    sx={{
                      ...IA_FONT_BTN,
                      py: 0.25,
                      px: 1.25,
                      borderColor: 'var(--blue-medium)',
                      color: 'var(--blue-medium)',
                      '&:hover': {
                        borderColor: 'var(--blue-dark)',
                        backgroundColor: 'rgba(22, 52, 255, 0.1)'
                      },
                      '&.Mui-disabled': {
                        borderColor: '#e0e0e0',
                        color: '#B0BEC5'
                      }
                    }}
                  >
                    Transcrição
                  </Button>
                </Box>
              </Box>
            </Collapse>
          </Box>
        );
      })}

      <TranscricaoIaModal
        open={transcricaoModal.open}
        onClose={() => setTranscricaoModal({ open: false, analise: null })}
        transcricao={transcricaoModal.analise?.transcricao || []}
        colaboradorNome={transcricaoModal.analise?.colaboradorNome}
        dataLigacao={transcricaoModal.analise?.dataLigacao}
        horaLigacao={transcricaoModal.analise?.horaLigacao}
        nomeArquivoAudio={transcricaoModal.analise?.nomeArquivoAudio}
        avaliacaoRef={transcricaoModal.analise?.avaliacaoMonitorId || transcricaoModal.analise}
      />
    </Box>
  );
};

export default AnaliseGPTAccordion;
