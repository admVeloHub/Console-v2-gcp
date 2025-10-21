import React from 'react'
import './LoadingSpinner.css'

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Carregando...', 
  showMessage = true,
  type = 'spinner' // 'spinner', 'dots', 'pulse', 'skeleton'
}) => {
  const sizeClasses = {
    small: 'loading-small',
    medium: 'loading-medium',
    large: 'loading-large'
  }

  const renderSpinner = () => {
    switch (type) {
      case 'dots':
        return (
          <div className={`loading-dots ${sizeClasses[size]}`}>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )
      
      case 'pulse':
        return (
          <div className={`loading-pulse ${sizeClasses[size]}`}>
            <div className="pulse-circle"></div>
          </div>
        )
      
      case 'skeleton':
        return (
          <div className={`loading-skeleton ${sizeClasses[size]}`}>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
            <div className="skeleton-line medium"></div>
          </div>
        )
      
      default:
        return (
          <div className={`loading-spinner ${sizeClasses[size]}`}>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        )
    }
  }

  return (
    <div className="loading-container">
      <div className="loading-content">
        {renderSpinner()}
        {showMessage && (
          <div className="loading-message animate-fade-in animate-delay-1">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner
