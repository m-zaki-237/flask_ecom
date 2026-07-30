import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import { User, Mail, Lock, Shield, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, ArrowLeft, Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-[#FFFFFF] text-[#1A1A1A] flex font-sans selection:bg-[#B8865B] selection:text-white">
      
      {/* Left Visual Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1A1A1A] text-white relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80"
            alt="Market Bros Architecture"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/40 to-transparent" />

        <div className="relative z-10">
          <Link to="/home" className="flex items-center gap-3 w-fit">
            <div className="h-10 w-10 bg-[#B8865B] text-white flex items-center justify-center font-display font-bold text-xl rounded-xl">
              MB
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-white">
              MARKET <span className="text-[#B8865B]">BROS</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#B8865B] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Join Our Marketplace</span>
          </div>
          <h2 className="text-4xl font-serif-editorial font-bold leading-tight text-white">
            Join thousands of lifestyle design enthusiasts.
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Create your Market Bros profile to order handcrafted furniture, electronics, and lifestyle appliances with white-glove service.
          </p>
        </div>

        <div className="relative z-10 text-xs text-gray-400">
          © 2026 MARKET BROS. CRAFTO COMMERCIAL FRONTEND.
        </div>
      </div>

      {/* Right Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative bg-[#F8F7F4]">
        <Link
          to="/home"
          className="absolute top-8 left-8 text-xs font-semibold tracking-wider text-[#52525B] hover:text-[#B8865B] flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-[#B8865B]" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8E5DF] p-8 sm:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.03)] space-y-6">
          <div className="text-center space-y-2 pb-4 border-b border-[#E8E5DF]">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">JOIN MARKET BROS</span>
            <h1 className="text-2xl font-serif-editorial font-bold text-[#1A1A1A]">Create Account</h1>
            <p className="text-xs text-[#6B6B6B]">Enter your details to register your member account</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                  First Name*
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#71717A]" />
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl pl-10 pr-3 py-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
                    placeholder="First"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                  Last Name*
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#71717A]" />
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl pl-10 pr-3 py-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
                    placeholder="Last"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Email Address*
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#71717A]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl pl-10 pr-3 py-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
                  placeholder="your.email@domain.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Password*
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#71717A]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl pl-10 pr-10 py-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#71717A] hover:text-[#1A1A1A]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Account Type*
              </label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-3.5 h-4 w-4 text-[#71717A]" />
                <select
                  value={form.role_id}
                  onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                  className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl pl-10 pr-3 py-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
                >
                  <option value="3">Customer / Buyer Account</option>
                  <option value="2">Seller / Merchant Account</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1A1A1A] text-white font-semibold text-xs rounded-xl uppercase tracking-wider hover:bg-[#B8865B] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Create Market Bros Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#E8E5DF] text-center text-xs text-[#6B6B6B]">
            <span>Already have an account?</span>
            <Link to="/login" className="ml-2 font-bold text-[#B8865B] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}