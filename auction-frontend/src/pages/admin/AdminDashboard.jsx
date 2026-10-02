import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Navbar from '../../components/layout/Navbar';
import AdminSidebar from '../../components/admin/AdminSidebar';

import { getStats } from '../../api/admin';
import { getAuctions } from '../../api/auctions';

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value) {
  if (value === null || value === undefined) return '0';

  const number = Number(value);

  if (Number.isNaN(number)) return value;

  return number.toLocaleString('en-IN');
}

function formatNPR(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 'NPR 0';
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return `NPR ${value}`;
  }

  return `NPR ${number.toLocaleString('en-IN')}`;
}

function getAuctionPrice(auction) {
  const currentBid = Number(
    auction?.current_bid ??
      auction?.currentBid ??
      0
  );

  const startingPrice = Number(
    auction?.starting_price ??
      auction?.product?.starting_price ??
      0
  );

  return currentBid > 0
    ? currentBid
    : startingPrice;
}

function getAuctionTitle(auction) {
  return (
    auction?.product?.title ||
    auction?.title ||
    'Untitled Auction'
  );
}

function getAuctionLocation(auction) {
  return (
    auction?.product?.city ||
    auction?.city ||
    'Nepal'
  );
}

function getAuctionImage(auction) {
  const image =
    auction?.product?.image_url ||
    auction?.product?.image ||
    auction?.image_url ||
    auction?.image ||
    '';

  if (!image) return '';

  if (
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:')
  ) {
    return image;
  }

  return `http://127.0.0.1:8000/storage/${image.replace(
    /^\/+/,
    ''
  )}`;
}

/* =========================================================
   ICON
========================================================= */

function Icon({ children, danger = false }) {
  return (
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
        danger
          ? 'bg-red-100 text-red-700'
          : 'bg-emerald-50 text-emerald-800'
      }`}
    >
      {children}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  subtitle,
  icon,
  danger = false,
  accent = false,
  onClick,
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
            {label}
          </p>

          <p
            className={`text-2xl md:text-3xl font-bold font-mono mt-2 ${
              accent
                ? 'text-emerald-800'
                : 'text-slate-900'
            }`}
          >
            {value}
          </p>
        </div>

        <Icon danger={danger}>
          {icon}
        </Icon>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-5 leading-5">
          {subtitle}
        </p>
      )}
    </>
  );

  if (onClick) {
    return (
      <Link
        to={onClick}
        className={`block bg-white rounded-2xl border border-slate-200 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
          danger
            ? 'border-b-4 border-b-red-300'
            : 'border-b-4 border-b-emerald-100'
        }`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        danger
          ? 'border-b-4 border-b-red-300'
          : 'border-b-4 border-b-emerald-100'
      }`}
    >
      {content}
    </div>
  );
}

/* =========================================================
   AUCTION ROW
========================================================= */

