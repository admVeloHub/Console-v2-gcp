import React from 'react';
import './VeloigpHeader.css';

const VeloigpHeader = ({ currentPage = 'home', theme = 'light', onToggleTheme }) => {
  const isDark = theme === 'dark';

  const navigationItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'reports', label: 'Relatórios', path: '/reports' },
    { id: 'spreadsheet', label: 'Planilhas', path: '/spreadsheet' },
    { id: 'realtime', label: 'Tempo Real', path: '/realtime' },
    { id: 'config', label: 'Config', path: '/config' }
  ];

  return (
    <header className="veloigp-header">
      <div className="container header-container">
        <div className="header-left">
          <div className="logo" id="logo-container">
            <img 
              id="logo-image" 
              className="logo-image" 
              src="/console.png" 
              alt="VeloIGP Logo"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="logo-fallback" style={{ display: 'none' }}>
              <i className="fas fa-graduation-cap"></i>
              <span>VeloIGP</span>
            </div>
          </div>
        </div>
        
        <nav className="nav-menu">
          {navigationItems.map((item) => (
            <a
              key={item.id}
              href={item.path}
              className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="user-info">
          <div className="user-avatar">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#1634FF"/>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" x="8" y="8">
                <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" fill="white"/>
                <path d="M14 13C14 11.3431 12.6569 10 11 10H5C3.34315 10 2 11.3431 2 13V14H14V13Z" fill="white"/>
              </svg>
            </svg>
          </div>
          <span className="user-name">Usuário</span>
          <button className="logout-btn" title="Logout">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>

        <div className="theme-switch-wrapper" id="theme-toggle" onClick={onToggleTheme}>
          <span className="theme-icon">
            {isDark ? '☀️' : '🌙'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default VeloigpHeader;
