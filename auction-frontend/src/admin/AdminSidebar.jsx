import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/listings', label: 'Listings' },
  { to: '/admin/users', label: 'KYC & Users' },
];

function AdminSidebar() {
  return (
    <aside className="w-56 shrink-0 bg-green-900 text-white min-h-screen p-4">
      <h2 className="text-white font-bold text-lg mb-6">Admin Panel</h2>
      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm transition ${
                isActive ? 'bg-emerald-600 text-white' : 'text-green-100 hover:bg-green-800'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default AdminSidebar;