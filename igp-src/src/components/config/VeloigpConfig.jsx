import React, { useState, useEffect } from 'react';
import VeloigpCard from '../ui/VeloigpCard';
import VeloigpButton from '../ui/VeloigpButton';
import PageHeader from '../layout/PageHeader';
import { testarConexaoAPI, getVeloigpLogs } from '../../services/api55pbx-veloigp';
import './VeloigpConfig.css';

const VeloigpConfig = () => {
  const [token, setToken] = useState('');
  const [tokenSalvo, setTokenSalvo] = useState('');
  const [testando, setTestando] = useState(false);
  const [resultadoTeste, setResultadoTeste] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Carregar token salvo
    const tokenSalvo = localStorage.getItem('veloigp-api-token');
    if (tokenSalvo) {
      setToken(tokenSalvo);
      setTokenSalvo(tokenSalvo);
    }
    
    // Carregar logs
    atualizarLogs();
  }, []);

  const salvarToken = () => {
    if (token.trim()) {
      localStorage.setItem('veloigp-api-token', token.trim());
      setTokenSalvo(token.trim());
      setResultadoTeste({
        success: true,
        message: 'Token salvo com sucesso!'
      });
    } else {
      setResultadoTeste({
        success: false,
        message: 'Token não pode estar vazio!'
      });
    }
  };

  const testarToken = async () => {
    if (!token.trim()) {
      setResultadoTeste({
        success: false,
        message: 'Digite um token antes de testar!'
      });
      return;
    }

    setTestando(true);
    setResultadoTeste(null);

    try {
      // Salvar token temporariamente para teste
      const tokenAnterior = localStorage.getItem('veloigp-api-token');
      localStorage.setItem('veloigp-api-token', token.trim());

      const resultado = await testarConexaoAPI();
      
      if (resultado.connected) {
        setResultadoTeste({
          success: true,
          message: 'Token válido! Conexão com API estabelecida.'
        });
      } else {
        setResultadoTeste({
          success: false,
          message: `Falha na conexão: ${resultado.error}`
        });
      }

      // Restaurar token anterior se o teste falhou
      if (!resultado.connected && tokenAnterior) {
        localStorage.setItem('veloigp-api-token', tokenAnterior);
      }

    } catch (error) {
      setResultadoTeste({
        success: false,
        message: `Erro ao testar token: ${error.message}`
      });
    } finally {
      setTestando(false);
      atualizarLogs();
    }
  };

  const limparToken = () => {
    localStorage.removeItem('veloigp-api-token');
    setToken('');
    setTokenSalvo('');
    setResultadoTeste(null);
  };

  const atualizarLogs = () => {
    const logsAtuais = getVeloigpLogs();
    setLogs(logsAtuais);
  };

  const formatarToken = (token) => {
    if (!token) return '';
    if (token.length <= 20) return token;
    return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
  };

  return (
    <div className="dashboard-background">
      <div className="container-main">
        <PageHeader 
          title="Configurações da API"
          subtitle="Configure tokens, filtros e preferências do sistema"
        />
      </div>

      {/* Configuração do Token */}
      <VeloigpCard
        title="Token da API 55PBX"
        subtitle="Configure sua chave de acesso"
        icon="fas fa-key"
        className="container-main"
      >
        <div className="token-config">
          <div className="token-input-group">
            <label htmlFor="api-token">Token da API:</label>
            <div className="input-container">
              <input
                id="api-token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Digite seu token da API 55PBX"
                className="token-input"
              />
              <button
                type="button"
                onClick={() => setToken('')}
                className="clear-button"
                title="Limpar"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div className="token-actions">
            <VeloigpButton
              variant="primary"
              icon="fas fa-save"
              onClick={salvarToken}
              disabled={!token.trim()}
            >
              Salvar Token
            </VeloigpButton>

            <VeloigpButton
              variant="secondary"
              icon="fas fa-plug"
              onClick={testarToken}
              loading={testando}
              disabled={!token.trim()}
            >
              Testar Conexão
            </VeloigpButton>

            <VeloigpButton
              variant="danger"
              icon="fas fa-trash"
              onClick={limparToken}
              disabled={!tokenSalvo}
            >
              Limpar Token
            </VeloigpButton>
          </div>

          {/* Status do Token */}
          {tokenSalvo && (
            <div className="token-status">
              <div className="status-item">
                <span className="status-label">Token Salvo:</span>
                <span className="status-value">{formatarToken(tokenSalvo)}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Status:</span>
                <span className="status-indicator active">
                  <i className="fas fa-check-circle"></i>
                  Configurado
                </span>
              </div>
            </div>
          )}

          {/* Resultado do Teste */}
          {resultadoTeste && (
            <div className={`test-result ${resultadoTeste.success ? 'success' : 'error'}`}>
              <div className="result-icon">
                <i className={`fas fa-${resultadoTeste.success ? 'check-circle' : 'exclamation-triangle'}`}></i>
              </div>
              <div className="result-message">
                {resultadoTeste.message}
              </div>
            </div>
          )}
        </div>
      </VeloigpCard>

      {/* Informações da API */}
      <VeloigpCard
        title="Informações da API"
        subtitle="Detalhes sobre a integração"
        icon="fas fa-info-circle"
        className="container-main"
      >
        <div className="api-info">
          <div className="info-section">
            <h4>URL da API</h4>
            <p>https://reportapi02.55pbx.com:50500/api/pbx/reports/metrics</p>
          </div>
          
          <div className="info-section">
            <h4>Relatórios Disponíveis</h4>
            <ul>
              <li><strong>report_01:</strong> Métricas principais</li>
              <li><strong>report_02:</strong> Dados por hora</li>
              <li><strong>report_03:</strong> Performance de agentes</li>
              <li><strong>report_04:</strong> Dados de filas</li>
            </ul>
          </div>

          <div className="info-section">
            <h4>Formato de Data</h4>
            <p>Fri August 22 2025 14:30:45 GMT -0300</p>
          </div>

          <div className="info-section">
            <h4>Headers Obrigatórios</h4>
            <pre>
{`{
  "key": "SEU_TOKEN_AQUI",
  "Content-Type": "application/json",
  "Accept": "application/json"
}`}
            </pre>
          </div>
        </div>
      </VeloigpCard>

      {/* Logs da API */}
      <VeloigpCard
        title="Logs da API"
        subtitle="Histórico de operações"
        icon="fas fa-list-alt"
        className="container-main"
      >
        <div className="logs-content">
          <div className="logs-header">
            <VeloigpButton
              variant="secondary"
              size="small"
              icon="fas fa-refresh"
              onClick={atualizarLogs}
            >
              Atualizar Logs
            </VeloigpButton>
            <span className="logs-count">
              {logs.length} entradas
            </span>
          </div>
          
          <div className="logs-list">
            {logs.length === 0 ? (
              <div className="no-logs">
                <i className="fas fa-info-circle"></i>
                <p>Nenhum log disponível</p>
              </div>
            ) : (
              logs.slice(-20).reverse().map((log, index) => (
                <div key={index} className={`log-entry ${log.type}`}>
                  <div className="log-time">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </div>
                  <div className="log-message">
                    {log.message}
                  </div>
                  <div className="log-type">
                    <i className={`fas fa-${log.type === 'success' ? 'check' : log.type === 'error' ? 'times' : 'info'}`}></i>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </VeloigpCard>
    </div>
  );
};

export default VeloigpConfig;
