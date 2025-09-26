import React from 'react';
import { Users, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddFuncionario: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddFuncionario }) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Users className="h-12 w-12 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Nenhum funcionário cadastrado
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Comece cadastrando o primeiro funcionário do seu time. 
        Você poderá adicionar informações pessoais e gerenciar todos os acessos de sistema.
      </p>
      
      <button
        onClick={onAddFuncionario}
        className="inline-flex items-center px-4 py-2 bg-velotax-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        Cadastrar Primeiro Funcionário
      </button>
    </div>
  );
};

export default EmptyState;
