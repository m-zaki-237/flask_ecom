import { useState } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar, { AdminSidebarContent } from "./AdminSidebar";
import { Menu } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";

const pageTitles = {
  "/admin/dashboard": "SYSTEM OVERVIEW & STATS",
  "/admin/products": "GLOBAL CATALOG & BUILD SLOTS",
  "/admin/orders": "GLOBAL ORDERS MANAGEMENT",
  "/admin/payments": "SYSTEM PAYMENT SETTLEMENTS",
  "/admin/users": "USER ACCOUNTS & SELLERS",
  "/admin/audit_logs": "SECURITY & AUDIT LOGS",
  "/admin/support_tickets": "SUPPORT & TICKETS CONCIERGE",
};

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] || "ADMIN CONTROL PORTAL";

  return (
    <div className="flex min-h-screen bg-[#0f0e13] text-[#f3f3f5] font-sans selection:bg-[#d4a373] selection:text-black">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)} side="left">
        <div className="w-64 h-full bg-[#16151a]">
          <AdminSidebarContent onNavClick={() => setMobileOpen(false)} />
        </div>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#282630] bg-[#0f0e13]/90 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 border border-[#282630] bg-[#16151a] text-white"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4 text-[#d4a373]" />
            </button>

            <h1 className="text-sm font-mono-tech uppercase font-bold tracking-wider text-white">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-tech">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="uppercase text-emerald-400">ADMIN CONTROL ACTIVE</span>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;