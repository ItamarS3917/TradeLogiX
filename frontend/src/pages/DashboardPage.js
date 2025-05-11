import React from 'react';
import PerformanceDashboard from '../components/dashboard/PerformanceDashboard';
import { Typography, Box, Breadcrumbs, Link, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Home as HomeIcon, Add as AddIcon } from '@mui/icons-material';

const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              component={RouterLink}
              to="/"
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Link>
            <Typography color="text.primary">Dashboard</Typography>
          </Breadcrumbs>
          <Typography variant="h4" component="h1" mt={1}>
            Trading Dashboard
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/journal/new"
          >
            Log New Trade
          </Button>
        </Box>
      </Box>

      <PerformanceDashboard />
    </div>
  );
};

export default DashboardPage;
