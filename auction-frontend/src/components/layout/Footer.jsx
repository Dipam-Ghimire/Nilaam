import { Link } from 'react-router-dom';

const linkClass = 'text-ink-3 hover:text-primary transition';

function Footer() {
  return (
    <footer className="mt-16">
      <div className="bg-lavender border-y border-line">
        <div className="max-w-[1360px] mx-auto px-10 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-ink">Nepal KYC Verified Sellers</p>
            <p className="text-ink-3 text-xs">Citizen ID verified community bidding</p>
          </div>
          <div>
            <p className="font-semibold text-ink">Escrow Protected Payments</p>
            <p className="text-ink-3 text-xs">Secured transactions via eSewa &amp; Khalti</p>
          </div>
          <div>
            <p className="font-semibold text-ink">Fast Delivery across 77 Districts</p>
            <p className="text-ink-3 text-xs">Inspected tracking &amp; doorstep pickup</p>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="max-w-[1360px] mx-auto px-10 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">N</span>
              <span className="text-lg font-bold text-primary">Nilaam</span>
            </div>
            <p className="text-ink-3 leading-relaxed">
              Nepal's trusted marketplace for real-time competitive bidding on pre-owned electronics, vehicles, and unique collectibles.
            </p>
            <p className="text-ink-3 mt-3 text-xs">📍 New Baneshwor, Kathmandu, Nepal</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.04em] text-ink mb-3">Marketplace</h4>
            <ul className="space-y-2">
              <li><Link to="/listings" className={linkClass}>Browse All</Link></li>
              <li><Link to="/listings" className={linkClass}>Live Auctions</Link></li>
              <li><span className="text-ink-3">Ending Soon</span></li>
              <li><span className="text-ink-3">Past Deals</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.04em] text-ink mb-3">Sell</h4>
            <ul className="space-y-2">
              <li><span className="text-ink-3">Listing Guidelines</span></li>
              <li><span className="text-ink-3">Seller Fees</span></li>
              <li><Link to="/kyc" className={linkClass}>Verification</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.04em] text-ink mb-3">Support &amp; Legal</h4>
            <ul className="space-y-2">
              <li><span className="text-ink-3">FAQ</span></li>
              <li><span className="text-ink-3">Dispute Center</span></li>
              <li><span className="text-ink-3">Terms of Service</span></li>
              <li><span className="text-ink-3">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-line">
          <div className="max-w-[1360px] mx-auto px-10 py-4 flex justify-between text-xs text-ink-3">
            <span>&copy; 2026 Nilaam.np — Secondhand Auction Platform Nepal. All prices in NPR (₨).</span>
            <span className="font-mono">Secure &amp; Authentic Nepal Exchange</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;