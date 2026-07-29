import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/axios";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [userFilter, setUserFilter] = useState("");

const fetchLogs = async (currentPage = 1) => {
    try {
        const res = await api.get(`/audit_logs?page=${currentPage}&limit=10`)
        setLogs(res.data.audit_logs)
        setTotalPages(res.data.pages)
    } catch (error) {
        console.error(error)
    } finally {
        setLoading(false)
    }
}

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const handleViewDetails = async (logId) => {
    try {
      const res = await api.get(`/audit_logs/${logId}`);
      setSelectedLog(res.data);
      setShowModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFilterByUser = async () => {
    if (!userFilter.trim()) {
      fetchLogs(page);
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.get(`/audit_logs/user/${userFilter}`);
      setLogs(res.data);
      setTotalPages(Math.ceil(res.data.length / 10));
      setPage(1);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        setLogs([]);
        setTotalPages(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: "bg-green-100 text-green-800",
      UPDATE: "bg-blue-100 text-blue-800",
      DELETE: "bg-red-100 text-red-800",
      LOGIN: "bg-purple-100 text-purple-800",
      LOGOUT: "bg-gray-100 text-gray-800",
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  if (loading)
    return (
      <AdminLayout>
        <p className="text-gray-500">Loading...</p>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <div className="flex gap-2">
          <input
            type="number"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            placeholder="Filter by User ID"
            className="border rounded px-3 py-2 text-sm"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleFilterByUser();
              }
            }}
          />
          <button
            onClick={handleFilterByUser}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Filter
          </button>
          <button
            onClick={() => {
              setUserFilter("");
              fetchLogs(page);
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Log ID</th>
              <th className="px-6 py-3 text-left">User ID</th>
              <th className="px-6 py-3 text-left">Table</th>
              <th className="px-6 py-3 text-left">Record ID</th>
              <th className="px-6 py-3 text-left">Action</th>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-left">Created At</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log.log_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">#{log.log_id}</td>
                <td className="px-6 py-4">{log.user_id}</td>
                <td className="px-6 py-4">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                    {log.table_name}
                  </span>
                </td>
                <td className="px-6 py-4">{log.record_id || "—"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(
                      log.action
                    )}`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 max-w-xs truncate">
                  {log.description || "—"}
                </td>
                <td className="px-6 py-4 text-xs">{formatDate(log.created_at)}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleViewDetails(log.log_id)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-white border rounded text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-sm">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
          className="px-4 py-2 bg-white border rounded text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Details Modal */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Log Details</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedLog(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Log ID</label>
                <p className="text-sm font-medium">#{selectedLog.log_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">User ID</label>
                <p className="text-sm">{selectedLog.user_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Table</label>
                <p className="text-sm font-mono">{selectedLog.table_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Record ID</label>
                <p className="text-sm">{selectedLog.record_id || "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Action</label>
                <p className="text-sm">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(
                      selectedLog.action
                    )}`}
                  >
                    {selectedLog.action}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="text-sm bg-gray-50 p-2 rounded border">
                  {selectedLog.description || "No description"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Created At</label>
                <p className="text-sm">{formatDate(selectedLog.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AuditLogs;