import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const links = [
  { name: "Dashboard", path: "/seller/dashboard" },
  { name: "Products", path: "/seller/products" },
  { name: "Orders", path: "/seller/orders" },
  { name: "Payments", path: "/seller/payments"},
];
const SellerSidebar = () => {
    const {logout, user} = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

  return(
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
            <div className="p-6 border-b border-gray-700">
                <h1 className="text-xl font-bold">Seller Panel</h1>
                <p className="text-sm text-gray-400 mt-1">{user?.first_name}</p>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className="block px-4 py-2 rounded hover:bg-gray-700 text-sm"
                    >
                        {link.name}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-red-600 rounded text-sm hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
        </div>
    )
}
export default SellerSidebar;
