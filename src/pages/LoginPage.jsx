// VERSION: v3.3.4 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
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

const LoginPage = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSuccess = (credentialResponse) => {
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
      
      // Debug: verificar dados do usuário
      console.log('Dados do usuário do Google:', {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture
      });
      
      // Verificar se é um email autorizado
      if (AUTHORIZED_EMAILS.includes(userInfo.email)) {
        const user = {
          email: userInfo.email,
          nome: userInfo.name,
          picture: userInfo.picture,
          funcao: 'Administrador',
          permissoes: {
            artigos: true,
            velonews: true,
            botPerguntas: true,
            chamadosInternos: true,
            igp: true,
            qualidade: true,
            capacity: true,
            config: true
          },
          tiposTickets: {
            artigos: true,
            processos: true,
            roteiros: true,
            treinamentos: true,
            funcionalidades: true,
            recursos: true,
            gestao: true,
            rhFin: true,
            facilities: true
          }
        };
        
        // Fazer login via AuthContext
        login(user);
      } else {
        setError('Acesso não autorizado. Use sua conta corporativa.');
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

  // Função de fallback para desenvolvimento
  const handleDevLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular processo de login para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = {
        email: 'lucas.gravina@velotax.com.br',
        nome: 'Lucas Gravina',
        picture: 'https://ui-avatars.com/api/?name=Lucas+Gravina&background=1634FF&color=fff&size=32&bold=true',
        funcao: 'Administrador',
        permissoes: {
          artigos: true,
          velonews: true,
          botPerguntas: true,
          chamadosInternos: true,
          igp: true,
          qualidade: true,
          capacity: true,
          config: true
        },
        tiposTickets: {
          artigos: true,
          processos: true,
          roteiros: true,
          treinamentos: true,
          funcionalidades: true,
          recursos: true,
          gestao: true,
          rhFin: true,
          facilities: true
        }
      };
      
      // Fazer login via AuthContext
      login(user);
      
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

  // Verificar se o OAuth está configurado
  const isOAuthConfigured = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.includes('278491073220');

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
          <Box sx={{ mb: 3 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} />
                <Typography sx={{ fontFamily: 'Poppins', color: 'var(--gray)' }}>
                  Processando login...
                </Typography>
              </Box>
            ) : isOAuthConfigured ? (
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
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Google />}
                  onClick={handleDevLogin}
                  sx={{
                    backgroundColor: 'var(--blue-medium)',
                    color: 'white',
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    padding: '12px 32px',
                    borderRadius: '12px',
                    textTransform: 'none',
                    boxShadow: '0 4px 20px rgba(22, 52, 255, 0.3)',
                    '&:hover': {
                      backgroundColor: 'var(--blue-dark)',
                      boxShadow: '0 6px 25px rgba(22, 52, 255, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Entrar (Desenvolvimento)
                </Button>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1, 
                    fontFamily: 'Poppins', 
                    color: 'var(--gray)',
                    fontSize: '0.8rem'
                  }}
                >
                  OAuth não configurado - Modo desenvolvimento
                </Typography>
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
