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
      label: "My Products & Inventory",
      value: data.products.length,
      icon: Package,
      path: "/seller/products",
    },
    {
      label: "Customer Orders Received",
      value: data.orders.length,
      icon: ShoppingBag,
      path: "/seller/orders",
    },
    {
      label: "Completed Payout Transactions",
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
      case "pending": return <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full uppercase">Pending</span>;
      case "processing": return <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-full uppercase">Processing</span>;
      case "shipped": return <span className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold rounded-full uppercase">Dispatched</span>;
      case "delivered": return <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full uppercase">Delivered</span>;
      default: return <span className="px-3 py-1 bg-[#F8F7F4] text-[#1A1A1A] border border-[#E8E5DF] text-xs font-bold rounded-full uppercase">{status}</span>;
    }
  };

  if (loading) {
    return (
      <SellerLayout>
        <div className="space-y-6 animate-pulse py-6">
          <div className="h-8 w-48 bg-[#E8E5DF] rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-[#FFFFFF] rounded-2xl border border-[#E8E5DF]" />
            ))}
          </div>
          <div className="h-64 bg-[#FFFFFF] rounded-2xl border border-[#E8E5DF]" />
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="space-y-8 pb-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">MERCHANT CONSOLE</span>
            <h1 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A] mt-1">
              Store Dashboard & Analytics
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/seller/products")}
              className="px-6 py-3 bg-[#1A1A1A] text-white font-semibold text-xs rounded-xl hover:bg-[#B8865B] transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Product</span>
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
                className="cursor-pointer bg-white rounded-2xl border border-[#E8E5DF] crafto-card-shadow-hover p-6 flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[#71717A] block">{card.label}</span>
                  <span className="text-3xl font-bold font-display text-[#1A1A1A]">{card.value}</span>
                </div>
                <div className="p-3.5 bg-[#F4EFEA] text-[#B8865B] rounded-xl group-hover:bg-[#B8865B] group-hover:text-white transition-all shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#E8E5DF] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A]">Recent Merchant Orders</h3>
                <span className="text-xs text-[#6B6B6B]">Customer purchases allocated to your catalog</span>
              </div>
              <button
                onClick={() => navigate("/seller/orders")}
                className="text-xs font-semibold text-[#B8865B] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#71717A]">No store orders received yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E8E5DF] text-[#71717A] uppercase bg-[#F8F7F4]">
                      <th className="p-4 font-bold">Order ID</th>
                      <th className="p-4 font-bold">Customer</th>
                      <th className="p-4 font-bold">Product</th>
                      <th className="p-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E5DF]">
                    {recentOrders.map((o) => (
                      <tr key={o.order_id} className="hover:bg-[#F8F7F4] text-[#1A1A1A] transition-colors">
                        <td className="p-4 font-bold">#{o.order_id}</td>
                        <td className="p-4 text-[#52525B]">{o.customer_name || "Customer"}</td>
                        <td className="p-4 font-semibold">{o.product_name || "Product"}</td>
                        <td className="p-4">{getOrderStatusChip(o.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Low Stock Inventory */}
          <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#E8E5DF] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <h3 className="text-base font-bold text-[#1A1A1A]">Low Inventory Alerts</h3>
                  <span className="text-xs text-[#6B6B6B]">Products with 5 or fewer units remaining</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/seller/products")}
                className="text-xs font-semibold text-[#B8865B] hover:underline flex items-center gap-1"
              >
                <span>Manage Stock</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#71717A]">All product stock levels are healthy.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E8E5DF] text-[#71717A] uppercase bg-[#F8F7F4]">
                      <th className="p-4 font-bold">Product Name</th>
                      <th className="p-4 font-bold">Price</th>
                      <th className="p-4 font-bold">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E5DF]">
                    {lowStockProducts.map((p) => (
                      <tr key={p.product_id} className="hover:bg-[#F8F7F4] text-[#1A1A1A] transition-colors">
                        <td className="p-4 font-semibold">{p.product_name}</td>
                        <td className="p-4 text-[#B8865B] font-bold">${parseFloat(p.price).toFixed(2)} USD</td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full">
                            {p.stock} Units Left
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
