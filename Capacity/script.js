// Sistema de Dimensionamento de Call Center - Velotax Capacity
// Versão para 2 arquivos: Dias Úteis (Segunda à Sexta) e Sábado
// ÚLTIMA ATUALIZAÇÃO: 2024-12-19 - CORREÇÃO DEFINITIVA HCs

// Configuração da senha de acesso
const SYSTEM_PASSWORD = 'velotax2024';

// Variáveis globais para armazenar os dados dos arquivos
let weekdaysData = null;
let saturdayData = null;

// Função para verificar se o usuário está autenticado
function isAuthenticated() {
    return sessionStorage.getItem('authenticated') === 'true';
}

// Função para autenticar o usuário
function authenticate(password) {
    if (password === SYSTEM_PASSWORD) {
        sessionStorage.setItem('authenticated', 'true');
        return true;
    }
    return false;
}

// Função para fazer logout
function logout() {
    sessionStorage.removeItem('authenticated');
    showLoginScreen();
}

// Função para mostrar a tela de login
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainInterface').style.display = 'none';
    document.getElementById('passwordInput').value = '';
    document.getElementById('loginError').style.display = 'none';
}

// Função para mostrar a interface principal
function showMainInterface() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainInterface').style.display = 'block';
}

// Função para mostrar mensagem de erro de login
function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Função para mostrar mensagem de sucesso
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(72, 187, 120, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Adicionar animação CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    // Remover após 3 segundos
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease-in';
        successDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 300);
    }, 3000);
}

