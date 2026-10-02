import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function SellerProtectedLayout() {
  const { user } = useContext(AuthContext);

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow both Seller and Buyer + Seller accounts
  const role = String(user?.role || '')
    .toLowerCase()
    .replace(/[\s_-]/g, '');

  const canSell =
    role === 'seller' ||
    role === 'buyerseller';

  // Buyer-only users cannot access seller pages
  if (!canSell) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default SellerProtectedLayout;