// VeloInsights - Main Application Logic

// ========== MOCK DATA ==========
const operatorsData = [
  {
    id: 1,
    name: 'Ana Silva',
    role: 'Supervisora',
    avatar: '#4FC3F7',
    calls: 342,
    tickets: 89,
    csat: 4.8,
    tma: '4:32',
    email: 'ana.silva@velotax.com'
  },
  {
    id: 2,
    name: 'Carlos Santos',
    role: 'Atendente Sênior',
    avatar: '#1634FF',
    calls: 298,
    tickets: 76,
    csat: 4.6,
    tma: '5:15',
    email: 'carlos.santos@velotax.com'
  },
  {
    id: 3,
    name: 'Beatriz Lima',
    role: 'Atendente Pleno',
    avatar: '#28a745',
    calls: 285,
    tickets: 82,
    csat: 4.7,
    tma: '5:45',
    email: 'beatriz.lima@velotax.com'
  },
  {
    id: 4,
    name: 'Daniel Costa',
    role: 'Atendente Júnior',
    avatar: '#ffc107',
    calls: 265,
    tickets: 71,
    csat: 4.5,
    tma: '6:20',
    email: 'daniel.costa@velotax.com'
  },
  {
    id: 5,
    name: 'Fernanda Alves',
    role: 'Atendente Pleno',
    avatar: '#9C27B0',
    calls: 252,
    tickets: 68,
    csat: 4.4,
    tma: '5:50',
    email: 'fernanda.alves@velotax.com'
  },
  {
    id: 6,
    name: 'Gabriel Martins',
    role: 'Atendente Júnior',
    avatar: '#dc3545',
    calls: 240,
    tickets: 65,
    csat: 4.3,
    tma: '6:45',
    email: 'gabriel.martins@velotax.com'
  },
  {
    id: 7,
    name: 'Juliana Rocha',
    role: 'Atendente Sênior',
    avatar: '#FF5722',
    calls: 235,
    tickets: 70,
    csat: 4.6,
    tma: '5:30',
    email: 'juliana.rocha@velotax.com'
  },
  {
    id: 8,
    name: 'Lucas Ferreira',
    role: 'Atendente Pleno',
    avatar: '#00BCD4',
    calls: 228,
    tickets: 63,
    csat: 4.4,
    tma: '6:10',
    email: 'lucas.ferreira@velotax.com'
  },
  {
    id: 9,
    name: 'Mariana Souza',
    role: 'Atendente Júnior',
    avatar: '#E91E63',
    calls: 215,
    tickets: 58,
    csat: 4.2,
    tma: '6:55',
    email: 'mariana.souza@velotax.com'
  },
  {
    id: 10,
    name: 'Pedro Oliveira',
    role: 'Atendente Júnior',
    avatar: '#FF9800',
    calls: 198,
    tickets: 52,
    csat: 4.1,
    tma: '7:15',
    email: 'pedro.oliveira@velotax.com'
  }
];

// ========== AUTHENTICATION ==========
function login(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Simple validation (in production, use real authentication)
  if (email && password) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    showApp();
  }
}

function loginWithGoogle() {
  // Simulate Google login
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userEmail', 'usuario@velotax.com');
  showApp();
}

function logout() {
  if (confirm('Deseja realmente sair?')) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    location.reload();
  }
}

function checkAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn === 'true') {
    showApp();
  }
}

function showApp() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('appContainer').classList.add('active');
  initializeApp();
}

// ========== THEME ==========
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.querySelector('#themeBtn i');
  
  if (body.getAttribute('data-theme') === 'dark') {
    body.removeAttribute('data-theme');
    themeIcon.classList.remove('bx-sun');
    themeIcon.classList.add('bx-moon');
    localStorage.setItem('theme', 'light');
  } else {
    body.setAttribute('data-theme', 'dark');
    themeIcon.classList.remove('bx-moon');
    themeIcon.classList.add('bx-sun');
    localStorage.setItem('theme', 'dark');
  }
  
  // Update all charts
  if (typeof updateAllCharts === 'function') {
    updateAllCharts();
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    const themeIcon = document.querySelector('#themeBtn i');
    if (themeIcon) {
      themeIcon.classList.replace('bx-moon', 'bx-sun');
    }
  }
}

// ========== NAVIGATION ==========
function showView(viewName) {
  // Remove active from all views and tabs
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  
  // Add active to selected view and tab
  document.getElementById(`view-${viewName}`).classList.add('active');
  event.target.closest('.nav-tab').classList.add('active');

  // Load specific content if needed
  if (viewName === '55pbx') {
    load55pbxContent();
  } else if (viewName === 'octadesk') {
    loadOctadeskContent();
  }
}

