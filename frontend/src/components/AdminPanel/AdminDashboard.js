// src/components/AdminPanel/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { People, PostAdd, Timeline } from '@mui/icons-material';
import DashboardCard from './DashboardCard'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect(() => {
  //   const fetchStats = async () => {
  //     try {
  //       const data = await adminApi.getStats();
  //       setStats(data);
  //     } catch (err) {
  //       setError('Failed to load statistics');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchStats();
  // }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<People fontSize="large" />}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Daily Posts"
          value={stats?.dailyPosts?.[0]?.count || 0}
          icon={<PostAdd fontSize="large" />}
        />
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Post Activity
          </Typography>
          {loading ? (
            <Typography>Loading chart...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={stats?.dailyPosts || []}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2563EB" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdminDashboard;