/**
 * AnaliseGPTAccordion.jsx
 * Componente de acordeão para lista de análises GPT
 * 
 * VERSION: v1.0.0
 * DATE: 2024-12-19
 * AUTHOR: VeloHub Development Team
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const AnaliseGPTAccordion = ({ 
  analises, 
  onVerDetalhes,
  loading = false 
}) => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (analiseId) => {
    setExpandedItems(prev => ({
      ...prev,
      [analiseId]: !prev[analiseId]
    }));
  };

  const getScoreColor = (pontuacao) => {
    if (pontuacao >= 80) return '#15A237'; // Verde
    if (pontuacao >= 60) return '#FCC200'; // Amarelo
    return '#f44336'; // Vermelho
  };

  const getScoreLabel = (pontuacao) => {
    if (pontuacao >= 80) return 'Excelente';
    if (pontuacao >= 60) return 'Bom';
    return 'Precisa Melhorar';
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" sx={{ 
          fontFamily: 'Poppins', 
          color: '#666666' 
        }}>
          Carregando análises GPT...
        </Typography>
      </Box>
    );
  }

  if (!analises || analises.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" sx={{ 
          fontFamily: 'Poppins', 
          color: '#666666' 
        }}>
          Nenhuma análise GPT encontrada.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ 
        fontFamily: 'Poppins', 
        fontWeight: 600, 
        color: '#000058',
        mb: 2
      }}>
        {analises.length} análise(s) encontrada(s)
      </Typography>
      
      {analises.map((analise) => (
        <Box
          key={analise._id}
          sx={{
            background: 'transparent',
            border: '1.5px solid var(--blue-dark)',
            borderRadius: '8px',
            padding: '16px',
            margin: '8px 0',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'var(--blue-medium)',
              boxShadow: '0 4px 12px rgba(22, 52, 255, 0.1)'
            }
          }}
          onClick={() => toggleExpanded(analise._id)}
        >
          {/* Header do acordeão */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                width: 40, 
                height: 40, 
                backgroundColor: '#1694FF',
                fontFamily: 'Poppins',
                fontWeight: 600
              }}>
                {analise.colaboradorNome?.charAt(0) || '?'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ 
                  fontFamily: 'Poppins', 
                  fontWeight: 600,
                  color: '#000058'
                }}>
                  {analise.colaboradorNome || 'Nome não disponível'}
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'Poppins',
                  color: '#666666'
                }}>
                  {analise.mes && analise.ano ? `${analise.mes}/${analise.ano}` : ''} 
                  {analise.createdAt ? ` • ${new Date(analise.createdAt).toLocaleDateString('pt-BR')}` : ''}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {analise.pontuacaoGPT !== null && analise.pontuacaoGPT !== undefined ? (
                <>
                  <Chip
                    label={`${analise.pontuacaoGPT} pts`}
                    sx={{
                      backgroundColor: getScoreColor(analise.pontuacaoGPT),
                      color: '#ffffff',
                      fontFamily: 'Poppins',
                      fontWeight: 500
                    }}
                  />
                  
                  <Chip
                    label={getScoreLabel(analise.pontuacaoGPT)}
                    size="small"
                    sx={{
                      backgroundColor: getScoreColor(analise.pontuacaoGPT),
                      color: '#ffffff',
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                      opacity: 0.8
                    }}
                  />
                </>
              ) : (
                <Chip
                  label="Pontuação não disponível"
                  size="small"
                  sx={{
                    backgroundColor: '#B0BEC5',
                    color: '#ffffff',
                    fontFamily: 'Poppins',
                    fontWeight: 500
                  }}
                />
              )}
              
              {analise.palavrasCriticas && analise.palavrasCriticas.length > 0 && (
                <Chip
                  label="⚠️ Palavras Críticas"
                  size="small"
                  sx={{
                    backgroundColor: '#f44336',
                    color: '#ffffff',
                    fontFamily: 'Poppins',
                    fontWeight: 500
                  }}
                />
              )}
              
              {expandedItems[analise._id] ? (
                <ExpandLessIcon sx={{ color: '#000058' }} />
              ) : (
                <ExpandMoreIcon sx={{ color: '#000058' }} />
              )}
            </Box>
          </Box>

          {/* Conteúdo expandido */}
          <Collapse in={expandedItems[analise._id]} timeout="auto" unmountOnExit>
            <Box sx={{ 
              mt: 2, 
              pt: 2, 
              borderTop: '1px solid var(--blue-opaque)'
            }}>
              {/* Resumo da análise */}
              <Typography variant="body2" sx={{ 
                fontFamily: 'Poppins',
                color: '#666666',
                mb: 2,
                lineHeight: 1.6
              }}>
                {analise.analiseGPT && typeof analise.analiseGPT === 'string' && analise.analiseGPT.trim() ? 
                  (analise.analiseGPT.length > 200 ? 
                    `${analise.analiseGPT.substring(0, 200)}...` : 
                    analise.analiseGPT
                  ) : 
                  'Análise não disponível'
                }
              </Typography>
              
            {/* Palavras críticas */}
              {analise.palavrasCriticas && Array.isArray(analise.palavrasCriticas) && analise.palavrasCriticas.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'Poppins', 
                    fontWeight: 500,
                    color: '#f44336',
                    mb: 1
                  }}>
                    Palavras Críticas Detectadas:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {analise.palavrasCriticas.map((palavra, index) => (
                      <Chip
                        key={index}
                        label={palavra}
                        size="small"
                        sx={{
                          backgroundColor: '#f44336',
                          color: '#ffffff',
                          fontFamily: 'Poppins'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Informações adicionais */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: 2,
                flexWrap: 'wrap'
              }}>
                {analise.confianca !== null && analise.confianca !== undefined && (
                  <Chip
                    label={`Confiança: ${analise.confianca}%`}
                    size="small"
                    sx={{
                      backgroundColor: '#1694FF',
                      color: '#ffffff',
                      fontFamily: 'Poppins'
                    }}
                  />
                )}
                
                {analise.status && (
                  <Chip
                    label={`Status: ${analise.status}`}
                    size="small"
                    sx={{
                      backgroundColor: analise.status === 'completed' ? '#15A237' : '#FCC200',
                      color: '#ffffff',
                      fontFamily: 'Poppins'
                    }}
                  />
                )}
              </Box>
              
              {/* Botões de ação */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVerDetalhes(analise);
                  }}
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    borderColor: 'var(--blue-medium)',
                    color: 'var(--blue-medium)',
                    '&:hover': {
                      borderColor: 'var(--blue-dark)',
                      backgroundColor: 'rgba(22, 52, 255, 0.1)'
                    }
                  }}
                >
                  Ver Detalhes Completos
                </Button>
                
                {analise.transcricao && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implementar visualização da transcrição
                      console.log('Ver transcrição:', analise._id);
                    }}
                    sx={{
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                      color: 'var(--blue-medium)',
                      '&:hover': {
                        backgroundColor: 'rgba(22, 52, 255, 0.1)'
                      }
                    }}
                  >
                    Ver Transcrição
                  </Button>
                )}
              </Box>
            </Box>
          </Collapse>
        </Box>
      ))}
    </Box>
  );
};

export default AnaliseGPTAccordion;
