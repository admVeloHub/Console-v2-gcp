import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Edit, 
  Trash2, 
  Key, 
  User, 
  ChevronDown, 
  ChevronUp,
  Search,
  X
} from 'lucide-react';
import { Funcionario, Acesso } from '../types';

interface FuncionarioListProps {
  funcionarios: Funcionario[];
  filtros: {
    nome: string;
    empresa: string;
    atuacao: string;
    status: 'todos' | 'ativos' | 'desligados' | 'afastados';
    escala: string;
  };
  onFiltroChange: (campo: 'nome' | 'empresa' | 'atuacao' | 'status' | 'escala', valor: string) => void;
  onLimparFiltros: () => void;
  onEdit: (funcionario: Funcionario) => void;
  onDelete: (id: string) => void;
  onAddAcesso: (funcionarioId: string) => void;
  onEditAcesso: (funcionarioId: string, acesso: Acesso) => void;
  onDeleteAcesso: (funcionarioId: string, acessoId: string) => void;
}

const FuncionarioList: React.FC<FuncionarioListProps> = ({
  funcionarios,
  filtros,
  onFiltroChange,
  onLimparFiltros,
  onEdit,
  onDelete,
  onAddAcesso,
  onEditAcesso,
  onDeleteAcesso
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const formatDate = (dateString: string) => {
    if (!dateString || dateString.trim() === '') return 'Não informado';
    
    try {
      // Se já está no formato DD/MM, retorna diretamente
      if (/^\d{2}\/\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Se é uma data ISO válida, formata
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return format(date, 'dd/MM', { locale: ptBR });
      }
      
      // Se não conseguiu formatar, retorna o valor original
      return dateString;
    } catch (error) {
      console.log('Erro ao formatar data:', dateString, error);
      return dateString || 'Não informado';
    }
  };

  const toggleRow = (funcionarioId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(funcionarioId)) {
      newExpanded.delete(funcionarioId);
    } else {
      newExpanded.add(funcionarioId);
    }
    setExpandedRows(newExpanded);
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = Object.values(filtros).some(valor => valor !== '' && valor !== 'todos');

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Barra de Filtros */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Campo de Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={filtros.nome}
                onChange={(e) => onFiltroChange('nome', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtros adicionais */}
          <div className="flex flex-wrap gap-3">
            {/* Filtro por Empresa */}
            <select
              value={filtros.empresa}
              onChange={(e) => onFiltroChange('empresa', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as empresas</option>
              <option value="Job Center">Job Center</option>
              <option value="Job">Job</option>
              <option value="Velotax">Velotax</option>
            </select>

            {/* Filtro por Status */}
            <select
              value={filtros.status}
              onChange={(e) => onFiltroChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os status</option>
              <option value="ativos">Ativos</option>
              <option value="afastados">Afastados</option>
              <option value="desligados">Desligados</option>
            </select>

            {/* Filtro por Escala */}
            <select
              value={filtros.escala}
              onChange={(e) => onFiltroChange('escala', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as escalas</option>
              <option value="6x1">6x1</option>
              <option value="5x2">5x2</option>
              <option value="4x2">4x2</option>
              <option value="12x36">12x36</option>
            </select>

            {/* Botão Limpar Filtros */}
            {hasActiveFilters && (
              <button
                onClick={onLimparFiltros}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                title="Limpar filtros"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-3 text-sm text-gray-600">
          {funcionarios.length} funcionário{funcionarios.length !== 1 ? 's' : ''} encontrado{funcionarios.length !== 1 ? 's' : ''}
          {hasActiveFilters && (
            <span className="ml-2 text-blue-600">
              (filtros ativos)
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Funcionário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aniversário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contratado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Atuação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Escala
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acessos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {funcionarios.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <Search className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-lg font-medium">Nenhum funcionário encontrado</p>
                    <p className="text-sm">Tente ajustar os filtros de busca</p>
                  </div>
                </td>
              </tr>
            ) : (
              funcionarios.map((funcionario) => (
                <React.Fragment key={funcionario.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-velotax-blue text-white p-2 rounded-full mr-3">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {funcionario.nomeCompleto}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {funcionario.empresa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(funcionario.dataAniversario)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(funcionario.dataContratado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {funcionario.telefone || 'Não informado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {funcionario.atuacao || 'Não informado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={
                        funcionario.escala && funcionario.escala.toLowerCase() === 'afastada'
                          ? 'text-yellow-600 font-bold'
                          : ''
                      }>
                        {funcionario.escala || 'Não informado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        {/* Status do Funcionário */}
                        <div className="flex items-center space-x-2">
                          <div className={`h-3 w-3 rounded-full ${
                            funcionario.desligado ? 'bg-red-500' : 
                            funcionario.afastado ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}></div>
                          <span className={`text-xs font-medium ${
                            funcionario.desligado ? 'text-red-600' : 
                            funcionario.afastado ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            {funcionario.desligado ? 'Desligado' : 
                             funcionario.afastado ? 'Afastado' : 
                             'Ativo'}
                          </span>
                        </div>
                        
                        {/* Data do Desligamento */}
                        {funcionario.desligado && funcionario.dataDesligamento && (
                          <div className="text-xs text-gray-500">
                            {formatDate(funcionario.dataDesligamento)}
                          </div>
                        )}
                        
                        {/* Data do Afastamento */}
                        {funcionario.afastado && funcionario.dataAfastamento && (
                          <div className="text-xs text-gray-500">
                            {formatDate(funcionario.dataAfastamento)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {funcionario.acessos.length}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onAddAcesso(funcionario.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Adicionar Acesso"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(funcionario)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Editar Funcionário"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(funcionario.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir Funcionário"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {funcionario.acessos.length > 0 && (
                          <button
                            onClick={() => toggleRow(funcionario.id)}
                            className="text-gray-600 hover:text-gray-900"
                            title={expandedRows.has(funcionario.id) ? "Ocultar Acessos" : "Ver Acessos"}
                          >
                            {expandedRows.has(funcionario.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Linha expandida com acessos */}
                  {expandedRows.has(funcionario.id) && funcionario.acessos.length > 0 && (
                    <tr>
                      <td colSpan={10} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">Acessos do Sistema</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {funcionario.acessos.map((acesso) => (
                              <div key={acesso.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-gray-900">{acesso.sistema}</h5>
                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={() => onEditAcesso(funcionario.id, acesso)}
                                      className="text-blue-600 hover:text-blue-900"
                                      title="Editar Acesso"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => onDeleteAcesso(funcionario.id, acesso.id)}
                                      className="text-red-600 hover:text-red-900"
                                      title="Excluir Acesso"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="space-y-1 text-sm">
                                  {acesso.perfil && (
                                    <div>
                                      <span className="text-gray-500">Perfil:</span>
                                      <span className="ml-1 font-medium">{acesso.perfil}</span>
                                    </div>
                                  )}
                                  {acesso.observacoes && (
                                    <div>
                                      <span className="text-gray-500">Obs:</span>
                                      <span className="ml-1">{acesso.observacoes}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FuncionarioList;
