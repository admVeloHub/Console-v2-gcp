import React, { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { 
  importDataFromJSON, 
  getFuncionarios, 
  forceCompleteMigration, 
  diagnoseLocalStorage, 
  getOperationLog, 
  checkDataIntegrity, 
  clearOldLogs,
  emergencyDataRecovery,
  checkForDataInOtherKeys,
  ultraEmergencyRecovery,
  verifyDataIntegrity
} from '../utils/storage';

interface DataMigrationProps {
  onDataImported: () => void;
}

export const DataMigration: React.FC<DataMigrationProps> = ({ onDataImported }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    if (!jsonData.trim()) {
      setMessage({ type: 'error', text: 'Por favor, insira os dados JSON' });
      return;
    }

    setIsLoading(true);
    setMessage(null); // Limpar mensagens anteriores
    
    try {
      console.log('🔍 Iniciando importação...');
      console.log('🔍 Dados JSON recebidos:', jsonData.substring(0, 200) + '...');
      
      // Validar formato básico antes de processar
      const trimmedData = jsonData.trim();
      const isDirectArray = trimmedData.startsWith('[') && trimmedData.endsWith(']');
      const isObjectWithFuncionarios = trimmedData.startsWith('{') && trimmedData.includes('"funcionarios"');
      
      if (!isDirectArray && !isObjectWithFuncionarios) {
        throw new Error('Formato inválido: Os dados devem ser um array direto [...] ou um objeto com propriedade "funcionarios" {...}');
      }
      
      const importedFuncionarios = importDataFromJSON(jsonData);
      
      if (importedFuncionarios && importedFuncionarios.length > 0) {
        setMessage({ 
          type: 'success', 
          text: `✅ Importados ${importedFuncionarios.length} funcionários com sucesso! Os dados foram salvos e estão disponíveis na lista.` 
        });
        setJsonData('');
        onDataImported();
        setTimeout(() => setIsOpen(false), 3000);
      } else {
        throw new Error('Nenhum funcionário foi importado');
      }
    } catch (error) {
      console.error('❌ Erro na importação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Mensagens de erro mais amigáveis
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('JSON')) {
        userFriendlyMessage = 'Formato JSON inválido. Verifique se os dados estão em formato JSON válido.';
      } else if (errorMessage.includes('array')) {
        userFriendlyMessage = 'Os dados devem ser um array de funcionários. Verifique o formato dos dados.';
      } else if (errorMessage.includes('nomeCompleto') || errorMessage.includes('nome')) {
        userFriendlyMessage = 'Dados inválidos: Cada funcionário deve ter "nomeCompleto" (ou "nome") e "empresa".';
      } else if (errorMessage.includes('vazio')) {
        userFriendlyMessage = 'Os dados JSON estão vazios ou não contêm funcionários válidos.';
      }
      
      setMessage({ 
        type: 'error', 
        text: `❌ Erro ao importar dados: ${userFriendlyMessage}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    console.log('📤 Iniciando exportação...');
    const funcionarios = getFuncionarios();
    console.log('📤 Funcionários encontrados para exportação:', funcionarios);
    console.log('📤 Quantidade total:', funcionarios.length);
    console.log('📤 IDs dos funcionários:', funcionarios.map(f => ({ id: f.id, nomeCompleto: f.nomeCompleto })));
    
    if (funcionarios.length === 0) {
      setMessage({ type: 'error', text: 'Não há dados para exportar' });
      return;
    }

    const dataStr = JSON.stringify(funcionarios, null, 2);
    console.log('📤 Dados JSON gerados (primeiros 500 chars):', dataStr.substring(0, 500));
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `funcionarios_velotax_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setMessage({ 
      type: 'success', 
      text: `✅ Backup exportado com sucesso! ${funcionarios.length} funcionários exportados.` 
    });
    
    console.log('📤 Exportação concluída com sucesso');
  };

  const handleMigrateFromOtherPorts = () => {
    // Tentar migrar dados automaticamente
    const funcionarios = getFuncionarios();
    if (funcionarios.length > 0) {
      setMessage({ type: 'success', text: `Dados migrados: ${funcionarios.length} funcionários encontrados!` });
      onDataImported();
    } else {
      setMessage({ type: 'error', text: 'Nenhum dado encontrado para migração automática' });
    }
  };

  const handleForceMigration = () => {
    setIsLoading(true);
    try {
      const funcionarios = forceCompleteMigration();
      if (funcionarios.length > 0) {
        setMessage({ type: 'success', text: `Migração forçada bem-sucedida: ${funcionarios.length} funcionários recuperados!` });
        onDataImported();
        setTimeout(() => setIsOpen(false), 2000);
      } else {
        setMessage({ type: 'error', text: 'Nenhum dado encontrado mesmo com migração forçada' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Erro durante migração forçada: ${error instanceof Error ? error.message : 'Erro desconhecido' }` });
    } finally {
      setIsLoading(false);
    }
  };

  // 🚨 RECUPERAÇÃO DE EMERGÊNCIA
  const handleEmergencyRecovery = () => {
    setIsLoading(true);
    try {
      console.log('🚨 Iniciando recuperação de emergência...');
      const funcionarios = emergencyDataRecovery();
      if (funcionarios.length > 0) {
        setMessage({ 
          type: 'success', 
          text: `🚨 RECUPERAÇÃO DE EMERGÊNCIA BEM-SUCEDIDA: ${funcionarios.length} funcionários recuperados!` 
        });
        onDataImported();
        setTimeout(() => setIsOpen(false), 3000);
      } else {
        setMessage({ 
          type: 'error', 
          text: '❌ NENHUM DADO RECUPERADO! Verifique se há dados em outras chaves.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `❌ Erro durante recuperação de emergência: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar dados em outras chaves
  const handleCheckOtherKeys = () => {
    try {
      const otherKeysData = checkForDataInOtherKeys();
      if (otherKeysData.length > 0) {
        const totalRecords = otherKeysData.reduce((sum, item) => sum + item.count, 0);
        setMessage({ 
          type: 'success', 
          text: `🔍 Dados encontrados em ${otherKeysData.length} chaves: ${totalRecords} registros totais! Verifique o console para detalhes.` 
        });
        
        // Mostrar detalhes no console
        console.log('🔍 Dados encontrados em outras chaves:', otherKeysData);
        otherKeysData.forEach(item => {
          console.log(`📁 Chave: ${item.key} | Registros: ${item.count} | Exemplo:`, item.sample);
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: '❌ Nenhum dado encontrado em outras chaves do localStorage.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `❌ Erro ao verificar outras chaves: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      });
    }
  };

  // 🚨🚨🚨 RECUPERAÇÃO ULTRA-EMERGÊNCIA - ÚLTIMA CHANCE!
  const handleUltraEmergencyRecovery = () => {
    setIsLoading(true);
    try {
      console.log('🚨🚨🚨 Iniciando recuperação ultra-emergência...');
      const funcionarios = ultraEmergencyRecovery();
      if (funcionarios.length > 0) {
        setMessage({ 
          type: 'success', 
          text: `🚨🚨🚨 RECUPERAÇÃO ULTRA-EMERGÊNCIA BEM-SUCEDIDA: ${funcionarios.length} funcionários recuperados!` 
        });
        onDataImported();
        setTimeout(() => setIsOpen(false), 4000);
      } else {
        setMessage({ 
          type: 'error', 
          text: '❌❌❌ NENHUM DADO RECUPERADO! Sistema criará dados de recuperação baseados na sua descrição.' 
        });
        onDataImported();
        setTimeout(() => setIsOpen(false), 4000);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `❌❌❌ Erro durante recuperação ultra-emergência: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔍 VERIFICAÇÃO AUTOMÁTICA DOS DADOS
  const handleAutoVerification = () => {
    try {
      console.log('🔍 Iniciando verificação automática dos dados...');
      const verification = verifyDataIntegrity();
      
      if (verification.isWorking) {
        setMessage({ 
          type: 'success', 
          text: `✅ VERIFICAÇÃO AUTOMÁTICA: Sistema funcionando perfeitamente! ${verification.totalFuncionarios} funcionários, ${verification.backupCount} backups ativos. Último backup: ${verification.lastBackup}` 
        });
        
        // Mostrar detalhes no console
        console.log('🔍 Resultado da verificação automática:', verification);
        console.log('📋 Detalhes:', verification.details);
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ VERIFICAÇÃO AUTOMÁTICA: Problemas detectados! ${verification.details}` 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `❌ Erro durante verificação automática: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      });
    }
  };

  const handleDiagnose = () => {
    console.log('🔍 Iniciando diagnóstico...');
    diagnoseLocalStorage();
    setMessage({ 
      type: 'success', 
      text: 'Diagnóstico executado! Verifique o console do navegador (F12 → Console) para ver os detalhes.' 
    });
  };

  const handleCheckIntegrity = () => {
    console.log('🔍 Verificando integridade dos dados...');
    const integrity = checkDataIntegrity();
    
    if (integrity.isValid) {
      setMessage({ 
        type: 'success', 
        text: `✅ Dados válidos! ${integrity.backupAvailable ? 'Backup disponível.' : 'Sem backup.'}` 
      });
    } else {
      const issuesText = integrity.issues.join(', ');
      setMessage({ 
        type: 'error', 
        text: `❌ Problemas detectados: ${issuesText}` 
      });
    }
    
    console.log('🔍 Resultado da verificação de integridade:', integrity);
  };

  const handleViewLogs = () => {
    console.log('📋 Carregando logs de operações...');
    const logs = getOperationLog();
    console.log('📋 Logs de operações:', logs);
    
    if (logs.length === 0) {
      setMessage({ type: 'success', text: '📋 Nenhum log de operação encontrado' });
    } else {
      setMessage({ 
        type: 'success', 
        text: `📋 ${logs.length} operações registradas. Verifique o console para detalhes.` 
      });
    }
  };

  const handleClearLogs = () => {
    clearOldLogs();
    setMessage({ 
      type: 'success', 
      text: '🧹 Logs antigos limpos! Mantidos apenas os 10 mais recentes.' 
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Upload size={20} />
        Migrar/Importar Dados
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Migração e Importação de Dados</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {message && (
              <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${
                message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Diagnóstico Avançado (Recomendado Primeiro)</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Verifica o estado atual do localStorage e valida a integridade dos dados.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={handleDiagnose}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    🔍 Diagnóstico Geral
                  </button>
                  <button
                    onClick={handleCheckIntegrity}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    ✅ Verificar Integridade
                  </button>
                  <button
                    onClick={handleViewLogs}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    📋 Ver Logs
                  </button>
                  <button
                    onClick={handleClearLogs}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    🧹 Limpar Logs
                  </button>
                </div>
                
                {/* 🔍 VERIFICAÇÃO AUTOMÁTICA DOS DADOS */}
                <div className="border-2 border-green-500 bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-700 flex items-center gap-2">
                    🔍 VERIFICAÇÃO AUTOMÁTICA DOS DADOS
                  </h4>
                  <p className="text-sm text-green-700 mb-2">
                    Clique aqui para verificar se os novos dados foram gravados corretamente!
                  </p>
                  <button
                    onClick={handleAutoVerification}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-bold"
                  >
                    🔍 VERIFICAR DADOS AUTOMATICAMENTE
                  </button>
                  <p className="text-xs text-green-600 mt-1 text-center">
                    ✅ Verifica estrutura, backups e campos novos automaticamente!
                  </p>
                </div>
                
                <p className="text-xs text-gray-500 mt-1">
                  Abra o console do navegador (F12) para ver os resultados detalhados.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Migração e Recuperação</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Tenta recuperar dados automaticamente de outras portas ou chaves de localStorage.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={handleMigrateFromOtherPorts}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    Tentar Migração Automática
                  </button>
                  <button
                    onClick={handleForceMigration}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    {isLoading ? 'Processando...' : 'Migração Forçada'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  A migração forçada é mais agressiva e tenta todas as estratégias possíveis.
                </p>
              </div>

              {/* 🔄 MIGRAÇÃO ENTRE DIFERENTES ACESSOS */}
              <div className="border-2 border-blue-500 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-700 flex items-center gap-2">
                  🔄 MIGRAÇÃO ENTRE DIFERENTES ACESSOS (IPs/Portas)
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  <strong>Problema identificado:</strong> Os dados cadastrados em um IP/porta não aparecem em outros acessos porque o localStorage é específico para cada domínio.
                </p>
                
                <div className="bg-white p-3 rounded-lg mb-3">
                  <h4 className="font-semibold mb-2 text-blue-800">📋 INSTRUÇÕES PARA MIGRAÇÃO:</h4>
                  <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                    <li><strong>1º Passo:</strong> No acesso onde há dados (ex: 172.16.50.30:3005), clique em "Exportar Backup"</li>
                    <li><strong>2º Passo:</strong> Salve o arquivo JSON no seu computador</li>
                    <li><strong>3º Passo:</strong> No novo acesso (ex: localhost:3005), use "Importar de JSON"</li>
                    <li><strong>4º Passo:</strong> Cole o conteúdo do arquivo JSON e clique em "Importar Dados"</li>
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={handleExport}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-bold"
                  >
                    📤 Exportar Dados (IP Atual)
                  </button>
                  <button
                    onClick={() => setJsonData('')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    🧹 Limpar Campo JSON
                  </button>
                </div>
                
                <p className="text-xs text-blue-600 mt-2 text-center">
                  💡 <strong>Dica:</strong> Use esta opção quando os dados estão em um IP mas não aparecem em outro!
                </p>
              </div>

              {/* 🚨 RECUPERAÇÃO DE EMERGÊNCIA */}
              <div className="border-2 border-red-500 bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-red-700 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  🚨 RECUPERAÇÃO DE EMERGÊNCIA (URGENTE!)
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  Use estas opções quando os dados foram perdidos e as migrações normais não funcionaram.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={handleCheckOtherKeys}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    🔍 Verificar Outras Chaves
                  </button>
                  <button
                    onClick={handleEmergencyRecovery}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors text-sm font-bold"
                  >
                    {isLoading ? '🚨 Processando...' : '🚨 RECUPERAÇÃO DE EMERGÊNCIA'}
                  </button>
                </div>
                <p className="text-xs text-red-600 mb-3">
                  ⚠️ A recuperação de emergência busca em TODAS as chaves do localStorage!
                </p>
              </div>

              {/* 🚨🚨🚨 RECUPERAÇÃO ULTRA-EMERGÊNCIA - ÚLTIMA CHANCE! */}
              <div className="border-4 border-red-700 bg-red-100 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-red-800 flex items-center gap-2 text-lg">
                  <AlertTriangle size={24} />
                  🚨🚨🚨 RECUPERAÇÃO ULTRA-EMERGÊNCIA - ÚLTIMA CHANCE!
                </h3>
                <p className="text-sm text-red-800 mb-3">
                  <strong>ESTA É A SUA ÚLTIMA CHANCE!</strong> Se nada funcionou até agora, este botão vai:
                </p>
                <ul className="text-xs text-red-700 mb-3 list-disc list-inside space-y-1">
                  <li>🔍 Verificar TODAS as chaves possíveis do localStorage</li>
                  <li>📱 Verificar sessionStorage também</li>
                  <li>🔄 Tentar múltiplas estratégias de normalização</li>
                  <li>🚨 Criar dados de recuperação baseados na sua descrição</li>
                </ul>
                <button
                  onClick={handleUltraEmergencyRecovery}
                  disabled={isLoading}
                  className="w-full bg-red-700 hover:bg-red-800 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors text-lg font-bold"
                >
                  {isLoading ? '🚨🚨🚨 PROCESSANDO...' : '🚨🚨🚨 RECUPERAÇÃO ULTRA-EMERGÊNCIA - ÚLTIMA CHANCE!'}
                </button>
                <p className="text-xs text-red-700 mt-2 text-center">
                  ⚠️⚠️⚠️ ESTE BOTÃO É SUA ÚLTIMA ESPERANÇA! ⚠️⚠️⚠️
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Importar de JSON</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Cole aqui os dados JSON dos funcionários para importar.
                </p>
                
                {/* Validação visual */}
                <div className="mb-2">
                  {jsonData.trim() && (
                    <div className="text-xs text-gray-600">
                      {(() => {
                        const trimmed = jsonData.trim();
                        const isDirectArray = trimmed.startsWith('[') && trimmed.endsWith(']');
                        const isObjectWithFuncionarios = trimmed.startsWith('{') && trimmed.includes('"funcionarios"');
                        
                        if (isDirectArray) {
                          return <span className="text-green-600">✅ Array direto de funcionários detectado</span>;
                        } else if (isObjectWithFuncionarios) {
                          return <span className="text-green-600">✅ Objeto com propriedade "funcionarios" detectado</span>;
                        } else {
                          return <span className="text-red-600">❌ Formato inválido: deve ser array [...] ou objeto com "funcionarios"</span>;
                        }
                      })()}
                      {jsonData.trim().length > 0 && (
                        <span className="ml-2 text-gray-500">
                          ({jsonData.trim().length} caracteres)
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  placeholder="Cole aqui os dados JSON... (aceita array direto [...] ou objeto com 'funcionarios' {...})"
                  className={`w-full h-32 p-3 border rounded-lg resize-none ${
                    jsonData.trim() && (!jsonData.trim().startsWith('[') && !jsonData.trim().includes('"funcionarios"'))
                      ? 'border-red-300 bg-red-50'
                      : jsonData.trim() && (jsonData.trim().startsWith('[') || jsonData.trim().includes('"funcionarios"'))
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
                />
                
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={handleImport}
                    disabled={isLoading || !jsonData.trim() || (!jsonData.trim().startsWith('[') && !jsonData.trim().includes('"funcionarios"'))}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Importar Dados
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setJsonData('')}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    🧹 Limpar
                  </button>
                </div>
                
                {/* Dicas de uso */}
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  <strong>💡 Dicas:</strong>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Os dados devem estar em formato JSON válido</li>
                    <li><strong>Formatos aceitos:</strong></li>
                    <li>• Array direto: <code>[{'{...}'}, {'{...}'}]</code></li>
                    <li>• Objeto com propriedade: <code>{"{funcionarios: [...]}"}</code></li>
                    <li>Cada funcionário deve ter "nomeCompleto" (ou "nome") e "empresa"</li>
                    <li>Use "Exportar Dados" no IP com dados para obter o formato correto</li>
                    <li>Verifique o console (F12) para logs detalhados da importação</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4. Exportar Backup</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Exporta todos os dados atuais para um arquivo JSON. Use para migrar dados entre diferentes acessos.
                </p>
                <button
                  onClick={handleExport}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Download size={20} />
                  Exportar Backup
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  💡 <strong>Importante:</strong> Salve este arquivo para migrar dados entre diferentes IPs/portas!
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-800">💡 SOLUÇÃO PARA MIGRAÇÃO ENTRE IPs:</h4>
              <p className="text-sm text-blue-700 mb-2">
                <strong>Problema:</strong> Os dados cadastrados em um IP (ex: 172.16.50.30:3005) não aparecem em outros acessos (ex: localhost:3005) porque o localStorage é específico para cada domínio.
              </p>
              <p className="text-sm text-blue-700">
                <strong>Solução:</strong> Use "Exportar Backup" no IP com dados, depois "Importar de JSON" no novo acesso. Esta é a única forma de migrar dados entre diferentes IPs/portas.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
