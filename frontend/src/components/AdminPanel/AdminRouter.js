// src/components/AdminPanel/AdminRouter.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import ContentModeration from './ContentModeration';
import MarketplaceAdmin from './MarketplaceAdmin';
const AdminRouter = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="content" element={<ContentModeration />} />
        <Route path="marketplace" element={<MarketplaceAdmin />} />
      </Route>
    </Routes>
  );
};

export default AdminRouter;