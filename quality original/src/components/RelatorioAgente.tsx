import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar, Target, Award } from 'lucide-react';
import { RelatorioAgente, Avaliacao, MESES, ANOS } from '../types';
import { getAvaliacoesPorColaborador } from '../utils/storage';

interface RelatorioAgenteProps {
  colaboradorId: string;
  colaboradorNome: string;
}

const RelatorioAgenteComponent: React.FC<RelatorioAgenteProps> = ({
  colaboradorId,
  colaboradorNome
}) => {
  const [relatorio, setRelatorio] = useState<RelatorioAgente | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [filterMes, setFilterMes] = useState<string>('');
  const [filterAno, setFilterAno] = useState<number>(0);

  useEffect(() => {
    console.log('🔄 useEffect executado - colaboradorId:', colaboradorId, 'filterMes:', filterMes, 'filterAno:', filterAno);
    if (colaboradorId) {
      carregarDados();
    } else {
      console.log('❌ ColaboradorId não definido, pulando carregamento');
      setRelatorio(null);
      setAvaliacoes([]);
    }
  }, [colaboradorId, filterMes, filterAno]);

  const carregarDados = () => {
    if (!colaboradorId) {
      console.log('❌ ColaboradorId não definido, pulando carregamento');
      return;
    }
    
    console.log('🔍 Carregando dados para colaborador:', colaboradorId);
    const todasAvaliacoes = getAvaliacoesPorColaborador(colaboradorId);
    console.log('📊 Total de avaliações encontradas:', todasAvaliacoes.length);
    
    let avaliacoesFiltradas = todasAvaliacoes;

    if (filterMes) {
      avaliacoesFiltradas = avaliacoesFiltradas.filter(a => a.mes === filterMes);
      console.log('📅 Filtrado por mês:', filterMes, 'Resultado:', avaliacoesFiltradas.length);
    }
    if (filterAno) {
      avaliacoesFiltradas = avaliacoesFiltradas.filter(a => a.ano === filterAno);
      console.log('📅 Filtrado por ano:', filterAno, 'Resultado:', avaliacoesFiltradas.length);
    }

    setAvaliacoes(avaliacoesFiltradas);
    gerarRelatorio(avaliacoesFiltradas);
  };

  const gerarRelatorio = (avaliacoesFiltradas: Avaliacao[]) => {
    console.log('📈 Gerando relatório para', avaliacoesFiltradas.length, 'avaliações');
    
    if (avaliacoesFiltradas.length === 0) {
      console.log('❌ Nenhuma avaliação para gerar relatório');
      setRelatorio(null);
      return;
    }

    const notasAvaliador = avaliacoesFiltradas.map(a => a.pontuacaoTotal);
    console.log('📊 Notas do avaliador:', notasAvaliador);
    
    const notasGPT = avaliacoesFiltradas
      .filter(a => a.avaliacaoGPT)
      .map(a => a.avaliacaoGPT!.pontuacaoGPT);
    console.log('🤖 Notas do GPT:', notasGPT);

    const mediaAvaliador = notasAvaliador.reduce((a, b) => a + b, 0) / notasAvaliador.length;
    const mediaGPT = notasGPT.length > 0 ? notasGPT.reduce((a, b) => a + b, 0) / notasGPT.length : 0;

    // Calcular tendência (últimas 3 avaliações)
    const ultimasAvaliacoes = avaliacoesFiltradas
      .sort((a, b) => new Date(b.dataAvaliacao).getTime() - new Date(a.dataAvaliacao).getTime())
      .slice(0, 3);

    let tendencia: 'melhorando' | 'piorando' | 'estavel' = 'estavel';
    if (ultimasAvaliacoes.length >= 2) {
      const primeira = ultimasAvaliacoes[ultimasAvaliacoes.length - 1].pontuacaoTotal;
      const ultima = ultimasAvaliacoes[0].pontuacaoTotal;
      if (ultima > primeira) tendencia = 'melhorando';
      else if (ultima < primeira) tendencia = 'piorando';
    }

    const novoRelatorio: RelatorioAgente = {
      colaboradorId,
      colaboradorNome,
      avaliacoes: avaliacoesFiltradas,
      mediaAvaliador: Math.round(mediaAvaliador * 100) / 100,
      mediaGPT: Math.round(mediaGPT * 100) / 100,
      totalAvaliacoes: avaliacoesFiltradas.length,
      melhorNota: Math.max(...notasAvaliador),
      piorNota: Math.min(...notasAvaliador),
      tendencia
    };

    setRelatorio(novoRelatorio);
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'melhorando':
        return <TrendingUp className="text-green-500" size={20} />;
      case 'piorando':
        return <TrendingDown className="text-red-500" size={20} />;
      default:
        return <Minus className="text-gray-500" size={20} />;
    }
  };

  const getTendenciaText = (tendencia: string) => {
    switch (tendencia) {
      case 'melhorando':
        return 'Melhorando';
      case 'piorando':
        return 'Precisa de atenção';
      default:
        return 'Estável';
    }
  };

  const getTendenciaClass = (tendencia: string) => {
    switch (tendencia) {
      case 'melhorando':
        return 'text-green-600 bg-green-100';
      case 'piorando':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!relatorio) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <BarChart3 className="mx-auto h-12 w-12 mb-4" />
          <p>Nenhuma avaliação encontrada para este colaborador no período selecionado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Relatório do Agente: {colaboradorNome}
          </h2>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTendenciaClass(relatorio.tendencia)}`}>
              {getTendenciaIcon(relatorio.tendencia)}
              <span className="ml-2">{getTendenciaText(relatorio.tendencia)}</span>
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Mês
            </label>
            <select
              value={filterMes}
              onChange={(e) => setFilterMes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
            >
              <option value="">Todos os meses</option>
              {MESES.map((mes) => (
                <option key={mes} value={mes}>
                  {mes}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Ano
            </label>
            <select
              value={filterAno}
              onChange={(e) => setFilterAno(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
            >
              <option value={0}>Todos os anos</option>
              {ANOS.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterMes('');
                setFilterAno(0);
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Avaliações</p>
              <p className="text-2xl font-bold text-gray-900">{relatorio.totalAvaliacoes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Média Avaliador</p>
              <p className="text-2xl font-bold text-gray-900">{relatorio.mediaAvaliador}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Média GPT</p>
              <p className="text-2xl font-bold text-gray-900">{relatorio.mediaGPT}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Melhor Nota</p>
              <p className="text-2xl font-bold text-gray-900">{relatorio.melhorNota}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Tendência */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendência de Performance</h3>
        <div className="space-y-4">
          {avaliacoes
            .sort((a, b) => new Date(a.dataAvaliacao).getTime() - new Date(b.dataAvaliacao).getTime())
            .map((avaliacao) => (
              <div key={avaliacao.id} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-gray-500">
                  {formatDate(avaliacao.dataAvaliacao)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-velotax-blue"></div>
                    <span className="text-sm font-medium">
                      {avaliacao.pontuacaoTotal} pontos
                    </span>
                    {avaliacao.avaliacaoGPT && (
                      <>
                        <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                        <span className="text-sm text-purple-600">
                          GPT: {avaliacao.avaliacaoGPT.pontuacaoGPT} pts
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {avaliacao.mes} {avaliacao.ano}
                </div>
              </div>
            ))}
        </div>
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-velotax-blue"></div>
            <span>Avaliador</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>GPT</span>
          </div>
        </div>
      </div>

      {/* Histórico Detalhado */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Histórico Detalhado de Avaliações
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {avaliacoes
            .sort((a, b) => new Date(b.dataAvaliacao).getTime() - new Date(a.dataAvaliacao).getTime())
            .map((avaliacao) => (
              <div key={avaliacao.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {formatDate(avaliacao.dataAvaliacao)}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {avaliacao.mes} {avaliacao.ano}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-gray-800">
                      {avaliacao.pontuacaoTotal} pts
                    </span>
                    {avaliacao.avaliacaoGPT && (
                      <span className="text-sm text-purple-600 font-medium">
                        GPT: {avaliacao.avaliacaoGPT.pontuacaoGPT} pts
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  <div className={`text-xs px-2 py-1 rounded ${avaliacao.saudacaoAdequada ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    Saudação: {avaliacao.saudacaoAdequada ? '✓' : '✗'}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${avaliacao.escutaAtiva ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    Escuta: {avaliacao.escutaAtiva ? '✓' : '✗'}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${avaliacao.resolucaoQuestao ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    Resolução: {avaliacao.resolucaoQuestao ? '✓' : '✗'}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${avaliacao.empatiaCordialidade ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    Empatia: {avaliacao.empatiaCordialidade ? '✓' : '✗'}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Avaliador:</span> {avaliacao.avaliador}
                  {avaliacao.observacoesModeracao && (
                    <span className="ml-4">
                      <span className="font-medium">Obs:</span> {avaliacao.observacoesModeracao}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RelatorioAgenteComponent;
