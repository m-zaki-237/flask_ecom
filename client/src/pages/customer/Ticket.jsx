import { useEffect, useState } from "react";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { LifeBuoy, Clock, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";

export const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get("/my-support-tickets");
        setTickets(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "resolved":
      case "closed":
        return <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono-tech uppercase tracking-widest">{status}</span>;
      case "in-progress":
        return <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-mono-tech uppercase tracking-widest">IN PROGRESS</span>;
      default:
        return <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] font-mono-tech uppercase tracking-widest">{status || "OPEN"}</span>;
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-[#16151a]" />
          {[1, 2].map((i) => (
            <div key={i} className="h-36 bg-[#16151a] border border-[#282630]" />
          ))}
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="border border-[#282630] bg-[#16151a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373]">CONCIERGE & SUPPORT</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mt-1">
              MY SUPPORT TICKETS ({tickets.length})
            </h1>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="border border-[#282630] bg-[#16151a] p-16 text-center space-y-4 max-w-md mx-auto my-12">
            <LifeBuoy className="h-12 w-12 text-[#6c697b] mx-auto" />
            <h2 className="text-xl font-mono-tech uppercase font-bold text-white">NO TICKETS SUBMITTED</h2>
            <p className="text-xs font-mono-tech text-[#6c697b]">
              Need help with build slots or orders? Use the Concierge Inquire button in the header.
            </p>
          </div>
        ) : (
          <div className="space-y-4 font-mono-tech">
            {tickets.map((ticket) => (
              <div key={ticket.ticket_id} className="border border-[#282630] bg-[#16151a] p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#282630]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#0f0e13] border border-[#282630] text-[#d4a373]">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white uppercase">{ticket.subject}</h3>
                      <span className="text-[11px] text-[#6c697b]">TICKET #{ticket.ticket_id}</span>
                    </div>
                  </div>

                  <div>{getStatusBadge(ticket.status)}</div>
                </div>

                <p className="text-xs text-[#a19fad] leading-relaxed whitespace-pre-wrap">
                  {ticket.body}
                </p>

                <div className="text-[10px] text-[#6c697b] pt-3 border-t border-[#282630] flex justify-between">
                  <span>CREATED ON {new Date(ticket.created_at).toLocaleString()}</span>
                  <span className="text-[#d4a373]">CONCIERGE ASSIGNED</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};