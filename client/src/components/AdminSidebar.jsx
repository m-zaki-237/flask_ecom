import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  CreditCard,
  Users,
  FileText,
  LifeBuoy,
  LogOut,
  ChevronRight,
  ArrowLeft,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { name: "Overview Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Global Catalogue", path: "/admin/products", icon: Package },
  { name: "Global Orders", path: "/admin/orders", icon: ShoppingBag },
  { name: "System Payments", path: "/admin/payments", icon: CreditCard },
  { name: "Users & Sellers", path: "/admin/users", icon: Users },
  { name: "Audit & System Logs", path: "/admin/audit_logs", icon: FileText },
  { name: "Support & Concierge", path: "/admin/support_tickets", icon: LifeBuoy },
];

export const AdminSidebarContent = ({ onNavClick }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (firstName, lastName) => {
    const f = firstName ? firstName[0] : "A";
    const l = lastName ? lastName[0] : "D";
    return (f + l).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#1A1A1A] border-r border-[#E8E5DF]">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#E8E5DF] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#B8865B] text-white font-display font-bold text-lg flex items-center justify-center rounded-xl shadow-sm">
            MB
          </div>
          <div>
            <h1 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A]">ADMIN SYSTEM</h1>
            <p className="text-[10px] text-[#B8865B] font-semibold uppercase">MARKET BROS CONTROLLER</p>
          </div>
        </div>
      </div>

      {/* Back to Marketplace Link */}
      <div className="px-4 py-3 bg-[#F8F7F4] border-b border-[#E8E5DF]">
        <Link
          to="/home"
          className="text-xs font-semibold text-[#52525B] hover:text-[#B8865B] flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-[#B8865B]" />
          <span>Customer Marketplace</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-[#71717A] uppercase tracking-widest">
          Administrative Control
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;

          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all",
                isActive
                  ? "bg-[#1A1A1A] text-white shadow-sm"
                  : "text-[#52525B] hover:text-[#1A1A1A] hover:bg-[#F8F7F4]"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-[#B8865B]" : "text-[#71717A]")} />
              <span className="flex-1">{link.name}</span>
              {isActive && <ChevronRight className="h-4 w-4 text-[#B8865B]" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-5 border-t border-[#E8E5DF] bg-[#F8F7F4] space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-white border border-[#E8E5DF] text-[#B8865B] font-bold text-xs flex items-center justify-center rounded-xl shadow-sm">
            {getInitials(user?.first_name, user?.last_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#1A1A1A] truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-[10px] text-[#B8865B] font-bold uppercase">Super Administrator</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out Controller</span>
        </button>
      </div>
    </div>
  );
};

const AdminSidebar = () => {
  return (
    <aside className="hidden lg:block w-64 min-h-screen sticky top-0 h-screen shrink-0">
      <AdminSidebarContent />
    </aside>
  );
};

export default AdminSidebar;
