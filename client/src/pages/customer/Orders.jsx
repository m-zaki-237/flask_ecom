import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { PackageCheck, Clock, Truck, CheckCircle2, XCircle, ShoppingBag } from "lucide-react";

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

  const getStatusChip = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "pending":
        return <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full uppercase tracking-wider">Pending</span>;
      case "processing":
        return <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-full uppercase tracking-wider">Processing</span>;
      case "shipped":
        return <span className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold rounded-full uppercase tracking-wider">Dispatched</span>;
      case "delivered":
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full uppercase tracking-wider">Delivered</span>;
      case "cancelled":
        return <span className="px-3 py-1 bg-red-50 text-red-800 border border-red-200 text-xs font-bold rounded-full uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-[#F8F7F4] text-[#1A1A1A] border border-[#E8E5DF] text-xs font-bold rounded-full uppercase tracking-wider">{status}</span>;
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="space-y-6 animate-pulse py-8">
          <div className="h-8 w-48 bg-[#E8E5DF] rounded-lg" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-[#F8F7F4] rounded-2xl border border-[#E8E5DF]" />
          ))}
        </div>
      </CustomerLayout>
    );
  }

  if (orders.length === 0) {
    return (
      <CustomerLayout>
        <div className="rounded-3xl border border-[#E8E5DF] bg-[#F8F7F4] p-16 text-center space-y-4 max-w-md mx-auto my-12">
          <PackageCheck className="h-14 w-14 text-[#B8865B] mx-auto opacity-70" />
          <h2 className="text-2xl font-serif-editorial font-bold text-[#1A1A1A]">No Orders Placed Yet</h2>
          <p className="text-xs text-[#6B6B6B]">You have not made any purchases in our marketplace catalog.</p>
          <button
            onClick={() => navigate("/home")}
            className="px-8 py-3.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#B8865B] transition-colors shadow-md"
          >
            Explore Marketplace
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-10 pb-16">
        
        {/* Orders Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">PURCHASE HISTORY</span>
            <h1 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A] mt-1">
              My Orders ({orders.length})
            </h1>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.order_id} className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
              
              {/* Order Header Bar */}
              <div className="bg-[#F8F7F4] border-b border-[#E8E5DF] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg font-bold font-serif-editorial text-[#1A1A1A]">Order #{order.order_id}</span>
                    {getStatusChip(order.status)}
                    <span className="px-3 py-1 bg-white border border-[#E8E5DF] text-[#52525B] text-xs font-semibold rounded-full uppercase">
                      Payment: {order.payment_status || "Pending"}
                    </span>
                  </div>
                  <span className="text-xs text-[#71717A] block">
                    Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                  </span>
                </div>

                {order.total_amount && (
                  <div className="sm:text-right">
                    <span className="text-xs text-[#71717A] block font-medium">Total Amount</span>
                    <span className="text-xl font-bold font-display text-[#1A1A1A]">${parseFloat(order.total_amount).toFixed(2)} USD</span>
                  </div>
                )}
              </div>

              {/* Order Items List */}
              <div className="p-6 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] block border-b border-[#E8E5DF] pb-2">
                  Items Purchased
                </span>
                <div className="space-y-3">
                  {order.items?.map((item, index) => {
                    const img = item.product_image || item.image_url;
                    const name = item.product_name || `Product #${item.product_id}`;
                    const unitPrice = parseFloat(item.unit_price || item.price || 0);
                    const itemTotal = parseFloat(item.total_price || (unitPrice * item.quantity));

                    return (
                      <div key={index} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF]">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="h-14 w-14 rounded-lg bg-white border border-[#E8E5DF] overflow-hidden shrink-0 flex items-center justify-center">
                            {img ? (
                              <img src={img} alt={name} className="h-full w-full object-cover" />
                            ) : (
                              <ShoppingBag className="h-6 w-6 text-[#71717A] opacity-30" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#1A1A1A] text-sm truncate">{name}</p>
                            <p className="text-xs text-[#6B6B6B] mt-0.5">
                              Quantity: <span className="text-[#1A1A1A] font-bold">{item.quantity}</span>
                              {unitPrice > 0 && ` × $${unitPrice.toFixed(2)} USD`}
                            </p>
                          </div>
                        </div>

                        <span className="font-bold font-display text-[#1A1A1A] text-sm">
                          ${itemTotal.toFixed(2)} USD
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
};