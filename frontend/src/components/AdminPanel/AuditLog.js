// src/components/AdminPanel/AuditLog.jsx
import React,{useState} from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { Security, AccountCircle, Edit } from '@mui/icons-material';

const AuditLogTable = ({ logs }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Action</TableCell>
          <TableCell>User</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Timestamp</TableCell>
          <TableCell>Details</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>
              <Chip
                icon={log.type === 'security' ? <Security /> : log.type === 'user' ? <AccountCircle /> : <Edit />}
                label={log.action}
                color={
                  log.severity === 'high' ? 'error' :
                  log.severity === 'medium' ? 'warning' : 'default'
                }
              />
            </TableCell>
            <TableCell>{log.user}</TableCell>
            <TableCell>{log.type}</TableCell>
            <TableCell>{log.timestamp}</TableCell>
            <TableCell>{log.details}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const AuditLog = () => {
  const [logs] = useState([
    // Sample audit logs
    {
      id: 1,
      action: 'User banned',
      user: 'admin@socialsphere',
      type: 'security',
      severity: 'high',
      timestamp: '2024-02-20 14:30',
      details: 'Banned user: john_doe (ID: 123)'
    }
  ]);

  return <AuditLogTable logs={logs} />;
};

export default AuditLog;