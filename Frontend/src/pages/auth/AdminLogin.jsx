import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin, isLoading, error } = useAuthStore();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await adminLogin(phone, password);
    if (res.success) {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3.5 flex items-center justify-between gap-3 text-left">
            <div>
              <p className="text-xs text-amber-900 font-bold">
                Demo Mode Active
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                Phone: <code className="bg-amber-200/70 font-mono font-bold px-1 rounded text-amber-950">8483937455</code>
                <br />
                OTP / Pass: <code className="bg-amber-200/70 font-mono font-bold px-1 rounded text-amber-950">123456</code>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPhone("8483937455");
                setPassword("123456");
              }}
              className="px-3 py-1.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold rounded-lg shrink-0 transition-colors shadow-sm"
            >
              Auto-fill
            </button>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="phone"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Admin Phone (8483937455)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Password or Demo OTP (123456)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
