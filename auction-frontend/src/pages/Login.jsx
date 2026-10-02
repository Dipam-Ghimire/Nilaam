import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const loggedInUser = await login({ email, password });
      navigate(loggedInUser?.role === "admin" ? "/admin" : "/");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  }
  function handlePasswordKeyUp(e) {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  }
  return (
    <div className="min-h-screen bg-[#f7f8f7] text-[#131b2e]">
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-lg sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f5ec]">
                <span className="text-2xl text-[#14532d]"> ⚖ </span>
              </div>
              <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#131b2e] sm:text-3xl">
                {" "}
                Sign in to NILAAM{" "}
              </h1>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                {" "}
                Access your auctions, bids, listings, and account.{" "}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  {" "}
                  Email Address{" "}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="username"
                  required
                  className=" w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#14532d] focus:ring-2 focus:ring-[#14532d]/10 "
                />{" "}
              </div>{" "}
              {/* PASSWORD */}{" "}
              <div>
                {" "}
                <div className="mb-2 flex items-center justify-between gap-3">
                  {" "}
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-stone-800"
                  >
                    {" "}
                    Password{" "}
                  </label>{" "}
                  <button
                    type="button"
                    onClick={() =>
                      alert("Password reset will be available soon.")
                    }
                    className="text-xs font-semibold text-[#14532d] transition hover:text-[#0b3d20]"
                  >
                    {" "}
                    Forgot Password?{" "}
                  </button>{" "}
                </div>{" "}
                <div className="relative">
                  {" "}
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={handlePasswordKeyUp}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className=" w-full rounded-xl border border-stone-300 bg-white px-4 py-3 pr-12 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#14532d] focus:ring-2 focus:ring-[#14532d]/10 "
                  />{" "}
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className=" absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 "
                  >
                    {" "}
                    <span className="text-base">
                      {" "}
                      {showPassword ? "🙈" : "👁️"}{" "}
                    </span>{" "}
                  </button>{" "}
                </div>{" "}
                {/* CAPS LOCK WARNING */}{" "}
                {capsLockOn && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                    {" "}
                    <span>⚠</span> Caps Lock is currently ON{" "}
                  </p>
                )}{" "}
              </div>{" "}
              {/* LOGIN BUTTON */}{" "}
              <button
                type="submit"
                className=" flex w-full items-center justify-center gap-2 rounded-xl bg-[#14532d] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4224] hover:shadow-md active:scale-[0.99] "
              >
                {" "}
                Sign In <span className="text-base"> → </span>{" "}
              </button>{" "}
            </form>{" "}
            {/* REGISTER */}{" "}
            <div className="mt-6 border-t border-stone-100 pt-6 text-center">
              {" "}
              <p className="text-sm text-stone-500"> New to NILAAM? </p>{" "}
              <Link
                to="/register"
                className=" mt-2 inline-block text-sm font-semibold text-[#14532d] underline underline-offset-4 transition hover:text-[#0b3d20] "
              >
                {" "}
                Create an account{" "}
              </Link>{" "}
            </div>{" "}
          </div>{" "}
          {/* SIMPLE FOOTER */}{" "}
          <p className="mt-5 text-center text-xs text-stone-400">
            {" "}
            Secure NILAAM Marketplace{" "}
          </p>{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
export default Login;
