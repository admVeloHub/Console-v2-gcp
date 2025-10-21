// Sistema de Dimensionamento de Call Center - Velotax Capacity
// Versão para 2 arquivos: Dias Úteis (Segunda à Sexta) e Sábado
// ÚLTIMA ATUALIZAÇÃO: 2024-12-19 - CORREÇÃO TMA E DEBUG

// Configuração da senha de acesso
const SYSTEM_PASSWORD = 'velotax2024';

console.log('🚀 Script carregado - iniciando configuração...');

// Função para calcular horas efetivas
function calculateHorasEfetivas() {
    const horarioTrabalho = parseFloat(document.getElementById('horarioTrabalho').value) || 10;
    const horarioAlmoco = parseFloat(document.getElementById('horarioAlmoco').value) || 1;
    const outrasPausas = parseFloat(document.getElementById('outrasPausas').value) || 0.5;
    
    const horasEfetivas = horarioTrabalho - horarioAlmoco - outrasPausas;
    document.getElementById('horasEfetivas').textContent = `${horasEfetivas} horas`;
    
    return horasEfetivas;
}

// Função para calcular capacidade por HC (AJUSTADA PARA NÍVEL DE SERVIÇO 70%)
function calculateCapacidadePorHC() {
    const horasEfetivas = calculateHorasEfetivas();
    const tmaSegundos = getTMASegundos();
    
    // FÓRMULA AJUSTADA PARA NÍVEL DE SERVIÇO DE 70%
    // Para nível de serviço de 70% das ligações em até 20 segundos:
    // - Capacidade teórica = 3600 / TMA
    // - Fator de utilização segura = 80% (maior utilização possível com nível de serviço 70%)
    // - Capacidade real = Capacidade teórica × Fator de utilização
    
    const capacidadeTeorica = 3600 / tmaSegundos; // Capacidade teórica máxima
    const fatorUtilizacaoSegura = 0.80; // 80% de utilização para nível de serviço de 70%
    const capacidadePorHC = capacidadeTeorica * fatorUtilizacaoSegura;
    
    console.log(`🔧 Cálculo da Capacidade por HC (Nível de Serviço 70%):`);
    console.log(`   TMA: ${tmaSegundos} segundos`);
    console.log(`   Capacidade teórica: ${capacidadeTeorica.toFixed(2)} ligações/hora`);
    console.log(`   Fator utilização segura: ${fatorUtilizacaoSegura} (80% para nível de serviço 70%)`);
    console.log(`   Capacidade real: ${capacidadePorHC.toFixed(2)} ligações/hora`);
    
    // Verificar se o elemento existe antes de atualizar
    const elementoCapacidadePorHC = document.getElementById('capacidadePorHC');
    if (elementoCapacidadePorHC) {
        elementoCapacidadePorHC.textContent = `${capacidadePorHC.toFixed(1)} ligações/hora`;
    } else {
        console.warn('⚠️ Elemento capacidadePorHC não encontrado');
    }
    
    return capacidadePorHC;
}

// Função para calcular capacidade segura (20% menor)
function calculateCapacidadeSegura() {
    const capacidadePorHC = calculateCapacidadePorHC();
    
    // Capacidade segura = capacidade por HC - 20%
    const capacidadeSegura = capacidadePorHC * 0.8;
    
    // Verificar se o elemento existe antes de atualizar
    const elementoCapacidadeSegura = document.getElementById('capacidadeSegura');
    if (elementoCapacidadeSegura) {
        elementoCapacidadeSegura.textContent = `${capacidadeSegura.toFixed(1)} ligações/hora`;
    } else {
        console.warn('⚠️ Elemento capacidadeSegura não encontrado');
    }
    
    return capacidadeSegura;
}

// ===== FUNÇÕES DE CÁLCULO PARA SÁBADO =====

