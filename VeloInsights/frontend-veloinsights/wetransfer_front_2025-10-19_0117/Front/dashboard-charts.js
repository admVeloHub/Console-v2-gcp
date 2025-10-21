// Dashboard Charts - VeloInsights
// Todos os gráficos para 55pbx e Octadesk

let charts = {};

// Função para obter cores baseadas no tema
function getChartColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    primary: style.getPropertyValue('--brand-primary').trim(),
    secondary: style.getPropertyValue('--brand-secondary').trim(),
    success: style.getPropertyValue('--success-color').trim(),
    danger: style.getPropertyValue('--danger-color').trim(),
    warning: style.getPropertyValue('--warning-color').trim(),
    textColor: style.getPropertyValue('--chart-text-color').trim(),
    gridColor: style.getPropertyValue('--chart-grid-color').trim(),
  };
}

// Configuração padrão dos gráficos
function getDefaultChartConfig() {
  const colors = getChartColors();
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colors.textColor,
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: 'Poppins'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          family: 'Poppins'
        },
        bodyFont: {
          size: 13,
          family: 'Poppins'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: colors.textColor,
          font: { size: 11, family: 'Poppins' }
        },
        grid: {
          color: colors.gridColor,
          display: true
        }
      },
      y: {
        ticks: {
          color: colors.textColor,
          font: { size: 11, family: 'Poppins' }
        },
        grid: {
          color: colors.gridColor,
          display: true
        }
      }
    }
  };
}

// ========================================
// GRÁFICOS 55PBX
// ========================================

// 1. Volume Histórico Geral (55pbx) - Tendência Semanal
function init55pbxVolumeGeral() {
  const ctx = document.getElementById('chart-55pbx-volume-geral');
  if (!ctx) return;

  const colors = getChartColors();
  const config = getDefaultChartConfig();

  charts.pbx_volume_geral = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Chamadas Recebidas',
          data: [420, 380, 450, 390, 470, 280, 180],
          borderColor: colors.primary,
          backgroundColor: colors.primary + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: colors.primary
        },
        {
          label: 'Chamadas Atendidas',
          data: [365, 332, 395, 340, 410, 245, 158],
          borderColor: colors.success,
          backgroundColor: colors.success + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: colors.success
        },
        {
          label: 'Retidas na URA',
          data: [55, 48, 55, 50, 60, 35, 22],
          borderColor: colors.warning,
          backgroundColor: colors.warning + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: colors.warning
        }
      ]
    },
    options: config
  });
}

// CSAT - 55pbx
function init55pbxCSAT() {
  const ctx = document.getElementById('chart-55pbx-csat');
  if (!ctx) return;

  const colors = getChartColors();
  const config = getDefaultChartConfig();

  charts.pbx_csat = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'CSAT Score',
          data: [4.5, 4.3, 4.6, 4.4, 4.7, 4.8, 4.5],
          borderColor: colors.success,
          backgroundColor: colors.success + '30',
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: colors.success,
          borderWidth: 3
        }
      ]
    },
    options: {
      ...config,
      scales: {
        ...config.scales,
        y: {
          ...config.scales.y,
          min: 0,
          max: 5,
          ticks: {
            ...config.scales.y.ticks,
            callback: function(value) {
              return value.toFixed(1);
            }
          }
        }
      }
    }
  });
}

// 2. Volume por Produto (URA) - 55pbx
function init55pbxVolumeProduto() {
  const ctx = document.getElementById('chart-55pbx-volume-produto');
  if (!ctx) return;

  const colors = getChartColors();
  const config = getDefaultChartConfig();

  charts.pbx_volume_produto = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Suporte Técnico',
          data: [150, 140, 165, 145, 170, 110, 70],
          borderColor: colors.primary,
          backgroundColor: colors.primary,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'Financeiro',
          data: [120, 110, 130, 115, 135, 85, 55],
          borderColor: colors.success,
          backgroundColor: colors.success,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'Comercial',
          data: [90, 85, 95, 88, 98, 60, 40],
          borderColor: colors.warning,
          backgroundColor: colors.warning,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'Dúvidas Gerais',
          data: [60, 45, 60, 42, 67, 45, 33],
          borderColor: colors.danger,
          backgroundColor: colors.danger,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        }
      ]
    },
    options: {
      ...config,
      plugins: {
        ...config.plugins,
        legend: {
          ...config.plugins.legend,
          position: 'top'
        }
      }
    }
  });
}

