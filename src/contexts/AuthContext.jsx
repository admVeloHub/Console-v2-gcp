// VERSION: v3.8.3 | DATE: 2026-06-02 | AUTHOR: VeloHub Development Team
// CHANGELOG: v3.8.3 - Bypass Lucas: não sobrescreve _funcoesAdministrativas; sync API atualiza funções administrativas
// CHANGELOG: v3.8.2 - Bypass tickets: gestaoQa
// CHANGELOG: v3.8.0 | DATE: 2024-12-19
import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendUserPing, debugUserPermissions } from '../services/userPingService';
import { getAuthorizedUser } from '../services/userService';

const AuthContext = createContext();

// Configurações de sessão e sincronização
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 horas
const SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutos
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos

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
        const lastActivity = localStorage.getItem('lastActivity');
        
        // Verificar se a sessão expirou
        if (lastActivity && Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT) {
          console.log('⏰ Sessão expirada - forçando logout');
          logout();
          return;
        }
        
        if (storedUser && storedAuth === 'true') {
          const parsedUser = JSON.parse(storedUser);
          
          // BYPASS TEMPORÁRIO: Para Lucas Gravina, garantir dados completos
          if (parsedUser.email === 'lucas.gravina@velotax.com.br' || parsedUser._userMail === 'lucas.gravina@velotax.com.br') {
            const bypassUserData = {
              ...parsedUser,
              _userMail: 'lucas.gravina@velotax.com.br',
              _userId: 'Lucas Gravina',
              _userRole: 'Administrador',
              _userClearance: {
                artigos: true,
                velonews: true,
                botPerguntas: true,
                chamadosInternos: true,
                botAnalises: true,
                qualidade: true,
                capacity: true,
                config: true,
                servicos: true,
                funcionarios: true
              },
              _userTickets: {
                artigos: true,
                processos: true,
                roteiros: true,
                treinamentos: true,
                funcionalidades: true,
                recursos: true,
                gestao: true,
                gestaoQa: true,
                rhFin: true,
                facilities: true,
                chamadosInternos: true
              },
              _funcoesAdministrativas: parsedUser._funcoesAdministrativas || {
                avaliador: true,
                auditoria: false,
                relatoriosGestao: false
              }
            };
            setUser(bypassUserData);
            localStorage.setItem('user', JSON.stringify(bypassUserData));
          } else {
            setUser(parsedUser);
          }
          
          setIsAuthenticated(true);
          // Atualizar timestamp de atividade
          localStorage.setItem('lastActivity', Date.now().toString());
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Limpar dados corrompidos
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('lastActivity');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Sistema de verificação de expiração de sessão
  useEffect(() => {
    const checkSessionExpiry = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity && Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT) {
        console.log('⏰ Sessão expirada automaticamente');
        logout();
      }
    };
    
    // Verificar expiração a cada 5 minutos
    const sessionInterval = setInterval(checkSessionExpiry, SESSION_CHECK_INTERVAL);
    
    return () => clearInterval(sessionInterval);
  }, []);

  // Sistema de sincronização automática de permissões
  useEffect(() => {
    const userMail = user?.email || user?._userMail;
    if (!userMail) return;

    const syncUserPermissions = async () => {
      try {
        const freshUser = await getAuthorizedUser(userMail);
        if (!freshUser) return;

        const updatedUserData = freshUser.data || freshUser;
        const currentPermissions = user._userClearance || user.permissoes;
        const newPermissions = updatedUserData._userClearance;
        const currentFa = user._funcoesAdministrativas;
        const newFa = updatedUserData._funcoesAdministrativas;

        if (
          JSON.stringify(currentPermissions) !== JSON.stringify(newPermissions) ||
          JSON.stringify(currentFa) !== JSON.stringify(newFa)
        ) {
          console.log('🔄 Permissões/funções administrativas atualizadas via sincronização automática');
          updateUser({ ...user, ...updatedUserData, email: userMail, _userMail: userMail });
        }
      } catch (error) {
        console.error('❌ Erro na sincronização automática:', error);
      }
    };

    syncUserPermissions();
    const syncInterval = setInterval(syncUserPermissions, SYNC_INTERVAL);
    return () => clearInterval(syncInterval);
  }, [user?.email, user?._userMail]);

  // Atualizar timestamp de atividade em interações do usuário
  useEffect(() => {
    const updateActivity = () => {
      if (isAuthenticated) {
        localStorage.setItem('lastActivity', Date.now().toString());
      }
    };

    // Atualizar atividade em eventos de interação
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [isAuthenticated]);

  const login = async (userData) => {
    // BYPASS TEMPORÁRIO: Para Lucas Gravina, usar dados completos do bypass
    if (userData.email === 'lucas.gravina@velotax.com.br' || userData._userMail === 'lucas.gravina@velotax.com.br') {
      console.log('🚨 BYPASS ATIVADO: Aplicando dados completos do Lucas Gravina');
      const bypassUserData = {
        ...userData,
        _userMail: 'lucas.gravina@velotax.com.br',
        _userId: 'Lucas Gravina',
        _userRole: 'Administrador',
        _userClearance: {
          artigos: true,
          velonews: true,
          botPerguntas: true,
          chamadosInternos: true,
          botAnalises: true,
          qualidade: true,
          capacity: true,
          config: true,
          servicos: true,
          funcionarios: true
        },
        _userTickets: {
          artigos: true,
          processos: true,
          roteiros: true,
          treinamentos: true,
          funcionalidades: true,
          recursos: true,
          gestao: true,
          gestaoQa: true,
          rhFin: true,
          facilities: true,
          chamadosInternos: true
        },
        _funcoesAdministrativas: userData._funcoesAdministrativas || {
          avaliador: true,
          auditoria: false,
          relatoriosGestao: false
        }
      };
      setUser(bypassUserData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(bypassUserData));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('lastActivity', Date.now().toString());
      return;
    }
    
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('lastActivity', Date.now().toString());

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
    console.log('🚪 Logout realizado - limpando dados de sessão');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('lastActivity');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // BYPASS TEMPORÁRIO: Para Lucas Gravina, retornar true para todas as permissões
    if (user.email === 'lucas.gravina@velotax.com.br' || user._userMail === 'lucas.gravina@velotax.com.br') {
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
    
    // Verificar permissões reais do usuário
    if (!user.tiposTickets && !user._userTickets) {
      console.log('❌ Usuário sem tipos de tickets definidos:', user.email || user._userMail);
      return false;
    }
    
    // Usar _userTickets (formato MongoDB) ou tiposTickets (formato frontend)
    const userTicketTypes = user._userTickets || user.tiposTickets;
    const hasAccess = userTicketTypes[ticketType] === true;
    
    console.log(`🔍 Verificando tipo de ticket '${ticketType}' para ${user.email || user._userMail}:`, hasAccess);
    console.log('🎫 Tipos de tickets do usuário:', userTicketTypes);
    
    return hasAccess;
  };

  const updateUser = (updatedUserData) => {
    const currentMail = user?.email || user?._userMail;
    const updatedMail = updatedUserData?.email || updatedUserData?._userMail;
    if (user && currentMail && updatedMail && currentMail === updatedMail) {
      const newUserData = { ...user, ...updatedUserData, email: currentMail, _userMail: currentMail };
      setUser(newUserData);
      localStorage.setItem('user', JSON.stringify(newUserData));
      localStorage.setItem('lastActivity', Date.now().toString());
      console.log('✅ Usuário atualizado no contexto e localStorage');
      return true;
    }
    return false;
  };

  // Função para forçar sincronização manual
  const forceSync = async () => {
    const userMail = user?.email || user?._userMail;
    if (!userMail) return false;

    try {
      console.log('🔄 Forçando sincronização manual de permissões');
      const freshUser = await getAuthorizedUser(userMail);
      if (!freshUser) return false;
      const updatedUserData = freshUser.data || freshUser;
      updateUser({ ...user, ...updatedUserData, email: userMail, _userMail: userMail });
      return true;
    } catch (error) {
      console.error('❌ Erro na sincronização manual:', error);
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    hasPermission,
    canViewTicketType,
    updateUser,
    forceSync
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
