import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import { getMyProducts } from "../../api/products";
const STORAGE_URL = "http://127.0.0.1:8000/storage";
function Icon({ name, className = "w-5 h-5" }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
  };
  switch (name) {
    case "key":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <circle cx="8" cy="15" r="4" /> <path d="M11 12l8-8" />{" "}
          <path d="M17 6l2 2" /> <path d="M15 8l2 2" />{" "}
        </svg>
      );
    case "gavel":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <path d="M14 5l5 5" /> <path d="M12 7l5 5" /> <path d="M4 20l8-8" />{" "}
          <path d="M7 4l5 5" /> <path d="M5 6l4-4 5 5-4 4z" />{" "}
          <path d="M15 14l4-4 3 3-4 4z" />{" "}
        </svg>
      );
    case "store":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <path d="M4 10v9h16v-9" /> <path d="M3 10l2-6h14l2 6" />{" "}
          <path d="M3 10c.8 1.3 2 2 3.5 2s2.7-.7 3.5-2c.8 1.3 2 2 3.5 2s2.7-.7 3.5-2c.8 1.3 2 2 3.5 2s2.7-.7 3.5-2" />{" "}
          <path d="M8 19v-4h8v4" />{" "}
        </svg>
      );
    case "id":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <rect x="3" y="4" width="18" height="16" rx="2" />{" "}
          <circle cx="8" cy="10" r="2" />{" "}
          <path d="M5.5 16c.8-1.5 4.2-1.5 5 0" /> <path d="M13 9h5" />{" "}
          <path d="M13 13h5" /> <path d="M13 17h3" />{" "}
        </svg>
      );
    case "help":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <circle cx="12" cy="12" r="9" />{" "}
          <path d="M9.5 9a2.7 2.7 0 115 1.5c0 1.8-2.5 2-2.5 3.5" />{" "}
          <path d="M12 17h.01" />{" "}
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <circle cx="12" cy="12" r="3" />{" "}
          <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V20h-2.6v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H6V11h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1L9 6.2l.1.1a1.7 1.7 0 001.9.3 1.7 1.7 0 001-1.5V5h2.6v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 00-.3 1.9 1.7 1.7 0 001.5 1h.1v2.6h-.1a1.7 1.7 0 00-1.5 1.4z" />{" "}
        </svg>
      );
    case "logout":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <path d="M10 5H5v14h5" /> <path d="M14 8l4 4-4 4" />{" "}
          <path d="M18 12H9" />{" "}
        </svg>
      );
    case "chevron":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <path d="M9 18l6-6-6-6" />{" "}
        </svg>
      );
    case "chevronDown":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <path d="M6 9l6 6 6-6" />{" "}
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <path d="M5 12l4 4L19 6" />{" "}
        </svg>
      );
    case "location":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1116 0z" />{" "}
          <circle cx="12" cy="10" r="2.5" />{" "}
        </svg>
      );
    default:
      return null;
  }
}
function ProfileMenu({ user }) {
  const { logout } = useContext(AuthContext);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  /* * ===================================================== * ROLE * ===================================================== */ const role =
    String(user?.role || "").toLowerCase();
  const isBuyer = role === "buyer";
  const isSeller = role === "seller";
  const isBuyerSeller = role === "buyer_seller";
  /* * ===================================================== * LIVE LISTINGS COUNT * ===================================================== */ const [
    activeListings,
    setActiveListings,
  ] = useState(0);
  /* * ===================================================== * KYC * ===================================================== */ const isVerified =
    String(user?.kyc_status || "").toLowerCase() === "verified";
  const showRealPhoto = isVerified && Boolean(user?.kyc_photo);
  /* * ===================================================== * USER INFORMATION * ===================================================== */ const userInitial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";
  const displayLocation = user?.location || user?.city || "Nepal";
  const activeBids = user?.active_bids ?? 0;
  const escrowWon = user?.escrow_won ?? user?.escrow_total ?? 0;
  const formatAmount = (value) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    if (typeof value === "number") {
      return `Rs. ${value.toLocaleString("en-NP")}`;
    }
    return String(value).startsWith("Rs.") ? String(value) : `Rs. ${value}`;
  };
  const kycStatus = user?.kyc_status || "not submitted";
  /* * ===================================================== * LOAD CURRENT LIVE LISTINGS * ===================================================== */ useEffect(() => {
    async function loadActiveListings() {
      if (role !== "seller" && role !== "buyer_seller") {
        setActiveListings(0);
        return;
      }
      try {
        const response = await getMyProducts();
        const products = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : [];
        const now = new Date();
        const liveListings = products.filter((product) => {
          const auction = product?.auction || product?.active_auction || null;
          if (!auction) {
            return false;
          }
          const status = String(auction?.status || "").toLowerCase();
          if (status !== "active") {
            return false;
          }
          if (!auction?.end_time) {
            return true;
          }
          const endTime = new Date(auction.end_time);
          return !Number.isNaN(endTime.getTime()) && endTime > now;
        });
        setActiveListings(liveListings.length);
      } catch (error) {
        console.error("Failed to load active listings:", error);
        setActiveListings(0);
      }
    }
    loadActiveListings();
  }, [role]);
  /* * ===================================================== * CLOSE MENU WHEN CLICKING OUTSIDE * ===================================================== */ useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  /* * ===================================================== * PASSWORD * ===================================================== */ function resetPasswordForm() {
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
  }
  async function handleChangePassword(e) {
    e.preventDefault();
    if (!currentPw) {
      alert("Please enter your current password.");
      return;
    }
    if (!newPw) {
      alert("Please enter a new password.");
      return;
    }
    if (newPw.length < 8) {
      alert("New password must contain at least 8 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      alert("New passwords do not match.");
      return;
    }
    if (currentPw === newPw) {
      alert("Your new password must be different from your current password.");
      return;
    }
    setChangingPassword(true);
    try {
      await api.post("/change-password", {
        current_password: currentPw,
        new_password: newPw,
        new_password_confirmation: confirmPw,
      });
      alert("Password changed successfully.");
      resetPasswordForm();
      setShowChangePw(false);
    } catch (error) {
      console.error("Password change error:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  }
  return (
    <div ref={menuRef} className="relative">
      {" "}
      {/* ===================================================== PROFILE BUTTON ====================================================== */}{" "}
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className=" relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0b5d2a]/30 "
        aria-label="Open profile menu"
        aria-expanded={open}
      >
        {" "}
        {showRealPhoto ? (
          <img
            src={`${STORAGE_URL}/${user.kyc_photo}`}
            alt={user?.name || "Profile"}
            className=" h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm "
          />
        ) : (
          <div className=" flex h-10 w-10 items-center justify-center rounded-full bg-[#0b5d2a] font-semibold text-white ">
            {" "}
            {userInitial}{" "}
          </div>
        )}{" "}
        {isVerified && (
          <span className=" absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#16a34a] ">
            {" "}
            <Icon name="check" className=" h-2.5 w-2.5 text-white " />{" "}
          </span>
        )}{" "}
      </button>{" "}
      {/* ===================================================== PROFILE MENU ====================================================== */}{" "}
      {open && (
        <div className=" absolute right-0 z-50 mt-3 w-[390px] max-w-[calc(100vw-24px)] max-h-[calc(100dvh-85px)] overflow-x-hidden overflow-y-auto rounded-2xl border border-stone-200 bg-white text-stone-900 shadow-[0_20px_55px_rgba(35,31,24,0.18)] ">
          {" "}
          {/* Top green line */} <div className="h-1.5 bg-[#0b5d2a]" />{" "}
          {/* ================================================= PROFILE HEADER ================================================== */}{" "}
          <div className=" bg-[#f5f6fb] px-5 pb-4 pt-5 ">
            {" "}
            <div className=" flex items-start gap-3 ">
              {" "}
              {showRealPhoto ? (
                <img
                  src={`${STORAGE_URL}/${user.kyc_photo}`}
                  alt={user?.name || "Profile"}
                  className=" h-14 w-14 shrink-0 rounded-full border-2 border-white object-cover shadow "
                />
              ) : (
                <div className=" flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0b5d2a] text-xl font-bold text-white ">
                  {" "}
                  {userInitial}{" "}
                </div>
              )}{" "}
              <div className=" min-w-0 flex-1 ">
                {" "}
                <div className=" flex items-center gap-1.5 ">
                  {" "}
                  <p className=" truncate text-[19px] font-semibold text-stone-900 ">
                    {" "}
                    {user?.name || "User"}{" "}
                  </p>{" "}
                  {isVerified && (
                    <span
                      className=" flex h-4 w-4 shrink-0 items-center justify-center text-[#0b5d2a] "
                      title="Verified"
                    >
                      {" "}
                      <Icon name="check" className="h-4 w-4" />{" "}
                    </span>
                  )}{" "}
                </div>{" "}
                <p className=" truncate text-sm text-stone-600 ">
                  {" "}
                  {user?.email || ""}{" "}
                </p>{" "}
                <div className=" mt-1.5 flex flex-wrap items-center gap-2 ">
                  {" "}
                  {/* ROLE */}{" "}
                  <span className=" rounded-full bg-[#a8f0b8] px-2.5 py-1 text-xs font-semibold text-[#12632c] ">
                    {" "}
                    {isBuyerSeller
                      ? "Buyer & Seller"
                      : isSeller
                        ? "Seller"
                        : "Buyer"}{" "}
                  </span>{" "}
                  {/* LOCATION */}{" "}
                  <span className=" flex items-center gap-1 text-xs text-stone-600 ">
                    {" "}
                    <Icon name="location" className="h-3.5 w-3.5" />{" "}
                    {displayLocation}{" "}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {/* ================================================= ACCOUNT STATISTICS ================================================== */}{" "}
            <div className=" mt-4 grid grid-cols-2 divide-x divide-stone-200 rounded-xl bg-white px-2 py-3 shadow-sm ">
              {" "}
              {/* Seller */}{" "}
              {(isSeller || isBuyerSeller) && (
                <div className=" px-2 text-center ">
                  {" "}
                  <p className=" text-xs text-stone-500 "> Listings </p>{" "}
                  <p className=" mt-0.5 font-mono text-base font-semibold text-stone-900 ">
                    {" "}
                    {activeListings}{" "}
                    <span className=" ml-1 text-xs font-normal ">
                      {" "}
                      Active{" "}
                    </span>{" "}
                  </p>{" "}
                </div>
              )}{" "}
              {/* Buyer */}{" "}
              {(isBuyer || isBuyerSeller) && (
                <div className=" px-2 text-center ">
                  {" "}
                  <p className=" text-xs text-stone-500 "> Active Bids </p>{" "}
                  <p className=" mt-0.5 font-mono text-base font-semibold text-stone-900 ">
                    {" "}
                    {activeBids}{" "}
                    <span className=" ml-1 text-xs font-normal ">
                      {" "}
                      Active{" "}
                    </span>{" "}
                  </p>{" "}
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
          {/* ================================================= ACCOUNT ACTIONS ================================================== */}{" "}
          <div className=" px-4 pt-3 ">
            {" "}
            {/* Change Password */}{" "}
            <button
              type="button"
              onClick={() => setShowChangePw((previous) => !previous)}
              className=" flex w-full items-center justify-between rounded-xl bg-[#f1f2fb] px-3.5 py-3 text-left transition hover:bg-[#e9eaf7] "
            >
              {" "}
              <span className=" flex items-center gap-2.5 ">
                {" "}
                <span className=" text-stone-700 ">
                  {" "}
                  <Icon name="key" />{" "}
                </span>{" "}
                <span className=" text-sm font-medium text-stone-900 ">
                  {" "}
                  Change Password{" "}
                </span>{" "}
              </span>{" "}
              <span className=" flex items-center gap-2 text-xs font-medium text-stone-500 ">
                {" "}
                Protected{" "}
                <Icon
                  name="chevronDown"
                  className={` h-4 w-4 transition ${showChangePw ? "rotate-180" : ""} `}
                />{" "}
              </span>{" "}
            </button>{" "}
            {/* Password Form */}{" "}
            {showChangePw && (
              <form
                onSubmit={handleChangePassword}
                className=" mt-3 space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-3.5 "
              >
                {" "}
                {/* Current Password */}{" "}
                <div className="relative">
                  {" "}
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    placeholder="Current password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className=" w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 pr-14 text-sm text-stone-900 outline-none focus:border-[#0b5d2a] focus:ring-2 focus:ring-[#0b5d2a]/10 "
                    required
                  />{" "}
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((previous) => !previous)}
                    className=" absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 hover:text-stone-900 "
                  >
                    {" "}
                    {showCurrentPw ? "Hide" : "Show"}{" "}
                  </button>{" "}
                </div>{" "}
                {/* New Password */}{" "}
                <div className="relative">
                  {" "}
                  <input
                    type={showNewPw ? "text" : "password"}
                    placeholder="New password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className=" w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 pr-14 text-sm text-stone-900 outline-none focus:border-[#0b5d2a] focus:ring-2 focus:ring-[#0b5d2a]/10 "
                    required
                  />{" "}
                  <button
                    type="button"
                    onClick={() => setShowNewPw((previous) => !previous)}
                    className=" absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 hover:text-stone-900 "
                  >
                    {" "}
                    {showNewPw ? "Hide" : "Show"}{" "}
                  </button>{" "}
                </div>{" "}
                <p className=" text-xs text-stone-500 ">
                  {" "}
                  Minimum 8 characters.{" "}
                </p>{" "}
                {/* Confirm Password */}{" "}
                <div className="relative">
                  {" "}
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className=" w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 pr-14 text-sm text-stone-900 outline-none focus:border-[#0b5d2a] focus:ring-2 focus:ring-[#0b5d2a]/10 "
                    required
                  />{" "}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((previous) => !previous)}
                    className=" absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 hover:text-stone-900 "
                  >
                    {" "}
                    {showConfirmPw ? "Hide" : "Show"}{" "}
                  </button>{" "}
                </div>{" "}
                <button
                  type="submit"
                  disabled={changingPassword}
                  className=" w-full rounded-lg bg-[#0b5d2a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#084a21] disabled:cursor-not-allowed disabled:opacity-50 "
                >
                  {" "}
                  {changingPassword ? "Updating..." : "Update Password"}{" "}
                </button>{" "}
              </form>
            )}{" "}
          </div>{" "}
          {/* ================================================= ROLE-BASED NAVIGATION ================================================== */}{" "}
          <div className=" px-4 pb-2 pt-4 ">
            {" "}
            {/* ================================================= BUYER MENU ================================================== */}{" "}
            {(isBuyer || isBuyerSeller) && (
              <>
                {" "}
                <p className=" mb-1.5 px-2.5 text-[11px] font-bold uppercase tracking-wider text-stone-400 ">
                  {" "}
                  Buyer{" "}
                </p>{" "}
                {/* My Bids */}{" "}
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className=" flex items-center justify-between rounded-lg px-2.5 py-3 transition hover:bg-stone-50 "
                >
                  {" "}
                  <span className=" flex items-center gap-3 ">
                    {" "}
                    <Icon
                      name="gavel"
                      className=" h-5 w-5 text-stone-800 "
                    />{" "}
                    <span className=" text-sm font-medium text-stone-900 ">
                      {" "}
                      My Bids & Watchlist{" "}
                    </span>{" "}
                  </span>{" "}
                  <span className=" rounded-full bg-[#a8f0b8] px-2.5 py-1 font-mono text-xs font-semibold text-[#12632c] ">
                    {" "}
                    {activeBids} active{" "}
                  </span>{" "}
                </Link>{" "}
                {/* Won Auctions */}{" "}
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className=" flex items-center justify-between rounded-lg px-2.5 py-3 transition hover:bg-stone-50 "
                >
                  {" "}
                  <span className=" flex items-center gap-3 ">
                    {" "}
                    <Icon
                      name="gavel"
                      className=" h-5 w-5 text-stone-800 "
                    />{" "}
                    <span className=" text-sm font-medium text-stone-900 ">
                      {" "}
                      Won Auctions{" "}
                    </span>{" "}
                  </span>{" "}
                  <Icon
                    name="chevron"
                    className=" h-4 w-4 text-stone-400 "
                  />{" "}
                </Link>{" "}
              </>
            )}{" "}
            {/* ================================================= SELLER MENU ================================================== */}{" "}
            {(isSeller || isBuyerSeller) && (
              <>
                {" "}
                <p className=" mb-1.5 mt-3 px-2.5 text-[11px] font-bold uppercase tracking-wider text-stone-400 ">
                  {" "}
                  Seller{" "}
                </p>{" "}
                {/* Seller Central */}{" "}
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className=" flex items-center justify-between rounded-lg px-2.5 py-3 transition hover:bg-stone-50 "
                >
                  {" "}
                  <span className=" flex items-center gap-3 ">
                    {" "}
                    <Icon
                      name="store"
                      className=" h-5 w-5 text-stone-800 "
                    />{" "}
                    <span className=" text-sm font-medium text-stone-900 ">
                      {" "}
                      Seller Central{" "}
                    </span>{" "}
                  </span>{" "}
                  <Icon
                    name="chevron"
                    className=" h-4 w-4 text-stone-400 "
                  />{" "}
                </Link>{" "}
                {/* My Listings */}{" "}
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className=" flex items-center justify-between rounded-lg px-2.5 py-3 transition hover:bg-stone-50 "
                >
                  {" "}
                  <span className=" flex items-center gap-3 ">
                    {" "}
                    <Icon
                      name="store"
                      className=" h-5 w-5 text-stone-800 "
                    />{" "}
                    <span className=" text-sm font-medium text-stone-900 ">
                      {" "}
                      My Listings{" "}
                    </span>{" "}
                  </span>{" "}
                  <span className=" rounded-full bg-stone-100 px-2.5 py-1 font-mono text-xs font-semibold text-stone-600 ">
                    {" "}
                    {activeListings}{" "}
                  </span>{" "}
                </Link>{" "}
                {/* My Auctions */}{" "}
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className=" flex items-center justify-between rounded-lg px-2.5 py-3 transition hover:bg-stone-50 "
                >
                  {" "}
                  <span className=" flex items-center gap-3 ">
                    {" "}
                    <Icon
                      name="gavel"
                      className=" h-5 w-5 text-stone-800 "
                    />{" "}
                    <span className=" text-sm font-medium text-stone-900 ">
                      {" "}
                      My Auctions{" "}
                    </span>{" "}
                  </span>{" "}
                  <Icon
                    name="chevron"
                    className=" h-4 w-4 text-stone-400 "
                  />{" "}
                </Link>{" "}
                {/* Sales & Earnings */}{" "}
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className=" flex items-center justify-between rounded-lg px-2.5 py-3 transition hover:bg-stone-50 "
                >
                  {" "}
                  <span className=" flex items-center gap-3 ">
                    {" "}
                    <Icon
                      name="store"
                      className=" h-5 w-5 text-stone-800 "
                    />{" "}
                    <span className=" text-sm font-medium text-stone-900 ">
                      {" "}
                      Sales & Earnings{" "}
                    </span>{" "}
                  </span>{" "}
                  <Icon
                    name="chevron"
                    className=" h-4 w-4 text-stone-400 "
                  />{" "}
                </Link>{" "}
              </>
            )}{" "}
            {/* ================================================= COMMON MENU ================================================== */}{" "}
            <div className=" my-2 border-t border-stone-100 " /> {/* KYC */}{" "}
            <Link
              to="/kyc"
              onClick={() => setOpen(false)}
              className=" flex items-center justify-between rounded-lg px-2.5 py-3 transition hover:bg-stone-50 "
            >
              {" "}
              <span className=" flex items-center gap-3 ">
                {" "}
                <Icon name="id" className=" h-5 w-5 text-[#0b7a35] " />{" "}
                <span className=" text-sm font-medium text-stone-900 ">
                  {" "}
                  Citizen KYC Dossier{" "}
                </span>{" "}
              </span>{" "}
              {isVerified ? (
                <span className=" flex items-center gap-1 text-xs font-medium text-[#12632c] ">
                  {" "}
                  Verified <Icon name="check" className="h-3.5 w-3.5" />{" "}
                </span>
              ) : (
                <span className=" text-xs capitalize text-stone-500 ">
                  {" "}
                  {kycStatus}{" "}
                </span>
              )}{" "}
            </Link>{" "}
            {/* Settings */}{" "}
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className=" flex items-center justify-between rounded-lg px-2.5 py-3 transition hover:bg-stone-50 "
            >
              {" "}
              <span className=" flex items-center gap-3 ">
                {" "}
                <Icon
                  name="settings"
                  className=" h-5 w-5 text-stone-800 "
                />{" "}
                <span className=" text-sm font-medium text-stone-900 ">
                  {" "}
                  Settings{" "}
                </span>{" "}
              </span>{" "}
              <Icon name="chevron" className=" h-4 w-4 text-stone-400 " />{" "}
            </Link>{" "}
            {/* Help */}{" "}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                alert("Help & Dispute Center will be available here.");
              }}
              className=" flex w-full items-center justify-between rounded-lg px-2.5 py-3 text-left transition hover:bg-stone-50 "
            >
              {" "}
              <span className=" flex items-center gap-3 ">
                {" "}
                <Icon name="help" className=" h-5 w-5 text-stone-800 " />{" "}
                <span className=" text-sm font-medium text-stone-900 ">
                  {" "}
                  Help & Dispute Center{" "}
                </span>{" "}
              </span>{" "}
              <span className=" text-xs text-stone-500 ">
                {" "}
                NILAAM Hub{" "}
              </span>{" "}
            </button>{" "}
          </div>{" "}
          {/* ================================================= FOOTER ================================================== */}{" "}
          <div className=" border-t border-stone-200 bg-[#f1f2fb] px-4 py-3 ">
            {" "}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className=" flex items-center gap-2 text-sm font-medium text-red-600 transition hover:text-red-700 "
            >
              {" "}
              <Icon name="logout" className="h-5 w-5" /> Sign Out{" "}
            </button>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
}
export default ProfileMenu;