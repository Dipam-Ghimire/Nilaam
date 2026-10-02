import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ProfileMenu from './ProfileMenu';

function Navbar() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const isSeller = user?.role === 'seller' || user?.role === 'buyer_seller';
  const needsKyc = user && user.kyc_status !== 'verified';

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/listings${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ''}`);
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-line">
      <div className="max-w-[1360px] mx-auto px-10 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
            N
          </span>
          <span className="text-lg font-bold text-primary tracking-tight">Nilaam</span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center flex-1 max-w-md h-10 rounded-xl border border-line-strong bg-white focus-within:ring-2 focus-within:ring-primary-hover transition"
        >
          <svg className="w-4 h-4 ml-3 text-ink-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cameras, bikes, laptops..."
            className="flex-1 bg-transparent px-2 text-sm text-ink placeholder:text-ink-3 focus:outline-none"
          />
          <button
            type="submit"
            className="h-8 w-8 mr-1 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition"
            aria-label="Search"
          >
            →
          </button>
        </form>

        <div className="flex items-center gap-6 ml-auto text-sm font-medium text-ink-2">
          <Link to="/listings" className="hover:text-primary transition">Browse Auctions</Link>
          {isSeller && <Link to="/dashboard" className="hover:text-primary transition">Dashboard</Link>}
          {needsKyc && (
            <Link
              to="/kyc"
              className="px-3 py-1 rounded-full bg-warn-soft text-warn text-xs font-semibold hover:opacity-80 transition"
            >
              Verify KYC
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {user && (
            <button
              type="button"
              aria-label="Notifications"
              className="w-9 h-9 rounded-full flex items-center justify-center text-ink-2 hover:bg-canvas transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
          )}

          {user ? (
            <ProfileMenu user={user} />
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-ink hover:text-primary transition">
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-card hover:bg-primary-hover transition"
              >
                Sign Up
              </Link>
            </>
          )}

          {isSeller && (
            <Link
              to="/create-listing"
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-card hover:bg-primary-hover transition"
            >
              + Start Listing
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;