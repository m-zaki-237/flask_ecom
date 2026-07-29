import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { Search, ShoppingBag, ArrowRight, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchProducts = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/product?page=${currentPage}&limit=10`);
      setProducts(res.data?.products || []);
      setTotalPages(res.data?.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const filteredProducts = products.filter((p) =>
    p.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Products Catalog</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Browse quality items available for purchase</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-44 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-lg border border-[#E2E8F0] shadow-2xs max-w-md mx-auto">
            <ShoppingBag className="h-10 w-10 text-[#64748B] mx-auto mb-2" />
            <h3 className="text-base font-bold text-[#0F172A]">No Products Found</h3>
            <p className="text-xs text-[#64748B] mt-1 mb-4">
              {searchQuery ? "No products match your search query." : "Check back later for new inventory."}
            </p>
            {searchQuery && (
              <Button size="sm" variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <Card
                key={product.product_id}
                onClick={() => navigate(`/product/${product.product_id}`)}
                className="group cursor-pointer overflow-hidden border border-[#E2E8F0] hover:border-[#2563EB] transition-colors flex flex-col"
              >
                {/* Product Image */}
                <div className="relative h-44 w-full bg-[#F8FAFC] overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-200"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#64748B]">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {product.stock > 0 ? (
                      <Badge variant="success">{product.stock} in stock</Badge>
                    ) : (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                  </div>
                </div>

                {/* Product Content */}
                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-semibold text-[#0F172A] text-sm leading-snug group-hover:text-[#2563EB] transition-colors line-clamp-2">
                      {product.product_name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] mt-auto">
                    <span className="text-lg font-bold text-[#2563EB]">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-[#2563EB]">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-4">
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

            <span className="text-xs font-semibold text-[#475569] px-2">
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
      </div>
    </CustomerLayout>
  );
}