function AuctionRow({
  title,
  location,
  lot,
  price,
  bids,
  ends,
  image,
  auctionId,
}) {
  const content = (
    <>
      <div className="w-11 h-11 rounded-lg bg-white overflow-hidden flex-shrink-0">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
            IMG
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-900 truncate">
          {title}
        </p>

        <p className="text-[11px] text-slate-500 mt-1">
          📍 {location || 'Nepal'} &nbsp;•&nbsp; Lot #
          {lot || 'N/A'}
        </p>
      </div>

      <div className="hidden sm:block text-right">
        <p className="text-sm font-bold font-mono text-emerald-800">
          {formatNPR(price)}
        </p>

        <p className="text-[10px] text-slate-500">
          {bids || 0} bids
        </p>
      </div>

      <div className="hidden md:block bg-emerald-200 text-emerald-900 px-3 py-2 rounded-full text-[10px] font-semibold whitespace-nowrap">
        {ends || 'Live'}
      </div>
    </>
  );

  if (auctionId) {
    return (
      <Link
        to={`/auctions/${auctionId}`}
        className="bg-[#f3f4ff] rounded-xl p-3 flex items-center gap-3 hover:shadow-sm transition"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-[#f3f4ff] rounded-xl p-3 flex items-center gap-3">
      {content}
    </div>
  );
}

/* =========================================================
   MODERATION CARD
========================================================= */

function ModerationCard({
  title,
  count,
  description,
  buttonText,
  to,
  danger = false,
}) {
  return (
    <div
      className={`rounded-xl p-4 ${
        danger
          ? 'bg-red-50 border border-red-100'
          : 'bg-[#f0f2ff] border border-indigo-100'
      }`}
    >
      <div className="flex justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm text-slate-900">
            {title}
          </h3>

          <p
            className={`text-xl font-bold font-mono mt-1 ${
              danger
                ? 'text-red-700'
                : 'text-slate-900'
            }`}
          >
            {count}
          </p>
        </div>

        <span
          className={`text-[10px] font-semibold ${
            danger
              ? 'text-red-600'
              : 'text-slate-500'
          }`}
        >
          Actions
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-5 mt-3">
        {description}
      </p>

      <Link
        to={to}
        className={`inline-flex items-center gap-2 text-xs font-semibold mt-4 ${
          danger
            ? 'text-red-700'
            : 'text-emerald-800'
        }`}
      >
        {buttonText} →
      </Link>
    </div>
  );
}

/* =========================================================
   BIDDING CHART
========================================================= */

function BiddingChart() {
  return (
    <div className="bg-[#f0f2ff] rounded-xl p-4 mt-4">

      <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 mb-3">

        <span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-800 mr-2" />
          Kathmandu
        </span>

        <span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600 mr-2" />
          Pokhara
        </span>

        <span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500 mr-2" />
          Chitwan
        </span>

        <span className="text-emerald-700 font-medium ml-auto">
          ● Live Feed Active
        </span>

      </div>

      <div className="relative h-48 overflow-hidden">

        <div className="absolute inset-0 flex flex-col justify-between">
          <div className="border-t border-dashed border-slate-300" />
          <div className="border-t border-dashed border-slate-300" />
          <div className="border-t border-dashed border-slate-300" />
          <div className="border-t border-dashed border-slate-300" />
        </div>

        <svg
          viewBox="0 0 700 220"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <linearGradient
              id="areaGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#166534"
                stopOpacity="0.22"
              />

              <stop
                offset="100%"
                stopColor="#166534"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <path
            d="
              M0 170
              C70 140 90 125 150 105
              C220 82 260 90 320 120
              C390 155 420 105 470 55
              C520 5 550 20 580 65
              C620 112 650 70 700 65
              L700 220
              L0 220
              Z
            "
            fill="url(#areaGradient)"
          />

          <path
            d="
              M0 170
              C70 140 90 125 150 105
              C220 82 260 90 320 120
              C390 155 420 105 470 55
              C520 5 550 20 580 65
              C620 112 650 70 700 65
            "
            fill="none"
            stroke="#14532d"
            strokeWidth="4"
          />

        </svg>

        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-500">
          <span>12:00 NPT</span>
          <span>12:45 NPT</span>
          <span>13:30 NPT</span>
          <span>14:15 NPT</span>
          <span>Now</span>
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard() {

  const [stats, setStats] = useState({});
  const [auctions, setAuctions] = useState([]);

  const [currentTime, setCurrentTime] =
    useState(new Date());

  const [showCalendar, setShowCalendar] =
    useState(false);

  /* =====================================================
     LIVE CLOCK
  ===================================================== */

  useEffect(() => {

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);

  }, []);

  const nptTime =
    currentTime.toLocaleTimeString(
      'en-GB',
      {
        timeZone: 'Asia/Kathmandu',
        hour12: false,
      }
    );

  const nptDate =
    currentTime.toLocaleDateString(
      'en-NP',
      {
        timeZone: 'Asia/Kathmandu',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }
    );

  /* =====================================================
     LOAD DATA
  ===================================================== */

  useEffect(() => {

    Promise.all([
      getStats(),
      getAuctions(),
    ])

      .then(
        ([
          statsResponse,
          auctionsResponse,
        ]) => {

          setStats(
            statsResponse.data
          );

          const auctionData =
            auctionsResponse?.data?.data ||
            auctionsResponse?.data ||
            [];

          setAuctions(
            Array.isArray(
              auctionData
            )
              ? auctionData
              : []
          );

        }
      )

      .catch((error) => {

        console.error(
          'Failed to load admin dashboard:',
          error
        );

      })

  }, []);

  /* =====================================================
     ACTIVE AUCTIONS
  ===================================================== */

  const activeAuctions = useMemo(() => {

    return auctions.filter(
      (auction) =>
        auction?.status === 'active'
    );

  }, [auctions]);

  const topAuctions = useMemo(() => {

    return [...activeAuctions]
      .sort(
        (a, b) =>
          getAuctionPrice(b) -
          getAuctionPrice(a)
      )
      .slice(0, 3);

  }, [activeAuctions]);

  /* =====================================================
     STAT VALUES
  ===================================================== */

  const totalUsers =
    stats.total_users || 0;

  const sellers =
    stats.total_sellers || 0;

  const pendingProducts =
    stats.pending_products || 0;

  const approvedProducts =
    stats.approved_products || 0;

  const activeAuctionCount =
    stats.active_auctions ||
    activeAuctions.length ||
    0;

  const totalBids =
    stats.total_bids || 0;

  const pendingKyc =
    stats.pending_kyc || 0;

  const escrowFunds =
    stats.escrow_locked ||
    stats.escrow_funds ||
    0;

  const grossAuctionValue =
    stats.gross_auction_value ||
    stats.total_auction_value ||
    0;

  const bidsToday =
    stats.bids_today || 0;

  const moderationActions =
    stats.moderation_actions ||
    pendingProducts +
      pendingKyc;

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#f8f7ff]">

      {/* =================================================
          MAIN NILAAM NAVBAR
      ================================================= */}

      <Navbar />

      {/* =================================================
          ADMIN AREA
      ================================================= */}

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5">

        <div className="flex flex-col lg:flex-row gap-5">

          {/* =================================================
              ADMIN SIDEBAR
          ================================================= */}

          <aside className="w-full lg:w-[250px] shrink-0">

            <AdminSidebar />

          </aside>

          {/* =================================================
              DASHBOARD CONTENT
          ================================================= */}

          <main className="flex-1 min-w-0">

            {/* TOP HEADER */}

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">

              <div>

                <div className="flex items-center gap-2 text-xs mb-2">

                  <span className="text-emerald-700 font-semibold uppercase tracking-wide">
                    Live Telemetry & Node Sync
                  </span>

                  <span className="text-slate-300">
                    •
                  </span>

                  <span className="text-slate-500 font-mono">
                    Cluster NPT-01
                  </span>

                  <span className="w-2 h-2 bg-emerald-600 rounded-full" />

                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">

                  Operations & Platform
                  <br />

                  Overview

                </h1>

              </div>

              <div className="flex flex-wrap gap-3">

                {/* NPT CLOCK */}

                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">

                  <p className="text-[10px] uppercase text-slate-400">
                    Kathmandu Time (NPT)
                  </p>

                  <p className="font-mono font-semibold text-sm">
                    {nptTime} +05:45
                  </p>

                </div>

                {/* DEPLOYMENT */}

                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">

                  <p className="text-[10px] uppercase text-slate-400">
                    Deployment
                  </p>

                  <p className="text-sm font-mono text-emerald-800">
                    ● Live Production
                  </p>

                </div>

                {/* CALENDAR */}

                <div className="relative">

                  <button
                    type="button"
                    onClick={() =>
                      setShowCalendar(
                        !showCalendar
                      )
                    }
                    className="bg-emerald-900 text-white px-5 py-3 rounded-xl text-sm font-semibold"
                  >
                    📅 Calendar
                  </button>

                  {showCalendar && (

                    <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-4 w-64">

                      <p className="text-[10px] uppercase text-slate-400">
                        Current Nepal Date
                      </p>

                      <p className="font-semibold text-slate-900 mt-1">
                        {nptDate}
                      </p>

                      <div className="border-t border-slate-100 mt-3 pt-3">

                        <p className="text-xs text-slate-500">
                          Nepal Standard Time
                        </p>

                        <p className="font-mono text-sm text-emerald-800 mt-1">
                          UTC +05:45
                        </p>

                      </div>

                    </div>

                  )}

                </div>

              </div>

            </div>

            {/* =================================================
                KPI CARDS
            ================================================= */}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

              <StatCard
                label="Registered Users"
                value={formatNumber(
                  totalUsers
                )}
                subtitle="Citizen KYC verified users"
                icon="♙"
              />

              <StatCard
                label="Active Sellers"
                value={formatNumber(
                  sellers
                )}
                subtitle="Verified marketplace sellers"
                icon="▣"
              />

              <StatCard
                label="Pending Submissions"
                value={formatNumber(
                  pendingProducts
                )}
                subtitle="Listings waiting for review"
                icon="▤"
                danger
                onClick="/admin/listings"
              />

              <StatCard
                label="Approved Catalog"
                value={formatNumber(
                  approvedProducts
                )}
                subtitle="Ready or live listings"
                icon="▱"
              />

              <StatCard
                label="Auctions Live"
                value={formatNumber(
                  activeAuctionCount
                )}
                subtitle={
                  grossAuctionValue
                    ? `Gross: ${formatNPR(
                        grossAuctionValue
                      )}`
                    : 'Active digital auction rooms'
                }
                icon="⚑"
                accent
              />

              <StatCard
                label="Bids Placed Today"
                value={formatNumber(
                  bidsToday ||
                    totalBids
                )}
                subtitle={
                  bidsToday
                    ? 'Real-time bidding activity'
                    : `${formatNumber(
                        totalBids
                      )} total bids recorded`
                }
                icon="↗"
              />

              <StatCard
                label="Pending KYC Review"
                value={formatNumber(
                  pendingKyc
                )}
                subtitle="Identity verification queue"
                icon="▣"
                danger
                onClick="/admin/users"
              />

              <StatCard
                label="Escrow Locked Funds"
                value={formatNPR(
                  escrowFunds
                )}
                subtitle="Protected marketplace funds"
                icon="▢"
                accent
              />

            </div>

            {/* =================================================
                ANALYTICS
            ================================================= */}

            <div className="grid lg:grid-cols-[1.75fr_0.75fr] gap-5 mt-6">

              {/* LEFT */}

              <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                  <div>

                    <div className="flex items-center gap-2">

                      <span className="text-emerald-700">
                        ↗
                      </span>

                      <h2 className="font-bold text-lg">
                        Real-Time Bidding Velocity & Hub Distribution
                      </h2>

                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Live marketplace activity across Nepal's major hubs.
                    </p>

                  </div>

                  <div className="flex bg-[#f0f2ff] rounded-lg p-1 text-xs">

                    <button className="bg-white shadow-sm px-3 py-2 rounded-md font-semibold">
                      Realtime
                    </button>

                    <button className="px-3 py-2">
                      24h
                    </button>

                    <button className="px-3 py-2">
                      7 Days
                    </button>

                  </div>

                </div>

                <BiddingChart />

                {/* TOP AUCTIONS */}

                <div className="flex justify-between items-center mt-7 mb-3">

                  <h3 className="text-xs font-bold uppercase tracking-wide">
                    Top Active High-Stake Lots
                  </h3>

                  <span className="text-xs text-emerald-700 font-mono">
                    Automatic Price Sync
                  </span>

                </div>

                <div className="space-y-3">

                  {topAuctions.length > 0 ? (

                    topAuctions.map(
                      (
                        auction,
                        index
                      ) => (

                        <AuctionRow
                          key={
                            auction.id ||
                            index
                          }
                          title={getAuctionTitle(
                            auction
                          )}
                          location={getAuctionLocation(
                            auction
                          )}
                          lot={
                            auction.id ||
                            'LIVE'
                          }
                          price={getAuctionPrice(
                            auction
                          )}
                          bids={
                            auction.bids
                              ?.length ||
                            auction.bid_count ||
                            0
                          }
                          ends={
                            auction.end_time
                              ? new Date(
                                  auction.end_time
                                ).toLocaleString(
                                  'en-NP',
                                  {
                                    timeZone:
                                      'Asia/Kathmandu',
                                    dateStyle:
                                      'short',
                                    timeStyle:
                                      'short',
                                  }
                                )
                              : 'Live'
                          }
                          image={getAuctionImage(
                            auction
                          )}
                          auctionId={
                            auction.id
                          }
                        />

                      )
                    )

                  ) : (

                    <div className="bg-[#f3f4ff] rounded-xl p-5 text-center">

                      <p className="text-sm font-semibold text-slate-700">
                        No active auctions
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Active seller auctions will appear here.
                      </p>

                    </div>

                  )}

                </div>

              </section>

              {/* =================================================
                  MODERATION
              ================================================= */}

              <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

                <div className="flex justify-between items-start">

                  <div>

                    <div className="flex items-center gap-2">

                      <span className="text-red-700">
                        ⚠
                      </span>

                      <h2 className="font-bold text-lg">
                        Urgent Moderation
                      </h2>

                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      Time-sensitive approvals requiring manual review.
                    </p>

                  </div>

                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] font-bold">
                    {formatNumber(
                      moderationActions
                    )}{' '}
                    Actions
                  </span>

                </div>

                <div className="space-y-3 mt-5">

                  {/* PENDING SUBMISSIONS */}

                  <ModerationCard
                    title="High-Value Lots Waiting"
                    count={
                      pendingProducts
                    }
                    description="Listings requiring administrator review before publication."
                    buttonText="Review Lots"
                    to="/admin/listings"
                    danger
                  />

                  {/* KYC */}

                  <ModerationCard
                    title="Citizen KYC Queue"
                    count={pendingKyc}
                    description="Identity verification records waiting for administrator approval."
                    buttonText="Inspect KYC"
                    to="/admin/users"
                    danger={
                      pendingKyc > 0
                    }
                  />

                  <Link
                    to="/admin/listings"
                    className="w-full bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl py-3.5 flex items-center justify-between px-4 text-sm font-semibold transition"
                  >
                    <span>
                      Open Admin Listings Moderation
                    </span>

                    <span>→</span>
                  </Link>

                  <Link
                    to="/admin/users"
                    className="w-full bg-[#e9ebff] hover:bg-[#dfe2ff] text-slate-800 rounded-xl py-3.5 flex items-center justify-between px-4 text-sm font-semibold transition"
                  >
                    <span>
                      Open Admin KYC Review Queue
                    </span>

                    <span>→</span>
                  </Link>

                </div>

                {/* ESCROW */}

                <div className="border border-slate-200 rounded-xl p-4 mt-5">

                  <div className="flex justify-between items-center">

                    <p className="text-xs font-semibold">
                      Regional Escrow Clearing
                    </p>

                    <span className="text-xs text-emerald-700 font-semibold">
                      Healthy (100%)
                    </span>

                  </div>

                  <div className="h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">

                    <div className="w-full h-full bg-emerald-700 rounded-full" />

                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] text-slate-500">

                    <span>
                      Khalti:
                      <strong className="block text-slate-800">
                        Online
                      </strong>
                    </span>

                    <span>
                      eSewa:
                      <strong className="block text-slate-800">
                        Online
                      </strong>
                    </span>

                    <span>
                      API:
                      <strong className="block text-slate-800">
                        22ms
                      </strong>
                    </span>

                  </div>

                </div>

              </section>

            </div>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <section className="grid md:grid-cols-3 gap-4 mt-6">

              <Link
                to="/admin/listings"
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition group"
              >

                <div className="flex justify-between items-center">

                  <Icon>
                    ▤
                  </Icon>

                  <span className="text-emerald-700 group-hover:translate-x-1 transition">
                    →
                  </span>

                </div>

                <h3 className="font-bold mt-4">
                  Manage Listings
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Review, approve or reject marketplace submissions.
                </p>

              </Link>

              <Link
                to="/admin/users"
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition group"
              >

                <div className="flex justify-between items-center">

                  <Icon
                    danger={
                      pendingKyc > 0
                    }
                  >
                    ♙
                  </Icon>

                  <span className="text-emerald-700 group-hover:translate-x-1 transition">
                    →
                  </span>

                </div>

                <h3 className="font-bold mt-4">
                  KYC & Users
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Manage citizen verification and marketplace accounts.
                </p>

              </Link>

              <Link
                to="/admin/financials"
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition group"
              >

                <div className="flex justify-between items-center">

                  <Icon>
                    ₨
                  </Icon>

                  <span className="text-emerald-700 group-hover:translate-x-1 transition">
                    →
                  </span>

                </div>

                <h3 className="font-bold mt-4">
                  Financials & Escrow
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Monitor escrow funds, payments and settlement activity.
                </p>

              </Link>

            </section>

          </main>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;