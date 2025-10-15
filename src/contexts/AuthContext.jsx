// VERSION: v3.7.6 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
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
    if (!user) return false;
    
    console.log('🔍 DEBUG - Verificando permissão:', permission, 'para usuário:', user.email || user._userMail);
    
    // BYPASS TEMPORÁRIO: Usuário Lucas Gravina tem acesso total (TEMPORÁRIO PARA PRODUÇÃO)
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('dev') ||
                         process.env.NODE_ENV === 'development';
    
    // BYPASS TEMPORÁRIO: Lucas Gravina tem acesso total em qualquer ambiente
    if (user.email === 'lucas.gravina@velotax.com.br' || user._userMail === 'lucas.gravina@velotax.com.br') {
      console.log('🔓 BYPASS TEMPORÁRIO: Acesso total liberado para Lucas Gravina');
      return true;
    }
    
    // Verificar permissões reais do usuário
    if (!user.permissoes && !user._userClearance) {
      console.log('❌ Usuário sem permissões definidas:', user.email || user._userMail);
      return false;
    }
    
    // Usar _userClearance (formato MongoDB) ou permissoes (formato frontend)
    const userPermissions = user._userClearance || user.permissoes;
    const hasAccess = userPermissions[permission] === true;
    
    console.log(`🔍 Verificando permissão '${permission}' para ${user.email || user._userMail}:`, hasAccess);
    console.log('📋 Permissões do usuário:', userPermissions);
    
    return hasAccess;
  };

  const canViewTicketType = (ticketType) => {
    if (!user) return false;
    
    // DESENVOLVIMENTO: Qualquer usuário logado tem acesso total
    console.log('🎫 DESENVOLVIMENTO: Acesso total a tickets para:', user.email || user._userMail);
    return true;
    
    // Código original comentado para desenvolvimento
    // if (user.email === 'gravina.dev@localhost' || user._userMail === 'gravina.dev@localhost') {
    //   return true;
    // }
    // if (!user.tiposTickets) return false;
    // return user.tiposTickets[ticketType] === true;
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
