import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
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
  Share2
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
        title: "Wishlist Updated",
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
        <div className="space-y-8 animate-pulse">
          <div className="h-6 w-36 bg-[#16151a]" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-[#16151a] border border-[#282630]" />
            <div className="space-y-4">
              <div className="h-8 bg-[#16151a] w-3/4" />
              <div className="h-6 bg-[#16151a] w-1/4" />
              <div className="h-24 bg-[#16151a]" />
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!product) {
    return (
      <CustomerLayout>
        <div className="text-center py-20 bg-[#16151a] border border-[#282630] space-y-4 max-w-md mx-auto">
          <h2 className="text-xl font-mono-tech uppercase font-bold text-white">PIECE NOT FOUND</h2>
          <p className="text-xs font-mono-tech text-[#6c697b]">The requested furniture item or slot does not exist.</p>
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 border border-[#282630] bg-[#0f0e13] text-xs font-mono-tech uppercase text-white hover:border-[#d4a373]"
          >
            RETURN TO MARKETPLACE
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-8 pb-16">
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => navigate("/home")}
          className="text-xs font-mono-tech uppercase tracking-wider text-[#a19fad] hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#d4a373]" />
          <span>BACK TO MARKETPLACE</span>
        </button>

        {/* DeLorean Style Product Header Banner */}
        <div className="border border-[#282630] bg-[#16151a] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono-tech uppercase tracking-widest">
                {product.stock > 0 ? "LISTED" : "RESERVED"}
              </span>
              <span className="text-xs font-mono-tech text-[#d4a373] uppercase tracking-widest">
                SLOT #FW-00{product.product_id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-bold uppercase text-white tracking-wide">
              {product.product_name}
            </h1>

            <p className="text-xs font-mono-tech text-[#6c697b] flex items-center gap-2">
              <span>CATEGORY: <strong className="text-white uppercase">{product.category_name || "FURNITURE"}</strong></span>
              <span>•</span>
              <span>CRAFTSMAN: <strong className="text-white uppercase">{product.seller_name || "OFFICIAL MARKETPLACE"}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToWishlist}
              className="p-3 border border-[#282630] bg-[#0f0e13] text-[#a19fad] hover:text-red-400 hover:border-red-400 transition-colors"
              title="Save to Wishlist"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({ title: "Link Copied", description: "Product URL copied to clipboard" });
              }}
              className="p-3 border border-[#282630] bg-[#0f0e13] text-[#a19fad] hover:text-white transition-colors"
              title="Share Link"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* DeLorean Style Main Product Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Preview Box (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative h-[480px] bg-[#0f0e13] border border-[#282630] overflow-hidden flex items-center justify-center">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center space-y-2 text-[#6c697b]">
                  <ImageIcon className="h-12 w-12 mx-auto" />
                  <p className="text-xs font-mono-tech uppercase">NO IMAGE PREVIEW AVAILABLE</p>
                </div>
              )}

              <div className="absolute bottom-4 left-4 bg-[#0f0e13]/90 border border-[#282630] px-4 py-2 text-[11px] font-mono-tech uppercase text-white flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-[#d4a373]" />
                <span>VERIFIED ARTISANAL CERTIFICATE ATTACHED</span>
              </div>
            </div>

            {/* Thumbnail Specs Row */}
            <div className="grid grid-cols-3 gap-4 font-mono-tech text-xs">
              <div className="p-4 bg-[#16151a] border border-[#282630] space-y-1">
                <span className="text-[#6c697b] block uppercase">TIMBER ORIGIN:</span>
                <span className="text-white font-bold uppercase">SOLID OAK & WALNUT</span>
              </div>
              <div className="p-4 bg-[#16151a] border border-[#282630] space-y-1">
                <span className="text-[#6c697b] block uppercase">WARRANTY:</span>
                <span className="text-white font-bold uppercase">10 YEARS STRUCTURAL</span>
              </div>
              <div className="p-4 bg-[#16151a] border border-[#282630] space-y-1">
                <span className="text-[#6c697b] block uppercase">DELIVERY:</span>
                <span className="text-white font-bold uppercase">WHITE-GLOVE DISPATCH</span>
              </div>
            </div>
          </div>

          {/* Right DeLorean Price & Offer Box (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#282630] bg-[#16151a] p-8 space-y-6">
              <div className="space-y-4 pb-6 border-b border-[#282630]">
                <div className="flex justify-between items-end font-mono-tech">
                  <div>
                    <span className="text-xs text-[#6c697b] uppercase block">CURRENT LIST PRICE:</span>
                    <span className="text-3xl font-bold text-white tracking-tight">
                      ${parseFloat(product.price).toFixed(2)} <span className="text-xs text-[#d4a373]">USD</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#6c697b] uppercase block">ESTIMATED OFFER:</span>
                    <span className="text-sm font-bold text-[#d4a373]">
                      ${(parseFloat(product.price) * 0.92).toFixed(2)} USD
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono-tech">
                  <span className="text-[#6c697b]">AVAILABILITY:</span>
                  <span className={product.stock > 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                    {product.stock > 0 ? `IN STOCK (${product.stock} PIECES AVAILABLE)` : "SOLD OUT / RESERVED"}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="space-y-2 font-mono-tech text-xs">
                  <span className="text-[#6c697b] uppercase block">QUANTITY ALLOCATION:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2.5 border border-[#282630] bg-[#0f0e13] text-white hover:border-[#d4a373]"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-6 py-2 border border-[#282630] bg-[#0f0e13] text-white font-bold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="p-2.5 border border-[#282630] bg-[#0f0e13] text-white hover:border-[#d4a373]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* CTA Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || adding}
                  className="w-full py-3.5 bg-white text-black font-mono-tech font-bold text-xs uppercase tracking-wider hover:bg-[#d4a373] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      <span>ADD TO SHOPPING BAG</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="w-full py-3 border border-[#282630] bg-[#0f0e13] text-xs font-mono-tech uppercase text-white hover:border-white transition-colors"
                >
                  SUBMIT COLLECTION OFFER
                </button>
              </div>

              <div className="pt-4 border-t border-[#282630] text-[11px] font-mono-tech text-[#6c697b] space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>30-DAY SATISFACTION GUARANTEE</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>INSURED ARCHITECTURAL DISPATCH</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description & Reviews Tabs */}
        <div className="border border-[#282630] bg-[#16151a] p-8 space-y-8">
          <div className="space-y-4 pb-6 border-b border-[#282630]">
            <h3 className="text-lg font-mono-tech uppercase font-bold text-white">PIECE SPECIFICATIONS & STORY</h3>
            <p className="text-xs font-mono-tech text-[#a19fad] leading-relaxed max-w-3xl">
              {product.description || "Crafted using sustainable solid timber, precision joinery, and premium luxury finishes. Furniture Waley build slots ensure authentic quality control and architectural elegance."}
            </p>
          </div>

          {/* Customer Reviews Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-mono-tech uppercase font-bold text-white">
                  CLIENT REVIEWS & FEEDBACK ({reviewCount})
                </h4>
                <div className="flex items-center gap-2 text-xs font-mono-tech text-[#d4a373] mt-1">
                  <Star className="h-4 w-4 fill-[#d4a373] text-[#d4a373]" />
                  <span className="font-bold text-white">{averageRating ? averageRating.toFixed(1) : "5.0"}</span>
                  <span className="text-[#6c697b]">/ 5.0 RATING</span>
                </div>
              </div>

              <button
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2 border border-[#282630] bg-[#0f0e13] text-xs font-mono-tech uppercase text-white hover:border-[#d4a373] flex items-center gap-2"
              >
                <MessageSquarePlus className="h-3.5 w-3.5 text-[#d4a373]" />
                <span>WRITE CLIENT REVIEW</span>
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="p-8 border border-[#282630] bg-[#0f0e13] text-center text-xs font-mono-tech text-[#6c697b]">
                NO REVIEWS YET. BE THE FIRST CLIENT TO SUBMIT A REVIEW FOR THIS BUILD SLOT.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="p-5 border border-[#282630] bg-[#0f0e13] space-y-2 font-mono-tech text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold uppercase">{rev.user_name || "VERIFIED BUYER"}</span>
                      <div className="flex items-center gap-1 text-[#d4a373]">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-[#d4a373] text-[#d4a373]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[#a19fad] text-xs leading-relaxed">{rev.review}</p>
                    <span className="text-[10px] text-[#6c697b] block">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : "VERIFIED PURCHASE"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Submission Modal */}
      <Dialog open={showReviewModal} onClose={() => setShowReviewModal(false)}>
        <div className="bg-[#16151a] border border-[#282630] text-white p-6 max-w-lg w-full">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold uppercase tracking-wider text-white">
              SUBMIT CLIENT REVIEW
            </DialogTitle>
            <DialogDescription className="text-xs font-mono-tech text-[#a19fad]">
              Share your feedback regarding piece quality, craft, and allocation experience.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddReview} className="space-y-4 my-4 font-mono-tech text-xs">
            <div>
              <label className="block text-[#a19fad] uppercase mb-2">RATING (1 - 5 STARS):</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReview({ ...review, rating: star })}
                    className={`p-2 border ${
                      review.rating >= star
                        ? "border-[#d4a373] bg-[#282630] text-[#d4a373]"
                        : "border-[#282630] bg-[#0f0e13] text-[#6c697b]"
                    }`}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#a19fad] uppercase mb-1">YOUR REVIEW DETAILS*:</label>
              <textarea
                value={review.review}
                onChange={(e) => setReview({ ...review, review: e.target.value })}
                rows={4}
                required
                placeholder="Write your review here..."
                className="w-full bg-[#0f0e13] border border-[#282630] p-3 text-xs font-mono-tech text-white focus:outline-none focus:border-[#d4a373]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-2.5 border border-[#282630] bg-[#0f0e13] text-xs font-mono-tech text-white uppercase"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="flex-1 py-2.5 bg-white text-black font-mono-tech font-bold text-xs uppercase hover:bg-[#d4a373] transition-colors"
              >
                {submittingReview ? "SUBMITTING..." : "SUBMIT REVIEW"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </CustomerLayout>
  );
}