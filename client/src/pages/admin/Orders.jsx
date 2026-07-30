import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/axios";
import { ShoppingBag, Search, Trash2, ChevronLeft, ChevronRight, Edit3, X } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [statusModalOrder, setStatusModalOrder] = useState(null);

  const fetchOrders = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/orders?page=${currentPage}&limit=10`);
      setOrders(res.data?.orders || []);
      setTotalPages(res.data?.pages || 1);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error loading orders",
        description: "Could not retrieve order list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const handleStatusUpdate = async (order_id, status) => {
    try {
      await api.put(`/orders/${order_id}/status`, { status });
      toast({
        title: "Status Updated",
        description: `Order #${order_id} marked as ${status}`,
        variant: "success",
      });
      setStatusModalOrder(null);
      fetchOrders(page);
    } catch (err) {
      console.error(err);
      toast({
        title: "Update Failed",
        description: "Failed to change order status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/orders/${deleteId}`);
      toast({
        title: "Order Removed",
        description: `Order #${deleteId} was deleted`,
        variant: "success",
      });
      setDeleteId(null);
      fetchOrders(page);
    } catch (err) {
      console.error(err);
      toast({
        title: "Deletion Failed",
        description: "Could not remove order record",
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
    o.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">GLOBAL FULFILLMENT</span>
            <h1 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A] mt-1">
              Marketplace Global Orders
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
              placeholder="Search Order ID, buyer, or status..."
              className="w-full bg-white border border-[#E8E5DF] rounded-xl pl-10 pr-4 py-3 text-xs text-[#1A1A1A] placeholder-[#71717A] focus:outline-none focus:border-[#B8865B] shadow-sm"
            />
          </div>
          <span className="text-xs font-semibold text-[#52525B]">
            System Orders: <strong className="text-[#1A1A1A]">{filteredOrders.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#71717A] animate-pulse">Loading global orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <ShoppingBag className="h-12 w-12 text-[#B8865B] mx-auto opacity-60" />
              <h3 className="text-lg font-bold text-[#1A1A1A]">No Orders Found</h3>
              <p className="text-xs text-[#6B6B6B]">No order records match your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E5DF] text-[#71717A] uppercase bg-[#F8F7F4]">
                    <th className="p-4 font-bold">Order ID</th>
                    <th className="p-4 font-bold">Buyer Name</th>
                    <th className="p-4 font-bold">Buyer Email</th>
                    <th className="p-4 font-bold">Total Amount</th>
                    <th className="p-4 font-bold">Order Status</th>
                    <th className="p-4 font-bold">Payment</th>
                    <th className="p-4 font-bold">Date</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DF]">
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-[#F8F7F4] text-[#1A1A1A] transition-colors">
                      <td className="p-4 font-bold text-[#B8865B]">#{order.order_id}</td>
                      <td className="p-4 font-bold">{order.customer_name || `User #${order.user_id}`}</td>
                      <td className="p-4 text-[#52525B]">{order.customer_email || "N/A"}</td>
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setStatusModalOrder(order)}
                            className="p-2 border border-[#E8E5DF] bg-[#F8F7F4] text-[#52525B] hover:text-[#1A1A1A] hover:bg-[#E8E5DF] rounded-xl transition-colors"
                            title="Update Order Status"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(order.order_id)}
                            className="p-2 border border-[#E8E5DF] bg-[#F8F7F4] text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete Order Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
              <DialogDescription className="text-xs text-[#6B6B6B] mt-1">Order #{statusModalOrder?.order_id}</DialogDescription>
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
                  onChange={(e) => handleStatusUpdate(statusModalOrder.order_id, e.target.value)}
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

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <div className="bg-white border border-[#E8E5DF] rounded-2xl text-[#1A1A1A] p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
          <DialogHeader className="pb-3 border-b border-[#E8E5DF] flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-bold font-serif-editorial text-[#1A1A1A]">Confirm Order Deletion</DialogTitle>
            <button onClick={() => setDeleteId(null)} className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-[#F8F7F4] rounded-xl">
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <p className="text-xs text-[#6B6B6B]">
            Are you sure you want to delete Order Record #{deleteId}? This action cannot be undone.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 py-2.5 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 bg-red-600 text-white font-semibold text-xs rounded-xl hover:bg-red-700 shadow-md"
            >
              Delete Order
            </button>
          </div>
        </div>
      </Dialog>
    </AdminLayout>
  );
}