import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, ShoppingCart, Heart, Star, Image as ImageIcon, Minus, Plus, Loader2, MessageSquarePlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
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
        console.log("No existing wishlist found, creating standard wishlist");
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
        <div className="space-y-6">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!product) {
    return (
      <CustomerLayout>
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">The item you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate("/home")} variant="primary">
            Back to Products
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button onClick={() => navigate("/home")} className="hover:text-blue-600 font-medium">Home</button>
          <span>/</span>
          <span className="text-slate-700 font-medium">{product.category_name || `Category #${product.category_id}`}</span>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-xs">{product.product_name}</span>
        </div>

        {/* Dual Column Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          {/* Image View */}
          <div className="relative h-96 sm:h-[420px] w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.product_name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400">
                <ImageIcon className="h-16 w-16" />
              </div>
            )}
          </div>

          {/* Product Details & Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {product.category_name || `Category #${product.category_id}`}
                </Badge>
                {product.stock > 0 ? (
                  <Badge variant="success">{product.stock} Units in Stock</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
                {product.seller_name && (
                  <span className="text-xs font-medium text-slate-500 ml-auto">
                    Sold by <span className="font-semibold text-slate-700">{product.seller_name}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {product.product_name}
              </h1>

              {/* Full Description */}
              <div className="py-2 border-y border-slate-100 text-sm text-slate-600 leading-relaxed">
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-1">Product Description</h4>
                <p className="whitespace-pre-line">{product.description || "No detailed description provided for this item."}</p>
              </div>

              {/* Rating Summary */}
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-900">{averageRating.toFixed(1)}</span>
                <span className="text-xs text-slate-400">({reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="pt-2">
                <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Select Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="h-9 w-9 rounded-none hover:bg-slate-200"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-12 text-center font-bold text-sm text-slate-900">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="h-9 w-9 rounded-none hover:bg-slate-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <span className="text-xs text-slate-500">Max {product.stock} per order</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className="flex-1 gap-2 shadow-md shadow-blue-500/20"
              >
                {adding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleAddToWishlist}
                className="gap-2 border-slate-200 hover:bg-slate-50"
              >
                <Heart className="h-4 w-4 text-red-500" />
                <span>Save</span>
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowReviewModal(true)}
                className="gap-2"
              >
                <MessageSquarePlus className="h-4 w-4 text-blue-600" />
                <span>Write Review</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <Card>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Customer Ratings & Reviews</h2>
                <p className="text-xs text-slate-500 mt-0.5">Verified buyer feedback for this product</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReviewModal(true)}
                className="gap-2 text-xs"
              >
                <MessageSquarePlus className="h-3.5 w-3.5 text-blue-600" />
                <span>Write Review</span>
              </Button>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-500 text-sm">No reviews submitted yet. Be the first to share feedback!</p>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {reviews.map((item) => (
                  <div key={item.review_id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {item.user_name ? item.user_name[0].toUpperCase() : "A"}
                        </div>
                        <span className="font-semibold text-sm text-slate-900">
                          {item.user_name || "Verified Customer"}
                        </span>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${s <= item.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed font-normal">{item.review}</p>

                    {item.created_at && (
                      <p className="text-xs text-slate-400 font-medium">
                        Reviewed on {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Modal Dialog */}
      <Dialog open={showReviewModal} onClose={() => setShowReviewModal(false)}>
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>Share your experience with {product.product_name}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddReview} className="space-y-4 my-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Rating
            </label>
            <select
              value={review.rating}
              onChange={(e) => setReview({ ...review, rating: parseInt(e.target.value) })}
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium shadow-2xs focus:ring-1 focus:ring-blue-500"
            >
              <option value="5">⭐⭐⭐⭐⭐ Excellent (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ Very Good (4 Stars)</option>
              <option value="3">⭐⭐⭐ Average (3 Stars)</option>
              <option value="2">⭐⭐ Poor (2 Stars)</option>
              <option value="1">⭐ Terrible (1 Star)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Review Details
            </label>
            <textarea
              value={review.review}
              onChange={(e) => setReview({ ...review, review: e.target.value })}
              rows={4}
              className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-2xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              placeholder="Describe product quality, shipping, or performance..."
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowReviewModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submittingReview} className="flex-1">
              {submittingReview ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Review</span>
              )}
            </Button>
          </div>
        </form>
      </Dialog>
    </CustomerLayout>
  );
}