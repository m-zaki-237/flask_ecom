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
    { label: "REGISTERED USERS", value: data.users.length, icon: Users, path: "/admin/users" },
    { label: "MARKETPLACE PRODUCTS", value: data.products.length, icon: Package, path: "/admin/products" },
    { label: "TOTAL ORDERS", value: data.orders.length, icon: ShoppingBag, path: "/admin/orders" },
    { label: "SETTLED PAYMENTS", value: data.payments.length, icon: CreditCard, path: "/admin/payments" },
  ];

  const recentOrders = data.orders.slice(0, 5);
  const lowStockProducts = data.products.filter((p) => p.stock <= 5).slice(0, 5);
  const pendingTickets = data.tickets.filter((t) => t.status === "open" || t.status === "pending" || t.status === "in-progress").slice(0, 5);

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
      <AdminLayout>
        <div className="space-y-6 animate-pulse font-mono-tech">
          <div className="h-8 w-48 bg-[#16151a]" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-[#16151a] border border-[#282630]" />
            ))}
          </div>
          <div className="h-64 bg-[#16151a] border border-[#282630]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16 font-mono-tech">
        {/* Header */}
        <div className="border border-[#282630] bg-[#16151a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373]">GLOBAL SYSTEM MONITOR</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mt-1">
              ADMIN DASHBOARD OVERVIEW
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

        {/* Real Data Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders Table */}
          <div className="border border-[#282630] bg-[#16151a] overflow-hidden">
            <div className="p-5 border-b border-[#282630] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase text-white">RECENT MARKETPLACE ORDERS</h3>
                <span className="text-[11px] text-[#6c697b]">Latest platform transactions</span>
              </div>
              <button
                onClick={() => navigate("/admin/orders")}
                className="text-xs text-[#d4a373] uppercase hover:underline flex items-center gap-1"
              >
                <span>VIEW ALL</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6c697b]">NO ORDERS IN SYSTEM RECORD.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#282630] text-[#6c697b] uppercase bg-[#0f0e13]">
                      <th className="p-3 font-bold">ORDER ID</th>
                      <th className="p-3 font-bold">BUYER ID</th>
                      <th className="p-3 font-bold">AMOUNT</th>
                      <th className="p-3 font-bold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#282630]">
                    {recentOrders.map((o) => (
                      <tr key={o.order_id} className="hover:bg-[#1c1b22] text-white">
                        <td className="p-3 font-bold">#{o.order_id}</td>
                        <td className="p-3 text-[#a19fad]">User #{o.user_id}</td>
                        <td className="p-3 text-[#d4a373]">${parseFloat(o.total_amount || 0).toFixed(2)} USD</td>
                        <td className="p-3">{getOrderStatusChip(o.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pending Support Tickets */}
          <div className="border border-[#282630] bg-[#16151a] overflow-hidden">
            <div className="p-5 border-b border-[#282630] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-[#d4a373]" />
                <div>
                  <h3 className="text-sm font-bold uppercase text-white">OPEN SUPPORT TICKETS</h3>
                  <span className="text-[11px] text-[#6c697b]">Pending customer concierge inquiries</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/admin/support_tickets")}
                className="text-xs text-[#d4a373] uppercase hover:underline flex items-center gap-1"
              >
                <span>MANAGE TICKETS</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {pendingTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6c697b]">NO OPEN TICKETS AT THIS TIME.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#282630] text-[#6c697b] uppercase bg-[#0f0e13]">
                      <th className="p-3 font-bold">TICKET ID</th>
                      <th className="p-3 font-bold">SUBJECT</th>
                      <th className="p-3 font-bold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#282630]">
                    {pendingTickets.map((t) => (
                      <tr key={t.ticket_id} className="hover:bg-[#1c1b22] text-white">
                        <td className="p-3 font-bold">#{t.ticket_id}</td>
                        <td className="p-3 font-medium uppercase truncate max-w-[200px]">{t.subject}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold uppercase">
                            {t.status || "OPEN"}
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
