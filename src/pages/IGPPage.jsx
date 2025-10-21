// VERSION: v2.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
import React, { useState, useEffect } from 'react'
import { Container, Tabs, Tab, Box, CircularProgress, Alert, Typography, Button, ButtonGroup } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { useServiceAccount } from './IGP/hooks/useServiceAccount'
import MetricsDashboard from './IGP/components/MetricsDashboardNovo'
import AgentAnalysis from './IGP/components/AgentAnalysis'
import ChartsDetailedTab from './IGP/components/ChartsDetailedTab'
import BackButton from '../components/common/BackButton'

const IGPPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [activeDataSource, setActiveDataSource] = useState('telefonia') // 'telefonia' ou 'tickets'
  
  // Debug: verificar dados do usuário
  console.log('🔍 IGP DEBUG - Usuário:', user)
  console.log('🔍 IGP DEBUG - Email:', user?.email || user?._userMail)
  console.log('🔍 IGP DEBUG - _funcoesAdministrativas:', user?._funcoesAdministrativas)
  
  // Verificar permissões (HIERARQUIA: Avaliador < Auditor < Relatórios de Gestão)
  const hasAvaliadorPermission = user?._funcoesAdministrativas?.avaliador === true
  const hasAuditorPermission = user?._funcoesAdministrativas?.auditor === true
  const hasRelatoriosPermission = user?._funcoesAdministrativas?.relatoriosGestao === true
  
  console.log('🔍 IGP DEBUG - Permissões:')
  console.log('  - Avaliador:', hasAvaliadorPermission)
  console.log('  - Auditor:', hasAuditorPermission)
  console.log('  - Relatórios:', hasRelatoriosPermission)
  
  // Controlar visualização de nomes (pelo menos Avaliador)
  const canViewNames = hasAvaliadorPermission || hasAuditorPermission || hasRelatoriosPermission
  
  // Controlar acesso à aba Gráficos Detalhados (Auditor+)
  const canViewDetailedCharts = hasAuditorPermission || hasRelatoriosPermission
  
  // Controlar acesso à aba Análise por Agente (Relatórios de Gestão)
  const canViewAgentAnalysis = hasRelatoriosPermission
  
  // Hook de dados via Service Account
  const {
    data,
    octaData,
    loading,
    error,
    fetchAllData,
    clearData
  } = useServiceAccount()
  
  // Carregar dados iniciais automaticamente
  useEffect(() => {
    if (user && !data && !loading) {
      console.log('📊 Carregando dados iniciais do VeloInsights via Service Account...')
      fetchAllData().catch(err => {
        console.error('Erro ao carregar dados:', err)
      })
    }
  }, [user, data, loading, fetchAllData])
  
  // Definir abas disponíveis baseado nas permissões
  const availableTabs = [
    { id: 0, label: "Dashboard Geral", permission: true },
    { id: 1, label: "Gráficos Detalhados", permission: canViewDetailedCharts },
    { id: 2, label: "Análise por Agente", permission: canViewAgentAnalysis }
  ].filter(tab => tab.permission)
  
  console.log('🔍 IGP DEBUG - Abas disponíveis:', availableTabs)
  console.log('🔍 IGP DEBUG - canViewDetailedCharts:', canViewDetailedCharts)
  console.log('🔍 IGP DEBUG - canViewAgentAnalysis:', canViewAgentAnalysis)
  console.log('🔍 IGP DEBUG - Fonte de dados ativa:', activeDataSource)
  
  // Se não há abas disponíveis, mostrar erro
  if (availableTabs.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8, pb: 4 }}>
        <BackButton />
        <Alert severity="warning" sx={{ mt: 2, fontFamily: 'Poppins' }}>
          Você não tem permissões suficientes para acessar o VeloInsights. 
          Entre em contato com o administrador.
        </Alert>
      </Container>
    )
  }
  
  // Loading state
  if (loading && !data) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8, pb: 4, textAlign: 'center' }}>
        <BackButton />
        <Box sx={{ mt: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, fontFamily: 'Poppins' }}>
            Carregando VeloInsights...
          </Typography>
        </Box>
      </Container>
    )
  }
  
  // Error state
  if (error && !data) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8, pb: 4 }}>
        <BackButton />
        <Alert severity="error" sx={{ mt: 2, fontFamily: 'Poppins' }}>
          Erro ao carregar dados: {error}
        </Alert>
      </Container>
    )
  }
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8, pb: 4 }}>
      <BackButton />
      
      {/* Tabs e Botões de Fonte de Dados */}
      <Box sx={{
        borderBottom: 1,
        borderColor: 'divider',
        mb: 3,
        mt: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative'
      }}>
        {/* Abas do lado esquerdo */}
        <Tabs 
          value={availableTabs.findIndex(tab => tab.id === activeTab)} 
          onChange={(e, v) => setActiveTab(availableTabs[v]?.id || 0)}
          aria-label="veloinsights tabs"
          sx={{
            '& .MuiTab-root': {
              fontSize: '1.25rem',
              fontWeight: 600,
              textTransform: 'none',
              minHeight: 48,
              '&.Mui-selected': {
                color: 'var(--blue-medium)',
              },
              '&:not(.Mui-selected)': {
                color: 'var(--gray)',
                opacity: 0.6,
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--blue-medium)',
              height: 3,
            }
          }}
        >
          {availableTabs.map((tab) => (
            <Tab 
              key={tab.id}
              label={tab.label} 
              value={tab.id}
              id={`veloinsights-tab-${tab.id}`}
              aria-controls={`veloinsights-tabpanel-${tab.id}`}
            />
          ))}
        </Tabs>

        {/* Botões de Fonte de Dados - Lado Direito */}
        <ButtonGroup 
          variant="outlined" 
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            '& .MuiButton-root': {
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              borderColor: 'var(--blue-dark)',
              color: 'var(--gray)',
              padding: '8px 16px',
              minWidth: '100px',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'var(--blue-medium)',
                color: 'var(--white)',
                borderColor: 'var(--blue-medium)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(22, 52, 255, 0.3)',
              },
              '&.Mui-selected': {
                backgroundColor: 'var(--blue-medium)',
                color: 'var(--white)',
                borderColor: 'var(--blue-medium)',
                '&:hover': {
                  backgroundColor: 'var(--blue-dark)',
                  borderColor: 'var(--blue-dark)',
                }
              }
            }
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setActiveDataSource('telefonia')}
            sx={{
              backgroundColor: 'transparent !important',
              color: activeDataSource === 'telefonia' ? '#1634FF !important' : '#272A30 !important',
              borderColor: activeDataSource === 'telefonia' ? '#1634FF !important' : '#272A30 !important',
              borderWidth: '1px',
              fontWeight: 600,
              opacity: activeDataSource === 'telefonia' ? 1 : 0.7,
              '&:hover': {
                backgroundColor: 'transparent !important',
                color: activeDataSource === 'telefonia' ? '#1634FF !important' : '#272A30 !important',
                borderColor: activeDataSource === 'telefonia' ? '#1634FF !important' : '#272A30 !important',
              },
              '&:focus': {
                backgroundColor: 'transparent !important',
                color: activeDataSource === 'telefonia' ? '#1634FF !important' : '#272A30 !important',
                borderColor: activeDataSource === 'telefonia' ? '#1634FF !important' : '#272A30 !important',
              },
              '&:active': {
                backgroundColor: 'transparent !important',
                color: activeDataSource === 'telefonia' ? '#1634FF !important' : '#272A30 !important',
                borderColor: activeDataSource === 'telefonia' ? '#1634FF !important' : '#272A30 !important',
              }
            }}
          >
            Telefonia
          </Button>
          <Button
            variant="outlined"
            onClick={() => setActiveDataSource('tickets')}
            sx={{
              backgroundColor: 'transparent !important',
              color: activeDataSource === 'tickets' ? '#1634FF !important' : '#272A30 !important',
              borderColor: activeDataSource === 'tickets' ? '#1634FF !important' : '#272A30 !important',
              borderWidth: '1px',
              fontWeight: 600,
              opacity: activeDataSource === 'tickets' ? 1 : 0.7,
              '&:hover': {
                backgroundColor: 'transparent !important',
                color: activeDataSource === 'tickets' ? '#1634FF !important' : '#272A30 !important',
                borderColor: activeDataSource === 'tickets' ? '#1634FF !important' : '#272A30 !important',
              },
              '&:focus': {
                backgroundColor: 'transparent !important',
                color: activeDataSource === 'tickets' ? '#1634FF !important' : '#272A30 !important',
                borderColor: activeDataSource === 'tickets' ? '#1634FF !important' : '#272A30 !important',
              },
              '&:active': {
                backgroundColor: 'transparent !important',
                color: activeDataSource === 'tickets' ? '#1634FF !important' : '#272A30 !important',
                borderColor: activeDataSource === 'tickets' ? '#1634FF !important' : '#272A30 !important',
              }
            }}
          >
            Tickets
          </Button>
        </ButtonGroup>
      </Box>
      
      {/* Tab Content */}
      {activeTab === 0 && (
        <MetricsDashboard 
          metrics={null}
          rankings={null}
          octaData={octaData}
          data={data}
          periodo="Service Account"
          fullDataset={data}
          hideNames={!canViewNames}
          dataSource={activeDataSource}
        />
      )}
      
      {activeTab === 1 && canViewDetailedCharts && (
        <ChartsDetailedTab 
          data={data}
          operatorMetrics={null}
          rankings={null}
          selectedPeriod="Service Account"
          isLoading={loading}
          pauseData={null}
          userData={user}
          filters={{}}
          originalData={data}
          onFiltersChange={() => {}}
          loadDataOnDemand={() => {}}
          dataSource={activeDataSource}
        />
      )}
      
      {activeTab === 2 && canViewAgentAnalysis && (
        <AgentAnalysis 
          data={data}
          operatorMetrics={null}
          rankings={null}
          hideNames={!canViewNames}
          dataSource={activeDataSource}
        />
      )}
    </Container>
  )
}

export default IGPPage