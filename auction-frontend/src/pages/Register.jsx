import { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
function Icon({ name, className = "h-5 w-5" }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
  };
  switch (name) {
    case "user":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <circle cx="12" cy="8" r="3.5" />{" "}
          <path d="M5 20c.8-4 3.2-6 7-6s6.2 2 7 6" />{" "}
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <rect x="3" y="5" width="18" height="14" rx="2" />{" "}
          <path d="M4 7l8 6 8-6" />{" "}
        </svg>
      );
    case "lock":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <rect x="5" y="10" width="14" height="10" rx="2" />{" "}
          <path d="M8 10V7a4 4 0 018 0v3" />{" "}
        </svg>
      );
    case "eye":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />{" "}
          <circle cx="12" cy="12" r="2.5" />{" "}
        </svg>
      );
    case "eyeOff":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <path d="M3 3l18 18" /> <path d="M10.6 10.6a2 2 0 002.8 2.8" />{" "}
          <path d="M9.9 5.3A10.8 10.8 0 0112 5c6 0 9.5 7 9.5 7a17.5 17.5 0 01-3.1 3.8" />{" "}
          <path d="M6.3 6.3C3.7 8.1 2.5 12 2.5 12S6 19 12 19c1.7 0 3.2-.4 4.5-1" />{" "}
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
    case "wallet":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <path d="M4 6h15a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />{" "}
          <path d="M2 8V6a2 2 0 012-2h13" /> <path d="M16 13h5" />{" "}
          <circle cx="16" cy="13" r=".5" />{" "}
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <path d="M5 12l4 4L19 6" />{" "}
        </svg>
      );
    case "arrow":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <path d="M5 12h14" /> <path d="M13 6l6 6-6 6" />{" "}
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          {" "}
          <path d="M12 3l7 3v5c0 4.8-2.9 8.2-7 10-4.1-1.8-7-5.2-7-10V6l7-3z" />{" "}
          <path d="M9 12l2 2 4-4" />{" "}
        </svg>
      );
    default:
      return null;
  }
}
function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState("buyer_seller");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  /* * ===================================================== * PASSWORD STRENGTH * ===================================================== */ const passwordStrength =
    useMemo(() => {
      if (!password) {
        return { score: 0, label: "" };
      }
      let score = 0;
      if (password.length >= 8) {
        score += 1;
      }
      if (/[A-Z]/.test(password)) {
        score += 1;
      }
      if (/[0-9]/.test(password)) {
        score += 1;
      }
      if (/[^A-Za-z0-9]/.test(password)) {
        score += 1;
      }
      const labels = { 1: "Weak", 2: "Fair", 3: "Good", 4: "Strong" };
      return { score, label: labels[score] || "" };
    }, [password]);
  /* * ===================================================== * SUBMIT * ===================================================== */ async function handleSubmit(
    e,
  ) {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }
    if (password.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }
    if (password !== passwordConfirmation) {
      alert("Passwords do not match.");
      return;
    }
    if (!acceptedTerms) {
      alert("Please accept the Nilaam terms and guidelines.");
      return;
    }
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
        role,
      });
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }
  /* * ===================================================== * COMMON INPUT STYLE * ===================================================== */ const inputClass = ` w-full rounded-xl border border-stone-300 bg-white px-4 py-3 pl-11 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-[#14532d] focus:ring-2 focus:ring-[#14532d]/10 `;
  /* * ===================================================== * ROLE CARD STYLE * ===================================================== */ const roleCardClass =
    (selected) =>
      ` relative flex min-h-[100px] flex-1 cursor-pointer flex-col rounded-xl border px-3 py-3 transition ${selected ? ` border-[#14532d] bg-[#e8f5ec] shadow-[0_0_0_1px_rgba(20,83,45,0.10)] ` : ` border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 `} `;
  return (
    <div className=" min-h-screen bg-[#f7f8f7] px-4 py-10 text-stone-900 ">
      {" "}
      <div className="mx-auto w-full max-w-xl">
        {" "}
        {/* ================================================= REGISTRATION CARD ================================================== */}{" "}
        <div className=" overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg ">
          {" "}
          {/* GREEN TOP ACCENT */} <div className="h-1 bg-[#14532d]" />{" "}
          <div className="px-6 py-7 sm:px-8 sm:py-8">
            {" "}
            {/* ================================================= HEADER ================================================== */}{" "}
            <div className="text-center">
              {" "}
              <div className=" mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#14532d] ">
                {" "}
                <Icon name="shield" className="h-6 w-6" />{" "}
              </div>{" "}
              <h1 className=" mt-5 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl ">
                {" "}
                Create your NILAAM Account{" "}
              </h1>{" "}
              <p className=" mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500 ">
                {" "}
                Join NILAAM as a buyer, seller, or both.{" "}
              </p>{" "}
            </div>{" "}
            {/* ================================================= FORM ================================================== */}{" "}
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              {" "}
              {/* ================================================= NAME ================================================== */}{" "}
              <div>
                {" "}
                <label
                  htmlFor="name"
                  className=" mb-2 block text-sm font-semibold text-stone-800 "
                >
                  {" "}
                  Full Name{" "}
                </label>{" "}
                <div className="relative">
                  {" "}
                  <span className=" pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 ">
                    {" "}
                    <Icon name="user" className="h-4 w-4" />{" "}
                  </span>{" "}
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    className={inputClass}
                  />{" "}
                </div>{" "}
              </div>{" "}
              {/* ================================================= EMAIL ================================================== */}{" "}
              <div>
                {" "}
                <label
                  htmlFor="email"
                  className=" mb-2 block text-sm font-semibold text-stone-800 "
                >
                  {" "}
                  Email Address{" "}
                </label>{" "}
                <div className="relative">
                  {" "}
                  <span className=" pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 ">
                    {" "}
                    <Icon name="mail" className="h-4 w-4" />{" "}
                  </span>{" "}
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    className={inputClass}
                  />{" "}
                </div>{" "}
              </div>{" "}
              {/* ================================================= ACCOUNT ROLE ================================================== */}{" "}
              <div>
                {" "}
                <label className=" mb-2 block text-sm font-semibold text-stone-800 ">
                  {" "}
                  Account Role{" "}
                </label>{" "}
                <div className="flex flex-col gap-2 sm:flex-row">
                  {" "}
                  {/* BUYER */}{" "}
                  <button
                    type="button"
                    onClick={() => setRole("buyer")}
                    className={roleCardClass(role === "buyer")}
                  >
                    {" "}
                    {role === "buyer" && (
                      <span className=" absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#14532d] text-white ">
                        {" "}
                        <Icon name="check" className="h-3 w-3" />{" "}
                      </span>
                    )}{" "}
                    <span className="mb-2 text-[#14532d]">
                      {" "}
                      <Icon name="gavel" className="h-5 w-5" />{" "}
                    </span>{" "}
                    <span className="text-left text-sm font-semibold">
                      {" "}
                      Buyer{" "}
                    </span>{" "}
                    <span className="mt-1 text-left text-xs leading-4 text-stone-500">
                      {" "}
                      Bid on auctions{" "}
                    </span>{" "}
                  </button>{" "}
                  {/* SELLER */}{" "}
                  <button
                    type="button"
                    onClick={() => setRole("seller")}
                    className={roleCardClass(role === "seller")}
                  >
                    {" "}
                    {role === "seller" && (
                      <span className=" absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#14532d] text-white ">
                        {" "}
                        <Icon name="check" className="h-3 w-3" />{" "}
                      </span>
                    )}{" "}
                    <span className="mb-2 text-[#14532d]">
                      {" "}
                      <Icon name="store" className="h-5 w-5" />{" "}
                    </span>{" "}
                    <span className="text-left text-sm font-semibold">
                      {" "}
                      Seller{" "}
                    </span>{" "}
                    <span className="mt-1 text-left text-xs leading-4 text-stone-500">
                      {" "}
                      List and sell items{" "}
                    </span>{" "}
                  </button>{" "}
                  {/* BUYER & SELLER */}{" "}
                  <button
                    type="button"
                    onClick={() => setRole("buyer_seller")}
                    className={roleCardClass(role === "buyer_seller")}
                  >
                    {" "}
                    {role === "buyer_seller" && (
                      <span className=" absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#14532d] text-white ">
                        {" "}
                        <Icon name="check" className="h-3 w-3" />{" "}
                      </span>
                    )}{" "}
                    <span className="mb-2 text-[#14532d]">
                      {" "}
                      <Icon name="wallet" className="h-5 w-5" />{" "}
                    </span>{" "}
                    <span className="text-left text-sm font-semibold">
                      {" "}
                      Buyer & Seller{" "}
                    </span>{" "}
                    <span className="mt-1 text-left text-xs leading-4 text-stone-500">
                      {" "}
                      Buy and sell{" "}
                    </span>{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
              {/* ================================================= PASSWORD ================================================== */}{" "}
              <div>
                {" "}
                <div className="mb-2 flex items-center justify-between gap-3">
                  {" "}
                  <label
                    htmlFor="password"
                    className=" text-sm font-semibold text-stone-800 "
                  >
                    {" "}
                    Password{" "}
                  </label>{" "}
                  <span className="text-xs text-stone-400">
                    {" "}
                    Minimum 8 characters{" "}
                  </span>{" "}
                </div>{" "}
                <div className="relative">
                  {" "}
                  <span className=" pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 ">
                    {" "}
                    <Icon name="lock" className="h-4 w-4" />{" "}
                  </span>{" "}
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pr-12`}
                  />{" "}
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className=" absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 transition hover:text-stone-900 "
                  >
                    {" "}
                    <Icon
                      name={showPassword ? "eyeOff" : "eye"}
                      className="h-4 w-4"
                    />{" "}
                  </button>{" "}
                </div>{" "}
                {/* PASSWORD STRENGTH */}{" "}
                {password && (
                  <div className="mt-2">
                    {" "}
                    <div className="flex gap-1">
                      {" "}
                      {[1, 2, 3, 4].map((segment) => (
                        <div
                          key={segment}
                          className={` h-1 flex-1 rounded-full ${segment <= passwordStrength.score ? "bg-[#14532d]" : "bg-stone-200"} `}
                        />
                      ))}{" "}
                    </div>{" "}
                    <p className="mt-1 text-right text-xs text-stone-500">
                      {" "}
                      Strength:{" "}
                      <span className="font-semibold text-[#14532d]">
                        {" "}
                        {passwordStrength.label}{" "}
                      </span>{" "}
                    </p>{" "}
                  </div>
                )}{" "}
              </div>{" "}
              {/* ================================================= CONFIRM PASSWORD ================================================== */}{" "}
              <div>
                {" "}
                <label
                  htmlFor="password_confirmation"
                  className=" mb-2 block text-sm font-semibold text-stone-800 "
                >
                  {" "}
                  Confirm Password{" "}
                </label>{" "}
                <div className="relative">
                  {" "}
                  <span className=" pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 ">
                    {" "}
                    <Icon name="shield" className="h-4 w-4" />{" "}
                  </span>{" "}
                  <input
                    id="password_confirmation"
                    type={showConfirmation ? "text" : "password"}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pr-12`}
                  />{" "}
                  <button
                    type="button"
                    onClick={() => setShowConfirmation((previous) => !previous)}
                    aria-label={
                      showConfirmation
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    className=" absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 transition hover:text-stone-900 "
                  >
                    {" "}
                    <Icon
                      name={showConfirmation ? "eyeOff" : "eye"}
                      className="h-4 w-4"
                    />{" "}
                  </button>{" "}
                </div>{" "}
                {/* MATCH STATUS */}{" "}
                {passwordConfirmation && password !== passwordConfirmation && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {" "}
                    Passwords do not match.{" "}
                  </p>
                )}{" "}
                {passwordConfirmation && password === passwordConfirmation && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-[#14532d]">
                    {" "}
                    <Icon name="check" className="h-3 w-3" /> Passwords
                    match.{" "}
                  </p>
                )}{" "}
              </div>{" "}
              {/* ================================================= TERMS ================================================== */}{" "}
              <label className="flex cursor-pointer items-start gap-3">
                {" "}
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className=" mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#14532d] "
                />{" "}
                <span className="text-xs leading-5 text-stone-500">
                  {" "}
                  I agree to the NILAAM{" "}
                  <Link
                    to="/terms"
                    className="font-medium text-[#14532d] underline underline-offset-2"
                  >
                    {" "}
                    Terms & Conditions{" "}
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/disputes"
                    className="font-medium text-[#14532d] underline underline-offset-2"
                  >
                    {" "}
                    Dispute Guidelines{" "}
                  </Link>{" "}
                  .{" "}
                </span>{" "}
              </label>{" "}
              {/* ================================================= CREATE ACCOUNT ================================================== */}{" "}
              <button
                type="submit"
                disabled={loading}
                className=" flex w-full items-center justify-center gap-2 rounded-xl bg-[#14532d] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4224] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 "
              >
                {" "}
                {loading ? "Creating Account..." : "Create Account"}{" "}
                {!loading && <Icon name="arrow" className="h-4 w-4" />}{" "}
              </button>{" "}
            </form>{" "}
            {/* ================================================= LOGIN LINK ================================================== */}{" "}
            <div className="mt-6 border-t border-stone-100 pt-6 text-center">
              {" "}
              <p className="text-sm text-stone-500">
                {" "}
                Already have an account?{" "}
                <Link
                  to="/login"
                  className=" font-semibold text-[#14532d] underline underline-offset-2 transition hover:text-[#0f4224] "
                >
                  {" "}
                  Sign in{" "}
                </Link>{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* ================================================= SIMPLE FOOTER ================================================== */}{" "}
        <p className="mt-5 text-center text-xs text-stone-400">
          {" "}
          Secure NILAAM Marketplace{" "}
        </p>{" "}
      </div>{" "}
    </div>
  );
}
export default Register;
