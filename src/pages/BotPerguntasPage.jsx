// VERSION: v3.8.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Grid,
  Alert,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import { Save, Add, SmartToy } from '@mui/icons-material';
import { botPerguntasAPI } from '../services/api';
import BackButton from '../components/common/BackButton';

const BotPerguntasPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    keywords: '',        // Palavras-chave (movido para posição do tópico)
    sinonimos: '',       // Sinônimos (nova posição)
    context: '',         // Contexto renomeado para Resposta
    question: '',        // Pergunta (permanece)
    tabulacao: ''        // Tabulação (substitui URLs de imagens)
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Validar campos obrigatórios
      if (!formData.question || !formData.context || !formData.keywords) {
        setSnackbar({
          open: true,
          message: 'Pergunta, Resposta e Palavras-chave são obrigatórios',
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      // Mapear dados para o schema do MongoDB conforme diretrizes
      const mappedData = {
        pergunta: formData.question,        // Pergunta → pergunta (minúscula)
        resposta: formData.context,         // Resposta → resposta (minúscula)
        palavrasChave: formData.keywords,   // "Palavras-chave" → palavrasChave (camelCase)
        sinonimos: formData.sinonimos,      // Sinonimos → sinonimos (minúscula)
        tabulacao: formData.tabulacao       // Tabulação → tabulacao (minúscula)
      };

      console.log('🔍 Debug - Dados mapeados para envio:', mappedData);
      console.log('🔍 Debug - Campos obrigatórios verificados:');
      console.log('  - Pergunta:', !!formData.question, formData.question);
      console.log('  - Resposta:', !!formData.context, formData.context);
      console.log('  - Palavras-chave:', !!formData.keywords, formData.keywords);

      // Enviar dados para API
      const response = await botPerguntasAPI.create(mappedData);
      
      // Reset form
      setFormData({
        keywords: '',
        sinonimos: '',
        context: '',
        question: '',
        tabulacao: ''
      });

      // Mostrar sucesso
      setSnackbar({
        open: true,
        message: response.message || 'Pergunta do bot configurada com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      // Mostrar erro
      setSnackbar({
        open: true,
        message: error.message || 'Erro ao configurar pergunta. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8, pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', mb: 4 }}>
        <Box sx={{ position: 'absolute', left: 0 }}>
          <BackButton />
        </Box>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontFamily: 'Poppins',
            fontWeight: 700,
            color: 'var(--blue-dark)'
          }}
        >
          Bot Perguntas
        </Typography>
      </Box>

      {/* Tabs do Material-UI */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        mb: 3
      }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          aria-label="bot perguntas tabs"
          sx={{
            '& .MuiTab-root': {
              fontSize: '1.25rem',
              fontWeight: 600,
              textTransform: 'none',
              minHeight: 48,
              '&.Mui-selected': {
                color: 'var(--blue-medium)',
              }
            }
          }}
        >
          <Tab label="Adicionar Pergunta" />
          <Tab label="Gerenciar Perguntas" />
        </Tabs>
      </Box>

      {/* Tab 0: Adicionar Pergunta */}
      {activeTab === 0 && (
        <Card sx={{ backgroundColor: 'var(--cor-container)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SmartToy sx={{ mr: 1, color: 'var(--blue-medium)' }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Poppins',
                fontWeight: 600,
                color: 'var(--blue-dark)'
              }}
            >
              Nova Configuração de Bot
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Palavras-chave"
                  value={formData.keywords}
                  onChange={handleInputChange('keywords')}
                  required
                  placeholder="ex: ajuda, suporte, problema"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sinônimos"
                  value={formData.sinonimos}
                  onChange={handleInputChange('sinonimos')}
                  placeholder="ex: auxílio, ajuda, suporte"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Resposta"
                  value={formData.context}
                  onChange={handleInputChange('context')}
                  multiline
                  rows={3}
                  required
                  placeholder="Digite a resposta que o bot deve fornecer..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pergunta"
                  value={formData.question}
                  onChange={handleInputChange('question')}
                  multiline
                  rows={2}
                  required
                  placeholder="Digite a pergunta que o bot deve responder..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tabulação"
                  value={formData.tabulacao}
                  onChange={handleInputChange('tabulacao')}
                  placeholder="Digite a tabulação para esta pergunta..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Poppins'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                    sx={{
                      backgroundColor: 'var(--green)',
                      fontFamily: 'Poppins',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'var(--green)',
                        opacity: 0.9
                      }
                    }}
                  >
                    {loading ? 'Salvando...' : 'Salvar Configuração'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      )}

      {/* Tab 1: Gerenciar Perguntas */}
      {activeTab === 1 && (
        <Card sx={{ backgroundColor: 'var(--cor-container)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, color: 'var(--blue-dark)', fontFamily: 'Poppins' }}>
              Gerenciar Perguntas
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--gray)', fontFamily: 'Poppins' }}>
              Funcionalidade de listagem e edição de perguntas será implementada aqui.
            </Typography>
          </CardContent>
        </Card>
      )}

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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BotPerguntasPage;
