// VERSION: v3.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Tema VeloHub
import { velohubTheme } from './styles/theme';

// Componentes
import Header from './components/common/Header';
import DashboardPage from './pages/DashboardPage';
import IGPPage from './pages/IGPPage';
import ArtigosPage from './pages/ArtigosPage';
import VelonewsPage from './pages/VelonewsPage';
import BotPerguntasPage from './pages/BotPerguntasPage';

function App() {
  return (
    <ThemeProvider theme={velohubTheme}>
      <CssBaseline />
      <BrowserRouter>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/igp" element={<IGPPage />} />
            <Route path="/artigos" element={<ArtigosPage />} />
            <Route path="/velonews" element={<VelonewsPage />} />
            <Route path="/bot-perguntas" element={<BotPerguntasPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
