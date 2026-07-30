import { useEffect, useState } from "react";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { LifeBuoy, Clock, CheckCircle2, AlertCircle, MessageSquare, Headphones } from "lucide-react";

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
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full uppercase tracking-wider">Resolved</span>;
      case "in-progress":
        return <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full uppercase tracking-wider">In Progress</span>;
      default:
        return <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-full uppercase tracking-wider">{status || "Open"}</span>;
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="space-y-6 animate-pulse py-8">
          <div className="h-8 w-48 bg-[#E8E5DF] rounded-lg" />
          {[1, 2].map((i) => (
            <div key={i} className="h-36 bg-[#F8F7F4] rounded-2xl border border-[#E8E5DF]" />
          ))}
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-10 pb-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">CLIENT ASSISTANCE</span>
            <h1 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A] mt-1">
              Concierge Support Tickets ({tickets.length})
            </h1>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="rounded-3xl border border-[#E8E5DF] bg-[#F8F7F4] p-16 text-center space-y-4 max-w-md mx-auto my-12">
            <Headphones className="h-14 w-14 text-[#B8865B] mx-auto opacity-70" />
            <h2 className="text-2xl font-serif-editorial font-bold text-[#1A1A1A]">No Active Support Tickets</h2>
            <p className="text-xs text-[#6B6B6B]">
              Have questions regarding bespoke orders or deliveries? Use the Concierge Support button in the navigation header to reach out 24/7.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div key={ticket.ticket_id} className="bg-white rounded-2xl border border-[#E8E5DF] p-6 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E5DF]">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#F4EFEA] text-[#B8865B] rounded-xl">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A1A1A]">{ticket.subject}</h3>
                      <span className="text-xs text-[#71717A] font-semibold">Ticket ID: #{ticket.ticket_id}</span>
                    </div>
                  </div>

                  <div>{getStatusBadge(ticket.status)}</div>
                </div>

                <p className="text-xs text-[#52525B] leading-relaxed whitespace-pre-wrap">
                  {ticket.body}
                </p>

                <div className="text-[11px] text-[#71717A] pt-4 border-t border-[#E8E5DF] flex justify-between font-medium">
                  <span>Created on {new Date(ticket.created_at).toLocaleString()}</span>
                  <span className="text-[#B8865B] font-bold">24/7 Priority Concierge</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};