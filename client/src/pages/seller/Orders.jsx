import { useState, useEffect } from "react";
import SellerLayout from "../../components/SellerLayout";
import api from "../../api/axios";
import { ShoppingBag, Search, ChevronLeft, ChevronRight, MoreVertical, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
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

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "pending": return <Badge variant="warning">Pending</Badge>;
      case "processing": return <Badge variant="info">Processing</Badge>;
      case "shipped": return <Badge variant="purple">Shipped</Badge>;
      case "delivered": return <Badge variant="success">Delivered</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.order_id?.toString().includes(searchQuery) ||
    o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Customer Orders</h2>
          <p className="text-xs text-[#64748B] mt-0.5">Fulfill incoming store orders and update shipment statuses</p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E2E8F0] shadow-2xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Customer, or Product..."
              className="pl-9 border-none shadow-none focus-visible:ring-0 text-xs"
            />
          </div>
          <span className="text-xs font-semibold text-[#64748B] pr-2 hidden sm:inline">
            Showing {filteredOrders.length} orders
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
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 px-4">
              <ShoppingBag className="h-10 w-10 text-[#64748B] mx-auto mb-2" />
              <h3 className="font-semibold text-[#0F172A] text-sm">No Customer Orders</h3>
              <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                Orders will show here when customers purchase your products.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.order_id}>
                    <TableCell className="font-mono text-xs font-bold text-[#0F172A]">
                      #{order.order_id}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#0F172A]">
                          {order.customer_name || "Customer"}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          {order.customer_email || "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="font-semibold text-[#0F172A] text-xs max-w-[160px] truncate">
                      {order.product_name || "N/A"}
                    </TableCell>

                    <TableCell className="font-bold text-[#475569]">
                      x{order.quantity}
                    </TableCell>

                    <TableCell className="font-extrabold text-xs text-[#2563EB]">
                      ${parseFloat(order.total_amount || 0).toFixed(2)}
                    </TableCell>

                    <TableCell>{getStatusBadge(order.status)}</TableCell>

                    <TableCell>
                      <Badge variant={order.payment_status === "completed" ? "success" : "warning"} className="capitalize text-xs">
                        {order.payment_status || "pending"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-[#64748B]">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#475569]">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <DropdownMenuItem onClick={() => setStatusModalOrder(order)}>
                          <Edit3 className="h-3.5 w-3.5 mr-2 text-[#16A34A]" />
                          Update Status
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

      {/* Update Status Dialog */}
      <Dialog open={!!statusModalOrder} onClose={() => setStatusModalOrder(null)}>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>Select new status for Order #{statusModalOrder?.order_id}</DialogDescription>
        </DialogHeader>

        {statusModalOrder && (
          <div className="space-y-4 my-2">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Status
              </label>
              <select
                defaultValue={statusModalOrder.status}
                onChange={(e) => updateStatus(statusModalOrder.order_id, e.target.value)}
                className="w-full h-9 rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-medium focus:ring-1 focus:ring-[#16A34A]"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="pt-2">
              <Button variant="outline" onClick={() => setStatusModalOrder(null)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </SellerLayout>
  );
};

export default SellerOrders;