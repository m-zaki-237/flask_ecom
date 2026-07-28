import { useState, useEffect } from "react"
import AdminLayout from "../../components/AdminLayout"
import api from "../../api/axios"

export default function Orders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const fetchOrders = async (currentPage = 1) => {
        try {
            const res = await api.get(`/orders?page=${currentPage}&limit=10`)
            setOrders(res.data.orders)
            setTotalPages(res.data.pages)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders(page)
    }, [page])

    const handleStatusUpdate = async (order_id, status) => {
        try {
            await api.put(`/orders/${order_id}/status`, { status })
            fetchOrders(page)
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async (order_id) => {
        try {
            await api.delete(`/orders/${order_id}`)
            fetchOrders(page)
        } catch (err) {
            console.error(err)
        }
    }

    const statusColors = {
        pending: "bg-yellow-100 text-yellow-700",
        processing: "bg-blue-100 text-blue-700",
        shipped: "bg-purple-100 text-purple-700",
        delivered: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
    }

    if (loading) return (
        <AdminLayout>
            <p className="text-gray-500">Loading...</p>
        </AdminLayout>
    )

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold mb-6">Orders</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3 text-left">Order ID</th>
                            <th className="px-6 py-3 text-left">User ID</th>
                            <th className="px-6 py-3 text-left">Items</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-left">Created At</th>
                            <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order.order_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">#{order.order_id}</td>
                                <td className="px-6 py-4">{order.user_id}</td>
                                <td className="px-6 py-4">{order.items.length} items</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <select
                                        defaultValue={order.status}
                                        onChange={(e) => handleStatusUpdate(order.order_id, e.target.value)}
                                        className="border rounded px-2 py-1 text-xs"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <button
                                        onClick={() => handleDelete(order.order_id)}
                                        className="text-red-500 hover:text-red-700 font-medium text-xs"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center gap-2 mt-6">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border rounded text-sm disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="px-4 py-2 text-sm">Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border rounded text-sm disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </AdminLayout>
    )
}