// 3. Volume por Hora - 55pbx (Histograma)
function init55pbxVolumeHora() {
  const ctx = document.getElementById('chart-55pbx-volume-hora');
  if (!ctx) return;

  const colors = getChartColors();
  const config = getDefaultChartConfig();

  charts.pbx_volume_hora = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h'],
      datasets: [
        {
          label: 'Retido na URA',
          data: [25, 35, 42, 45, 38, 30, 40, 48, 50, 42, 28],
          backgroundColor: colors.warning + '90',
          borderColor: colors.warning,
          borderWidth: 1,
          borderRadius: 8
        },
        {
          label: 'Recebido',
          data: [85, 120, 145, 158, 135, 95, 130, 165, 180, 150, 95],
          backgroundColor: colors.primary + '90',
          borderColor: colors.primary,
          borderWidth: 1,
          borderRadius: 8
        },
        {
          label: 'Atendida',
          data: [75, 105, 125, 138, 118, 82, 112, 142, 155, 130, 82],
          backgroundColor: colors.success + '90',
          borderColor: colors.success,
          borderWidth: 1,
          borderRadius: 8
        }
      ]
    },
    options: {
      ...config,
      scales: {
        ...config.scales,
        x: {
          ...config.scales.x,
          stacked: false
        },
        y: {
          ...config.scales.y,
          stacked: false
        }
      }
    }
  });
}

// 4. TMA por Produto - 55pbx
function init55pbxTMAProduto() {
  const ctx = document.getElementById('chart-55pbx-tma-produto');
  if (!ctx) return;

  const colors = getChartColors();
  const config = getDefaultChartConfig();

  charts.pbx_tma_produto = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Suporte Técnico', 'Financeiro', 'Comercial', 'Dúvidas Gerais', 'Reclamações', 'Cancelamento'],
      datasets: [
        {
          label: 'TMA (minutos)',
          data: [8.5, 5.2, 6.8, 3.5, 12.4, 15.2],
          backgroundColor: [
            colors.primary + '90',
            colors.success + '90',
            colors.warning + '90',
            colors.secondary + '90',
            colors.danger + '90',
            '#FF5722' + '90'
          ],
          borderColor: [
            colors.primary,
            colors.success,
            colors.warning,
            colors.secondary,
            colors.danger,
            '#FF5722'
          ],
          borderWidth: 2,
          borderRadius: 8
        }
      ]
    },
    options: {
      ...config,
      indexAxis: 'y',
      plugins: {
        ...config.plugins,
        legend: {
          display: false
        }
      }
    }
  });
}

// 5. Tempo de Pausa Geral - 55pbx
function init55pbxPausaGeral() {
  const ctx = document.getElementById('chart-55pbx-pausa-geral');
  if (!ctx) return;

  const colors = getChartColors();
  const config = getDefaultChartConfig();

  charts.pbx_pausa_geral = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Tempo Médio de Pausa (min)',
          data: [45, 52, 48, 55, 50, 35, 30],
          borderColor: colors.warning,
          backgroundColor: colors.warning + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: colors.warning,
          borderWidth: 3
        }
      ]
    },
    options: config
  });
}

// 5b. Pausa por Motivo - 55pbx
function init55pbxPausaMotivo() {
  const ctx = document.getElementById('chart-55pbx-pausa-motivo');
  if (!ctx) return;

  const colors = getChartColors();
  const config = getDefaultChartConfig();

  charts.pbx_pausa_motivo = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Almoço', 'Lanche', 'Banheiro', 'Treinamento', 'Reunião', 'Outros'],
      datasets: [
        {
          data: [35, 15, 10, 20, 12, 8],
          backgroundColor: [
            colors.primary + '90',
            colors.success + '90',
            colors.warning + '90',
            colors.secondary + '90',
            colors.danger + '90',
            '#9C27B0' + '90'
          ],
          borderColor: [
            colors.primary,
            colors.success,
            colors.warning,
            colors.secondary,
            colors.danger,
            '#9C27B0'
          ],
          borderWidth: 2
        }
      ]
    },
    options: {
      ...config,
      scales: undefined,
      plugins: {
        ...config.plugins,
        legend: {
          ...config.plugins.legend,
          position: 'right'
        }
      }
    }
  });
}

