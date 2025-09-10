import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import VeloigpLayout from './components/VeloigpLayout';
import VeloigpCard from './components/ui/VeloigpCard';
import VeloigpButton from './components/ui/VeloigpButton';
import VeloigpConfig from './components/config/VeloigpConfig';
import VeloigpDashboard from './pages/VeloigpDashboard';
import VeloigpRealTimePage from './pages/VeloigpRealTime';
import VeloigpReports from './pages/VeloigpReports';
import VeloigpSpreadsheet from './pages/VeloigpSpreadsheet';

// 🎯 Página inicial com integração VeloIGP
const HomePage = () => {
  return (
    <div className="fade-in">
      
      <div className="dashboard-grid">
        <VeloigpCard
          title="Dashboard Principal"
          hoverable
          className="container-main"
        >
          <p>Visualize todas as métricas principais do sistema 55PBX em tempo real.</p>
          <VeloigpButton 
            variant="outline" 
            icon="fas fa-arrow-right"
            href="/dashboard"
          >
            Acessar Dashboard
          </VeloigpButton>
        </VeloigpCard>

        <VeloigpCard
          title="Relatórios"
          hoverable
          className="container-main"
        >
          <p>Gere relatórios personalizados e análises avançadas dos dados.</p>
          <VeloigpButton 
            variant="outline" 
            icon="fas fa-download"
            href="/reports"
          >
            Ver Relatórios
          </VeloigpButton>
        </VeloigpCard>

        <VeloigpCard
          title="Tempo Real"
          hoverable
          className="container-main"
        >
          <p>Acompanhe as métricas em tempo real com atualizações automáticas.</p>
          <VeloigpButton 
            variant="outline" 
            icon="fas fa-play"
            href="/realtime"
          >
            Monitorar
          </VeloigpButton>
        </VeloigpCard>

        <VeloigpCard
          title="Análise de Planilha"
          hoverable
          className="container-main"
        >
          <p>Carregue sua planilha e analise dados com gráficos comparativos.</p>
          <VeloigpButton 
            variant="outline" 
            icon="fas fa-upload"
            href="/spreadsheet"
          >
            Analisar Planilha
          </VeloigpButton>
        </VeloigpCard>

        <VeloigpCard
          title="Configurações"
          hoverable
          className="container-main"
        >
          <p>Configure tokens, filtros e preferências do sistema.</p>
          <VeloigpButton 
            variant="outline" 
            icon="fas fa-wrench"
            href="/config"
          >
            Configurar
          </VeloigpButton>
        </VeloigpCard>
      </div>
    </div>
  );
};

// 🎯 COMPONENTE PRINCIPAL
const App = () => {
  return (
      <ErrorBoundary>
        <Router>
          <VeloigpLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<VeloigpDashboard />} />
              <Route path="/reports" element={<VeloigpReports />} />
              <Route path="/spreadsheet" element={<VeloigpSpreadsheet />} />
              <Route path="/realtime" element={<VeloigpRealTimePage />} />
              <Route path="/config" element={<VeloigpConfig />} />
            </Routes>
          </VeloigpLayout>
        </Router>
      </ErrorBoundary>
  );
};

export default App;