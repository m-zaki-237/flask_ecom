import { useState, useEffect } from "react";
import SellerLayout from "../../components/SellerLayout";
import api from "../../api/axios";
import { CreditCard, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SellerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPayments = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/seller/payments?page=${currentPage}&limit=10`);
      setPayments(res.data?.payments || []);
      setTotalPages(res.data?.pages || 1);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching payouts",
        description: "Could not load payment records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page);
  }, [page]);

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
    p.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.payment_method?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SellerLayout>
      <div className="space-y-8 pb-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">SETTLEMENT LEDGER</span>
            <h1 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A] mt-1">
              Earnings & Payout History
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
              placeholder="Search Payment ID, Order ID, customer..."
              className="w-full bg-white border border-[#E8E5DF] rounded-xl pl-10 pr-4 py-3 text-xs text-[#1A1A1A] placeholder-[#71717A] focus:outline-none focus:border-[#B8865B] shadow-sm"
            />
          </div>
          <span className="text-xs font-semibold text-[#52525B]">
            Total Payout Transactions: <strong className="text-[#1A1A1A]">{filteredPayments.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#71717A] animate-pulse">Loading payout records...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <CreditCard className="h-12 w-12 text-[#B8865B] mx-auto opacity-60" />
              <h3 className="text-lg font-bold text-[#1A1A1A]">No Payout Records</h3>
              <p className="text-xs text-[#6B6B6B]">Settlement transactions will appear here when customer orders are processed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E5DF] text-[#71717A] uppercase bg-[#F8F7F4]">
                    <th className="p-4 font-bold">Payment ID</th>
                    <th className="p-4 font-bold">Order ID</th>
                    <th className="p-4 font-bold">Customer</th>
                    <th className="p-4 font-bold">Product</th>
                    <th className="p-4 font-bold">Settled Amount</th>
                    <th className="p-4 font-bold">Method</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DF]">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.payment_id} className="hover:bg-[#F8F7F4] text-[#1A1A1A] transition-colors">
                      <td className="p-4 font-bold text-[#B8865B]">#{payment.payment_id}</td>
                      <td className="p-4 text-[#52525B]">Order #{payment.order_id}</td>
                      <td className="p-4">
                        <div className="font-bold text-[#1A1A1A]">{payment.customer_name || "Customer"}</div>
                        <div className="text-[11px] text-[#71717A]">{payment.customer_email || "N/A"}</div>
                      </td>
                      <td className="p-4 font-semibold">{payment.product_name || "N/A"}</td>
                      <td className="p-4 font-bold font-display text-sm text-[#16A34A]">
                        ${parseFloat(payment.amount).toFixed(2)} USD
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-white border border-[#E8E5DF] text-[#52525B] text-xs font-semibold rounded-full uppercase">
                          {payment.payment_method?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4">{getStatusChip(payment.payment_status)}</td>
                      <td className="p-4 text-[#71717A]">
                        {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "N/A"}
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
    </SellerLayout>
  );
};

export default SellerPayments;