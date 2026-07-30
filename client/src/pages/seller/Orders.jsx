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
      case "pending": return <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] uppercase font-bold">PENDING</span>;
      case "processing": return <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] uppercase font-bold">PROCESSING</span>;
      case "shipped": return <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[10px] uppercase font-bold">SHIPPED</span>;
      case "delivered": return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] uppercase font-bold">DELIVERED</span>;
      case "cancelled": return <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] uppercase font-bold">CANCELLED</span>;
      default: return <span className="px-2.5 py-1 bg-[#282630] text-white text-[10px] uppercase font-bold">{status}</span>;
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.order_id?.toString().includes(searchQuery) ||
    o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SellerLayout>
      <div className="space-y-8 pb-16 font-mono-tech">
        {/* Header */}
        <div className="border border-[#282630] bg-[#16151a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373]">MERCHANT ORDERS</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mt-1">
              CUSTOMER ORDERS & ALLOCATIONS
            </h1>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#282630] pb-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#6c697b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH ORDER ID, CUSTOMER, OR PRODUCT..."
              className="w-full bg-[#0f0e13] border border-[#282630] pl-9 pr-4 py-2.5 text-xs font-mono-tech text-white placeholder-[#6c697b] focus:outline-none focus:border-[#d4a373]"
            />
          </div>
          <span className="text-xs font-mono-tech text-[#6c697b] uppercase">
            TOTAL ORDERS: <strong className="text-white">{filteredOrders.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="border border-[#282630] bg-[#16151a] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#6c697b] animate-pulse">LOADING STORE ORDERS...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <ShoppingBag className="h-10 w-10 text-[#6c697b] mx-auto" />
              <h3 className="text-base font-bold uppercase text-white">NO CUSTOMER ORDERS</h3>
              <p className="text-xs text-[#6c697b]">Orders will appear here once clients purchase your furniture listings.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#282630] text-[#6c697b] uppercase bg-[#0f0e13]">
                    <th className="p-4 font-bold">ORDER ID</th>
                    <th className="p-4 font-bold">CUSTOMER</th>
                    <th className="p-4 font-bold">PRODUCT</th>
                    <th className="p-4 font-bold">QTY</th>
                    <th className="p-4 font-bold">TOTAL AMOUNT</th>
                    <th className="p-4 font-bold">STATUS</th>
                    <th className="p-4 font-bold">PAYMENT</th>
                    <th className="p-4 font-bold">DATE</th>
                    <th className="p-4 font-bold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282630]">
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-[#1c1b22] text-white">
                      <td className="p-4 font-bold text-[#d4a373]">#{order.order_id}</td>
                      <td className="p-4">
                        <div className="font-bold text-white uppercase">{order.customer_name || "Customer"}</div>
                        <div className="text-[10px] text-[#6c697b]">{order.customer_email || "N/A"}</div>
                      </td>
                      <td className="p-4 font-bold uppercase">{order.product_name || "N/A"}</td>
                      <td className="p-4 font-bold">x{order.quantity}</td>
                      <td className="p-4 font-bold text-white">${parseFloat(order.total_amount || 0).toFixed(2)} USD</td>
                      <td className="p-4">{getStatusChip(order.status)}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 border border-[#282630] bg-[#0f0e13] text-[#a19fad] text-[10px] uppercase">
                          {order.payment_status || "PENDING"}
                        </span>
                      </td>
                      <td className="p-4 text-[#6c697b]">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setStatusModalOrder(order)}
                          className="px-3 py-1.5 border border-[#282630] bg-[#0f0e13] text-xs uppercase text-white hover:border-[#d4a373] flex items-center gap-1.5 ml-auto"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-[#d4a373]" />
                          <span>UPDATE</span>
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
            <div className="p-4 border-t border-[#282630] bg-[#0f0e13] flex justify-between items-center text-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-[#282630] bg-[#16151a] text-white disabled:opacity-40"
              >
                PREVIOUS
              </button>
              <span className="text-[#6c697b]">PAGE {page} OF {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-[#282630] bg-[#16151a] text-white disabled:opacity-40"
              >
                NEXT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <Dialog open={!!statusModalOrder} onClose={() => setStatusModalOrder(null)}>
        <div className="bg-[#16151a] border border-[#282630] text-white p-6 max-w-md w-full font-mono-tech text-xs space-y-4">
          <DialogHeader className="pb-4 border-b border-[#282630] flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-lg uppercase font-bold text-white">UPDATE ORDER STATUS</DialogTitle>
              <DialogDescription className="text-xs text-[#a19fad]">Select new status for Order #{statusModalOrder?.order_id}</DialogDescription>
            </div>
            <button onClick={() => setStatusModalOrder(null)} className="p-1 text-[#6c697b] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          {statusModalOrder && (
            <div className="space-y-4 my-4">
              <div>
                <label className="block uppercase text-[#a19fad] mb-1">SELECT STATUS:</label>
                <select
                  defaultValue={statusModalOrder.status}
                  onChange={(e) => updateStatus(statusModalOrder.order_id, e.target.value)}
                  className="w-full bg-[#0f0e13] border border-[#282630] p-2.5 text-xs text-white focus:outline-none focus:border-[#d4a373] uppercase"
                >
                  <option value="pending">PENDING</option>
                  <option value="processing">PROCESSING</option>
                  <option value="shipped">SHIPPED / DISPATCHED</option>
                  <option value="delivered">DELIVERED</option>
                  <option value="cancelled">CANCELLED</option>
                </select>
              </div>

              <button
                onClick={() => setStatusModalOrder(null)}
                className="w-full py-2.5 border border-[#282630] bg-[#0f0e13] text-xs uppercase text-white hover:border-white"
              >
                CLOSE
              </button>
            </div>
          )}
        </div>
      </Dialog>
    </SellerLayout>
  );
};

export default SellerOrders;