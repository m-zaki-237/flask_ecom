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
          <p className="text-xs text-slate-500 mt-1">Track order status, items purchased, and payment details</p>
        </div>

        <div className="space-y-5">
          {orders.map((order) => (
            <Card key={order.order_id} className="overflow-hidden border border-slate-200/80 shadow-xs">
              {/* Order Header */}
              <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="text-base font-extrabold text-slate-900">
                      Order #{order.order_id}
                    </CardTitle>
                    {getStatusBadge(order.status)}
                    <Badge variant={order.payment_status === "completed" ? "success" : "warning"} className="capitalize">
                      Payment: {order.payment_status || "pending"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Recent"}
                  </p>
                </div>

                {order.total_amount && (
                  <div className="sm:text-right">
                    <span className="text-xs text-slate-500 font-medium">Order Total</span>
                    <p className="text-lg font-extrabold text-blue-600">${parseFloat(order.total_amount).toFixed(2)}</p>
                  </div>
                )}
              </CardHeader>

              {/* Order Items List */}
              <CardContent className="p-4 sm:p-5 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Purchased Items</p>
                <div className="space-y-3 divide-y divide-slate-100">
                  {order.items?.map((item, index) => {
                    const img = item.product_image || item.image_url;
                    const name = item.product_name || `Product #${item.product_id}`;
                    const unitPrice = parseFloat(item.unit_price || item.price || 0);
                    const itemTotal = parseFloat(item.total_price || (unitPrice * item.quantity));

                    return (
                      <div key={index} className="flex items-center justify-between gap-4 pt-3 first:pt-0">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            {img ? (
                              <img src={img} alt={name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400">
                                <ShoppingBag className="h-5 w-5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 text-sm truncate">{name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Quantity: <span className="font-bold text-slate-700">{item.quantity}</span>
                              {unitPrice > 0 && ` × $${unitPrice.toFixed(2)}`}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-slate-900 text-sm">
                            ${itemTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
};