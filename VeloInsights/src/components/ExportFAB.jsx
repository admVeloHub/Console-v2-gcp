import React, { useState } from 'react';
import './ExportFAB.css';

const ExportFAB = ({ onExport, hasData }) => {
  const [showModal, setShowModal] = useState(false);

  const handleExport = (format) => {
    if (onExport) {
      onExport(format);
    }
    setShowModal(false);
  };

  if (!hasData) return null;

  return (
    <>
      {/* FAB Button */}
      <button 
        className="fab-button" 
        onClick={() => setShowModal(true)}
        title="Exportar Dados"
      >
        <i className='bx bx-download'></i>
      </button>

      {/* Export Modal */}
      {showModal && (
        <div className="export-modal-overlay active" onClick={() => setShowModal(false)}>
          <div className="export-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <h2 className="export-modal-title">
                <i className='bx bx-download'></i>
                Exportar Dados
              </h2>
              <button className="export-modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className="export-modal-body">
              <p className="export-description">
                Escolha o formato para exportar seus dados
              </p>

              <div className="export-options">
                <button 
                  className="export-option excel"
                  onClick={() => handleExport('excel')}
                >
                  <div className="export-option-icon">
                    <i className='bx bxs-file-export'></i>
                  </div>
                  <div className="export-option-content">
                    <h3>Excel</h3>
                    <p>Planilha completa com todos os dados</p>
                  </div>
                  <i className='bx bx-chevron-right export-arrow'></i>
                </button>

                <button 
                  className="export-option pdf"
                  onClick={() => handleExport('pdf')}
                >
                  <div className="export-option-icon">
                    <i className='bx bxs-file-pdf'></i>
                  </div>
                  <div className="export-option-content">
                    <h3>PDF</h3>
                    <p>Relatório formatado para impressão</p>
                  </div>
                  <i className='bx bx-chevron-right export-arrow'></i>
                </button>

                <button 
                  className="export-option csv"
                  onClick={() => handleExport('csv')}
                >
                  <div className="export-option-icon">
                    <i className='bx bx-file'></i>
                  </div>
                  <div className="export-option-content">
                    <h3>CSV</h3>
                    <p>Dados brutos separados por vírgula</p>
                  </div>
                  <i className='bx bx-chevron-right export-arrow'></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportFAB;
