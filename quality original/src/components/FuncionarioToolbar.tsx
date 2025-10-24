import React, { useState } from 'react';
import { FileSpreadsheet, FileText, BarChart3, X, Building, Calendar, User } from 'lucide-react';
import { DataMigration } from './DataMigration';
import { Funcionario } from '../types';

interface FuncionarioToolbarProps {
  funcionarios: Funcionario[];
  onExportExcel: () => void;
  onExportPDF: () => void;
  onDataImported: () => void;
}

const FuncionarioToolbar: React.FC<FuncionarioToolbarProps> = ({
  funcionarios,
  onExportExcel,
  onExportPDF,
  onDataImported
}) => {
  const [showStats, setShowStats] = useState(false);

  // Calcular estatísticas
  const stats = {
    porEmpresa: funcionarios.reduce((acc, func) => {
      const empresa = func.empresa || 'Não informado';
      acc[empresa] = (acc[empresa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    porEscala: funcionarios.reduce((acc, func) => {
      const escala = func.escala || 'Não informado';
      acc[escala] = (acc[escala] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    porAtuacao: funcionarios.reduce((acc, func) => {
      const atuacao = func.atuacao || 'Não informado';
      acc[atuacao] = (acc[atuacao] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  // Calcular estatísticas de atuação por empresa
  const statsAtuacaoPorEmpresa = funcionarios.reduce((acc, func) => {
    const atuacao = func.atuacao || 'Não informado';
    const empresa = func.empresa || 'Não informado';
    
    if (!acc[atuacao]) {
      acc[atuacao] = {
        Velotax: 0,
        Job: 0,
        Total: 0
      };
    }
    
    // Contar por empresa
    if (empresa === 'Velotax') {
      acc[atuacao].Velotax++;
    } else if (empresa === 'Job Center' || empresa === 'Job') {
      acc[atuacao].Job++;
    }
    
    // Total geral
    acc[atuacao].Total++;
    
    return acc;
  }, {} as Record<string, { Velotax: number; Job: number; Total: number }>);

  // Calcular estatísticas específicas por status
  const funcionariosAtivos = funcionarios.filter(f => !f.desligado && !f.afastado);
  const funcionariosDesligados = funcionarios.filter(f => f.desligado);
  const funcionariosAfastados = funcionarios.filter(f => f.afastado);

  // Calcular estatísticas por empresa separadas por status
  const statsPorEmpresaStatus = {
    'JOB': {
      ativos: funcionarios.filter(f => 
        (f.empresa === 'Job Center' || f.empresa === 'Job') && 
        !f.desligado && !f.afastado
      ).length,
      afastados: funcionarios.filter(f => 
        (f.empresa === 'Job Center' || f.empresa === 'Job') && 
        f.afastado
      ).length,
      desligados: funcionarios.filter(f => 
        (f.empresa === 'Job Center' || f.empresa === 'Job') && 
        f.desligado
      ).length
    },
    'Velotax': {
      ativos: funcionarios.filter(f => 
        f.empresa === 'Velotax' && 
        !f.desligado && !f.afastado
      ).length,
      afastados: funcionarios.filter(f => 
        f.empresa === 'Velotax' && 
        f.afastado
      ).length,
      desligados: funcionarios.filter(f => 
        f.empresa === 'Velotax' && 
        f.desligado
      ).length
    }
  };

  // Calcular Job 6x1 apenas com status Ativo
  const job6x1Ativos = funcionarios.filter(f => 
    (f.empresa === 'Job Center' || f.empresa === 'Job') && 
    f.escala === '6x1' && 
    !f.desligado && !f.afastado
  ).length;

  return (
    <>
      {/* Barra de Ferramentas */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Funcionários</h1>
          
          <div className="flex items-center space-x-3">
            {/* Botão de Estatísticas */}
            <button
              onClick={() => setShowStats(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Ver Estatísticas"
            >
              <BarChart3 className="h-4 w-4 mr-2" /> Estatísticas
            </button>
            
            {/* Botão de Migração de Dados */}
            <DataMigration onDataImported={onDataImported} />
            
            {/* Botão de Exportar Excel */}
            <button
              onClick={onExportExcel}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
            </button>
            
            {/* Botão de Exportar PDF */}
            <button
              onClick={onExportPDF}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Estatísticas */}
      {showStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Estatísticas do Sistema
                </h2>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Estatísticas por Empresa */}
                <div className="bg-blue-50 rounded-lg p-4 xl:col-span-5">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Por Empresa
                  </h3>
                  
                  {/* Tabela de Empresa por Status */}
                  <div className="mb-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-blue-200">
                            <th className="text-left py-3 px-3 font-semibold text-blue-800">Empresa</th>
                            <th className="text-center py-3 px-3 font-semibold text-blue-800">Ativos</th>
                            <th className="text-center py-3 px-3 font-semibold text-blue-800">Afastados</th>
                            <th className="text-center py-3 px-3 font-semibold text-blue-800">Desligados</th>
                            <th className="text-center py-3 px-3 font-semibold text-blue-800">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* JOB */}
                          <tr className="border-b border-blue-100">
                            <td className="py-3 px-3 text-blue-800 font-medium">JOB</td>
                            <td className="py-3 px-3 text-center">
                              <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                                {statsPorEmpresaStatus['JOB'].ativos}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                                {statsPorEmpresaStatus['JOB'].afastados}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                                {statsPorEmpresaStatus['JOB'].desligados}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                                {statsPorEmpresaStatus['JOB'].ativos + statsPorEmpresaStatus['JOB'].afastados + statsPorEmpresaStatus['JOB'].desligados}
                              </span>
                            </td>
                          </tr>
                          
                          {/* Velotax */}
                          <tr className="border-b border-blue-100">
                            <td className="py-3 px-3 text-blue-800 font-medium">Velotax</td>
                            <td className="py-3 px-3 text-center">
                              <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                                {statsPorEmpresaStatus['Velotax'].ativos}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                                {statsPorEmpresaStatus['Velotax'].afastados}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                                {statsPorEmpresaStatus['Velotax'].desligados}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                                {statsPorEmpresaStatus['Velotax'].ativos + statsPorEmpresaStatus['Velotax'].afastados + statsPorEmpresaStatus['Velotax'].desligados}
                              </span>
                            </td>
                          </tr>
                          
                          {/* Total Geral */}
                          <tr className="border-t-2 border-blue-300 bg-blue-100">
                            <td className="py-3 px-3 text-blue-900 font-bold">TOTAL GERAL</td>
                            <td className="py-3 px-3 text-center">
                              <span className="bg-green-300 text-green-900 px-2 py-1 rounded-full text-xs font-bold">
                                {statsPorEmpresaStatus['JOB'].ativos + statsPorEmpresaStatus['Velotax'].ativos}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="bg-yellow-300 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                                {statsPorEmpresaStatus['JOB'].afastados + statsPorEmpresaStatus['Velotax'].afastados}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="bg-red-300 text-red-900 px-2 py-1 rounded-full text-xs font-bold">
                                {statsPorEmpresaStatus['JOB'].desligados + statsPorEmpresaStatus['Velotax'].desligados}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="bg-blue-300 text-blue-900 px-2 py-1 rounded-full text-xs font-bold">
                                {funcionarios.length}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Resumo Simples (mantido para compatibilidade) */}
                  <div className="border-t border-blue-200 pt-3">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Resumo por Empresa</h4>
                    <div className="space-y-1">
                      {Object.entries(stats.porEmpresa)
                        .sort(([,a], [,b]) => b - a)
                        .map(([empresa, count]) => (
                          <div key={empresa} className="flex justify-between items-center">
                            <span className="text-xs text-blue-700">{empresa}</span>
                            <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                              {count}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Estatísticas por Escala */}
                <div className="bg-green-50 rounded-lg p-4 xl:col-span-2">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Por Escala
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(stats.porEscala)
                      .sort(([,a], [,b]) => b - a)
                      .map(([escala, count]) => (
                        <div key={escala} className="flex justify-between items-center">
                          <span className={`text-sm font-medium ${
                            escala.toLowerCase() === 'afastada' 
                              ? 'text-yellow-600 font-bold' 
                              : 'text-green-800'
                          }`}>
                            {escala}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            escala.toLowerCase() === 'afastada'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-green-200 text-green-800'
                          }`}>
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Estatísticas por Atuação */}
                <div className="bg-purple-50 rounded-lg p-4 xl:col-span-5">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Por Atuação
                  </h3>
                  
                  {/* Tabela de Atuação por Empresa */}
                  <div className="mb-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-purple-200">
                            <th className="text-left py-3 px-3 font-semibold text-purple-800">Atuação</th>
                            <th className="text-center py-3 px-3 font-semibold text-purple-800">Velotax</th>
                            <th className="text-center py-3 px-3 font-semibold text-purple-800">Job</th>
                            <th className="text-center py-3 px-3 font-semibold text-purple-800">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(statsAtuacaoPorEmpresa)
                            .sort(([,a], [,b]) => b.Total - a.Total)
                            .map(([atuacao, dados]) => (
                              <tr key={atuacao} className="border-b border-purple-100">
                                <td className="py-3 px-3 text-purple-800 font-medium">{atuacao}</td>
                                <td className="py-3 px-3 text-center">
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    dados.Velotax > 0 
                                      ? 'bg-blue-200 text-blue-800' 
                                      : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {dados.Velotax}
                                  </span>
                                </td>
                                <td className="py-2 px-1 text-center">
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    dados.Job > 0 
                                      ? 'bg-green-200 text-green-800' 
                                      : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {dados.Job}
                                  </span>
                                </td>
                                <td className="py-2 px-1 text-center">
                                  <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-xs font-bold">
                                    {dados.Total}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Resumo Simples (mantido para compatibilidade) */}
                  <div className="border-t border-purple-200 pt-3">
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">Resumo Geral</h4>
                    <div className="space-y-1">
                      {Object.entries(stats.porAtuacao)
                        .sort(([,a], [,b]) => b - a)
                        .map(([atuacao, count]) => (
                          <div key={atuacao} className="flex justify-between items-center">
                            <span className="text-xs text-purple-700">{atuacao}</span>
                            <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-xs font-bold">
                              {count}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo Geral */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Resumo Geral</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{funcionariosAtivos.length}</div>
                    <div className="text-sm text-gray-600">Funcionários Ativos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{funcionariosDesligados.length}</div>
                    <div className="text-sm text-gray-600">Funcionários Desligados</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{funcionariosAfastados.length}</div>
                    <div className="text-sm text-gray-600">Funcionários Afastados</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{job6x1Ativos}</div>
                    <div className="text-sm text-gray-600">Job 6x1 (sábado)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FuncionarioToolbar;
