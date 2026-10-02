import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProducts } from "../api/products";
import { AuthContext } from "../context/AuthContext";
import Breadcrumbs from "../components/layout/Breadcrumbs";
import { getAuctionPhase } from "../utils/auctionPhase";
const STORAGE_URL = "http://127.0.0.1:8000/storage";
/* -------------------------------------------------- HELPERS -------------------------------------------------- */ function getProductImage(
  product,
) {
  const image = product?.image_url || product?.image || product?.thumbnail;
  if (!image) {
    return null;
  }
  const imageString = String(image).trim();
  if (
    imageString.startsWith("http://") ||
    imageString.startsWith("https://") ||
    imageString.startsWith("data:")
  ) {
    return imageString;
  }
  return `${STORAGE_URL}/${imageString.replace(/^\/+/, "")}`;
}
function formatNPR(value) {
  const amount = Number(value || 0);
  return `NPR ${amount.toLocaleString("en-NP")}`;
}
function getDisplayPrice(product) {
  const auction = product?.auction || product?.active_auction || null;
  const currentBid = Number(auction?.current_bid ?? auction?.currentBid ?? 0);
  const finalBid = Number(auction?.final_bid ?? auction?.finalBid ?? 0);
  const startingPrice = Number(
    auction?.starting_price ??
      auction?.startingPrice ??
      product?.starting_price ??
      product?.startingPrice ??
      0,
  );
  const bids = Array.isArray(auction?.bids) ? auction.bids : [];
  const highestBid = bids.length
    ? Math.max(...bids.map((bid) => Number(bid?.amount || 0)))
    : 0;
  return Math.max(currentBid, highestBid, finalBid, startingPrice);
}
function formatDate(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString("en-NP", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
/* -------------------------------------------------- STATUS BADGE -------------------------------------------------- */ function StatusBadge({
  status,
}) {
  const normalized = String(status || "").toLowerCase();
  const styles = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const style =
    styles[normalized] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${style}`}
    >
      {" "}
      {status || "Unknown"}{" "}
    </span>
  );
}
/* -------------------------------------------------- LISTING CARD -------------------------------------------------- */ function ListingCard({
  product,
}) {
  const auction = product?.auction || product?.active_auction || null;
  const auctionPhase = auction ? getAuctionPhase(auction) : null;
  const image = getProductImage(product);
  const title = product?.title || product?.name || "Untitled Listing";
  const productStatus = String(product?.status || "pending").toLowerCase();
  const displayPrice = getDisplayPrice(product);
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      {" "}
      {/* IMAGE */}{" "}
      <div className="relative h-52 bg-gray-100">
        {" "}
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-gray-400">
            {" "}
            📦{" "}
          </div>
        )}{" "}
        <div className="absolute left-3 top-3">
          {" "}
          <StatusBadge status={productStatus} />{" "}
        </div>{" "}
        {auctionPhase === "active" && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
            {" "}
            <span className="h-2 w-2 rounded-full bg-green-500" /> LIVE{" "}
          </div>
        )}{" "}
        {auctionPhase === "closed" && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
            {" "}
            <span className="h-2 w-2 rounded-full bg-red-500" /> ENDED{" "}
          </div>
        )}{" "}
        {auctionPhase === "pending" && (
          <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
            {" "}
            UPCOMING{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* CONTENT */}{" "}
      <div className="p-5">
        {" "}
        <h3 className="line-clamp-2 text-lg font-bold text-gray-900">
          {" "}
          {title}{" "}
        </h3>{" "}
        <div className="mt-3 space-y-1.5 text-sm text-gray-500">
          {" "}
          {product?.category && (
            <p>
              {" "}
              Category:{" "}
              <span className="font-medium text-gray-700">
                {" "}
                {product.category}{" "}
              </span>{" "}
            </p>
          )}{" "}
          {(product?.city || product?.location) && (
            <p>
              {" "}
              Location:{" "}
              <span className="font-medium text-gray-700">
                {" "}
                {product.city || product.location}{" "}
              </span>{" "}
            </p>
          )}{" "}
        </div>{" "}
        {/* PRICE */}{" "}
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          {" "}
          <div className="flex items-center justify-between gap-3">
            {" "}
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {" "}
              {auctionPhase === "closed"
                ? "Final Price"
                : auctionPhase === "active"
                  ? "Current Bid"
                  : "Starting Price"}{" "}
            </span>{" "}
            {auction && <StatusBadge status={auctionPhase} />}{" "}
          </div>{" "}
          <p className="mt-2 text-xl font-bold text-gray-900">
            {" "}
            {formatNPR(displayPrice)}{" "}
          </p>{" "}
          {auction?.end_time && (
            <p className="mt-1 text-xs text-gray-500">
              {" "}
              Ends: {formatDate(auction.end_time)}{" "}
            </p>
          )}{" "}
        </div>{" "}
        {/* ACTION */}{" "}
        <div className="mt-5">
          {" "}
          {/* APPROVED PRODUCT WITHOUT AUCTION */}{" "}
          {productStatus === "approved" && !auction && (
            <Link
              to={`/start-auction/${product.id}`}
              className="block w-full rounded-xl bg-emerald-600 px-4 py-3 text-center font-bold text-white transition hover:bg-emerald-500"
            >
              {" "}
              Start Auction{" "}
            </Link>
          )}{" "}
          {/* LIVE AUCTION */}{" "}
          {auctionPhase === "active" && (
            <Link
              to={`/auctions/${auction.id}`}
              className="block w-full rounded-xl bg-emerald-600 px-4 py-3 text-center font-bold text-white transition hover:bg-emerald-500"
            >
              {" "}
              Manage Live Bids{" "}
            </Link>
          )}{" "}
          {/* CLOSED AUCTION */}{" "}
          {auctionPhase === "closed" && (
            <Link
              to={`/auctions/${auction.id}`}
              className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              {" "}
              View Auction{" "}
            </Link>
          )}{" "}
          {/* UPCOMING AUCTION */}{" "}
          {auctionPhase === "pending" && (
            <Link
              to={`/auctions/${auction.id}`}
              className="block w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              {" "}
              View Upcoming Auction{" "}
            </Link>
          )}{" "}
          {/* PENDING PRODUCT */}{" "}
          {productStatus === "pending" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-700">
              {" "}
              Waiting for admin approval{" "}
            </div>
          )}{" "}
          {/* REJECTED PRODUCT */}{" "}
          {productStatus === "rejected" && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
              {" "}
              Listing rejected{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
/* -------------------------------------------------- DASHBOARD -------------------------------------------------- */ export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [now, setNow] = useState(Date.now());
  /* -------------------------------------------------- ROLE -------------------------------------------------- */ const normalizedRole =
    String(user?.role || user?.user_type || user?.account_type || "")
      .toLowerCase()
      .replace(/[\s_-]/g, "");
  const canSell =
    normalizedRole === "seller" ||
    normalizedRole === "buyerseller" ||
    normalizedRole === "buyerandseller" ||
    normalizedRole === "both";
  /* -------------------------------------------------- UPDATE TIME -------------------------------------------------- */ useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  /* -------------------------------------------------- LOAD USER'S PRODUCTS -------------------------------------------------- */ useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      try {
        const response = await getMyProducts();
        if (!mounted) {
          return;
        }
        const data = response?.data?.data ?? response?.data ?? [];
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load seller products:", error);
        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    /* * buyer_seller accounts are sellers too, * therefore load their own products. */ if (
      canSell
    ) {
      loadProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [canSell]);
  /* -------------------------------------------------- LIVE AUCTIONS -------------------------------------------------- */ const liveAuctions =
    useMemo(() => {
      return products.filter((product) => {
        const auction = product?.auction || product?.active_auction;
        if (!auction) {
          return false;
        }
        return getAuctionPhase(auction, now) === "active";
      });
    }, [products, now]);
  /* -------------------------------------------------- COMPLETED AUCTIONS -------------------------------------------------- */ const completedAuctions =
    useMemo(() => {
      return products.filter((product) => {
        const auction = product?.auction || product?.active_auction;
        if (!auction) {
          return false;
        }
        return getAuctionPhase(auction, now) === "closed";
      });
    }, [products, now]);
  /* -------------------------------------------------- APPROVED / READY -------------------------------------------------- */ const approvedListings =
    useMemo(() => {
      return products.filter(
        (product) =>
          String(product?.status || "").toLowerCase() === "approved" &&
          !product?.auction &&
          !product?.active_auction,
      );
    }, [products]);
  /* -------------------------------------------------- ALL LISTINGS -------------------------------------------------- */ const allListings =
    useMemo(() => {
      return products;
    }, [products]);
  /* -------------------------------------------------- VALUES -------------------------------------------------- */ const liveValue =
    useMemo(() => {
      return liveAuctions.reduce(
        (total, product) => total + getDisplayPrice(product),
        0,
      );
    }, [liveAuctions]);
  const completedValue = useMemo(() => {
    return completedAuctions.reduce(
      (total, product) => total + getDisplayPrice(product),
      0,
    );
  }, [completedAuctions]);
  /* -------------------------------------------------- DISPLAYED PRODUCTS -------------------------------------------------- */ const displayedProducts =
    activeTab === "live"
      ? liveAuctions
      : activeTab === "completed"
        ? completedAuctions
        : activeTab === "approved"
          ? approvedListings
          : allListings;
  /* -------------------------------------------------- LOADING -------------------------------------------------- */ if (
    loading
  ) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10 text-gray-900">
        {" "}
        <div className="mx-auto max-w-7xl">
          {" "}
          <Breadcrumbs items={[{ label: "Seller Dashboard" }]} />{" "}
          <div className="flex min-h-[50vh] items-center justify-center">
            {" "}
            <div className="text-center">
              {" "}
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />{" "}
              <p className="text-gray-500"> Loading dashboard... </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  }
  /* -------------------------------------------------- ACCESS CHECK -------------------------------------------------- */ if (
    !canSell
  ) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10 text-gray-900">
        {" "}
        <div className="mx-auto max-w-3xl">
          {" "}
          <Breadcrumbs items={[{ label: "Dashboard" }]} />{" "}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            {" "}
            <div className="mb-4 text-5xl"> 🔒 </div>{" "}
            <h1 className="text-2xl font-bold text-gray-900">
              {" "}
              Seller Dashboard{" "}
            </h1>{" "}
            <p className="mx-auto mt-3 max-w-lg text-gray-500">
              {" "}
              Your current account does not have seller access.{" "}
            </p>{" "}
            <Link
              to="/"
              className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-500"
            >
              {" "}
              Back to Nilaam{" "}
            </Link>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  }
  /* -------------------------------------------------- MAIN DASHBOARD -------------------------------------------------- */ return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
      {" "}
      <div className="mx-auto max-w-7xl">
        {" "}
        <Breadcrumbs
          items={[{ label: "Seller Dashboard" }]}
        /> {/* HEADER */}{" "}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          {" "}
          <div>
            {" "}
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-700">
              {" "}
              Seller Center{" "}
            </p>{" "}
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
              {" "}
              My Listings{" "}
            </h1>{" "}
            <p className="mt-2 text-gray-500">
              {" "}
              Manage your products, auctions, and seller activity.{" "}
            </p>{" "}
          </div>{" "}
          <Link
            to="/create-listing"
            className="rounded-xl bg-emerald-600 px-5 py-3 text-center font-bold text-white shadow-sm transition hover:bg-emerald-500"
          >
            {" "}
            + Create Listing{" "}
          </Link>{" "}
        </div>{" "}
        {/* SELLER INFO */}{" "}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          {" "}
          <div>
            {" "}
            <p className="text-sm font-medium text-gray-500">
              {" "}
              {normalizedRole === "buyerseller"
                ? "Buyer & Seller"
                : "Verified Seller"}{" "}
            </p>{" "}
            <h2 className="mt-1 text-lg font-bold text-gray-900">
              {" "}
              {user?.name || user?.full_name || "Seller"}{" "}
            </h2>{" "}
            <p className="mt-1 text-xs text-gray-500">
              {" "}
              ACCOUNT ID # {user?.id || "—"}{" "}
            </p>{" "}
          </div>{" "}
          <div className="flex flex-wrap gap-3 text-xs">
            {" "}
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">
              {" "}
              ✓ KYC Verified{" "}
            </span>{" "}
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 font-medium text-gray-700">
              {" "}
              🔒 Live Escrow Protection{" "}
            </span>{" "}
            {normalizedRole === "buyerseller" && (
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 font-medium text-cyan-700">
                {" "}
                Buyer + Seller Access{" "}
              </span>
            )}{" "}
          </div>{" "}
        </div>{" "}
        {/* STATS */}{" "}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {" "}
          <StatCard
            title="Total Listings"
            value={products.length}
            subtitle="All your products"
          />{" "}
          <StatCard
            title="Live Auctions"
            value={liveAuctions.length}
            subtitle="Currently running"
          />{" "}
          <StatCard
            title="Completed"
            value={completedAuctions.length}
            subtitle="Finished auctions"
          />{" "}
          <StatCard
            title="Live Value"
            value={formatNPR(liveValue)}
            subtitle="Current auction value"
          />{" "}
        </div>{" "}
        {/* TABS */}{" "}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          {" "}
          <DashboardTab
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          >
            {" "}
            All Listings{" "}
          </DashboardTab>{" "}
          <DashboardTab
            active={activeTab === "live"}
            onClick={() => setActiveTab("live")}
          >
            {" "}
            Live Auctions{" "}
          </DashboardTab>{" "}
          <DashboardTab
            active={activeTab === "completed"}
            onClick={() => setActiveTab("completed")}
          >
            {" "}
            Completed{" "}
          </DashboardTab>{" "}
          <DashboardTab
            active={activeTab === "approved"}
            onClick={() => setActiveTab("approved")}
          >
            {" "}
            Ready to Auction{" "}
          </DashboardTab>{" "}
        </div>{" "}
        {/* LISTINGS */}{" "}
        {displayedProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-14 text-center shadow-sm">
            {" "}
            <div className="mb-4 text-5xl"> 📦 </div>{" "}
            <h2 className="text-xl font-bold text-gray-900">
              {" "}
              {activeTab === "live"
                ? "No live auctions"
                : activeTab === "completed"
                  ? "No completed auctions"
                  : activeTab === "approved"
                    ? "No approved listings ready for auction"
                    : "You have no listings yet"}{" "}
            </h2>{" "}
            <p className="mx-auto mt-2 max-w-lg text-gray-500">
              {" "}
              {activeTab === "live"
                ? "Start an auction from one of your approved listings to see it here."
                : activeTab === "completed"
                  ? "Your completed auctions will appear here."
                  : activeTab === "approved"
                    ? "Approved products that have not started an auction will appear here."
                    : "Create your first listing and it will appear here after submission."}{" "}
            </p>{" "}
            <Link
              to="/create-listing"
              className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-500"
            >
              {" "}
              + Create Listing{" "}
            </Link>{" "}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {" "}
            {displayedProducts.map((product) => (
              <ListingCard key={product.id} product={product} />
            ))}{" "}
          </div>
        )}{" "}
        {/* BENEFITS */}{" "}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {" "}
          <Benefit
            icon="🛡️"
            title="Verified Sellers"
            description="KYC verification helps create a trusted marketplace."
          />{" "}
          <Benefit
            icon="⚡"
            title="Live Bidding"
            description="Buyers can compete in real-time auctions."
          />{" "}
          <Benefit
            icon="🔒"
            title="Secure Transactions"
            description="Escrow-based transaction flow helps protect both parties."
          />{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
/* -------------------------------------------------- STAT CARD -------------------------------------------------- */ function StatCard({
  title,
  value,
  subtitle,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {" "}
      <p className="text-sm font-medium text-gray-500"> {title} </p>{" "}
      <p className="mt-2 break-words text-2xl font-bold text-gray-900">
        {" "}
        {value}{" "}
      </p>{" "}
      <p className="mt-1 text-xs text-gray-500"> {subtitle} </p>{" "}
    </div>
  );
}
/* -------------------------------------------------- DASHBOARD TAB -------------------------------------------------- */ function DashboardTab({
  children,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${active ? "bg-emerald-600 text-white shadow-sm" : "text-gray-500 hover:bg-white hover:text-gray-900"}`}
    >
      {" "}
      {children}{" "}
    </button>
  );
}
/* -------------------------------------------------- BENEFIT -------------------------------------------------- */ function Benefit({
  icon,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {" "}
      <div className="text-2xl"> {icon} </div>{" "}
      <h3 className="mt-3 font-bold text-gray-900"> {title} </h3>{" "}
      <p className="mt-2 text-sm leading-6 text-gray-500">
        {" "}
        {description}{" "}
      </p>{" "}
    </div>
  );
}
