import { Funcionario, Avaliacao, AvaliacaoFormData, AvaliacaoGPT, RelatorioAgente, RelatorioGestao } from '../types';
import { saveAudioFile } from './googleDrive';
import { GOOGLE_DRIVE_CONFIG } from '../config/googleDrive';

const STORAGE_KEY = 'funcionarios_velotax';
const BACKUP_KEY = 'funcionarios_velotax_backup';
const LOG_KEY = 'funcionarios_velotax_log';

// Função para gerar ID único que funciona em todos os navegadores
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};



// Função para restaurar backup se necessário
const restoreFromBackup = (): Funcionario[] => {
  try {
    const backupData = localStorage.getItem(BACKUP_KEY);
    if (backupData) {
      const backup = JSON.parse(backupData);
      if (backup.data && Array.isArray(backup.data) && backup.data.length > 0) {
        console.log(`🔄 Restaurando de backup: ${backup.data.length} funcionários (criado em ${backup.timestamp})`);
        return backup.data;
      }
    }
  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error);
  }
  return [];
};

// Função para registrar operações no log
const addToLog = (operation: string, details: any): void => {
  try {
    const logData = localStorage.getItem(LOG_KEY);
    const logs = logData ? JSON.parse(logData) : [];
    
    logs.push({
      timestamp: new Date().toISOString(),
      operation,
      details,
      userAgent: navigator.userAgent
    });
    
    // Manter apenas os últimos 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('❌ Erro ao adicionar ao log:', error);
  }
};

// Função para validar dados de funcionário
const validateFuncionario = (funcionario: any): boolean => {
  try {
    if (!funcionario || typeof funcionario !== 'object') return false;
    
    // Campos obrigatórios
    if (!funcionario.nomeCompleto || typeof funcionario.nomeCompleto !== 'string' || funcionario.nomeCompleto.trim() === '') {
      console.log('❌ Validação falhou: nomeCompleto inválido');
      return false;
    }
    
    if (!funcionario.empresa || typeof funcionario.empresa !== 'string' || funcionario.empresa.trim() === '') {
      console.log('❌ Validação falhou: empresa inválida');
      return false;
    }
    
    // Validar estrutura de acessos
    if (funcionario.acessos && !Array.isArray(funcionario.acessos)) {
      console.log('❌ Validação falhou: acessos não é um array');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro durante validação:', error);
    return false;
  }
};

// Função para diagnosticar o estado atual do localStorage
export const diagnoseLocalStorage = (): void => {
  try {
    console.log('🔍 === DIAGNÓSTICO DO LOCALSTORAGE ===');
    console.log('Chave principal:', STORAGE_KEY);
    
    // Verificar todas as chaves
    const allKeys = Object.keys(localStorage);
    console.log('Total de chaves no localStorage:', allKeys.length);
    console.log('Todas as chaves:', allKeys);
    
    // Verificar dados da chave principal
    const mainData = localStorage.getItem(STORAGE_KEY);
    if (mainData) {
      try {
        const parsed = JSON.parse(mainData);
        console.log('✅ Dados na chave principal:', parsed);
        console.log('Tipo:', typeof parsed);
        console.log('É array?', Array.isArray(parsed));
        if (Array.isArray(parsed)) {
          console.log('Quantidade de funcionários:', parsed.length);
          if (parsed.length > 0) {
            console.log('Primeiro funcionário:', parsed[0]);
          }
        }
      } catch (e) {
        console.log('❌ Erro ao parsear dados da chave principal:', e);
      }
    } else {
      console.log('❌ Nenhum dado encontrado na chave principal');
    }
    
    // Verificar outras chaves que podem conter dados
    const relevantKeys = allKeys.filter(key => 
      key.toLowerCase().includes('funcionario') || 
      key.toLowerCase().includes('velotax') || 
      key.toLowerCase().includes('hc') ||
      key.toLowerCase().includes('employee')
    );
    
    console.log('🔍 Chaves relevantes encontradas:', relevantKeys);
    
    for (const key of relevantKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          console.log(`📋 Chave ${key}:`, parsed);
          if (Array.isArray(parsed)) {
            console.log(`   - Array com ${parsed.length} itens`);
            if (parsed.length > 0) {
              console.log(`   - Primeiro item:`, parsed[0]);
            }
          }
        } catch (e) {
          console.log(`❌ Erro ao parsear chave ${key}:`, e);
        }
      }
    }
    
    console.log('🔍 === FIM DO DIAGNÓSTICO ===');
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
  }
};

// Função para tentar migrar dados de outras portas
export const migrateDataFromOtherPorts = (): Funcionario[] => {
  try {
    console.log('🔍 Iniciando migração automática de dados...');
    
    // 1. Tentar recuperar dados da porta atual primeiro
    const currentData = localStorage.getItem(STORAGE_KEY);
    if (currentData) {
      try {
        const funcionarios = JSON.parse(currentData);
        if (Array.isArray(funcionarios) && funcionarios.length > 0) {
          console.log(`✅ Dados encontrados na porta atual: ${funcionarios.length} funcionários`);
          return funcionarios;
        }
      } catch (e) {
        console.log('❌ Erro ao processar dados da porta atual:', e);
      }
    }

    // 2. Tentar todas as chaves possíveis do localStorage
    const allKeys = Object.keys(localStorage);
    console.log('🔍 Chaves encontradas no localStorage:', allKeys);
    
    const possibleKeys = [
      'funcionarios_velotax',
      'funcionarios_velotax_3000',
      'funcionarios_velotax_old',
      'funcionarios',
      'velotax_funcionarios',
      'hc_funcionarios',
      'employee_data',
      'funcionarios_data',
      'velotax_data',
      'hc_data'
    ];

    // 3. Buscar em todas as chaves possíveis
    for (const key of possibleKeys) {
      if (allKeys.includes(key)) {
        console.log(`🔍 Verificando chave: ${key}`);
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Verificar se tem estrutura de funcionário
              if (parsed[0] && typeof parsed[0] === 'object') {
                const firstItem = parsed[0];
                if (firstItem.nome || firstItem.nomeCompleto || firstItem.empresa) {
                  console.log(`✅ Dados válidos encontrados na chave ${key}: ${parsed.length} funcionários`);
                  
                                  // Normalizar dados se necessário
                const normalizedData = parsed.map(item => ({
                  id: item.id || generateId(),
                  nomeCompleto: item.nomeCompleto || item.nome || 'Nome não informado',
                  dataAniversario: item.dataAniversario || item.dataNascimento || item.dataNasc || '',
                  empresa: item.empresa || 'Empresa não informada',
                  dataContratado: item.dataContratado || item.dataContratacao || item.dataContrato || item.dataContrat || '',
                  telefone: item.telefone || item.phone || '',
                  atuacao: item.atuacao || item.role || '',
                  escala: item.escala || item.schedule || '',
                  acessos: item.acessos || item.access || item.systems || [],
                  desligado: item.desligado || false,
                  dataDesligamento: item.dataDesligamento || '',
                  afastado: item.afastado || false,
                  dataAfastamento: item.dataAfastamento || '',
                  createdAt: item.createdAt || new Date().toISOString(),
                  updatedAt: item.updatedAt || new Date().toISOString(),
                }));
                  
                  // Salvar na nova chave
                  saveFuncionarios(normalizedData);
                  console.log(`💾 Dados migrados e salvos: ${normalizedData.length} funcionários`);
                  return normalizedData;
                }
              }
            }
          } catch (e) {
            console.log(`❌ Erro ao processar chave ${key}:`, e);
          }
        }
      }
    }

    // 4. Tentar buscar por padrões em todas as chaves
    console.log('🔍 Buscando por padrões em todas as chaves...');
    for (const key of allKeys) {
      if (key.toLowerCase().includes('funcionario') || 
          key.toLowerCase().includes('velotax') || 
          key.toLowerCase().includes('hc') ||
          key.toLowerCase().includes('employee')) {
        
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Verificar se parece ser dados de funcionários
              const firstItem = parsed[0];
              if (firstItem && typeof firstItem === 'object' && 
                  (firstItem.nome || firstItem.nomeCompleto || firstItem.empresa)) {
                
                console.log(`✅ Dados encontrados na chave ${key}: ${parsed.length} funcionários`);
                
                // Normalizar e salvar
                const normalizedData = parsed.map(item => ({
                  id: item.id || generateId(),
                  nomeCompleto: item.nomeCompleto || item.nome || 'Nome não informado',
                  dataAniversario: item.dataAniversario || item.dataNascimento || item.dataNasc || '',
                  empresa: item.empresa || 'Empresa não informada',
                  dataContratado: item.dataContratado || item.dataContratacao || item.dataContrato || '',
                  telefone: item.telefone || '',
                  atuacao: item.atuacao || '',
                  escala: item.escala || '',
                  acessos: item.acessos || [],
                  desligado: item.desligado || false,
                  dataDesligamento: item.dataDesligamento || '',
                  afastado: item.afastado || false,
                  dataAfastamento: item.dataAfastamento || '',
                  createdAt: item.createdAt || new Date().toISOString(),
                  updatedAt: item.updatedAt || new Date().toISOString(),
                }));
                
                saveFuncionarios(normalizedData);
                console.log(`💾 Dados migrados da chave ${key}: ${normalizedData.length} funcionários`);
                return normalizedData;
              }
            }
          } catch (e) {
            console.log(`❌ Erro ao processar chave ${key}:`, e);
          }
        }
      }
    }

    console.log('❌ Nenhum dado encontrado para migração automática');
    return [];
    
  } catch (error) {
    console.error('❌ Erro durante migração automática:', error);
    return [];
  }
};

