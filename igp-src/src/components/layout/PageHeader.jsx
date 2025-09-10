import React from 'react';
import { useNavigate } from 'react-router-dom';
import VeloigpButton from '../ui/VeloigpButton';
import './PageHeader.css';

const PageHeader = ({ 
  title, 
  subtitle = null, 
  showBackButton = true, 
  backButtonText = "Voltar",
  onBackClick = null,
  children = null 
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="page-header">
      <div className="page-header__content">
        <div className="page-header__left">
          {showBackButton && (
            <VeloigpButton
              variant="outline"
              icon="fas fa-arrow-left"
              onClick={handleBackClick}
              className="page-header__back-button"
            >
              {backButtonText}
            </VeloigpButton>
          )}
        </div>
        
        <div className="page-header__center">
          <h1 className="page-header__title">{title}</h1>
          {subtitle && (
            <p className="page-header__subtitle">{subtitle}</p>
          )}
        </div>
        
        <div className="page-header__right">
          {children}
        </div>
      </div>
      <hr className="page-header__divider" />
    </div>
  );
};

export default PageHeader;
