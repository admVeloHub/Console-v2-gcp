import React from 'react';
import { Users, BarChart3 } from 'lucide-react';

interface ModuleSelectorProps {
  onSelectModule: (moduleName: string) => void;
}

interface ModuleCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ModuleSelector: React.FC<ModuleSelectorProps> = ({ onSelectModule }) => {
  const modules: ModuleCard[] = [
    {
      id: 'funcionarios',
      title: 'Funcionários',
      description: 'Gestão de colaboradores e acessos',
      icon: <Users className="h-12 w-12" />
    },
    {
      id: 'qualidade',
      title: 'Módulo de Qualidade',
      description: 'Monitoramento e avaliação de atendimentos',
      icon: <BarChart3 className="h-12 w-12" />
    }
  ];

  const handleModuleClick = (module: ModuleCard) => {
    onSelectModule(module.id);
  };

  return (
    <div className="min-h-screen bg-[#ECECEC]">
      {/* Header */}
      <div className="bg-[#000058]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 text-white">
            <div className="flex items-center space-x-3">
              <img 
                src="/Velotax_icon.svg" 
                alt="Velotax Logo" 
                className="h-7 w-7"
              />
              <h1 className="text-xl font-semibold">VELOTAX</h1>
            </div>
            <div className="text-sm opacity-80">Selecione o módulo</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#000058] mb-2">Escolha o Módulo</h2>
          <p className="text-lg text-gray-600">Selecione o módulo que deseja acessar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => handleModuleClick(module)}
              className="bg-white rounded-xl p-8 border border-gray-200 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full h-48 flex items-center"
            >
              <div className="flex items-center space-x-6 w-full">
                <div className="p-4 rounded-xl bg-[#ECECEC] text-[#000058] flex-shrink-0">
                  {module.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#000058] mb-3">{module.title}</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">{module.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleSelector;