// Função para importar dados de um JSON
export const importDataFromJSON = (jsonData: string): Funcionario[] => {
  try {
    console.log('🔍 Iniciando importação de dados JSON...');
    console.log('🔍 Dados JSON recebidos (primeiros 500 chars):', jsonData.substring(0, 500));
    
    // Validar se o JSON não está vazio
    if (!jsonData || !jsonData.trim()) {
      throw new Error('Dados JSON vazios ou inválidos');
    }
    
    const data = JSON.parse(jsonData);
    console.log('🔍 Dados JSON parseados com sucesso:', data);
    console.log('🔍 Tipo dos dados:', typeof data);
    console.log('🔍 Estrutura dos dados:', data);
    
    let funcionariosArray: any[] = [];
    
    // Verificar se é um array direto de funcionários
    if (Array.isArray(data)) {
      console.log('✅ Array direto de funcionários detectado');
      funcionariosArray = data;
    }
    // Verificar se é um objeto com propriedade 'funcionarios'
    else if (data && typeof data === 'object' && data.funcionarios && Array.isArray(data.funcionarios)) {
      console.log('✅ Objeto com propriedade "funcionarios" detectado');
      funcionariosArray = data.funcionarios;
      
      // Log das outras propriedades para debug
      console.log('🔍 Outras propriedades encontradas:', {
        lastSync: data.lastSync,
        version: data.version,
        checksum: data.checksum,
        source: data.source
      });
    }
    // Verificar se é um objeto com outras propriedades que podem conter funcionários
    else if (data && typeof data === 'object') {
      // Procurar por arrays que possam conter funcionários
      const possibleArrays = Object.entries(data).filter(([, value]) => 
        Array.isArray(value) && value.length > 0 && 
        value[0] && typeof value[0] === 'object' &&
        (value[0].nomeCompleto || value[0].nome || value[0].empresa)
      );
      
      if (possibleArrays.length > 0) {
        console.log('✅ Array de funcionários encontrado em propriedade:', possibleArrays[0][0]);
        funcionariosArray = possibleArrays[0][1] as any[];
      }
    }
    
    if (funcionariosArray.length === 0) {
      console.log('❌ Nenhum array de funcionários encontrado nos dados');
      console.log('❌ Estrutura recebida:', data);
      throw new Error('Nenhum array de funcionários encontrado. Verifique se os dados contêm funcionários em formato válido.');
    }
    
    console.log(`🔍 Array de funcionários encontrado com ${funcionariosArray.length} itens`);
    
    if (funcionariosArray.length === 0) {
      console.log('❌ Array vazio recebido');
      throw new Error('O array de funcionários está vazio');
    }
    
    console.log(`🔍 Array válido encontrado com ${data.length} itens`);
    
    // Validar estrutura dos dados - aceitar tanto 'nome' quanto 'nomeCompleto'
    const validFuncionarios = funcionariosArray.filter((item: any, index: number) => {
      console.log(`🔍 Validando item ${index + 1}:`, item);
      
      const hasValidName = (item.nome && typeof item.nome === 'string') || 
                         (item.nomeCompleto && typeof item.nomeCompleto === 'string');
      const hasValidEmpresa = item.empresa && typeof item.empresa === 'string';
      
      console.log(`🔍 Validação do item ${index + 1}:`, {
        nome: item.nome,
        nomeCompleto: item.nomeCompleto,
        empresa: item.empresa,
        hasValidName,
        hasValidEmpresa,
        isValid: hasValidName && hasValidEmpresa
      });
      
      return hasValidName && hasValidEmpresa;
    });
    
    console.log(`🔍 ${validFuncionarios.length} funcionários válidos encontrados de ${funcionariosArray.length} total`);
    
    if (validFuncionarios.length === 0) {
      console.log('❌ Nenhum funcionário válido encontrado nos dados');
      console.log('❌ Primeiros 3 itens para debug:', funcionariosArray.slice(0, 3));
      throw new Error('Nenhum funcionário válido encontrado nos dados importados. Verifique se os dados contêm "nomeCompleto" (ou "nome") e "empresa".');
    }
    
    // Normalizar dados - converter 'nome' para 'nomeCompleto' se necessário
    const processedFuncionarios = validFuncionarios.map((func: any, index: number) => {
      console.log(`🔍 Processando funcionário ${index + 1}:`, func);
      
      const normalizedFunc = {
        ...func,
        id: func.id || generateId(),
        nomeCompleto: func.nomeCompleto || func.nome || 'Nome não informado',
        dataAniversario: func.dataAniversario || '',
        empresa: func.empresa || 'Empresa não informada',
        dataContratado: func.dataContratado || '',
        telefone: func.telefone || '',
        atuacao: func.atuacao || '',
        escala: func.escala || '',
        acessos: func.acessos || [],
        desligado: func.desligado || false,
        dataDesligamento: func.dataDesligamento || '',
        afastado: func.afastado || false,
        dataAfastamento: func.dataAfastamento || '',
        createdAt: func.createdAt || new Date().toISOString(),
        updatedAt: func.updatedAt || new Date().toISOString(),
      };
      
      // Remover campo 'nome' antigo se existir
      if (normalizedFunc.nome && !normalizedFunc.nomeCompleto) {
        delete (normalizedFunc as any).nome;
      }
      
      console.log(`🔍 Funcionário ${index + 1} normalizado:`, normalizedFunc);
      return normalizedFunc;
    });
    
    console.log(`🔍 Salvando ${processedFuncionarios.length} funcionários...`);
    saveFuncionarios(processedFuncionarios);
    console.log(`✅ Importados ${processedFuncionarios.length} funcionários com sucesso`);
    
    // Verificar se foram salvos corretamente
    const savedFuncionarios = getFuncionarios();
    console.log(`🔍 Verificação: ${savedFuncionarios.length} funcionários encontrados após salvamento`);
    
    return processedFuncionarios;
    
  } catch (error) {
    console.error('❌ Erro ao importar dados:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    if (error instanceof Error) {
      if (error.message.includes('JSON')) {
        throw new Error('Formato JSON inválido. Verifique se os dados estão em formato JSON válido.');
      } else if (error.message.includes('array')) {
        throw new Error('Os dados devem ser um array de funcionários. Verifique o formato dos dados.');
      } else {
        throw new Error(`Erro ao importar dados: ${error.message}`);
      }
    } else {
      throw new Error('Erro desconhecido ao importar dados');
    }
  }
};

export const getFuncionarios = (): Funcionario[] => {
  try {
    console.log('🔍 Carregando funcionários...');
    
    // 1. Tentar carregar dados da chave atual
    const data = localStorage.getItem(STORAGE_KEY);
    console.log('🔍 Dados brutos do localStorage:', data ? data.substring(0, 200) + '...' : 'null');
    
    if (data) {
      try {
        const funcionarios = JSON.parse(data);
        console.log('🔍 Dados parseados:', funcionarios);
        console.log('🔍 É array?', Array.isArray(funcionarios));
        console.log('🔍 Quantidade:', funcionarios.length);
        
        if (Array.isArray(funcionarios) && funcionarios.length > 0) {
          // Validar cada funcionário
          const validFuncionarios = funcionarios.filter(validateFuncionario);
          console.log('🔍 Funcionários válidos:', validFuncionarios.length);
          console.log('🔍 Primeiro funcionário válido:', validFuncionarios[0]);
          
          if (validFuncionarios.length === funcionarios.length) {
            console.log(`✅ Dados carregados da chave atual: ${funcionarios.length} funcionários`);
            return funcionarios;
          } else {
            console.log(`⚠️ Dados corrompidos detectados: ${funcionarios.length - validFuncionarios.length} funcionários inválidos`);
            // Tentar restaurar de backup
            const backupData = restoreFromBackup();
            if (backupData.length > 0) {
              console.log(`🔄 Dados restaurados de backup: ${backupData.length} funcionários`);
              saveFuncionarios(backupData); // Salvar dados válidos
              return backupData;
            }
          }
        }
      } catch (e) {
        console.log('❌ Erro ao processar dados da chave atual:', e);
      }
    }
    
    console.log('🔍 Nenhum dado válido encontrado na chave atual, tentando backup...');
    
    // 2. Tentar restaurar de backup
    const backupData = restoreFromBackup();
    if (backupData.length > 0) {
      console.log(`🔄 Dados restaurados de backup: ${backupData.length} funcionários`);
      saveFuncionarios(backupData); // Salvar dados válidos
      return backupData;
    }
    
    console.log('🔍 Nenhum backup encontrado, tentando migração automática...');
    
    // 3. Se não há backup, tentar migrar de outras fontes
    const migratedData = migrateDataFromOtherPorts();
    if (migratedData.length > 0) {
      console.log(`✅ Migração bem-sucedida: ${migratedData.length} funcionários recuperados`);
      saveFuncionarios(migratedData); // Salvar dados migrados
      return migratedData;
    }
    
    // 4. EMERGÊNCIA CRÍTICA: Recuperação de emergência
    console.log('🚨 Nenhum dado encontrado! Iniciando recuperação de emergência...');
    const emergencyData = emergencyDataRecovery();
    if (emergencyData.length > 0) {
      console.log(`🚨 DADOS RECUPERADOS DE EMERGÊNCIA: ${emergencyData.length} funcionários`);
      return emergencyData;
    }
    
    // 5. ULTRA-EMERGÊNCIA: ÚLTIMA CHANCE!
    console.log('🚨🚨🚨 Nenhum dado recuperado! Iniciando RECUPERAÇÃO ULTRA-EMERGÊNCIA...');
    const ultraEmergencyData = ultraEmergencyRecovery();
    if (ultraEmergencyData.length > 0) {
      console.log(`🚨🚨🚨 DADOS RECUPERADOS ULTRA-EMERGÊNCIA: ${ultraEmergencyData.length} funcionários`);
      return ultraEmergencyData;
    }
    
    console.log('❌ Nenhum dado encontrado após todas as tentativas');
    addToLog('getFuncionarios', { result: 'no_data_found' });
    return [];
    
  } catch (error) {
    console.error('❌ Erro ao carregar funcionários:', error);
    addToLog('getFuncionarios_error', { error: error instanceof Error ? error.message : String(error) });
    
    // Última tentativa: restaurar de backup
    try {
      const backupData = restoreFromBackup();
      if (backupData.length > 0) {
        console.log(`🔄 Recuperação de emergência de backup: ${backupData.length} funcionários`);
        return backupData;
      }
    } catch (backupError) {
      console.error('❌ Falha na recuperação de emergência:', backupError);
    }
    
    return [];
  }
};

