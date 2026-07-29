import { useState } from "react";
import { useLocation } from "react-router-dom";
import SellerSidebar, { SellerSidebarContent } from "./SellerSidebar";
import { Menu } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const pageTitles = {
  "/seller/dashboard": "Store Dashboard",
  "/seller/products": "My Product Listings",
  "/seller/orders": "Customer Orders",
  "/seller/payments": "Earnings & Payouts",
};

const SellerLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] || "Seller Portal";

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <SellerSidebar />

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)} side="left">
        <SellerSidebarContent onNavClick={() => setMobileOpen(false)} />
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

export default SellerLayout;