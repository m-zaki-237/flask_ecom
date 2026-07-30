import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Info, ArrowLeft } from "lucide-react";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/user/login", { email, password });
      login(
        {
          user_id: res.data.user_id,
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          role: res.data.role,
        },
        res.data.access_token,
        res.data.refresh_token
      );
      const role = res.data.role;
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "seller") navigate("/seller/dashboard");
      else navigate("/home");
    } catch (error) {
      setError(error.response?.data?.message || error.response?.data?.error || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0e13] text-[#f3f3f5] flex flex-col justify-center items-center p-4 font-sans selection:bg-[#d4a373] selection:text-black relative">
      {/* Top Header Back Button */}
      <Link
        to="/home"
        className="absolute top-8 left-8 text-xs font-mono-tech uppercase tracking-wider text-[#a19fad] hover:text-white flex items-center gap-2"
      >
        <ArrowLeft className="h-3.5 w-3.5 text-[#d4a373]" />
        <span>BACK TO MARKETPLACE</span>
      </Link>

      <div className="w-full max-w-md border border-[#282630] bg-[#16151a] p-8 space-y-6">
        {/* Brand & Header */}
        <div className="text-center space-y-3 pb-6 border-b border-[#282630]">
          <div className="mx-auto h-12 w-12 bg-white text-black flex items-center justify-center font-mono-tech font-bold text-xl tracking-tighter">
            FW
          </div>
          <div>
            <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[#d4a373] block">
              AUTHENTICATION PORTAL
            </span>
            <h1 className="text-2xl font-display font-bold uppercase tracking-wide text-white mt-1">
              LOG IN TO FURNITURE WALEY
            </h1>
            <p className="text-xs font-mono-tech text-[#6c697b] mt-1">
              Access your build slots, orders, and saved marketplace items.
            </p>
          </div>
        </div>

        {/* Notices / Errors */}
        {redirectMessage && (
          <div className="p-3 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono-tech uppercase tracking-wider flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            <span>{redirectMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono-tech uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono-tech text-xs">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#a19fad] mb-1">
              ACCOUNT EMAIL*
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-[#6c697b]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0f0e13] border border-[#282630] pl-10 pr-3 py-2.5 text-xs text-white placeholder-[#6c697b] focus:outline-none focus:border-[#d4a373]"
                placeholder="EMAIL@DOMAIN.COM"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#a19fad] mb-1">
              PASSWORD*
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-[#6c697b]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f0e13] border border-[#282630] pl-10 pr-10 py-2.5 text-xs text-white placeholder-[#6c697b] focus:outline-none focus:border-[#d4a373]"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#6c697b] hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white text-black font-mono-tech font-bold text-xs uppercase tracking-wider hover:bg-[#d4a373] transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" />
            ) : (
              <>
                <span>LOG IN</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-[#282630] text-center text-xs font-mono-tech text-[#6c697b]">
          <span>DON'T HAVE AN ACCOUNT?</span>
          <Link to="/register" className="ml-2 font-bold text-white uppercase hover:text-[#d4a373]">
            REGISTER NOW
          </Link>
        </div>
      </div>
    </div>
  );
};