// Função para mostrar mensagem de erro
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(245, 101, 101, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
    `;
    
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Remover após 5 segundos
    setTimeout(() => {
        errorDiv.style.animation = 'slideOutRight 0.3s ease-in';
        errorDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 300);
    }, 5000);
}

// Função para formatar horário (converte decimal para HH:MM)
function formatTime(timeString) {
    const timeValue = parseFloat(timeString);
    if (!isNaN(timeValue)) {
        if (timeValue >= 0 && timeValue < 1) { // Fração de um dia
            const totalMinutes = Math.round(timeValue * 24 * 60);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            console.log(`✅ Convertido decimal ${timeValue} para horário: "${formattedTime}"`);
            return formattedTime;
        } else if (timeValue >= 0 && timeValue <= 23) { // Hora inteira
            const formattedTime = `${Math.floor(timeValue).toString().padStart(2, '0')}:00`;
            console.log(`✅ Convertido hora ${timeValue} para horário: "${formattedTime}"`);
            return formattedTime;
        }
    }
    console.log(`✅ Retornando valor original: "${timeString}"`);
    return timeString.toString().trim();
}

// Função para verificar se é uma linha de cabeçalho
function isHeaderRow(row) {
    const firstCell = row[0]?.toString().toLowerCase().trim();
    const secondCell = row[1]?.toString().toLowerCase().trim();
    
    return firstCell === 'intervalo de ligações' || 
           firstCell === 'intervalo de ligacoes' ||
           firstCell === 'intervalo' ||
           firstCell === 'hora' ||
           firstCell === 'horario' ||
           secondCell === 'quantidade' ||
           secondCell === 'quantidade média' ||
           secondCell === 'quantidade media' ||
           secondCell === 'volume' ||
           secondCell === 'ligações' ||
           secondCell === 'ligacoes';
}

// Função para processar dados no novo formato
function processNewFormatData(fileContent) {
    const lines = fileContent.split('\n');
    const data = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(',').map(col => col.trim());
        
        // Pular linha de cabeçalho
        if (i === 0 || isHeaderRow(columns)) {
            console.log(`⏭️ Pulando linha de cabeçalho: "${line}"`);
            continue;
        }
        
        if (columns.length >= 2) {
            const intervalo = columns[0];
            const quantidade = parseFloat(columns[1]);
            
            if (!isNaN(quantidade) && quantidade > 0) {
                data.push({
                    intervalo: formatTime(intervalo),
                    quantidade: quantidade
                });
                console.log(`✅ Dados processados: ${intervalo} -> ${formatTime(intervalo)}, ${quantidade}`);
            } else {
                console.log(`⚠️ Quantidade inválida na linha ${i + 1}: "${columns[1]}"`);
            }
        } else {
            console.log(`⚠️ Linha ${i + 1} com formato inválido: "${line}"`);
        }
    }
    
    console.log(`📊 Total de registros processados: ${data.length}`);
    return data;
}

// Função para processar dados de arquivos Excel (XLS, XLSX)
function processExcelData(jsonData) {
    const data = [];
    
    console.log('📊 Dados brutos do Excel recebidos:', jsonData);
    console.log('📊 Número de linhas:', jsonData.length);
    
    // Pular cabeçalho se existir
    const startRow = isHeaderRow(jsonData[0]) ? 1 : 0;
    console.log('🚀 Primeira linha de dados (índice):', startRow);
    
    for (let i = startRow; i < jsonData.length; i++) {
        const row = jsonData[i];
        console.log(`📝 Processando linha ${i}:`, row);
        
        if (row && row.length >= 2 && row[0] !== null && row[0] !== undefined && row[1] !== null && row[1] !== undefined) {
            const intervalo = row[0].toString().trim();
            const quantidade = parseFloat(row[1]);
            
            console.log(`🔍 Intervalo: "${intervalo}" (tipo: ${typeof intervalo})`);
            console.log(`🔍 Quantidade: ${quantidade}`);
            
            if (!isNaN(quantidade) && quantidade > 0 && intervalo !== '') {
                const processedItem = {
                    intervalo: formatTime(intervalo),
                    quantidade: quantidade
                };
                data.push(processedItem);
                console.log(`✅ Dados processados adicionados:`, processedItem);
            } else {
                console.log(`❌ Linha ${i} ignorada - dados inválidos`);
            }
        } else {
            console.log(`❌ Linha ${i} ignorada - estrutura inválida`);
        }
    }
    
    console.log('🎯 Total de dados processados do Excel:', data.length);
    return data;
}

// Função para calcular HCs necessários para um volume específico - CORREÇÃO DEFINITIVA + MARGEM DE SEGURANÇA
function calculateHCsForVolume(quantidade, isSaturday = false) {
    console.log(`🔧 Calculando HCs para quantidade: ${quantidade}, Sábado: ${isSaturday}`);
    
    // DEFINIÇÃO CORRETA DOS PARÂMETROS DO SISTEMA
    let capacidadePorHora, capacidadeSegura;
    
    if (isSaturday) {
        // Parâmetros para Sábado (conforme interface)
        capacidadePorHora = 11; // 11 ligações por hora por HC (Sábado)
        capacidadeSegura = 8.25; // 75% de 11 = 8.25 ligações por hora por HC
    } else {
        // Parâmetros para Dias Úteis (conforme interface)
        capacidadePorHora = 15; // 15 ligações por hora por HC (Dias Úteis)
        capacidadeSegura = 11.25; // 75% de 15 = 11.25 ligações por hora por HC
    }
    
    console.log(`📅 PARÂMETROS CORRETOS DO SISTEMA:`);
    console.log(`   Capacidade por HC: ${capacidadePorHora} ligações/hora`);
    console.log(`   Capacidade Segura: ${capacidadeSegura} ligações/hora`);
    
    // Volume por intervalo (1 hora)
    const volumePorIntervalo = quantidade;
    console.log(`📈 Volume por intervalo (1h): ${volumePorIntervalo} ligações`);
    
    // CÁLCULO BASE: Volume / Capacidade Segura por Hora
    let hcsBase = Math.ceil(volumePorIntervalo / capacidadeSegura);
    console.log(`🧮 HCs base calculados: ${hcsBase}`);
    console.log(`   Fórmula base: Math.ceil(${volumePorIntervalo} / ${capacidadeSegura}) = Math.ceil(${(volumePorIntervalo / capacidadeSegura).toFixed(2)}) = ${hcsBase}`);
    
    // MARGEM DE SEGURANÇA ADICIONAL para tempo de espera < 10 segundos
    // Aplicar fator de segurança de 1.3 (30% adicional) para garantir baixo tempo de espera
    const fatorSeguranca = 1.3;
    let hcs = Math.ceil(hcsBase * fatorSeguranca);
    
    console.log(`🛡️ MARGEM DE SEGURANÇA APLICADA:`);
    console.log(`   HCs base: ${hcsBase}`);
    console.log(`   Fator de segurança: ${fatorSeguranca} (30% adicional)`);
    console.log(`   HCs com margem: Math.ceil(${hcsBase} × ${fatorSeguranca}) = Math.ceil(${(hcsBase * fatorSeguranca).toFixed(2)}) = ${hcs}`);
    
    // Garantir pelo menos 1 HC
    hcs = Math.max(1, hcs);
    console.log(`✅ HCs finais necessários: ${hcs}`);
    
    // Capacidade efetiva por HC por dia (para uso posterior)
    const capacidadeEfetivaPorDia = capacidadePorHora * (isSaturday ? 5.5 : 7.5);
    
    const result = {
        hcs: hcs,
        capacidadePorHora: capacidadePorHora,
        capacidadeEfetiva: capacidadeEfetivaPorDia,
        intensidadeEfetiva: volumePorIntervalo,
        capacidadeSegura: capacidadeSegura,
        horasEfetivas: isSaturday ? 5.5 : 7.5,
        fatorSeguranca: fatorSeguranca,
        hcsBase: hcsBase
    };
    
    console.log(`📋 Resultado completo:`, result);
    return result;
}

// Função para calcular utilização - ATUALIZADA para margem de segurança
function calculateUtilization(quantidade, hcs, isSaturday = false) {
    let capacidadePorHora;
    
    if (isSaturday) {
        capacidadePorHora = 11; // 11 ligações por hora por HC (Sábado)
    } else {
        capacidadePorHora = 15; // 15 ligações por hora por HC (Dias Úteis)
    }
    
    // Capacidade total disponível por intervalo (1 hora)
    const capacidadeTotalPorIntervalo = capacidadePorHora * hcs;
    
    // Utilização real por intervalo (1 hora)
    const utilizacaoReal = (quantidade / capacidadeTotalPorIntervalo) * 100;
    
    console.log(`📊 Cálculo de utilização (com margem de segurança):`);
    console.log(`   Quantidade: ${quantidade} ligações`);
    console.log(`   HCs: ${hcs} (inclui margem de segurança)`);
    console.log(`   Capacidade por HC/hora: ${capacidadePorHora} ligações/hora`);
    console.log(`   Capacidade total: ${capacidadeTotalPorIntervalo} ligações/hora`);
    console.log(`   Utilização: ${utilizacaoReal.toFixed(1)}%`);
    
    // Com a margem de segurança, a utilização deve estar sempre bem abaixo de 100%
    return Math.min(100, Math.max(0, utilizacaoReal));
}

// Função para determinar status baseado na utilização
function determineStatus(utilizacao) {
    if (utilizacao <= 70) {
        return { status: 'Saudável', classe: 'status-saudavel' };
    } else if (utilizacao <= 85) {
        return { status: 'Atenção', classe: 'status-atencao' };
    } else {
        return { status: 'Crítico', classe: 'status-critico' };
    }
}

// Função para processar ambos os arquivos
function processBothFiles() {
    if (!weekdaysData || !saturdayData) {
        showError('Por favor, faça upload de ambos os arquivos antes de processar.');
        return;
    }
    
    console.log('🚀 Iniciando processamento de ambos os arquivos...');
    
    // Processar dados dos dias úteis
    const resultsWeekdays = calculateNewDimensioning(weekdaysData, false);
    
    // Processar dados do sábado
    const resultsSaturday = calculateNewDimensioning(saturdayData, true);
    
    // Exibir resultados combinados
    displayCombinedResults(resultsWeekdays, resultsSaturday);
}

// Função para calcular dimensionamento
function calculateNewDimensioning(data, isSaturday = false) {
    console.log(`📊 Iniciando cálculo de dimensionamento para ${isSaturday ? 'Sábado' : 'Dias Úteis'}`);
    console.log(`📊 Dados recebidos:`, data);
    
    const results = [];
    let totalHCs = 0;
    let totalUtilizacao = 0;
    
    data.forEach((item, index) => {
        console.log(`🔍 Processando item ${index + 1}:`, item);
        
        const hcResult = calculateHCsForVolume(item.quantidade, isSaturday);
        console.log(`✅ Resultado HCs para item ${index + 1}:`, hcResult);
        
        const utilizacao = calculateUtilization(item.quantidade, hcResult.hcs, isSaturday);
        console.log(`📊 Utilização calculada para item ${index + 1}: ${utilizacao.toFixed(1)}%`);
        
        const status = determineStatus(utilizacao);
        console.log(`🏷️ Status determinado para item ${index + 1}:`, status);
        
        const resultItem = {
            intervalo: item.intervalo,
            quantidade: item.quantidade,
            hcs: hcResult.hcs,
            utilizacao: utilizacao,
            status: status.status,
            classe: status.classe,
            capacidadePorHora: hcResult.capacidadePorHora,
            capacidadeEfetiva: hcResult.capacidadeEfetiva,
            intensidadeEfetiva: hcResult.intensidadeEfetiva,
            capacidadeSegura: hcResult.capacidadeSegura
        };
        
        console.log(`📋 Item final processado:`, resultItem);
        results.push(resultItem);
        
        totalHCs += hcResult.hcs;
        totalUtilizacao += utilizacao;
    });
    
    const averageUtilization = results.length > 0 ? totalUtilizacao / results.length : 0;
    console.log(`📊 Total de HCs calculados: ${totalHCs}`);
    console.log(`📊 Utilização Média: ${averageUtilization.toFixed(1)}%`);
    console.log(`📊 Resultados finais:`, results);
    
    return {
        results: results,
        totalHCs: totalHCs,
        utilizacaoMedia: averageUtilization,
        isSaturday: isSaturday
    };
}

// Função para criar seção de tabela
function createNewTableSection(data, title, isSaturday) {
    console.log(`🏗️ Criando tabela para: ${title}`);
    console.log(`🏗️ Dados recebidos para tabela:`, data);
    console.log(`🏗️ É sábado? ${isSaturday}`);
    
    const section = document.createElement('div');
    section.className = 'table-section';
    
    const h3 = document.createElement('h3');
    h3.textContent = title;
    section.appendChild(h3);
    
    const table = document.createElement('table');
    
    // Cabeçalho da tabela
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = [
        'Intervalo de Ligações',
        'Quantidade Média',
        'HCs Necessários',
        'Utilização (% da capacidade)',
        'Status'
    ];
    
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Corpo da tabela
    const tbody = document.createElement('tbody');
    
    data.forEach((item, index) => {
        console.log(`📋 Criando linha ${index + 1} da tabela:`, item);
        
        const row = document.createElement('tr');
        
        const cells = [
            item.intervalo,
            Math.round(item.quantidade),
            item.hcs,
            item.utilizacao.toFixed(1) + '%',
            `<span class="${item.classe}">${item.status}</span>`
        ];
        
        console.log(`📊 Células da linha ${index + 1}:`, cells);
        
        cells.forEach((cellContent, cellIndex) => {
            const td = document.createElement('td');
            td.innerHTML = cellContent;
            row.appendChild(td);
            console.log(`✅ Célula ${cellIndex + 1} criada com conteúdo: "${cellContent}"`);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    section.appendChild(table);
    
    console.log(`✅ Tabela criada com sucesso para: ${title}`);
    return section;
}

// Função para exibir resultados combinados
function displayCombinedResults(resultsWeekdays, resultsSaturday) {
    const container = document.getElementById('results-container');
    container.innerHTML = '';
    
    // Estatísticas dos dias úteis
    const weekdaysStats = document.createElement('div');
    weekdaysStats.className = 'summary-stats';
    weekdaysStats.innerHTML = `
        <div class="stat">
            <div class="stat-value">${resultsWeekdays.utilizacaoMedia.toFixed(1)}%</div>
            <div class="stat-label">Utilização Média - Dias Úteis</div>
        </div>
    `;
    
    // Estatísticas do sábado
    const saturdayStats = document.createElement('div');
    saturdayStats.className = 'summary-stats';
    saturdayStats.innerHTML = `
        <div class="stat">
            <div class="stat-value">${resultsSaturday.utilizacaoMedia.toFixed(1)}%</div>
            <div class="stat-label">Utilização Média - Sábado</div>
        </div>
    `;
    
    container.appendChild(weekdaysStats);
    container.appendChild(saturdayStats);
    
    // Tabela dos dias úteis
    const weekdaysTable = createNewTableSection(
        resultsWeekdays.results, 
        '📅 Dimensionamento por Intervalo - Dias Úteis (Segunda à Sexta)',
        false
    );
    container.appendChild(weekdaysTable);
    
    // Tabela do sábado
    const saturdayTable = createNewTableSection(
        resultsSaturday.results, 
        '📅 Dimensionamento por Intervalo - Sábado',
        true
    );
    container.appendChild(saturdayTable);
    
    // Mostrar seção de exportação
    const exportSection = document.getElementById('exportSection');
    exportSection.style.display = 'block';
    
    container.style.display = 'block';
    
    console.log('✅ Resultados exibidos com sucesso');
}

// Função para exportar para Excel
function exportToExcel() {
    try {
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer || resultsContainer.children.length === 0) {
            showError('Nenhum resultado disponível para exportar');
            return;
        }
        
        const wb = XLSX.utils.book();
        
        // Extrair dados da tabela de Dias Úteis
        const weekdaysData = [];
        const weekdaysTable = document.querySelector('.table-section:first-child tbody');
        if (weekdaysTable) {
            const rows = weekdaysTable.querySelectorAll('tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 5) {
                    weekdaysData.push({
                        'Intervalo de Ligações': cells[0].textContent,
                        'Quantidade Média': cells[1].textContent,
                        'HCs Necessários': cells[2].textContent,
                        'Utilização (%)': cells[3].textContent,
                        'Status': cells[4].textContent
                    });
                }
            });
        }
        
        // Extrair dados da tabela de Sábado
        const saturdayData = [];
        const saturdayTable = document.querySelector('.table-section:last-child tbody');
        if (saturdayTable) {
            const rows = saturdayTable.querySelectorAll('tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 5) {
                    saturdayData.push({
                        'Intervalo de Ligações': cells[0].textContent,
                        'Quantidade Média': cells[1].textContent,
                        'HCs Necessários': cells[2].textContent,
                        'Utilização (%)': cells[3].textContent,
                        'Status': cells[4].textContent
                    });
                }
            });
        }
        
        // Criar planilhas e adicionar ao workbook
        if (weekdaysData.length > 0) {
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(weekdaysData), 'Dias Úteis');
        }
        
        if (saturdayData.length > 0) {
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(saturdayData), 'Sábado');
        }
        
        // Extrair e adicionar dados do Resumo
        const summaryData = [];
        const summaryStats = document.querySelectorAll('.summary-stats .stat');
        summaryStats.forEach(stat => {
            const value = stat.querySelector('.stat-value').textContent;
            const label = stat.querySelector('.stat-label').textContent;
            summaryData.push({
                'Métrica': label,
                'Valor': value
            });
        });
        
        if (summaryData.length > 0) {
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'Resumo');
        }
        
        // Gerar nome do arquivo com timestamp
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
        const fileName = `Dimensionamento_CallCenter_${timestamp}.xlsx`;
        
        // Exportar arquivo
        XLSX.writeFile(wb, fileName);
        
        showSuccess('✅ Arquivo Excel exportado com sucesso: ' + fileName);
        
    } catch (error) {
        console.error('Erro ao exportar para Excel:', error);
        showError('Erro ao exportar para Excel: ' + error.message);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário já está autenticado
    if (isAuthenticated()) {
        showMainInterface();
    } else {
        showLoginScreen();
    }
    
    // Event listener para o botão de login
    document.getElementById('loginBtn').addEventListener('click', function() {
        const password = document.getElementById('passwordInput').value;
        
        if (!password) {
            showLoginError('Por favor, digite a senha de acesso.');
            return;
        }
        
        if (authenticate(password)) {
            showMainInterface();
            showSuccess('🔓 Acesso concedido! Bem-vindo ao sistema.');
        } else {
            showLoginError('❌ Senha incorreta. Tente novamente.');
            document.getElementById('passwordInput').value = '';
            document.getElementById('passwordInput').focus();
        }
    });
    
    // Event listener para Enter no campo de senha
    document.getElementById('passwordInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('loginBtn').click();
        }
    });
    
    // Event listener para o botão de logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
        showSuccess('🚪 Logout realizado com sucesso.');
    });
    
    // Event listeners para upload de arquivos
    document.getElementById('fileInputWeekdays').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    if (file.name.toLowerCase().endsWith('.csv')) {
                        // Processar arquivo CSV
                        weekdaysData = processNewFormatData(e.target.result);
                    } else {
                        // Processar arquivo Excel (XLS, XLSX)
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        weekdaysData = processExcelData(jsonData);
                    }
                    
                    document.getElementById('fileInfoWeekdays').textContent = 
                        `✅ Arquivo carregado: ${file.name} (${weekdaysData.length} registros)`;
                    checkFilesReady();
                } catch (error) {
                    showError('Erro ao processar arquivo dos dias úteis: ' + error.message);
                    document.getElementById('fileInfoWeekdays').textContent = 
                        `❌ Erro ao processar arquivo: ${error.message}`;
                }
            };
            
            if (file.name.toLowerCase().endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        }
    });
    
    document.getElementById('fileInputSaturday').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    if (file.name.toLowerCase().endsWith('.csv')) {
                        // Processar arquivo CSV
                        saturdayData = processNewFormatData(e.target.result);
                    } else {
                        // Processar arquivo Excel (XLS, XLSX)
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        saturdayData = processExcelData(jsonData);
                    }
                    
                    document.getElementById('fileInfoSaturday').textContent = 
                        `✅ Arquivo carregado: ${file.name} (${saturdayData.length} registros)`;
                    checkFilesReady();
                } catch (error) {
                    showError('Erro ao processar arquivo do sábado: ' + error.message);
                    document.getElementById('fileInfoSaturday').textContent = 
                        `❌ Erro ao processar arquivo: ${error.message}`;
                }
            };
            
            if (file.name.toLowerCase().endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        }
    });
    
    // Event listener para o botão de processamento
    document.getElementById('processBtn').addEventListener('click', processBothFiles);
    
    // Event listener para o botão de exportação
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
});

// Função para verificar se os arquivos estão prontos
function checkFilesReady() {
    const processBtn = document.getElementById('processBtn');
    const processInfo = document.querySelector('.process-info');
    
    if (weekdaysData && saturdayData) {
        processBtn.disabled = false;
        processInfo.textContent = 'Ambos os arquivos foram carregados. Clique em "Processar Dimensionamento" para continuar.';
    } else {
        processBtn.disabled = true;
        if (weekdaysData || saturdayData) {
            processInfo.textContent = 'Carregue o arquivo restante para habilitar o processamento.';
        } else {
            processInfo.textContent = 'Faça upload dos arquivos para habilitar o processamento.';
        }
    }
}
