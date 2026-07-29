import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import CustomerLayout from "../../components/CustomerLayout"
import api from "../../api/axios"
import { useAuth } from "../../context/AuthContext"

export const CustomerOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) fetchOrders()
    }, [user])

    const fetchOrders = async () => {
        try {
            const res = await api.get(`/users/${user.user_id}/orders`)
            setOrders(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
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
        <CustomerLayout>
            <p className="text-gray-500">Loading...</p>
        </CustomerLayout>
    )

    if (orders.length === 0) return (
        <CustomerLayout>
            <div className="text-center py-16">
                <p className="text-gray-500 mb-4">You have no orders yet</p>
                <button
                    onClick={() => navigate("/home")}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    Start Shopping
                </button>
            </div>
        </CustomerLayout>
    )

    return (
        <CustomerLayout>
            <h1 className="text-2xl font-bold mb-6">My Orders</h1>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.order_id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="font-bold">Order #{order.order_id}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status?.toLowerCase()] || "bg-gray-100 text-gray-700"}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="border-t pt-4">
                            <p className="text-sm text-gray-500 mb-2">Items:</p>
                            <div className="space-y-1">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span>Product #{item.product_id}</span>
                                        <span>x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </CustomerLayout>
    )
}