import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  LifeBuoy,
  LogOut,
  Menu,
  X,
  Send,
  Loader2,
  ArrowUp,
  ExternalLink,
  ChevronRight
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
    setNewsletterStatus("Signed up for newsletter!");
    setNewsletterEmail("");
    setTimeout(() => setNewsletterStatus(""), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { name: "MARKETPLACE", path: "/home" },
    { name: "ORDERS", path: "/orders" },
    { name: "WISHLIST", path: "/wishlist" },
    { name: "SUPPORT", path: "/support_tickets" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0f0e13] text-[#f3f3f5] flex flex-col font-sans selection:bg-[#d4a373] selection:text-black">
      {/* DeLorean Style Navbar */}
      <header className="sticky top-0 z-50 w-full bg-[#0f0e13]/90 backdrop-blur-md border-b border-[#282630]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand Logo & Main Links */}
          <div className="flex items-center gap-8">
            <Link to="/home" className="flex items-center gap-3 group">
              <div className="h-9 w-9 bg-white text-black flex items-center justify-center font-mono-tech font-bold text-lg tracking-tighter group-hover:bg-[#d4a373] transition-colors">
                FW
              </div>
              <span className="font-display font-bold text-lg sm:text-xl tracking-wider uppercase text-white">
                FURNITURE <span className="text-[#d4a373]">WALEY</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "text-xs font-mono-tech tracking-wider transition-colors uppercase py-1 border-b-2",
                      isActive
                        ? "text-white border-[#d4a373]"
                        : "text-[#a19fad] border-transparent hover:text-white"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="hidden sm:flex items-center gap-4">
            <button
              onClick={() => setShowTicketModal(true)}
              className="px-3.5 py-2 text-[11px] font-mono-tech tracking-wider uppercase bg-[#1c1b22] border border-[#282630] text-[#d4a373] hover:bg-[#282630] hover:text-white transition-colors"
            >
              INQUIRE / CONCIERGE
            </button>

            <Link to="/cart">
              <button className="px-4 py-2 text-[11px] font-mono-tech tracking-wider uppercase bg-[#1c1b22] border border-[#282630] text-white hover:border-[#d4a373] transition-all flex items-center gap-2">
                <ShoppingCart className="h-3.5 w-3.5 text-[#d4a373]" />
                <span>CART</span>
              </button>
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                {user.role === "admin" && (
                  <Link to="/admin/dashboard">
                    <button className="px-3 py-2 text-[11px] font-mono-tech tracking-wider uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20">
                      ADMIN PORTAL
                    </button>
                  </Link>
                )}
                {user.role === "seller" && (
                  <Link to="/seller/dashboard">
                    <button className="px-3 py-2 text-[11px] font-mono-tech tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20">
                      SELLER PORTAL
                    </button>
                  </Link>
                )}
                <div className="text-right hidden md:block">
                  <div className="text-xs font-mono-tech text-white uppercase">{user.first_name || "User"}</div>
                  <div className="text-[10px] font-mono-tech text-[#d4a373] uppercase tracking-widest">{user.role || "Member"}</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 border border-[#282630] bg-[#1c1b22] text-[#6c697b] hover:text-red-400 hover:border-red-500/40 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <button className="px-4 py-2 text-[11px] font-mono-tech tracking-wider uppercase border border-[#282630] bg-[#16151a] text-white hover:bg-[#282630] transition-colors">
                    LOG IN
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-4 py-2 text-[11px] font-mono-tech tracking-wider uppercase bg-white text-black font-semibold hover:bg-[#d4a373] transition-colors">
                    REGISTER
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden px-3 py-1.5 border border-[#282630] bg-[#16151a] text-xs font-mono-tech uppercase tracking-wider text-white flex items-center gap-2"
          >
            {mobileNavOpen ? (
              <>
                <X className="h-4 w-4 text-[#d4a373]" />
                <span>CLOSE</span>
              </>
            ) : (
              <>
                <Menu className="h-4 w-4 text-[#d4a373]" />
                <span>MENU</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-[#282630] bg-[#16151a] p-6 space-y-4">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileNavOpen(false)}
                  className="text-sm font-mono-tech uppercase tracking-widest text-[#a19fad] hover:text-white py-2 border-b border-[#282630] flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="h-4 w-4 text-[#d4a373]" />
                </Link>
              ))}
              <Link
                to="/cart"
                onClick={() => setMobileNavOpen(false)}
                className="text-sm font-mono-tech uppercase tracking-widest text-[#d4a373] py-2 border-b border-[#282630] flex items-center justify-between"
              >
                <span>CART</span>
                <ShoppingCart className="h-4 w-4" />
              </Link>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="text-xs font-mono-tech text-[#a19fad]">
                    LOGGED IN AS: <span className="text-white font-bold">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileNavOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono-tech uppercase tracking-wider"
                  >
                    LOG OUT
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" onClick={() => setMobileNavOpen(false)}>
                    <button className="w-full py-2.5 border border-[#282630] bg-[#0f0e13] text-xs font-mono-tech uppercase tracking-wider text-white">
                      LOG IN
                    </button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileNavOpen(false)}>
                    <button className="w-full py-2.5 bg-white text-black text-xs font-mono-tech uppercase tracking-wider font-semibold">
                      REGISTER
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* DeLorean Style Footer */}
      <footer className="w-full bg-[#0b0a0e] border-t border-[#282630] text-[#a19fad]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Newsletter Box */}
          <div className="border border-[#282630] bg-[#16151a] p-8 md:p-12 mb-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373] block mb-2">
                NEWSLETTER
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-wide text-white mb-2">
                SUBSCRIBE TO GET THE LATEST FURNITURE WALEY UPDATES
              </h3>
              <p className="text-xs font-mono-tech text-[#6c697b]">
                Receive exclusive releases, handcrafted slot arrivals, and luxury market insights.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Email@domain.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="bg-[#0f0e13] border border-[#282630] px-4 py-3 text-xs font-mono-tech text-white placeholder-[#6c697b] focus:outline-none focus:border-[#d4a373] min-w-[280px]"
              />
              <button
                type="submit"
                className="bg-white text-black font-mono-tech font-bold text-xs uppercase px-6 py-3 hover:bg-[#d4a373] transition-colors"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>

          {newsletterStatus && (
            <div className="mb-8 p-3 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono-tech uppercase tracking-wider text-center">
              {newsletterStatus}
            </div>
          )}

          {/* Links & Brand Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-[#282630]">
            {/* Brand Header */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-white text-black flex items-center justify-center font-mono-tech font-bold text-base">
                  FW
                </div>
                <span className="font-display font-bold text-lg uppercase tracking-wider text-white">
                  FURNITURE <span className="text-[#d4a373]">WALEY</span>
                </span>
              </div>
              <p className="text-xs font-mono-tech leading-relaxed text-[#6c697b]">
                The official Marketplace for premier artisanal furniture, bespoke build slots, and luxury interior craftsmanship.
              </p>
            </div>

            {/* Content Column */}
            <div>
              <h4 className="text-xs font-mono-tech uppercase tracking-widest text-white mb-6">
                CONTENT
              </h4>
              <ul className="space-y-3 text-xs font-mono-tech">
                <li><Link to="/home" className="hover:text-white transition-colors">MARKETPLACE</Link></li>
                <li><Link to="/wishlist" className="hover:text-white transition-colors">WISHLIST</Link></li>
                <li><Link to="/orders" className="hover:text-white transition-colors">MY ORDERS</Link></li>
                <li><Link to="/support_tickets" className="hover:text-white transition-colors">SUPPORT & FAQ</Link></li>
              </ul>
            </div>

            {/* Social Column */}
            <div>
              <h4 className="text-xs font-mono-tech uppercase tracking-widest text-white mb-6">
                SOCIAL
              </h4>
              <ul className="space-y-3 text-xs font-mono-tech">
                <li><a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">TWITTER/X</a></li>
                <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">INSTAGRAM</a></li>
                <li><a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">YOUTUBE</a></li>
                <li><a href="https://discord.gg" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">DISCORD</a></li>
              </ul>
            </div>

            {/* Legal Column & Back to Top */}
            <div className="flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-mono-tech uppercase tracking-widest text-white mb-6">
                  LEGAL & CORPORATE
                </h4>
                <ul className="space-y-3 text-xs font-mono-tech">
                  <li><span className="text-[#6c697b] uppercase">PRIVACY POLICY</span></li>
                  <li><span className="text-[#6c697b] uppercase">TERMS & CONDITIONS</span></li>
                  <li><span className="text-[#6c697b] uppercase">FURNITUREWALEY.COM</span></li>
                </ul>
              </div>

              <button
                onClick={scrollToTop}
                className="mt-8 self-start text-xs font-mono-tech text-white uppercase tracking-wider flex items-center gap-2 hover:text-[#d4a373] transition-colors"
              >
                <span>BACK TO TOP</span>
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono-tech text-[#6c697b]">
            <div>© 2026 FURNITURE WALEY. ALL RIGHTS RESERVED.</div>
            <div>DESIGNED & ENGINEERED WITH DELOREAN MARKETPLACE DESIGN SYSTEM</div>
          </div>
        </div>
      </footer>

      {/* Concierge Modal */}
      <Dialog open={showTicketModal} onClose={() => setShowTicketModal(false)}>
        <div className="bg-[#16151a] border border-[#282630] text-white p-6 max-w-lg w-full">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold uppercase tracking-wider text-white">
              FURNITURE WALEY CONCIERGE
            </DialogTitle>
            <DialogDescription className="text-xs font-mono-tech text-[#a19fad]">
              Contact our design concierge for bespoke orders, delivery inquiry, or slot allocation support.
            </DialogDescription>
          </DialogHeader>

          {ticketMessage ? (
            <div className={cn(
              "p-4 text-center text-xs font-mono-tech uppercase my-4 border",
              ticketMessage.includes("successfully")
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            )}>
              {ticketMessage}
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4 my-4">
              <div>
                <label className="block text-[11px] font-mono-tech uppercase tracking-widest text-[#a19fad] mb-1">
                  INQUIRY SUBJECT*
                </label>
                <input
                  type="text"
                  value={ticket.subject}
                  onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                  placeholder="e.g. Custom Wood Finish or Order Status"
                  className="w-full bg-[#0f0e13] border border-[#282630] px-3 py-2 text-xs font-mono-tech text-white focus:outline-none focus:border-[#d4a373]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono-tech uppercase tracking-widest text-[#a19fad] mb-1">
                  MESSAGE DETAILS*
                </label>
                <textarea
                  value={ticket.body}
                  onChange={(e) => setTicket({ ...ticket, body: e.target.value })}
                  rows={4}
                  className="w-full bg-[#0f0e13] border border-[#282630] px-3 py-2 text-xs font-mono-tech text-white focus:outline-none focus:border-[#d4a373]"
                  placeholder="Describe your inquiry..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="flex-1 py-2.5 border border-[#282630] bg-[#0f0e13] text-xs font-mono-tech text-white uppercase tracking-wider"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="flex-1 py-2.5 bg-white text-black font-mono-tech font-bold text-xs uppercase tracking-wider hover:bg-[#d4a373] transition-colors flex items-center justify-center gap-2"
                >
                  {submittingTicket ? (
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>SUBMIT INQUIRY</span>
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