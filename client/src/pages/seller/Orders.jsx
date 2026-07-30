import { useState, useEffect } from "react";
import SellerLayout from "../../components/SellerLayout";
import api from "../../api/axios";
import { ShoppingBag, Search, ChevronLeft, ChevronRight, Edit3, X } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusModalOrder, setStatusModalOrder] = useState(null);

  const fetchOrders = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/seller/orders?page=${currentPage}&limit=10`);
      setOrders(res.data?.orders || []);
      setTotalPages(res.data?.pages || 1);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error loading orders",
        description: "Could not retrieve store order list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const updateStatus = async (order_id, status) => {
    try {
      await api.patch(`/orders/${order_id}`, { status });
      toast({
        title: "Status Updated",
        description: `Order #${order_id} status updated to ${status}`,
        variant: "success",
      });
      setStatusModalOrder(null);
      fetchOrders(page);
    } catch (err) {
      console.error(err);
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusChip = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "pending": return <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full uppercase">Pending</span>;
      case "processing": return <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-full uppercase">Processing</span>;
      case "shipped": return <span className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold rounded-full uppercase">Dispatched</span>;
      case "delivered": return <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full uppercase">Delivered</span>;
      case "cancelled": return <span className="px-3 py-1 bg-red-50 text-red-800 border border-red-200 text-xs font-bold rounded-full uppercase">Cancelled</span>;
      default: return <span className="px-3 py-1 bg-[#F8F7F4] text-[#1A1A1A] border border-[#E8E5DF] text-xs font-bold rounded-full uppercase">{status}</span>;
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.order_id?.toString().includes(searchQuery) ||
    o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SellerLayout>
      <div className="space-y-8 pb-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">MERCHANT FULFILLMENT</span>
            <h1 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A] mt-1">
              Customer Orders Management
            </h1>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#71717A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order ID, customer, or product..."
              className="w-full bg-white border border-[#E8E5DF] rounded-xl pl-10 pr-4 py-3 text-xs text-[#1A1A1A] placeholder-[#71717A] focus:outline-none focus:border-[#B8865B] shadow-sm"
            />
          </div>
          <span className="text-xs font-semibold text-[#52525B]">
            Total Orders: <strong className="text-[#1A1A1A]">{filteredOrders.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#71717A] animate-pulse">Loading store orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <ShoppingBag className="h-12 w-12 text-[#B8865B] mx-auto opacity-60" />
              <h3 className="text-lg font-bold text-[#1A1A1A]">No Customer Orders</h3>
              <p className="text-xs text-[#6B6B6B]">Orders will appear here once clients purchase your items.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E5DF] text-[#71717A] uppercase bg-[#F8F7F4]">
                    <th className="p-4 font-bold">Order ID</th>
                    <th className="p-4 font-bold">Customer</th>
                    <th className="p-4 font-bold">Product</th>
                    <th className="p-4 font-bold">Qty</th>
                    <th className="p-4 font-bold">Total Amount</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Payment</th>
                    <th className="p-4 font-bold">Date</th>
                    <th className="p-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DF]">
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-[#F8F7F4] text-[#1A1A1A] transition-colors">
                      <td className="p-4 font-bold text-[#B8865B]">#{order.order_id}</td>
                      <td className="p-4">
                        <div className="font-bold text-[#1A1A1A]">{order.customer_name || "Customer"}</div>
                        <div className="text-[11px] text-[#71717A]">{order.customer_email || "N/A"}</div>
                      </td>
                      <td className="p-4 font-semibold">{order.product_name || "N/A"}</td>
                      <td className="p-4 font-bold">x{order.quantity}</td>
                      <td className="p-4 font-bold font-display text-sm text-[#1A1A1A]">
                        ${parseFloat(order.total_amount || 0).toFixed(2)} USD
                      </td>
                      <td className="p-4">{getStatusChip(order.status)}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-white border border-[#E8E5DF] text-[#52525B] text-xs font-semibold rounded-full uppercase">
                          {order.payment_status || "Pending"}
                        </span>
                      </td>
                      <td className="p-4 text-[#71717A]">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setStatusModalOrder(order)}
                          className="px-4 py-2 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF] flex items-center gap-1.5 ml-auto transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-[#B8865B]" />
                          <span>Update</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-[#E8E5DF] bg-[#F8F7F4] flex justify-between items-center text-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-[#E8E5DF] bg-white text-[#1A1A1A] rounded-xl disabled:opacity-40 font-semibold"
              >
                Previous
              </button>
              <span className="text-[#71717A]">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-[#E8E5DF] bg-white text-[#1A1A1A] rounded-xl disabled:opacity-40 font-semibold"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <Dialog open={!!statusModalOrder} onClose={() => setStatusModalOrder(null)}>
        <div className="bg-white border border-[#E8E5DF] rounded-2xl text-[#1A1A1A] p-8 max-w-md w-full shadow-2xl space-y-4 text-xs">
          <DialogHeader className="pb-4 border-b border-[#E8E5DF] flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold font-serif-editorial text-[#1A1A1A]">Update Order Status</DialogTitle>
              <DialogDescription className="text-xs text-[#6B6B6B] mt-1">Select new fulfillment status for Order #{statusModalOrder?.order_id}</DialogDescription>
            </div>
            <button onClick={() => setStatusModalOrder(null)} className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-[#F8F7F4] rounded-xl">
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          {statusModalOrder && (
            <div className="space-y-4 my-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">Select New Status:</label>
                <select
                  defaultValue={statusModalOrder.status}
                  onChange={(e) => updateStatus(statusModalOrder.order_id, e.target.value)}
                  className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped / Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => setStatusModalOrder(null)}
                className="w-full py-3 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF]"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </Dialog>
    </SellerLayout>
  );
};

export default SellerOrders;