// ========================================
// GRÁFICOS OCTADESK
// ========================================

// 1. Volume Histórico Geral - Octadesk
function initOctadeskVolumeGeral() {
  const ctx = document.getElementById('chart-octadesk-volume-geral');
  if (!ctx) return;

  const colors = getChartColors();
  const config = getDefaultChartConfig();

  charts.octadesk_volume_geral = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Tickets Abertos',
          data: [285, 310, 295, 325, 340, 180, 95],
          borderColor: colors.primary,
          backgroundColor: colors.primary + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: colors.primary
        },
        {
          label: 'Tickets Resolvidos',
          data: [270, 298, 285, 310, 328, 175, 92],
          borderColor: colors.success,
          backgroundColor: colors.success + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: colors.success
        },
        {
          label: 'Tickets Pendentes',
          data: [15, 27, 37, 52, 64, 69, 72],
          borderColor: colors.danger,
          backgroundColor: colors.danger + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: colors.danger
        }
      ]
    },
    options: config
  });
}

// CSAT - Octadesk
function initOctadeskCSAT() {
  const ctx = document.getElementById('chart-octadesk-csat');
  if (!ctx) return;

  const colors = getChartColors();
  const config = getDefaultChartConfig();

  charts.octadesk_csat = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'CSAT Score',
          data: [4.6, 4.5, 4.7, 4.6, 4.8, 4.9, 4.7],
          borderColor: colors.success,
          backgroundColor: colors.success + '30',
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: colors.success,
          borderWidth: 3
        }
      ]
    },
    options: {
      ...config,
      scales: {
        ...config.scales,
        y: {
          ...config.scales.y,
          min: 0,
          max: 5,
          ticks: {
            ...config.scales.y.ticks,
            callback: function(value) {
              return value.toFixed(1);
            }
          }
        }
      }
    }
  });
}

// 2. Volume por Assunto - Octadesk
function initOctadeskVolumeAssunto() {
  const ctx = document.getElementById('chart-octadesk-volume-assunto');
  if (!ctx) return;

  const colors = getChartColors();
  const config = getDefaultChartConfig();

  charts.octadesk_volume_assunto = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Suporte Técnico',
          data: [95, 105, 98, 110, 115, 62, 32],
          borderColor: colors.primary,
          backgroundColor: colors.primary,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'Dúvidas',
          data: [80, 88, 82, 90, 95, 48, 28],
          borderColor: colors.success,
          backgroundColor: colors.success,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'Reclamações',
          data: [45, 52, 50, 55, 58, 32, 18],
          borderColor: colors.danger,
          backgroundColor: colors.danger,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'Financeiro',
          data: [35, 38, 35, 40, 42, 22, 10],
          borderColor: colors.warning,
          backgroundColor: colors.warning,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'Outros',
          data: [30, 27, 30, 30, 30, 16, 7],
          borderColor: colors.secondary,
          backgroundColor: colors.secondary,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        }
      ]
    },
    options: {
      ...config,
      plugins: {
        ...config.plugins,
        legend: {
          ...config.plugins.legend,
          position: 'top'
        }
      }
    }
  });
}

// 3. Volume por Hora - Octadesk
function initOctadeskVolumeHora() {
  const ctx = document.getElementById('chart-octadesk-volume-hora');
  if (!ctx) return;

  const colors = getChartColors();
  const config = getDefaultChartConfig();

  charts.octadesk_volume_hora = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h'],
      datasets: [
        {
          label: 'Tickets Abertos',
          data: [35, 48, 62, 68, 58, 42, 55, 72, 78, 65, 42],
          backgroundColor: colors.primary + '90',
          borderColor: colors.primary,
          borderWidth: 1,
          borderRadius: 8
        },
        {
          label: 'Tickets Resolvidos',
          data: [32, 45, 58, 65, 55, 40, 52, 68, 74, 62, 40],
          backgroundColor: colors.success + '90',
          borderColor: colors.success,
          borderWidth: 1,
          borderRadius: 8
        }
      ]
    },
    options: config
  });
}

