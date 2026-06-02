// VERSION: v1.0.0 | DATE: 2026-06-01 | AUTHOR: VeloHub Development Team
import React, { useState } from 'react';
import { Container, Tabs, Tab, Box } from '@mui/material';
import BackButton, { VoltarHeaderRow } from '../components/common/BackButton';
import LegalDocumentosTab from '../components/corporativo/LegalDocumentosTab';
import LegalAdesaoTab from '../components/corporativo/LegalAdesaoTab';

const TAB_SX = {
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
    },
  },
  '& .MuiTabs-indicator': {
    backgroundColor: 'var(--blue-light)',
    height: 2,
  },
};

const CorporativoLegalPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 6.4, pb: 3.2, position: 'relative' }}>
      <VoltarHeaderRow
        left={<BackButton to="/corporativo" />}
        center={
          <Tabs
            value={activeTab}
            onChange={(_e, value) => setActiveTab(value)}
            aria-label="corporativo legal tabs"
            sx={TAB_SX}
          >
            <Tab label="Gestão de Documentos" />
            <Tab label="Lista de Adesão" />
          </Tabs>
        }
      />

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && <LegalDocumentosTab />}
        {activeTab === 1 && <LegalAdesaoTab />}
      </Box>
    </Container>
  );
};

export default CorporativoLegalPage;
