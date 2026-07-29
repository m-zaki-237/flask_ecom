import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function CustomerLayout({ children }) {
    const { logout, user } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
                <Link to="/home" className="text-xl font-bold text-blue-600">Shop</Link>
                <div className="flex gap-6 items-center">
                    <Link to="/home" className="text-sm hover:text-blue-600">Home</Link>
                    <Link to="/cart" className="text-sm hover:text-blue-600">Cart</Link>
                    <Link to="/orders" className="text-sm hover:text-blue-600">Orders</Link>
                    <span className="text-sm text-gray-500">Hi, {user?.first_name}</span>
                    <button
                        onClick={handleLogout}
                        className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </nav>
            <main className="max-w-6xl mx-auto py-8 px-4">
                {children}
            </main>
        </div>
    )
}