// 4. Tempo de Resolução (Abertura/Fechamento) - Octadesk
function initOctadeskTempoResolucao() {
  const ctx = document.getElementById('chart-octadesk-tempo-resolucao');
  if (!ctx) return;

  const colors = getChartColors();
  const config = getDefaultChartConfig();

  charts.octadesk_tempo_resolucao = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Suporte Técnico', 'Dúvidas', 'Reclamações', 'Financeiro', 'Comercial', 'Outros'],
      datasets: [
        {
          label: 'Tempo de Resolução (horas)',
          data: [6.5, 3.2, 8.5, 4.8, 5.5, 2.8],
          backgroundColor: [
            colors.primary + '90',
            colors.success + '90',
            colors.danger + '90',
            colors.warning + '90',
            colors.secondary + '90',
            '#9C27B0' + '90'
          ],
          borderColor: [
            colors.primary,
            colors.success,
            colors.danger,
            colors.warning,
            colors.secondary,
            '#9C27B0'
          ],
          borderWidth: 2,
          borderRadius: 8
        }
      ]
    },
    options: {
      ...config,
      indexAxis: 'y',
      plugins: {
        ...config.plugins,
        legend: {
          display: false
        }
      }
    }
  });
}

// 5. Tempo de Pausa Geral - Octadesk
function initOctadeskPausaGeral() {
  const ctx = document.getElementById('chart-octadesk-pausa-geral');
  if (!ctx) return;

  const colors = getChartColors();
  const config = getDefaultChartConfig();

  charts.octadesk_pausa_geral = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Tempo Médio de Pausa (min)',
          data: [38, 42, 40, 45, 43, 28, 22],
          borderColor: colors.warning,
          backgroundColor: colors.warning + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: colors.warning,
          borderWidth: 3
        }
      ]
    },
    options: config
  });
}

// 5b. Pausa por Motivo - Octadesk
function initOctadeskPausaMotivo() {
  const ctx = document.getElementById('chart-octadesk-pausa-motivo');
  if (!ctx) return;

  const colors = getChartColors();
  const config = getDefaultChartConfig();

  charts.octadesk_pausa_motivo = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Almoço', 'Lanche', 'Banheiro', 'Treinamento', 'Reunião', 'Outros'],
      datasets: [
        {
          data: [38, 18, 12, 18, 10, 4],
          backgroundColor: [
            colors.primary + '90',
            colors.success + '90',
            colors.warning + '90',
            colors.secondary + '90',
            colors.danger + '90',
            '#9C27B0' + '90'
          ],
          borderColor: [
            colors.primary,
            colors.success,
            colors.warning,
            colors.secondary,
            colors.danger,
            '#9C27B0'
          ],
          borderWidth: 2
        }
      ]
    },
    options: {
      ...config,
      scales: undefined,
      plugins: {
        ...config.plugins,
        legend: {
          ...config.plugins.legend,
          position: 'right'
        }
      }
    }
  });
}

// ========================================
// INICIALIZAÇÃO E ATUALIZAÇÃO
// ========================================

function initializeAllCharts() {
  // 55pbx
  init55pbxVolumeGeral();
  init55pbxCSAT();
  init55pbxVolumeProduto();
  init55pbxVolumeHora();
  init55pbxTMAProduto();
  init55pbxPausaGeral();
  init55pbxPausaMotivo();

  // Octadesk
  initOctadeskVolumeGeral();
  initOctadeskCSAT();
  initOctadeskVolumeAssunto();
  initOctadeskVolumeHora();
  initOctadeskTempoResolucao();
  initOctadeskPausaGeral();
  initOctadeskPausaMotivo();
}

function updateAllCharts() {
  // Destruir todos os gráficos existentes
  Object.values(charts).forEach(chart => {
    if (chart) chart.destroy();
  });
  
  charts = {};
  
  // Recriar todos os gráficos
  initializeAllCharts();
}

// Exportar funções para uso global
window.initializeAllCharts = initializeAllCharts;
window.updateAllCharts = updateAllCharts;

