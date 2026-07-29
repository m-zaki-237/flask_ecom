import { useState, useEffect } from "react";
import SellerLayout from "../../components/SellerLayout";
import api from "../../api/axios";
import { CreditCard, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "completed": return <Badge variant="success">Completed</Badge>;
      case "pending": return <Badge variant="warning">Pending</Badge>;
      case "failed": return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Earnings & Payouts</h2>
          <p className="text-xs text-[#64748B] mt-0.5">Transaction settlements and customer payouts for store sales</p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E2E8F0] shadow-2xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search payouts by Payment ID, Order ID, Customer, Product, or Method..."
              className="pl-9 border-none shadow-none focus-visible:ring-0 text-xs"
            />
          </div>
          <span className="text-xs font-semibold text-[#64748B] pr-2 hidden sm:inline">
            Showing {filteredPayments.length} payouts
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-16 px-4">
              <CreditCard className="h-10 w-10 text-[#64748B] mx-auto mb-2" />
              <h3 className="font-semibold text-[#0F172A] text-sm">No Payout Records</h3>
              <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                Payout settlements will appear here when orders are completed.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Settled Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
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

                    <TableCell className="font-semibold text-[#0F172A] text-xs max-w-[160px] truncate">
                      {payment.product_name || "N/A"}
                    </TableCell>

                    <TableCell className="font-extrabold text-[#15803D]">
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
    </SellerLayout>
  );
};

export default SellerPayments;