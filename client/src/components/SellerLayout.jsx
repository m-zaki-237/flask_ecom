import { useState } from "react";
import { useLocation } from "react-router-dom";
import SellerSidebar, { SellerSidebarContent } from "./SellerSidebar";
import { Menu, X } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";

const pageTitles = {
  "/seller/dashboard": "SELLER OVERVIEW & METRICS",
  "/seller/products": "CATALOGUE & BUILD SLOTS",
  "/seller/orders": "MERCHANT CUSTOMER ORDERS",
  "/seller/payments": "PAYOUTS & REVENUE",
};

const SellerLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] || "SELLER PORTAL";

  return (
    <div className="flex min-h-screen bg-[#0f0e13] text-[#f3f3f5] font-sans selection:bg-[#d4a373] selection:text-black">
      {/* Desktop Sidebar */}
      <SellerSidebar />

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)} side="left">
        <div className="w-64 h-full bg-[#16151a]">
          <SellerSidebarContent onNavClick={() => setMobileOpen(false)} />
        </div>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
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

          <div className="flex items-center gap-2 text-xs font-mono-tech text-[#6c697b]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="uppercase text-emerald-400">MERCHANT ONLINE</span>
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

export default SellerLayout;