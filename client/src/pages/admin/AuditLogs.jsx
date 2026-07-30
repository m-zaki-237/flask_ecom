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
    if (act?.includes("CREATE")) return <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full uppercase">Create</span>;
    if (act?.includes("UPDATE")) return <span className="px-3 py-1 bg-[#F4EFEA] text-[#B8865B] border border-[#E8E5DF] text-xs font-bold rounded-full uppercase">Update</span>;
    if (act?.includes("DELETE")) return <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-full uppercase">Delete</span>;
    return <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-full uppercase">{action}</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">SECURITY LOGS</span>
            <h1 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A] mt-1">
              System Audit & Trail Logs
            </h1>
          </div>
        </div>

        {/* Filter Bar */}
        <form onSubmit={handleApplyFilter} className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#71717A]" />
              <input
                type="text"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                placeholder="Filter by User ID..."
                className="w-full bg-white border border-[#E8E5DF] rounded-xl pl-10 pr-4 py-3 text-xs text-[#1A1A1A] placeholder-[#71717A] focus:outline-none focus:border-[#B8865B] shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-[#1A1A1A] text-white font-semibold text-xs rounded-xl hover:bg-[#B8865B] transition-colors"
            >
              Filter
            </button>
            {activeFilterUser && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="px-4 py-3 border border-[#E8E5DF] bg-[#F8F7F4] text-xs text-[#52525B] hover:text-[#1A1A1A] rounded-xl uppercase font-semibold"
              >
                Clear
              </button>
            )}
          </div>
          <span className="text-xs font-semibold text-[#52525B]">
            Audit Records: <strong className="text-[#1A1A1A]">{logs.length}</strong>
          </span>
        </form>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#71717A] animate-pulse">Loading audit trail...</div>
          ) : logs.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <FileText className="h-12 w-12 text-[#B8865B] mx-auto opacity-60" />
              <h3 className="text-lg font-bold text-[#1A1A1A]">No Audit Logs</h3>
              <p className="text-xs text-[#6B6B6B]">No audit records found for this query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E5DF] text-[#71717A] uppercase bg-[#F8F7F4]">
                    <th className="p-4 font-bold">Log ID</th>
                    <th className="p-4 font-bold">User ID</th>
                    <th className="p-4 font-bold">Action Performed</th>
                    <th className="p-4 font-bold">Timestamp</th>
                    <th className="p-4 font-bold text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DF]">
                  {logs.map((log) => (
                    <tr key={log.log_id} className="hover:bg-[#F8F7F4] text-[#1A1A1A] transition-colors">
                      <td className="p-4 font-bold text-[#B8865B]">#{log.log_id}</td>
                      <td className="p-4 text-[#52525B]">User #{log.user_id}</td>
                      <td className="p-4">{getActionChip(log.action)}</td>
                      <td className="p-4 text-[#71717A]">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-2 border border-[#E8E5DF] bg-[#F8F7F4] text-[#52525B] hover:text-[#1A1A1A] hover:bg-[#E8E5DF] rounded-xl transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
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

      {/* Log Details Modal */}
      <Dialog open={!!selectedLog} onClose={() => setSelectedLog(null)}>
        {selectedLog && (
          <div className="bg-white border border-[#E8E5DF] rounded-2xl text-[#1A1A1A] p-8 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <DialogHeader className="pb-3 border-b border-[#E8E5DF] flex flex-row items-center justify-between">
              <DialogTitle className="text-lg font-bold font-serif-editorial text-[#1A1A1A]">Audit Entry #{selectedLog.log_id}</DialogTitle>
              <button onClick={() => setSelectedLog(null)} className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-[#F8F7F4] rounded-xl">
                <X className="h-4 w-4" />
              </button>
            </DialogHeader>

            <div className="space-y-3 p-4 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF]">
              <div className="flex justify-between">
                <span className="text-[#71717A]">User ID:</span>
                <span className="text-[#1A1A1A] font-bold">User #{selectedLog.user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Action Type:</span>
                <div>{getActionChip(selectedLog.action)}</div>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Timestamp:</span>
                <span className="text-[#1A1A1A]">{selectedLog.timestamp ? new Date(selectedLog.timestamp).toLocaleString() : "N/A"}</span>
              </div>
              {selectedLog.details && (
                <div>
                  <span className="text-[#71717A] font-bold block mb-1">Payload Details:</span>
                  <pre className="p-3 rounded-xl bg-white border border-[#E8E5DF] text-[11px] text-[#B8865B] overflow-x-auto">
                    {typeof selectedLog.details === "string"
                      ? selectedLog.details
                      : JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-3 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF]"
            >
              Close
            </button>
          </div>
        )}
      </Dialog>
    </AdminLayout>
  );
}