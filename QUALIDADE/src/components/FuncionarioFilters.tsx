import React from 'react';
import { Filter, X } from 'lucide-react';
import { Funcionario } from '../types';

interface FiltrosState {
  nome: string;
  empresa: string;
  atuacao: string;
  status: 'todos' | 'ativos' | 'desligados' | 'afastados';
  escala: string;
}

interface FuncionarioFiltersProps {
  funcionarios: Funcionario[];
  filtros: FiltrosState;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosState>>;
  showFiltros: boolean;
  setShowFiltros: React.Dispatch<React.SetStateAction<boolean>>;
  funcionariosFiltrados: Funcionario[];
}

const FuncionarioFilters: React.FC<FuncionarioFiltersProps> = ({
  funcionarios,
  filtros,
  setFiltros,
  showFiltros,
  setShowFiltros,
  funcionariosFiltrados
}) => {
  const limparFiltros = () => {
    setFiltros({
      nome: '',
      empresa: '',
      atuacao: '',
      status: 'todos',
      escala: ''
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Gestão de Funcionários</h1>
          <p className="text-sm text-gray-600">Gerencie o cadastro de colaboradores</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFiltros && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Filtro por Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={filtros.nome}
                onChange={(e) => setFiltros(prev => ({ ...prev, nome: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000058] focus:border-transparent text-sm"
              />
            </div>

            {/* Filtro por Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <select
                value={filtros.empresa}
                onChange={(e) => setFiltros(prev => ({ ...prev, empresa: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000058] focus:border-transparent text-sm"
              >
                <option value="">Todas as empresas</option>
                {Array.from(new Set(funcionarios.map(f => f.empresa))).map(empresa => (
                  <option key={empresa} value={empresa}>{empresa}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Atuação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Atuação</label>
              <select
                value={filtros.atuacao}
                onChange={(e) => setFiltros(prev => ({ ...prev, atuacao: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000058] focus:border-transparent text-sm"
              >
                <option value="">Todas as atuações</option>
                {Array.from(new Set(funcionarios.map(f => f.atuacao).filter(Boolean))).map(atuacao => (
                  <option key={atuacao} value={atuacao}>{atuacao}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filtros.status}
                onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value as 'todos' | 'ativos' | 'desligados' | 'afastados' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000058] focus:border-transparent text-sm"
              >
                <option value="todos">Todos os status</option>
                <option value="ativos">Ativos</option>
                <option value="desligados">Desligados</option>
                <option value="afastados">Afastados</option>
              </select>
            </div>

            {/* Filtro por Escala */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Escala</label>
              <select
                value={filtros.escala}
                onChange={(e) => setFiltros(prev => ({ ...prev, escala: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000058] focus:border-transparent text-sm"
              >
                <option value="">Todas as escalas</option>
                {Array.from(new Set(funcionarios.map(f => f.escala).filter(Boolean))).map(escala => (
                  <option key={escala} value={escala}>{escala}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Botões de ação dos filtros */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Mostrando <span className="font-semibold text-[#000058]">{funcionariosFiltrados.length}</span> de <span className="font-semibold">{funcionarios.length}</span> funcionários
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={limparFiltros}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar Filtros
              </button>
              <button
                onClick={() => setShowFiltros(false)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Ocultar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuncionarioFilters;
