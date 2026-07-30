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
        return <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-mono-tech uppercase tracking-widest">PENDING</span>;
      case "processing":
        return <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] font-mono-tech uppercase tracking-widest">PROCESSING</span>;
      case "shipped":
        return <span className="px-2.5 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-400 text-[10px] font-mono-tech uppercase tracking-widest">DISPATCHED</span>;
      case "delivered":
        return <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono-tech uppercase tracking-widest">DELIVERED</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-mono-tech uppercase tracking-widest">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 bg-[#282630] text-white text-[10px] font-mono-tech uppercase tracking-widest">{status}</span>;
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-[#16151a]" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-[#16151a] border border-[#282630]" />
          ))}
        </div>
      </CustomerLayout>
    );
  }

  if (orders.length === 0) {
    return (
      <CustomerLayout>
        <div className="border border-[#282630] bg-[#16151a] p-16 text-center space-y-4 max-w-md mx-auto my-12">
          <PackageCheck className="h-12 w-12 text-[#6c697b] mx-auto" />
          <h2 className="text-xl font-mono-tech uppercase font-bold text-white">NO ORDERS FOUND</h2>
          <p className="text-xs font-mono-tech text-[#6c697b]">You have not placed any furniture slot orders yet.</p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3 bg-white text-black font-mono-tech font-bold text-xs uppercase hover:bg-[#d4a373] transition-colors"
          >
            EXPLORE MARKETPLACE
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-8 pb-16">
        {/* Orders Header */}
        <div className="border border-[#282630] bg-[#16151a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373]">TRANSACTION RECORD</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mt-1">
              MY ALLOCATION ORDERS ({orders.length})
            </h1>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.order_id} className="border border-[#282630] bg-[#16151a] overflow-hidden font-mono-tech">
              {/* Order Header Bar */}
              <div className="bg-[#0f0e13] border-b border-[#282630] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-base font-bold text-white uppercase">ORDER #{order.order_id}</span>
                    {getStatusChip(order.status)}
                    <span className="px-2 py-0.5 border border-[#282630] bg-[#16151a] text-[#a19fad] text-[10px] uppercase">
                      PAYMENT: {order.payment_status || "PENDING"}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#6c697b] block">
                    PLACED ON {order.created_at ? new Date(order.created_at).toLocaleDateString() : "RECENT"}
                  </span>
                </div>

                {order.total_amount && (
                  <div className="sm:text-right">
                    <span className="text-[11px] text-[#6c697b] uppercase block">TOTAL AMOUNT:</span>
                    <span className="text-lg font-bold text-white">${parseFloat(order.total_amount).toFixed(2)} USD</span>
                  </div>
                )}
              </div>

              {/* Order Items List */}
              <div className="p-5 space-y-4">
                <span className="text-[11px] text-[#6c697b] uppercase block border-b border-[#282630] pb-2">
                  ALLOCATED PIECES:
                </span>
                <div className="space-y-3">
                  {order.items?.map((item, index) => {
                    const img = item.product_image || item.image_url;
                    const name = item.product_name || `Product #${item.product_id}`;
                    const unitPrice = parseFloat(item.unit_price || item.price || 0);
                    const itemTotal = parseFloat(item.total_price || (unitPrice * item.quantity));

                    return (
                      <div key={index} className="flex items-center justify-between gap-4 p-3 bg-[#0f0e13] border border-[#282630]">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="h-12 w-12 bg-[#16151a] border border-[#282630] overflow-hidden shrink-0 flex items-center justify-center">
                            {img ? (
                              <img src={img} alt={name} className="h-full w-full object-cover" />
                            ) : (
                              <ShoppingBag className="h-5 w-5 text-[#6c697b]" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white text-xs uppercase truncate">{name}</p>
                            <p className="text-[11px] text-[#6c697b] mt-0.5">
                              QUANTITY: <span className="text-white font-bold">{item.quantity}</span>
                              {unitPrice > 0 && ` × $${unitPrice.toFixed(2)} USD`}
                            </p>
                          </div>
                        </div>

                        <span className="font-bold text-white text-xs">
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