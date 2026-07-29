import { useState, useEffect } from "react";
import api from "../../api/axios";
import SellerLayout from "../../components/SellerLayout";
import { Package, ShoppingBag, CreditCard, Plus, ArrowRight, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
      label: "My Products",
      value: data.products.length,
      icon: Package,
      color: "text-[#15803D] bg-[#DCFCE7] border-[#BBF7D0]",
      path: "/seller/products",
    },
    {
      label: "Store Orders",
      value: data.orders.length,
      icon: ShoppingBag,
      color: "text-[#B45309] bg-[#FEF3C7] border-[#FDE68A]",
      path: "/seller/orders",
    },
    {
      label: "Completed Payouts",
      value: data.payments.length,
      icon: CreditCard,
      color: "text-[#6B21A8] bg-[#FAF5FF] border-[#F3E8FF]",
      path: "/seller/payments",
    },
  ];

  const recentOrders = data.orders.slice(0, 5);
  const lowStockProducts = data.products.filter((p) => p.stock <= 5).slice(0, 5);
  const recentPayments = data.payments.slice(0, 5);

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
      <SellerLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-40 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">Store Dashboard</h2>
          <p className="text-xs text-[#64748B] mt-1">Merchant operations, product stock alerts, and customer order history</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
              <Button size="sm" variant="success" onClick={() => navigate("/seller/products")} className="gap-1.5 text-xs h-8">
                <Plus className="h-3.5 w-3.5" />
                Add Product
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/seller/orders")} className="gap-1.5 text-xs h-8">
                <ShoppingBag className="h-3.5 w-3.5" />
                View Orders
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/seller/payments")} className="gap-1.5 text-xs h-8">
                <CreditCard className="h-3.5 w-3.5" />
                View Payments
              </Button>
            </div>
          </div>
        </Card>

        {/* Real Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Recent Store Orders</CardTitle>
                <CardDescription>Purchases made by customers for your products</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/seller/orders")} className="text-xs text-[#2563EB] h-7 px-2">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B]">No customer orders received yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((o) => (
                      <TableRow key={o.order_id}>
                        <TableCell className="font-mono text-xs font-semibold">#{o.order_id}</TableCell>
                        <TableCell className="text-xs">{o.customer_name || "Customer"}</TableCell>
                        <TableCell className="text-xs font-medium">{o.product_name || "Product"}</TableCell>
                        <TableCell>{getOrderStatusBadge(o.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
                  Low Stock Inventory
                </CardTitle>
                <CardDescription>Listings with 5 or fewer items remaining</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/seller/products")} className="text-xs text-[#2563EB] h-7 px-2">
                Manage Stock <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {lowStockProducts.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B]">All product stock levels are healthy.</div>
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
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerDashboard;
