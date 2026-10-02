import { useContext } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import AdminApp from './routes/AdminApp';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

function Shell() {
  const { user } = useContext(AuthContext);

  if (user?.role === 'admin') {
    return <AdminApp />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Navbar />
      <main className="flex-grow">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}