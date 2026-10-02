import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f8f7ff]">

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5">

        <div className="flex flex-col lg:flex-row gap-5">

          {/* ADMIN SIDEBAR */}
          <AdminSidebar />

          {/* ADMIN PAGE */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>

        </div>

      </div>

    </div>
  );
}

export default AdminLayout;