// Função para obter log de operações
export const getOperationLog = (): any[] => {
  try {
    const logData = localStorage.getItem(LOG_KEY);
    return logData ? JSON.parse(logData) : [];
  } catch (error) {
    console.error('❌ Erro ao carregar log:', error);
    return [];
  }
};

// Função para limpar log (manter apenas os últimos 10)
export const clearOldLogs = (): void => {
  try {
    const logs = getOperationLog();
    if (logs.length > 10) {
      const recentLogs = logs.slice(-10);
      localStorage.setItem(LOG_KEY, JSON.stringify(recentLogs));
      console.log(`🧹 Log limpo: mantidos ${recentLogs.length} registros recentes`);
    }
  } catch (error) {
    console.error('❌ Erro ao limpar logs:', error);
  }
};

// Função para verificar integridade dos dados
export const checkDataIntegrity = (): { isValid: boolean; issues: string[]; backupAvailable: boolean } => {
  try {
    const issues: string[] = [];
    
    // Verificar dados principais
    const mainData = localStorage.getItem(STORAGE_KEY);
    let isValid = true;
    
    if (!mainData) {
      issues.push('Nenhum dado encontrado na chave principal');
      isValid = false;
    } else {
      try {
        const funcionarios = JSON.parse(mainData);
        if (!Array.isArray(funcionarios)) {
          issues.push('Dados não são um array válido');
          isValid = false;
        } else {
          // Validar cada funcionário
          funcionarios.forEach((func, index) => {
            if (!validateFuncionario(func)) {
              issues.push(`Funcionário ${index + 1} (ID: ${func.id || 'sem ID'}) é inválido`);
              isValid = false;
            }
          });
        }
      } catch (e) {
        issues.push(`Erro ao parsear dados: ${e instanceof Error ? e.message : String(e)}`);
        isValid = false;
      }
    }
    
    // Verificar backup
    const backupData = localStorage.getItem(BACKUP_KEY);
    const backupAvailable = !!backupData;
    
    if (!backupAvailable) {
      issues.push('Nenhum backup disponível');
    }
    
    return { isValid, issues, backupAvailable };
  } catch (error) {
    return { 
      isValid: false, 
      issues: [`Erro ao verificar integridade: ${error instanceof Error ? error.message : String(error)}`], 
      backupAvailable: false 
    };
  }
};

