import React from 'react';
import './VeloigpCard.css';

const VeloigpCard = ({ 
  children, 
  title,
  subtitle,
  variant = 'default',
  hoverable = true,
  className = '',
  onClick,
  ...props 
}) => {
  // Classes base do card
  const baseClasses = `veloigp-card veloigp-card--${variant}`;
  const hoverClass = hoverable ? 'veloigp-card--hoverable' : '';
  const clickableClass = onClick ? 'veloigp-card--clickable' : '';
  const finalClassName = `${baseClasses} ${hoverClass} ${clickableClass} ${className}`.trim();

  // Handler de clique
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className={finalClassName}
      onClick={handleClick}
      {...props}
    >
      {/* Título do card - SEMPRE alinhado à esquerda do card */}
      {title && (
        <h3 className="veloigp-card__title">{title}</h3>
      )}
      
      {/* Subtítulo do card */}
      {subtitle && (
        <p className="veloigp-card__subtitle">{subtitle}</p>
      )}
      
      {/* Conteúdo do card */}
      <div className="veloigp-card__content">
        {children}
      </div>
    </div>
  );
};

export default VeloigpCard;