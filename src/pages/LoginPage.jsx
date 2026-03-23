// VERSION: v3.6.1 | DATE: 2026-03-23 | AUTHOR: VeloHub Development Team
// CHANGELOG: v3.6.1 - Sessão de login inclui _funcoesAdministrativas (ex.: botão Auditoria na Análise IA)
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { Google } from '@mui/icons-material';
import { GoogleLogin } from '@react-oauth/google';
import consoleLogo from '../assets/console.png';
import { AUTHORIZED_EMAILS, GOOGLE_CLIENT_ID } from '../config/google';
import { useAuth } from '../contexts/AuthContext';
import { isUserAuthorized, getAuthorizedUser } from '../services/userService';

const LoginPage = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  // Verificar se componente está montado para evitar erros de postMessage
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    // Verificar se componente ainda está montado
    if (!isMountedRef.current) {
      console.warn('⚠️ Componente desmontado, ignorando callback do OAuth');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Log detalhado para debug
      console.log('🔐 Credential recebido:', credentialResponse ? 'presente' : 'ausente');
      
      // Validação robusta de credentialResponse
      if (!credentialResponse) {
        throw new Error('Resposta do Google OAuth está vazia ou inválida');
      }

      // Validação de credentialResponse.credential
      if (!credentialResponse.credential) {
        console.error('❌ credentialResponse.credential está ausente:', credentialResponse);
        throw new Error('Token de credencial não foi recebido do Google');
      }

      // Validação de estrutura do JWT (deve ter 3 partes separadas por ponto)
      const jwtParts = credentialResponse.credential.split('.');
      if (jwtParts.length !== 3) {
        console.error('❌ JWT inválido - estrutura incorreta:', {
          parts: jwtParts.length,
          expected: 3,
          credentialLength: credentialResponse.credential.length
        });
        throw new Error('Token JWT inválido: estrutura incorreta');
      }

      console.log('✅ JWT válido - decodificando...');
      
      // Decodificar o JWT token do Google
      let userInfo;
      try {
        const base64Url = jwtParts[1];
        if (!base64Url) {
          throw new Error('Parte do payload do JWT está ausente');
        }

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        userInfo = JSON.parse(jsonPayload);
        console.log('✅ JWT decodificado com sucesso:', { email: userInfo.email, name: userInfo.name });
      } catch (jwtError) {
        console.error('❌ Erro ao decodificar JWT:', jwtError);
        throw new Error('Erro ao decodificar token do Google: ' + jwtError.message);
      }

      // Validação de email no payload
      if (!userInfo.email) {
        console.error('❌ Email não encontrado no payload do JWT:', userInfo);
        throw new Error('Email não encontrado no token do Google');
      }

      console.log('🔍 Verificando autorização para:', userInfo.email);
      
      // Verificar se o usuário está registrado no sistema
      let isAuthorized;
      try {
        isAuthorized = await isUserAuthorized(userInfo.email);
        console.log('✅ Resultado da autorização:', isAuthorized);
      } catch (authError) {
        console.error('❌ Erro ao verificar autorização:', authError);
        throw new Error('Erro ao verificar autorização do usuário: ' + authError.message);
      }
      
      if (isAuthorized) {
        console.log('📋 Obtendo dados do usuário registrado...');
        // Obter dados do usuário registrado via API
        let registeredUser;
        try {
          registeredUser = await getAuthorizedUser(userInfo.email);
          console.log('✅ Dados do usuário obtidos:', registeredUser ? 'presente' : 'ausente');
        } catch (userError) {
          console.error('❌ Erro ao obter dados do usuário:', userError);
          throw new Error('Erro ao obter dados do usuário do sistema: ' + userError.message);
        }
        
        if (registeredUser) {
          // Usar dados do MongoDB com campos corretos (incl. _funcoesAdministrativas para Qualidade/Auditoria)
          const user = {
            id: registeredUser._userId,
            email: registeredUser._userMail,
            nome: registeredUser._userId,
            funcao: registeredUser._userRole,
            permissoes: registeredUser._userClearance,
            tiposTickets: registeredUser._userTickets,
            _funcoesAdministrativas: registeredUser._funcoesAdministrativas || {
              avaliador: false,
              auditoria: false,
              relatoriosGestao: false
            },
            picture: userInfo.picture
          };
          
          console.log('🚀 Fazendo login do usuário:', user.email);
          
          // Fazer login via AuthContext
          try {
            await login(user);
            console.log('✅ Login realizado com sucesso!');
            // O redirecionamento será feito automaticamente pelo App.jsx quando isAuthenticated mudar
          } catch (loginError) {
            console.error('❌ Erro ao fazer login:', loginError);
            throw new Error('Erro ao processar login: ' + loginError.message);
          }
        } else {
          console.error('❌ Usuário não encontrado no sistema');
          setError('Erro ao obter dados do usuário. Tente novamente.');
        }
      } else {
        console.warn('⚠️ Usuário não autorizado:', userInfo.email);
        setError('Usuário não registrado no sistema. Entre em contato com o administrador para solicitar acesso.');
      }
      
    } catch (err) {
      // Tratamento de erros específico
      const errorMessage = err.message || 'Erro desconhecido ao processar login';
      console.error('❌ Erro no login:', {
        message: errorMessage,
        error: err,
        stack: err.stack
      });
      
      // Mensagem de erro mais específica para o usuário
      if (errorMessage.includes('Token') || errorMessage.includes('JWT')) {
        setError('Erro ao processar credenciais do Google. Tente fazer login novamente.');
      } else if (errorMessage.includes('autorização')) {
        setError('Erro ao verificar permissões. Tente novamente.');
      } else if (errorMessage.includes('dados do usuário')) {
        setError('Erro ao obter informações do usuário. Tente novamente.');
      } else {
        setError('Erro ao processar login. Tente novamente.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleGoogleError = (error) => {
    console.error('❌ Erro do Google OAuth:', error);
    
    // Verificar se componente ainda está montado
    if (!isMountedRef.current) {
      return;
    }

    let errorMessage = 'Erro ao fazer login com Google. Tente novamente.';
    
    // Mensagens de erro mais específicas baseadas no tipo de erro
    if (error && typeof error === 'object') {
      if (error.error === 'popup_closed_by_user') {
        errorMessage = 'Login cancelado. Tente novamente.';
      } else if (error.error === 'popup_blocked') {
        errorMessage = 'Popup bloqueado pelo navegador. Permita popups para este site.';
      } else if (error.error) {
        errorMessage = `Erro de autenticação: ${error.error}`;
      }
    }
    
    setError(errorMessage);
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--cor-fundo)',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none'
          }}
        >
          {/* Logo */}
          <Box
            component="img"
            src={consoleLogo}
            alt="VeloHub Console"
            sx={{
              width: { xs: '300px', sm: '375px', md: '450px' },
              height: 'auto',
              mb: 6,
              filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.1))'
            }}
          />

          {/* Botão de Login */}
          <Box sx={{ 
            mb: 3, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            flexDirection: 'column'
          }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} />
                <Typography sx={{ fontFamily: 'Poppins', color: 'var(--gray)' }}>
                  Processando login...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {isMountedRef.current && (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    logo_alignment="left"
                    width="280"
                    useOneTap={false}
                  />
                )}
              </Box>
            )}
          </Box>

          {/* Mensagem de Erro */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                fontFamily: 'Poppins',
                borderRadius: '8px'
              }}
            >
              {error}
            </Alert>
          )}

          {/* Informações Adicionais */}
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Poppins',
              color: 'var(--gray)',
              mt: 4,
              opacity: 0.7
            }}
          >
            Acesse com sua conta Google corporativa
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;