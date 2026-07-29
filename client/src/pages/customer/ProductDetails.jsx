import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import CustomerLayout from "../../components/CustomerLayout"
import api from "../../api/axios"
import { useAuth } from "../../context/AuthContext"

export default function ProductDetail() {

    const { product_id } = useParams()

    const [product, setProduct] = useState(null)
    const [reviews, setReviews] = useState([])

    const [averageRating, setAverageRating] = useState(0)
    const [reviewCount, setReviewCount] = useState(0)

    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [adding, setAdding] = useState(false)
    const [message, setMessage] = useState("")

    const [showReviewModal, setShowReviewModal] = useState(false)
    const [submittingReview, setSubmittingReview] = useState(false)

    const [review, setReview] = useState({
        rating: 5,
        review: ""
    })

    const [reviewMessage, setReviewMessage] = useState("")

    const { user } = useAuth()
    const navigate = useNavigate()

    const fetchReviews = async () => {
        try {
            const [reviewsRes, averageRes, countRes] = await Promise.all([
                api.get(`/reviews/product/${product_id}`),
                api.get(`/reviews/product/${product_id}/average`),
                api.get(`/reviews/product/${product_id}/count`)
            ])

            setReviews(reviewsRes.data || [])
            setAverageRating(averageRes.data?.average_rating || 0)
            setReviewCount(countRes.data?.review_count || 0)

        } catch (err) {
            console.error("Error fetching reviews:", err)
            // Don't let fetch errors break the UI
            setReviews([])
            setAverageRating(0)
            setReviewCount(0)
        }
    }

    useEffect(() => {

        const fetchProduct = async () => {

            try {

                const res = await api.get(
                    `/product/${product_id}`
                )

                setProduct(res.data)

            } catch (err) {

                console.error(err)

            } finally {

                setLoading(false)

            }

        }

        fetchProduct()
        fetchReviews()

    }, [product_id])

    const handleAddToCart = async () => {

        setAdding(true)
        setMessage("")

        try {

            const cartRes = await api.post("/cart", {
                user_id: user.user_id
            })

            const cart_id = cartRes.data.cart_id

            await api.post(`/cart/${cart_id}/items`, {
                product_id: parseInt(product_id),
                quantity: quantity
            })

            setMessage("Added to cart successfully!")

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage("")
            }, 3000)

        } catch (err) {

            setMessage(
                err.response?.data?.error ||
                "Failed to add to cart"
            )

        } finally {

            setAdding(false)

        }

    }

    const handleAddReview = async () => {
        // Check if user is logged in
        if (!user || !user.user_id) {
            setReviewMessage("Please login to submit a review")
            setTimeout(() => {
                setReviewMessage("")
            }, 3000)
            return
        }

        // Validate review data
        if (!review.review || review.review.trim() === "") {
            setReviewMessage("Please write a review")
            setTimeout(() => {
                setReviewMessage("")
            }, 3000)
            return
        }

        if (submittingReview) return

        setSubmittingReview(true)
        setReviewMessage("")

        try {
            console.log("Submitting review:", {
                user_id: user.user_id,
                product_id: parseInt(product_id),
                rating: review.rating,
                review: review.review.trim()
            })

            const response = await api.post("/reviews", {
                user_id: user.user_id,
                product_id: parseInt(product_id),
                rating: review.rating,
                review: review.review.trim()
            })

            console.log("Review submitted:", response.data)

            setReviewMessage("Review submitted successfully!")

            // Close modal
            setShowReviewModal(false)

            // Reset review form
            setReview({
                rating: 5,
                review: ""
            })

            // Refresh reviews - wait for this to complete
            await fetchReviews()

            // Show success message briefly
            setTimeout(() => {
                setReviewMessage("")
            }, 3000)

        } catch (err) {
            console.error("Error submitting review:", err)
            setReviewMessage(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to submit review"
            )

            setTimeout(() => {
                setReviewMessage("")
            }, 3000)

        } finally {
            setSubmittingReview(false)
        }
    }
    const handleAddToWishlist = async () => {
    try {
        if (!user || !user.user_id) {
            setMessage("Please login to add to wishlist")
            setTimeout(() => setMessage(""), 3000)
            return
        }

        console.log("Adding to wishlist - User:", user.user_id, "Product:", product_id)

        let wishlistId;
        let response;
        
        // First, check if user already has a wishlist
        try {
            const wishlistRes = await api.get(`/wishlist/my`)
            if (wishlistRes.data && wishlistRes.data.wishlist_id) {
                wishlistId = wishlistRes.data.wishlist_id
                console.log("Existing wishlist found:", wishlistId)
            }
        } catch (err) {
            console.log("No existing wishlist, will create one")
        }

        // If no wishlist exists, create one
        if (!wishlistId) {
            response = await api.post("/wishlists", {
                user_id: user.user_id,
                products: [parseInt(product_id)]
            })
            wishlistId = response.data.wishlist_id
            console.log("Created new wishlist:", wishlistId)
        } else {
            // Add item to existing wishlist
            response = await api.post(`/wishlists/${wishlistId}/items`, {
                product_id: parseInt(product_id)
            })
            console.log("Added to existing wishlist:", response.data)
        }

        setMessage("Added to wishlist successfully!")
        setTimeout(() => setMessage(""), 3000)

    } catch (err) {
        console.error("Error adding to wishlist:", err)
        console.error("Error response:", err.response)
        
        if (err.response?.status === 409) {
            setMessage("Product already in wishlist")
        } else if (err.response?.status === 404) {
            setMessage("User or product not found")
        } else {
            setMessage(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to add to wishlist"
            )
        }
        setTimeout(() => setMessage(""), 3000)
    }
}

    const handleOpenReviewModal = () => {
        if (!user) {
            setMessage("Please login to write a review")
            setTimeout(() => {
                setMessage("")
            }, 3000)
            return
        }
        setShowReviewModal(true)
    }

    if (loading) {

        return (
            <CustomerLayout>
                <p className="text-gray-500">
                    Loading...
                </p>
            </CustomerLayout>
        )

    }

    if (!product) {

        return (
            <CustomerLayout>
                <p className="text-red-500">
                    Product not found
                </p>
            </CustomerLayout>
        )

    }

    return (

        <CustomerLayout>

            <button
                onClick={() => navigate("/home")}
                className="text-sm text-blue-600 hover:underline mb-6 block"
            >
                ← Back to Products
            </button>

            <div className="bg-white rounded-lg shadow p-6 flex gap-8">

                <img
                    src={product.image_url}
                    alt={product.product_name}
                    className="w-80 h-80 object-cover rounded-lg"
                />

                <div className="flex-1">

                    <h1 className="text-2xl font-bold mb-2">
                        {product.product_name}
                    </h1>

                    <div className="flex items-center gap-2 mb-4">

                        <span className="text-yellow-500 font-semibold">
                            ⭐ {averageRating}
                        </span>

                        <span className="text-gray-500 text-sm">
                            ({reviewCount} reviews)
                        </span>

                    </div>

                    <p className="text-3xl text-blue-600 font-bold mb-4">
                        ${product.price}
                    </p>

                    <p className="text-sm text-gray-500 mb-6">
                        {
                            product.stock > 0
                                ? `${product.stock} in stock`
                                : "Out of stock"
                        }
                    </p>

                    <div className="flex items-center gap-4 mb-6">

                        <label className="text-sm font-medium">
                            Quantity:
                        </label>

                        <div className="flex items-center border rounded">

                            <button
                                onClick={() =>
                                    setQuantity(
                                        q => Math.max(1, q - 1)
                                    )
                                }
                                className="px-3 py-1 hover:bg-gray-100"
                            >
                                -
                            </button>

                            <span className="px-4 border-x">
                                {quantity}
                            </span>

                            <button
                                onClick={() =>
                                    setQuantity(
                                        q => Math.min(product.stock, q + 1)
                                    )
                                }
                                className="px-3 py-1 hover:bg-gray-100"
                            >
                                +
                            </button>

                        </div>

                    </div>

                    {message && (
                        <p className={`text-sm mb-4 ${message.includes("Failed") || message.includes("login") ? "text-red-600" : "text-green-600"}`}>
                            {message}
                        </p>
                    )}

                    <div className="flex gap-4">

                        <button
                            onClick={handleAddToCart}
                            disabled={
                                adding ||
                                product.stock === 0
                            }
                            className="bg-blue-600 text-white px-8 py-3 rounded disabled:opacity-50"
                        >
                            {
                                adding
                                ? "Adding..."
                                : "Add to Cart"
                            }
                        </button>

                        <button
                            onClick={handleAddToWishlist}
                            className="border px-8 py-3 rounded hover:bg-gray-50"
                        >
                            ♡ Wishlist
                        </button>

                        <button
                            onClick={handleOpenReviewModal}
                            className="border border-blue-600 text-blue-600 px-8 py-3 rounded hover:bg-blue-50"
                        >
                            Write a Review
                        </button>

                    </div>

                    {showReviewModal && (

                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

                            <div className="bg-white rounded-lg p-6 w-full max-w-md">

                                <h2 className="text-lg font-bold mb-4">
                                    Write a Review
                                </h2>

                                {reviewMessage && (
                                    <p className={`text-sm mb-4 ${reviewMessage.includes("Failed") || reviewMessage.includes("login") || reviewMessage.includes("write") ? "text-red-600" : "text-green-600"}`}>
                                        {reviewMessage}
                                    </p>
                                )}

                                <select
                                    value={review.rating}
                                    onChange={(e) =>
                                        setReview({
                                            ...review,
                                            rating:
                                                parseInt(
                                                    e.target.value
                                                )
                                        })
                                    }
                                    className="w-full border p-2 rounded mb-4"
                                >

                                    {[5, 4, 3, 2, 1].map(r => (

                                        <option key={r} value={r}>
                                            {r} ⭐
                                        </option>

                                    ))}

                                </select>

                                <textarea
                                    value={review.review}
                                    onChange={(e) =>
                                        setReview({
                                            ...review,
                                            review: e.target.value
                                        })
                                    }
                                    className="w-full border p-2 rounded"
                                    rows="4"
                                    placeholder="Write your review..."
                                />

                                <div className="flex gap-3 mt-4">

                                    <button
                                        onClick={() => {
                                            setShowReviewModal(false)
                                            setReviewMessage("")
                                            setReview({
                                                rating: 5,
                                                review: ""
                                            })
                                        }}
                                        className="flex-1 border py-2 rounded hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleAddReview}
                                        disabled={submittingReview}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded disabled:opacity-50"
                                    >
                                        {submittingReview ? "Submitting..." : "Submit"}
                                    </button>

                                </div>

                            </div>

                        </div>

                    )}

                </div>

            </div>

            <div className="bg-white rounded-lg shadow p-6 mt-6">

                <h2 className="text-xl font-bold mb-5">
                    Customer Reviews
                </h2>

                {
                    reviews.length === 0 ? (

                        <p className="text-gray-500">
                            No reviews yet. Be the first to review!
                        </p>

                    ) : (

                        <div className="space-y-5">

                            {
                                reviews.map((item) => (

                                    <div
                                        key={item.review_id}
                                        className="border-b pb-4 last:border-b-0"
                                    >

                                        <div className="flex justify-between">

                                            <h3 className="font-semibold">
                                                {item.user_name || "Anonymous"}
                                            </h3>

                                            <span className="text-yellow-500">
                                                {
                                                    "⭐".repeat(
                                                        item.rating
                                                    )
                                                }
                                            </span>

                                        </div>

                                        <p className="text-gray-600 mt-2">
                                            {item.review}
                                        </p>

                                        {item.created_at && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </p>
                                        )}

                                    </div>

                                ))
                            }

                        </div>

                    )
                }

            </div>

        </CustomerLayout>

    )
}