import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/axios";
import { LifeBuoy, Search, Trash2, Eye, ChevronLeft, ChevronRight, AlertCircle, MoreVertical, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function SupportTicket() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchTickets = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/support_tickets?page=${currentPage}&limit=10`);
      setTickets(res.data?.support_tickets || []);
      setTotalPages(res.data?.pages || 1);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error loading tickets",
        description: "Failed to retrieve support ticket queue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(page);
  }, [page]);

  const handleStatusUpdate = async (ticket_id, status) => {
    try {
      await api.put(`/support_tickets/${ticket_id}/status`, { status });
      toast({
        title: "Ticket Updated",
        description: `Ticket #${ticket_id} status updated to ${status}`,
        variant: "success",
      });
      setSelectedTicket(null);
      fetchTickets(page);
    } catch (err) {
      console.error(err);
      toast({
        title: "Update Failed",
        description: "Could not update ticket status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/support_tickets/${deleteId}`);
      toast({
        title: "Ticket Removed",
        description: `Ticket #${deleteId} was deleted`,
        variant: "success",
      });
      setDeleteId(null);
      fetchTickets(page);
    } catch (err) {
      console.error(err);
      toast({
        title: "Deletion Failed",
        description: "Could not remove support ticket",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "resolved":
      case "closed": return <Badge variant="success">{status}</Badge>;
      case "in-progress": return <Badge variant="warning">In Progress</Badge>;
      default: return <Badge variant="info">{status}</Badge>;
    }
  };

  const filteredTickets = tickets.filter((t) =>
    t.ticket_id?.toString().includes(searchQuery) ||
    t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user_id?.toString().includes(searchQuery)
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Support Ticket Queue</h2>
          <p className="text-xs text-[#64748B] mt-0.5">Manage customer support inquiries and update ticket statuses</p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E2E8F0] shadow-2xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets by Subject, Ticket ID, or User ID..."
              className="pl-9 border-none shadow-none focus-visible:ring-0 text-xs"
            />
          </div>
          <span className="text-xs font-semibold text-[#64748B] pr-2 hidden sm:inline">
            Showing {filteredTickets.length} tickets
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
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-16 px-4">
              <LifeBuoy className="h-10 w-10 text-[#64748B] mx-auto mb-2" />
              <h3 className="font-semibold text-[#0F172A] text-sm">No Support Tickets Found</h3>
              <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                No tickets match your search parameters.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.ticket_id}>
                    <TableCell className="font-mono text-xs font-bold text-[#0F172A]">
                      #{ticket.ticket_id}
                    </TableCell>

                    <TableCell className="font-semibold text-[#0F172A] text-xs max-w-[200px] truncate">
                      {ticket.subject}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-[#475569]">
                      User #{ticket.user_id}
                    </TableCell>

                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>

                    <TableCell className="text-xs text-[#64748B]">
                      {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "N/A"}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#475569]">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <DropdownMenuItem onClick={() => setSelectedTicket(ticket)}>
                          <Eye className="h-3.5 w-3.5 mr-2 text-[#2563EB]" />
                          View Ticket
                        </DropdownMenuItem>
                        <DropdownMenuItem destructive onClick={() => setDeleteId(ticket.ticket_id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete Ticket
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

      {/* Ticket Details & Status Modal */}
      <Dialog open={!!selectedTicket} onClose={() => setSelectedTicket(null)}>
        <DialogHeader>
          <DialogTitle>Support Ticket Details</DialogTitle>
          <DialogDescription>Ticket #{selectedTicket?.ticket_id}</DialogDescription>
        </DialogHeader>

        {selectedTicket && (
          <div className="space-y-4 my-2 text-sm">
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#64748B]">User ID:</span>
                <span className="font-mono text-xs font-bold text-[#0F172A]">User #{selectedTicket.user_id}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-[#64748B]">Subject:</span>
                <p className="font-bold text-[#0F172A] mt-0.5">{selectedTicket.subject}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-[#64748B]">Description:</span>
                <p className="text-xs text-[#475569] mt-0.5 whitespace-pre-wrap leading-relaxed">{selectedTicket.body}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Update Status
              </label>
              <select
                defaultValue={selectedTicket.status}
                onChange={(e) => handleStatusUpdate(selectedTicket.ticket_id, e.target.value)}
                className="w-full h-9 rounded-md border border-[#CBD5E1] bg-white px-3 text-sm font-medium focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="pt-2">
              <Button variant="outline" onClick={() => setSelectedTicket(null)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Ticket Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#DC2626] font-semibold text-sm">
            <AlertCircle className="h-5 w-5" />
            <span>Confirm Ticket Removal</span>
          </div>
          <DialogTitle className="mt-1">Delete Ticket #{deleteId}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The ticket will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="flex-1">
            Delete Ticket
          </Button>
        </div>
      </Dialog>
    </AdminLayout>
  );
}