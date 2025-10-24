import React, { useState } from 'react';
import { X, Save, UserPlus } from 'lucide-react';
import { FuncionarioFormData } from '../types';

interface FuncionarioFormProps {
  onSubmit: (data: FuncionarioFormData) => void;
  onCancel: () => void;
  initialData?: FuncionarioFormData;
  isEditing?: boolean;
}

const FuncionarioForm: React.FC<FuncionarioFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<FuncionarioFormData>({
    nomeCompleto: initialData?.nomeCompleto || '',
    dataAniversario: initialData?.dataAniversario || '',
    empresa: initialData?.empresa || '',
    dataContratado: initialData?.dataContratado || '',
    telefone: initialData?.telefone || '',
    atuacao: initialData?.atuacao || '',
    escala: initialData?.escala || '',
    desligado: initialData?.desligado || false,
    dataDesligamento: initialData?.dataDesligamento || '',
    afastado: initialData?.afastado || false,
    dataAfastamento: initialData?.dataAfastamento || ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = 'Nome é obrigatório';
    }
    
    if (!formData.empresa.trim()) {
      newErrors.empresa = 'Empresa é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        onSubmit(formData);
      } catch (error) {
        console.error('Erro ao executar onSubmit:', error);
      }
    }
  };

  const handleInputChange = (field: keyof FuncionarioFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              {isEditing ? (
                <>
                  <UserPlus className="h-5 w-5 mr-2 text-velotax-blue" />
                  Editar Funcionário
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2 text-velotax-blue" />
                  Novo Funcionário
                </>
              )}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nomeCompleto}
                onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                placeholder="Digite o nome completo"
              />
              {errors.nomeCompleto && (
                <p className="text-red-500 text-sm mt-1">{errors.nomeCompleto}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Aniversário (DD/MM)
              </label>
              <input
                type="text"
                value={formData.dataAniversario}
                onChange={(e) => handleInputChange('dataAniversario', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                placeholder="DD/MM (ex: 15/03)"
                maxLength={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa *
              </label>
              <input
                type="text"
                value={formData.empresa}
                onChange={(e) => handleInputChange('empresa', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                placeholder="Digite o nome da empresa"
              />
              {errors.empresa && (
                <p className="text-red-500 text-sm mt-1">{errors.empresa}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Contratação (DD/MM)
              </label>
              <input
                type="text"
                value={formData.dataContratado}
                onChange={(e) => handleInputChange('dataContratado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                placeholder="DD/MM (ex: 15/03)"
                maxLength={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Atuação
              </label>
              <input
                type="text"
                value={formData.atuacao}
                onChange={(e) => handleInputChange('atuacao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                placeholder="Ex: Desenvolvedor, Analista, Gerente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Escala
              </label>
              <input
                type="text"
                value={formData.escala}
                onChange={(e) => handleInputChange('escala', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                placeholder="Ex: 8h/dia, 6h/dia, Flexível"
              />
            </div>

            {/* Seção de Desligamento */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  id="desligado"
                  checked={formData.desligado}
                  onChange={(e) => handleInputChange('desligado', e.target.checked)}
                  className="h-4 w-4 text-velotax-blue focus:ring-velotax-blue border-gray-300 rounded"
                />
                <label htmlFor="desligado" className="text-sm font-medium text-gray-700">
                  Funcionário Desligado
                </label>
              </div>
              
              {formData.desligado && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data do Desligamento (DD/MM)
                  </label>
                  <input
                    type="text"
                    value={formData.dataDesligamento}
                    onChange={(e) => handleInputChange('dataDesligamento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-velotax-blue focus:border-transparent"
                    placeholder="DD/MM (ex: 15/03)"
                    maxLength={5}
                  />
                </div>
              )}
            </div>

            {/* Seção de Afastamento */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  id="afastado"
                  checked={formData.afastado}
                  onChange={(e) => handleInputChange('afastado', e.target.checked)}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-600 border-gray-300 rounded"
                />
                <label htmlFor="afastado" className="text-sm font-medium text-gray-700">
                  Funcionário Afastado
                </label>
              </div>
              
              {formData.afastado && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data do Afastamento (DD/MM)
                  </label>
                  <input
                    type="text"
                    value={formData.dataAfastamento}
                    onChange={(e) => handleInputChange('dataAfastamento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                    placeholder="DD/MM (ex: 15/03)"
                    maxLength={5}
                  />
                </div>
              )}
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
                className="flex-1 px-4 py-2 bg-velotax-blue text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FuncionarioForm;

