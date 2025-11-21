// VERSION: v3.8.2 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, Alert, AlertTitle } from '@mui/material';
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
import IGPPage from './pages/IGPPage';
import ArtigosPage from './pages/ArtigosPage';
import VelonewsPage from './pages/VelonewsPage';
import BotPerguntasPage from './pages/BotPerguntasPage';
import ChamadosInternosPage from './pages/ChamadosInternosPage';
import ConfigPage from './pages/ConfigPage';
import QualidadePage from './pages/QualidadePage';
import FuncionariosPage from './pages/FuncionariosPage';
import QualidadeModulePage from './pages/QualidadeModulePage';
import ServicosPage from './pages/ServicosPage';
import BotAnalisesPage from './pages/BotAnalisesPage';
import CapacityPage from './pages/CapacityPage';
import HubAnalisesPage from './pages/HubAnalisesPage';
import AcademyPage from './pages/AcademyPage';

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
        <Route path="/igp" element={
          <ProtectedRoute requiredPermission="igp">
            <IGPPage />
          </ProtectedRoute>
        } />
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
        <Route path="/login" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
};

function App() {
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
