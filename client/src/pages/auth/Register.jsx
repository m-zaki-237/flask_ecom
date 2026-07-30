import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import { User, Mail, Lock, Shield, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role_id: "3",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/user/register", {
        ...form,
        role_id: parseInt(form.role_id),
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0e13] text-[#f3f3f5] flex flex-col justify-center items-center p-4 font-sans selection:bg-[#d4a373] selection:text-black relative">
      <Link
        to="/home"
        className="absolute top-8 left-8 text-xs font-mono-tech uppercase tracking-wider text-[#a19fad] hover:text-white flex items-center gap-2"
      >
        <ArrowLeft className="h-3.5 w-3.5 text-[#d4a373]" />
        <span>BACK TO MARKETPLACE</span>
      </Link>

      <div className="w-full max-w-md border border-[#282630] bg-[#16151a] p-8 space-y-6">
        <div className="text-center space-y-3 pb-6 border-b border-[#282630]">
          <div className="mx-auto h-12 w-12 bg-white text-black flex items-center justify-center font-mono-tech font-bold text-xl tracking-tighter">
            FW
          </div>
          <div>
            <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[#d4a373] block">
              MEMBERSHIP REGISTRATION
            </span>
            <h1 className="text-2xl font-display font-bold uppercase tracking-wide text-white mt-1">
              CREATE YOUR ACCOUNT
            </h1>
            <p className="text-xs font-mono-tech text-[#6c697b] mt-1">
              Join Furniture Waley to trade build slots, order custom pieces, and access concierge support.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono-tech uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono-tech text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#a19fad] mb-1">
                FIRST NAME*
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-[#6c697b]" />
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="w-full bg-[#0f0e13] border border-[#282630] pl-10 pr-3 py-2.5 text-xs text-white placeholder-[#6c697b] focus:outline-none focus:border-[#d4a373]"
                  placeholder="FIRST"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#a19fad] mb-1">
                LAST NAME*
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-[#6c697b]" />
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="w-full bg-[#0f0e13] border border-[#282630] pl-10 pr-3 py-2.5 text-xs text-white placeholder-[#6c697b] focus:outline-none focus:border-[#d4a373]"
                  placeholder="LAST"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#a19fad] mb-1">
              EMAIL ADDRESS*
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-[#6c697b]" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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

          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#a19fad] mb-1">
              REGISTER AS*
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 h-4 w-4 text-[#6c697b]" />
              <select
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                className="w-full bg-[#0f0e13] border border-[#282630] pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4a373] uppercase"
              >
                <option value="3">CUSTOMER / BUYER</option>
                <option value="2">SELLER / CRAFTSMAN</option>
              </select>
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
                <span>REGISTER ACCOUNT</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#282630] text-center text-xs font-mono-tech text-[#6c697b]">
          <span>ALREADY HAVE AN ACCOUNT?</span>
          <Link to="/login" className="ml-2 font-bold text-white uppercase hover:text-[#d4a373]">
            LOG IN HERE
          </Link>
        </div>
      </div>
    </div>
  );
}