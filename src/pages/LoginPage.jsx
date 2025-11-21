// VERSION: v3.5.1 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { useState } from 'react';
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

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    
    try {
      // Decodificar o JWT token do Google
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const userInfo = JSON.parse(jsonPayload);
      
      // Verificar se o usuário está registrado no sistema
      const isAuthorized = await isUserAuthorized(userInfo.email);
      
      if (isAuthorized) {
        // Obter dados do usuário registrado via API
        const registeredUser = await getAuthorizedUser(userInfo.email);
        
        if (registeredUser) {
          // Usar dados do MongoDB com campos corretos
          const user = {
            id: registeredUser._userId,
            email: registeredUser._userMail,
            nome: registeredUser._userId,
            funcao: registeredUser._userRole,
            permissoes: registeredUser._userClearance,
            tiposTickets: registeredUser._userTickets,
            picture: userInfo.picture
          };
          
          // Fazer login via AuthContext
          await login(user);
        } else {
          setError('Erro ao obter dados do usuário. Tente novamente.');
        }
      } else {
        setError('Usuário não registrado no sistema. Entre em contato com o administrador para solicitar acesso.');
      }
      
    } catch (err) {
      setError('Erro ao processar login. Tente novamente.');
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Erro ao fazer login com Google. Tente novamente.');
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