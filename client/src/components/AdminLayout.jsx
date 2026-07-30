import { useState } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar, { AdminSidebarContent } from "./AdminSidebar";
import { Menu } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";

const pageTitles = {
  "/admin/dashboard": "Platform Overview & Performance Metrics",
  "/admin/products": "Global Marketplace Product Catalog",
  "/admin/orders": "Global Order Fulfillment & Tracking",
  "/admin/payments": "System Financial Settlements & Revenue",
  "/admin/users": "User Accounts & Verified Merchants",
  "/admin/audit_logs": "Security Audit & System Logs",
  "/admin/support_tickets": "Support & Concierge Inquiries",
};

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] || "Admin Control Portal";

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] text-[#1A1A1A] font-sans selection:bg-[#B8865B] selection:text-white">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)} side="left">
        <div className="w-64 h-full bg-[#FFFFFF]">
          <AdminSidebarContent onNavClick={() => setMobileOpen(false)} />
        </div>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E8E5DF] bg-white/90 backdrop-blur-md px-6 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 border border-[#E8E5DF] rounded-xl bg-[#F8F7F4] text-[#1A1A1A]"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5 text-[#B8865B]" />
            </button>

            <h1 className="text-base font-bold font-serif-editorial text-[#1A1A1A]">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
            <span>Admin Active</span>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;