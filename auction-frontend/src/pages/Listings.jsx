import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAuctions } from "../api/auctions";
import CountdownTimer from "../components/auction/CountdownTimer";
import FilterSidebar from "../components/layout/FilterSidebar";
import Breadcrumbs from "../components/layout/Breadcrumbs";
import {
  getAuctionPhase,
  getTimeValue,
  isRecentlyEnded,
} from "../utils/auctionPhase";
const STORAGE_URL = "http://127.0.0.1:8000/storage";
const CATEGORY_ICONS = {
  Electronics: "📱",
  Furniture: "🛋️",
  Vehicles: "🚗",
  Collectibles: "🏺",
};
function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || "📦";
}
function getImageUrl(image) {
  if (!image) {
    return null;
  }
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }
  return `${STORAGE_URL}/${String(image).replace(/^\/+/, "")}`;
}
function extractAuctions(response) {
  const payload = response?.data;
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  return [];
}
function formatNPR(value) {
  const amount = Number(value || 0);
  return `NPR ${amount.toLocaleString("en-NP")}`;
}
function getDisplayPrice(auction) {
  const product = auction?.product || {};
  const currentBid = Number(auction?.current_bid ?? auction?.currentBid ?? 0);
  const bids = Array.isArray(auction?.bids) ? auction.bids : [];
  const highestBid = bids.length
    ? Math.max(...bids.map((bid) => Number(bid?.amount || 0)))
    : 0;
  const startingPrice = Number(
    auction?.starting_price ??
      auction?.startingPrice ??
      product?.starting_price ??
      product?.startingPrice ??
      0,
  );
  return Math.max(currentBid, highestBid, startingPrice);
}
function hasCurrentBid(auction) {
  const currentBid = Number(auction?.current_bid ?? auction?.currentBid ?? 0);
  const bids = Array.isArray(auction?.bids) ? auction.bids : [];
  const highestBid = bids.length
    ? Math.max(...bids.map((bid) => Number(bid?.amount || 0)))
    : 0;
  return Math.max(currentBid, highestBid) > 0;
}
function getActualPhase(auction, now = Date.now()) {
  const endTime = getTimeValue(auction?.end_time);
  const startTime = getTimeValue(auction?.start_time);
  if (endTime !== null && endTime !== undefined && endTime <= now) {
    return "closed";
  }
  if (startTime !== null && startTime !== undefined && startTime > now) {
    return "pending";
  }
  const utilityPhase = getAuctionPhase(auction, now);
  if (
    utilityPhase === "closed" ||
    utilityPhase === "pending" ||
    utilityPhase === "active"
  ) {
    return utilityPhase;
  }
  return auction?.status || "closed";
}
function AuctionCard({ auction }) {
  const product = auction?.product || {};
  const phase = getActualPhase(auction);
  const displayPrice = getDisplayPrice(auction);
  const endTime = getTimeValue(auction?.end_time);
  const timeRemaining =
    endTime !== null && endTime !== undefined ? endTime - Date.now() : null;
  const isEndingSoon =
    phase === "active" &&
    timeRemaining !== null &&
    timeRemaining > 0 &&
    timeRemaining <= 3 * 60 * 60 * 1000;
  const imageUrl = getImageUrl(
    product?.image_url || product?.image || product?.thumbnail,
  );
  const title = product?.title || product?.name || "Untitled Auction";
  const city = product?.city || product?.location || "Nepal";
  const category = product?.category || "Other";
  const condition = product?.condition || "Used";
  const brand = product?.brand || "";
  const bidCount = Number(
    auction?.bid_count ?? auction?.bids_count ?? auction?.bids?.length ?? 0,
  );
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:border-cyan-500/50">
      {" "}
      <Link to={`/auctions/${auction.id}`} className="block">
        {" "}
        <div className="relative h-56 overflow-hidden bg-gray-100">
          {" "}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">
              {" "}
              {getCategoryIcon(category)}{" "}
            </div>
          )}{" "}
          <div className="absolute left-4 top-4">
            {" "}
            {phase === "active" && (
              <span className="inline-flex items-center gap-2 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow">
                {" "}
                <span className="h-2 w-2 rounded-full bg-white" /> LIVE{" "}
              </span>
            )}{" "}
            {phase === "pending" && (
              <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-black shadow">
                {" "}
                UPCOMING{" "}
              </span>
            )}{" "}
            {phase === "closed" && (
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-700 px-3 py-1 text-xs font-bold text-white shadow">
                {" "}
                <span className="h-2 w-2 rounded-full bg-red-500" /> ENDED{" "}
              </span>
            )}{" "}
          </div>{" "}
          {isEndingSoon && (
            <div className="absolute right-4 top-4">
              {" "}
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow">
                {" "}
                ENDING SOON{" "}
              </span>{" "}
            </div>
          )}{" "}
          {phase === "active" && auction?.end_time && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/75 px-4 py-3">
              {" "}
              <CountdownTimer endTime={auction.end_time} />{" "}
            </div>
          )}{" "}
          {phase === "closed" && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-4 py-3 text-center">
              {" "}
              <span className="text-sm font-semibold text-gray-300">
                {" "}
                Auction has ended{" "}
              </span>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </Link>{" "}
      <div className="p-5">
        {" "}
        <div className="mb-3 flex items-center justify-between gap-3">
          {" "}
          <span className="text-sm text-cyan-500">
            {" "}
            {getCategoryIcon(category)} {category}{" "}
          </span>{" "}
          <span className="text-xs text-gray-500"> 📍 {city} </span>{" "}
        </div>{" "}
        <Link to={`/auctions/${auction.id}`} className="block">
          {" "}
          <h3 className="line-clamp-2 min-h-[56px] text-lg font-bold text-gray-900 transition hover:text-cyan-500">
            {" "}
            {title}{" "}
          </h3>{" "}
        </Link>{" "}
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          {" "}
          {condition && (
            <p>
              {" "}
              <span className="text-gray-500"> Condition: </span>{" "}
              {condition}{" "}
            </p>
          )}{" "}
          {brand && (
            <p>
              {" "}
              <span className="text-gray-500"> Brand: </span> {brand}{" "}
            </p>
          )}{" "}
        </div>{" "}
        <div className="mt-5 border-t border-gray-200 pt-4">
          {" "}
          <div className="flex items-end justify-between">
            {" "}
            <div>
              {" "}
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {" "}
                {phase === "closed"
                  ? "Final Bid"
                  : hasCurrentBid(auction)
                    ? "Current Bid"
                    : "Starting Bid"}{" "}
              </p>{" "}
              <p className="mt-1 text-xl font-bold text-gray-900">
                {" "}
                {formatNPR(displayPrice)}{" "}
              </p>{" "}
            </div>{" "}
            <div className="text-right">
              {" "}
              <p className="text-xs text-gray-500"> Bids </p>{" "}
              <p className="font-semibold text-gray-700"> {bidCount} </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="mt-5">
          {" "}
          {phase === "active" && (
            <Link
              to={`/auctions/${auction.id}`}
              className="block w-full rounded-xl bg-slate-900 px-4 py-3 text-center font-bold text-white transition hover:bg-slate-800"
            >
              {" "}
              Place Bid{" "}
            </Link>
          )}{" "}
          {phase === "pending" && (
            <Link
              to={`/auctions/${auction.id}`}
              className="block w-full rounded-xl border border-yellow-500/50 bg-yellow-500/10 px-4 py-3 text-center font-bold text-yellow-600 transition hover:bg-yellow-500/20"
            >
              {" "}
              View Upcoming Auction{" "}
            </Link>
          )}{" "}
          {phase === "closed" && (
            <Link
              to={`/auctions/${auction.id}`}
              className="block w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-center font-bold text-gray-600 transition hover:bg-gray-200"
            >
              {" "}
              View Auction{" "}
            </Link>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </article>
  );
}
export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState("ending_soon");
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    let mounted = true;
    async function loadAuctions() {
      const requestStarted = Date.now();
      try {
        const response = await getAuctions();
        if (!mounted) return;
        const list = extractAuctions(response);
        setAuctions(list);
      } catch (error) {
        console.error("Failed to load auctions:", error);
      } finally {
        if (mounted) {
          /* * Keep loading screen very short. * This prevents a sudden flash while * still avoiding an unnecessary delay. */ const elapsed =
            Date.now() - requestStarted;
          const minimumDisplayTime = 250;
          const remaining = Math.max(0, minimumDisplayTime - elapsed);
          setTimeout(() => {
            if (mounted) {
              setLoading(false);
            }
          }, remaining);
        }
      }
    }
    loadAuctions();
    const interval = setInterval(loadAuctions, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);
  useEffect(() => {
    setCity(searchParams.get("city") || "");
    setCategory(searchParams.get("category") || "");
  }, [searchParams]);
  const normalizedAuctions = useMemo(() => {
    return auctions.map((auction) => ({
      ...auction,
      status: getActualPhase(auction, now),
    }));
  }, [auctions, now]);
  const browseAuctions = useMemo(() => {
    return normalizedAuctions.filter((auction) => {
      const phase = auction.status;
      if (phase === "active") {
        return true;
      }
      if (phase === "closed" && isRecentlyEnded(auction, now, 48)) {
        return true;
      }
      return false;
    });
  }, [normalizedAuctions, now]);
  const activeAuctionsForSidebar = useMemo(() => {
    return normalizedAuctions.filter((auction) => auction.status === "active");
  }, [normalizedAuctions]);
  useEffect(() => {
    if (activeAuctionsForSidebar.length === 0) {
      return;
    }
    const highestActivePrice = Math.max(
      ...activeAuctionsForSidebar.map((auction) => getDisplayPrice(auction)),
      500000,
    );
    setMaxPrice((current) => {
      if (current === 500000) {
        return highestActivePrice;
      }
      return current;
    });
  }, [activeAuctionsForSidebar]);
  const cities = useMemo(() => {
    return [
      ...new Set(
        activeAuctionsForSidebar
          .map(
            (auction) => auction?.product?.city || auction?.product?.location,
          )
          .filter(Boolean),
      ),
    ].sort();
  }, [activeAuctionsForSidebar]);
  const categories = useMemo(() => {
    return [
      ...new Set(
        activeAuctionsForSidebar
          .map((auction) => auction?.product?.category)
          .filter(Boolean),
      ),
    ].sort();
  }, [activeAuctionsForSidebar]);
  const filteredAuctions = useMemo(() => {
    const result = browseAuctions.filter((auction) => {
      const product = auction?.product || {};
      const price = getDisplayPrice(auction);
      const auctionCity = product?.city || product?.location || "";
      const auctionCategory = product?.category || "";
      const matchesPrice = price <= Number(maxPrice);
      const matchesCity =
        !city || auctionCity.toLowerCase() === city.toLowerCase();
      const matchesCategory =
        !category || auctionCategory.toLowerCase() === category.toLowerCase();
      return matchesPrice && matchesCity && matchesCategory;
    });
    return result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return Number(b.id || 0) - Number(a.id || 0);
        case "price_high":
          return getDisplayPrice(b) - getDisplayPrice(a);
        case "price_low":
          return getDisplayPrice(a) - getDisplayPrice(b);
        case "starting_soon":
          return (
            (getTimeValue(a.start_time) || Infinity) -
            (getTimeValue(b.start_time) || Infinity)
          );
        case "ending_soon":
        default:
          return (
            (getTimeValue(a.end_time) || Infinity) -
            (getTimeValue(b.end_time) || Infinity)
          );
      }
    });
  }, [browseAuctions, city, category, maxPrice, sortBy]);
  const activeAuctions = useMemo(
    () => filteredAuctions.filter((auction) => auction.status === "active"),
    [filteredAuctions],
  );
  const missedAuctions = useMemo(() => {
    return filteredAuctions
      .filter((auction) => {
        if (auction.status !== "closed") {
          return false;
        }
        return isRecentlyEnded(auction, now, 48);
      })
      .sort((a, b) => {
        const aEnd = getTimeValue(a.end_time) || 0;
        const bEnd = getTimeValue(b.end_time) || 0;
        return bEnd - aEnd;
      });
  }, [filteredAuctions, now]);
  function updateFilterParam(key, value) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params, { replace: true });
  }
  function handleCityChange(value) {
    const nextValue =
      typeof value === "string" ? value : value?.target?.value || "";
    setCity(nextValue);
    updateFilterParam("city", nextValue);
  }
  function handleCategoryChange(value) {
    const nextValue =
      typeof value === "string" ? value : value?.target?.value || "";
    setCategory(nextValue);
    updateFilterParam("category", nextValue);
  }
  function resetFilters() {
    setMaxPrice(500000);
    setCity("");
    setCategory("");
    const params = new URLSearchParams(searchParams);
    params.delete("city");
    params.delete("category");
    setSearchParams(params, { replace: true });
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
        {" "}
        <div className="mx-auto max-w-7xl">
          {" "}
          <Breadcrumbs items={[{ label: "Browse Auctions" }]} />{" "}
          <div className="flex min-h-[45vh] items-center justify-center">
            {" "}
            <div className="text-center">
              {" "}
              {/* NILAAM Loading Icon */}{" "}
              <div className="relative mx-auto mb-5 h-14 w-14">
                {" "}
                <div className="absolute inset-0 rounded-full border-4 border-gray-200" />{" "}
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-cyan-500" />{" "}
              </div>{" "}
              <p className="text-lg font-semibold text-gray-800">
                {" "}
                Loading auctions...{" "}
              </p>{" "}
              <p className="mt-1 text-sm text-gray-500">
                {" "}
                Finding active auctions for you{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
      {" "}
      <div className="mx-auto max-w-7xl">
        {" "}
        <Breadcrumbs items={[{ label: "Browse Auctions" }]} />{" "}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          {" "}
          <div>
            {" "}
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-cyan-500">
              {" "}
              NILAAM Marketplace{" "}
            </p>{" "}
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
              {" "}
              Browse Auctions{" "}
            </h1>{" "}
            <p className="mt-2 max-w-2xl text-gray-700">
              {" "}
              Discover active auctions and recently ended auctions from verified
              sellers.{" "}
            </p>{" "}
          </div>{" "}
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
            {" "}
            <span className="text-sm text-gray-500"> Live Auctions </span>{" "}
            <p className="text-2xl font-bold text-green-600">
              {" "}
              {activeAuctions.length}{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {" "}
          <aside>
            {" "}
            <FilterSidebar
              auctions={activeAuctionsForSidebar}
              cities={cities}
              categories={categories}
              city={city}
              setCity={handleCityChange}
              category={category}
              setCategory={handleCategoryChange}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              onReset={resetFilters}
            />{" "}
          </aside>{" "}
          <main>
            {" "}
            <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              {" "}
              <div>
                {" "}
                <p className="font-semibold text-gray-900">
                  {" "}
                  {activeAuctions.length} Active Auctions{" "}
                </p>{" "}
                {missedAuctions.length > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    {" "}
                    {missedAuctions.length} recently ended{" "}
                  </p>
                )}{" "}
              </div>{" "}
              <div className="flex items-center gap-3">
                {" "}
                <label htmlFor="sort" className="text-sm text-gray-700">
                  {" "}
                  Sort:{" "}
                </label>{" "}
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-cyan-400"
                >
                  {" "}
                  <option value="ending_soon"> Ending Soon </option>{" "}
                  <option value="newest"> Newest </option>{" "}
                  <option value="price_high"> Price: High to Low </option>{" "}
                  <option value="price_low"> Price: Low to High </option>{" "}
                  <option value="starting_soon"> Starting Soon </option>{" "}
                </select>{" "}
              </div>{" "}
            </div>{" "}
            <section>
              {" "}
              <div className="mb-5 flex items-center justify-between">
                {" "}
                <div>
                  {" "}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {" "}
                    Active Auctions{" "}
                  </h2>{" "}
                  <p className="mt-1 text-sm text-gray-600">
                    {" "}
                    Auctions currently accepting bids{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              {activeAuctions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center text-gray-600">
                  {" "}
                  <div className="mb-4 text-5xl"> ⌕ </div>{" "}
                  <h3 className="text-xl font-bold text-gray-500">
                    {" "}
                    No active auctions found{" "}
                  </h3>{" "}
                  <p className="mx-auto mt-2 max-w-md text-gray-500">
                    {" "}
                    Try changing your location, category, or price filters.{" "}
                  </p>{" "}
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-5 rounded-xl bg-cyan-500 px-5 py-2.5 font-semibold text-gray-900 transition hover:bg-cyan-400"
                  >
                    {" "}
                    Clear Filters{" "}
                  </button>{" "}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {" "}
                  {activeAuctions.map((auction) => (
                    <AuctionCard key={auction.id} auction={auction} />
                  ))}{" "}
                </div>
              )}{" "}
            </section>{" "}
            {missedAuctions.length > 0 && (
              <section className="mt-14">
                {" "}
                <div className="mb-5">
                  {" "}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {" "}
                    Auctions You Missed{" "}
                  </h2>{" "}
                  <p className="mt-1 text-sm text-gray-600">
                    {" "}
                    These auctions ended within the last 48 hours.{" "}
                  </p>{" "}
                </div>{" "}
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {" "}
                  {missedAuctions.map((auction) => (
                    <AuctionCard
                      key={`missed-${auction.id}`}
                      auction={auction}
                    />
                  ))}{" "}
                </div>{" "}
              </section>
            )}{" "}
            <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
              {" "}
              Showing {activeAuctions.length} active auction{" "}
              {activeAuctions.length !== 1 ? "s" : ""}{" "}
              {missedAuctions.length > 0 &&
                ` and ${missedAuctions.length} recently ended auction${missedAuctions.length !== 1 ? "s" : ""}`}{" "}
              .{" "}
            </div>{" "}
          </main>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
