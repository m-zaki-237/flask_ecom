import { useEffect, useState } from "react";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Heart, Trash2, Eye, ShoppingBag, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      if (!user || !user.user_id) {
        setLoading(false);
        return;
      }

      const res = await api.get(`/wishlist/my`);
      let productList = [];

      if (res.data && res.data.products) {
        productList = res.data.products;
      } else if (Array.isArray(res.data)) {
        productList = res.data;
      }

      setProducts(productList);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleRemoveFromWishlist = async (product) => {
    const productId = product.product_id;
    const itemId = product.wishlist_item_id || product.item_id;

    try {
      setProducts((prev) => prev.filter((p) => p.product_id !== productId));

      const wishlistRes = await api.get(`/wishlist/my`);
      const wishlistId = wishlistRes.data.wishlist_id;

      if (wishlistId && itemId) {
        await api.delete(`/wishlists/${wishlistId}/items/${itemId}`);
      }

      toast({
        title: "Item Removed",
        description: "Product removed from your saved wishlist.",
        variant: "success",
      });
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      toast({
        title: "Removal Failed",
        description: "Could not remove item from wishlist",
        variant: "destructive",
      });
      fetchWishlist();
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="space-y-6 animate-pulse py-8">
          <div className="h-8 w-40 bg-[#E8E5DF] rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-[#F8F7F4] rounded-2xl border border-[#E8E5DF]" />
            ))}
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-10 pb-16">
        
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">SAVED COLLECTION</span>
            <h1 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A] mt-1">
              My Wishlist ({products.length} Items)
            </h1>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="px-5 py-2.5 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF] transition-colors"
          >
            Explore Catalog
          </button>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-[#E8E5DF] bg-[#F8F7F4] p-16 text-center space-y-4 max-w-md mx-auto my-12">
            <Heart className="h-14 w-14 text-[#B8865B] mx-auto opacity-70" />
            <h2 className="text-2xl font-serif-editorial font-bold text-[#1A1A1A]">Your Wishlist is Empty</h2>
            <p className="text-xs text-[#6B6B6B]">Browse our lifestyle collections and tap the heart icon to save products for later.</p>
            <button
              onClick={() => navigate("/home")}
              className="px-8 py-3.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#B8865B] transition-colors shadow-md"
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.product_id}
                className="group bg-white rounded-2xl border border-[#E8E5DF] crafto-card-shadow-hover flex flex-col justify-between overflow-hidden"
              >
                <div className="relative h-60 bg-[#F8F7F4] border-b border-[#E8E5DF] overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="h-full w-full object-cover luxury-image-zoom"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#71717A]">
                      <ImageIcon className="h-8 w-8 opacity-30" />
                    </div>
                  )}

                  <button
                    onClick={() => handleRemoveFromWishlist(product)}
                    className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-red-600 hover:bg-white shadow-md transition-all"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[#B8865B] uppercase tracking-wider block">
                      SKU: MB-00{product.product_id}
                    </span>
                    <h3 className="text-base font-bold text-[#1A1A1A] line-clamp-1">{product.product_name}</h3>
                    <p className="text-lg font-bold font-display text-[#1A1A1A] pt-1">
                      ${parseFloat(product.price).toFixed(2)} USD
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E8E5DF] mt-auto">
                    <button
                      onClick={() => navigate(`/product/${product.product_id}`)}
                      className="w-full py-3 bg-[#1A1A1A] text-white font-semibold text-xs rounded-xl hover:bg-[#B8865B] transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Product Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}