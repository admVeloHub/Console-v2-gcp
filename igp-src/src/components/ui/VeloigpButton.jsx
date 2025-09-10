import React from 'react';
import './VeloigpButton.css';

const VeloigpButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  onClick,
  href,
  target,
  className = '',
  ...props 
}) => {
  const baseClasses = `veloigp-btn veloigp-btn--${variant} veloigp-btn--${size}`;
  const disabledClass = disabled || loading ? 'veloigp-btn--disabled' : '';
  const loadingClass = loading ? 'veloigp-btn--loading' : '';
  const finalClassName = `${baseClasses} ${disabledClass} ${loadingClass} ${className}`.trim();

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  const renderIcon = () => {
    if (loading) {
      return <i className="fas fa-spinner fa-spin"></i>;
    }
    if (icon) {
      return <i className={icon}></i>;
    }
    return null;
  };

  const renderContent = () => (
    <>
      {iconPosition === 'left' && renderIcon()}
      {children && <span>{children}</span>}
      {iconPosition === 'right' && renderIcon()}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        className={finalClassName}
        onClick={handleClick}
        {...props}
      >
        {renderContent()}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={finalClassName}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default VeloigpButton;
