import React from 'react';
import { ArrowLeft, LogOut, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onBackToSelector: () => void;
  syncStatus?: {
    lastSync: string;
    config: any;
  };
  onSyncClick?: () => void;
  isSyncing?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onBackToSelector, syncStatus, onSyncClick, isSyncing }) => {
  const getSyncIcon = () => {
    if (isSyncing) {
      return <RefreshCw className="h-4 w-4 text-green-500 animate-spin" />;
    }
    
    if (!syncStatus) return <WifiOff className="h-4 w-4 text-gray-400" />;
    
    return <Wifi className="h-4 w-4 text-blue-500" />;
  };

  const getSyncText = () => {
    if (isSyncing) return 'Sincronizando...';
    
    if (!syncStatus) return 'Sincronização desabilitada';
    
    return 'Clique para sincronizar';
  };

  return (
    <header className="bg-[#000058] text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToSelector}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Módulos</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <img 
                src="/Velotax_icon.svg" 
                alt="Velotax Logo" 
                className="h-8 w-8"
              />
              <h1 className="text-xl font-semibold">Sistema de Controle</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Botão de Sincronização Manual */}
            <button
              onClick={onSyncClick}
              disabled={isSyncing}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-800 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
              title="Sincronizar dados com outros acessos"
            >
              {getSyncIcon()}
              <span className="text-sm font-medium">{getSyncText()}</span>
            </button>
            
            <button
              onClick={() => {
                // Recarregar página
                window.location.reload();
              }}
              className="px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              title="Recarregar página"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
