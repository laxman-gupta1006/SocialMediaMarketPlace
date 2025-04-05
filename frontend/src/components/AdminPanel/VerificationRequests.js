// src/components/AdminPanel/VerificationRequests.jsx
import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, LinearProgress, IconButton, Tooltip,
  Snackbar, Alert
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import config from '../../Config/config';

const BACKEND_URL = config.BACKEND_URL;

const VerificationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch verification requests from the backend
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/verification/requests`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch verification requests');
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle approve or reject actions
  const handleAction = async (userId, action) => {
    try {
      const endpoint =
        action === 'approve'
          ? `${BACKEND_URL}/api/admin/verification/approve/${userId}`
          : `${BACKEND_URL}/api/admin/verification/reject/${userId}`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        credentials: 'include'
      });
      if (!response.ok) throw new Error(`${action} action failed`);
      setSuccess(`User ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      // Remove the processed request from the list
      setRequests(prev => prev.filter(req => req._id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Verification Requests
      </Typography>
      {loading && <LinearProgress />}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Document</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>
                  <Typography variant="subtitle1">{request.username}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {request.fullName}
                  </Typography>
                </TableCell>
                <TableCell>{request.email}</TableCell>
                <TableCell>
                  {request.verification?.document ? (
                    <a
                      href={request.verification.document}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Document
                    </a>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Approve">
                    <IconButton
                      color="success"
                      onClick={() => handleAction(request._id, 'approve')}
                    >
                      <CheckCircle />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton
                      color="error"
                      onClick={() => handleAction(request._id, 'reject')}
                    >
                      <Cancel />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No pending verification requests.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
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
    </>
  );
};

export default VerificationRequests;
