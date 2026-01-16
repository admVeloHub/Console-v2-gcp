// VERSION: v1.3.0 | DATE: 2025-02-02 | AUTHOR: VeloHub Development Team
import React, { useState } from 'react';
import { Container, Tabs, Tab, Box, Typography } from '@mui/material';
import BackButton from '../components/common/BackButton';
import WhatsAppAdmin from '../components/whatsapp/WhatsAppAdmin';
import ApiIAServices from '../components/api-ia/ApiIAServices';
import EmailServices from '../components/email/EmailServices';

const ConexoesPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8, pb: 4 }}>
      {/* Header com botão voltar e abas alinhadas */}
      <Box sx={{ position: 'relative', mb: 3.2, minHeight: 40 }}>
        <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
          <BackButton />
        </Box>
        <Box sx={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          width: 'max-content'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)}
            aria-label="conexoes tabs"
            sx={{
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontFamily: 'Poppins',
                fontWeight: 500,
                textTransform: 'none',
                minHeight: 48,
                '&.Mui-selected': {
                  color: 'var(--blue-light)',
                },
                '&:not(.Mui-selected)': {
                  color: 'rgba(0, 0, 0, 0.35)',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'var(--blue-light)',
                height: 2,
              }
            }}
          >
            <Tab label="Whatsapp" />
            <Tab label="API de IA" />
            <Tab label="Email" />
          </Tabs>
        </Box>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          <WhatsAppAdmin />
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <ApiIAServices />
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <EmailServices />
        </Box>
      )}
    </Container>
  );
};

export default ConexoesPage;
