import React, { useState, useEffect } from 'react';
import { Settings, Key, TestTube, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { configureGPT, getGPTStatus, testGPTConnection, getGPTStats } from '../services/gptService';

interface GPTConfigProps {
  onClose: () => void;
}

const GPTConfig: React.FC<GPTConfigProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadStatus();
    loadStats();
  }, []);

  const loadStatus = () => {
    const currentStatus = getGPTStatus();
    setStatus(currentStatus);
    
    // Carregar API key do localStorage se existir
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  };

  const loadStats = () => {
    const currentStats = getGPTStats();
    setStats(currentStats);
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Por favor, insira uma chave de API válida.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      configureGPT(apiKey.trim());
      await loadStatus();
      setMessage({ type: 'success', text: 'Configuração salva com sucesso!' });
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: `Erro ao salvar configuração: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Configure uma chave de API antes de testar a conexão.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setMessage(null);

    try {
      const result = await testGPTConnection();
      setTestResult(result);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
      
      // Limpar mensagem após 5 segundos
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setTestResult({ success: false, message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
      setMessage({ type: 'error', text: `Erro ao testar conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearConfig = () => {
    if (confirm('Tem certeza que deseja limpar a configuração da API? Isso desabilitará as análises automáticas.')) {
      configureGPT('');
      setApiKey('');
      loadStatus();
      setMessage({ type: 'info', text: 'Configuração da API foi limpa.' });
      
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getStatusColor = (configured: boolean) => {
    return configured ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (configured: boolean) => {
    return configured ? CheckCircle : AlertCircle;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Configuração do Agente GPT</h3>
              <p className="text-sm text-gray-600">
                Configure a API OpenAI para análises automáticas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Atual */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">Status Atual</h4>
            {status && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <div className="flex items-center space-x-2">
                    {React.createElement(getStatusIcon(status.configured), { 
                      className: `h-4 w-4 ${getStatusColor(status.configured)}` 
                    })}
                    <span className={`text-sm font-medium ${getStatusColor(status.configured)}`}>
                      {status.configured ? 'Configurado' : 'Não Configurado'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Modelo:</span>
                  <span className="text-sm font-medium text-gray-800">{status.model}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Fallback:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {status.fallbackEnabled ? 'Ativado' : 'Desativado'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">API Key:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {status.hasApiKey ? 'Configurada' : 'Não configurada'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Configuração da API */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Configuração da API OpenAI</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave da API OpenAI
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Sua chave da API é armazenada localmente e nunca é enviada para nossos servidores.
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving || !apiKey.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Key className="h-4 w-4" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Configuração'}</span>
              </button>
              
              <button
                onClick={handleTestConnection}
                disabled={isTesting || !apiKey.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <TestTube className="h-4 w-4" />
                <span>{isTesting ? 'Testando...' : 'Testar Conexão'}</span>
              </button>
              
              <button
                onClick={handleClearConfig}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Limpar Configuração
              </button>
            </div>
          </div>

          {/* Resultado do Teste */}
          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.message}
                </span>
              </div>
              
              {testResult.details && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Modelos disponíveis: {testResult.details.availableModels}</p>
                  <p>Modelo configurado: {testResult.details.configuredModel}</p>
                </div>
              )}
            </div>
          )}

          {/* Estatísticas de Uso */}
          {stats && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-3">Estatísticas de Uso</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalAnalyses}</div>
                  <div className="text-sm text-blue-700">Total de Análises</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.apiCalls}</div>
                  <div className="text-sm text-green-700">Chamadas API</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.fallbackUses}</div>
                  <div className="text-sm text-orange-700">Usos Fallback</div>
                </div>
              </div>
            </div>
          )}

          {/* Mensagens */}
          {message && (
            <div className={`p-4 rounded-lg border ${
              message.type === 'success' ? 'bg-green-50 border-green-200' :
              message.type === 'error' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : message.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                )}
                <span className={`text-sm ${
                  message.type === 'success' ? 'text-green-800' :
                  message.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {message.text}
                </span>
              </div>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Como Obter sua Chave da API</h4>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Acesse <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-800">OpenAI Platform</a></li>
              <li>Faça login ou crie uma conta</li>
              <li>Vá para "API Keys" no menu lateral</li>
              <li>Clique em "Create new secret key"</li>
              <li>Copie a chave gerada (começa com "sk-")</li>
              <li>Cole a chave no campo acima</li>
            </ol>
            <p className="text-xs text-yellow-600 mt-2">
              <strong>Nota:</strong> A chave da API é necessária para análises automáticas. Sem ela, o sistema usará análises simuladas.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GPTConfig;
