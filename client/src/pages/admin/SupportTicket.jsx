import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/axios";
import { LifeBuoy, Search, Trash2, Eye, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

  const getStatusChip = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "resolved":
      case "closed": return <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full uppercase">{status}</span>;
      case "in-progress": return <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full uppercase">In Progress</span>;
      default: return <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-full uppercase">{status || "Open"}</span>;
    }
  };

  const filteredTickets = tickets.filter((t) =>
    t.ticket_id?.toString().includes(searchQuery) ||
    t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user_id?.toString().includes(searchQuery)
  );

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">CONCIERGE & SUPPORT</span>
            <h1 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A] mt-1">
              Support Ticket Queue
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
              placeholder="Search subject, Ticket ID, or User ID..."
              className="w-full bg-white border border-[#E8E5DF] rounded-xl pl-10 pr-4 py-3 text-xs text-[#1A1A1A] placeholder-[#71717A] focus:outline-none focus:border-[#B8865B] shadow-sm"
            />
          </div>
          <span className="text-xs font-semibold text-[#52525B]">
            Total Tickets: <strong className="text-[#1A1A1A]">{filteredTickets.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#71717A] animate-pulse">Loading support queue...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <LifeBuoy className="h-12 w-12 text-[#B8865B] mx-auto opacity-60" />
              <h3 className="text-lg font-bold text-[#1A1A1A]">No Support Tickets</h3>
              <p className="text-xs text-[#6B6B6B]">No support tickets match your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E5DF] text-[#71717A] uppercase bg-[#F8F7F4]">
                    <th className="p-4 font-bold">Ticket ID</th>
                    <th className="p-4 font-bold">Subject</th>
                    <th className="p-4 font-bold">User ID</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Created Date</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DF]">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.ticket_id} className="hover:bg-[#F8F7F4] text-[#1A1A1A] transition-colors">
                      <td className="p-4 font-bold text-[#B8865B]">#{ticket.ticket_id}</td>
                      <td className="p-4 font-bold truncate max-w-[240px]">{ticket.subject}</td>
                      <td className="p-4 text-[#52525B]">User #{ticket.user_id}</td>
                      <td className="p-4">{getStatusChip(ticket.status)}</td>
                      <td className="p-4 text-[#71717A]">
                        {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="p-2 border border-[#E8E5DF] bg-[#F8F7F4] text-[#52525B] hover:text-[#1A1A1A] hover:bg-[#E8E5DF] rounded-xl transition-colors"
                            title="View / Update Ticket"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(ticket.ticket_id)}
                            className="p-2 border border-[#E8E5DF] bg-[#F8F7F4] text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete Ticket"
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

      {/* Ticket Details & Update Modal */}
      <Dialog open={!!selectedTicket} onClose={() => setSelectedTicket(null)}>
        {selectedTicket && (
          <div className="bg-white border border-[#E8E5DF] rounded-2xl text-[#1A1A1A] p-8 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <DialogHeader className="pb-4 border-b border-[#E8E5DF] flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold font-serif-editorial text-[#1A1A1A]">Support Ticket #{selectedTicket.ticket_id}</DialogTitle>
                <DialogDescription className="text-xs text-[#6B6B6B] mt-1">Submitted by User #{selectedTicket.user_id}</DialogDescription>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-[#F8F7F4] rounded-xl">
                <X className="h-4 w-4" />
              </button>
            </DialogHeader>

            <div className="space-y-3 p-4 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF]">
              <div>
                <span className="text-[#71717A] font-bold block mb-1">Subject:</span>
                <p className="font-bold text-[#1A1A1A] text-sm">{selectedTicket.subject}</p>
              </div>
              <div>
                <span className="text-[#71717A] font-bold block mb-1">Message Body:</span>
                <p className="text-xs text-[#52525B] whitespace-pre-wrap leading-relaxed">{selectedTicket.body}</p>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A]">Update Status:</label>
              <select
                defaultValue={selectedTicket.status}
                onChange={(e) => handleStatusUpdate(selectedTicket.ticket_id, e.target.value)}
                className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-3 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF]"
            >
              Close
            </button>
          </div>
        )}
      </Dialog>

      {/* Delete Ticket Modal */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <div className="bg-white border border-[#E8E5DF] rounded-2xl text-[#1A1A1A] p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
          <DialogHeader className="pb-3 border-b border-[#E8E5DF] flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-bold font-serif-editorial text-[#1A1A1A]">Confirm Ticket Removal</DialogTitle>
            <button onClick={() => setDeleteId(null)} className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-[#F8F7F4] rounded-xl">
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <p className="text-xs text-[#6B6B6B]">
            Are you sure you want to delete Ticket #{deleteId}? This action cannot be undone.
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
              Delete Ticket
            </button>
          </div>
        </div>
      </Dialog>
    </AdminLayout>
  );
}