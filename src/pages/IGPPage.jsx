// VERSION: v3.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CircularProgress, Alert, Snackbar } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { igpAPI } from '../services/api';

const IGPPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const response = await igpAPI.getMetrics();
        setMetrics(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        // Fallback para dados simulados em caso de erro
        setMetrics({
          counts: {
            artigos: 45,
            velonews: 12,
            botPerguntas: 28
          },
          performance: {
            responseTime: 120,
            uptime: 99.9,
            errorRate: 0.1
          },
          systemHealth: 'healthy',
          lastUpdated: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  const chartData = [
    { name: 'Jan', artigos: 12, velonews: 3, bot: 8 },
    { name: 'Fev', artigos: 15, velonews: 2, bot: 6 },
    { name: 'Mar', artigos: 18, velonews: 4, bot: 10 },
    { name: 'Abr', artigos: 22, velonews: 3, bot: 12 },
    { name: 'Mai', artigos: 25, velonews: 5, bot: 15 },
    { name: 'Jun', artigos: 28, velonews: 4, bot: 18 },
  ];

  const pieData = [
    { name: 'Artigos', value: metrics?.counts?.artigos || 45, color: '#1634FF' },
    { name: 'Velonews', value: metrics?.counts?.velonews || 12, color: '#006AB9' },
    { name: 'Bot Perguntas', value: metrics?.counts?.botPerguntas || 28, color: '#15A237' },
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, fontFamily: 'Poppins' }}>
          Carregando métricas...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontFamily: 'Poppins',
            fontWeight: 700,
            color: 'var(--blue-dark)'
          }}
        >
          Dashboard IGP
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ fontFamily: 'Poppins' }}
        >
          Métricas e relatórios do sistema VeloHub
        </Typography>
      </Box>

      {/* Cards de Métricas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'var(--cor-container)' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom sx={{ fontFamily: 'Poppins' }}>
                Total Artigos
              </Typography>
              <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 700, color: 'var(--blue-medium)' }}>
                {metrics.counts.artigos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'var(--cor-container)' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom sx={{ fontFamily: 'Poppins' }}>
                Total Velonews
              </Typography>
              <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 700, color: 'var(--blue-opaque)' }}>
                {metrics.counts.velonews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'var(--cor-container)' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom sx={{ fontFamily: 'Poppins' }}>
                Bot Perguntas
              </Typography>
              <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 700, color: 'var(--green)' }}>
                {metrics.counts.botPerguntas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'var(--cor-container)' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom sx={{ fontFamily: 'Poppins' }}>
                Usuários Ativos
              </Typography>
              <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 700, color: 'var(--yellow)' }}>
                {metrics.performance?.uptime || 99.9}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ backgroundColor: 'var(--cor-container)', p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
              Crescimento Mensal
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="artigos" fill="#1634FF" name="Artigos" />
                <Bar dataKey="velonews" fill="#006AB9" name="Velonews" />
                <Bar dataKey="bot" fill="#15A237" name="Bot Perguntas" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: 'var(--cor-container)', p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
              Distribuição de Conteúdo
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Alerta de erro se houver */}
      {error && (
        <Alert severity="warning" sx={{ mt: 2, fontFamily: 'Poppins' }}>
          Aviso: {error}. Exibindo dados simulados.
        </Alert>
      )}
    </Container>
  );
};

export default IGPPage;
