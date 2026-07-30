import { useState, useEffect } from "react";
import api from "../../api/axios";
import SellerLayout from "../../components/SellerLayout";
import { Package, ShoppingBag, CreditCard, Plus, ArrowRight, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SellerDashboard = () => {
  const [data, setData] = useState({
    products: [],
    orders: [],
    payments: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const [productsRes, ordersRes, paymentsRes] = await Promise.all([
          api.get("/seller/products").catch(() => ({ data: { products: [] } })),
          api.get("/seller/orders").catch(() => ({ data: { orders: [] } })),
          api.get("/seller/payments").catch(() => ({ data: { payments: [] } })),
        ]);

        setData({
          products: productsRes.data?.products || [],
          orders: ordersRes.data?.orders || [],
          payments: paymentsRes.data?.payments || [],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  const statCards = [
    {
      label: "MY PRODUCTS / SLOTS",
      value: data.products.length,
      icon: Package,
      path: "/seller/products",
    },
    {
      label: "CUSTOMER ORDERS",
      value: data.orders.length,
      icon: ShoppingBag,
      path: "/seller/orders",
    },
    {
      label: "COMPLETED PAYOUTS",
      value: data.payments.length,
      icon: CreditCard,
      path: "/seller/payments",
    },
  ];

  const recentOrders = data.orders.slice(0, 5);
  const lowStockProducts = data.products.filter((p) => p.stock <= 5).slice(0, 5);

  const getOrderStatusChip = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "pending": return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono-tech uppercase">PENDING</span>;
      case "processing": return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] font-mono-tech uppercase">PROCESSING</span>;
      case "shipped": return <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[10px] font-mono-tech uppercase">SHIPPED</span>;
      case "delivered": return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono-tech uppercase">DELIVERED</span>;
      default: return <span className="px-2 py-0.5 bg-[#282630] text-white text-[10px] font-mono-tech uppercase">{status}</span>;
    }
  };

  if (loading) {
    return (
      <SellerLayout>
        <div className="space-y-6 animate-pulse font-mono-tech">
          <div className="h-8 w-48 bg-[#16151a]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-[#16151a] border border-[#282630]" />
            ))}
          </div>
          <div className="h-64 bg-[#16151a] border border-[#282630]" />
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="space-y-8 pb-16 font-mono-tech">
        {/* Header */}
        <div className="border border-[#282630] bg-[#16151a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373]">MERCHANT OVERVIEW</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mt-1">
              STORE DASHBOARD
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/seller/products")}
              className="px-4 py-2.5 bg-white text-black font-mono-tech font-bold text-xs uppercase hover:bg-[#d4a373] transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>ADD NEW PRODUCT</span>
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                onClick={() => navigate(card.path)}
                className="cursor-pointer border border-[#282630] bg-[#16151a] hover:border-white p-6 transition-all flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <span className="text-[10px] text-[#6c697b] uppercase tracking-widest block">{card.label}</span>
                  <span className="text-3xl font-bold text-white tracking-tight">{card.value}</span>
                </div>
                <div className="p-3 bg-[#0f0e13] border border-[#282630] text-[#d4a373] group-hover:border-[#d4a373] transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="border border-[#282630] bg-[#16151a] overflow-hidden">
            <div className="p-5 border-b border-[#282630] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase text-white">RECENT STORE ORDERS</h3>
                <span className="text-[11px] text-[#6c697b]">Client purchases for your products</span>
              </div>
              <button
                onClick={() => navigate("/seller/orders")}
                className="text-xs text-[#d4a373] uppercase hover:underline flex items-center gap-1"
              >
                <span>VIEW ALL</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6c697b]">NO ORDERS RECEIVED YET.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#282630] text-[#6c697b] uppercase bg-[#0f0e13]">
                      <th className="p-3 font-bold">ORDER ID</th>
                      <th className="p-3 font-bold">CUSTOMER</th>
                      <th className="p-3 font-bold">PRODUCT</th>
                      <th className="p-3 font-bold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#282630]">
                    {recentOrders.map((o) => (
                      <tr key={o.order_id} className="hover:bg-[#1c1b22] text-white">
                        <td className="p-3 font-bold">#{o.order_id}</td>
                        <td className="p-3 text-[#a19fad]">{o.customer_name || "Customer"}</td>
                        <td className="p-3 font-medium uppercase">{o.product_name || "Product"}</td>
                        <td className="p-3">{getOrderStatusChip(o.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Low Stock Inventory */}
          <div className="border border-[#282630] bg-[#16151a] overflow-hidden">
            <div className="p-5 border-b border-[#282630] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold uppercase text-white">LOW STOCK ALERTS</h3>
                  <span className="text-[11px] text-[#6c697b]">Products with 5 or fewer items remaining</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/seller/products")}
                className="text-xs text-[#d4a373] uppercase hover:underline flex items-center gap-1"
              >
                <span>MANAGE STOCK</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6c697b]">ALL INVENTORY LEVELS ARE HEALTHY.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#282630] text-[#6c697b] uppercase bg-[#0f0e13]">
                      <th className="p-3 font-bold">PRODUCT NAME</th>
                      <th className="p-3 font-bold">PRICE</th>
                      <th className="p-3 font-bold">STOCK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#282630]">
                    {lowStockProducts.map((p) => (
                      <tr key={p.product_id} className="hover:bg-[#1c1b22] text-white">
                        <td className="p-3 font-bold uppercase">{p.product_name}</td>
                        <td className="p-3 text-[#d4a373]">${parseFloat(p.price).toFixed(2)} USD</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] uppercase font-bold">
                            {p.stock} REMAINING
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerDashboard;
