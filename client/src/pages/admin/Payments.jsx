import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/axios";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    order_id: "",
    amount: "",
    payment_method: "",
    payment_status: "",
  });

const fetchPayments = async (currentPage = 1) => {
    try {
        const res = await api.get(`/payments?page=${currentPage}&limit=10`)
        setPayments(res.data.payments)
        setTotalPages(res.data.pages)
    } catch (error) {
        console.error(error)
    } finally {
        setLoading(false)
    }
}

  useEffect(() => {
    fetchPayments(page);
  }, [page]);

  const handleDelete = async (payment_id) => {
    try {
      await api.delete(`/payments/${payment_id}`);
      fetchPayments(page);
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewDetails = async (payment_id) => {
    try {
      const res = await api.get(`/payments/${payment_id}`);
      setSelectedPayment(res.data);
      setShowModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateStatus = async (payment_id, newStatus) => {
    try {
      await api.patch(`/payments/update/${payment_id}`, { payment_status: newStatus });
      fetchPayments(page);
      if (selectedPayment && selectedPayment.payment_id === payment_id) {
        setSelectedPayment({ ...selectedPayment, payment_status: newStatus });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/payments/create", {
        order_id: parseInt(form.order_id),
        amount: parseFloat(form.amount),
        payment_method: form.payment_method,
        payment_status: form.payment_status,
      });
      setShowCreateModal(false);
      setForm({ order_id: "", amount: "", payment_method: "", payment_status: "" });
      fetchPayments(page);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getMethodBadge = (method) => {
    const labels = {
      credit_card: "Credit Card",
      debit_card: "Debit Card",
      paypal: "PayPal",
      bank_transfer: "Bank Transfer",
      cash: "Cash",
    };
    return labels[method] || method || "Unknown";
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
        <h1 className="text-2xl font-bold">Payments</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          onClick={() => setShowCreateModal(true)}
        >
          + Add Payment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Payment ID</th>
              <th className="px-6 py-3 text-left">Order ID</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Payment Method</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((payment) => (
              <tr key={payment.payment_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{payment.payment_id}</td>
                <td className="px-6 py-4">{payment.order_id}</td>
                <td className="px-6 py-4 font-medium">${parseFloat(payment.amount).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                    {getMethodBadge(payment.payment_method)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      payment.payment_status
                    )}`}
                  >
                    {payment.payment_status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleViewDetails(payment.payment_id)}
                    className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(payment.payment_id)}
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
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Payment Details</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPayment(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Payment ID</label>
                <p className="text-sm font-medium">#{selectedPayment.payment_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Order ID</label>
                <p className="text-sm">{selectedPayment.order_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Amount</label>
                <p className="text-sm font-medium">${parseFloat(selectedPayment.amount).toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Payment Method</label>
                <p className="text-sm">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                    {getMethodBadge(selectedPayment.payment_method)}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Payment Status</label>
                <select
                  value={selectedPayment.payment_status}
                  onChange={(e) => handleUpdateStatus(selectedPayment.payment_id, e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Add Payment</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setForm({ order_id: "", amount: "", payment_method: "", payment_status: "" });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Order ID</label>
                <input
                  type="number"
                  value={form.order_id}
                  onChange={(e) => setForm({ ...form, order_id: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Status</label>
                <select
                  value={form.payment_status}
                  onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select Payment Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Payment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Payments;