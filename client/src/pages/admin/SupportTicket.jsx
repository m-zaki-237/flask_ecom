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
      case "closed": return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] uppercase font-bold">{status}</span>;
      case "in-progress": return <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] uppercase font-bold">IN PROGRESS</span>;
      default: return <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] uppercase font-bold">{status || "OPEN"}</span>;
    }
  };

  const filteredTickets = tickets.filter((t) =>
    t.ticket_id?.toString().includes(searchQuery) ||
    t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user_id?.toString().includes(searchQuery)
  );

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16 font-mono-tech">
        {/* Header */}
        <div className="border border-[#282630] bg-[#16151a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373]">CONCIERGE & SUPPORT SYSTEM</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mt-1">
              SUPPORT TICKET QUEUE
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
              placeholder="SEARCH SUBJECT, TICKET ID, OR USER ID..."
              className="w-full bg-[#0f0e13] border border-[#282630] pl-9 pr-4 py-2.5 text-xs font-mono-tech text-white placeholder-[#6c697b] focus:outline-none focus:border-[#d4a373]"
            />
          </div>
          <span className="text-xs font-mono-tech text-[#6c697b] uppercase">
            TOTAL TICKETS: <strong className="text-white">{filteredTickets.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="border border-[#282630] bg-[#16151a] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#6c697b] animate-pulse">LOADING SUPPORT QUEUE...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <LifeBuoy className="h-10 w-10 text-[#6c697b] mx-auto" />
              <h3 className="text-base font-bold uppercase text-white">NO TICKETS FOUND</h3>
              <p className="text-xs text-[#6c697b]">No support tickets match your search parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#282630] text-[#6c697b] uppercase bg-[#0f0e13]">
                    <th className="p-4 font-bold">TICKET ID</th>
                    <th className="p-4 font-bold">SUBJECT</th>
                    <th className="p-4 font-bold">USER ID</th>
                    <th className="p-4 font-bold">STATUS</th>
                    <th className="p-4 font-bold">CREATED DATE</th>
                    <th className="p-4 font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282630]">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.ticket_id} className="hover:bg-[#1c1b22] text-white">
                      <td className="p-4 font-bold text-[#d4a373]">#{ticket.ticket_id}</td>
                      <td className="p-4 font-bold uppercase truncate max-w-[240px]">{ticket.subject}</td>
                      <td className="p-4 text-[#a19fad]">User #{ticket.user_id}</td>
                      <td className="p-4">{getStatusChip(ticket.status)}</td>
                      <td className="p-4 text-[#6c697b]">
                        {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="p-2 border border-[#282630] bg-[#0f0e13] text-[#a19fad] hover:text-white hover:border-[#d4a373]"
                            title="View / Resolve"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(ticket.ticket_id)}
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

      {/* Ticket Details & Update Modal */}
      <Dialog open={!!selectedTicket} onClose={() => setSelectedTicket(null)}>
        {selectedTicket && (
          <div className="bg-[#16151a] border border-[#282630] text-white p-6 max-w-lg w-full font-mono-tech text-xs space-y-4">
            <DialogHeader className="pb-2 border-b border-[#282630] flex flex-row items-center justify-between">
              <DialogTitle className="text-base uppercase font-bold text-white">SUPPORT TICKET #{selectedTicket.ticket_id}</DialogTitle>
              <button onClick={() => setSelectedTicket(null)} className="p-1 text-[#6c697b] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </DialogHeader>

            <div className="space-y-3 p-4 bg-[#0f0e13] border border-[#282630]">
              <div className="flex justify-between">
                <span className="text-[#6c697b]">USER ID:</span>
                <span className="text-white font-bold">User #{selectedTicket.user_id}</span>
              </div>
              <div>
                <span className="text-[#6c697b]">SUBJECT:</span>
                <p className="font-bold text-white uppercase mt-0.5">{selectedTicket.subject}</p>
              </div>
              <div>
                <span className="text-[#6c697b]">MESSAGE BODY:</span>
                <p className="text-xs text-[#a19fad] mt-1 whitespace-pre-wrap leading-relaxed">{selectedTicket.body}</p>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <label className="block text-[#a19fad] uppercase">UPDATE TICKET STATUS:</label>
              <select
                defaultValue={selectedTicket.status}
                onChange={(e) => handleStatusUpdate(selectedTicket.ticket_id, e.target.value)}
                className="w-full bg-[#0f0e13] border border-[#282630] p-2.5 text-xs text-white focus:outline-none focus:border-[#d4a373] uppercase"
              >
                <option value="open">OPEN</option>
                <option value="in-progress">IN PROGRESS</option>
                <option value="resolved">RESOLVED</option>
                <option value="closed">CLOSED</option>
              </select>
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-2.5 border border-[#282630] bg-[#0f0e13] text-xs uppercase text-white hover:border-white"
            >
              CLOSE
            </button>
          </div>
        )}
      </Dialog>

      {/* Delete Ticket Modal */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <div className="bg-[#16151a] border border-[#282630] text-white p-6 max-w-md w-full font-mono-tech text-xs space-y-4">
          <h3 className="text-base font-bold uppercase text-white">CONFIRM TICKET REMOVAL</h3>
          <p className="text-xs text-[#a19fad]">
            Are you sure you want to delete Ticket #{deleteId}? This action cannot be undone.
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
              DELETE TICKET
            </button>
          </div>
        </div>
      </Dialog>
    </AdminLayout>
  );
}