import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/veloigp-global.css';
import VeloigpHeader from './layout/VeloigpHeader';
import './layout/VeloigpHeader.css';

const VeloigpLayout = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const location = useLocation();
  
  // Detectar página atual baseada na rota
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/reports') return 'reports';
    if (path === '/spreadsheet') return 'spreadsheet';
    if (path === '/realtime') return 'realtime';
    if (path === '/config') return 'config';
    return 'home';
  };
  
  const currentPage = getCurrentPage();

  useEffect(() => {
    // Aplicar tema ao documento
    document.documentElement.setAttribute('data-theme', theme);
    
    // Salvar preferência no localStorage
    localStorage.setItem('veloigp-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('veloigp-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="veloigp-app" data-theme={theme}>
      <VeloigpHeader 
        currentPage={currentPage} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main>
        <div className="container main-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default VeloigpLayout;
