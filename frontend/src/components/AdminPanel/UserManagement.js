// src/components/AdminPanel/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Tabs, Tab, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Button, LinearProgress, 
  Typography, Pagination, Snackbar, Alert, TextField, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Select, MenuItem, IconButton, Tooltip
} from '@mui/material';
import { 
  Block, CheckCircle, AdminPanelSettings, Edit, 
  Visibility, Cancel, AssignmentInd, LockOpen, RestartAlt
} from '@mui/icons-material';
import { format } from 'date-fns';
import VerificationRequests from './VerificationRequests';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [verifyResult, setVerifyResult] = useState('');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState({ users: false, logs: false });
  const [pagination, setPagination] = useState({ 
    page: 1, 
    limit: 10, 
    total: 0 
  });
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState([]);

  const permissionOptions = [
    'manage_users',
    'manage_posts',
    'manage_marketplace',
    'full_access'
  ];

  // Fetch users data for "User Management" tab (activeTab === 0)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(prev => ({ ...prev, users: true }));
        const query = new URLSearchParams({
          page: pagination.page,
          limit: pagination.limit,
          search
        }).toString();
        const response = await fetch(`/api/admin/users?${query}`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const { users, total } = await response.json();
        setUsers(users);
        setPagination(prev => ({ ...prev, total }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
    };

    if (activeTab === 0) fetchUsers();
  }, [activeTab, pagination.page, search]);

  // Fetch admin logs for "Admin Logs" tab (activeTab === 1)
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(prev => ({ ...prev, logs: true }));
        const response = await fetch(`/api/admin/logs`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch logs');
        const logs = await response.json();
        setLogs(logs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(prev => ({ ...prev, logs: false }));
      }
    };

    if (activeTab === 1) fetchLogs();
  }, [activeTab]);

  const handleVerifyLogs = async () => {
    try {
      setLoading(prev => ({ ...prev, logs: true }));
      const response = await fetch(`/api/admin/logs/verify`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Log verification failed');
      const result = await response.json();
      setVerifyResult(result.message);
      if (result.valid) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, logs: false }));
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const response = await fetch(
        `/api/admin/users/${userId}/${action}`, 
        { method: 'POST', credentials: 'include' }
      );
      if (!response.ok) throw new Error(`${action} failed`);
      setUsers(users.map(user => 
        user._id === userId ? { 
          ...user, 
          status: action === 'ban' ? 'banned' : 'active',
          banned: action === 'ban'
        } : user
      ));
      setSuccess(`User ${action === 'ban' ? 'banned' : 'unbanned'} successfully`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const handlePromoteDemote = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      let updatedUser;

      if (selectedUser.isAdmin) {
        // Update existing admin permissions
        const response = await fetch(
          `/api/admin/admins/permissions/${selectedUser._id}`, 
          {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissions })
          }
        );
        if (!response.ok) throw new Error('Failed to update permissions');
        updatedUser = {
          ...selectedUser,
          permissions
        };
      } else {
        // Promote to admin
        const response = await fetch(
          `/api/admin/users/${selectedUser._id}/promote`, 
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissions })
          }
        );
        if (!response.ok) throw new Error('Promotion failed');
        const data = await response.json();
        updatedUser = {
          ...selectedUser,
          isAdmin: true,
          roles: [...selectedUser.roles, 'admin'],
          permissions: data.permissions,
          adminId: data.adminId
        };
      }

      setUsers(users.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));
      setSuccess(selectedUser.isAdmin 
        ? 'Permissions updated successfully' 
        : 'User promoted to admin successfully'
      );
      setSelectedUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const handleDemote = async (userId) => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const response = await fetch(
        `/api/admin/users/${userId}/demote`, 
        { method: 'POST', credentials: 'include' }
      );
      if (!response.ok) throw new Error('Demotion failed');
      setUsers(users.map(user => 
        user._id === userId ? {
          ...user,
          isAdmin: false,
          roles: user.roles.filter(role => role !== 'admin'),
          permissions: [],
          adminId: null
        } : user
      ));
      setSuccess('Admin demoted successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // New function: Clear the login lock for a user
  const handleClearLock = async (userId) => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const response = await fetch(
        `/api/admin/users/${userId}/clear-lock`,
        { method: 'POST', credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to clear lock');
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, failedLoginAttempts: 0, lockUntil: null } 
          : user
      ));
      setSuccess('User lock cleared successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // New function: Reset admin verification flag for a user
  const handleResetAdminVerification = async (userId) => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const response = await fetch(
        `/api/admin/users/${userId}/reset-admin-verification`,
        { method: 'POST', credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to reset admin verification');
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, verification: { ...user.verification, adminVerified: false } } 
          : user
      ));
      setSuccess('Admin verification reset successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Tabs value={activeTab} onChange={(e, newVal) => setActiveTab(newVal)}>
        <Tab label="User Management" icon={<AssignmentInd />} />
        <Tab label="Admin Logs" icon={<Visibility />} />
        <Tab label="Verification Requests" icon={<AdminPanelSettings />} />
      </Tabs>

      {activeTab === 0 && (
        <>
          <Box sx={{ display: 'flex', gap: 2, my: 3 }}>
            <TextField
              label="Search Users"
              variant="outlined"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>

          <TableContainer component={Paper}>
            {loading.users && <LinearProgress />}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <img
                          src={"/api/"+user.profileImage}
                          alt={user.username}
                          style={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%' 
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle1">
                            {user.username}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip 
                        label={user.banned ? 'Banned' : 'Active'} 
                        color={user.banned ? 'error' : 'success'} 
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      {user.isAdmin ? (
                        <Chip
                          label="Admin"
                          color="primary"
                          icon={<AdminPanelSettings />}
                        />
                      ) : (
                        <Chip label="User" variant="outlined" />
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {user.banned ? (
                          <Tooltip title="Unban User">
                            <IconButton
                              color="success"
                              onClick={() => handleUserAction(user._id, 'unban')}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Ban User">
                            <IconButton
                              color="error"
                              onClick={() => handleUserAction(user._id, 'ban')}
                            >
                              <Block />
                            </IconButton>
                          </Tooltip>
                        )}

                        {user.isAdmin ? (
                          <>
                            <Tooltip title="Edit Permissions">
                              <IconButton
                                color="primary"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setPermissions(user.permissions);
                                }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Demote Admin">
                              <IconButton
                                color="warning"
                                onClick={() => handleDemote(user._id)}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                            {user.verification && user.verification.adminVerified && (
                              <Tooltip title="Reset Admin Verification">
                                <IconButton
                                  color="secondary"
                                  onClick={() => handleResetAdminVerification(user._id)}
                                >
                                  <RestartAlt />
                                </IconButton>
                              </Tooltip>
                            )}
                          </>
                        ) : (
                          <Tooltip title="Promote to Admin">
                            <IconButton
                              color="warning"
                              onClick={() => {
                                setSelectedUser(user);
                                setPermissions([]);
                              }}
                            >
                              <AdminPanelSettings />
                            </IconButton>
                          </Tooltip>
                        )}

                        {(user.failedLoginAttempts > 0 || user.lockUntil) && (
                          <Tooltip title="Clear Lock">
                            <IconButton
                              color="info"
                              onClick={() => handleClearLock(user._id)}
                            >
                              <LockOpen />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              count={Math.ceil(pagination.total / pagination.limit)}
              page={pagination.page}
              onChange={(e, page) => setPagination(prev => ({ ...prev, page }))}
              sx={{ p: 2, display: 'flex', justifyContent: 'center' }}
            />
          </TableContainer>
        </>
      )}

      {activeTab === 1 && (<>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 1 }}>
          <Button 
            variant="contained" 
            onClick={handleVerifyLogs}
            disabled={loading.logs}
            startIcon={<CheckCircle />}
          >
            Verify Logs
          </Button>
        </Box>
      
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          {loading.logs && <LinearProgress />}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Target User</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.admin.username}</TableCell>
                  <TableCell>
                    {log.targetUser?.username || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography variant="body2" noWrap>
                      {JSON.stringify(log.details)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </>
      )}

      {activeTab === 2 && (
        <Box sx={{ mt: 3 }}>
          <VerificationRequests />
        </Box>
      )}

      {/* Permissions Dialog */}
      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)}>
        <DialogTitle>
          {selectedUser?.isAdmin 
            ? 'Edit Admin Permissions'
            : 'Promote to Admin'}
        </DialogTitle>
        <DialogContent sx={{ minWidth: 400, pt: 2 }}>
          <Select
            multiple
            fullWidth
            value={permissions}
            onChange={(e) => setPermissions(e.target.value)}
            renderValue={(selected) => selected.join(', ')}
          >
            {permissionOptions.map((perm) => (
              <MenuItem key={perm} value={perm}>
                {perm.replace(/_/g, ' ')}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSelectedUser(null)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handlePromoteDemote}
            disabled={loading.users}
          >
            {selectedUser?.isAdmin ? 'Update Permissions' : 'Promote'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
