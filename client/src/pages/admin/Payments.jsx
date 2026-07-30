import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/axios";
import { Plus, Search, Trash2, Eye, ChevronLeft, ChevronRight, CreditCard, X } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [newPayment, setNewPayment] = useState({
    order_id: "",
    amount: "",
    payment_method: "credit_card",
    payment_status: "completed",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/payments?page=${currentPage}&limit=10`);
      setPayments(res.data?.payments || []);
      setTotalPages(res.data?.pages || 1);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching payments",
        description: "Could not load transaction list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page);
  }, [page]);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/payments/create", {
        ...newPayment,
        order_id: parseInt(newPayment.order_id),
        amount: parseFloat(newPayment.amount),
      });

      toast({
        title: "Payment Recorded",
        description: `Payment for Order #${newPayment.order_id} saved`,
        variant: "success",
      });

      setShowAddModal(false);
      setNewPayment({ order_id: "", amount: "", payment_method: "credit_card", payment_status: "completed" });
      fetchPayments(page);
    } catch (err) {
      console.error(err);
      toast({
        title: "Creation Failed",
        description: err.response?.data?.message || "Failed to record payment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (payment_id, payment_status) => {
    try {
      await api.patch(`/payments/update/${payment_id}`, {
        payment_status
      });

      toast({
        title: "Payment Updated",
        description: `Payment #${payment_id} set to ${payment_status}`,
        variant: "success",
      });

      setSelectedPayment(null);
      fetchPayments(page);
    } catch (err) {
      console.error(err);
      toast({
        title: "Update Failed",
        description: err.response?.data?.error || "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/payments/${deleteId}`);
      toast({
        title: "Payment Removed",
        description: `Payment #${deleteId} was deleted`,
        variant: "success",
      });
      setDeleteId(null);
      fetchPayments(page);
    } catch (err) {
      console.error(err);
      toast({
        title: "Deletion Failed",
        description: "Could not remove payment record",
        variant: "destructive",
      });
    }
  };

  const getStatusChip = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "completed": return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] uppercase font-bold">COMPLETED</span>;
      case "pending": return <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] uppercase font-bold">PENDING</span>;
      case "failed": return <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] uppercase font-bold">FAILED</span>;
      default: return <span className="px-2.5 py-1 bg-[#282630] text-white text-[10px] uppercase font-bold">{status}</span>;
    }
  };

  const filteredPayments = payments.filter((p) =>
    p.payment_id?.toString().includes(searchQuery) ||
    p.order_id?.toString().includes(searchQuery) ||
    p.payment_method?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.payment_status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16 font-mono-tech">
        {/* Header */}
        <div className="border border-[#282630] bg-[#16151a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373]">GLOBAL FINANCIAL RECORD</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mt-1">
              SYSTEM PAYMENTS & SETTLEMENTS
            </h1>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-white text-black font-mono-tech font-bold text-xs uppercase hover:bg-[#d4a373] transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>RECORD PAYMENT</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#282630] pb-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#6c697b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH PAYMENT ID, ORDER ID, METHOD..."
              className="w-full bg-[#0f0e13] border border-[#282630] pl-9 pr-4 py-2.5 text-xs font-mono-tech text-white placeholder-[#6c697b] focus:outline-none focus:border-[#d4a373]"
            />
          </div>
          <span className="text-xs font-mono-tech text-[#6c697b] uppercase">
            TOTAL PAYMENTS: <strong className="text-white">{filteredPayments.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="border border-[#282630] bg-[#16151a] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#6c697b] animate-pulse">LOADING PAYMENT TRANSACTIONS...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <CreditCard className="h-10 w-10 text-[#6c697b] mx-auto" />
              <h3 className="text-base font-bold uppercase text-white">NO PAYMENTS RECORDED</h3>
              <p className="text-xs text-[#6c697b]">No payments match your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#282630] text-[#6c697b] uppercase bg-[#0f0e13]">
                    <th className="p-4 font-bold">PAYMENT ID</th>
                    <th className="p-4 font-bold">ORDER ID</th>
                    <th className="p-4 font-bold">AMOUNT</th>
                    <th className="p-4 font-bold">METHOD</th>
                    <th className="p-4 font-bold">STATUS</th>
                    <th className="p-4 font-bold">DATE</th>
                    <th className="p-4 font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282630]">
                  {filteredPayments.map((p) => (
                    <tr key={p.payment_id} className="hover:bg-[#1c1b22] text-white">
                      <td className="p-4 font-bold text-[#d4a373]">#{p.payment_id}</td>
                      <td className="p-4 text-[#a19fad]">Order #{p.order_id}</td>
                      <td className="p-4 font-bold text-emerald-400">${parseFloat(p.amount).toFixed(2)} USD</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 border border-[#282630] bg-[#0f0e13] text-white text-[10px] uppercase">
                          {p.payment_method?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4">{getStatusChip(p.payment_status)}</td>
                      <td className="p-4 text-[#6c697b]">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="p-2 border border-[#282630] bg-[#0f0e13] text-[#a19fad] hover:text-white hover:border-[#d4a373]"
                            title="Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(p.payment_id)}
                            className="p-2 border border-[#282630] bg-[#0f0e13] text-[#6c697b] hover:text-red-400 hover:border-red-400"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Record Payment Modal */}
      <Dialog open={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="bg-[#16151a] border border-[#282630] text-white p-6 max-w-lg w-full font-mono-tech text-xs">
          <DialogHeader className="pb-4 border-b border-[#282630] flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-lg uppercase font-bold text-white">RECORD PAYMENT TRANSACTION</DialogTitle>
              <DialogDescription className="text-xs text-[#a19fad]">Manually record or update payment transaction.</DialogDescription>
            </div>
            <button onClick={() => setShowAddModal(false)} className="p-1 text-[#6c697b] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <form onSubmit={handleCreatePayment} className="space-y-4 my-6">
            <div>
              <label className="block uppercase text-[#a19fad] mb-1">ORDER ID*</label>
              <input
                type="number"
                value={newPayment.order_id}
                onChange={(e) => setNewPayment({ ...newPayment, order_id: e.target.value })}
                required
                className="w-full bg-[#0f0e13] border border-[#282630] p-2.5 text-xs text-white focus:outline-none focus:border-[#d4a373]"
              />
            </div>

            <div>
              <label className="block uppercase text-[#a19fad] mb-1">AMOUNT (USD)*</label>
              <input
                type="number"
                step="0.01"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                required
                className="w-full bg-[#0f0e13] border border-[#282630] p-2.5 text-xs text-white focus:outline-none focus:border-[#d4a373]"
              />
            </div>

            <div>
              <label className="block uppercase text-[#a19fad] mb-1">PAYMENT METHOD*</label>
              <select
                value={newPayment.payment_method}
                onChange={(e) => setNewPayment({ ...newPayment, payment_method: e.target.value })}
                className="w-full bg-[#0f0e13] border border-[#282630] p-2.5 text-xs text-white focus:outline-none focus:border-[#d4a373] uppercase"
              >
                <option value="credit_card">CREDIT CARD</option>
                <option value="crypto_usdc">USDC ON SUI / CRYPTO</option>
                <option value="cash">CASH ON DELIVERY</option>
              </select>
            </div>

            <div>
              <label className="block uppercase text-[#a19fad] mb-1">PAYMENT STATUS*</label>
              <select
                value={newPayment.payment_status}
                onChange={(e) => setNewPayment({ ...newPayment, payment_status: e.target.value })}
                className="w-full bg-[#0f0e13] border border-[#282630] p-2.5 text-xs text-white focus:outline-none focus:border-[#d4a373] uppercase"
              >
                <option value="completed">COMPLETED</option>
                <option value="pending">PENDING</option>
                <option value="failed">FAILED</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 border border-[#282630] bg-[#0f0e13] text-xs font-mono-tech text-white uppercase"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-white text-black font-mono-tech font-bold text-xs uppercase hover:bg-[#d4a373] transition-colors"
              >
                {submitting ? "RECORDING..." : "RECORD PAYMENT"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Payment Details Modal */}
      <Dialog open={!!selectedPayment} onClose={() => setSelectedPayment(null)}>
        {selectedPayment && (
          <div className="bg-[#16151a] border border-[#282630] text-white p-6 max-w-md w-full font-mono-tech text-xs space-y-4">
            <DialogHeader className="pb-2 border-b border-[#282630] flex flex-row items-center justify-between">
              <DialogTitle className="text-base uppercase font-bold text-white">PAYMENT DETAILS #{selectedPayment.payment_id}</DialogTitle>
              <button onClick={() => setSelectedPayment(null)} className="p-1 text-[#6c697b] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </DialogHeader>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6c697b]">ORDER ID:</span>
                <span className="text-white font-bold">#{selectedPayment.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c697b]">AMOUNT:</span>
                <span className="text-emerald-400 font-bold">${parseFloat(selectedPayment.amount).toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c697b]">METHOD:</span>
                <span className="text-white uppercase">{selectedPayment.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c697b]">STATUS:</span>
                <div>{getStatusChip(selectedPayment.payment_status)}</div>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c697b]">DATE RECORDED:</span>
                <span className="text-white">{selectedPayment.created_at ? new Date(selectedPayment.created_at).toLocaleString() : "N/A"}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#282630] space-y-2">
              <label className="block text-[#a19fad] uppercase">UPDATE STATUS:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleStatusUpdate(selectedPayment.payment_id, "completed")}
                  className="py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-[10px] uppercase"
                >
                  COMPLETED
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedPayment.payment_id, "pending")}
                  className="py-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-[10px] uppercase"
                >
                  PENDING
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedPayment.payment_id, "failed")}
                  className="py-2 bg-red-500/20 border border-red-500/40 text-red-400 font-bold text-[10px] uppercase"
                >
                  FAILED
                </button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <div className="bg-[#16151a] border border-[#282630] text-white p-6 max-w-md w-full font-mono-tech text-xs space-y-4">
          <h3 className="text-base font-bold uppercase text-white">CONFIRM PAYMENT DELETION</h3>
          <p className="text-xs text-[#a19fad]">
            Are you sure you want to delete Payment Record #{deleteId}? This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 py-2 border border-[#282630] bg-[#0f0e13] text-white uppercase"
            >
              CANCEL
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2 bg-red-500 text-white font-bold uppercase hover:bg-red-600"
            >
              DELETE
            </button>
          </div>
        </div>
      </Dialog>
    </AdminLayout>
  );
}