// Função para calcular horas efetivas do Sábado
function calculateHorasEfetivasSabado() {
    const horarioTrabalho = parseFloat(document.getElementById('horarioTrabalhoSabado').value) || 6;
    const horarioAlmoco = parseFloat(document.getElementById('horarioAlmocoSabado').value) || 0;
    const outrasPausas = parseFloat(document.getElementById('outrasPausasSabado').value) || 30;
    
    const horasEfetivas = horarioTrabalho - horarioAlmoco - (outrasPausas / 60);
    
    const elemento = document.getElementById('horasEfetivasSabado');
    if (elemento) {
        elemento.textContent = horasEfetivas.toFixed(1) + ' horas';
    } else {
        console.warn('⚠️ Elemento horasEfetivasSabado não encontrado');
    }
    
    return horasEfetivas;
}

// Função para calcular capacidade por HC do Sábado
function calculateCapacidadePorHCSabado() {
    const tmaSegundos = getTMASegundos();
    const fatorUtilizacaoSegura = 0.80; // Para nível de serviço de 70%
    
    const capacidadePorHC = (3600 / tmaSegundos) * fatorUtilizacaoSegura;
    
    const elemento = document.getElementById('capacidadePorHCSabado');
    if (elemento) {
        elemento.textContent = capacidadePorHC.toFixed(1) + ' ligações/hora';
    } else {
        console.warn('⚠️ Elemento capacidadePorHCSabado não encontrado');
    }
    
    return capacidadePorHC;
}

// Função para calcular capacidade segura do Sábado
function calculateCapacidadeSeguraSabado() {
    const capacidadePorHC = calculateCapacidadePorHCSabado();
    const capacidadeSegura = capacidadePorHC * 0.8;
    
    const elemento = document.getElementById('capacidadeSeguraSabado');
    if (elemento) {
        elemento.textContent = capacidadeSegura.toFixed(1) + ' ligações/hora';
    } else {
        console.warn('⚠️ Elemento capacidadeSeguraSabado não encontrado');
    }
    
    return capacidadeSegura;
}

// Função para obter TMA em segundos (MELHORADA COM LOGS)
function getTMASegundos() {
    const tmaValueElement = document.getElementById('tmaValue');
    const tmaUnitElement = document.getElementById('tmaUnit');
    
    if (!tmaValueElement || !tmaUnitElement) {
        console.error('❌ Elementos TMA não encontrados!');
        return 300; // Valor padrão de 5 minutos
    }
    
    const tmaValue = parseFloat(tmaValueElement.value) || 5;
    const tmaUnit = tmaUnitElement.value;
    
    let tmaSegundos;
    if (tmaUnit === 'minutos') {
        tmaSegundos = tmaValue * 60;
    } else {
        tmaSegundos = tmaValue;
    }
    
    console.log(`🔧 getTMASegundos():`);
    console.log(`   Valor: ${tmaValue}`);
    console.log(`   Unidade: ${tmaUnit}`);
    console.log(`   Segundos: ${tmaSegundos}`);
    
    return tmaSegundos;
}

// Função para atualizar display do TMA
function updateTMADisplay() {
    const tmaValue = parseFloat(document.getElementById('tmaValue').value) || 5;
    const tmaUnit = document.getElementById('tmaUnit').value;
    const tmaSegundos = getTMASegundos();
    
    let displayText;
    if (tmaUnit === 'minutos') {
        displayText = `${tmaValue} minutos (${tmaSegundos} segundos)`;
    } else {
        displayText = `${tmaValue} segundos (${(tmaValue/60).toFixed(1)} minutos)`;
    }
    
    document.getElementById('tmaDisplay').textContent = displayText;
}

