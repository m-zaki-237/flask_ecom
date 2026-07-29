import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { PackageCheck, Clock, Truck, CheckCircle2, XCircle, ShoppingBag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/users/${user.user_id}/orders`);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "pending":
        return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case "processing":
        return <Badge variant="info" className="gap-1"><PackageCheck className="h-3 w-3" /> Processing</Badge>;
      case "shipped":
        return <Badge variant="purple" className="gap-1"><Truck className="h-3 w-3" /> Shipped</Badge>;
      case "delivered":
        return <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Delivered</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-40 rounded-lg" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </CustomerLayout>
    );
  }

  if (orders.length === 0) {
    return (
      <CustomerLayout>
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-2xs max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <PackageCheck className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No Orders Placed Yet</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">Explore our catalog and place your first order today.</p>
          <Button onClick={() => navigate("/home")} variant="primary" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span>Start Shopping</span>
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Orders</h1>
          <p className="text-xs text-slate-500 mt-1">Track order status, items purchased, and order history</p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.order_id} className="overflow-hidden border border-slate-200/80 shadow-xs">
              <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-4 sm:p-6 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base font-extrabold">Order #{order.order_id}</CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Placed on {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ordered Items</p>
                <div className="space-y-2 divide-y divide-slate-100">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm pt-2 first:pt-0">
                      <span className="font-semibold text-slate-800">Product #{item.product_id}</span>
                      <Badge variant="outline" className="font-mono text-xs">x{item.quantity}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
};