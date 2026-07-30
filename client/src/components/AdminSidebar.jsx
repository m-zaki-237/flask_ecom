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
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { name: "DASHBOARD", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "PRODUCTS", path: "/admin/products", icon: Package },
  { name: "ORDERS", path: "/admin/orders", icon: ShoppingBag },
  { name: "PAYMENTS", path: "/admin/payments", icon: CreditCard },
  { name: "USERS & SELLERS", path: "/admin/users", icon: Users },
  { name: "AUDIT LOGS", path: "/admin/audit_logs", icon: FileText },
  { name: "SUPPORT TICKETS", path: "/admin/support_tickets", icon: LifeBuoy },
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
    <div className="flex flex-col h-full bg-[#16151a] text-[#f3f3f5] border-r border-[#282630] font-mono-tech">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#282630] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-white text-black font-mono-tech font-bold text-base flex items-center justify-center">
            FW
          </div>
          <div>
            <h1 className="font-bold text-xs uppercase tracking-wider text-white">ADMIN SYSTEM</h1>
            <p className="text-[10px] text-[#d4a373] uppercase">GLOBAL CONTROLLER</p>
          </div>
        </div>
      </div>

      {/* Back to Marketplace Link */}
      <div className="px-4 py-3 bg-[#0f0e13] border-b border-[#282630]">
        <Link
          to="/home"
          className="text-[11px] text-[#a19fad] hover:text-white uppercase tracking-wider flex items-center gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#d4a373]" />
          <span>CUSTOMER MARKETPLACE</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-[#6c697b] uppercase tracking-widest">
          ADMINISTRATIVE CONTROL
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
                "flex items-center gap-3 px-3.5 py-2.5 text-xs font-mono-tech uppercase tracking-wider transition-colors border-l-2",
                isActive
                  ? "bg-[#282630] text-white border-[#d4a373]"
                  : "text-[#a19fad] border-transparent hover:text-white hover:bg-[#1c1b22]"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-[#d4a373]" : "text-[#6c697b]")} />
              <span className="flex-1">{link.name}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 text-[#d4a373]" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-[#282630] bg-[#0f0e13] space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-[#282630] border border-[#d4a373] text-[#d4a373] font-bold text-xs flex items-center justify-center">
            {getInitials(user?.first_name, user?.last_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white uppercase truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-[10px] text-[#6c697b] uppercase">SUPER ADMIN</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2 border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-mono-tech uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>LOG OUT</span>
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
