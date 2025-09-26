import React from 'react';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  const handleLogout = () => {
    // Remover autenticação do localStorage
    localStorage.removeItem('isAuthenticated');
    onLogout();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
      title="Sair do Sistema"
    >
      <LogOut className="h-4 w-4 mr-1" />
      Sair
    </button>
  );
};

export default LogoutButton;
