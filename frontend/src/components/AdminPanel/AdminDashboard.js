// src/components/AdminPanel/AdminDashboard.jsx
import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { 
  People, 
  Store, 
  PostAdd, 
  MonetizationOn,
  Timeline
} from '@mui/icons-material';
import DashboardCard from './DashboardCard';

const AdminDashboard = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Total Users"
          value="45.6k"
          icon={<People fontSize="large" />}
          trend={12.5}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Marketplace Transactions"
          value="2.34k"
          icon={<Store fontSize="large" />}
          trend={8.2}
          blockchain
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Daily Content"
          value="15.2k"
          icon={<PostAdd fontSize="large" />}
          trend={-3.1}
        />
      </Grid>
      
      {/* Analytics Section */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Platform Analytics
          </Typography>
          <Timeline sx={{ height: 300 }} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdminDashboard;