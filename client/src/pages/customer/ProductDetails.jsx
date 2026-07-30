import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Star,
  Image as ImageIcon,
  Minus,
  Plus,
  Loader2,
  MessageSquarePlus,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Clock,
  Layers,
  X,
  Share2,
  Truck,
  RotateCcw,
  Award
} from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { product_id } = useParams();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeSpecTab, setActiveSpecTab] = useState("overview");

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [review, setReview] = useState({ rating: 5, review: "" });

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchReviews = async () => {
    try {
      const [reviewsRes, averageRes, countRes] = await Promise.all([
        api.get(`/reviews/product/${product_id}`),
        api.get(`/reviews/product/${product_id}/average`),
        api.get(`/reviews/product/${product_id}/count`),
      ]);

      setReviews(reviewsRes.data || []);
      setAverageRating(averageRes.data?.average_rating || 0);
      setReviewCount(countRes.data?.review_count || 0);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
      setAverageRating(0);
      setReviewCount(0);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/product/${product_id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [product_id]);

  const handleAddToCart = async () => {
    if (!user || !user.user_id) {
      const stored = localStorage.getItem("guest_cart");
      const guestItems = stored ? JSON.parse(stored) : [];
      const pid = parseInt(product_id);
      const existingIndex = guestItems.findIndex((item) => item.product_id === pid);
      if (existingIndex > -1) {
        guestItems[existingIndex].quantity += quantity;
      } else {
        guestItems.push({
          product_id: pid,
          cart_item_id: `guest_${pid}`,
          product_name: product.product_name,
          price: product.price,
          quantity: quantity,
          image_url: product.image_url,
          stock: product.stock,
        });
      }
      localStorage.setItem("guest_cart", JSON.stringify(guestItems));
      toast({
        title: "Added to Cart",
        description: `${quantity}x ${product.product_name} added to your shopping cart`,
        variant: "success",
      });
      return;
    }

    setAdding(true);
    try {
      const cartRes = await api.post("/cart", { user_id: user.user_id });
      const cart_id = cartRes.data.cart_id;

      await api.post(`/cart/${cart_id}/items`, {
        product_id: parseInt(product_id),
        quantity: quantity,
      });

      toast({
        title: "Added to Cart",
        description: `${quantity}x ${product.product_name} added to your shopping cart`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      if (!user || !user.user_id) {
        toast({
          title: "Login Required",
          description: "Please sign in to save items to your wishlist",
          variant: "warning",
        });
        return;
      }

      let wishlistId;
      try {
        const wishlistRes = await api.get(`/wishlist/my`);
        if (wishlistRes.data && wishlistRes.data.wishlist_id) {
          wishlistId = wishlistRes.data.wishlist_id;
        }
      } catch (err) {
        console.log("No existing wishlist found");
      }

      if (!wishlistId) {
        const response = await api.post("/wishlists", {
          user_id: user.user_id,
          products: [parseInt(product_id)],
        });
        wishlistId = response.data.wishlist_id;
      } else {
        await api.post(`/wishlists/${wishlistId}/items`, {
          product_id: parseInt(product_id),
        });
      }

      toast({
        title: "Saved to Wishlist",
        description: `${product.product_name} saved to your wishlist`,
        variant: "success",
      });
    } catch (err) {
      if (err.response?.status === 409) {
        toast({
          title: "Already Saved",
          description: "This product is already in your wishlist",
          variant: "info",
        });
      } else {
        toast({
          title: "Error",
          description: err.response?.data?.error || "Failed to add to wishlist",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddReview = async (e) => {
    if (e) e.preventDefault();
    if (!user || !user.user_id) {
      toast({
        title: "Login Required",
        description: "Please sign in to submit a review",
        variant: "warning",
      });
      return;
    }

    if (!review.review || review.review.trim() === "") {
      toast({
        title: "Review Required",
        description: "Please write a brief review before submitting",
        variant: "warning",
      });
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post("/reviews", {
        user_id: user.user_id,
        product_id: parseInt(product_id),
        rating: review.rating,
        review: review.review.trim(),
      });

      toast({
        title: "Review Submitted",
        description: "Thank you for reviewing this product!",
        variant: "success",
      });

      setShowReviewModal(false);
      setReview({ rating: 5, review: "" });
      await fetchReviews();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="space-y-8 animate-pulse py-8">
          <div className="h-6 w-48 bg-[#E8E5DF] rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="h-[480px] bg-[#F8F7F4] rounded-2xl border border-[#E8E5DF]" />
            <div className="space-y-6">
              <div className="h-10 bg-[#E8E5DF] rounded-xl w-3/4" />
              <div className="h-6 bg-[#E8E5DF] rounded-lg w-1/4" />
              <div className="h-32 bg-[#F8F7F4] rounded-2xl border border-[#E8E5DF]" />
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!product) {
    return (
      <CustomerLayout>
        <div className="text-center py-24 bg-[#F8F7F4] rounded-3xl border border-[#E8E5DF] space-y-4 max-w-md mx-auto my-12">
          <h2 className="text-xl font-bold font-serif-editorial text-[#1A1A1A]">Product Not Found</h2>
          <p className="text-xs text-[#6B6B6B]">The requested item is no longer active in our marketplace catalog.</p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#B8865B] transition-colors"
          >
            Return to Marketplace
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-12 pb-16">
        
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => navigate("/home")}
          className="text-xs font-semibold tracking-wider text-[#52525B] hover:text-[#B8865B] flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-[#B8865B]" />
          <span>Back to Marketplace Catalog</span>
        </button>

        {/* Crafto Main Product Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Product Media Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative rounded-3xl bg-[#F8F7F4] border border-[#E8E5DF] overflow-hidden min-h-[460px] sm:min-h-[520px] flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="h-full w-full object-cover max-h-[560px]"
                />
              ) : (
                <div className="text-center space-y-2 text-[#71717A]">
                  <ImageIcon className="h-16 w-16 mx-auto opacity-30" />
                  <p className="text-xs font-semibold">Image Preview Unavailable</p>
                </div>
              )}

              {/* Status Tag */}
              <div className="absolute top-4 left-4">
                <span className={product.stock > 0 ? "px-3.5 py-1.5 bg-white/90 backdrop-blur-md border border-[#E8E5DF] text-[#16A34A] text-xs font-bold rounded-full shadow-sm" : "px-3.5 py-1.5 bg-white/90 backdrop-blur-md border border-[#E8E5DF] text-red-600 text-xs font-bold rounded-full shadow-sm"}>
                  {product.stock > 0 ? "In Stock & Ready to Dispatch" : "Temporarily Sold Out"}
                </span>
              </div>

              {/* Action Buttons Overlay */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={handleAddToWishlist}
                  className="p-3 bg-white/90 backdrop-blur-md rounded-full text-[#1A1A1A] hover:text-red-500 hover:bg-white shadow-md transition-all"
                  title="Save to Wishlist"
                >
                  <Heart className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({ title: "Link Copied", description: "Product URL copied to clipboard" });
                  }}
                  className="p-3 bg-white/90 backdrop-blur-md rounded-full text-[#1A1A1A] hover:text-[#B8865B] hover:bg-white shadow-md transition-all"
                  title="Share Link"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Guarantees Bar */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#F8F7F4] border border-[#E8E5DF] text-center space-y-1">
                <Truck className="h-5 w-5 text-[#B8865B] mx-auto" />
                <span className="text-[11px] font-bold text-[#1A1A1A] block">Express Delivery</span>
                <span className="text-[10px] text-[#71717A] block">Insured White-Glove Shipping</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#F8F7F4] border border-[#E8E5DF] text-center space-y-1">
                <ShieldCheck className="h-5 w-5 text-[#B8865B] mx-auto" />
                <span className="text-[11px] font-bold text-[#1A1A1A] block">Verified Seller</span>
                <span className="text-[10px] text-[#71717A] block">Quality Inspected Guarantee</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#F8F7F4] border border-[#E8E5DF] text-center space-y-1">
                <RotateCcw className="h-5 w-5 text-[#B8865B] mx-auto" />
                <span className="text-[11px] font-bold text-[#1A1A1A] block">30-Day Guarantee</span>
                <span className="text-[10px] text-[#71717A] block">Easy Returns & Exchanges</span>
              </div>
            </div>
          </div>

          {/* Right: Product Info & Purchase Box (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#B8865B] uppercase tracking-wider bg-[#F4EFEA] px-3 py-1 rounded-full border border-[#E8E5DF]">
                  {product.category_name || "LIFESTYLE"}
                </span>
                <span className="text-xs text-gray-400 font-semibold">SKU: MB-00{product.product_id}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif-editorial font-bold text-[#1A1A1A] leading-tight">
                {product.product_name}
              </h1>

              {/* Rating Summary */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-[#B8865B]">
                  <Star className="h-4 w-4 fill-[#B8865B]" />
                  <span className="font-bold text-[#1A1A1A] text-sm">{averageRating ? averageRating.toFixed(1) : "5.0"}</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-[#6B6B6B] font-semibold">{reviewCount} Verified Customer Reviews</span>
              </div>

              {/* Price Banner */}
              <div className="pt-4 border-t border-[#E8E5DF] flex items-baseline gap-4">
                <span className="text-3xl font-bold font-display text-[#1A1A1A]">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
                <span className="text-xs text-[#71717A] font-semibold">USD (TAX INCLUDED)</span>
              </div>

              <p className="text-sm text-[#52525B] leading-relaxed pt-2">
                {product.description || "Designed with premium structural integrity, modern craftsmanship, and refined luxury styling for Market Bros clients."}
              </p>
            </div>

            {/* Quantity & CTA Container */}
            <div className="bg-[#F8F7F4] border border-[#E8E5DF] rounded-2xl p-6 space-y-6 shadow-sm">
              
              {/* Quantity Counter */}
              {product.stock > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold uppercase tracking-wider text-[#1A1A1A]">Select Quantity</span>
                    <span className="text-xs text-[#71717A]">{product.stock} units available</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white border border-[#E8E5DF] rounded-xl overflow-hidden p-1 shadow-sm">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-2 text-[#1A1A1A] hover:bg-[#F8F7F4] rounded-lg transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-5 font-bold text-sm text-[#1A1A1A]">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="p-2 text-[#1A1A1A] hover:bg-[#F8F7F4] rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-xs text-[#6B6B6B]">
                      Subtotal: <strong className="text-[#1A1A1A]">${(parseFloat(product.price) * quantity).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || adding}
                  className="w-full py-4 bg-[#1A1A1A] text-white font-semibold text-sm rounded-xl hover:bg-[#B8865B] shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      <span>Add to Shopping Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="w-full py-3.5 bg-[#B8865B] text-white font-semibold text-xs rounded-xl hover:bg-[#9E7047] transition-colors"
                >
                  Instant Buy & Dispatch
                </button>
              </div>

              <div className="pt-2 text-xs text-[#6B6B6B] flex items-center justify-between border-t border-[#E8E5DF]">
                <span className="flex items-center gap-1.5 text-[#16A34A] font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> In Stock & Insured
                </span>
                <span>Seller: <strong>{product.seller_name || "Market Bros Partner"}</strong></span>
              </div>
            </div>

          </div>
        </div>

        {/* Specifications & Customer Reviews Section */}
        <section className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-3xl p-8 lg:p-12 space-y-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
          
          {/* Spec Tabs Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveSpecTab("overview")}
                className={cn(
                  "text-base font-bold pb-2 border-b-2 transition-all",
                  activeSpecTab === "overview"
                    ? "border-[#B8865B] text-[#1A1A1A]"
                    : "border-transparent text-[#71717A] hover:text-[#1A1A1A]"
                )}
              >
                Product Details
              </button>
              <button
                onClick={() => setActiveSpecTab("reviews")}
                className={cn(
                  "text-base font-bold pb-2 border-b-2 transition-all",
                  activeSpecTab === "reviews"
                    ? "border-[#B8865B] text-[#1A1A1A]"
                    : "border-transparent text-[#71717A] hover:text-[#1A1A1A]"
                )}
              >
                Customer Reviews ({reviewCount})
              </button>
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              className="px-5 py-2.5 bg-[#F8F7F4] border border-[#E8E5DF] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#F4EFEA] transition-colors flex items-center gap-2 shrink-0"
            >
              <MessageSquarePlus className="h-4 w-4 text-[#B8865B]" />
              <span>Write Review</span>
            </button>
          </div>

          {/* Overview Tab */}
          {activeSpecTab === "overview" && (
            <div className="space-y-6">
              <div className="max-w-3xl space-y-4 text-sm text-[#52525B] leading-relaxed">
                <h3 className="text-lg font-bold text-[#1A1A1A] font-serif-editorial">Product Overview & Craftsmanship</h3>
                <p>
                  {product.description || "Crafted to exact aesthetic standards. This piece combines functional elegance, high-durability finishing, and luxury detailing suitable for modern residential or commercial spaces."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-[#E8E5DF]">
                <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF]">
                  <span className="text-xs text-[#71717A] font-medium block">Category</span>
                  <span className="text-sm font-bold text-[#1A1A1A]">{product.category_name || "Marketplace"}</span>
                </div>
                <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF]">
                  <span className="text-xs text-[#71717A] font-medium block">Availability</span>
                  <span className="text-sm font-bold text-[#1A1A1A]">{product.stock > 0 ? `${product.stock} In Stock` : "Out of Stock"}</span>
                </div>
                <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF]">
                  <span className="text-xs text-[#71717A] font-medium block">Merchant Partner</span>
                  <span className="text-sm font-bold text-[#1A1A1A]">{product.seller_name || "Market Bros Partner"}</span>
                </div>
                <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF]">
                  <span className="text-xs text-[#71717A] font-medium block">Warranty</span>
                  <span className="text-sm font-bold text-[#1A1A1A]">5-Year Coverage</span>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeSpecTab === "reviews" && (
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="p-12 rounded-2xl border border-[#E8E5DF] bg-[#F8F7F4] text-center text-xs text-[#6B6B6B]">
                  No reviews submitted yet for this product. Be the first customer to leave a review!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map((rev, idx) => (
                    <div key={idx} className="p-6 rounded-2xl border border-[#E8E5DF] bg-[#F8F7F4] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1A1A1A]">{rev.user_name || "Verified Client"}</span>
                        <div className="flex items-center gap-1 text-[#B8865B]">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-[#B8865B]" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#52525B] leading-relaxed">{rev.review}</p>
                      <span className="text-[10px] text-[#71717A] block">
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : "Verified Purchase"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Review Submission Modal */}
      <Dialog open={showReviewModal} onClose={() => setShowReviewModal(false)}>
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl text-[#1A1A1A] p-8 max-w-lg w-full shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif-editorial text-2xl font-bold text-[#1A1A1A]">
              Write a Client Review
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B6B6B] mt-1">
              Share your experience regarding quality, design, and delivery performance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddReview} className="space-y-4 my-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">Select Rating (1-5 Stars)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReview({ ...review, rating: star })}
                    className={`p-3 rounded-xl border transition-all ${
                      review.rating >= star
                        ? "border-[#B8865B] bg-[#F4EFEA] text-[#B8865B]"
                        : "border-[#E8E5DF] bg-[#F8F7F4] text-[#71717A]"
                    }`}
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">Your Feedback Details*</label>
              <textarea
                value={review.review}
                onChange={(e) => setReview({ ...review, review: e.target.value })}
                rows={4}
                required
                placeholder="Share your opinion..."
                className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl p-3.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-3 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="flex-1 py-3 bg-[#B8865B] text-white font-semibold text-xs rounded-xl hover:bg-[#9E7047] transition-all shadow-md"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </CustomerLayout>
  );
}