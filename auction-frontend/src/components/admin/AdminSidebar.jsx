import { NavLink, useNavigate } from 'react-router-dom';

function Icon({ children, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined text-[20px] ${className}`}
    >
      {children}
    </span>
  );
}

function AdminSidebar() {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      path: '/admin',
    },
    {
      label: 'Listings',
      icon: 'gavel',
      path: '/admin/listings',
    },
    {
      label: 'Users & KYC',
      icon: 'badge',
      path: '/admin/users',
    },
    {
      label: 'Auctions',
      icon: 'emoji_events',
      path: '/admin/auctions',
    },
    {
      label: 'Financials',
      icon: 'account_balance',
      path: '/admin/financials',
    },
  ];

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login');
    window.location.reload();
  }

  return (
    <>
      {/* Material Symbols */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
        `}
      </style>

      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col justify-between bg-green-950 text-white shadow-[2px_0_12px_rgba(0,0,0,0.08)] lg:flex">
        <div className="flex min-h-0 flex-1 flex-col">
          {/* BRAND HEADER */}
          <div className="flex h-20 items-center justify-between bg-green-900 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-xl font-bold text-white shadow-sm">
                N
              </div>

              <div className="flex flex-col">
                <span className="text-xl font-bold leading-tight">
                  Nilaam
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-green-300">
                  Nilaam Backoffice
                </span>
              </div>
            </div>
          </div>

          {/* OPERATIONS */}
          <div className="px-4 py-3">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-green-300">
              Operations
            </p>
          </div>

          {/* NAVIGATION */}
          <nav className="space-y-1.5 px-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
                    isActive
                      ? 'bg-green-700 font-semibold text-white shadow-sm'
                      : 'text-green-100 hover:bg-green-800/60 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={
                        isActive
                          ? 'text-white'
                          : 'text-green-300'
                      }
                    />

                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* QUICK ACCESS */}
          <div className="mt-6 px-4">
            <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-green-300">
              Quick Access
            </p>

            <div className="space-y-1">
              <NavLink
                to="/admin/users"
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs text-green-100 transition hover:bg-green-800/60 hover:text-white"
              >
                <Icon className="text-[17px] text-green-300">
                  verified
                </Icon>

                <span>Review KYC</span>
              </NavLink>

              <NavLink
                to="/admin/listings"
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs text-green-100 transition hover:bg-green-800/60 hover:text-white"
              >
                <Icon className="text-[17px] text-green-300">
                  fact_check
                </Icon>

                <span>Review Listings</span>
              </NavLink>
            </div>
          </div>
        </div>

        {/* ADMIN PROFILE + LOGOUT */}
        <div className="border-t border-green-800 p-4">
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-green-900/70 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-bold ring-2 ring-green-500">
                A
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  Administrator
                </p>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-400" />

                  <span className="truncate text-[10px] text-green-300">
                    Super Admin
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="rounded-lg p-1.5 text-green-300 transition hover:bg-green-800 hover:text-white"
            >
              <Icon className="text-[20px]">
                logout
              </Icon>
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE SIDEBAR */}
      <div className="border-b border-slate-200 bg-green-950 px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 font-bold text-white">
              N
            </div>

            <div>
              <p className="font-bold text-white">NILAAM</p>
              <p className="text-[9px] uppercase tracking-widest text-green-300">
                Administration
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2 text-green-200 hover:bg-green-800"
          >
            <Icon>logout</Icon>
          </button>
        </div>

        <nav className="mt-3 flex gap-1 overflow-x-auto pb-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                  isActive
                    ? 'bg-green-700 text-white'
                    : 'text-green-200 hover:bg-green-800'
                }`
              }
            >
              <Icon className="text-[17px]">
                {item.icon}
              </Icon>

              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}

export default AdminSidebar;