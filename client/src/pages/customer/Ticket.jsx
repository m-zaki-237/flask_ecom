import { useEffect, useState } from "react";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { LifeBuoy, Clock, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
        return <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" /> {status}</Badge>;
      case "in-progress":
        return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" /> In Progress</Badge>;
      default:
        return <Badge variant="info" className="gap-1"><AlertCircle className="h-3 w-3" /> {status}</Badge>;
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 rounded-lg" />
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Support Tickets</h1>
          <p className="text-xs text-slate-500 mt-1">Review inquiry history and status of your customer service requests</p>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-2xs max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <LifeBuoy className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No Support Tickets Created</h2>
            <p className="text-xs text-slate-500 mt-1">
              Need assistance? Click the "Contact Support" button in the navigation or bottom right corner.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.ticket_id} className="overflow-hidden border border-slate-200/80 shadow-xs">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-4 sm:p-5 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">{ticket.subject}</CardTitle>
                      <p className="text-xs text-slate-400 font-medium">Ticket #{ticket.ticket_id}</p>
                    </div>
                  </div>

                  <div>{getStatusBadge(ticket.status)}</div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-3">
                  <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                    {ticket.body}
                  </p>

                  <div className="text-xs text-slate-400 font-medium pt-2 border-t border-slate-100">
                    Created on {new Date(ticket.created_at).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};