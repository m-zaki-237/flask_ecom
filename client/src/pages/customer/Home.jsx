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
  Sparkles,
  SlidersHorizontal,
  Maximize2,
  X,
  CheckCircle,
  Tag,
  Clock,
  Layers,
  ArrowUpRight
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
        title: "Added to Bag",
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
        title: "Added to Bag",
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
        title: "Wishlist Updated",
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

  return (
    <CustomerLayout>
      <div className="space-y-12 pb-16">
        {/* DeLorean Style Stats Bar Header */}
        <div className="border border-[#282630] bg-[#16151a] p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#282630]">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#282630] text-[#d4a373] text-[11px] font-mono-tech uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                <span>MARKETPLACE</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-bold uppercase tracking-wider text-white">
                FURNITURE WALEY RESERVATIONS & CATALOGUE
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/cart")}
                className="px-5 py-3 bg-white text-black font-mono-tech font-bold text-xs uppercase tracking-wider hover:bg-[#d4a373] transition-colors"
              >
                MAKE COLLECTION OFFER
              </button>
              <a
                href="#catalog"
                className="px-5 py-3 border border-[#282630] bg-[#0f0e13] text-white font-mono-tech text-xs uppercase tracking-wider hover:bg-[#282630] transition-colors flex items-center gap-2"
              >
                <span>EXPLORE CATALOGUE</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#d4a373]" />
              </a>
            </div>
          </div>

          {/* DeLorean Style Metric Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 font-mono-tech text-xs">
            <div className="space-y-1">
              <span className="text-[#6c697b] uppercase tracking-wider block">TOTAL VOLUME:</span>
              <span className="text-lg font-bold text-white tracking-tight">$4,850,000 USD</span>
            </div>
            <div className="space-y-1">
              <span className="text-[#6c697b] uppercase tracking-wider block">UNIQUE CRAFTSMEN:</span>
              <span className="text-lg font-bold text-white tracking-tight">1,271 CRAFTSMEN</span>
            </div>
            <div className="space-y-1">
              <span className="text-[#6c697b] uppercase tracking-wider block">ACTIVE PIECES:</span>
              <span className="text-lg font-bold text-white tracking-tight">{products.length} LISTED</span>
            </div>
            <div className="space-y-1">
              <span className="text-[#6c697b] uppercase tracking-wider block">FLOOR PRICE:</span>
              <span className="text-lg font-bold text-[#d4a373] tracking-tight">$450.00 USD</span>
            </div>
          </div>
        </div>

        {/* DeLorean Featured Hero Card Banner */}
        <div className="relative border border-[#282630] bg-[#16151a] overflow-hidden p-8 sm:p-12">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 hidden lg:block pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
              alt="Furniture Waley Hero"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373]">
              BE PART OF THE BEGINNING
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold uppercase tracking-wide text-white leading-tight">
              MAKE AN OFFER ON OUR LOWEST AVAILABLE BUILD SLOT & SECURE YOUR PLACE IN LUXURY.
            </h2>
            <p className="text-xs font-mono-tech text-[#a19fad] leading-relaxed">
              Be among the first to own the future of interior design. This exclusive furniture marketplace reserves your spot for iconic handcrafted pieces, custom upholstery, and solid timber woodwork.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/cart")}
                className="px-6 py-3 bg-white text-black font-mono-tech font-bold text-xs uppercase tracking-wider hover:bg-[#d4a373] transition-colors"
              >
                MAKE AN OFFER NOW
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar & Filter Navigation Bar */}
        <div id="catalog" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#282630] pb-4">
            {/* Items / Activity Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("items")}
                className={`px-5 py-2 text-xs font-mono-tech uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === "items"
                    ? "text-white border-[#d4a373] bg-[#16151a]"
                    : "text-[#6c697b] border-transparent hover:text-white"
                }`}
              >
                ITEMS ({filteredProducts.length})
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`px-5 py-2 text-xs font-mono-tech uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === "activity"
                    ? "text-white border-[#d4a373] bg-[#16151a]"
                    : "text-[#6c697b] border-transparent hover:text-white"
                }`}
              >
                RECENT ACTIVITY
              </button>
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-[#6c697b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH SLOT NUMBER OR NAME..."
                  className="w-full bg-[#0f0e13] border border-[#282630] pl-9 pr-4 py-2 text-xs font-mono-tech text-white placeholder-[#6c697b] focus:outline-none focus:border-[#d4a373]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1c1b22] border border-[#282630] text-xs font-mono-tech text-white uppercase hover:border-[#d4a373]"
              >
                SEARCH
              </button>
            </form>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono-tech uppercase tracking-widest text-[#6c697b] mr-2">
              CATEGORIES:
            </span>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-[11px] font-mono-tech uppercase tracking-wider border transition-colors ${
                selectedCategory === null
                  ? "bg-white text-black font-bold border-white"
                  : "bg-[#16151a] text-[#a19fad] border-[#282630] hover:text-white"
              }`}
            >
              ALL ITEMS
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() => {
                  setSelectedCategory(cat.category_id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-[11px] font-mono-tech uppercase tracking-wider border transition-colors ${
                  selectedCategory === cat.category_id
                    ? "bg-white text-black font-bold border-white"
                    : "bg-[#16151a] text-[#a19fad] border-[#282630] hover:text-white"
                }`}
              >
                {cat.category_name}
              </button>
            ))}
          </div>

          {/* Activity Tab View */}
          {activeTab === "activity" ? (
            <div className="border border-[#282630] bg-[#16151a] p-8 text-center space-y-4">
              <Clock className="h-8 w-8 text-[#d4a373] mx-auto" />
              <h3 className="text-lg font-mono-tech uppercase font-bold text-white">LIVE MARKETPLACE ACTIVITY</h3>
              <p className="text-xs font-mono-tech text-[#6c697b] max-w-md mx-auto">
                Real-time blockchain transactions, slot offers, and furniture reserve bids.
              </p>
              <div className="space-y-3 text-left max-w-xl mx-auto pt-4">
                {[
                  { event: "Offer Submitted", price: "$1,450 USD", slot: "Slot #FW-108", time: "2 mins ago" },
                  { event: "Piece Reserved", price: "$2,200 USD", slot: "Slot #FW-042", time: "14 mins ago" },
                  { event: "Listing Created", price: "$890 USD", slot: "Slot #FW-319", time: "1 hour ago" },
                ].map((act, idx) => (
                  <div key={idx} className="p-3 bg-[#0f0e13] border border-[#282630] flex items-center justify-between text-xs font-mono-tech">
                    <div className="flex items-center gap-3">
                      <span className="text-[#22c55e] font-bold">● {act.event}</span>
                      <span className="text-white">{act.slot}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#d4a373]">{act.price}</span>
                      <span className="text-[#6c697b]">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Items Product Grid */
            <div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-80 bg-[#16151a] border border-[#282630] animate-pulse p-4 flex flex-col justify-between">
                      <div className="h-40 bg-[#282630]" />
                      <div className="h-4 bg-[#282630] w-3/4" />
                      <div className="h-4 bg-[#282630] w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="border border-[#282630] bg-[#16151a] p-16 text-center space-y-4">
                  <ShoppingBag className="h-10 w-10 text-[#6c697b] mx-auto" />
                  <h3 className="text-base font-mono-tech uppercase font-bold text-white">NO BUILD SLOTS FOUND</h3>
                  <p className="text-xs font-mono-tech text-[#6c697b]">
                    {searchQuery ? `No furniture pieces matched "${searchQuery}".` : "No items listed in this category."}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                      setPage(1);
                    }}
                    className="px-4 py-2 border border-[#282630] bg-[#0f0e13] text-xs font-mono-tech uppercase text-white hover:border-[#d4a373]"
                  >
                    RESET CATALOG FILTERS
                  </button>
                </div>
              ) : (
                /* DeLorean Style Grid Cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.product_id}
                      onClick={() => navigate(`/product/${product.product_id}`)}
                      className="group cursor-pointer bg-[#16151a] border border-[#282630] hover:border-white transition-all flex flex-col justify-between overflow-hidden"
                    >
                      {/* Image Preview Container */}
                      <div className="relative h-64 bg-[#0f0e13] overflow-hidden border-b border-[#282630]">
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

                        {/* Status Chip Badge */}
                        <div className="absolute top-3 left-3">
                          {product.stock > 0 ? (
                            <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono-tech uppercase tracking-widest">
                              LISTED
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-mono-tech uppercase tracking-widest">
                              RESERVED
                            </span>
                          )}
                        </div>

                        {/* Action Overlays */}
                        <button
                          onClick={(e) => handleAddToWishlist(product, e)}
                          className="absolute top-3 right-3 p-2 bg-[#0f0e13]/80 border border-[#282630] text-[#a19fad] hover:text-red-400 hover:border-red-400 transition-colors"
                          title="Save to Wishlist"
                        >
                          <Heart className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewProduct(product);
                          }}
                          className="absolute bottom-3 right-3 p-2 bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity border border-[#282630]"
                          title="Quick View"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Card Content & Details */}
                      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono-tech text-[#6c697b] uppercase">
                            <span>SLOT #FW-00{product.product_id}</span>
                            <span className="text-[#d4a373]">{product.category_name || "FURNITURE"}</span>
                          </div>

                          <h3 className="text-sm font-mono-tech font-bold uppercase text-white line-clamp-1 group-hover:text-[#d4a373] transition-colors">
                            {product.product_name}
                          </h3>

                          <p className="text-xs font-mono-tech text-[#6c697b] line-clamp-2 leading-relaxed">
                            {product.description || "Bespoke handcrafted furniture piece."}
                          </p>
                        </div>

                        {/* Price & Primary CTA */}
                        <div className="pt-4 border-t border-[#282630] space-y-3 mt-auto">
                          <div className="flex items-center justify-between font-mono-tech text-xs">
                            <span className="text-[#6c697b] uppercase">CURRENT PRICE:</span>
                            <span className="text-base font-bold text-white">${parseFloat(product.price).toFixed(2)} USD</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/product/${product.product_id}`);
                              }}
                              className="py-2 border border-[#282630] bg-[#0f0e13] text-[11px] font-mono-tech uppercase text-white hover:border-white transition-colors flex items-center justify-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              <span>VIEW</span>
                            </button>

                            <button
                              onClick={(e) => handleAddToCart(product, e)}
                              disabled={product.stock <= 0}
                              className="py-2 bg-white text-black font-mono-tech font-bold text-[11px] uppercase tracking-wider hover:bg-[#d4a373] transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                              <ShoppingCart className="h-3 w-3" />
                              <span>ADD TO BAG</span>
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
                    className="px-4 py-2 border border-[#282630] bg-[#16151a] text-xs font-mono-tech uppercase text-white hover:border-[#d4a373] disabled:opacity-40 flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>PREVIOUS</span>
                  </button>

                  <span className="text-xs font-mono-tech text-[#6c697b] px-3">
                    PAGE <span className="text-white font-bold">{page}</span> OF <span className="text-white font-bold">{totalPages}</span>
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-[#282630] bg-[#16151a] text-xs font-mono-tech uppercase text-white hover:border-[#d4a373] disabled:opacity-40 flex items-center gap-1"
                  >
                    <span>NEXT</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DeLorean Style Information Banner */}
        <div className="border border-[#282630] bg-[#16151a] p-8 sm:p-12 space-y-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373]">
              AUTHENTICATION & GUARANTEE
            </span>
            <h2 className="text-2xl font-display font-bold uppercase text-white">
              CRAFTSMANSHIP & VERIFIED ALLOCATION
            </h2>
            <p className="text-xs font-mono-tech text-[#a19fad] leading-relaxed">
              Every Furniture Waley piece is stamped with a unique serial number, verified timber origin certificate, and backed by white-glove architectural delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#282630] font-mono-tech text-xs">
            <div className="space-y-2">
              <span className="text-white font-bold block uppercase">1. SECURE RESERVATION</span>
              <p className="text-[#6c697b]">Lock in your furniture slot with guaranteed priority dispatch.</p>
            </div>
            <div className="space-y-2">
              <span className="text-white font-bold block uppercase">2. BESPOKE CUSTOMIZATION</span>
              <p className="text-[#6c697b]">Select solid wood finishes, premium upholstery fabrics, and dimensions.</p>
            </div>
            <div className="space-y-2">
              <span className="text-white font-bold block uppercase">3. WHITE-GLOVE DISPATCH</span>
              <p className="text-[#6c697b]">Inspected, assembled, and installed by expert furniture artisans.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <Dialog open={!!quickViewProduct} onClose={() => setQuickViewProduct(null)}>
        {quickViewProduct && (
          <div className="bg-[#16151a] border border-[#282630] text-white p-6 max-w-2xl w-full">
            <DialogHeader className="pb-4 border-b border-[#282630] flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-mono-tech uppercase font-bold text-white">
                  {quickViewProduct.product_name}
                </DialogTitle>
                <DialogDescription className="text-xs font-mono-tech text-[#d4a373]">
                  SLOT #FW-00{quickViewProduct.product_id} • {quickViewProduct.category_name || "FURNITURE"}
                </DialogDescription>
              </div>
              <button
                onClick={() => setQuickViewProduct(null)}
                className="p-1 border border-[#282630] text-[#6c697b] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="h-56 bg-[#0f0e13] border border-[#282630] overflow-hidden">
                {quickViewProduct.image_url ? (
                  <img
                    src={quickViewProduct.image_url}
                    alt={quickViewProduct.product_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[#6c697b]">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
              </div>

              <div className="space-y-4 font-mono-tech text-xs">
                <div>
                  <span className="text-[#6c697b] uppercase block">DESCRIPTION:</span>
                  <p className="text-white text-xs leading-relaxed mt-1">
                    {quickViewProduct.description || "Handcrafted artisanal furniture piece."}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#282630] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#6c697b]">PRICE:</span>
                    <span className="text-white font-bold">${parseFloat(quickViewProduct.price).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6c697b]">AVAILABILITY:</span>
                    <span className={quickViewProduct.stock > 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                      {quickViewProduct.stock > 0 ? `IN STOCK (${quickViewProduct.stock})` : "OUT OF STOCK"}
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
                    className="w-full py-3 bg-white text-black font-mono-tech font-bold text-xs uppercase hover:bg-[#d4a373] transition-colors"
                  >
                    ADD TO CART
                  </button>
                  <button
                    onClick={() => {
                      navigate(`/product/${quickViewProduct.product_id}`);
                      setQuickViewProduct(null);
                    }}
                    className="w-full py-2.5 border border-[#282630] bg-[#0f0e13] text-xs font-mono-tech uppercase text-white hover:border-white"
                  >
                    FULL DETAILS
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