// Função para recalcular todos os valores (MELHORADA)
function recalculateAll() {
    console.log('🔄 Iniciando recálculo de todos os valores...');
    
    try {
        // Atualizar display do TMA
        updateTMADisplay();
        
        // ===== RECÁLCULO PARA DIAS ÚTEIS =====
        // Recalcular capacidade por HC (que também atualiza o display)
        const capacidadePorHC = calculateCapacidadePorHC();
        
        // Recalcular capacidade segura (que também atualiza o display)
        const capacidadeSegura = calculateCapacidadeSegura();
        
        // ===== RECÁLCULO PARA SÁBADO =====
        // Recalcular horas efetivas do Sábado
        const horasEfetivasSabado = calculateHorasEfetivasSabado();
        
        // Recalcular capacidade por HC do Sábado
        const capacidadePorHCSabado = calculateCapacidadePorHCSabado();
        
        // Recalcular capacidade segura do Sábado
        const capacidadeSeguraSabado = calculateCapacidadeSeguraSabado();
        
        console.log('✅ Recálculo concluído:');
        console.log('   📅 DIAS ÚTEIS:');
        console.log(`      Capacidade por HC: ${capacidadePorHC.toFixed(1)} ligações/hora`);
        console.log(`      Capacidade Segura: ${capacidadeSegura.toFixed(1)} ligações/hora`);
        console.log('   📅 SÁBADO:');
        console.log(`      Horas Efetivas: ${horasEfetivasSabado.toFixed(1)} horas`);
        console.log(`      Capacidade por HC: ${capacidadePorHCSabado.toFixed(1)} ligações/hora`);
        console.log(`      Capacidade Segura: ${capacidadeSeguraSabado.toFixed(1)} ligações/hora`);
        
    } catch (error) {
        console.error('❌ Erro durante recálculo:', error);
    }
}

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
    
    // OBTER PARÂMETROS DOS CAMPOS EDITÁVEIS
    let capacidadePorHora, capacidadeSegura;
    
    if (isSaturday) {
        // Parâmetros para Sábado (obtidos dos campos editáveis)
        capacidadePorHora = calculateCapacidadePorHCSabado();
        capacidadeSegura = calculateCapacidadeSeguraSabado();
    } else {
        // Parâmetros para Dias Úteis (obtidos dos campos editáveis)
        capacidadePorHora = calculateCapacidadePorHC();
        capacidadeSegura = calculateCapacidadeSegura();
    }
    
    console.log(`📅 PARÂMETROS CORRETOS DO SISTEMA:`);
    console.log(`   Capacidade por HC: ${capacidadePorHora} ligações/hora`);
    console.log(`   Capacidade Segura: ${capacidadeSegura} ligações/hora`);
    
    // Volume por intervalo (1 hora)
    const volumePorIntervalo = quantidade;
    console.log(`📈 Volume por intervalo (1h): ${volumePorIntervalo} ligações`);
    
    // CÁLCULO BASE: Volume / Capacidade Segura por Hora
    let hcsBaseSegura = Math.ceil(volumePorIntervalo / capacidadeSegura);
    console.log(`🧮 HCs base (Capacidade Segura): ${hcsBaseSegura}`);
    console.log(`   Fórmula: Math.ceil(${volumePorIntervalo} / ${capacidadeSegura}) = Math.ceil(${(volumePorIntervalo / capacidadeSegura).toFixed(2)}) = ${hcsBaseSegura}`);
    
    // CÁLCULO ALTERNATIVO: Volume / Capacidade por HC por Hora
    let hcsBaseCapacidade = Math.ceil(volumePorIntervalo / capacidadePorHora);
    console.log(`🧮 HCs base (Capacidade por HC): ${hcsBaseCapacidade}`);
    console.log(`   Fórmula: Math.ceil(${volumePorIntervalo} / ${capacidadePorHora}) = Math.ceil(${(volumePorIntervalo / capacidadePorHora).toFixed(2)}) = ${hcsBaseCapacidade}`);
    
    // MARGEM DE SEGURANÇA ADICIONAL para tempo de espera < 10 segundos
    // Aplicar fator de segurança de 1.3 (30% adicional) para garantir baixo tempo de espera
    const fatorSeguranca = 1.3;
    let hcsSegura = Math.ceil(hcsBaseSegura * fatorSeguranca);
    let hcsCapacidade = Math.ceil(hcsBaseCapacidade * fatorSeguranca);
    
    console.log(`🛡️ MARGEM DE SEGURANÇA APLICADA:`);
    console.log(`   HCs base (Segura): ${hcsBaseSegura} → ${hcsSegura} (× ${fatorSeguranca})`);
    console.log(`   HCs base (Capacidade): ${hcsBaseCapacidade} → ${hcsCapacidade} (× ${fatorSeguranca})`);
    
    // Garantir pelo menos 1 HC
    hcsSegura = Math.max(1, hcsSegura);
    hcsCapacidade = Math.max(1, hcsCapacidade);
    console.log(`✅ HCs finais necessários:`);
    console.log(`   Capacidade Segura: ${hcsSegura}`);
    console.log(`   Capacidade por HC: ${hcsCapacidade}`);
    
    // Capacidade efetiva por HC por dia (para uso posterior)
    const capacidadeEfetivaPorDia = capacidadePorHora * (isSaturday ? 5.5 : calculateHorasEfetivas());
    
    const result = {
        hcs: hcsSegura, // Manter compatibilidade com código existente (usando capacidade segura)
        hcsSegura: hcsSegura,
        hcsCapacidade: hcsCapacidade,
        capacidadePorHora: capacidadePorHora,
        capacidadeEfetiva: capacidadeEfetivaPorDia,
        intensidadeEfetiva: volumePorIntervalo,
        capacidadeSegura: capacidadeSegura,
        horasEfetivas: isSaturday ? 5.5 : calculateHorasEfetivas(),
        fatorSeguranca: fatorSeguranca,
        hcsBaseSegura: hcsBaseSegura,
        hcsBaseCapacidade: hcsBaseCapacidade
    };
    
    console.log(`📋 Resultado completo:`, result);
    return result;
}

