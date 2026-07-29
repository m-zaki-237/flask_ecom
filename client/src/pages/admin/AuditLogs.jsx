import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/axios";
import { FileText, Search, Eye, ChevronLeft, ChevronRight, Filter, X, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
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

  const getActionBadge = (action) => {
    const act = action?.toUpperCase();
    if (act?.includes("CREATE")) return <Badge variant="success">CREATE</Badge>;
    if (act?.includes("UPDATE")) return <Badge variant="info">UPDATE</Badge>;
    if (act?.includes("DELETE")) return <Badge variant="destructive">DELETE</Badge>;
    if (act?.includes("LOGIN") || act?.includes("LOGOUT")) return <Badge variant="purple">{act}</Badge>;
    return <Badge variant="outline">{action}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">Security Audit Logs</h2>
          <p className="text-xs text-[#64748B] mt-0.5">Immutable record of system actions, mutations, and user activities</p>
        </div>

        {/* Filter Bar */}
        <form onSubmit={handleApplyFilter} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E2E8F0] shadow-2xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
            <Input
              type="text"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              placeholder="Filter by User ID (e.g. 5)..."
              className="pl-9 border-none shadow-none focus-visible:ring-0 text-xs"
            />
          </div>

          <Button type="submit" variant="primary" size="sm" className="gap-1.5 text-xs h-8">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>

          {activeFilterUser && (
            <Button type="button" variant="outline" size="sm" onClick={handleClearFilter} className="gap-1 text-xs h-8">
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </form>

        {/* Table */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <FileText className="h-10 w-10 text-[#64748B] mx-auto mb-2" />
              <h3 className="font-semibold text-[#0F172A] text-sm">No Audit Logs Found</h3>
              <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                {activeFilterUser ? `No logs found for User #${activeFilterUser}.` : "No system events recorded."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Log ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target Entity</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.log_id}>
                    <TableCell className="font-mono text-xs font-bold text-[#0F172A]">
                      #{log.log_id}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-[#475569]">
                      User #{log.user_id}
                    </TableCell>

                    <TableCell>{getActionBadge(log.action)}</TableCell>

                    <TableCell className="text-xs font-mono text-[#475569]">
                      {log.table_name || "System"} {log.record_id ? `#${log.record_id}` : ""}
                    </TableCell>

                    <TableCell className="text-xs text-[#64748B]">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "N/A"}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#475569]">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <DropdownMenuItem onClick={() => setSelectedLog(log)}>
                          <Eye className="h-3.5 w-3.5 mr-2 text-[#2563EB]" />
                          View Log Details
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

      {/* Log Details Modal */}
      <Dialog open={!!selectedLog} onClose={() => setSelectedLog(null)}>
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
          <DialogDescription>Log Event #{selectedLog?.log_id}</DialogDescription>
        </DialogHeader>

        {selectedLog && (
          <div className="space-y-4 my-2 text-xs">
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-[#64748B]">User ID:</span>
                <span className="font-bold text-[#0F172A]">#{selectedLog.user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Action:</span>
                <span className="font-bold text-[#2563EB]">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Entity:</span>
                <span className="text-[#0F172A]">{selectedLog.entity_name} #{selectedLog.entity_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Timestamp:</span>
                <span className="text-[#0F172A]">{selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString() : "N/A"}</span>
              </div>
            </div>

            {selectedLog.details && (
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-sans">Details Payload:</label>
                <pre className="p-3 bg-[#F1F5F9] rounded-md text-[#0F172A] font-mono overflow-x-auto whitespace-pre-wrap">
                  {typeof selectedLog.details === "object" ? JSON.stringify(selectedLog.details, null, 2) : selectedLog.details}
                </pre>
              </div>
            )}

            <div className="pt-2">
              <Button variant="outline" onClick={() => setSelectedLog(null)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </AdminLayout>
  );
}