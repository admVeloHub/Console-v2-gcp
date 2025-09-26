import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Key } from 'lucide-react';
import { AcessoFormData } from '../types';

interface AcessoFormProps {
  onSubmit: (data: AcessoFormData) => void;
  onCancel: () => void;
  funcionarioNome: string;
  initialData?: AcessoFormData;
  isEditing?: boolean;
}

const AcessoForm: React.FC<AcessoFormProps> = ({
  onSubmit,
  onCancel,
  funcionarioNome,
  initialData,
  isEditing = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AcessoFormData>({
    defaultValues: initialData || {
      sistema: '',
      perfil: '',
      observacoes: ''
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Key className="h-5 w-5 mr-2 text-velotax-blue" />
              {isEditing ? 'Editar Acesso' : 'Novo Acesso'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Funcionário:</strong> {funcionarioNome}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sistema *
              </label>
              <input
                type="text"
                {...register('sistema', { required: 'Sistema é obrigatório' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                placeholder="Ex: ERP, CRM, Sistema Financeiro"
              />
              {errors.sistema && (
                <p className="text-red-500 text-sm mt-1">{errors.sistema.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Perfil
              </label>
              <input
                type="text"
                {...register('perfil')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                placeholder="Ex: Administrador, Usuário, Supervisor (opcional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                {...register('observacoes')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                placeholder="Observações sobre o acesso..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-velotax-blue text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Atualizar' : 'Adicionar'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AcessoForm;
