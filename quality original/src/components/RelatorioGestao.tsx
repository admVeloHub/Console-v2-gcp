import React, { useState, useEffect } from 'react';
import { Trophy, AlertTriangle, BarChart3, TrendingUp, Users, Calendar, Target } from 'lucide-react';
import { RelatorioGestao, MESES, ANOS } from '../types';
import { gerarRelatorioGestao } from '../utils/storage';

const RelatorioGestaoComponent: React.FC = () => {
  const [relatorio, setRelatorio] = useState<RelatorioGestao | null>(null);
  const [selectedMes, setSelectedMes] = useState<string>(new Date().toLocaleDateString('pt-BR', { month: 'long' }));
  const [selectedAno, setSelectedAno] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarRelatorio();
  }, [selectedMes, selectedAno]);

  const carregarRelatorio = async () => {
    setLoading(true);
    try {
      const data = gerarRelatorioGestao(selectedMes, selectedAno);
      setRelatorio(data);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankingClass = (posicao: number) => {
    if (posicao === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (posicao === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (posicao === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const getRankingIcon = (posicao: number) => {
    if (posicao === 1) return '🥇';
    if (posicao === 2) return '🥈';
    if (posicao === 3) return '🥉';
    return `${posicao}º`;
  };

  const getPerformanceClass = (nota: number) => {
    if (nota >= 80) return 'text-green-600 bg-green-100';
    if (nota >= 60) return 'text-yellow-600 bg-yellow-100';
    if (nota >= 0) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceText = (nota: number) => {
    if (nota >= 80) return 'Excelente';
    if (nota >= 60) return 'Bom';
    if (nota >= 0) return 'Regular';
    return 'Insuficiente';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velotax-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!relatorio) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <BarChart3 className="mx-auto h-12 w-12 mb-4" />
          <p>Nenhum relatório disponível para {selectedMes} {selectedAno}.</p>
          <p className="text-sm mt-2">Selecione outro período ou verifique se existem avaliações cadastradas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Relatório da Gestão - {selectedMes} {selectedAno}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Total de Avaliações</div>
              <div className="text-2xl font-bold text-blue-600">{relatorio.totalAvaliacoes}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Média Geral</div>
              <div className="text-2xl font-bold text-green-600">{relatorio.mediaGeral}</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mês
            </label>
            <select
              value={selectedMes}
              onChange={(e) => setSelectedMes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
            >
              {MESES.map((mes) => (
                <option key={mes} value={mes}>
                  {mes}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ano
            </label>
            <select
              value={selectedAno}
              onChange={(e) => setSelectedAno(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
            >
              {ANOS.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={carregarRelatorio}
              className="w-full px-4 py-2 bg-velotax-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Atualizar Relatório
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Melhores */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <Trophy className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Top 3 Melhores Analistas
            </h3>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {relatorio.top3Melhores.map((colaborador) => (
            <div key={colaborador.colaboradorId} className="p-6 hover:bg-green-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold ${getRankingClass(colaborador.posicao)}`}>
                    {getRankingIcon(colaborador.posicao)}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {colaborador.colaboradorNome}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Posição {colaborador.posicao} no ranking
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getPerformanceClass(colaborador.nota)} px-3 py-1 rounded-full`}>
                    {colaborador.nota} pts
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {getPerformanceText(colaborador.nota)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 3 Piores */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Top 3 Piores Analistas
            </h3>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {relatorio.top3Piores.map((colaborador) => (
            <div key={colaborador.colaboradorId} className="p-6 hover:bg-red-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold ${getRankingClass(colaborador.posicao)}`}>
                    {getRankingIcon(colaborador.posicao)}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {colaborador.colaboradorNome}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Posição {colaborador.posicao} no ranking
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getPerformanceClass(colaborador.nota)} px-3 py-1 rounded-full`}>
                    {colaborador.nota} pts
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {getPerformanceText(colaborador.nota)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking Completo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Ranking Completo da Equipe
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colaborador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {relatorio.colaboradores.map((colaborador) => (
                <tr key={colaborador.colaboradorId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${getRankingClass(colaborador.posicao)}`}>
                      {getRankingIcon(colaborador.posicao)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {colaborador.colaboradorNome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-gray-900">
                      {colaborador.nota} pts
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPerformanceClass(colaborador.nota)}`}>
                      {getPerformanceText(colaborador.nota)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {colaborador.posicao <= 3 ? (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      ) : colaborador.posicao >= relatorio.colaboradores.length - 2 ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Target className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="text-sm text-gray-500">
                        {colaborador.posicao <= 3 ? 'Destaque' : 
                         colaborador.posicao >= relatorio.colaboradores.length - 2 ? 'Atenção' : 
                         'Estável'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo Estatístico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Média da Equipe</p>
              <p className="text-2xl font-bold text-gray-900">{relatorio.mediaGeral}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Colaboradores</p>
              <p className="text-2xl font-bold text-gray-900">{relatorio.colaboradores.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Período</p>
              <p className="text-2xl font-bold text-gray-900">{selectedMes}</p>
              <p className="text-sm text-gray-500">{selectedAno}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatorioGestaoComponent;
