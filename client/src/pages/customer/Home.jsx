import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import CustomerLayout from "../../components/CustomerLayout"
import api from "../../api/axios"

export default function Home() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const navigate = useNavigate()

    const fetchProducts = async (currentPage = 1) => {
        try {
            const res = await api.get(`/product?page=${currentPage}&limit=10`)
            setProducts(res.data.products)
            setTotalPages(res.data.pages)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts(page)
    }, [page])

    if (loading) return (
        <CustomerLayout>
            <p className="text-gray-500">Loading...</p>
        </CustomerLayout>
    )

    return (
        <CustomerLayout>
            <h1 className="text-2xl font-bold mb-6">Products</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div
                        key={product.product_id}
                        onClick={() => navigate(`/product/${product.product_id}`)}
                        className="bg-white rounded-lg shadow hover:shadow-md cursor-pointer transition"
                    >
                        <img
                            src={product.image_url}
                            alt={product.product_name}
                            className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="p-4">
                            <h2 className="font-medium text-sm mb-1">{product.product_name}</h2>
                            <p className="text-blue-600 font-bold">${product.price}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center gap-2 mt-8">
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
        </CustomerLayout>
    )
}