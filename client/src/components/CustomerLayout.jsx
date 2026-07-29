import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useState } from "react";
import {
  ShoppingBag,
  Home,
  ShoppingCart,
  PackageCheck,
  Heart,
  LifeBuoy,
  LogOut,
  Menu,
  X,
  Send,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function CustomerLayout({ children }) {
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticket, setTicket] = useState({ subject: "", body: "" });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketMessage, setTicketMessage] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

      setTicketMessage("Ticket submitted successfully!");
      setTicket({ subject: "", body: "" });

      setTimeout(() => {
        setShowTicketModal(false);
        setTicketMessage("");
      }, 1500);
    } catch (err) {
      setTicketMessage(err.response?.data?.error || "Failed to submit ticket");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/home", icon: Home },
    { name: "Cart", path: "/cart", icon: ShoppingCart },
    { name: "Orders", path: "/orders", icon: PackageCheck },
    { name: "Wishlist", path: "/wishlist", icon: Heart },
    { name: "Support", path: "/support_tickets", icon: LifeBuoy },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 font-bold text-lg text-blue-600">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <span className="text-slate-900 font-extrabold tracking-tight">Shop</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-100 text-blue-600 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-400")} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Controls & Profile */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTicketModal(true)}
                  className="hidden sm:inline-flex text-xs h-8"
                >
                  Contact Support
                </Button>

                <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                  Hi, {user.first_name}
                </span>

                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  size="sm"
                  className="h-8 text-xs font-semibold"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="h-8 text-xs font-semibold">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-700 h-8 w-8"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white p-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                    isActive ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMobileNavOpen(false);
                setShowTicketModal(true);
              }}
              className="w-full text-xs mt-2"
            >
              Contact Support
            </Button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Support Ticket Modal Dialog */}
      <Dialog open={showTicketModal} onClose={() => setShowTicketModal(false)}>
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
          <DialogDescription>
            Submit your question or issue to our support team.
          </DialogDescription>
        </DialogHeader>

        {ticketMessage ? (
          <div className={cn(
            "p-3 rounded-md text-center text-xs font-semibold my-2",
            ticketMessage.includes("successfully") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
          )}>
            {ticketMessage}
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket} className="space-y-4 my-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject
              </label>
              <Input
                type="text"
                value={ticket.subject}
                onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                placeholder="What's the issue?"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={ticket.body}
                onChange={(e) => setTicket({ ...ticket, body: e.target.value })}
                rows={4}
                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-2xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                placeholder="Describe your issue..."
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTicketModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submittingTicket}
                className="flex-1 gap-2"
              >
                {submittingTicket ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}