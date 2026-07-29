import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/axios";
import { Plus, Search, Trash2, Eye, ChevronLeft, ChevronRight, CreditCard, AlertCircle, MoreVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
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

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "completed": return <Badge variant="success">Completed</Badge>;
      case "pending": return <Badge variant="warning">Pending</Badge>;
      case "failed": return <Badge variant="destructive">Failed</Badge>;
      case "refunded": return <Badge variant="outline">Refunded</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter((p) =>
    p.payment_id?.toString().includes(searchQuery) ||
    p.order_id?.toString().includes(searchQuery) ||
    p.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.payment_method?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Payments & Transactions</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Audit transaction history, customer payments, and statuses</p>
          </div>

          <Button onClick={() => setShowAddModal(true)} variant="primary" className="gap-2 shadow-2xs">
            <Plus className="h-4 w-4" />
            <span>Add Payment</span>
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E2E8F0] shadow-2xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search payments by Payment ID, Order ID, Customer, or Method..."
              className="pl-9 border-none shadow-none focus-visible:ring-0 text-xs"
            />
          </div>
          <span className="text-xs font-semibold text-[#64748B] pr-2 hidden sm:inline">
            Showing {filteredPayments.length} transactions
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-16 px-4">
              <CreditCard className="h-10 w-10 text-[#64748B] mx-auto mb-2" />
              <h3 className="font-semibold text-[#0F172A] text-sm">No Payments Found</h3>
              <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                No payment transactions match your query.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.payment_id}>
                    <TableCell className="font-mono text-xs font-bold text-[#0F172A]">
                      #{payment.payment_id}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-[#475569]">
                      Order #{payment.order_id}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#0F172A]">
                          {payment.customer_name || "Customer"}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          {payment.customer_email || "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="font-extrabold text-[#2563EB]">
                      ${parseFloat(payment.amount).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs capitalize">
                        {payment.payment_method?.replace("_", " ")}
                      </Badge>
                    </TableCell>

                    <TableCell>{getStatusBadge(payment.payment_status)}</TableCell>

                    <TableCell className="text-xs text-[#64748B]">
                      {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "N/A"}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#475569]">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <DropdownMenuItem onClick={() => setSelectedPayment(payment)}>
                          <Eye className="h-3.5 w-3.5 mr-2 text-[#2563EB]" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem destructive onClick={() => setDeleteId(payment.payment_id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete Payment
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
              <span className="text-xs text-[#64748B] font-medium">
                Page <span className="font-bold text-[#0F172A]">{page}</span> of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 text-xs"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Detail Modal */}
      <Dialog open={!!selectedPayment} onClose={() => setSelectedPayment(null)}>
        <DialogHeader>
          <DialogTitle>Transaction & Order Details</DialogTitle>
          <DialogDescription>Payment #{selectedPayment?.payment_id}</DialogDescription>
        </DialogHeader>

        {selectedPayment && (
          <div className="space-y-4 my-2 text-sm">
            {/* Customer & Order Info Card */}
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-xs text-[#64748B] font-semibold">Customer:</span>
                <div className="text-right">
                  <p className="font-bold text-xs text-[#0F172A]">{selectedPayment.customer_name || "Customer"}</p>
                  <p className="text-[11px] text-[#64748B]">{selectedPayment.customer_email || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[#64748B]">Order ID:</span>{" "}
                  <span className="font-bold text-[#0F172A]">#{selectedPayment.order_id}</span>
                </div>
                <div>
                  <span className="text-[#64748B]">Amount:</span>{" "}
                  <span className="font-extrabold text-[#2563EB]">${parseFloat(selectedPayment.amount).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[#64748B]">Method:</span>{" "}
                  <span className="font-semibold text-[#0F172A] capitalize">{selectedPayment.payment_method?.replace("_", " ")}</span>
                </div>
                <div>
                  <span className="text-[#64748B]">Date:</span>{" "}
                  <span className="text-[#0F172A]">{selectedPayment.created_at ? new Date(selectedPayment.created_at).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Purchased Products List */}
            {selectedPayment.products && selectedPayment.products.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">Purchased Products:</span>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {selectedPayment.products.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E2E8F0] text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_name} className="h-8 w-8 rounded-md object-cover border border-slate-200 shrink-0" />
                        ) : (
                          <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <CreditCard className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-[#0F172A] truncate">{item.product_name}</p>
                          <p className="text-[11px] text-[#64748B]">Qty: {item.quantity} × ${parseFloat(item.unit_price || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#0F172A] shrink-0">${parseFloat(item.total_price || (item.unit_price * item.quantity)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Update Payment Status
              </label>
              <select
                defaultValue={selectedPayment.payment_status}
                onChange={(e) => handleStatusUpdate(selectedPayment.payment_id, e.target.value)}
                className="w-full h-9 rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-medium focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="pt-2">
              <Button variant="outline" onClick={() => setSelectedPayment(null)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Add Payment Modal */}
      <Dialog open={showAddModal} onClose={() => setShowAddModal(false)}>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>Enter details to manually record an order payment.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreatePayment} className="space-y-4 my-2">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Order ID</label>
            <Input
              type="number"
              value={newPayment.order_id}
              onChange={(e) => setNewPayment({ ...newPayment, order_id: e.target.value })}
              placeholder="e.g. 101"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Amount ($)</label>
            <Input
              type="number"
              step="0.01"
              value={newPayment.amount}
              onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
              placeholder="49.99"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Payment Method</label>
            <select
              value={newPayment.payment_method}
              onChange={(e) => setNewPayment({ ...newPayment, payment_method: e.target.value })}
              className="w-full h-9 rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-medium"
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="cash">Cash on Delivery</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting} className="flex-1 gap-2">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Payment</span>
              )}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#DC2626] font-semibold text-sm">
            <AlertCircle className="h-5 w-5" />
            <span>Confirm Payment Removal</span>
          </div>
          <DialogTitle className="mt-1">Delete Payment #{deleteId}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The transaction record will be deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="flex-1">
            Delete Payment
          </Button>
        </div>
      </Dialog>
    </AdminLayout>
  );
}