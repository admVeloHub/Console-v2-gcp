import React, { useState } from 'react';
import './PeriodSelector.css';

const PeriodSelector = ({ isOpen, onClose, onApply, initialSelection = 'last15' }) => {
  const [selectedOption, setSelectedOption] = useState(initialSelection);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const periodOptions = [
    {
      id: 'last7',
      title: 'Últimos 7 dias',
      subtitle: 'Veja os últimos 7 dias',
      records: 278,
      icon: 'bx-calendar'
    },
    {
      id: 'last15',
      title: 'Últimos 15 dias',
      subtitle: 'Últimas duas semanas',
      records: 588,
      icon: 'bx-calendar'
    },
    {
      id: 'penultimate',
      title: 'Penúltimo mês',
      subtitle: 'Mês anterior ao passado',
      records: 0,
      icon: 'bx-calendar'
    },
    {
      id: 'lastmonth',
      title: 'Último mês',
      subtitle: 'Mês passado',
      records: 485,
      icon: 'bx-calendar'
    },
    {
      id: 'month',
      title: 'Mês atual',
      subtitle: 'outubro de 2025',
      records: 867,
      icon: 'bx-calendar'
    },
    {
      id: 'all',
      title: 'TODOS OS REGISTROS',
      subtitle: 'Histórico completo',
      records: 1193,
      icon: 'bx-check-square'
    }
  ];

  const handleOptionClick = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleApply = () => {
    const selectedPeriodOption = periodOptions.find(opt => opt.id === selectedOption);
    
    if (selectedOption === 'custom') {
      onApply({
        type: 'custom',
        startDate: customStartDate,
        endDate: customEndDate
      });
    } else {
      onApply({
        type: selectedOption,
        ...selectedPeriodOption
      });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <i className='bx bx-calendar'></i>
            Selecionar Período
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="period-grid">
            {periodOptions.map((option) => (
              <div
                key={option.id}
                className={`period-option ${selectedOption === option.id ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option.id)}
              >
                <div className="period-option-icon">
                  <i className={`bx ${option.icon}`}></i>
                </div>
                <div className="period-option-text">
                  <span className="title">{option.title}</span>
                  <span className="subtitle">{option.subtitle}</span>
                </div>
                <div className="period-option-records">
                  {option.records}
                  <span>REGISTROS</span>
                </div>
              </div>
            ))}
          </div>

          <div className="period-selected-info">
            <div className="period-selected-icon">
              <i className='bx bx-bar-chart-alt-2'></i>
            </div>
            <div className="period-selected-text">
              <span className="label">Período Selecionado</span>
              <span className="value">
                {periodOptions.find(opt => opt.id === selectedOption)?.records || 0} registros
              </span>
            </div>
          </div>

          <div className="custom-period-section">
            <h3 className="custom-period-title">Período Personalizado</h3>
            <div className="custom-period-inputs">
              <div className="date-input-group">
                <label htmlFor="startDate">Data inicial</label>
                <input
                  id="startDate"
                  type="date"
                  placeholder="dd/mm/aaaa"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="endDate">Data final</label>
                <input
                  id="endDate"
                  type="date"
                  placeholder="dd/mm/aaaa"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={handleCancel}>
            Cancelar
          </button>
          <button className="modal-btn-apply" onClick={handleApply}>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PeriodSelector;