// Função para calcular utilização - ATUALIZADA para margem de segurança
function calculateUtilization(quantidade, hcs, isSaturday = false) {
    let capacidadePorHora;
    
    if (isSaturday) {
        capacidadePorHora = calculateCapacidadePorHCSabado(); // Obtido dos campos editáveis
    } else {
        capacidadePorHora = calculateCapacidadePorHC(); // Obtido dos campos editáveis
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
            hcsCapacidade: hcResult.hcsCapacidade,
            hcsSegura: hcResult.hcsSegura,
            hcsBaseCapacidade: hcResult.hcsBaseCapacidade,
            hcsBaseSegura: hcResult.hcsBaseSegura,
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
        'Capacidade por HC',
        'Capacidade Segura',
        'HCs (Capacidade por HC)',
        'HCs (Capacidade Segura)',
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
        console.log(`🔍 Valores para cálculo:`);
        console.log(`   hcsCapacidade: ${item.hcsCapacidade}`);
        console.log(`   hcsSegura: ${item.hcsSegura}`);
        console.log(`   hcsBaseCapacidade: ${item.hcsBaseCapacidade}`);
        console.log(`   hcsBaseSegura: ${item.hcsBaseSegura}`);
        console.log(`   capacidadePorHora: ${item.capacidadePorHora}`);
        console.log(`   capacidadeSegura: ${item.capacidadeSegura}`);
        
        const row = document.createElement('tr');
        
        const cells = [
            item.intervalo,
            Math.round(item.quantidade),
            item.capacidadePorHora.toFixed(1) + ' lig/h',
            item.capacidadeSegura.toFixed(1) + ' lig/h',
            `${item.hcsCapacidade} HCs<br><small>(${Math.round(item.quantidade)} ÷ ${item.capacidadePorHora.toFixed(1)} = ${item.hcsBaseCapacidade} × 1.3)</small>`,
            `${item.hcsSegura} HCs<br><small>(${Math.round(item.quantidade)} ÷ ${item.capacidadeSegura.toFixed(1)} = ${item.hcsBaseSegura} × 1.3)</small>`,
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
        // Verificar se XLSX está disponível
        if (typeof XLSX === 'undefined') {
            throw new Error('Biblioteca XLSX não está carregada');
        }
        
        console.log('📚 XLSX disponível:', typeof XLSX);
        console.log('📚 XLSX.utils disponível:', typeof XLSX.utils);
        console.log('📚 Métodos disponíveis:', Object.keys(XLSX.utils));
        
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer || resultsContainer.children.length === 0) {
            showError('Nenhum resultado disponível para exportar');
            return;
        }
        
        // Verificar se book_new existe, senão usar book
        let wb;
        try {
            if (typeof XLSX.utils.book_new === 'function') {
                wb = XLSX.utils.book_new();
                console.log('✅ Usando XLSX.utils.book_new()');
            } else if (typeof XLSX.utils.book === 'function') {
                wb = XLSX.utils.book();
                console.log('✅ Usando XLSX.utils.book()');
            } else {
                throw new Error('Função para criar workbook não encontrada');
            }
        } catch (error) {
            console.error('❌ Erro ao criar workbook:', error);
            throw new Error('Erro ao criar workbook: ' + error.message);
        }
        
        // Extrair dados da tabela de Dias Úteis
        const weekdaysData = [];
        const weekdaysTable = document.querySelector('.table-section:first-child tbody');
        if (weekdaysTable) {
            const rows = weekdaysTable.querySelectorAll('tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 8) {
                    weekdaysData.push({
                        'Intervalo de Ligações': cells[0].textContent,
                        'Quantidade Média': cells[1].textContent,
                        'Capacidade por HC': cells[2].textContent,
                        'Capacidade Segura': cells[3].textContent,
                        'HCs (Capacidade por HC)': cells[4].textContent,
                        'HCs (Capacidade Segura)': cells[5].textContent,
                        'Utilização (%)': cells[6].textContent,
                        'Status': cells[7].textContent
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
                if (cells.length >= 8) {
                    saturdayData.push({
                        'Intervalo de Ligações': cells[0].textContent,
                        'Quantidade Média': cells[1].textContent,
                        'Capacidade por HC': cells[2].textContent,
                        'Capacidade Segura': cells[3].textContent,
                        'HCs (Capacidade por HC)': cells[4].textContent,
                        'HCs (Capacidade Segura)': cells[5].textContent,
                        'Utilização (%)': cells[6].textContent,
                        'Status': cells[7].textContent
                    });
                }
            });
        }
        
        // Criar planilhas e adicionar ao workbook
        try {
            if (weekdaysData.length > 0) {
                console.log('📊 Criando planilha Dias Úteis...');
                const ws1 = XLSX.utils.json_to_sheet(weekdaysData);
                XLSX.utils.book_append_sheet(wb, ws1, 'Dias Úteis');
                console.log('✅ Planilha Dias Úteis criada');
            }
            
            if (saturdayData.length > 0) {
                console.log('📊 Criando planilha Sábado...');
                const ws2 = XLSX.utils.json_to_sheet(saturdayData);
                XLSX.utils.book_append_sheet(wb, ws2, 'Sábado');
                console.log('✅ Planilha Sábado criada');
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
                console.log('📊 Criando planilha Resumo...');
                const ws3 = XLSX.utils.json_to_sheet(summaryData);
                XLSX.utils.book_append_sheet(wb, ws3, 'Resumo');
                console.log('✅ Planilha Resumo criada');
            }
            
            // Gerar nome do arquivo com timestamp
            const now = new Date();
            const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
            const fileName = `Dimensionamento_CallCenter_${timestamp}.xlsx`;
            
            console.log('📁 Exportando arquivo:', fileName);
            // Exportar arquivo
            XLSX.writeFile(wb, fileName);
            console.log('✅ Arquivo exportado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao criar planilhas:', error);
            throw new Error('Erro ao criar planilhas: ' + error.message);
        }
        
        showSuccess('✅ Arquivo Excel exportado com sucesso: ' + fileName);
        
    } catch (error) {
        console.error('Erro ao exportar para Excel:', error);
        showError('Erro ao exportar para Excel: ' + error.message);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - iniciando configuração...');
    
    // Verificar se o usuário já está autenticado
    if (isAuthenticated()) {
        console.log('🔐 Usuário já autenticado');
        showMainInterface();
    } else {
        console.log('🔐 Usuário não autenticado - mostrando tela de login');
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
    
    // Event listeners para campos editáveis dos parâmetros (COM DELAY)
    setTimeout(() => {
        console.log('⏰ Configurando event listeners após delay...');
        
        const horarioTrabalho = document.getElementById('horarioTrabalho');
        const horarioAlmoco = document.getElementById('horarioAlmoco');
        const outrasPausas = document.getElementById('outrasPausas');
        const tmaValue = document.getElementById('tmaValue');
        const tmaUnit = document.getElementById('tmaUnit');
        
        // Elementos do Sábado
        const horarioTrabalhoSabado = document.getElementById('horarioTrabalhoSabado');
        const horarioAlmocoSabado = document.getElementById('horarioAlmocoSabado');
        const outrasPausasSabado = document.getElementById('outrasPausasSabado');
        
        console.log('🔍 Elementos encontrados:');
        console.log('   horarioTrabalho:', !!horarioTrabalho);
        console.log('   horarioAlmoco:', !!horarioAlmoco);
        console.log('   outrasPausas:', !!outrasPausas);
        console.log('   tmaValue:', !!tmaValue);
        console.log('   tmaUnit:', !!tmaUnit);
        console.log('   horarioTrabalhoSabado:', !!horarioTrabalhoSabado);
        console.log('   horarioAlmocoSabado:', !!horarioAlmocoSabado);
        console.log('   outrasPausasSabado:', !!outrasPausasSabado);
        
        // Event listeners para Dias Úteis
        if (horarioTrabalho) horarioTrabalho.addEventListener('input', recalculateAll);
        if (horarioAlmoco) horarioAlmoco.addEventListener('input', recalculateAll);
        if (outrasPausas) outrasPausas.addEventListener('input', recalculateAll);
        if (tmaValue) tmaValue.addEventListener('input', recalculateAll);
        if (tmaUnit) tmaUnit.addEventListener('change', recalculateAll);
        
        // Event listeners para Sábado
        if (horarioTrabalhoSabado) horarioTrabalhoSabado.addEventListener('input', recalculateAll);
        if (horarioAlmocoSabado) horarioAlmocoSabado.addEventListener('input', recalculateAll);
        if (outrasPausasSabado) outrasPausasSabado.addEventListener('input', recalculateAll);
        
        console.log('✅ Event listeners configurados');
        
        // Calcular valores iniciais
        console.log('🧮 Calculando valores iniciais...');
        recalculateAll();
    }, 100);
    
    // Função de teste para TMA (disponível globalmente)
    window.testTMA = function() {
        console.log('🧪 TESTE MANUAL DO TMA:');
        const tmaValue = document.getElementById('tmaValue');
        const tmaUnit = document.getElementById('tmaUnit');
        
        if (!tmaValue || !tmaUnit) {
            console.error('❌ Elementos TMA não encontrados!');
            return;
        }
        
        console.log(`   Valor atual: ${tmaValue.value}`);
        console.log(`   Unidade atual: ${tmaUnit.value}`);
        
        const tmaSegundos = getTMASegundos();
        console.log(`   TMA em segundos: ${tmaSegundos}`);
        
        recalculateAll();
    };
    
    // Função de teste para Sábado (disponível globalmente)
    window.testSabado = function() {
        console.log('🧪 TESTE MANUAL DO SÁBADO:');
        const horarioTrabalhoSabado = document.getElementById('horarioTrabalhoSabado');
        const horarioAlmocoSabado = document.getElementById('horarioAlmocoSabado');
        const outrasPausasSabado = document.getElementById('outrasPausasSabado');
        
        if (!horarioTrabalhoSabado || !horarioAlmocoSabado || !outrasPausasSabado) {
            console.error('❌ Elementos do Sábado não encontrados!');
            return;
        }
        
        console.log(`   Horário de Trabalho: ${horarioTrabalhoSabado.value} horas`);
        console.log(`   Horário de Almoço: ${horarioAlmocoSabado.value} horas`);
        console.log(`   Outras Pausas: ${outrasPausasSabado.value} minutos`);
        
        const horasEfetivas = calculateHorasEfetivasSabado();
        const capacidadePorHC = calculateCapacidadePorHCSabado();
        const capacidadeSegura = calculateCapacidadeSeguraSabado();
        
        console.log(`   Horas Efetivas: ${horasEfetivas.toFixed(1)} horas`);
        console.log(`   Capacidade por HC: ${capacidadePorHC.toFixed(1)} ligações/hora`);
        console.log(`   Capacidade Segura: ${capacidadeSegura.toFixed(1)} ligações/hora`);
    };
    
    console.log('✅ Sistema totalmente configurado');
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
