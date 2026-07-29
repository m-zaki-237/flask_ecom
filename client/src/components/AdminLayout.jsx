import { useState } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar, { AdminSidebarContent } from "./AdminSidebar";
import { Menu } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const pageTitles = {
  "/admin/dashboard": "Dashboard Overview",
  "/admin/products": "Products Catalog",
  "/admin/orders": "Orders Management",
  "/admin/payments": "Payments History",
  "/admin/users": "User Accounts",
  "/admin/audit_logs": "Audit Logs",
  "/admin/support_tickets": "Support Tickets",
};

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] || "Admin Panel";

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)} side="left">
        <AdminSidebarContent onNavClick={() => setMobileOpen(false)} />
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-600 hover:text-slate-900"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              {currentTitle}
            </h1>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;