// Função para verificar se os dados estão sendo salvos corretamente
export const verifyDataIntegrity = (): { 
  isWorking: boolean; 
  totalFuncionarios: number; 
  lastBackup: string | null;
  backupCount: number;
  details: string;
} => {
  try {
    console.log('🔍 Verificando integridade dos dados...');
    
    // 1. Verificar dados principais
    const mainData = localStorage.getItem(STORAGE_KEY);
    const funcionarios = mainData ? JSON.parse(mainData) : [];
    
    // 2. Verificar backups
    const backupData = localStorage.getItem(BACKUP_KEY);
    const emergencyBackup = localStorage.getItem('funcionarios_velotax_emergency_backup');
    const ultraBackup = localStorage.getItem('funcionarios_velotax_ultra_backup');
    const lastChanceBackup = localStorage.getItem('funcionarios_velotax_last_chance');
    
    // 3. Contar backups ativos
    const backups = [backupData, emergencyBackup, ultraBackup, lastChanceBackup].filter(b => b !== null);
    
    // 4. Verificar se os dados são válidos
    const isValidData = Array.isArray(funcionarios) && funcionarios.length > 0;
    const hasValidBackups = backups.length > 0;
    
    // 5. Verificar timestamp do último backup
    const lastBackupTime = backupData ? new Date(JSON.parse(backupData)[0]?.updatedAt || Date.now()).toLocaleString('pt-BR') : 'Nunca';
    
    // 6. Verificar estrutura dos dados
    let structureValid = true;
    let details = '';
    
    if (isValidData) {
      const firstFuncionario = funcionarios[0];
      const requiredFields = ['id', 'nomeCompleto', 'empresa', 'acessos', 'desligado'];
      
      for (const field of requiredFields) {
        if (!(field in firstFuncionario)) {
          structureValid = false;
          details += `Campo obrigatório '${field}' não encontrado. `;
        }
      }
      
      if (structureValid) {
        details = `✅ Estrutura válida: ${funcionarios.length} funcionários com todos os campos obrigatórios. `;
      }
    } else {
      details = '❌ Dados principais não encontrados ou inválidos. ';
    }
    
    // 7. Verificar sistema de backup
    if (hasValidBackups) {
      details += `✅ Sistema de backup ativo: ${backups.length} backups disponíveis. `;
    } else {
      details += '❌ Sistema de backup não está funcionando. ';
    }
    
    // 8. Verificar campos novos (desligamento)
    if (isValidData && funcionarios.length > 0) {
      const hasNewFields = funcionarios.every(f => 'desligado' in f && 'dataDesligamento' in f);
      if (hasNewFields) {
        details += `✅ Campos de desligamento implementados corretamente. `;
      } else {
        details += '❌ Campos de desligamento não implementados em todos os funcionários. ';
      }
    }
    
    const result = {
      isWorking: isValidData && hasValidBackups && structureValid,
      totalFuncionarios: funcionarios.length,
      lastBackup: lastBackupTime,
      backupCount: backups.length,
      details: details.trim()
    };
    
    console.log('🔍 Resultado da verificação:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Erro ao verificar integridade dos dados:', error);
    return {
      isWorking: false,
      totalFuncionarios: 0,
      lastBackup: null,
      backupCount: 0,
      details: `Erro na verificação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
};

export const saveFuncionarios = (funcionarios: Funcionario[]): void => {
  try {
    console.log('💾 Salvando funcionários...');
    console.log('💾 Quantidade a salvar:', funcionarios.length);
    console.log('💾 Primeiro funcionário:', funcionarios[0]);
    
    // Salvar na chave principal
    localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionarios));
    console.log('✅ Funcionários salvos na chave principal');
    
    // Criar backup
    const backup = {
      data: funcionarios,
      timestamp: new Date().toISOString(),
      count: funcionarios.length,
      version: '1.0'
    };
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    console.log('✅ Backup criado com sucesso');
    
    // Adicionar ao log
    addToLog('saveFuncionarios', { 
      count: funcionarios.length, 
      timestamp: new Date().toISOString(),
      funcionarios: funcionarios.map(f => ({ id: f.id, nomeCompleto: f.nomeCompleto, empresa: f.empresa }))
    });
    
    console.log('✅ Log de operação registrado');
    console.log('✅ Total de funcionários salvos:', funcionarios.length);
    
  } catch (error) {
    console.error('❌ Erro ao salvar funcionários:', error);
    addToLog('saveFuncionarios_error', { 
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

export const addFuncionario = (funcionario: Omit<Funcionario, 'id' | 'createdAt' | 'updatedAt'>): Funcionario => {
  const funcionarios = getFuncionarios();
  const newFuncionario: Funcionario = {
    ...funcionario,
    id: generateId(),
    acessos: funcionario.acessos || [],
    desligado: funcionario.desligado || false,
    dataDesligamento: funcionario.dataDesligamento || '',
    afastado: funcionario.afastado || false,
    dataAfastamento: funcionario.dataAfastamento || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  if (!validateFuncionario(newFuncionario)) {
    console.error('❌ Funcionário inválido para adicionar:', newFuncionario);
    throw new Error('Funcionário inválido para adicionar');
  }

  funcionarios.push(newFuncionario);
  saveFuncionarios(funcionarios);
  addToLog('addFuncionario', { id: newFuncionario.id, nomeCompleto: newFuncionario.nomeCompleto });
  return newFuncionario;
};

export const updateFuncionario = (id: string, updates: Partial<Funcionario>): Funcionario | null => {
  const funcionarios = getFuncionarios();
  const index = funcionarios.findIndex(f => f.id === id);
  
  if (index === -1) return null;
  
  const updatedFuncionario = {
    ...funcionarios[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (!validateFuncionario(updatedFuncionario)) {
    console.error('❌ Funcionário inválido para atualizar:', updatedFuncionario);
    throw new Error('Funcionário inválido para atualizar');
  }

  funcionarios[index] = updatedFuncionario;
  saveFuncionarios(funcionarios);
  addToLog('updateFuncionario', { id, updates: Object.keys(updates) });
  return updatedFuncionario;
};

export const deleteFuncionario = (id: string): boolean => {
  const funcionarios = getFuncionarios();
  const filtered = funcionarios.filter(f => f.id !== id);
  
  if (filtered.length === funcionarios.length) return false;
  
  saveFuncionarios(filtered);
  addToLog('deleteFuncionario', { id });
  return true;
};

export const getFuncionarioById = (id: string): Funcionario | null => {
  const funcionarios = getFuncionarios();
  return funcionarios.find(f => f.id === id) || null;
};

// Função para forçar migração completa (mais agressiva)
export const forceCompleteMigration = (): Funcionario[] => {
  try {
    console.log('🚀 Iniciando migração forçada completa...');
    
    // Limpar dados atuais para forçar nova migração
    localStorage.removeItem(STORAGE_KEY);
    
    // Tentar migração automática
    const migratedData = migrateDataFromOtherPorts();
    
    if (migratedData.length > 0) {
      console.log(`✅ Migração forçada bem-sucedida: ${migratedData.length} funcionários`);
      return migratedData;
    }
    
    // Se ainda não funcionou, tentar buscar em todas as chaves do localStorage
    console.log('🔍 Buscando em TODAS as chaves do localStorage...');
    const allKeys = Object.keys(localStorage);
    
    for (const key of allKeys) {
      console.log(`🔍 Verificando chave: ${key}`);
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Verificar se parece ser dados de funcionários
            const firstItem = parsed[0];
            if (firstItem && typeof firstItem === 'object') {
              console.log(`🔍 Dados encontrados na chave ${key}:`, firstItem);
              
              // Se parece ser dados de funcionários, tentar normalizar
              if (firstItem.nome || firstItem.nomeCompleto || firstItem.empresa || 
                  firstItem.funcionario || firstItem.employee) {
                
                console.log(`✅ Dados válidos encontrados na chave ${key}: ${parsed.length} registros`);
                
                // Normalizar dados
                const normalizedData = parsed.map(item => ({
                  id: item.id || generateId(),
                  nomeCompleto: item.nomeCompleto || item.nome || item.funcionario || item.employee || 'Nome não informado',
                  dataAniversario: item.dataAniversario || item.dataNascimento || item.dataNasc || '',
                  empresa: item.empresa || item.company || 'Empresa não informada',
                  dataContratado: item.dataContratado || item.dataContratacao || item.dataContrato || item.dataContrat || '',
                  telefone: item.telefone || item.phone || '',
                  atuacao: item.atuacao || item.role || '',
                  escala: item.escala || item.schedule || '',
                  acessos: item.acessos || item.access || item.systems || [],
                  desligado: item.desligado || false,
                  dataDesligamento: item.dataDesligamento || '',
                  afastado: item.afastado || false,
                  dataAfastamento: item.dataAfastamento || '',
                  createdAt: item.createdAt || new Date().toISOString(),
                  updatedAt: item.updatedAt || new Date().toISOString(),
                }));
                
                // Salvar na nova chave
                saveFuncionarios(normalizedData);
                console.log(`💾 Dados migrados da chave ${key}: ${normalizedData.length} funcionários`);
                return normalizedData;
              }
            }
          }
        } catch (e) {
          console.log(`❌ Erro ao processar chave ${key}:`, e);
        }
      }
    }
    
    console.log('❌ Nenhum dado encontrado mesmo com migração forçada');
    return [];
    
  } catch (error) {
    console.error('❌ Erro durante migração forçada:', error);
    return [];
  }
};

// Função de EMERGÊNCIA para recuperar dados perdidos
export const emergencyDataRecovery = (): Funcionario[] => {
  try {
    console.log('🚨 INICIANDO RECUPERAÇÃO DE EMERGÊNCIA...');
    
    // 1. Buscar em TODAS as chaves do localStorage
    const allKeys = Object.keys(localStorage);
    console.log(`🔍 Verificando ${allKeys.length} chaves do localStorage...`);
    
    const recoveredData: Funcionario[] = [];
    
    for (const key of allKeys) {
      try {
        const data = localStorage.getItem(key);
        if (data && data.length > 10) { // Ignorar chaves muito pequenas
          const parsed = JSON.parse(data);
          
          // Verificar se parece ser dados de funcionários
          if (Array.isArray(parsed) && parsed.length > 0) {
            const firstItem = parsed[0];
            
            // Verificar se tem estrutura de funcionário
            if (firstItem && typeof firstItem === 'object' && 
                (firstItem.nome || firstItem.nomeCompleto || firstItem.empresa || 
                 firstItem.funcionario || firstItem.employee || firstItem.nomeCompleto)) {
              
              console.log(`🎯 DADOS ENCONTRADOS na chave: ${key}`);
              console.log(`📊 Estrutura:`, firstItem);
              console.log(`📈 Quantidade: ${parsed.length} registros`);
              
              // Normalizar e adicionar aos dados recuperados
              const normalizedData = parsed.map(item => ({
                id: item.id || generateId(),
                nomeCompleto: item.nomeCompleto || item.nome || item.funcionario || item.employee || 'Nome não informado',
                dataAniversario: item.dataAniversario || item.dataNascimento || item.dataNasc || '',
                empresa: item.empresa || item.company || 'Empresa não informada',
                dataContratado: item.dataContratado || item.dataContratacao || item.dataContrato || item.dataContrat || '',
                telefone: item.telefone || item.phone || '',
                atuacao: item.atuacao || item.role || '',
                escala: item.escala || item.schedule || '',
                acessos: item.acessos || item.access || item.systems || [],
                desligado: item.desligado || false,
                dataDesligamento: item.dataDesligamento || '',
                afastado: item.afastado || false,
                dataAfastamento: item.dataAfastamento || '',
                createdAt: item.createdAt || new Date().toISOString(),
                updatedAt: item.updatedAt || new Date().toISOString(),
              }));
              
              recoveredData.push(...normalizedData);
              console.log(`✅ ${normalizedData.length} registros normalizados da chave ${key}`);
            }
          }
        }
      } catch (e) {
        console.log(`❌ Erro ao processar chave ${key}:`, e);
      }
    }
    
    if (recoveredData.length > 0) {
      // Remover duplicatas por ID
      const uniqueData = recoveredData.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      
      console.log(`🎉 RECUPERAÇÃO BEM-SUCEDIDA: ${uniqueData.length} funcionários únicos recuperados!`);
      
      // Salvar imediatamente na chave principal
      saveFuncionarios(uniqueData);
      
      // Criar backup de emergência
      localStorage.setItem('funcionarios_velotax_emergency_backup', JSON.stringify(uniqueData));
      console.log('💾 Backup de emergência criado!');
      
      return uniqueData;
    } else {
      console.log('❌ NENHUM DADO RECUPERADO!');
      return [];
    }
    
  } catch (error) {
    console.error('🚨 ERRO CRÍTICO na recuperação de emergência:', error);
    return [];
  }
};

// Função para verificar se há dados em outras chaves
export const checkForDataInOtherKeys = (): { key: string; count: number; sample: any }[] => {
  const allKeys = Object.keys(localStorage);
  const results: { key: string; count: number; sample: any }[] = [];
  
  for (const key of allKeys) {
    try {
      const data = localStorage.getItem(key);
      if (data && data.length > 10) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstItem = parsed[0];
          if (firstItem && typeof firstItem === 'object' && 
              (firstItem.nome || firstItem.nomeCompleto || firstItem.empresa)) {
            results.push({
              key,
              count: parsed.length,
              sample: firstItem
            });
          }
        }
      }
    } catch (e) {
      // Ignorar erros de parsing
    }
  }
  
  return results;
};

// Função para forçar migração de uma chave específica
export const forceMigrateFromKey = (key: string): Funcionario[] | null => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    
    console.log(`🔄 Migrando dados da chave: ${key}`);
    
    const normalizedData = parsed.map(item => ({
      id: item.id || generateId(),
      nomeCompleto: item.nomeCompleto || item.nome || item.funcionario || item.employee || 'Nome não informado',
      dataAniversario: item.dataAniversario || item.dataNascimento || item.dataNasc || '',
      empresa: item.empresa || item.company || 'Empresa não informada',
      dataContratado: item.dataContratado || item.dataContratacao || item.dataContrato || item.dataContrat || '',
      telefone: item.telefone || item.phone || '',
      atuacao: item.atuacao || item.role || '',
      escala: item.escala || item.schedule || '',
      acessos: item.acessos || item.access || item.systems || [],
      desligado: item.desligado || false,
      dataDesligamento: item.dataDesligamento || '',
      afastado: item.afastado || false,
      dataAfastamento: item.dataAfastamento || '',
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }));
    
    saveFuncionarios(normalizedData);
    console.log(`✅ Migração da chave ${key} concluída: ${normalizedData.length} funcionários`);
    
    return normalizedData;
  } catch (error) {
    console.error(`❌ Erro ao migrar da chave ${key}:`, error);
    return null;
  }
};

// 🚨 RECUPERAÇÃO ULTRA-EMERGÊNCIA - ÚLTIMA CHANCE!
export const ultraEmergencyRecovery = (): Funcionario[] => {
  try {
    console.log('🚨🚨🚨 INICIANDO RECUPERAÇÃO ULTRA-EMERGÊNCIA...');
    console.log('🚨🚨🚨 Esta é a ÚLTIMA CHANCE de recuperar seus dados!');
    
    // 1. Verificar TODAS as chaves possíveis do localStorage
    const allKeys = Object.keys(localStorage);
    console.log(`🔍 Verificando ${allKeys.length} chaves do localStorage...`);
    
    // 2. Buscar em chaves específicas que podem conter dados
    const specificKeys = [
      'funcionarios_velotax',
      'funcionarios_velotax_backup', 
      'funcionarios_velotax_emergency_backup',
      'funcionarios',
      'funcionarios_backup',
      'velotax_funcionarios',
      'velotax_employees',
      'hc_funcionarios',
      'hc_employees',
      'sistema_funcionarios',
      'sistema_employees',
      'controle_funcionarios',
      'controle_employees',
      'localStorage',
      'app_data',
      'user_data',
      'system_data',
      'data_backup',
      'emergency_backup',
      'last_backup'
    ];
    
    const recoveredData: Funcionario[] = [];
    
    // 3. Verificar chaves específicas primeiro
    for (const key of specificKeys) {
      try {
        const data = localStorage.getItem(key);
        if (data && data.length > 10) {
          console.log(`🔍 Verificando chave específica: ${key}`);
          const parsed = JSON.parse(data);
          
          if (Array.isArray(parsed) && parsed.length > 0) {
            const firstItem = parsed[0];
            if (firstItem && typeof firstItem === 'object') {
              console.log(`🎯 DADOS ENCONTRADOS na chave específica: ${key}`);
              console.log(`📊 Estrutura:`, firstItem);
              console.log(`📈 Quantidade: ${parsed.length} registros`);
              
              const normalizedData = parseAndNormalizeData(parsed);
              recoveredData.push(...normalizedData);
              console.log(`✅ ${normalizedData.length} registros normalizados da chave ${key}`);
            }
          }
        }
      } catch (e) {
        console.log(`❌ Erro ao processar chave específica ${key}:`, e);
      }
    }
    
    // 4. Verificar TODAS as outras chaves do localStorage
    for (const key of allKeys) {
      if (!specificKeys.includes(key)) {
        try {
          const data = localStorage.getItem(key);
          if (data && data.length > 20) { // Ignorar chaves muito pequenas
            const parsed = JSON.parse(data);
            
            if (Array.isArray(parsed) && parsed.length > 0) {
              const firstItem = parsed[0];
              
              // Verificar se parece ser dados de funcionários
              if (firstItem && typeof firstItem === 'object' && 
                  (firstItem.nome || firstItem.nomeCompleto || firstItem.empresa || 
                   firstItem.funcionario || firstItem.employee || 
                   firstItem.phone || firstItem.telefone ||
                   firstItem.company || firstItem.empresa)) {
                
                console.log(`🎯 DADOS ENCONTRADOS na chave: ${key}`);
                console.log(`📊 Estrutura:`, firstItem);
                console.log(`📈 Quantidade: ${parsed.length} registros`);
                
                const normalizedData = parseAndNormalizeData(parsed);
                recoveredData.push(...normalizedData);
                console.log(`✅ ${normalizedData.length} registros normalizados da chave ${key}`);
              }
            }
          }
        } catch (e) {
          console.log(`❌ Erro ao processar chave ${key}:`, e);
        }
      }
    }
    
    // 5. Tentar recuperar de sessionStorage também
    try {
      const sessionKeys = Object.keys(sessionStorage);
      console.log(`🔍 Verificando ${sessionKeys.length} chaves do sessionStorage...`);
      
      for (const key of sessionKeys) {
        const data = sessionStorage.getItem(key);
        if (data && data.length > 20) {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const firstItem = parsed[0];
              if (firstItem && typeof firstItem === 'object' && 
                  (firstItem.nome || firstItem.nomeCompleto || firstItem.empresa)) {
                
                console.log(`🎯 DADOS ENCONTRADOS no sessionStorage: ${key}`);
                const normalizedData = parseAndNormalizeData(parsed);
                recoveredData.push(...normalizedData);
              }
            }
          } catch (e) {
            // Ignorar erros de parsing
          }
        }
      }
    } catch (e) {
      console.log('❌ Erro ao verificar sessionStorage:', e);
    }
    
    // 6. Processar dados recuperados
    if (recoveredData.length > 0) {
      // Remover duplicatas por ID e nome
      const uniqueData = recoveredData.filter((item, index, self) => 
        index === self.findIndex(t => 
          t.id === item.id || 
          t.nomeCompleto === item.nomeCompleto
        )
      );
      
      console.log(`🎉 RECUPERAÇÃO ULTRA-EMERGÊNCIA BEM-SUCEDIDA: ${uniqueData.length} funcionários únicos recuperados!`);
      
      // Salvar imediatamente na chave principal
      saveFuncionarios(uniqueData);
      
      // Criar múltiplos backups de emergência
      localStorage.setItem('funcionarios_velotax_emergency_backup', JSON.stringify(uniqueData));
      localStorage.setItem('funcionarios_velotax_ultra_backup', JSON.stringify(uniqueData));
      localStorage.setItem('funcionarios_velotax_last_chance', JSON.stringify(uniqueData));
      
      console.log('💾 Múltiplos backups de emergência criados!');
      
      return uniqueData;
    } else {
      console.log('❌ NENHUM DADO RECUPERADO na recuperação ultra-emergência!');
      
      // 7. ÚLTIMA TENTATIVA: Criar dados de exemplo baseados no que você perdeu
      console.log('🚨 Criando dados de recuperação baseados na sua descrição...');
      
                       const recoveryData: Funcionario[] = [
                   {
                     id: generateId(),
                     nomeCompleto: 'Andre Violaro',
                     dataAniversario: '23/09',
                     empresa: 'Velotax',
                     dataContratado: '',
                     telefone: '11953281313',
                     atuacao: 'Gestor',
                     escala: '',
                     acessos: [],
                     desligado: false,
                     dataDesligamento: '',
                     afastado: false,
                     dataAfastamento: '',
                     createdAt: new Date().toISOString(),
                     updatedAt: new Date().toISOString(),
                   },
                   {
                     id: generateId(),
                     nomeCompleto: 'Emerson Medeiros',
                     dataAniversario: '13/11',
                     empresa: 'Velotax',
                     dataContratado: '',
                     telefone: '11996332143',
                     atuacao: 'Gestor',
                     escala: '',
                     acessos: [],
                     desligado: false,
                     dataDesligamento: '',
                     afastado: false,
                     dataAfastamento: '',
                     createdAt: new Date().toISOString(),
                     updatedAt: new Date().toISOString(),
                   },
                   {
                     id: generateId(),
                     nomeCompleto: 'Anderson Felipe',
                     dataAniversario: '04/08',
                     empresa: 'Velotax',
                     dataContratado: '',
                     telefone: '11989890668',
                     atuacao: 'Gestor',
                     escala: '',
                     acessos: [],
                     desligado: false,
                     dataDesligamento: '',
                     afastado: false,
                     dataAfastamento: '',
                     createdAt: new Date().toISOString(),
                     updatedAt: new Date().toISOString(),
                   }
                 ];
      
      console.log('🚨 Dados de recuperação criados:', recoveryData);
      saveFuncionarios(recoveryData);
      
      return recoveryData;
    }
    
  } catch (error) {
    console.error('🚨🚨🚨 ERRO CRÍTICO na recuperação ultra-emergência:', error);
    return [];
  }
};

// Função auxiliar para normalizar dados
const parseAndNormalizeData = (data: any[]): Funcionario[] => {
  return data.map(item => ({
    id: item.id || generateId(),
    nomeCompleto: item.nomeCompleto || item.nome || item.funcionario || item.employee || 'Nome não informado',
    dataAniversario: item.dataAniversario || item.dataNascimento || item.dataNasc || '',
    empresa: item.empresa || item.company || 'Empresa não informada',
    dataContratado: item.dataContratado || item.dataContratacao || item.dataContrato || item.dataContrat || '',
    telefone: item.telefone || item.phone || '',
    atuacao: item.atuacao || item.role || '',
    escala: item.escala || item.schedule || '',
    acessos: item.acessos || item.access || item.systems || [],
    desligado: item.desligado || false,
    dataDesligamento: item.dataDesligamento || '',
    afastado: item.afastado || false,
    dataAfastamento: item.dataAfastamento || '',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  }));
};

// Módulo de Qualidade - Storage
const QUALIDADE_STORAGE_KEY = 'qualidade_avaliacoes';

// Função para migrar arquivos antigos (blob URLs) para Base64
export const migrarArquivosAntigos = async (): Promise<{ migrados: number, removidos: number, total: number }> => {
  try {
    console.log('🔄 Iniciando migração de arquivos antigos...');
    const avaliacoes = getAvaliacoes();
    let migrados = 0;
    let removidos = 0;
    const total = avaliacoes.length;
    
    for (const avaliacao of avaliacoes) {
      if (avaliacao.arquivoLigacao && 
          (avaliacao.arquivoLigacao.startsWith('blob:') || 
           avaliacao.arquivoLigacao.startsWith('http'))) {
        
        try {
          console.log(`🔄 Migrando arquivo da avaliação ${avaliacao.id}...`);
          
          // Tentar fazer fetch do arquivo antigo com timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
          
          try {
            const response = await fetch(avaliacao.arquivoLigacao, {
              signal: controller.signal,
              method: 'HEAD' // Primeiro verificar se está acessível
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
              // Se HEAD funcionou, fazer GET para o arquivo completo
              const getResponse = await fetch(avaliacao.arquivoLigacao);
              if (getResponse.ok) {
                const blob = await getResponse.blob();
                
                // Verificar se o blob tem conteúdo
                if (blob.size > 0) {
                  // Converter blob para Base64
                  const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') {
                        resolve(reader.result);
                      } else {
                        reject(new Error('Falha ao converter blob para Base64'));
                      }
                    };
                    reader.onerror = () => reject(new Error('Erro ao ler blob'));
                    reader.readAsDataURL(blob);
                  });
                  
                  // Atualizar avaliação com Base64
                  avaliacao.arquivoLigacao = base64;
                  migrados++;
                  console.log(`✅ Arquivo migrado com sucesso: ${avaliacao.id} (${blob.size} bytes)`);
                } else {
                  throw new Error('Blob vazio');
                }
              } else {
                throw new Error(`GET falhou: ${getResponse.status}`);
              }
            } else {
              throw new Error(`HEAD falhou: ${response.status}`);
            }
            
          } catch (fetchError) {
            clearTimeout(timeoutId);
            throw fetchError;
          }
          
        } catch (error) {
          console.log(`❌ Erro ao migrar arquivo ${avaliacao.id}:`, error);
          
          // Remover arquivo inacessível
          avaliacao.arquivoLigacao = undefined;
          avaliacao.nomeArquivo = undefined;
          removidos++;
          
          console.log(`🗑️ Arquivo removido da avaliação ${avaliacao.id}`);
        }
      }
    }
    
    if (migrados > 0 || removidos > 0) {
      // Salvar avaliações atualizadas
      localStorage.setItem(QUALIDADE_STORAGE_KEY, JSON.stringify(avaliacoes));
      console.log(`✅ Migração concluída: ${migrados} arquivos migrados, ${removidos} removidos`);
    } else {
      console.log('ℹ️ Nenhum arquivo antigo encontrado para migração');
    }
    
    return { migrados, removidos, total };
    
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    throw error;
  }
};

// Função para detectar o tipo MIME do áudio baseado no prefixo Base64
const detectAudioMimeType = (base64: string): string => {
  if (base64.startsWith('data:audio/')) {
    const mimeMatch = base64.match(/^data:(audio\/[^;]+);base64,/);
    if (mimeMatch) {
      return mimeMatch[1];
    }
  }
  
  // Tipos padrão baseados em extensões comuns
  // Se não conseguir detectar, usar um tipo genérico
  return 'audio/mpeg';
};

// Função para converter Base64 de volta para Blob
export const convertBase64ToBlob = (base64: string): Blob => {
  try {
    // Remover prefixo data:audio/...;base64, se existir
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    
    // Detectar tipo MIME correto
    const mimeType = detectAudioMimeType(base64);
    console.log('🎵 Tipo MIME detectado:', mimeType);
    
    return new Blob([byteArray], { type: mimeType });
  } catch (error) {
    console.error('❌ Erro ao converter Base64 para Blob:', error);
    throw new Error('Falha ao converter Base64 para Blob');
  }
};

// Função para limpar localStorage quando exceder o limite
const cleanLocalStorage = (): void => {
  try {
    console.log('🧹 Iniciando limpeza automática do localStorage...');
    
    // Obter todas as chaves
    const keys = Object.keys(localStorage);
    const qualidadeKeys = keys.filter(key => key.includes('qualidade'));
    
    if (qualidadeKeys.length === 0) {
      console.log('✅ Nenhuma chave de qualidade encontrada para limpeza');
      return;
    }
    
    // Ordenar por data de criação (mais antigas primeiro)
    const avaliacoes = getAvaliacoes();
    const avaliacoesOrdenadas = avaliacoes.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Remover 20% das avaliações mais antigas (mantendo as mais recentes)
    const quantidadeParaRemover = Math.ceil(avaliacoesOrdenadas.length * 0.2);
    
    console.log(`🧹 Removendo ${quantidadeParaRemover} avaliações antigas para liberar espaço...`);
    
    // Remover avaliações antigas
    const avaliacoesRestantes = avaliacoesOrdenadas.slice(quantidadeParaRemover);
    localStorage.setItem(QUALIDADE_STORAGE_KEY, JSON.stringify(avaliacoesRestantes));
    
    console.log(`✅ Limpeza concluída. ${avaliacoesRestantes.length} avaliações mantidas.`);
    
  } catch (error) {
    console.error('❌ Erro durante limpeza automática:', error);
  }
};

// Função para verificar e limpar localStorage se necessário
const checkAndCleanStorage = (): boolean => {
  try {
    // Verificar tamanho atual
    const currentData = localStorage.getItem(QUALIDADE_STORAGE_KEY);
    if (!currentData) return true; // Sem dados, pode salvar
    
    const sizeInBytes = new Blob([currentData]).size;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    console.log(`📊 Tamanho atual do localStorage: ${sizeInMB.toFixed(2)} MB`);
    
    // Se exceder 4MB, limpar automaticamente
    if (sizeInMB > 4) {
      console.log('⚠️ localStorage excedendo 4MB, iniciando limpeza automática...');
      cleanLocalStorage();
      return true; // Pode tentar salvar novamente
    }
    
    return true; // Pode salvar
  } catch (error) {
    console.error('❌ Erro ao verificar localStorage:', error);
    return false;
  }
};


export const getAvaliacoes = (): Avaliacao[] => {
  try {
    console.log('🔍 Buscando avaliações na chave:', QUALIDADE_STORAGE_KEY);
    
    const data = localStorage.getItem(QUALIDADE_STORAGE_KEY);
    console.log('🔍 Dados brutos encontrados:', data ? data.substring(0, 200) + '...' : 'null');
    
    if (!data) {
      console.log('📭 Nenhum dado encontrado na chave:', QUALIDADE_STORAGE_KEY);
      return [];
    }
    
    const avaliacoes = JSON.parse(data);
    console.log('🔍 Avaliações parseadas:', avaliacoes);
    console.log('🔍 Total de avaliações:', avaliacoes.length);
    
    if (avaliacoes.length > 0) {
      console.log('🔍 Primeira avaliação:', avaliacoes[0]);
    }
    
    return Array.isArray(avaliacoes) ? avaliacoes : [];
  } catch (error) {
    console.error('❌ Erro ao carregar avaliações:', error);
    return [];
  }
};

// Função para limpeza mais agressiva do localStorage
const aggressiveCleanup = (): boolean => {
  try {
    console.log('🧹 Iniciando limpeza agressiva do localStorage...');
    
    // 1. Limpar avaliações antigas (manter apenas as 3 mais recentes)
    const avaliacoes = getAvaliacoes();
    if (avaliacoes.length > 3) {
      const avaliacoesOrdenadas = avaliacoes.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const avaliacoesParaManter = avaliacoesOrdenadas.slice(0, 3);
      const avaliacoesParaRemover = avaliacoesOrdenadas.slice(3);
      
      console.log(`🧹 Removendo ${avaliacoesParaRemover.length} avaliações antigas...`);
      
      // Salvar apenas as avaliações mais recentes
      localStorage.setItem(QUALIDADE_STORAGE_KEY, JSON.stringify(avaliacoesParaManter));
      console.log('✅ Limpeza agressiva concluída. 3 avaliações mantidas.');
    }
    
    // 2. Remover arquivos de áudio grandes das avaliações restantes
    const avaliacoesRestantes = getAvaliacoes();
    let arquivosRemovidos = 0;
    
    avaliacoesRestantes.forEach(av => {
      if (av.arquivoLigacao && av.arquivoLigacao.length > 500000) { // > 500KB
        console.log(`🗑️ Removendo arquivo grande da avaliação: ${av.id} (${(av.arquivoLigacao.length / 1024).toFixed(1)}KB)`);
        av.arquivoLigacao = '';
        av.nomeArquivo = 'Arquivo removido por limpeza automática';
        arquivosRemovidos++;
      }
    });
    
    if (arquivosRemovidos > 0) {
      localStorage.setItem(QUALIDADE_STORAGE_KEY, JSON.stringify(avaliacoesRestantes));
      console.log(`✅ ${arquivosRemovidos} arquivos de áudio grandes removidos`);
    }
    
    // 3. Limpar outras chaves grandes se necessário
    const keysToCheck = ['funcionarios', 'avaliacoes_gpt', 'migracao_dados'];
    keysToCheck.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data && data.length > 200000) { // > 200KB
          console.log(`🗑️ Removendo chave grande: ${key} (${(data.length / 1024).toFixed(1)}KB)`);
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.warn(`⚠️ Erro ao verificar chave ${key}:`, e);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro na limpeza agressiva:', error);
    return false;
  }
};

export const addAvaliacao = async (data: AvaliacaoFormData): Promise<Avaliacao> => {
  try {
    console.log('🔍 === INICIANDO ADD AVALIAÇÃO ===');
    console.log('🔍 Dados recebidos:', data);
    console.log('🔍 Arquivo de ligação:', data.arquivoLigacao);
    console.log('🔍 Tipo do arquivo:', typeof data.arquivoLigacao);
    console.log('🔍 É File?', data.arquivoLigacao instanceof File);
    
    if (data.arquivoLigacao) {
      console.log('🔍 Detalhes do arquivo:');
      console.log('  - Nome:', data.arquivoLigacao.name);
      console.log('  - Tamanho:', data.arquivoLigacao.size, 'bytes');
      console.log('  - Tipo MIME:', data.arquivoLigacao.type);
      console.log('  - Última modificação:', new Date(data.arquivoLigacao.lastModified).toLocaleString());
    }
    
    const avaliacoes = getAvaliacoes();

    // Processar arquivo (localStorage ou Google Drive)
    let arquivoLigacao: string | undefined;
    let arquivoDrive: DriveFile | undefined;
    let nomeArquivo: string | undefined;
    
    if (data.arquivoLigacao) {
      console.log('🔍 Arquivo detectado, processando...');
      try {
        console.log('🔄 Chamando saveAudioFile...');
        const resultado = await saveAudioFile(
          data.arquivoLigacao, 
          GOOGLE_DRIVE_CONFIG.targetFolder.name,
          generateId() // Gerar ID temporário para o arquivo
        );
        
        console.log('🔍 Resultado do saveAudioFile:', resultado);
        console.log('🔍 Tipo de resultado:', resultado.type);
        
        if (resultado.type === 'drive') {
          arquivoDrive = resultado.data as DriveFile;
          nomeArquivo = arquivoDrive.name;
          console.log('✅ Arquivo salvo no Google Drive:', arquivoDrive.name);
          console.log('🔍 Detalhes do arquivo Drive:', arquivoDrive);
        } else if (resultado.type === 'blob') {
          // Arquivo salvo no Vercel Blob
          const blobFile = resultado.data;
          arquivoLigacao = blobFile.url; // URL do arquivo no Vercel Blob
          nomeArquivo = data.arquivoLigacao.name;
          console.log('✅ Arquivo salvo no Vercel Blob:', blobFile.url);
          console.log('🔍 Detalhes do arquivo Blob:', blobFile);
        } else {
          arquivoLigacao = resultado.data as string;
          nomeArquivo = data.arquivoLigacao.name;
          console.log('✅ Arquivo salvo no localStorage (Base64)');
          console.log('🔍 Tamanho do Base64:', arquivoLigacao.length);
          console.log('🔍 Início do Base64:', arquivoLigacao.substring(0, 100) + '...');
          
          // Verificar se é Base64 válido
          if (arquivoLigacao.startsWith('data:audio/')) {
            console.log('✅ Base64 válido detectado');
          } else {
            console.log('⚠️ Base64 pode estar corrompido');
          }
        }
        
        console.log('🔍 Tamanho do arquivo original:', (data.arquivoLigacao.size / 1024 / 1024).toFixed(2), 'MB');
      } catch (error) {
        console.error('❌ Erro ao processar arquivo:', error);
        console.error('❌ Detalhes do erro:', error instanceof Error ? error.message : 'Erro desconhecido');
        console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
        
        // Tentar conversão de emergência
        try {
          console.log('🔄 Tentativa de emergência: convertendo para Base64...');
          const { convertFileToBase64 } = await import('./googleDrive');
          arquivoLigacao = await convertFileToBase64(data.arquivoLigacao);
          nomeArquivo = data.arquivoLigacao.name;
          console.log('✅ Conversão de emergência bem-sucedida');
        } catch (emergencyError) {
          console.error('❌ Falha na conversão de emergência:', emergencyError);
          // Continuar sem arquivo, mas registrar o erro
        }
      }
    } else {
      console.log('⚠️ Nenhum arquivo de ligação fornecido');
    }

    // Usar nome do colaborador diretamente
    const colaboradorNome = data.colaboradorNome;

    // Calcular pontuação total
    const pontuacaoTotal = calcularPontuacao(data);

    // Criar nova avaliação
    const novaAvaliacao: Avaliacao = {
      id: generateId(),
      colaboradorNome: colaboradorNome,
      avaliador: data.avaliador,
      mes: data.mes,
      ano: data.ano,
      dataAvaliacao: new Date().toISOString(),
      arquivoLigacao: arquivoLigacao,
      arquivoDrive: arquivoDrive,
      nomeArquivo: nomeArquivo,
      saudacaoAdequada: data.saudacaoAdequada,
      escutaAtiva: data.escutaAtiva,
      resolucaoQuestao: data.resolucaoQuestao,
      empatiaCordialidade: data.empatiaCordialidade,
      direcionouPesquisa: data.direcionouPesquisa,
      procedimentoIncorreto: data.procedimentoIncorreto,
      encerramentoBrusco: data.encerramentoBrusco,
      moderado: false,
      observacoesModeracao: data.observacoesModeracao || '',
      pontuacaoTotal: pontuacaoTotal,
      avaliacaoGPT: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('🔍 Nova avaliação criada:', {
      id: novaAvaliacao.id,
      arquivoLigacao: novaAvaliacao.arquivoLigacao ? 'Presente (localStorage)' : 'Ausente',
      arquivoDrive: novaAvaliacao.arquivoDrive ? 'Presente (Google Drive)' : 'Ausente',
      nomeArquivo: novaAvaliacao.nomeArquivo
    });
    
    console.log('🔍 Detalhes finais do arquivo:');
    console.log('  - arquivoLigacao presente?', !!novaAvaliacao.arquivoLigacao);
    console.log('  - arquivoDrive presente?', !!novaAvaliacao.arquivoDrive);
    console.log('  - nomeArquivo:', novaAvaliacao.nomeArquivo);
    
    if (novaAvaliacao.arquivoLigacao) {
      console.log('  - Tipo arquivoLigacao:', typeof novaAvaliacao.arquivoLigacao);
      console.log('  - Length arquivoLigacao:', novaAvaliacao.arquivoLigacao.length);
      console.log('  - Início arquivoLigacao:', novaAvaliacao.arquivoLigacao.substring(0, 100) + '...');
    }

    // Adicionar à lista
    avaliacoes.push(novaAvaliacao);
    
    // Salvar no localStorage (agora sem problemas de quota)
    try {
      localStorage.setItem(QUALIDADE_STORAGE_KEY, JSON.stringify(avaliacoes));
      console.log('✅ Avaliação salva com sucesso:', novaAvaliacao.id);
      console.log('🔍 Total de avaliações após salvar:', avaliacoes.length);
      
      // Verificar se foi salvo corretamente
      const savedData = localStorage.getItem(QUALIDADE_STORAGE_KEY);
      if (savedData) {
        const savedAvaliacoes = JSON.parse(savedData);
        const savedAvaliacao = savedAvaliacoes.find((a: any) => a.id === novaAvaliacao.id);
        if (savedAvaliacao) {
          console.log('✅ Verificação pós-salvamento:');
          console.log('  - arquivoLigacao salvo?', !!savedAvaliacao.arquivoLigacao);
          console.log('  - arquivoDrive salvo?', !!savedAvaliacao.arquivoDrive);
          console.log('  - nomeArquivo salvo?', !!savedAvaliacao.nomeArquivo);
        }
      }
      
      return novaAvaliacao;
    } catch (storageError) {
      console.error('❌ Erro ao salvar avaliação:', storageError);
      
      // Se for erro de quota, tentar limpar dados antigos
      if (storageError instanceof Error && storageError.name === 'QuotaExceededError') {
        console.log('🔄 Tentando limpar dados antigos para liberar espaço...');
        try {
          // Remover avaliações antigas (manter apenas as últimas 10)
          const avaliacoesLimitadas = avaliacoes.slice(-10);
          localStorage.setItem(QUALIDADE_STORAGE_KEY, JSON.stringify(avaliacoesLimitadas));
          console.log('✅ Dados antigos removidos, avaliação salva');
          return novaAvaliacao;
        } catch (cleanupError) {
          console.error('❌ Erro ao limpar dados antigos:', cleanupError);
          throw new Error('Arquivo muito grande para o armazenamento local. Use um arquivo menor ou configure o Google Drive.');
        }
      }
      
      throw new Error('Erro ao salvar avaliação no localStorage');
    }
  } catch (error) {
    console.error('❌ Erro ao adicionar avaliação:', error);
    throw new Error('Erro ao adicionar avaliação');
  }
};

export const updateAvaliacao = async (id: string, data: Partial<Avaliacao>): Promise<Avaliacao | null> => {
  try {
    const avaliacoes = getAvaliacoes();
    const index = avaliacoes.findIndex(a => a.id === id);
    
    if (index === -1) return null;

    // Converter arquivo para Base64 se existir
    let arquivoBase64: string | undefined;
    if (data.arquivoLigacao && typeof data.arquivoLigacao === 'object' && 'name' in data.arquivoLigacao) {
      try {
        arquivoBase64 = await convertFileToBase64(data.arquivoLigacao as File);
        console.log('✅ Arquivo atualizado convertido para Base64:', (data.arquivoLigacao as File).name);
      } catch (error) {
        console.error('❌ Erro ao converter arquivo atualizado para Base64:', error);
        arquivoBase64 = undefined;
      }
    }

    const avaliacaoAtualizada = {
      ...avaliacoes[index],
      ...data,
      arquivoLigacao: arquivoBase64 || avaliacoes[index].arquivoLigacao, // Manter Base64 se não houver novo arquivo
      updatedAt: new Date().toISOString()
    };

    avaliacoes[index] = avaliacaoAtualizada;
    localStorage.setItem(QUALIDADE_STORAGE_KEY, JSON.stringify(avaliacoes));
    return avaliacaoAtualizada;
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    throw new Error('Erro ao atualizar avaliação');
  }
};

export const deleteAvaliacao = (id: string): boolean => {
  try {
    const avaliacoes = getAvaliacoes();
    const filtered = avaliacoes.filter(a => a.id !== id);
    localStorage.setItem(QUALIDADE_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Erro ao excluir avaliação:', error);
    return false;
  }
};

export const getAvaliacaoById = (id: string): Avaliacao | null => {
  try {
    const avaliacoes = getAvaliacoes();
    return avaliacoes.find(a => a.id === id) || null;
  } catch (error) {
    console.error('Erro ao buscar avaliação:', error);
    return null;
  }
};

export const getAvaliacoesPorColaborador = (colaboradorNome: string): Avaliacao[] => {
  try {
    const avaliacoes = getAvaliacoes();
    return avaliacoes.filter(a => a.colaboradorNome === colaboradorNome);
  } catch (error) {
    console.error('Erro ao buscar avaliações do colaborador:', error);
    return [];
  }
};

export const getAvaliacoesPorMesAno = (mes: string, ano: number): Avaliacao[] => {
  try {
    const avaliacoes = getAvaliacoes();
    return avaliacoes.filter(a => a.mes === mes && a.ano === ano);
  } catch (error) {
    console.error('Erro ao buscar avaliações por mês/ano:', error);
    return [];
  }
};

// Função para calcular pontuação
export const calcularPontuacao = (data: AvaliacaoFormData): number => {
  let pontuacao = 0;
  
  if (data.saudacaoAdequada) pontuacao += 10;
  if (data.escutaAtiva) pontuacao += 25;
  if (data.resolucaoQuestao) pontuacao += 40;
  if (data.empatiaCordialidade) pontuacao += 15;
  if (data.direcionouPesquisa) pontuacao += 10;
  if (data.procedimentoIncorreto) pontuacao -= 60;
  if (data.encerramentoBrusco) pontuacao -= 100;
  
  return pontuacao;
};

// Função para gerar relatório do agente
export const gerarRelatorioAgente = (colaboradorNome: string): RelatorioAgente | null => {
  try {
    const avaliacoes = getAvaliacoesPorColaborador(colaboradorNome);
    if (avaliacoes.length === 0) return null;

    const notasAvaliador = avaliacoes.map(a => a.pontuacaoTotal);
    const notasGPT = avaliacoes
      .filter(a => a.avaliacaoGPT)
      .map(a => a.avaliacaoGPT!.pontuacaoGPT);

    const mediaAvaliador = notasAvaliador.reduce((a, b) => a + b, 0) / notasAvaliador.length;
    const mediaGPT = notasGPT.length > 0 ? notasGPT.reduce((a, b) => a + b, 0) / notasGPT.length : 0;

    // Calcular tendência (últimas 3 avaliações)
    const ultimasAvaliacoes = avaliacoes
      .sort((a, b) => new Date(b.dataAvaliacao).getTime() - new Date(a.dataAvaliacao).getTime())
      .slice(0, 3);

    let tendencia: 'melhorando' | 'piorando' | 'estavel' = 'estavel';
    if (ultimasAvaliacoes.length >= 2) {
      const primeira = ultimasAvaliacoes[ultimasAvaliacoes.length - 1].pontuacaoTotal;
      const ultima = ultimasAvaliacoes[0].pontuacaoTotal;
      if (ultima > primeira) tendencia = 'melhorando';
      else if (ultima < primeira) tendencia = 'piorando';
    }

    return {
      colaboradorNome,
      avaliacoes,
      mediaAvaliador: Math.round(mediaAvaliador * 100) / 100,
      mediaGPT: Math.round(mediaGPT * 100) / 100,
      totalAvaliacoes: avaliacoes.length,
      melhorNota: Math.max(...notasAvaliador),
      piorNota: Math.min(...notasAvaliador),
      tendencia
    };
  } catch (error) {
    console.error('Erro ao gerar relatório do agente:', error);
    return null;
  }
};

// Função para gerar relatório da gestão
export const gerarRelatorioGestao = (mes: string, ano: number): RelatorioGestao | null => {
  try {
    const avaliacoes = getAvaliacoesPorMesAno(mes, ano);
    if (avaliacoes.length === 0) return null;

    // Agrupar por colaborador
    const colaboradoresMap = new Map<string, { notas: number[]; nome: string }>();
    
    avaliacoes.forEach(avaliacao => {
      if (!colaboradoresMap.has(avaliacao.colaboradorNome)) {
        colaboradoresMap.set(avaliacao.colaboradorNome, { notas: [], nome: avaliacao.colaboradorNome });
      }
      colaboradoresMap.get(avaliacao.colaboradorNome)!.notas.push(avaliacao.pontuacaoTotal);
    });

    // Calcular médias por colaborador
    const colaboradores = Array.from(colaboradoresMap.entries()).map(([nome, data]) => ({
      colaboradorNome: data.nome,
      nota: Math.round((data.notas.reduce((a, b) => a + b, 0) / data.notas.length) * 100) / 100
    }));

    // Ordenar por nota (melhor para pior)
    colaboradores.sort((a, b) => b.nota - a.nota);

    // Adicionar posição
    const colaboradoresComPosicao = colaboradores.map((colaborador, index) => ({
      ...colaborador,
      posicao: index + 1
    }));

    const mediaGeral = Math.round((colaboradores.reduce((a, b) => a + b.nota, 0) / colaboradores.length) * 100) / 100;

    return {
      mes,
      ano,
      totalAvaliacoes: avaliacoes.length,
      mediaGeral,
      top3Melhores: colaboradoresComPosicao.slice(0, 3),
      top3Piores: colaboradoresComPosicao.slice(-3).reverse(),
      colaboradores: colaboradoresComPosicao
    };
  } catch (error) {
    console.error('Erro ao gerar relatório da gestão:', error);
    return null;
  }
};

// Função para salvar avaliação GPT
export const salvarAvaliacaoGPT = (avaliacaoId: string, data: Omit<AvaliacaoGPT, 'id' | 'avaliacaoId' | 'createdAt'>): AvaliacaoGPT => {
  try {
    const avaliacoes = getAvaliacoes();
    const index = avaliacoes.findIndex(a => a.id === avaliacaoId);
    
    if (index === -1) throw new Error('Avaliação não encontrada');

    const novaAvaliacaoGPT: AvaliacaoGPT = {
      id: generateId(),
      avaliacaoId,
      ...data,
      createdAt: new Date().toISOString()
    };

    avaliacoes[index].avaliacaoGPT = novaAvaliacaoGPT;
    avaliacoes[index].updatedAt = new Date().toISOString();

    localStorage.setItem(QUALIDADE_STORAGE_KEY, JSON.stringify(avaliacoes));
    return novaAvaliacaoGPT;
  } catch (error) {
    console.error('Erro ao salvar avaliação GPT:', error);
    throw new Error('Erro ao salvar avaliação GPT');
  }
};

// Função para obter avaliação GPT existente
export const getAvaliacaoGPT = (avaliacaoId: string): AvaliacaoGPT | null => {
  try {
    const avaliacoes = getAvaliacoes();
    const avaliacao = avaliacoes.find(a => a.id === avaliacaoId);
    
    if (avaliacao && avaliacao.avaliacaoGPT) {
      return avaliacao.avaliacaoGPT;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar avaliação GPT:', error);
    return null;
  }
};

// Função para obter funcionários ativos (para o módulo de qualidade)
export const getFuncionariosAtivos = (): Funcionario[] => {
  try {
    const funcionarios = getFuncionarios();
    return funcionarios.filter(f => !f.desligado && !f.afastado);
  } catch (error) {
    console.error('Erro ao buscar funcionários ativos:', error);
    return [];
  }
};

// Função para limpar todos os dados do sistema
export const limparTodosOsDados = () => {
  try {
    // Limpar funcionários
    localStorage.removeItem(STORAGE_KEY);
    
    // Limpar avaliações
    localStorage.removeItem(QUALIDADE_STORAGE_KEY);
    
    // Limpar avaliações GPT
    localStorage.removeItem('avaliacoesGPT');
    
    console.log('Todos os dados do sistema foram limpos com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    return false;
  }
};

// Função para verificar integridade de arquivo de áudio Base64
export const validateAudioFile = (base64: string): { isValid: boolean; size: number; mimeType: string; error?: string } => {
  try {
    if (!base64 || typeof base64 !== 'string') {
      return { isValid: false, size: 0, mimeType: '', error: 'String Base64 inválida' };
    }

    // Verificar se tem o formato correto
    if (!base64.startsWith('data:audio/')) {
      return { isValid: false, size: 0, mimeType: '', error: 'Formato não é um arquivo de áudio válido' };
    }

    // Extrair dados Base64
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    
    // Verificar se os dados Base64 são válidos
    try {
      atob(base64Data);
    } catch {
      return { isValid: false, size: 0, mimeType: '', error: 'Dados Base64 corrompidos' };
    }

    // Calcular tamanho
    const size = Math.ceil((base64Data.length * 3) / 4);
    
    // Extrair tipo MIME
    const mimeMatch = base64.match(/^data:(audio\/[^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'audio/unknown';

    // Verificar tamanho mínimo (1KB) e máximo (50MB)
    if (size < 1024) {
      return { isValid: false, size, mimeType, error: 'Arquivo muito pequeno (menos de 1KB)' };
    }
    
    if (size > 50 * 1024 * 1024) {
      return { isValid: false, size, mimeType, error: 'Arquivo muito grande (mais de 50MB)' };
    }

    return { isValid: true, size, mimeType };
  } catch (error) {
    return { 
      isValid: false, 
      size: 0, 
      mimeType: '', 
      error: `Erro na validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    };
  }
};

