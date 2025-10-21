import React, { useState } from 'react';
import './PeriodModal.css';

const PeriodModal = ({ isOpen, onClose, onApply, currentFilters, data = [] }) => {
  // Mapear filtros atuais para o formato do modal
  const getInitialSelection = () => {
    if (!currentFilters?.period) return 'last15Days';
    
    const periodMap = {
      'last7Days': 'last7',
      'last15Days': 'last15',
      'penultimoMes': 'penultimate',
      'ultimoMes': 'lastmonth',
      'currentMonth': 'month',
      'allRecords': 'all',
      'custom': 'custom'
    };
    
    return periodMap[currentFilters.period] || 'last15';
  };

  const [selectedOption, setSelectedOption] = useState(getInitialSelection());
  const [customStartDate, setCustomStartDate] = useState(currentFilters?.customStartDate || '');
  const [customEndDate, setCustomEndDate] = useState(currentFilters?.customEndDate || '');

  // Calcular registros por período
  const calculateRecords = (periodId) => {
    if (!data || data.length === 0) return 0;
    
    const now = new Date();
    let startDate, endDate;

    switch (periodId) {
      case 'last7':
        startDate = new Date(now.getTime() - (6 * 24 * 60 * 60 * 1000));
        endDate = now;
        break;
      case 'last15':
        startDate = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
        endDate = now;
        break;
      case 'penultimate':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() - 1, 0);
        break;
      case 'lastmonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case 'all':
        return data.length;
      default:
        return 0;
    }

    return data.filter(item => {
      if (!item.data) return false;
      const itemDate = new Date(item.data);
      return itemDate >= startDate && itemDate <= endDate;
    }).length;
  };

  const periodOptions = [
    {
      id: 'last7',
      title: 'Últimos 7 dias',
      subtitle: 'Veja os últimos 7 dias',
      records: calculateRecords('last7'),
      icon: 'bx-calendar',
      filterKey: 'last7Days'
    },
    {
      id: 'last15',
      title: 'Últimos 15 dias',
      subtitle: 'Últimas duas semanas',
      records: calculateRecords('last15'),
      icon: 'bx-calendar',
      filterKey: 'last15Days'
    },
    {
      id: 'penultimate',
      title: 'Penúltimo mês',
      subtitle: 'Mês anterior ao passado',
      records: calculateRecords('penultimate'),
      icon: 'bx-calendar',
      filterKey: 'penultimoMes'
    },
    {
      id: 'lastmonth',
      title: 'Último mês',
      subtitle: 'Mês passado',
      records: calculateRecords('lastmonth'),
      icon: 'bx-calendar',
      filterKey: 'ultimoMes'
    },
    {
      id: 'month',
      title: 'Mês atual',
      subtitle: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      records: calculateRecords('month'),
      icon: 'bx-calendar',
      filterKey: 'currentMonth'
    },
    {
      id: 'all',
      title: 'TODOS OS REGISTROS',
      subtitle: 'Histórico completo',
      records: calculateRecords('all'),
      icon: 'bx-check-square',
      filterKey: 'allRecords'
    }
  ];

  const handleOptionClick = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleApply = () => {
    const selectedPeriodOption = periodOptions.find(opt => opt.id === selectedOption);
    
    if (selectedOption === 'custom') {
      onApply({
        period: 'custom',
        customStartDate,
        customEndDate
      });
    } else {
      onApply({
        period: selectedPeriodOption.filterKey
      });
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  const selectedPeriod = periodOptions.find(opt => opt.id === selectedOption);

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
                {selectedPeriod?.records || 0} registros
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
                  onChange={(e) => {
                    setCustomStartDate(e.target.value);
                    setSelectedOption('custom');
                  }}
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="endDate">Data final</label>
                <input
                  id="endDate"
                  type="date"
                  placeholder="dd/mm/aaaa"
                  value={customEndDate}
                  onChange={(e) => {
                    setCustomEndDate(e.target.value);
                    setSelectedOption('custom');
                  }}
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

export default PeriodModal;
