import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/axios";

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

const fetchTickets = async (currentPage = 1) => {
    try {
        const res = await api.get(`/support_tickets?page=${currentPage}&limit=10`)
        setTickets(res.data.support_tickets)
        setTotalPages(res.data.pages)
    } catch (error) {
        console.error(error)
    } finally {
        setLoading(false)
    }
}

  useEffect(() => {
    fetchTickets(page);
  }, [page]);

  const handleDelete = async (ticket_id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await api.delete(`/support_tickets/${ticket_id}`);
      fetchTickets(page);
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewDetails = async (ticket_id) => {
    try {
      const res = await api.get(`/support_tickets/${ticket_id}`);
      setSelectedTicket(res.data);
      setShowModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateStatus = async (ticket_id, newStatus) => {
    try {
      await api.patch(`/support_tickets/${ticket_id}`, { status: newStatus });
      fetchTickets(page);
      if (selectedTicket && selectedTicket.ticket_id === ticket_id) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error(error);
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
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-green-100 text-green-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      resolved: "bg-blue-100 text-blue-800",
      closed: "bg-gray-100 text-gray-800",
      pending: "bg-orange-100 text-orange-800",
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status) => {
    const labels = {
      open: "Open",
      "in-progress": "In Progress",
      resolved: "Resolved",
      closed: "Closed",
      pending: "Pending",
    };
    return labels[status?.toLowerCase()] || status || "Unknown";
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
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <div className="text-sm text-gray-500">
          Total: {tickets.length} tickets
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">User ID</th>
              <th className="px-6 py-3 text-left">Subject</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Created At</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <tr key={ticket.ticket_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{ticket.ticket_id}</td>
                <td className="px-6 py-4">{ticket.user_id}</td>
                <td className="px-6 py-4 font-medium">{ticket.subject}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {getStatusBadge(ticket.status)}
                  </span>
                </td>
                <td className="px-6 py-4">{formatDate(ticket.created_at)}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleViewDetails(ticket.ticket_id)}
                    className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(ticket.ticket_id)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Delete
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

      {/* View Details Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Ticket Details</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTicket(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Ticket ID</label>
                <p className="text-sm font-medium">#{selectedTicket.ticket_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">User ID</label>
                <p className="text-sm">{selectedTicket.user_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateStatus(selectedTicket.ticket_id, e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Subject</label>
                <p className="text-sm font-medium">{selectedTicket.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="text-sm bg-gray-50 p-2 rounded border">
                  {selectedTicket.body || "No description"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Created At</label>
                <p className="text-sm">{formatDate(selectedTicket.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SupportTickets;