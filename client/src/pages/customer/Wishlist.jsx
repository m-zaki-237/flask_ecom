import { useEffect, useState } from "react"
import CustomerLayout from "../../components/CustomerLayout"
import api from "../../api/axios"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function Wishlist() {

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [error, setError] = useState(null)
    const { user } = useAuth()

    const fetchWishlist = async () => {
        setLoading(true)
        setError(null)
        
        try {
            if (!user || !user.user_id) {
                setError("Please login to view your wishlist")
                setLoading(false)
                return
            }

            console.log("Fetching wishlist for user:", user.user_id)
            
            // Use the correct endpoint: /wishlist/my (not /wishlists/my)
            const res = await api.get(`/wishlist/my`)
            
            console.log("Wishlist API response:", res.data)
            
            // Handle the response structure
            let productList = []
            
            if (res.data && res.data.products) {
                productList = res.data.products
            } else if (Array.isArray(res.data)) {
                productList = res.data
            }
            
            console.log("Extracted products:", productList)
            setProducts(productList)
            
            if (productList.length === 0) {
                setMessage("Your wishlist is empty")
            }
            
        } catch (err) {
            console.error("Error fetching wishlist:", err)
            console.error("Error response:", err.response)
            
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to load wishlist"
            )
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWishlist()
    }, [user])

    const handleRemoveFromWishlist = async (productId) => {
        try {
            // First, get the wishlist
            const wishlistRes = await api.get(`/wishlist/my`)
            const wishlistId = wishlistRes.data.wishlist_id
            
            if (!wishlistId) {
                setMessage("Wishlist not found")
                return
            }
            
            // Find the item ID for this product
            const item = wishlistRes.data.products.find(
                p => p.product_id === productId
            )
            
            if (!item) {
                setMessage("Product not found in wishlist")
                return
            }
            
            // Get the wishlist item ID - you might need to fetch this differently
            // Since your backend uses item_id, we need to get it
            // Option 1: If your API returns item_id in the product object
            const itemId = item.wishlist_item_id || item.item_id
            
            // If you have the item_id, use it
            if (itemId) {
                await api.delete(`/wishlists/${wishlistId}/items/${itemId}`)
            } else {
                // Option 2: If you don't have item_id, you might need to fetch all items
                // or use a different endpoint
                setMessage("Cannot remove item: item ID not found")
                return
            }
            
            setMessage("Removed from wishlist!")
            setTimeout(() => setMessage(""), 3000)
            
            // Refresh wishlist
            await fetchWishlist()
            
        } catch (err) {
            console.error("Error removing from wishlist:", err)
            setMessage(
                err.response?.data?.error ||
                "Failed to remove from wishlist"
            )
            setTimeout(() => setMessage(""), 3000)
        }
    }

    if (loading) {
        return (
            <CustomerLayout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Loading wishlist...</p>
                </div>
            </CustomerLayout>
        )
    }

    return (
        <CustomerLayout>

            <h1 className="text-2xl font-bold mb-6">
                My Wishlist
            </h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="font-medium">Error:</p>
                    <p>{error}</p>
                    <button 
                        onClick={fetchWishlist}
                        className="mt-2 text-sm text-red-600 hover:underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {message && !error && (
                <p className={`text-sm mb-4 ${message.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
                    {message}
                </p>
            )}

            {products.length === 0 && !error ? (
                <div className="bg-white shadow rounded p-8 text-center">
                    <p className="text-gray-500 mb-4">Your wishlist is empty</p>
                    <Link 
                        to="/home" 
                        className="text-blue-600 hover:underline"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {products.map(product => (

                        <div
                            key={product.product_id}
                            className="bg-white shadow rounded p-4 relative"
                        >
                            <img
                                src={product.image_url}
                                alt={product.product_name}
                                className="h-48 w-full object-cover rounded"
                                onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/300x200?text=No+Image"
                                }}
                            />

                            <h2 className="font-bold mt-3">
                                {product.product_name}
                            </h2>

                            <p className="text-blue-600 font-bold">
                                ${product.price}
                            </p>

                            <div className="flex items-center justify-between mt-2">
                                <Link
                                    to={`/product/${product.product_id}`}
                                    className="text-blue-600 text-sm hover:underline"
                                >
                                    View Product
                                </Link>

                                <button
                                    onClick={() => handleRemoveFromWishlist(product.product_id)}
                                    className="text-red-500 text-sm hover:underline"
                                >
                                    Remove
                                </button>
                            </div>

                        </div>

                    ))}

                </div>
            )}

        </CustomerLayout>
    )
}