import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  Search,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Star,
  Heart,
  ShoppingCart,
  Eye,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchProducts = async (currentPage = 1, catId = selectedCategory, search = searchQuery) => {
    setLoading(true);
    try {
      let url = `/product?page=${currentPage}&limit=8`;
      if (catId) url += `&category_id=${catId}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      setProducts(res.data?.products || []);
      setTotalPages(res.data?.pages || 1);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(page, selectedCategory, searchQuery);
  }, [page, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(1, selectedCategory, searchQuery);
  };

  const handleAddToCart = async (product, e) => {
    if (e) e.stopPropagation();

    if (!user || !user.user_id) {
      // Guest cart support in localStorage
      const stored = localStorage.getItem("guest_cart");
      const guestItems = stored ? JSON.parse(stored) : [];
      const pid = product.product_id;
      const existingIndex = guestItems.findIndex((item) => item.product_id === pid);

      if (existingIndex > -1) {
        guestItems[existingIndex].quantity += 1;
      } else {
        guestItems.push({
          product_id: pid,
          cart_item_id: `guest_${pid}`,
          product_name: product.product_name,
          price: product.price,
          quantity: 1,
          image_url: product.image_url,
          stock: product.stock,
        });
      }
      localStorage.setItem("guest_cart", JSON.stringify(guestItems));
      toast({
        title: "Added to Cart",
        description: `${product.product_name} added to your cart`,
        variant: "success",
      });
      return;
    }

    try {
      const cartRes = await api.post("/cart", { user_id: user.user_id });
      const cart_id = cartRes.data.cart_id;
      await api.post(`/cart/${cart_id}/items`, {
        product_id: product.product_id,
        quantity: 1,
      });

      toast({
        title: "Added to Cart",
        description: `${product.product_name} added to your cart`,
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const handleAddToWishlist = async (product, e) => {
    if (e) e.stopPropagation();

    if (!user || !user.user_id) {
      toast({
        title: "Login Required",
        description: "Please sign in to save items to your wishlist",
        variant: "warning",
      });
      return;
    }

    try {
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
          products: [product.product_id],
        });
        wishlistId = response.data.wishlist_id;
      } else {
        await api.post(`/wishlists/${wishlistId}/items`, {
          product_id: product.product_id,
        });
      }

      toast({
        title: "Wishlist Updated",
        description: `${product.product_name} saved to wishlist`,
        variant: "success",
      });
    } catch (err) {
      if (err.response?.status === 409) {
        toast({
          title: "Already Saved",
          description: "Product is already in your wishlist",
          variant: "info",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add to wishlist",
          variant: "destructive",
        });
      }
    }
  };

  const handleNewsletterSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "warning",
      });
      return;
    }
    toast({
      title: "Subscribed Successfully!",
      description: "Thank you for subscribing to our newsletter updates.",
      variant: "success",
    });
    setNewsletterEmail("");
  };

  const getStockBadge = (stock) => {
    if (stock <= 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock <= 5) return <Badge variant="warning">Low Stock ({stock})</Badge>;
    return <Badge variant="success">{stock} In Stock</Badge>;
  };

  return (
    <CustomerLayout>
      <div className="space-y-12">
        {/* HERO BANNER SECTION */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/30 via-indigo-900/10 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Premium Ecommerce Collection</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
              Discover Quality Products. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Elevate Everyday Life.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              Explore curated electronics, modern laptops, fashion apparel, and home essentials with instant shipping and 100% money-back guarantee.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products by name..."
                    className="pl-10 h-10 bg-slate-900/90 border-slate-700 text-white text-xs placeholder:text-slate-500 focus-visible:ring-blue-500"
                  />
                </div>
                <Button type="submit" variant="primary" className="h-10 px-5 text-xs font-semibold gap-1.5 shrink-0">
                  <span>Search</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* CATEGORY FILTER SECTION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Explore Categories</h2>
              <p className="text-xs text-slate-500 mt-0.5">Filter items by category</p>
            </div>
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory(null);
                  setPage(1);
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear Category Filter
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === null
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() => {
                  setSelectedCategory(cat.category_id);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === cat.category_id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat.category_name}
              </button>
            ))}
          </div>
        </section>

        {/* FEATURED / PRODUCTS SECTION */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {selectedCategory
                  ? categories.find((c) => c.category_id === selectedCategory)?.category_name || "Filtered Products"
                  : "Featured & Popular Products"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Top selection of verified products</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-3 p-4 bg-white rounded-2xl border border-slate-200">
                  <Skeleton className="h-44 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-2xs max-w-md mx-auto">
              <ShoppingBag className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Products Found</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {searchQuery ? `No items matched "${searchQuery}".` : "No products available in this category."}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setPage(1);
                }}
              >
                Reset Catalog Filter
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card
                  key={product.product_id}
                  onClick={() => navigate(`/product/${product.product_id}`)}
                  className="group cursor-pointer h-full flex flex-col justify-between overflow-hidden border border-slate-200/90 hover:border-blue-500 hover:shadow-xl transition-all duration-300 rounded-2xl bg-white"
                >
                  {/* Card Image Header */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}

                    <div className="absolute top-2.5 right-2.5">
                      {getStockBadge(product.stock)}
                    </div>

                    <button
                      onClick={(e) => handleAddToWishlist(product, e)}
                      className="absolute top-2.5 left-2.5 h-8 w-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-white transition-all shadow-xs"
                      title="Save to Wishlist"
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Card Body */}
                  <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {product.category_name || "General"}
                      </span>

                      <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.product_name}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-normal">
                        {product.description || "High-quality store item with top customer satisfaction ratings."}
                      </p>
                    </div>

                    {/* Price and Actions */}
                    <div className="pt-3 border-t border-slate-100 space-y-2 mt-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-slate-900 tracking-tight">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                        <div className="flex items-center text-amber-400 text-xs font-semibold gap-0.5">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          <span className="text-slate-700">4.8</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.product_id}`);
                          }}
                          className="flex-1 text-xs h-8 gap-1 border-slate-200"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={product.stock <= 0}
                          className="flex-1 text-xs h-8 gap-1"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          <span>Cart</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="gap-1 text-xs h-8"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>

              <span className="text-xs font-semibold text-slate-600 px-2">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="gap-1 text-xs h-8"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </section>

        {/* WHY CHOOSE US / BENEFITS SECTION */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-lg">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight">Why Shop With Us</h2>
            <p className="text-xs text-slate-400">Experience world-class online shopping standard</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Express Worldwide Shipping</h3>
              <p className="text-xs text-slate-400">Fast, door-to-door delivery with real-time package tracking.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Secure Encrypted Payments</h3>
              <p className="text-xs text-slate-400">SSL 256-bit encryption ensuring 100% safe transaction processing.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <RotateCcw className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-white">30-Day Money Back Guarantee</h3>
              <p className="text-xs text-slate-400">Hassle-free return policy if you are not fully satisfied.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Headphones className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-white">24/7 Customer Support</h3>
              <p className="text-xs text-slate-400">Dedicated support team available anytime for your inquiries.</p>
            </div>
          </div>
        </section>

        {/* NEWSLETTER SECTION (UI ONLY) */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-lg">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Stay Updated With Exclusive Offers</h2>
            <p className="text-blue-100 text-xs sm:text-sm">
              Subscribe to our weekly newsletter and get early access to new arrivals and promotional sales.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-2.5 min-w-[320px]">
            <Input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 text-xs h-10 focus-visible:ring-white"
              required
            />
            <Button type="submit" variant="secondary" className="h-10 text-xs font-bold text-blue-900 bg-white hover:bg-blue-50 shrink-0">
              Subscribe Now
            </Button>
          </form>
        </section>

        {/* STORE FOOTER */}
        <footer className="border-t border-slate-200 pt-8 pb-6 text-slate-500 text-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-bold text-base text-blue-600">
                <div className="h-7 w-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <span className="text-slate-900 font-extrabold tracking-tight">Shop Store</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Your premier destination for high-quality products across electronics, apparel, and home supplies.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Quick Links</h4>
              <ul className="space-y-1.5">
                <li><button onClick={() => navigate("/home")} className="hover:text-blue-600">Products Catalog</button></li>
                <li><button onClick={() => navigate("/cart")} className="hover:text-blue-600">Shopping Cart</button></li>
                <li><button onClick={() => navigate("/wishlist")} className="hover:text-blue-600">Saved Wishlist</button></li>
                <li><button onClick={() => navigate("/orders")} className="hover:text-blue-600">Order History</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Customer Care</h4>
              <ul className="space-y-1.5">
                <li><button onClick={() => navigate("/support_tickets")} className="hover:text-blue-600">Help & Support</button></li>
                <li><span className="text-slate-400">Shipping & Delivery Policy</span></li>
                <li><span className="text-slate-400">Terms of Service</span></li>
                <li><span className="text-slate-400">Privacy Policy</span></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Payment Methods</h4>
              <p className="text-slate-500 leading-relaxed">
                We accept Cash on Delivery, Credit Cards, Debit Cards, and Direct Bank Transfers.
              </p>
              <div className="flex gap-2 pt-1 text-slate-400">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>100% Encrypted Checkout</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
            <p>© {new Date().getFullYear()} Shop Store. All rights reserved.</p>
            <p>Designed for Portfolio & Recruiter Demo</p>
          </div>
        </footer>
      </div>
    </CustomerLayout>
  );
}