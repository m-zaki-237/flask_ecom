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
  Store,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
  { name: "Payments", path: "/admin/payments", icon: CreditCard },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Audit Logs", path: "/admin/audit_logs", icon: FileText },
  { name: "Support Tickets", path: "/admin/support_tickets", icon: LifeBuoy },
];

export const AdminSidebarContent = ({ onNavClick }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (firstName, lastName) => {
    const f = firstName ? firstName[0] : "A";
    const l = lastName ? lastName[0] : "D";
    return (f + l).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-white text-[#0F172A] border-r border-[#E2E8F0]">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#E2E8F0] flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-[#2563EB] flex items-center justify-center text-white font-bold shadow-2xs">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-[#0F172A]">Admin Panel</h1>
          <p className="text-xs text-[#64748B] font-medium">Ecommerce Management</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
          Management
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
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#F1F5F9] text-[#2563EB] font-semibold border-r-2 border-[#2563EB]"
                  : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive ? "text-[#2563EB]" : "text-[#64748B]"
                )}
              />
              <span className="flex-1">{link.name}</span>
              {isActive && <ChevronRight className="h-4 w-4 text-[#2563EB]" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#E0F2FE] text-[#0369A1] font-bold text-xs flex items-center justify-center border border-[#BAE6FD]">
            {getInitials(user?.first_name, user?.last_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#0F172A] truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-[11px] text-[#64748B] truncate">{user?.role || "Admin"}</p>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-center text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEE2E2] text-xs font-semibold h-8"
        >
          <LogOut className="h-3.5 w-3.5 mr-1.5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

const AdminSidebar = () => {
  return (
    <aside className="hidden lg:block w-60 min-h-screen sticky top-0 h-screen shrink-0">
      <AdminSidebarContent />
    </aside>
  );
};

export default AdminSidebar;