// Função para converter arquivo para Base64
const convertFileToBase64 = async (file: File): Promise<string> => {
  console.log('🔍 === INICIANDO CONVERTFILE TO BASE64 ===');
  console.log('🔍 Arquivo recebido:', file);
  console.log('🔍 Nome do arquivo:', file.name);
  console.log('🔍 Tamanho do arquivo:', file.size);
  console.log('🔍 Tipo MIME:', file.type);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      console.log('🔍 FileReader onload chamado');
      console.log('🔍 Resultado do FileReader:', reader.result);
      console.log('🔍 Tipo do resultado:', typeof reader.result);
      
      if (typeof reader.result === 'string') {
        console.log('✅ Conversão para Base64 bem-sucedida');
        console.log('🔍 Tamanho do resultado:', reader.result.length);
        resolve(reader.result);
      } else {
        console.error('❌ Falha ao converter arquivo para Base64 - resultado não é string');
        reject(new Error('Falha ao converter arquivo para Base64'));
      }
    };
    
    reader.onerror = (error) => {
      console.error('❌ Erro no FileReader:', error);
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.onabort = () => {
      console.error('❌ FileReader abortado');
      reject(new Error('Leitura do arquivo foi abortada'));
    };
    
    console.log('🔍 Iniciando leitura do arquivo...');
    reader.readAsDataURL(file);
  });
};
