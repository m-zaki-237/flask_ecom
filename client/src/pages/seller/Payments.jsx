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
      case "completed": return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] uppercase font-bold">COMPLETED</span>;
      case "pending": return <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] uppercase font-bold">PENDING</span>;
      case "failed": return <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] uppercase font-bold">FAILED</span>;
      default: return <span className="px-2.5 py-1 bg-[#282630] text-white text-[10px] uppercase font-bold">{status}</span>;
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
      <div className="space-y-8 pb-16 font-mono-tech">
        {/* Header */}
        <div className="border border-[#282630] bg-[#16151a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373]">SETTLEMENT RECORDS</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mt-1">
              EARNINGS & PAYOUTS
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
              placeholder="SEARCH PAYMENT ID, ORDER ID, CUSTOMER..."
              className="w-full bg-[#0f0e13] border border-[#282630] pl-9 pr-4 py-2.5 text-xs font-mono-tech text-white placeholder-[#6c697b] focus:outline-none focus:border-[#d4a373]"
            />
          </div>
          <span className="text-xs font-mono-tech text-[#6c697b] uppercase">
            TOTAL PAYOUTS: <strong className="text-white">{filteredPayments.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="border border-[#282630] bg-[#16151a] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#6c697b] animate-pulse">LOADING PAYOUT RECORDS...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <CreditCard className="h-10 w-10 text-[#6c697b] mx-auto" />
              <h3 className="text-base font-bold uppercase text-white">NO PAYOUT RECORDS</h3>
              <p className="text-xs text-[#6c697b]">Settlement transactions will appear here when client orders are processed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#282630] text-[#6c697b] uppercase bg-[#0f0e13]">
                    <th className="p-4 font-bold">PAYMENT ID</th>
                    <th className="p-4 font-bold">ORDER ID</th>
                    <th className="p-4 font-bold">CUSTOMER</th>
                    <th className="p-4 font-bold">PRODUCT</th>
                    <th className="p-4 font-bold">SETTLED AMOUNT</th>
                    <th className="p-4 font-bold">METHOD</th>
                    <th className="p-4 font-bold">STATUS</th>
                    <th className="p-4 font-bold">DATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282630]">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.payment_id} className="hover:bg-[#1c1b22] text-white">
                      <td className="p-4 font-bold text-[#d4a373]">#{payment.payment_id}</td>
                      <td className="p-4 text-[#a19fad]">Order #{payment.order_id}</td>
                      <td className="p-4">
                        <div className="font-bold text-white uppercase">{payment.customer_name || "Customer"}</div>
                        <div className="text-[10px] text-[#6c697b]">{payment.customer_email || "N/A"}</div>
                      </td>
                      <td className="p-4 font-bold uppercase">{payment.product_name || "N/A"}</td>
                      <td className="p-4 font-bold text-emerald-400">
                        ${parseFloat(payment.amount).toFixed(2)} USD
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 border border-[#282630] bg-[#0f0e13] text-white text-[10px] uppercase">
                          {payment.payment_method?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4">{getStatusChip(payment.payment_status)}</td>
                      <td className="p-4 text-[#6c697b]">
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
    </SellerLayout>
  );
};

export default SellerPayments;