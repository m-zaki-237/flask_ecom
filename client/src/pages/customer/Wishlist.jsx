import { useEffect, useState } from "react";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Heart, Trash2, Eye, ShoppingBag, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const wishlistRes = await api.get(`/wishlist/my`);
      const wishlistId = wishlistRes.data.wishlist_id;

      if (!wishlistId) {
        toast({ title: "Wishlist Not Found", variant: "warning" });
        return;
      }

      const item = wishlistRes.data.products?.find((p) => p.product_id === productId);
      if (!item) return;

      const itemId = item.wishlist_item_id || item.item_id;
      if (itemId) {
        await api.delete(`/wishlists/${wishlistId}/items/${itemId}`);
      }

      toast({
        title: "Item Removed",
        description: "Product removed from your saved wishlist.",
        variant: "success",
      });

      fetchWishlist();
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      toast({
        title: "Removal Failed",
        description: "Could not remove item from wishlist",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-40 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Saved Wishlist</h1>
          <p className="text-xs text-slate-500 mt-1">Your saved products for future purchase</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-2xs max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Your Wishlist is Empty</h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">Explore products and save your favorite items here.</p>
            <Button onClick={() => navigate("/home")} variant="primary" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Browse Products</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card
                key={product.product_id}
                className="group overflow-hidden border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all duration-300 rounded-2xl flex flex-col"
              >
                {/* Product Image */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2">
                      {product.product_name}
                    </h3>
                    <p className="text-xl font-extrabold text-blue-600 tracking-tight mt-1">
                      ${parseFloat(product.price).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/product/${product.product_id}`)}
                      className="flex-1 gap-1.5 text-xs h-9"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromWishlist(product.product_id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}