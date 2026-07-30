import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/axios";
import { FileText, Search, Eye, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filterUser, setFilterUser] = useState("");
  const [activeFilterUser, setActiveFilterUser] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async (currentPage = 1, userIdFilter = "") => {
    setLoading(true);
    try {
      let url = `/audit_logs?page=${currentPage}&limit=10`;
      if (userIdFilter) {
        url += `&user_id=${userIdFilter}`;
      }
      const res = await api.get(url);
      setLogs(res.data?.audit_logs || []);
      setTotalPages(res.data?.pages || 1);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error loading audit logs",
        description: "Failed to retrieve security event records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page, activeFilterUser);
  }, [page, activeFilterUser]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveFilterUser(filterUser.trim());
  };

  const handleClearFilter = () => {
    setFilterUser("");
    setActiveFilterUser("");
    setPage(1);
  };

  const getActionChip = (action) => {
    const act = action?.toUpperCase();
    if (act?.includes("CREATE")) return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] uppercase font-bold">CREATE</span>;
    if (act?.includes("UPDATE")) return <span className="px-2.5 py-1 bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/40 text-[10px] uppercase font-bold">UPDATE</span>;
    if (act?.includes("DELETE")) return <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] uppercase font-bold">DELETE</span>;
    return <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] uppercase font-bold">{action}</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16 font-mono-tech">
        {/* Header */}
        <div className="border border-[#282630] bg-[#16151a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373]">SECURITY & IMMUTABLE RECORDS</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mt-1">
              SYSTEM AUDIT LOGS
            </h1>
          </div>
        </div>

        {/* Filter Bar */}
        <form onSubmit={handleApplyFilter} className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#282630] pb-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#6c697b]" />
              <input
                type="text"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                placeholder="FILTER BY USER ID..."
                className="w-full bg-[#0f0e13] border border-[#282630] pl-9 pr-4 py-2.5 text-xs font-mono-tech text-white placeholder-[#6c697b] focus:outline-none focus:border-[#d4a373]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-white text-black font-bold text-xs uppercase hover:bg-[#d4a373] transition-colors"
            >
              FILTER
            </button>
            {activeFilterUser && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="px-3 py-2.5 border border-[#282630] bg-[#0f0e13] text-xs text-[#6c697b] hover:text-white uppercase"
              >
                CLEAR
              </button>
            )}
          </div>
          <span className="text-xs font-mono-tech text-[#6c697b] uppercase">
            AUDIT RECORDS: <strong className="text-white">{logs.length}</strong>
          </span>
        </form>

        {/* Table */}
        <div className="border border-[#282630] bg-[#16151a] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#6c697b] animate-pulse">LOADING AUDIT TRAIL...</div>
          ) : logs.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <FileText className="h-10 w-10 text-[#6c697b] mx-auto" />
              <h3 className="text-base font-bold uppercase text-white">NO LOGS FOUND</h3>
              <p className="text-xs text-[#6c697b]">No audit logs recorded for this parameter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#282630] text-[#6c697b] uppercase bg-[#0f0e13]">
                    <th className="p-4 font-bold">LOG ID</th>
                    <th className="p-4 font-bold">USER ID</th>
                    <th className="p-4 font-bold">ACTION PERFORMED</th>
                    <th className="p-4 font-bold">TIMESTAMP</th>
                    <th className="p-4 font-bold text-right">DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282630]">
                  {logs.map((log) => (
                    <tr key={log.log_id} className="hover:bg-[#1c1b22] text-white">
                      <td className="p-4 font-bold text-[#d4a373]">#{log.log_id}</td>
                      <td className="p-4 text-[#a19fad]">User #{log.user_id}</td>
                      <td className="p-4 font-bold">{getActionChip(log.action)}</td>
                      <td className="p-4 text-[#6c697b]">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-2 border border-[#282630] bg-[#0f0e13] text-[#a19fad] hover:text-white hover:border-[#d4a373]"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
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

      {/* Log Details Modal */}
      <Dialog open={!!selectedLog} onClose={() => setSelectedLog(null)}>
        {selectedLog && (
          <div className="bg-[#16151a] border border-[#282630] text-white p-6 max-w-lg w-full font-mono-tech text-xs space-y-4">
            <DialogHeader className="pb-2 border-b border-[#282630] flex flex-row items-center justify-between">
              <DialogTitle className="text-base uppercase font-bold text-white">SECURITY AUDIT ENTRY #{selectedLog.log_id}</DialogTitle>
              <button onClick={() => setSelectedLog(null)} className="p-1 text-[#6c697b] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </DialogHeader>

            <div className="space-y-3 p-4 bg-[#0f0e13] border border-[#282630]">
              <div className="flex justify-between">
                <span className="text-[#6c697b]">USER ID:</span>
                <span className="text-white font-bold">User #{selectedLog.user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c697b]">ACTION TYPE:</span>
                <div>{getActionChip(selectedLog.action)}</div>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c697b]">TIMESTAMP:</span>
                <span className="text-white">{selectedLog.timestamp ? new Date(selectedLog.timestamp).toLocaleString() : "N/A"}</span>
              </div>
              {selectedLog.details && (
                <div>
                  <span className="text-[#6c697b]">PAYLOAD / DETAILS:</span>
                  <pre className="mt-1 p-3 bg-[#16151a] border border-[#282630] text-[11px] text-[#d4a373] overflow-x-auto">
                    {typeof selectedLog.details === "string"
                      ? selectedLog.details
                      : JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2.5 border border-[#282630] bg-[#0f0e13] text-xs uppercase text-white hover:border-white"
            >
              CLOSE
            </button>
          </div>
        )}
      </Dialog>
    </AdminLayout>
  );
}