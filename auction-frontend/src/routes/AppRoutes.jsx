import { Route, Routes } from 'react-router-dom';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Listings from '../pages/Listings';
import AuctionDetail from '../pages/AuctionDetail';
import KycVerification from '../pages/KycVerification';
import CreateListing from '../pages/CreateListing';
import Dashboard from '../pages/Dashboard';
import StartAuction from '../pages/StartAuction';

import SellerProtectedLayout from '../components/layout/SellerProtectedLayout';
import ScrollToTop from '../components/layout/ScrollToTop';
import MyOrders from '../pages/MyOrders';
import PaymentCallback from '../pages/PaymentCallback';

function AppRoutes() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/listings" element={<Listings />} />

        <Route path="/auctions" element={<Listings />} />

        <Route
          path="/auctions/:id"
          element={<AuctionDetail />}
        />

        {/* KYC */}
        <Route
          path="/kyc"
          element={<KycVerification />}
        />

        {/* Seller + Buyer/Seller protected pages */}
        <Route element={<SellerProtectedLayout />}>
          <Route
            path="/create-listing"
            element={<CreateListing />}
          />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/start-auction/:productId"
            element={<StartAuction />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default AppRoutes;