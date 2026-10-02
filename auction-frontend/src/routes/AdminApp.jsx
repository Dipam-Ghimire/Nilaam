import { Navigate, Route, Routes } from 'react-router-dom';

import AdminProtectedLayout from '../components/layout/AdminProtectedLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminListings from '../pages/admin/AdminListings';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminDisputes from '../pages/admin/AdminDisputes';

function AdminApp() {
  return (
    <Routes>
      <Route element={<AdminProtectedLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/listings" element={<AdminListings />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/disputes" element={<AdminDisputes />} />

        <Route
          path="*"
          element={<Navigate to="/admin" replace />}
        />
      </Route>
    </Routes>
  );
}

export default AdminApp;