// src/components/AdminPanel/AuditLog.jsx
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, LinearProgress, Typography, TextField, Select,
  MenuItem, InputLabel, FormControl, Grid, Pagination, IconButton
} from '@mui/material';
import { 
  Security, Report, Settings, Delete, Edit, Block, CheckCircle, 
  CalendarToday, FilterList, Refresh 
} from '@mui/icons-material';
import moment from 'moment';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1
  });

  const actionIcons = {
    USER_BAN: <Block color="error" />,
    USER_UNBAN: <CheckCircle color="success" />,
    POST_DELETION: <Delete color="error" />,
    POST_REPORTS_CLEARED: <CheckCircle color="success" />,
    USER_PROMOTION: <Security color="info" />,
    USER_DEMOTION: <Security color="warning" />,
    DEFAULT: <Settings />
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        page: filters.page,
        limit: filters.limit
      }).toString();

      const response = await fetch(`https://localhost:3000/api/admin/logs?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch logs');
      
      const { data, pagination: paginationData } = await response.json();
      
      setLogs(data);
      setPagination(paginationData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters.page, filters.limit]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const formatDetails = (action, details) => {
    switch(action) {
      case 'USER_BAN':
      case 'USER_UNBAN':
        return `User status changed from ${details.previousStatus} to ${details.newStatus}`;
      case 'POST_DELETION':
        return `Deleted post with ${details.reportsCount} reports`;
      case 'USER_PROMOTION':
        return `Granted permissions: ${details.grantedPermissions}`;
      default:
        return JSON.stringify(details);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Action Type</InputLabel>
            <Select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              label="Action Type"
            >
              <MenuItem value="">All Actions</MenuItem>
              <MenuItem value="USER_BAN">User Bans</MenuItem>
              <MenuItem value="USER_UNBAN">User Unbans</MenuItem>
              <MenuItem value="POST_DELETION">Post Deletions</MenuItem>
              <MenuItem value="USER_PROMOTION">Promotions</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={fetchLogs} color="primary">
            <Refresh />
          </IconButton>
        </Grid>
      </Grid>

      <TableContainer>
        {loading && <LinearProgress />}
        {error && <Typography color="error" p={2}>{error}</Typography>}

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell>Performed By</TableCell>
              <TableCell>Target</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>
                  <Chip
                    icon={actionIcons[log.action] || actionIcons.DEFAULT}
                    label={log.action.replace(/_/g, ' ')}
                    color={
                      log.action.includes('DELETE') ? 'error' : 
                      log.action.includes('PROMOTION') ? 'success' : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  {log.performedBy?.username || 'System'}
                  <Typography variant="caption" display="block">
                    {log.performedBy?.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  {log.targetUser?.username || 'N/A'}
                </TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Typography variant="body2">
                    {formatDetails(log.action, log.details)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {moment(log.timestamp).format('MMM D, YYYY HH:mm')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
        <Pagination
          count={pagination.totalPages}
          page={filters.page}
          onChange={(e, page) => handleFilterChange('page', page)}
          color="primary"
        />
      </Grid>
    </Paper>
  );
};

export default AuditLog;