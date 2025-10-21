import React, { useState, useCallback } from 'react'
import './VerificacaoDados.css'

const VerificacaoDados = ({ dados, onClose }) => {
  const [verificando, setVerificando] = useState(false)
  const [resultados, setResultados] = useState(null)

  // Verificar dados dos comparativos
  const verificarComparativos = useCallback((dados) => {
    const verificacoes = {
      quantidadeChamadas: verificarQuantidadeChamadas(dados),
      avaliacaoAtendimento: verificarAvaliacaoAtendimento(dados),
      avaliacaoSolucao: verificarAvaliacaoSolucao(dados),
      tma: verificarTMA(dados),
      tme: verificarTME(dados),
      tmu: verificarTMU(dados)
    }
    return verificacoes
  }, [])

  // Verificar quantidade de chamadas
  const verificarQuantidadeChamadas = (dados) => {
    const totalRegistros = dados.length - 1
    const registrosValidos = dados.filter((record, index) => {
      if (index === 0) return false
      return record && record.length > 0
    }).length

    return {
      totalRegistros,
      registrosValidos,
      diferenca: totalRegistros - registrosValidos,
      status: registrosValidos === totalRegistros ? '✅ OK' : '⚠️ ATENÇÃO'
    }
  }

  // Verificar avaliação de atendimento
  const verificarAvaliacaoAtendimento = (dados) => {
    const avaliacoes = []
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i]
      let avaliacao = null
      
      if (Array.isArray(record)) {
        avaliacao = record[27] // Coluna AB
      } else if (typeof record === 'object') {
        avaliacao = record.pergunta2Atendente || record['Pergunta2 1 PERGUNTA ATENDENTE']
      }
      
      if (avaliacao && !isNaN(parseFloat(avaliacao))) {
        const valor = parseFloat(avaliacao)
        if (valor >= 1 && valor <= 5) {
          avaliacoes.push(valor)
        }
      }
    }

    const media = avaliacoes.length > 0 ? avaliacoes.reduce((a, b) => a + b, 0) / avaliacoes.length : 0
    
    return {
      totalAvaliacoes: avaliacoes.length,
      media: media.toFixed(2),
      min: Math.min(...avaliacoes),
      max: Math.max(...avaliacoes),
      valoresInvalidos: dados.length - 1 - avaliacoes.length,
      status: avaliacoes.length > 0 ? '✅ OK' : '❌ ERRO'
    }
  }

  // Verificar avaliação de solução
  const verificarAvaliacaoSolucao = (dados) => {
    const avaliacoes = []
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i]
      let avaliacao = null
      
      if (Array.isArray(record)) {
        avaliacao = record[28] // Coluna AC
      } else if (typeof record === 'object') {
        avaliacao = record.pergunta2Solucao || record['Pergunta2 2 PERGUNTA SOLUCAO']
      }
      
      if (avaliacao && !isNaN(parseFloat(avaliacao))) {
        const valor = parseFloat(avaliacao)
        if (valor >= 1 && valor <= 5) {
          avaliacoes.push(valor)
        }
      }
    }

    const media = avaliacoes.length > 0 ? avaliacoes.reduce((a, b) => a + b, 0) / avaliacoes.length : 0
    
    return {
      totalAvaliacoes: avaliacoes.length,
      media: media.toFixed(2),
      min: Math.min(...avaliacoes),
      max: Math.max(...avaliacoes),
      valoresInvalidos: dados.length - 1 - avaliacoes.length,
      status: avaliacoes.length > 0 ? '✅ OK' : '❌ ERRO'
    }
  }

  // Verificar TMA
  const verificarTMA = (dados) => {
    const tempos = []
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i]
      let tempo = null
      
      if (Array.isArray(record)) {
        tempo = record[14] // Coluna O
      } else if (typeof record === 'object') {
        tempo = record.tempoTotal || record['Tempo Total']
      }
      
      if (tempo && typeof tempo === 'string' && tempo.includes(':')) {
        const minutos = parseDurationToMinutes(tempo)
        if (minutos > 0) {
          tempos.push(minutos)
        }
      }
    }

    const media = tempos.length > 0 ? tempos.reduce((a, b) => a + b, 0) / tempos.length : 0
    
    return {
      totalTempos: tempos.length,
      mediaMinutos: media.toFixed(2),
      mediaFormatada: formatarTempo(media),
      min: Math.min(...tempos),
      max: Math.max(...tempos),
      valoresInvalidos: dados.length - 1 - tempos.length,
      status: tempos.length > 0 ? '✅ OK' : '❌ ERRO'
    }
  }

  // Verificar TME
  const verificarTME = (dados) => {
    const tempos = []
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i]
      let tempo = null
      
      if (Array.isArray(record)) {
        tempo = record[12] // Coluna M
      } else if (typeof record === 'object') {
        tempo = record.tempoEspera || record['Tempo De Espera']
      }
      
      if (tempo && typeof tempo === 'string' && tempo.includes(':')) {
        const minutos = parseDurationToMinutes(tempo)
        tempos.push(minutos)
      }
    }

    const media = tempos.length > 0 ? tempos.reduce((a, b) => a + b, 0) / tempos.length : 0
    
    return {
      totalTempos: tempos.length,
      mediaMinutos: media.toFixed(2),
      mediaFormatada: formatarTempo(media),
      min: Math.min(...tempos),
      max: Math.max(...tempos),
      valoresZero: tempos.filter(t => t === 0).length,
      status: tempos.length > 0 ? '✅ OK' : '❌ ERRO'
    }
  }

  // Verificar TMU
  const verificarTMU = (dados) => {
    const tempos = []
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i]
      let tempo = null
      
      if (Array.isArray(record)) {
        tempo = record[11] // Coluna L
      } else if (typeof record === 'object') {
        tempo = record.tempoURA || record['Tempo Na Ura']
      }
      
      if (tempo && typeof tempo === 'string' && tempo.includes(':')) {
        const minutos = parseDurationToMinutes(tempo)
        tempos.push(minutos)
      }
    }

    const media = tempos.length > 0 ? tempos.reduce((a, b) => a + b, 0) / tempos.length : 0
    
    return {
      totalTempos: tempos.length,
      mediaMinutos: media.toFixed(2),
      mediaFormatada: formatarTempo(media),
      min: Math.min(...tempos),
      max: Math.max(...tempos),
      valoresZero: tempos.filter(t => t === 0).length,
      status: tempos.length > 0 ? '✅ OK' : '❌ ERRO'
    }
  }

  // Verificar dados dos agentes
  const verificarAgentes = useCallback((dados) => {
    const operadores = new Map()
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i]
      let operador = null
      
      if (Array.isArray(record)) {
        operador = record[1] // Coluna B
      } else if (typeof record === 'object') {
        operador = record.operador || record['Operador']
      }
      
      if (operador && typeof operador === 'string' && operador.trim() !== '') {
        const nomeOperador = operador.trim()
        
        if (isOperadorValido(nomeOperador)) {
          if (!operadores.has(nomeOperador)) {
            operadores.set(nomeOperador, {
              nome: nomeOperador,
              chamadas: 0,
              avaliacoes: [],
              tempos: []
            })
          }
          
          const op = operadores.get(nomeOperador)
          op.chamadas++
          
          // Adicionar avaliação
          let avaliacao = null
          if (Array.isArray(record)) {
            avaliacao = record[27]
          } else if (typeof record === 'object') {
            avaliacao = record.pergunta2Atendente || record['Pergunta2 1 PERGUNTA ATENDENTE']
          }
          
          if (avaliacao && !isNaN(parseFloat(avaliacao))) {
            const valor = parseFloat(avaliacao)
            if (valor >= 1 && valor <= 5) {
              op.avaliacoes.push(valor)
            }
          }
          
          // Adicionar tempo
          let tempo = null
          if (Array.isArray(record)) {
            tempo = record[14]
          } else if (typeof record === 'object') {
            tempo = record.tempoTotal || record['Tempo Total']
          }
          
          if (tempo && typeof tempo === 'string' && tempo.includes(':')) {
            const minutos = parseDurationToMinutes(tempo)
            if (minutos > 0) {
              op.tempos.push(minutos)
            }
          }
        }
      }
    }

    const agentes = Array.from(operadores.values()).map(op => ({
      nome: op.nome,
      chamadas: op.chamadas,
      notaMedia: op.avaliacoes.length > 0 ? (op.avaliacoes.reduce((a, b) => a + b, 0) / op.avaliacoes.length).toFixed(2) : '0.00',
      tempoMedio: op.tempos.length > 0 ? formatarTempo(op.tempos.reduce((a, b) => a + b, 0) / op.tempos.length) : '0:00',
      avaliacoesValidas: op.avaliacoes.length,
      temposValidos: op.tempos.length
    }))

    agentes.sort((a, b) => parseFloat(b.notaMedia) - parseFloat(a.notaMedia))

    return {
      totalAgentes: agentes.length,
      agentes: agentes.slice(0, 10),
      operadoresInvalidos: contarOperadoresInvalidos(dados),
      status: agentes.length > 0 ? '✅ OK' : '❌ ERRO'
    }
  }, [])

  // Verificar se operador é válido
  const isOperadorValido = (nome) => {
    const operadoresInvalidos = [
      'sem operador', 'desl', 'excluídos', 'agentes indisponíveis', 
      'rejeitaram', 'sem operador', 'desligados', 'n/a', 'null', 
      'undefined', '', ' ', '0', '1', '2', '3', '4', '5'
    ]
    
    const nomeLower = nome.toLowerCase().trim()
    return !operadoresInvalidos.includes(nomeLower) && 
           !/^\d+$/.test(nomeLower) && 
           nomeLower.length > 2
  }

  // Contar operadores inválidos
  const contarOperadoresInvalidos = (dados) => {
    const operadoresInvalidos = new Set()
    
    for (let i = 1; i < dados.length; i++) {
      const record = dados[i]
      let operador = null
      
      if (Array.isArray(record)) {
        operador = record[1]
      } else if (typeof record === 'object') {
        operador = record.operador || record['Operador']
      }
      
      if (operador && !isOperadorValido(operador)) {
        operadoresInvalidos.add(operador.trim())
      }
    }
    
    return Array.from(operadoresInvalidos)
  }

  // Converter tempo para minutos
  const parseDurationToMinutes = (durationString) => {
    if (!durationString || typeof durationString !== 'string') return 0
    
    const timeMatch = durationString.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const seconds = parseInt(timeMatch[3], 10);
      return (hours * 60) + minutes + (seconds / 60);
    }
    
    return parseFloat(durationString) || 0;
  }

  // Formatar tempo
  const formatarTempo = (minutos) => {
    if (minutos === 0) return '0:00';

    const horas = Math.floor(minutos / 60);
    const mins = Math.floor(minutos % 60);
    const segs = Math.round((minutos % 1) * 60);
    
    if (horas > 0) {
      return `${horas}:${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    } else if (mins > 0) {
      return `${mins}:${segs.toString().padStart(2, '0')}`;
    } else {
      return `0:${segs.toString().padStart(2, '0')}`;
    }
  }

  // Executar verificação completa
  const executarVerificacao = async () => {
    setVerificando(true)
    
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const comparativos = verificarComparativos(dados)
      const agentes = verificarAgentes(dados)
      
      setResultados({
        comparativos,
        agentes,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Erro na verificação:', error)
    } finally {
      setVerificando(false)
    }
  }

  if (verificando) {
    return (
      <div className="verificacao-container">
        <div className="verificacao-loading">
          <div className="loading-spinner">🔍</div>
          <h3>Verificando Dados...</h3>
          <p>Analisando métricas e agentes...</p>
        </div>
      </div>
    )
  }

  if (resultados) {
    return (
      <div className="verificacao-container">
        <div className="verificacao-header">
          <h2>📊 Relatório de Verificação</h2>
          <button className="btn-fechar" onClick={onClose}>❌</button>
        </div>
        
        <div className="verificacao-content">
          <div className="verificacao-section">
            <h3>🔍 Comparativos Temporais</h3>
            <div className="metricas-grid">
              {Object.entries(resultados.comparativos).map(([metrica, dados]) => (
                <div key={metrica} className="metrica-card">
                  <div className="metrica-nome">{metrica}</div>
                  <div className="metrica-status">{dados.status}</div>
                  <div className="metrica-detalhes">
                    {metrica === 'quantidadeChamadas' && (
                      <>
                        <div>Total: {dados.totalRegistros}</div>
                        <div>Válidos: {dados.registrosValidos}</div>
                      </>
                    )}
                    {metrica.includes('avaliacao') && (
                      <>
                        <div>Média: {dados.media}/5</div>
                        <div>Válidas: {dados.totalAvaliacoes}</div>
                      </>
                    )}
                    {metrica.includes('tma') || metrica.includes('tme') || metrica.includes('tmu') && (
                      <>
                        <div>Média: {dados.mediaFormatada}</div>
                        <div>Válidos: {dados.totalTempos}</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="verificacao-section">
            <h3>👤 Agentes</h3>
            <div className="agentes-info">
              <div className="info-card">
                <div className="info-label">Total de Agentes</div>
                <div className="info-value">{resultados.agentes.totalAgentes}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Status</div>
                <div className="info-value">{resultados.agentes.status}</div>
              </div>
            </div>
            
            <div className="agentes-lista">
              <h4>Top 10 Agentes</h4>
              {resultados.agentes.agentes.map((agente, index) => (
                <div key={index} className="agente-item">
                  <div className="agente-nome">{agente.nome}</div>
                  <div className="agente-metricas">
                    <span>Chamadas: {agente.chamadas}</span>
                    <span>Nota: {agente.notaMedia}/5</span>
                    <span>Tempo: {agente.tempoMedio}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="verificacao-container">
      <div className="verificacao-header">
        <h2>🔍 Verificação de Dados</h2>
        <button className="btn-fechar" onClick={onClose}>❌</button>
      </div>
      
      <div className="verificacao-content">
        <div className="verificacao-info">
          <p>Este sistema irá verificar automaticamente:</p>
          <ul>
            <li>📊 Métricas dos comparativos temporais</li>
            <li>👤 Dados dos agentes</li>
            <li>🧮 Cálculos e fórmulas</li>
            <li>📈 Validação de dados</li>
          </ul>
        </div>
        
        <button className="btn-verificar" onClick={executarVerificacao}>
          🔍 Iniciar Verificação
        </button>
      </div>
    </div>
  )
}

export default VerificacaoDados
