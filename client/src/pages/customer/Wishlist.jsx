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
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-40 bg-[#16151a]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-[#16151a] border border-[#282630]" />
            ))}
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-8 pb-16">
        {/* Header Banner */}
        <div className="border border-[#282630] bg-[#16151a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373]">SAVED ALLOCATIONS</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mt-1">
              SAVED WISHLIST ({products.length})
            </h1>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 border border-[#282630] bg-[#0f0e13] text-xs font-mono-tech uppercase text-white hover:border-[#d4a373]"
          >
            EXPLORE MARKETPLACE
          </button>
        </div>

        {products.length === 0 ? (
          <div className="border border-[#282630] bg-[#16151a] p-16 text-center space-y-4 max-w-md mx-auto my-12">
            <Heart className="h-12 w-12 text-[#6c697b] mx-auto" />
            <h2 className="text-xl font-mono-tech uppercase font-bold text-white">YOUR WISHLIST IS EMPTY</h2>
            <p className="text-xs font-mono-tech text-[#6c697b]">Browse products and save your favorite furniture pieces.</p>
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-3 bg-white text-black font-mono-tech font-bold text-xs uppercase hover:bg-[#d4a373] transition-colors"
            >
              BROWSE PRODUCTS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.product_id}
                className="group bg-[#16151a] border border-[#282630] hover:border-white transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="relative h-56 bg-[#0f0e13] border-b border-[#282630] overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#6c697b]">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}

                  <button
                    onClick={() => handleRemoveFromWishlist(product)}
                    className="absolute top-3 right-3 p-2 bg-[#0f0e13]/80 border border-[#282630] text-[#6c697b] hover:text-red-400 hover:border-red-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="p-5 space-y-4 font-mono-tech flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-[#d4a373] uppercase tracking-widest block">
                      SLOT #FW-00{product.product_id}
                    </span>
                    <h3 className="text-sm font-bold uppercase text-white line-clamp-1">{product.product_name}</h3>
                    <p className="text-base font-bold text-white pt-1">
                      ${parseFloat(product.price).toFixed(2)} USD
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#282630] mt-auto">
                    <button
                      onClick={() => navigate(`/product/${product.product_id}`)}
                      className="w-full py-2.5 bg-white text-black font-mono-tech font-bold text-xs uppercase hover:bg-[#d4a373] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>VIEW PIECE</span>
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