import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Edit, 
  Trash2, 
  Key, 
  Calendar, 
  Building, 
  User, 
  ChevronDown, 
  ChevronUp,
  Phone
} from 'lucide-react';
import { Funcionario, Acesso } from '../types';

interface FuncionarioCardProps {
  funcionario: Funcionario;
  onEdit: (funcionario: Funcionario) => void;
  onDelete: (id: string) => void;
  onAddAcesso: (funcionarioId: string) => void;
  onEditAcesso: (funcionarioId: string, acesso: Acesso) => void;
  onDeleteAcesso: (funcionarioId: string, acessoId: string) => void;
}

const FuncionarioCard: React.FC<FuncionarioCardProps> = ({
  funcionario,
  onEdit,
  onDelete,
  onAddAcesso,
  onEditAcesso,
  onDeleteAcesso
}) => {
  const [showAcessos, setShowAcessos] = useState(false);

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

  const formatDateWithTime = (dateString: string) => {
    if (!dateString || dateString.trim() === '') return 'Não informado';
    
    try {
      // Se é uma data ISO válida, formata
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
      }
      
      // Se não conseguiu formatar, retorna o valor original
      return dateString;
    } catch (error) {
      console.log('Erro ao formatar data com hora:', dateString, error);
      return dateString || 'Não informado';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header do Card */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-velotax-blue text-white p-2 rounded-full">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{funcionario.nomeCompleto}</h3>
              <p className="text-sm text-gray-600">{funcionario.empresa}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAddAcesso(funcionario.id)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Adicionar Acesso"
            >
              <Key className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(funcionario)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Editar Funcionário"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(funcionario.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Excluir Funcionário"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Informações do Funcionário */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Aniversário</p>
              <p className="font-medium">{formatDate(funcionario.dataAniversario)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Contratado em</p>
              <p className="font-medium">{formatDate(funcionario.dataContratado)}</p>
            </div>
          </div>
          
          {funcionario.telefone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium">{funcionario.telefone}</p>
              </div>
            </div>
          )}

          {funcionario.atuacao && (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Atuação</p>
                <p className="font-medium">{funcionario.atuacao}</p>
              </div>
            </div>
          )}

          {funcionario.escala && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Escala</p>
                <p className={`font-medium ${
                  funcionario.escala.toLowerCase() === 'afastada' 
                    ? 'text-yellow-600 font-bold' 
                    : 'text-gray-900'
                }`}>
                  {funcionario.escala}
                </p>
              </div>
            </div>
          )}

                    {/* Status do Funcionário */}
          <div className="flex items-center space-x-2">
            <div className={`h-4 w-4 rounded-full ${
              funcionario.desligado ? 'bg-red-500' : 
              funcionario.afastado ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}></div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className={`font-medium ${
                funcionario.desligado ? 'text-red-600' : 
                funcionario.afastado ? 'text-yellow-600' : 
                'text-green-600'
              }`}>
                {funcionario.desligado ? 'Desligado' : 
                 funcionario.afastado ? 'Afastado' : 
                 'Ativo'}
              </p>
            </div>
          </div>
          
          {/* Data do Desligamento */}
          {funcionario.desligado && funcionario.dataDesligamento && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Data do Desligamento</p>
                <p className="font-medium">{formatDate(funcionario.dataDesligamento)}</p>
              </div>
            </div>
          )}

          {/* Data do Afastamento */}
          {funcionario.afastado && funcionario.dataAfastamento && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Data do Afastamento</p>
                <p className="font-medium">{formatDate(funcionario.dataAfastamento)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Seção de Acessos */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Key className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900">
                Acessos ({funcionario.acessos?.length || 0})
              </span>
            </div>
            
                         <div className="flex items-center space-x-2">
               <button
                 onClick={() => setShowAcessos(!showAcessos)}
                 className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
               >
                 {showAcessos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
               </button>
             </div>
          </div>

          {showAcessos && funcionario.acessos && funcionario.acessos.length > 0 && (
            <div className="space-y-3">
              {funcionario.acessos.map((acesso) => (
                <div key={acesso.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{acesso.sistema}</h4>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditAcesso(funcionario.id, acesso)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Editar Acesso"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onDeleteAcesso(funcionario.id, acesso.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Excluir Acesso"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                     {acesso.perfil && (
                       <div>
                         <span className="text-gray-500">Perfil:</span>
                         <span className="ml-1 font-medium">{acesso.perfil}</span>
                       </div>
                     )}
                     
                     {acesso.observacoes && (
                       <div className="md:col-span-2">
                         <span className="text-gray-500">Obs:</span>
                         <span className="ml-1">{acesso.observacoes}</span>
                       </div>
                     )}
                   </div>
                </div>
              ))}
            </div>
          )}

          {(!funcionario.acessos || funcionario.acessos.length === 0) && (
            <p className="text-gray-500 text-sm italic">Nenhum acesso cadastrado</p>
          )}
        </div>

        {/* Informações de Criação */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Criado em: {formatDateWithTime(funcionario.createdAt)}
            {funcionario.updatedAt !== funcionario.createdAt && (
              <span className="ml-2">
                • Atualizado em: {formatDateWithTime(funcionario.updatedAt)}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FuncionarioCard;
