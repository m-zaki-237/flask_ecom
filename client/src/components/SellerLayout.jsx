import { useState } from "react";
import { useLocation } from "react-router-dom";
import SellerSidebar, { SellerSidebarContent } from "./SellerSidebar";
import { Menu, X } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";

const pageTitles = {
  "/seller/dashboard": "Merchant Overview & Performance",
  "/seller/products": "Product Catalog & Inventory",
  "/seller/orders": "Merchant Orders & Dispatch",
  "/seller/payments": "Payouts & Settlement History",
};

const SellerLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] || "Seller Portal";

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] text-[#1A1A1A] font-sans selection:bg-[#B8865B] selection:text-white">
      {/* Desktop Sidebar */}
      <SellerSidebar />

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)} side="left">
        <div className="w-64 h-full bg-[#FFFFFF]">
          <SellerSidebarContent onNavClick={() => setMobileOpen(false)} />
        </div>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
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

          <div className="flex items-center gap-2 text-xs font-semibold text-[#16A34A] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span>Merchant Active</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;