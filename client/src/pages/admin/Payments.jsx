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
      case "completed": return <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full uppercase">Completed</span>;
      case "pending": return <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full uppercase">Pending</span>;
      case "failed": return <span className="px-3 py-1 bg-red-50 text-red-800 border border-red-200 text-xs font-bold rounded-full uppercase">Failed</span>;
      default: return <span className="px-3 py-1 bg-[#F8F7F4] text-[#1A1A1A] border border-[#E8E5DF] text-xs font-bold rounded-full uppercase">{status}</span>;
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
      <div className="space-y-8 pb-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">SYSTEM SETTLEMENTS</span>
            <h1 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A] mt-1">
              Global Payments & Settlements
            </h1>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-[#1A1A1A] text-white font-semibold text-xs rounded-xl hover:bg-[#B8865B] transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Record Payment</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#71717A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Payment ID, Order ID, method..."
              className="w-full bg-white border border-[#E8E5DF] rounded-xl pl-10 pr-4 py-3 text-xs text-[#1A1A1A] placeholder-[#71717A] focus:outline-none focus:border-[#B8865B] shadow-sm"
            />
          </div>
          <span className="text-xs font-semibold text-[#52525B]">
            Total Payments: <strong className="text-[#1A1A1A]">{filteredPayments.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#71717A] animate-pulse">Loading payment transactions...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <CreditCard className="h-12 w-12 text-[#B8865B] mx-auto opacity-60" />
              <h3 className="text-lg font-bold text-[#1A1A1A]">No Payments Recorded</h3>
              <p className="text-xs text-[#6B6B6B]">No payments match your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E5DF] text-[#71717A] uppercase bg-[#F8F7F4]">
                    <th className="p-4 font-bold">Payment ID</th>
                    <th className="p-4 font-bold">Order ID</th>
                    <th className="p-4 font-bold">Amount</th>
                    <th className="p-4 font-bold">Method</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Date</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DF]">
                  {filteredPayments.map((p) => (
                    <tr key={p.payment_id} className="hover:bg-[#F8F7F4] text-[#1A1A1A] transition-colors">
                      <td className="p-4 font-bold text-[#B8865B]">#{p.payment_id}</td>
                      <td className="p-4 text-[#52525B]">Order #{p.order_id}</td>
                      <td className="p-4 font-bold font-display text-sm text-[#16A34A]">${parseFloat(p.amount).toFixed(2)} USD</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-white border border-[#E8E5DF] text-[#52525B] text-xs font-semibold rounded-full uppercase">
                          {p.payment_method?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4">{getStatusChip(p.payment_status)}</td>
                      <td className="p-4 text-[#71717A]">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="p-2 border border-[#E8E5DF] bg-[#F8F7F4] text-[#52525B] hover:text-[#1A1A1A] hover:bg-[#E8E5DF] rounded-xl transition-colors"
                            title="Details / Update"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(p.payment_id)}
                            className="p-2 border border-[#E8E5DF] bg-[#F8F7F4] text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete Payment"
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

      {/* Record Payment Modal */}
      <Dialog open={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="bg-white border border-[#E8E5DF] rounded-2xl text-[#1A1A1A] p-8 max-w-lg w-full shadow-2xl space-y-4 text-xs">
          <DialogHeader className="pb-4 border-b border-[#E8E5DF] flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold font-serif-editorial text-[#1A1A1A]">Record Payment</DialogTitle>
              <DialogDescription className="text-xs text-[#6B6B6B] mt-1">Manual system payment entry.</DialogDescription>
            </div>
            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-[#F8F7F4] rounded-xl">
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <form onSubmit={handleCreatePayment} className="space-y-4 my-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Order ID*</label>
              <input
                type="number"
                value={newPayment.order_id}
                onChange={(e) => setNewPayment({ ...newPayment, order_id: e.target.value })}
                required
                className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Amount (USD)*</label>
              <input
                type="number"
                step="0.01"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                required
                className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Payment Method*</label>
              <select
                value={newPayment.payment_method}
                onChange={(e) => setNewPayment({ ...newPayment, payment_method: e.target.value })}
                className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
              >
                <option value="cash">Cash on Delivery</option>
                <option value="credit_card">Credit / Debit Card</option>
                <option value="digital_wallet">Digital Wallet</option>
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Status*</label>
              <select
                value={newPayment.payment_status}
                onChange={(e) => setNewPayment({ ...newPayment, payment_status: e.target.value })}
                className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-[#1A1A1A] text-white font-semibold text-xs rounded-xl hover:bg-[#B8865B] transition-colors shadow-md"
              >
                {submitting ? "Recording..." : "Save Payment"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Details & Update Status Modal */}
      <Dialog open={!!selectedPayment} onClose={() => setSelectedPayment(null)}>
        {selectedPayment && (
          <div className="bg-white border border-[#E8E5DF] rounded-2xl text-[#1A1A1A] p-8 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <DialogHeader className="pb-4 border-b border-[#E8E5DF] flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold font-serif-editorial text-[#1A1A1A]">Payment #{selectedPayment.payment_id}</DialogTitle>
                <DialogDescription className="text-xs text-[#6B6B6B] mt-1">Order #{selectedPayment.order_id}</DialogDescription>
              </div>
              <button onClick={() => setSelectedPayment(null)} className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-[#F8F7F4] rounded-xl">
                <X className="h-4 w-4" />
              </button>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Settled Amount:</span>
                  <span className="font-bold font-display text-sm text-[#16A34A]">${parseFloat(selectedPayment.amount).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Payment Method:</span>
                  <span className="font-semibold">{selectedPayment.payment_method}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">Update Status:</label>
                <select
                  defaultValue={selectedPayment.payment_status}
                  onChange={(e) => handleStatusUpdate(selectedPayment.payment_id, e.target.value)}
                  className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                className="w-full py-3 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF]"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <div className="bg-white border border-[#E8E5DF] rounded-2xl text-[#1A1A1A] p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
          <DialogHeader className="pb-3 border-b border-[#E8E5DF] flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-bold font-serif-editorial text-[#1A1A1A]">Confirm Payment Removal</DialogTitle>
            <button onClick={() => setDeleteId(null)} className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-[#F8F7F4] rounded-xl">
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <p className="text-xs text-[#6B6B6B]">
            Are you sure you want to delete Payment Record #{deleteId}? This action cannot be undone.
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
              Delete Payment
            </button>
          </div>
        </div>
      </Dialog>
    </AdminLayout>
  );
}