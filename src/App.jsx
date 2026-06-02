// VERSION: v3.12.0 | DATE: 2026-04-28 | AUTHOR: VeloHub Development Team
// CHANGELOG: v3.12.0 - Rota /qualidade-gerenciar (Gestão e Qualidade → Gerenciar)
// CHANGELOG: v3.11.0 - Remoção do módulo IGP (IGPPage e pasta pages/IGP); /igp redireciona para /
// CHANGELOG: v3.10.0 - Remoção da rota /conexoes e do módulo WhatsApp do bundle inicial (sem import de ConexoesPage)
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, Alert, AlertTitle, Typography } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Tema VeloHub
import { velohubTheme } from './styles/theme';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Config
import { GOOGLE_CLIENT_ID } from './config/google';

// Componentes
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ArtigosPage from './pages/ArtigosPage';
import VelonewsPage from './pages/VelonewsPage';
import BotPerguntasPage from './pages/BotPerguntasPage';
import ChamadosInternosPage from './pages/ChamadosInternosPage';
import ConfigPage from './pages/ConfigPage';
import QualidadePage from './pages/QualidadePage';
import FuncionariosPage from './pages/FuncionariosPage';
import QualidadeModulePage from './pages/QualidadeModulePage';
import QualidadeGerenciarPage from './pages/QualidadeGerenciarPage';
import ServicosPage from './pages/ServicosPage';
import BotAnalisesPage from './pages/BotAnalisesPage';
import CapacityPage from './pages/CapacityPage';
import HubAnalisesPage from './pages/HubAnalisesPage';
import AcademyPage from './pages/AcademyPage';
import CorporativoPage from './pages/CorporativoPage';
import CorporativoLegalPage from './pages/CorporativoLegalPage';
import CorporativoComunicacaoPage from './pages/CorporativoComunicacaoPage';

// Componente para rotas protegidas
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Componente principal da aplicação
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();


  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/igp" element={<Navigate to="/" replace />} />
        <Route path="/artigos" element={
          <ProtectedRoute requiredPermission="artigos">
            <ArtigosPage />
          </ProtectedRoute>
        } />
        <Route path="/velonews" element={
          <ProtectedRoute requiredPermission="velonews">
            <VelonewsPage />
          </ProtectedRoute>
        } />
        <Route path="/bot-perguntas" element={
          <ProtectedRoute requiredPermission="botPerguntas">
            <BotPerguntasPage />
          </ProtectedRoute>
        } />
        <Route path="/chamados-internos" element={
          <ProtectedRoute requiredPermission="chamadosInternos">
            <ChamadosInternosPage />
          </ProtectedRoute>
        } />
        <Route path="/config" element={
          <ProtectedRoute requiredPermission="config">
            <ConfigPage />
          </ProtectedRoute>
        } />
        <Route path="/qualidade" element={
          <ProtectedRoute requiredPermission="qualidade">
            <QualidadePage />
          </ProtectedRoute>
        } />
        <Route path="/funcionarios" element={
          <ProtectedRoute requiredPermission="qualidade">
            <FuncionariosPage />
          </ProtectedRoute>
        } />
        <Route path="/qualidade-module" element={
          <ProtectedRoute requiredPermission="qualidade">
            <QualidadeModulePage />
          </ProtectedRoute>
        } />
        <Route path="/qualidade-gerenciar" element={
          <ProtectedRoute requiredPermission="qualidade">
            <QualidadeGerenciarPage />
          </ProtectedRoute>
        } />
        <Route path="/servicos" element={
          <ProtectedRoute requiredPermission="servicos">
            <ServicosPage />
          </ProtectedRoute>
        } />
        <Route path="/bot-analises" element={
          <ProtectedRoute requiredPermission="botAnalises">
            <BotAnalisesPage />
          </ProtectedRoute>
        } />
            <Route path="/capacity" element={
              <ProtectedRoute requiredPermission="capacity">
                <CapacityPage />
              </ProtectedRoute>
            } />
            <Route path="/hub-analises" element={
              <ProtectedRoute requiredPermission="hubAnalises">
                <HubAnalisesPage />
              </ProtectedRoute>
            } />
            <Route path="/academy" element={
              <ProtectedRoute requiredPermission="academy">
                <AcademyPage />
              </ProtectedRoute>
            } />
            <Route path="/corporativo" element={
              <ProtectedRoute requiredPermission="corporativo">
                <CorporativoPage />
              </ProtectedRoute>
            } />
            <Route path="/corporativo/legal" element={
              <ProtectedRoute requiredPermission="corporativo">
                <CorporativoLegalPage />
              </ProtectedRoute>
            } />
            <Route path="/corporativo/comunicacao" element={
              <ProtectedRoute requiredPermission="corporativo">
                <CorporativoComunicacaoPage />
              </ProtectedRoute>
            } />
        <Route path="/login" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
};

function App() {
  // Validar que o clientId está presente antes de renderizar
  if (!GOOGLE_CLIENT_ID) {
    console.error('❌ ERRO CRÍTICO: GOOGLE_CLIENT_ID está undefined!');
    console.error('📍 Verifique se o arquivo .env existe em: Dev - Console/.env');
    console.error('📍 Verifique se contém: REACT_APP_GOOGLE_CLIENT_ID=...');
    console.error('📍 REINICIE o servidor após criar/modificar o arquivo .env');
    
    return (
      <ThemeProvider theme={velohubTheme}>
        <CssBaseline />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2,
          p: 4
        }}>
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            <AlertTitle>Erro de Configuração</AlertTitle>
            <Typography variant="body1" sx={{ mb: 2 }}>
              O Google Client ID não está configurado.
            </Typography>
            <Typography variant="body2" component="div">
              <strong>Passos para resolver:</strong>
              <ol style={{ marginTop: 8, marginBottom: 8 }}>
                <li>Crie o arquivo <code>.env</code> na raiz do projeto (<code>Dev - Console/.env</code>)</li>
                <li>Adicione a linha: <code>REACT_APP_GOOGLE_CLIENT_ID=278491073220-7u7hh1tji5dd65qagkprc1acenagql5o.apps.googleusercontent.com</code></li>
                <li><strong>REINICIE</strong> o servidor de desenvolvimento (pare e execute <code>npm start</code> novamente)</li>
              </ol>
            </Typography>
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={velohubTheme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
