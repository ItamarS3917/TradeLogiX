import React from 'react';
import { Box, Breadcrumbs, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CloudSyncManager from '../../components/CloudSync/CloudSyncManager';

const CloudSyncPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Dashboard
        </Link>
        <Typography color="textPrimary">Cloud Sync</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        Cloud Synchronization
      </Typography>
      
      <CloudSyncManager />
    </Box>
  );
};

export default CloudSyncPage;
