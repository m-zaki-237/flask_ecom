import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { cn } from "@/lib/utils";
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
  Sparkles,
  SlidersHorizontal,
  Maximize2,
  X,
  CheckCircle,
  Tag,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  Award,
  Filter,
  Check
} from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("items"); // 'items' or 'activity'
  const [stockFilter, setStockFilter] = useState("all"); // 'all', 'in_stock', 'limited'

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState(null);

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
        title: "Sign In Required",
        description: "Please sign in to save items to your personal wishlist",
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
        title: "Saved to Wishlist",
        description: `${product.product_name} saved to your wishlist`,
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

  const filteredProducts = products.filter((p) => {
    if (stockFilter === "in_stock") return p.stock > 0;
    if (stockFilter === "limited") return p.stock > 0 && p.stock <= 5;
    return true;
  });

  const getCategoryImg = (name) => {
    const n = (name || "").toLowerCase();
    if (n.includes("furniture")) return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80";
    if (n.includes("decor") || n.includes("art")) return "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80";
    if (n.includes("electron")) return "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";
    if (n.includes("appliance")) return "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80";
    if (n.includes("access")) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
    return "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80";
  };

  const defaultCategoriesList = [
    { category_id: 1, category_name: "Furniture & Seating" },
    { category_id: 2, category_name: "Home Decor & Art" },
    { category_id: 3, category_name: "Smart Electronics" },
    { category_id: 4, category_name: "Modern Appliances" },
  ];

  const displayCategories = (categories.length > 0 ? categories : defaultCategoriesList).slice(0, 3);

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    setPage(1);
    const el = document.getElementById("catalog");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <CustomerLayout>
      <div className="space-y-16 pb-16">
        
        {/* Crafto Hero Section */}
        <section className="relative rounded-3xl overflow-hidden bg-[#F8F7F4] border border-[#E8E5DF] shadow-[0_15px_40px_rgba(0,0,0,0.03)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
            {/* Left Copy & Actions */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6 z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4EFEA] border border-[#E8E5DF] text-[#B8865B] text-xs font-bold uppercase tracking-wider w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Market Bros Private Collection 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-editorial font-bold text-[#1A1A1A] leading-[1.15] tracking-tight">
                Discover products that <span className="italic text-[#B8865B] font-normal">transform</span> your lifestyle.
              </h1>

              <p className="text-base sm:text-lg text-[#52525B] leading-relaxed max-w-xl font-normal">
                Explore a handpicked multi-category marketplace featuring bespoke furniture, refined home decor, premium electronics, appliances, and lifestyle accessories.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href="#catalog"
                  className="px-8 py-4 bg-[#1A1A1A] text-white font-semibold text-sm rounded-xl hover:bg-[#B8865B] shadow-md hover:shadow-lg transition-all flex items-center gap-3 group"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <button
                  onClick={() => {
                    const el = document.getElementById("categories");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-8 py-4 bg-white text-[#1A1A1A] border border-[#E8E5DF] font-semibold text-sm rounded-xl hover:bg-[#F4EFEA] transition-colors"
                >
                  Browse Departments
                </button>
              </div>

              {/* Stats Bar */}
              <div className="pt-8 border-t border-[#E8E5DF] grid grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-bold font-display text-[#1A1A1A]">1,280+</div>
                  <div className="text-xs text-[#6B6B6B]">Luxury Items</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-[#1A1A1A]">245+</div>
                  <div className="text-xs text-[#6B6B6B]">Verified Sellers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-[#B8865B]">99.8%</div>
                  <div className="text-xs text-[#6B6B6B]">Satisfaction Rate</div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Slider Preview */}
            <div className="lg:col-span-5 relative min-h-[380px] lg:min-h-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80"
                alt="Market Bros Premium Lifestyle Living"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#F8F7F4] via-transparent to-transparent opacity-80" />

              {/* Floating Product Highlight Card */}
              <div className="absolute bottom-8 right-8 left-8 sm:left-auto sm:max-w-xs bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#E8E5DF] shadow-xl flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80"
                  alt="Accent Lounge Chair"
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <span className="text-[10px] font-bold text-[#B8865B] uppercase tracking-wider block">SPOTLIGHT ITEM</span>
                  <h4 className="text-xs font-bold text-[#1A1A1A]">Velvet Artisan Sofa</h4>
                  <p className="text-xs text-[#6B6B6B] font-semibold">$1,450.00 USD</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories Grid */}
        <section id="categories" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">DEPARTMENTS</span>
              <h2 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A]">Featured Categories</h2>
            </div>
            <p className="text-sm text-[#6B6B6B] max-w-md">
              Discover craftsmanship across furniture, home decor, modern electronics, and lifestyle essentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayCategories.map((cat) => (
              <div
                key={cat.category_id}
                onClick={() => handleCategoryClick(cat.category_id)}
                className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all border border-[#E8E5DF]"
              >
                <img
                  src={getCategoryImg(cat.category_name)}
                  alt={cat.category_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <h3 className="text-xl font-bold font-serif-editorial">{cat.category_name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-200 group-hover:text-[#B8865B] transition-colors pt-1">
                    <span>Explore Department</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Promotional Visual Banner */}
        <section className="relative rounded-3xl overflow-hidden bg-[#1A1A1A] text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold tracking-widest text-[#B8865B] uppercase block">
              SEASONAL PRIVILEGE
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif-editorial font-bold leading-tight">
              Elevate your home with white-glove luxury design.
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed font-normal">
              Every Market Bros allocation undergoes structural verification, authentic material certification, and dedicated installation support.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <a
                href="#catalog"
                className="px-7 py-3.5 bg-[#B8865B] text-white font-semibold text-xs rounded-xl uppercase tracking-wider hover:bg-[#9E7047] transition-all"
              >
                View Marketplace Catalogue
              </a>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 hidden lg:block pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
              alt="Market Bros Interior"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Product Catalogue & Search Marketplace Section */}
        <section id="catalog" className="space-y-8 pt-4">
          
          {/* Header & Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#E8E5DF] pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">MARKETPLACE</span>
              <h2 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A]">Curated Product Showcase</h2>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#71717A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by name or keyword..."
                  className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl pl-10 pr-4 py-3 text-xs text-[#1A1A1A] placeholder-[#71717A] focus:outline-none focus:border-[#B8865B]"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#B8865B] transition-colors shrink-0"
              >
                Search
              </button>
            </form>
          </div>

          {/* Filter Pills & View Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setPage(1);
                }}
                className={cn(
                  "px-4 py-2 text-xs font-semibold rounded-xl transition-all border",
                  selectedCategory === null
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm"
                    : "bg-[#F8F7F4] text-[#52525B] border-[#E8E5DF] hover:bg-[#F4EFEA]"
                )}
              >
                All Departments
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.category_id}
                  onClick={() => {
                    setSelectedCategory(cat.category_id);
                    setPage(1);
                  }}
                  className={cn(
                    "px-4 py-2 text-xs font-semibold rounded-xl transition-all border",
                    selectedCategory === cat.category_id
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm"
                      : "bg-[#F8F7F4] text-[#52525B] border-[#E8E5DF] hover:bg-[#F4EFEA]"
                  )}
                >
                  {cat.category_name}
                </button>
              ))}
            </div>

            {/* Stock Filter Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-[#71717A]">Availability:</span>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl px-3 py-1.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
              >
                <option value="all">All Items</option>
                <option value="in_stock">In Stock Only</option>
                <option value="limited">Limited Quantity</option>
              </select>
            </div>
          </div>

          {/* Product Grid Container */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-96 rounded-2xl bg-[#F8F7F4] border border-[#E8E5DF] animate-pulse p-4 flex flex-col justify-between">
                    <div className="h-48 bg-[#E8E5DF] rounded-xl" />
                    <div className="h-4 bg-[#E8E5DF] rounded w-3/4" />
                    <div className="h-4 bg-[#E8E5DF] rounded w-1/2" />
                    <div className="h-10 bg-[#E8E5DF] rounded-xl" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-[#E8E5DF] bg-[#F8F7F4] p-16 text-center space-y-4">
                <ShoppingBag className="h-12 w-12 text-[#B8865B] mx-auto opacity-60" />
                <h3 className="text-lg font-bold text-[#1A1A1A]">No Products Found</h3>
                <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">
                  {searchQuery ? `No products matched "${searchQuery}".` : "No active items in this category currently."}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                    setPage(1);
                  }}
                  className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#B8865B] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              /* Crafto Luxury Product Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <div
                    key={product.product_id}
                    onClick={() => navigate(`/product/${product.product_id}`)}
                    className="group cursor-pointer bg-white rounded-2xl border border-[#E8E5DF] crafto-card-shadow-hover flex flex-col justify-between overflow-hidden"
                  >
                    {/* Image Box */}
                    <div className="relative h-72 bg-[#F8F7F4] overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.product_name}
                          className="h-full w-full object-cover luxury-image-zoom"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#71717A]">
                          <ImageIcon className="h-10 w-10 opacity-30" />
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {product.stock > 0 ? (
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-md border border-[#E8E5DF] text-[#16A34A] text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                            In Stock
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-md border border-[#E8E5DF] text-red-600 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                            Sold Out
                          </span>
                        )}
                      </div>

                      {/* Wishlist Icon */}
                      <button
                        onClick={(e) => handleAddToWishlist(product, e)}
                        className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-[#1A1A1A] hover:text-red-500 hover:bg-white transition-all shadow-md"
                        title="Add to Wishlist"
                      >
                        <Heart className="h-4 w-4" />
                      </button>

                      {/* Quick View Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewProduct(product);
                        }}
                        className="absolute bottom-3 right-3 p-2.5 bg-[#1A1A1A] text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-[#B8865B]"
                        title="Quick View"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#B8865B] uppercase tracking-wider">
                          <span>{product.category_name || "LIFESTYLE"}</span>
                          <span className="text-gray-400 font-normal">#MB-00{product.product_id}</span>
                        </div>

                        <h3 className="text-base font-bold text-[#1A1A1A] group-hover:text-[#B8865B] transition-colors line-clamp-1">
                          {product.product_name}
                        </h3>

                        <p className="text-xs text-[#6B6B6B] line-clamp-2 leading-relaxed">
                          {product.description || "Premium Market Bros product allocation."}
                        </p>
                      </div>

                      {/* Price & Action */}
                      <div className="pt-4 border-t border-[#E8E5DF] space-y-3 mt-auto">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#71717A] uppercase font-semibold">Price</span>
                          <span className="text-lg font-bold font-display text-[#1A1A1A]">
                            ${parseFloat(product.price).toFixed(2)} USD
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/product/${product.product_id}`);
                            }}
                            className="py-2.5 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF] transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Details</span>
                          </button>

                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={product.stock <= 0}
                            className="py-2.5 bg-[#1A1A1A] text-white font-semibold text-xs rounded-xl hover:bg-[#B8865B] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span>Add Cart</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF] disabled:opacity-40 flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs font-semibold text-[#52525B] px-4">
                  Page <span className="text-[#1A1A1A] font-bold">{page}</span> of <span className="text-[#1A1A1A] font-bold">{totalPages}</span>
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF] disabled:opacity-40 flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Market Bros */}
        <section className="rounded-3xl bg-[#F8F7F4] border border-[#E8E5DF] p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">THE MARKET BROS STANDARD</span>
            <h2 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A]">Why Discerning Clients Choose Us</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#E8E5DF] shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-[#F4EFEA] text-[#B8865B] flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A]">Curated Craftsmanship</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Every piece in our marketplace is verified for materials, durability, and premium visual elegance.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E8E5DF] shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-[#F4EFEA] text-[#B8865B] flex items-center justify-center">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A]">White-Glove Dispatch</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Insured express logistics and white-glove placement ensure your purchases arrive in pristine condition.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E8E5DF] shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-[#F4EFEA] text-[#B8865B] flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A]">5-Year Guarantee</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Complete confidence backed by verified merchant guarantees and dedicated concierge support.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Quick View Dialog */}
      <Dialog open={!!quickViewProduct} onClose={() => setQuickViewProduct(null)}>
        {quickViewProduct && (
          <div className="bg-white border border-[#E8E5DF] rounded-2xl text-[#1A1A1A] p-8 max-w-2xl w-full shadow-2xl">
            <DialogHeader className="pb-4 border-b border-[#E8E5DF] flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold font-serif-editorial text-[#1A1A1A]">
                  {quickViewProduct.product_name}
                </DialogTitle>
                <DialogDescription className="text-xs font-semibold text-[#B8865B] mt-0.5">
                  Item #MB-00{quickViewProduct.product_id} • {quickViewProduct.category_name || "LIFESTYLE"}
                </DialogDescription>
              </div>
              <button
                onClick={() => setQuickViewProduct(null)}
                className="p-2 border border-[#E8E5DF] rounded-xl text-gray-400 hover:text-[#1A1A1A] hover:bg-[#F8F7F4]"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="h-64 bg-[#F8F7F4] rounded-xl border border-[#E8E5DF] overflow-hidden">
                {quickViewProduct.image_url ? (
                  <img
                    src={quickViewProduct.image_url}
                    alt={quickViewProduct.product_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[#71717A]">
                    <ImageIcon className="h-10 w-10 opacity-30" />
                  </div>
                )}
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[#71717A] uppercase font-bold text-[10px] block mb-1">Description</span>
                  <p className="text-[#52525B] leading-relaxed">
                    {quickViewProduct.description || "Bespoke Market Bros lifestyle item."}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8E5DF] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Price:</span>
                    <span className="text-[#1A1A1A] font-bold text-sm">${parseFloat(quickViewProduct.price).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Status:</span>
                    <span className={quickViewProduct.stock > 0 ? "text-[#16A34A] font-bold" : "text-red-600 font-bold"}>
                      {quickViewProduct.stock > 0 ? `In Stock (${quickViewProduct.stock})` : "Out of Stock"}
                    </span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    onClick={(e) => {
                      handleAddToCart(quickViewProduct, e);
                      setQuickViewProduct(null);
                    }}
                    disabled={quickViewProduct.stock <= 0}
                    className="w-full py-3 bg-[#1A1A1A] text-white font-semibold text-xs rounded-xl hover:bg-[#B8865B] transition-colors shadow-sm"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      navigate(`/product/${quickViewProduct.product_id}`);
                      setQuickViewProduct(null);
                    }}
                    className="w-full py-2.5 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF]"
                  >
                    View Full Product Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </CustomerLayout>
  );
}