// ========== RANKING ==========
function renderRanking() {
  const rankingList = document.getElementById('rankingList');
  if (!rankingList) return;

  // Sort operators by total performance (calls + tickets)
  const sortedOperators = [...operatorsData].sort((a, b) => {
    const scoreA = a.calls + a.tickets * 2; // Tickets worth more
    const scoreB = b.calls + b.tickets * 2;
    return scoreB - scoreA;
  });

  rankingList.innerHTML = sortedOperators.map((op, index) => {
    const rank = index + 1;
    const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';
    
    return `
      <div class="operator-row" onclick="showOperatorDetail(${op.id})">
        <div class="rank-number ${rankClass}">${rank}</div>
        <div class="operator-avatar" style="background-color: ${op.avatar};">
          ${op.name.charAt(0).toUpperCase()}
        </div>
        <div class="operator-info">
          <div class="operator-name">${op.name}</div>
          <div class="operator-role">${op.role}</div>
        </div>
        <div class="operator-stats">
          <div class="stat-item">
            <div class="stat-value">${op.calls}</div>
            <div class="stat-label">Chamadas</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${op.tickets}</div>
            <div class="stat-label">Tickets</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${op.csat}</div>
            <div class="stat-label">CSAT</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderOperatorsList() {
  const operatorsList = document.getElementById('operatorsList');
  if (!operatorsList) return;

  operatorsList.innerHTML = operatorsData.map(op => `
    <div class="operator-row" onclick="showOperatorDetail(${op.id})">
      <div class="operator-avatar" style="background-color: ${op.avatar};">
        ${op.name.charAt(0).toUpperCase()}
      </div>
      <div class="operator-info">
        <div class="operator-name">${op.name}</div>
        <div class="operator-role">${op.role} - ${op.email}</div>
      </div>
      <div class="operator-stats">
        <div class="stat-item">
          <div class="stat-value">${op.calls}</div>
          <div class="stat-label">Chamadas</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${op.tickets}</div>
          <div class="stat-label">Tickets</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${op.csat}</div>
          <div class="stat-label">CSAT</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${op.tma}</div>
          <div class="stat-label">TMA</div>
        </div>
      </div>
    </div>
  `).join('');
}

function showOperatorDetail(operatorId) {
  const operator = operatorsData.find(op => op.id === operatorId);
  if (!operator) return;

  // Save operator data to localStorage for the detail page
  localStorage.setItem('selectedOperator', JSON.stringify(operator));
  
  // Open detail page
  window.open('operator-detail.html', '_blank');
}

// ========== MODALS ==========
function openPeriodModal() {
  document.getElementById('periodModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePeriodModal() {
  document.getElementById('periodModal').classList.remove('active');
  document.body.style.overflow = '';
}

function selectPeriod(periodId, periodLabel) {
  // Remove selected class from all options
  document.querySelectorAll('.period-option').forEach(opt => {
    opt.classList.remove('selected');
  });

  // Add selected class to clicked option
  event.currentTarget.classList.add('selected');

  // Update header
  document.getElementById('currentPeriod').textContent = periodLabel;

  // Close modal after selection
  setTimeout(() => {
    closePeriodModal();
    // Here you would reload data based on the selected period
    console.log('Period changed to:', periodId);
  }, 300);
}

function openExportModal() {
  document.getElementById('exportModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeExportModal() {
  document.getElementById('exportModal').classList.remove('active');
  document.body.style.overflow = '';
}

function exportReport(format) {
  exportReportImproved(format);
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ========== CHARTS ==========
function initDashboardChart() {
  const ctx = document.getElementById('chart-dashboard-performance');
  if (!ctx) return;

  const colors = getChartColors();

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Chamadas',
          data: [420, 380, 450, 390, 470, 280, 180],
          backgroundColor: colors.primary + '90',
          borderColor: colors.primary,
          borderWidth: 2,
          borderRadius: 8
        },
        {
          label: 'Tickets',
          data: [285, 310, 295, 325, 340, 180, 95],
          backgroundColor: colors.success + '90',
          borderColor: colors.success,
          borderWidth: 2,
          borderRadius: 8
        }
      ]
    },
    options: getDefaultChartConfig()
  });
}

// ========== LOAD CONTENT FROM OTHER FILES ==========
function load55pbxContent() {
  const container = document.getElementById('pbx-content');
  if (!container || container.innerHTML) return;

  container.innerHTML = `
    <div class="section-title" style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px;">
      <i class='bx bxs-phone' style="font-size: 32px; color: var(--brand-primary);"></i>
      <h2 style="font-size: 28px; font-weight: 600;">55pbx - Sistema de Telefonia</h2>
    </div>

    <div class="indicators-grid" style="margin-bottom: 30px;">
      <div class="indicator-card">
        <i class='bx bx-phone-call indicator-icon'></i>
        <div class="indicator-label">Total de Chamadas</div>
        <div class="indicator-value">2,847</div>
      </div>
      <div class="indicator-card">
        <i class='bx bx-time-five indicator-icon'></i>
        <div class="indicator-label">TMA Geral</div>
        <div class="indicator-value">5:32</div>
      </div>
      <div class="indicator-card">
        <i class='bx bx-check-circle indicator-icon'></i>
        <div class="indicator-label">Taxa de Atendimento</div>
        <div class="indicator-value">87%</div>
      </div>
      <div class="indicator-card">
        <i class='bx bx-coffee indicator-icon'></i>
        <div class="indicator-label">Tempo em Pausa</div>
        <div class="indicator-value">2:15</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Volume Histórico Geral</h3>
        <i class='bx bx-trending-up' style="font-size: 24px; color: var(--brand-primary);"></i>
      </div>
      <div class="chart-container">
        <canvas id="chart-55pbx-volume-geral"></canvas>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">CSAT - Satisfação do Cliente</h3>
        <i class='bx bx-star' style="font-size: 24px; color: var(--brand-primary);"></i>
      </div>
      <div class="chart-container">
        <canvas id="chart-55pbx-csat"></canvas>
      </div>
    </div>

    <div class="charts-grid">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Volume por Produto URA</h3>
          <i class='bx bx-line-chart' style="font-size: 24px; color: var(--brand-primary);"></i>
        </div>
        <div class="chart-container">
          <canvas id="chart-55pbx-volume-produto"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Volume por Hora</h3>
          <i class='bx bx-bar-chart-alt-2' style="font-size: 24px; color: var(--brand-primary);"></i>
        </div>
        <div class="chart-container">
          <canvas id="chart-55pbx-volume-hora"></canvas>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">TMA por Produto</h3>
        <i class='bx bx-time' style="font-size: 24px; color: var(--brand-primary);"></i>
      </div>
      <div class="chart-container">
        <canvas id="chart-55pbx-tma-produto"></canvas>
      </div>
    </div>

    <div class="charts-grid">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Tempo de Pausa Geral</h3>
          <i class='bx bx-coffee' style="font-size: 24px; color: var(--brand-primary);"></i>
        </div>
        <div class="chart-container">
          <canvas id="chart-55pbx-pausa-geral"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Pausa por Motivo</h3>
          <i class='bx bx-list-ul' style="font-size: 24px; color: var(--brand-primary);"></i>
        </div>
        <div class="chart-container">
          <canvas id="chart-55pbx-pausa-motivo"></canvas>
        </div>
      </div>
    </div>
  `;

  // Initialize charts if function exists
  if (typeof init55pbxVolumeGeral === 'function') {
    init55pbxVolumeGeral();
    init55pbxCSAT();
    init55pbxVolumeProduto();
    init55pbxVolumeHora();
    init55pbxTMAProduto();
    init55pbxPausaGeral();
    init55pbxPausaMotivo();
  }
}

function loadOctadeskContent() {
  const container = document.getElementById('octadesk-content');
  if (!container || container.innerHTML) return;

  container.innerHTML = `
    <div class="section-title" style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px;">
      <i class='bx bxs-message-square-detail' style="font-size: 32px; color: var(--brand-primary);"></i>
      <h2 style="font-size: 28px; font-weight: 600;">Octadesk - Sistema de Tickets</h2>
    </div>

    <div class="indicators-grid" style="margin-bottom: 30px;">
      <div class="indicator-card">
        <i class='bx bx-message-detail indicator-icon'></i>
        <div class="indicator-label">Total de Tickets</div>
        <div class="indicator-value">1,523</div>
      </div>
      <div class="indicator-card">
        <i class='bx bx-time-five indicator-icon'></i>
        <div class="indicator-label">Tempo Médio Resolução</div>
        <div class="indicator-value">4:20</div>
      </div>
      <div class="indicator-card">
        <i class='bx bx-check-circle indicator-icon'></i>
        <div class="indicator-label">Taxa de Resolução</div>
        <div class="indicator-value">92%</div>
      </div>
      <div class="indicator-card">
        <i class='bx bx-coffee indicator-icon'></i>
        <div class="indicator-label">Tempo em Pausa</div>
        <div class="indicator-value">1:45</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Volume Histórico Geral</h3>
        <i class='bx bx-trending-up' style="font-size: 24px; color: var(--brand-primary);"></i>
      </div>
      <div class="chart-container">
        <canvas id="chart-octadesk-volume-geral"></canvas>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">CSAT - Satisfação do Cliente</h3>
        <i class='bx bx-star' style="font-size: 24px; color: var(--brand-primary);"></i>
      </div>
      <div class="chart-container">
        <canvas id="chart-octadesk-csat"></canvas>
      </div>
    </div>

    <div class="charts-grid">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Volume por Assunto</h3>
          <i class='bx bx-line-chart' style="font-size: 24px; color: var(--brand-primary);"></i>
        </div>
        <div class="chart-container">
          <canvas id="chart-octadesk-volume-assunto"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Volume por Hora</h3>
          <i class='bx bx-bar-chart-alt-2' style="font-size: 24px; color: var(--brand-primary);"></i>
        </div>
        <div class="chart-container">
          <canvas id="chart-octadesk-volume-hora"></canvas>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Tempo de Abertura até Fechamento</h3>
        <i class='bx bx-time' style="font-size: 24px; color: var(--brand-primary);"></i>
      </div>
      <div class="chart-container">
        <canvas id="chart-octadesk-tempo-resolucao"></canvas>
      </div>
    </div>

    <div class="charts-grid">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Tempo de Pausa Geral</h3>
          <i class='bx bx-coffee' style="font-size: 24px; color: var(--brand-primary);"></i>
        </div>
        <div class="chart-container">
          <canvas id="chart-octadesk-pausa-geral"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Pausa por Motivo</h3>
          <i class='bx bx-list-ul' style="font-size: 24px; color: var(--brand-primary);"></i>
        </div>
        <div class="chart-container">
          <canvas id="chart-octadesk-pausa-motivo"></canvas>
        </div>
      </div>
    </div>
  `;

  // Initialize charts if function exists
  if (typeof initOctadeskVolumeGeral === 'function') {
    initOctadeskVolumeGeral();
    initOctadeskCSAT();
    initOctadeskVolumeAssunto();
    initOctadeskVolumeHora();
    initOctadeskTempoResolucao();
    initOctadeskPausaGeral();
    initOctadeskPausaMotivo();
  }
}

// ========== INITIALIZATION ==========
function initializeApp() {
  renderRanking();
  renderOperatorsList();
  initDashboardChart();
  loadTheme();
  
  // Add search functionality after rendering operators list
  setTimeout(() => {
    setupSearch();
  }, 100);
}

// ========== NOTIFICATIONS ==========
function showNotification(message, type = 'info') {
  const colors = {
    success: 'var(--success-color)',
    error: 'var(--danger-color)',
    warning: 'var(--warning-color)',
    info: 'var(--brand-primary)'
  };

  const icons = {
    success: 'bx-check-circle',
    error: 'bx-error-circle',
    warning: 'bx-error',
    info: 'bx-info-circle'
  };

  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 15px 25px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: Poppins, sans-serif;
    animation: slideIn 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 300px;
    max-width: 500px;
  `;
  
  notification.innerHTML = `
    <i class='bx ${icons[type] || icons.info}' style='font-size: 24px;'></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ========== AUTO REFRESH ==========
let autoRefreshInterval = null;

function startAutoRefresh() {
  // Refresh data every 30 seconds
  autoRefreshInterval = setInterval(() => {
    console.log('Auto-refreshing data...');
    // In production, fetch new data from API
    showNotification('Dados atualizados automaticamente', 'success');
  }, 30000);
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

// ========== SEARCH FUNCTIONALITY ==========
function setupSearch() {
  const operatorsList = document.getElementById('operatorsList');
  if (!operatorsList) return;

  // Create search bar
  const searchContainer = document.createElement('div');
  searchContainer.style.cssText = `
    margin-bottom: 20px;
    display: flex;
    gap: 15px;
  `;

  searchContainer.innerHTML = `
    <div style="flex: 1; position: relative;">
      <input 
        type="text" 
        id="operatorSearch" 
        placeholder="Buscar atendente..."
        style="
          width: 100%;
          padding: 12px 15px 12px 45px;
          border: 2px solid var(--border-color);
          border-radius: 12px;
          font-family: Poppins, sans-serif;
          font-size: 14px;
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        "
      />
      <i class='bx bx-search' style="
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 20px;
        color: var(--text-muted);
      "></i>
    </div>
    <select 
      id="roleFilter"
      style="
        padding: 12px 15px;
        border: 2px solid var(--border-color);
        border-radius: 12px;
        font-family: Poppins, sans-serif;
        font-size: 14px;
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        cursor: pointer;
      "
    >
      <option value="">Todos os Cargos</option>
      <option value="Supervisora">Supervisora</option>
      <option value="Atendente Sênior">Sênior</option>
      <option value="Atendente Pleno">Pleno</option>
      <option value="Atendente Júnior">Júnior</option>
    </select>
  `;

  operatorsList.parentElement.insertBefore(searchContainer, operatorsList);

  // Add event listeners
  document.getElementById('operatorSearch').addEventListener('input', filterOperators);
  document.getElementById('roleFilter').addEventListener('change', filterOperators);
}

function filterOperators() {
  const searchTerm = document.getElementById('operatorSearch')?.value.toLowerCase() || '';
  const roleFilter = document.getElementById('roleFilter')?.value || '';

  const filtered = operatorsData.filter(op => {
    const matchesSearch = op.name.toLowerCase().includes(searchTerm) || 
                         op.email.toLowerCase().includes(searchTerm);
    const matchesRole = !roleFilter || op.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  renderFilteredOperators(filtered);
}

function renderFilteredOperators(operators) {
  const operatorsList = document.getElementById('operatorsList');
  if (!operatorsList) return;

  if (operators.length === 0) {
    operatorsList.innerHTML = `
      <div style="
        text-align: center;
        padding: 40px;
        color: var(--text-muted);
      ">
        <i class='bx bx-search' style='font-size: 48px; margin-bottom: 15px;'></i>
        <p>Nenhum atendente encontrado</p>
      </div>
    `;
    return;
  }

  operatorsList.innerHTML = operators.map(op => `
    <div class="operator-row" onclick="showOperatorDetail(${op.id})">
      <div class="operator-avatar" style="background-color: ${op.avatar};">
        ${op.name.charAt(0).toUpperCase()}
      </div>
      <div class="operator-info">
        <div class="operator-name">${op.name}</div>
        <div class="operator-role">${op.role} - ${op.email}</div>
      </div>
      <div class="operator-stats">
        <div class="stat-item">
          <div class="stat-value">${op.calls}</div>
          <div class="stat-label">Chamadas</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${op.tickets}</div>
          <div class="stat-label">Tickets</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${op.csat}</div>
          <div class="stat-label">CSAT</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${op.tma}</div>
          <div class="stat-label">TMA</div>
        </div>
      </div>
    </div>
  `).join('');
}

// ========== KEYBOARD SHORTCUTS ==========
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('operatorSearch');
      if (searchInput) searchInput.focus();
    }

    // Ctrl/Cmd + E: Export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      openExportModal();
    }

    // Ctrl/Cmd + P: Period
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      openPeriodModal();
    }

    // Ctrl/Cmd + T: Toggle Theme
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      toggleTheme();
    }

    // ESC: Close modals
    if (e.key === 'Escape') {
      closePeriodModal();
      closeExportModal();
    }
  });
}

// ========== IMPROVED EXPORT ==========
function exportReportImproved(format) {
  closeExportModal();
  
  const formatNames = {
    pdf: 'PDF',
    excel: 'Excel',
    csv: 'CSV'
  };

  // Show loading notification
  showNotification(`Preparando exportação em ${formatNames[format]}...`, 'info');

  // Simulate export with progress
  setTimeout(() => {
    // Create mock data for export
    const exportData = {
      period: document.getElementById('currentPeriod').textContent,
      generated: new Date().toLocaleString('pt-BR'),
      operators: operatorsData,
      summary: {
        totalCalls: 2847,
        totalTickets: 1523,
        avgCSAT: 4.6,
        avgTMA: '5:32'
      }
    };

    console.log('Export data:', exportData);

    // In production, send to backend for actual export
    // fetch('/api/export', { method: 'POST', body: JSON.stringify(exportData) })

    showNotification(`Relatório exportado com sucesso em ${formatNames[format]}!`, 'success');
    
    // Simulate file download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veloinsights-relatorio-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1500);
}

// ========== DOM READY ==========
window.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadTheme();
  setupKeyboardShortcuts();

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Show welcome notification after login
  if (localStorage.getItem('isLoggedIn') === 'true') {
    setTimeout(() => {
      showNotification('Bem-vindo ao VeloInsights! 🚀', 'success');
    }, 500);
  }
});

