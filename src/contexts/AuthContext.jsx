// VERSION: v3.4.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendUserPing, debugUserPermissions } from '../services/userPingService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedAuth = localStorage.getItem('isAuthenticated');
        
        if (storedUser && storedAuth === 'true') {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Limpar dados corrompidos
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');

    // Enviar ping para o backend após login bem-sucedido
    try {
      // Debug das permissões (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        debugUserPermissions(userData);
      }

      // Enviar ping para o backend
      const pingResult = await sendUserPing(userData);
      
      if (pingResult.success) {
        if (pingResult.skipped) {
          console.log('⏭️ Ping do usuário pulado:', pingResult.reason);
        } else {
          console.log('✅ Ping do usuário enviado com sucesso para o backend');
        }
      } else {
        console.warn('⚠️ Falha ao enviar ping do usuário:', pingResult.error);
      }
    } catch (error) {
      console.error('❌ Erro ao processar ping do usuário:', error);
      // Não interromper o login por falha no ping
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  };

  const hasPermission = (permission) => {
    if (!user || !user.permissoes) return false;
    return user.permissoes[permission] === true;
  };

  const canViewTicketType = (ticketType) => {
    if (!user || !user.tiposTickets) return false;
    return user.tiposTickets[ticketType] === true;
  };

  const updateUser = (updatedUserData) => {
    if (user && user.email === updatedUserData.email) {
      // Se é o usuário logado, atualizar o contexto e localStorage
      const newUserData = { ...user, ...updatedUserData };
      setUser(newUserData);
      localStorage.setItem('user', JSON.stringify(newUserData));
      return true; // Indica que a atualização foi feita
    }
    return false; // Indica que não foi o usuário logado
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    hasPermission,
    canViewTicketType,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
