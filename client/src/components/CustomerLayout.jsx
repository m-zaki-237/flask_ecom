import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useState } from "react";
import {
  ShoppingBag,
  Heart,
  Headphones,
  LogOut,
  Menu,
  X,
  Send,
  Loader2,
  ArrowUp,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Search,
  User as UserIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function CustomerLayout({ children }) {
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticket, setTicket] = useState({ subject: "", body: "" });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketMessage, setTicketMessage] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");

  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmitTicket = async (e) => {
    if (e) e.preventDefault();
    if (!ticket.subject.trim() || !ticket.body.trim()) {
      setTicketMessage("Please fill out all fields.");
      return;
    }

    setSubmittingTicket(true);
    setTicketMessage("");

    try {
      await api.post("/support_tickets", {
        user_id: user?.user_id,
        subject: ticket.subject,
        body: ticket.body,
      });

      setTicketMessage("Support inquiry submitted successfully!");
      setTicket({ subject: "", body: "" });

      setTimeout(() => {
        setShowTicketModal(false);
        setTicketMessage("");
      }, 1500);
    } catch (err) {
      setTicketMessage(err.response?.data?.error || "Failed to submit support inquiry");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus("Thank you for joining the Market Bros insider list!");
    setNewsletterEmail("");
    setTimeout(() => setNewsletterStatus(""), 3500);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { name: "Marketplace", path: "/home" },
    { name: "My Orders", path: "/orders" },
    { name: "Wishlist", path: "/wishlist" },
    { name: "Concierge", path: "/support_tickets" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#B8865B] selection:text-white">
      {/* Crafto Announcement Bar */}
      <div className="bg-[#1A1A1A] text-white text-[12px] font-medium py-2.5 px-4 text-center tracking-wide flex items-center justify-center gap-3">
        <Sparkles className="h-3.5 w-3.5 text-[#B8865B]" />
        <span>COMPLIMENTARY WHITE-GLOVE EXPRESS DELIVERY ON ORDERS OVER $500</span>
        <span className="hidden md:inline-block text-[#B8865B]">•</span>
        <span className="hidden md:inline-block text-gray-300">EXPLORE CURATED LIFESTYLE & HOME COLLECTIONS</span>
      </div>

      {/* Crafto Header Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-[#E8E5DF] transition-all">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-10">
            <Link to="/home" className="flex items-center gap-3 group">
              <div className="h-10 w-10 bg-[#B8865B] text-white flex items-center justify-center font-display font-bold text-xl rounded-xl shadow-md group-hover:bg-[#1A1A1A] transition-colors">
                MB
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-xl tracking-tight text-[#1A1A1A] group-hover:text-[#B8865B] transition-colors">
                  MARKET <span className="text-[#B8865B]">BROS</span>
                </span>
                <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase -mt-1">
                  PREMIUM MARKETPLACE
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "text-sm font-medium tracking-wide transition-all relative py-2",
                      isActive
                        ? "text-[#1A1A1A] font-semibold"
                        : "text-[#52525B] hover:text-[#B8865B]"
                    )}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#B8865B] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons & Auth */}
          <div className="hidden sm:flex items-center gap-4">
            <button
              onClick={() => setShowTicketModal(true)}
              className="px-4 py-2 text-xs font-semibold text-[#1A1A1A] bg-[#F8F7F4] hover:bg-[#F4EFEA] border border-[#E8E5DF] rounded-xl transition-all flex items-center gap-2"
            >
              <Headphones className="h-4 w-4 text-[#B8865B]" />
              <span>Concierge Support</span>
            </button>

            <Link to="/wishlist">
              <button 
                title="Wishlist"
                className="p-2.5 text-[#1A1A1A] hover:text-[#B8865B] hover:bg-[#F8F7F4] rounded-xl transition-all border border-transparent hover:border-[#E8E5DF]"
              >
                <Heart className="h-5 w-5" />
              </button>
            </Link>

            <Link to="/cart">
              <button className="px-4 py-2.5 text-xs font-semibold text-white bg-[#1A1A1A] hover:bg-[#B8865B] rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span>Cart</span>
              </button>
            </Link>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-[#E8E5DF]">
                {user.role === "admin" && (
                  <Link to="/admin/dashboard">
                    <span className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                      Admin Portal
                    </span>
                  </Link>
                )}
                {user.role === "seller" && (
                  <Link to="/seller/dashboard">
                    <span className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                      Seller Portal
                    </span>
                  </Link>
                )}
                <div className="text-right hidden md:block leading-tight">
                  <div className="text-xs font-bold text-[#1A1A1A] truncate max-w-[120px]">{user.first_name || user.email?.split("@")[0]}</div>
                  <div className="text-[10px] text-[#B8865B] font-semibold uppercase">{user.role || "Member"}</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E8E5DF]">
                <Link to="/login">
                  <button className="px-4 py-2 text-xs font-semibold text-[#1A1A1A] hover:text-[#B8865B] transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-4 py-2 text-xs font-semibold text-[#B8865B] bg-[#F4EFEA] hover:bg-[#B8865B] hover:text-white rounded-xl transition-all">
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-2 text-[#1A1A1A] hover:bg-[#F8F7F4] rounded-xl border border-[#E8E5DF]"
          >
            {mobileNavOpen ? <X className="h-5 w-5 text-[#B8865B]" /> : <Menu className="h-5 w-5 text-[#1A1A1A]" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-[#E8E5DF] bg-[#FFFFFF] p-6 space-y-4 shadow-xl">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileNavOpen(false)}
                  className="text-base font-medium text-[#1A1A1A] hover:text-[#B8865B] py-2.5 border-b border-[#E8E5DF]/60 flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="h-4 w-4 text-[#B8865B]" />
                </Link>
              ))}
              <Link
                to="/cart"
                onClick={() => setMobileNavOpen(false)}
                className="text-base font-medium text-[#B8865B] py-2.5 flex items-center justify-between"
              >
                <span>Shopping Cart</span>
                <ShoppingBag className="h-5 w-5" />
              </Link>
            </div>

            <div className="pt-4 flex flex-col gap-3 border-t border-[#E8E5DF]">
              {user ? (
                <>
                  <div className="text-xs text-[#52525B]">
                    Signed in as <span className="font-bold text-[#1A1A1A]">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileNavOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2.5 bg-red-50 text-red-600 font-semibold text-xs rounded-xl"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" onClick={() => setMobileNavOpen(false)}>
                    <button className="w-full py-2.5 border border-[#E8E5DF] text-xs font-semibold text-[#1A1A1A] rounded-xl">
                      Sign In
                    </button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileNavOpen(false)}>
                    <button className="w-full py-2.5 bg-[#B8865B] text-white text-xs font-semibold rounded-xl">
                      Register
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Canvas */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {children}
      </main>

      {/* Crafto Multi-Column Footer */}
      <footer className="w-full bg-[#F8F7F4] border-t border-[#E8E5DF] text-[#52525B] mt-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16">
          
          {/* Newsletter Box */}
          <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl p-8 lg:p-12 mb-16 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs font-bold tracking-widest text-[#B8865B] uppercase block mb-2">
                INSIDER NEWSLETTER
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#1A1A1A] mb-2">
                Subscribe for Curated Releases & Lifestyle Catalog Drops
              </h3>
              <p className="text-sm text-[#6B6B6B]">
                Join over 25,000 design enthusiasts receiving private collection previews, seasonal trends, and member privileges.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="bg-[#F8F7F4] border border-[#E8E5DF] px-4 py-3.5 rounded-xl text-sm text-[#1A1A1A] placeholder-[#71717A] focus:outline-none focus:border-[#B8865B] min-w-[300px]"
              />
              <button
                type="submit"
                className="bg-[#1A1A1A] text-white font-semibold text-xs tracking-wider uppercase px-8 py-3.5 rounded-xl hover:bg-[#B8865B] transition-colors shrink-0 shadow-md"
              >
                Join Private List
              </button>
            </form>
          </div>

          {newsletterStatus && (
            <div className="mb-8 p-4 border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl text-center">
              {newsletterStatus}
            </div>
          )}

          {/* Guarantees Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 mb-12 border-y border-[#E8E5DF]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#F4EFEA] text-[#B8865B] flex items-center justify-center shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-[#1A1A1A]">White-Glove Delivery</h5>
                <p className="text-xs text-[#71717A]">Inspected, delivered & set up in place</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#F4EFEA] text-[#B8865B] flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-[#1A1A1A]">5-Year Warranty Guarantee</h5>
                <p className="text-xs text-[#71717A]">Craftsmanship backed for total confidence</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#F4EFEA] text-[#B8865B] flex items-center justify-center shrink-0">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-[#1A1A1A]">30-Day Hassle-Free Returns</h5>
                <p className="text-xs text-[#71717A]">Seamless exchange and easy refunds</p>
              </div>
            </div>
          </div>

          {/* Links & Brand Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-16 border-b border-[#E8E5DF]">
            {/* Brand Intro */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-[#B8865B] text-white flex items-center justify-center font-display font-bold text-lg rounded-lg">
                  MB
                </div>
                <span className="font-display font-extrabold text-xl tracking-tight text-[#1A1A1A]">
                  MARKET <span className="text-[#B8865B]">BROS</span>
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] leading-relaxed max-w-sm">
                Market Bros is a premier lifestyle marketplace connecting discerning customers with high-end furniture, home decor, electronics, appliances, and luxury accessories.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-4">
                Explore Marketplace
              </h4>
              <ul className="space-y-2.5 text-xs text-[#52525B]">
                <li><Link to="/home" className="hover:text-[#B8865B] transition-colors">Catalog Overview</Link></li>
                <li><Link to="/wishlist" className="hover:text-[#B8865B] transition-colors">Saved Collections</Link></li>
                <li><Link to="/orders" className="hover:text-[#B8865B] transition-colors">Track Your Orders</Link></li>
                <li><Link to="/cart" className="hover:text-[#B8865B] transition-colors">Shopping Cart</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-4">
                Categories
              </h4>
              <ul className="space-y-2.5 text-xs text-[#52525B]">
                <li><Link to="/home" className="hover:text-[#B8865B] transition-colors">Furniture & Seating</Link></li>
                <li><Link to="/home" className="hover:text-[#B8865B] transition-colors">Home Decor & Lighting</Link></li>
                <li><Link to="/home" className="hover:text-[#B8865B] transition-colors">Smart Electronics</Link></li>
                <li><Link to="/home" className="hover:text-[#B8865B] transition-colors">Modern Appliances</Link></li>
              </ul>
            </div>

            {/* Support & Top */}
            <div className="flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-4">
                  Concierge Support
                </h4>
                <ul className="space-y-2.5 text-xs text-[#52525B]">
                  <li><button onClick={() => setShowTicketModal(true)} className="hover:text-[#B8865B] transition-colors">Submit Support Inquiry</button></li>
                  <li><span className="text-[#71717A]">Support Hours: 24/7 Priority</span></li>
                  <li><span className="text-[#71717A]">Email: concierge@marketbros.com</span></li>
                </ul>
              </div>

              <button
                onClick={scrollToTop}
                className="mt-6 self-start text-xs font-semibold text-[#1A1A1A] flex items-center gap-2 hover:text-[#B8865B] transition-colors"
              >
                <span>Back to top</span>
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
            <div>© 2026 MARKET BROS MARKETPLACE. ALL RIGHTS RESERVED.</div>
            <div className="flex gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Crafto Design System</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Crafto Concierge Support Modal */}
      <Dialog open={showTicketModal} onClose={() => setShowTicketModal(false)}>
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl text-[#1A1A1A] p-8 max-w-lg w-full shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif-editorial text-2xl font-bold text-[#1A1A1A]">
              Market Bros Concierge
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B6B6B] mt-1">
              Have questions about an order, custom lifestyle specs, or merchant inquiries? Our team is available 24/7.
            </DialogDescription>
          </DialogHeader>

          {ticketMessage ? (
            <div className={cn(
              "p-4 text-center text-xs font-semibold rounded-xl my-4 border",
              ticketMessage.includes("successfully")
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            )}>
              {ticketMessage}
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                  Inquiry Subject*
                </label>
                <input
                  type="text"
                  value={ticket.subject}
                  onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                  placeholder="e.g. Order Tracking or Product Customization"
                  className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                  Message Details*
                </label>
                <textarea
                  value={ticket.body}
                  onChange={(e) => setTicket({ ...ticket, body: e.target.value })}
                  rows={4}
                  className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
                  placeholder="Provide any details regarding your request..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="flex-1 py-3 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="flex-1 py-3 bg-[#B8865B] text-white font-semibold text-xs rounded-xl hover:bg-[#9E7047] transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  {submittingTicket ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </Dialog>
    </div>
  );
}