// src/components/AdminPanel/UserManagement.jsx
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Chip
} from '@mui/material';
import { Block, CheckCircle } from '@mui/icons-material';

const UserManagement = () => {
  const [users, setUsers] = useState([
    // Sample data
    { id: 1, name: 'User1', email: 'user1@example.com', status: 'active', role: 'user' },
    { id: 2, name: 'User2', email: 'user2@example.com', status: 'banned', role: 'admin' },
  ]);

  const handleBanUser = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'banned' } : user
    ));
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip 
                  label={user.status} 
                  color={user.status === 'active' ? 'success' : 'error'} 
                />
              </TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                {user.status === 'active' ? (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Block />}
                    onClick={() => handleBanUser(user.id)}
                  >
                    Ban
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                  >
                    Unban
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserManagement;