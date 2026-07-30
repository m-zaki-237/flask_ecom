import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/axios";
import { Users, Package, ShoppingBag, CreditCard, ArrowRight, LifeBuoy, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [data, setData] = useState({
    users: [],
    products: [],
    orders: [],
    payments: [],
    tickets: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, productsRes, ordersRes, paymentsRes, ticketsRes] = await Promise.all([
          api.get("/users").catch(() => ({ data: [] })),
          api.get("/product").catch(() => ({ data: { products: [] } })),
          api.get("/orders").catch(() => ({ data: { orders: [] } })),
          api.get("/payments").catch(() => ({ data: { payments: [] } })),
          api.get("/support_tickets").catch(() => ({ data: { support_tickets: [] } })),
        ]);

        setData({
          users: Array.isArray(usersRes.data) ? usersRes.data : [],
          products: productsRes.data?.products || [],
          orders: ordersRes.data?.orders || [],
          payments: paymentsRes.data?.payments || [],
          tickets: ticketsRes.data?.support_tickets || [],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: "Registered Platform Users", value: data.users.length, icon: Users, path: "/admin/users" },
    { label: "Global Catalog Products", value: data.products.length, icon: Package, path: "/admin/products" },
    { label: "Total Marketplace Orders", value: data.orders.length, icon: ShoppingBag, path: "/admin/orders" },
    { label: "Settled System Payments", value: data.payments.length, icon: CreditCard, path: "/admin/payments" },
  ];

  const recentOrders = data.orders.slice(0, 5);
  const pendingTickets = data.tickets.filter((t) => t.status === "open" || t.status === "pending" || t.status === "in-progress").slice(0, 5);

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
      <AdminLayout>
        <div className="space-y-6 animate-pulse py-6">
          <div className="h-8 w-48 bg-[#E8E5DF] rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-[#FFFFFF] rounded-2xl border border-[#E8E5DF]" />
            ))}
          </div>
          <div className="h-64 bg-[#FFFFFF] rounded-2xl border border-[#E8E5DF]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">SYSTEM MONITOR</span>
            <h1 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A] mt-1">
              Admin Platform Dashboard
            </h1>
          </div>
        </div>

        {/* Top Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Data Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Orders Table */}
          <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#E8E5DF] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A]">Recent Marketplace Orders</h3>
                <span className="text-xs text-[#6B6B6B]">Latest customer purchases across platform</span>
              </div>
              <button
                onClick={() => navigate("/admin/orders")}
                className="text-xs font-semibold text-[#B8865B] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#71717A]">No order records found in database.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E8E5DF] text-[#71717A] uppercase bg-[#F8F7F4]">
                      <th className="p-4 font-bold">Order ID</th>
                      <th className="p-4 font-bold">Buyer ID</th>
                      <th className="p-4 font-bold">Amount</th>
                      <th className="p-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E5DF]">
                    {recentOrders.map((o) => (
                      <tr key={o.order_id} className="hover:bg-[#F8F7F4] text-[#1A1A1A] transition-colors">
                        <td className="p-4 font-bold">#{o.order_id}</td>
                        <td className="p-4 text-[#52525B]">User #{o.user_id}</td>
                        <td className="p-4 text-[#B8865B] font-bold">${parseFloat(o.total_amount || 0).toFixed(2)} USD</td>
                        <td className="p-4">{getOrderStatusChip(o.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pending Support Tickets */}
          <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#E8E5DF] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <LifeBuoy className="h-5 w-5 text-[#B8865B]" />
                <div>
                  <h3 className="text-base font-bold text-[#1A1A1A]">Open Support Tickets</h3>
                  <span className="text-xs text-[#6B6B6B]">Pending customer concierge inquiries</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/admin/support_tickets")}
                className="text-xs font-semibold text-[#B8865B] hover:underline flex items-center gap-1"
              >
                <span>Manage Tickets</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {pendingTickets.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#71717A]">No open support tickets.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E8E5DF] text-[#71717A] uppercase bg-[#F8F7F4]">
                      <th className="p-4 font-bold">Ticket ID</th>
                      <th className="p-4 font-bold">Subject</th>
                      <th className="p-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E5DF]">
                    {pendingTickets.map((t) => (
                      <tr key={t.ticket_id} className="hover:bg-[#F8F7F4] text-[#1A1A1A] transition-colors">
                        <td className="p-4 font-bold">#{t.ticket_id}</td>
                        <td className="p-4 font-medium truncate max-w-[200px]">{t.subject}</td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full uppercase">
                            {t.status || "Open"}
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
    </AdminLayout>
  );
};

export default Dashboard;
