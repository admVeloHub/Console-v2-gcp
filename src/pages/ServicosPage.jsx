// VERSION: v1.2.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import {
  CheckCircle as OnIcon,
  Warning as RevisaoIcon,
  Cancel as OffIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../components/common/BackButton';
import { servicesAPI } from '../services/api';


const ServicosPage = () => {
  const { user } = useAuth();
  const [moduleStatus, setModuleStatus] = useState({});
  const [localStatus, setLocalStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Configuração dos 7 serviços com mapeamento para o schema
  const services = [
    { key: 'credito-trabalhador', name: 'Crédito Trabalhador', description: 'Sistema de crédito para trabalhadores', schemaKey: '_trabalhador' },
    { key: 'credito-pessoal', name: 'Crédito Pessoal', description: 'Sistema de crédito pessoal', schemaKey: '_pessoal' },
    { key: 'antecipacao', name: 'Antecipação', description: 'Sistema de antecipação de valores', schemaKey: '_antecipacao' },
    { key: 'pagamento-antecipado', name: 'Pagamento Antecipado', description: 'Sistema de pagamentos antecipados', schemaKey: '_pgtoAntecip' },
    { key: 'modulo-irpf', name: 'Módulo IRPF', description: 'Sistema de declaração IRPF', schemaKey: '_irpf' },
    { key: 'seguro-prestamista', name: 'Seguro Cred.', description: 'Sistema de seguro prestamista', schemaKey: '_seguroCred' },
    { key: 'seguro-celular', name: 'Seguro Cel', description: 'Sistema de seguro celular', schemaKey: '_seguroCel' }
  ];

  // Função auxiliar para obter valor válido ou 'off' como padrão
  const getValue = (value) => {
    // Se o valor for null, undefined ou string vazia, retornar 'off'
    if (value === null || value === undefined || value === '') {
      return 'off';
    }
    // Se o valor for válido ('on', 'off', 'revisao'), retornar ele
    if (['on', 'off', 'revisao'].includes(value)) {
      return value;
    }
    // Caso contrário, retornar 'off' como padrão seguro
    return 'off';
  };

  // Função para converter dados do backend (formato schema) para formato interno do frontend
  const convertBackendToFrontend = (backendData) => {
    if (!backendData || typeof backendData !== 'object') {
      console.warn('⚠️ Dados inválidos recebidos:', backendData);
      return {
        'credito-trabalhador': 'off',
        'credito-pessoal': 'off',
        'antecipacao': 'off',
        'pagamento-antecipado': 'off',
        'modulo-irpf': 'off',
        'seguro-prestamista': 'off',
        'seguro-celular': 'off'
      };
    }

    // Verificar se já está no formato frontend (tem chaves como 'credito-trabalhador')
    if ('credito-trabalhador' in backendData || 'credito-pessoal' in backendData) {
      console.log('📊 Dados já estão no formato frontend');
      return {
        'credito-trabalhador': getValue(backendData['credito-trabalhador']),
        'credito-pessoal': getValue(backendData['credito-pessoal']),
        'antecipacao': getValue(backendData['antecipacao']),
        'pagamento-antecipado': getValue(backendData['pagamento-antecipado']),
        'modulo-irpf': getValue(backendData['modulo-irpf']),
        'seguro-prestamista': getValue(backendData['seguro-prestamista']),
        'seguro-celular': getValue(backendData['seguro-celular'])
      };
    }
    
    // Converter do formato schema MongoDB para formato frontend
    // Se o backend ainda retornar _seguro (dados antigos), usar como fallback
    const seguroFallback = getValue(backendData._seguro);
    
    const converted = {
      'credito-trabalhador': getValue(backendData._trabalhador),
      'credito-pessoal': getValue(backendData._pessoal),
      'antecipacao': getValue(backendData._antecipacao),
      'pagamento-antecipado': getValue(backendData._pgtoAntecip),
      'modulo-irpf': getValue(backendData._irpf),
      'seguro-prestamista': getValue(backendData._seguroCred) !== 'off' ? getValue(backendData._seguroCred) : seguroFallback,
      'seguro-celular': getValue(backendData._seguroCel) !== 'off' ? getValue(backendData._seguroCel) : seguroFallback
    };
    
    console.log('📊 Dados convertidos do schema:', converted);
    return converted;
  };

  // Buscar status atual dos módulos
  const fetchModuleStatus = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fazendo requisição para /api/module-status');
      const response = await servicesAPI.getModuleStatus();
      console.log('✅ Resposta completa recebida:', JSON.stringify(response, null, 2));
      
      // Extrair dados do objeto de resposta
      // O servicesAPI.getModuleStatus() já retorna response.data, então response já é os dados
      let backendData = response;
      
      // Se response tiver uma propriedade data, usar ela
      if (response && typeof response === 'object' && 'data' in response) {
        backendData = response.data;
      }
      
      // Se ainda tiver uma propriedade que parece ser os dados do módulo
      if (backendData && typeof backendData === 'object') {
        // Verificar se há um objeto aninhado com os dados
        const possibleDataKeys = ['moduleStatus', 'status', 'modules', 'data'];
        for (const key of possibleDataKeys) {
          if (backendData[key] && typeof backendData[key] === 'object') {
            console.log(`📊 Encontrado dados aninhados em '${key}':`, backendData[key]);
            backendData = backendData[key];
            break;
          }
        }
      }
      
      console.log('📊 Dados extraídos do backend:', JSON.stringify(backendData, null, 2));
      
      // Converter dados do formato schema para formato interno do frontend
      const frontendData = convertBackendToFrontend(backendData);
      console.log('📊 Dados finais convertidos (formato frontend):', JSON.stringify(frontendData, null, 2));
      
      setModuleStatus(frontendData);
      setLocalStatus(frontendData);
    } catch (error) {
      console.error('❌ Erro ao buscar status dos módulos:', error);
      console.error('❌ Detalhes do erro:', error.response?.data || error.message);
      showToast('Erro ao carregar status dos módulos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status local de um módulo (sem enviar para backend)
  const updateLocalStatus = (moduleKey, newStatus) => {
    setLocalStatus(prev => ({
      ...prev,
      [moduleKey]: newStatus
    }));
  };

  // Salvar todos os status para o backend
  const saveAllStatus = async () => {
    try {
      setSaving(true);
      
      // Mapear dados para o formato esperado pelo backend
      const modulesData = {
        'credito-trabalhador': localStatus['credito-trabalhador'] || 'off',
        'credito-pessoal': localStatus['credito-pessoal'] || 'off',
        'antecipacao': localStatus['antecipacao'] || 'off',
        'pagamento-antecipado': localStatus['pagamento-antecipado'] || 'off',
        'modulo-irpf': localStatus['modulo-irpf'] || 'off',
        'seguro-prestamista': localStatus['seguro-prestamista'] || 'off',
        'seguro-celular': localStatus['seguro-celular'] || 'off'
      };

      console.log('🔍 Enviando dados para o backend:', modulesData);
      await servicesAPI.updateMultipleModules(modulesData);
      
      // Atualizar estado principal
      setModuleStatus(localStatus);
      
      showToast('Status de todos os serviços atualizados com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro ao salvar status dos módulos:', error);
      showToast('Erro ao salvar status dos módulos', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Função para mostrar toast
  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  // Função para fechar toast
  const handleCloseToast = () => {
    setToast({ open: false, message: '', severity: 'success' });
  };

  // Obter label do status
  const getStatusLabel = (status) => {
    switch (status) {
      case 'on': return 'Ativo';
      case 'revisao': return 'Revisão';
      case 'off': return 'Inativo';
      default: return 'Desconhecido';
    }
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'on': return 'success';
      case 'revisao': return 'warning';
      case 'off': return 'error';
      default: return 'default';
    }
  };

  // Obter ícone do status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'on': return <OnIcon />;
      case 'revisao': return <RevisaoIcon />;
      case 'off': return <OffIcon />;
      default: return null;
    }
  };

  // Renderizar botões de status
  const renderStatusButtons = (moduleKey, currentStatus) => {
    const statuses = [
      { key: 'on', label: 'Ativo', color: 'success', icon: <OnIcon /> },
      { key: 'revisao', label: 'Revisão', color: 'warning', icon: <RevisaoIcon /> },
      { key: 'off', label: 'Inativo', color: 'error', icon: <OffIcon /> }
    ];

    return (
      <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
        {statuses.map((status) => (
          <Button
            key={status.key}
            variant={currentStatus === status.key ? 'contained' : 'outlined'}
            color={status.color}
            size="small"
            startIcon={status.icon}
            onClick={() => updateLocalStatus(moduleKey, status.key)}
            sx={{
              minWidth: '80px',
              textTransform: 'none',
              fontWeight: currentStatus === status.key ? 600 : 400,
              fontSize: '0.64rem',
              py: 0.4,
              px: 1.2
            }}
          >
            {status.label}
          </Button>
        ))}
      </Box>
    );
  };

  // Carregar status inicial apenas uma vez
  useEffect(() => {
    fetchModuleStatus();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 3.2, pb: 6.4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', mb: 3.2 }}>
        <Box sx={{ position: 'absolute', left: 0 }}>
          <BackButton />
        </Box>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontFamily: 'Poppins',
            fontWeight: 700,
            color: 'var(--blue-dark)',
            fontSize: '1.92rem'
          }}
        >
          Serviços
        </Typography>
        <Box sx={{ position: 'absolute', right: 0 }}>
          <Button
            variant="contained"
            size="small"
            onClick={saveAllStatus}
            disabled={saving || loading}
            sx={{
              backgroundColor: 'var(--green)',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: '0.64rem',
              padding: '3.2px 9.6px',
              minWidth: 'auto',
              height: '28.8px',
              '&:hover': {
                backgroundColor: 'var(--green)',
                opacity: 0.9
              }
            }}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </Box>
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3.2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Grid de Serviços */}
      {!loading && (
        <>
          <Grid container spacing={2.4}>
            {services.map((service) => {
              const currentStatus = localStatus[service.key] || 'off';
              
              return (
                <Grid item xs={12} md={6} lg={4} key={service.key}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 1.6 }}>
                      {/* Header do Card */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.6 }}>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          sx={{ 
                            flexGrow: 1,
                            color: 'var(--blue-dark)',
                            fontWeight: 600,
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.96rem'
                          }}
                        >
                          {service.name}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(currentStatus)}
                          label={getStatusLabel(currentStatus)}
                          color={getStatusColor(currentStatus)}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.64rem', height: '20px' }}
                        />
                      </Box>

                      {/* Descrição */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2.4,
                          fontFamily: 'Poppins, sans-serif',
                          lineHeight: 1.6,
                          fontSize: '0.8rem'
                        }}
                      >
                        {service.description}
                      </Typography>

                      {/* Botões de Status */}
                      {renderStatusButtons(service.key, currentStatus)}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      {/* Toast de Notificação */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ServicosPage;

