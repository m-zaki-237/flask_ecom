import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/axios";
import { Users, Package, ShoppingBag, CreditCard, Plus, ArrowRight, LifeBuoy, AlertTriangle, UserCheck, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
    {
      label: "Total Users",
      value: data.users.length,
      icon: Users,
      color: "text-[#2563EB] bg-[#E0F2FE] border-[#BAE6FD]",
      path: "/admin/users",
    },
    {
      label: "Total Products",
      value: data.products.length,
      icon: Package,
      color: "text-[#15803D] bg-[#DCFCE7] border-[#BBF7D0]",
      path: "/admin/products",
    },
    {
      label: "Total Orders",
      value: data.orders.length,
      icon: ShoppingBag,
      color: "text-[#B45309] bg-[#FEF3C7] border-[#FDE68A]",
      path: "/admin/orders",
    },
    {
      label: "Total Payments",
      value: data.payments.length,
      icon: CreditCard,
      color: "text-[#6B21A8] bg-[#FAF5FF] border-[#F3E8FF]",
      path: "/admin/payments",
    },
  ];

  // Derived real data
  const recentOrders = data.orders.slice(0, 5);
  const lowStockProducts = data.products.filter((p) => p.stock <= 5).slice(0, 5);
  const pendingTickets = data.tickets.filter((t) => t.status === "open" || t.status === "pending" || t.status === "in-progress").slice(0, 5);
  const latestUsers = data.users.slice(0, 5);

  const getOrderStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "pending": return <Badge variant="warning">Pending</Badge>;
      case "processing": return <Badge variant="info">Processing</Badge>;
      case "shipped": return <Badge variant="purple">Shipped</Badge>;
      case "delivered": return <Badge variant="success">Delivered</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-40 rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">Dashboard Overview</h2>
          <p className="text-xs text-[#64748B] mt-1">Real-time statistics and summary from existing system records</p>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.label}
                onClick={() => navigate(card.path)}
                className="cursor-pointer hover:border-[#CBD5E1] transition-all group"
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">{card.label}</p>
                    <p className="text-2xl font-extrabold text-[#0F172A] mt-1">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions Bar */}
        <Card className="p-4 bg-white border-[#E2E8F0]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">Quick Actions:</span>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="primary" onClick={() => navigate("/admin/products")} className="gap-1.5 text-xs h-8">
                <Plus className="h-3.5 w-3.5" />
                Add Product
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/admin/orders")} className="gap-1.5 text-xs h-8">
                <ShoppingBag className="h-3.5 w-3.5" />
                View Orders
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/admin/payments")} className="gap-1.5 text-xs h-8">
                <CreditCard className="h-3.5 w-3.5" />
                View Payments
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/admin/users")} className="gap-1.5 text-xs h-8">
                <Users className="h-3.5 w-3.5" />
                Manage Users
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/admin/support_tickets")} className="gap-1.5 text-xs h-8">
                <LifeBuoy className="h-3.5 w-3.5" />
                Support Tickets
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Grid: Real Data Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Recent Orders</CardTitle>
                <CardDescription>Latest customer purchase orders</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")} className="text-xs text-[#2563EB] h-7 px-2">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B]">No recent orders found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((o) => (
                      <TableRow key={o.order_id}>
                        <TableCell className="font-mono text-xs font-semibold">#{o.order_id}</TableCell>
                        <TableCell className="text-xs">User #{o.user_id}</TableCell>
                        <TableCell>{getOrderStatusBadge(o.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
                  Low Stock Inventory
                </CardTitle>
                <CardDescription>Products with 5 or fewer items remaining</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/products")} className="text-xs text-[#2563EB] h-7 px-2">
                View Catalog <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {lowStockProducts.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B]">All product inventory levels are healthy.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock Left</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map((p) => (
                      <TableRow key={p.product_id}>
                        <TableCell className="font-semibold text-xs text-[#0F172A]">{p.product_name}</TableCell>
                        <TableCell className="text-xs">${parseFloat(p.price).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="warning">{p.stock} remaining</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pending Support Tickets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-1.5">
                  <LifeBuoy className="h-4 w-4 text-[#2563EB]" />
                  Pending Support Tickets
                </CardTitle>
                <CardDescription>Customer inquiries requiring assistance</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/support_tickets")} className="text-xs text-[#2563EB] h-7 px-2">
                View Queue <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {pendingTickets.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B]">No open or pending support tickets.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTickets.map((t) => (
                      <TableRow key={t.ticket_id}>
                        <TableCell className="font-semibold text-xs text-[#0F172A] max-w-[180px] truncate">{t.subject}</TableCell>
                        <TableCell className="text-xs">User #{t.user_id}</TableCell>
                        <TableCell>
                          <Badge variant="info">{t.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Latest Registered Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-[#16A34A]" />
                  Latest User Accounts
                </CardTitle>
                <CardDescription>Recently registered accounts</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")} className="text-xs text-[#2563EB] h-7 px-2">
                View Users <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {latestUsers.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B]">No users registered yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestUsers.map((u) => (
                      <TableRow key={u.user_id}>
                        <TableCell className="font-semibold text-xs text-[#0F172A]">{u.first_name} {u.last_name}</TableCell>
                        <TableCell className="text-xs text-[#64748B]">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === "admin" ? "destructive" : u.role === "seller" ? "info" : "success"}>
                            {u.role}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
