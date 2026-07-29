import { useState, useEffect } from "react";
import SellerLayout from "../../components/SellerLayout";
import api from "../../api/axios";
import { Plus, Search, Trash2, Image as ImageIcon, Loader2, ChevronLeft, ChevronRight, Package, AlertCircle, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    product_name: "",
    price: "",
    stock: "",
    category_id: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/seller/products?page=${currentPage}&limit=10`);
      setProducts(res.data?.products || []);
      setTotalPages(res.data?.pages || 1);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching products",
        description: "Failed to load seller catalog",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/product/delete/${deleteId}`);
      toast({
        title: "Product Deleted",
        description: `Product #${deleteId} removed`,
        variant: "success",
      });
      setDeleteId(null);
      fetchProducts(page);
    } catch (error) {
      console.error(error);
      toast({
        title: "Deletion Failed",
        description: "Could not remove product",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("image_url", image);
      formData.append("product_name", form.product_name);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category_id", form.category_id);

      await api.post("/product/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Product Created",
        description: `${form.product_name} added to store catalog`,
        variant: "success",
      });

      setShowModal(false);
      setForm({ product_name: "", price: "", stock: "", category_id: "" });
      setImage(null);
      setImagePreview(null);
      fetchProducts(page);
    } catch (err) {
      console.error(err);
      toast({
        title: "Creation Failed",
        description: err.response?.data?.message || "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.product_id?.toString().includes(searchQuery)
  );

  const getStockBadge = (stock) => {
    if (stock <= 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock <= 5) return <Badge variant="warning">Low Stock ({stock})</Badge>;
    return <Badge variant="success">{stock} In Stock</Badge>;
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">My Products</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Manage store listings and inventory stock</p>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            variant="success"
            className="gap-2 shadow-2xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E2E8F0] shadow-2xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or ID..."
              className="pl-9 border-none shadow-none focus-visible:ring-0 text-xs"
            />
          </div>
          <span className="text-xs font-semibold text-[#64748B] pr-2 hidden sm:inline">
            Showing {filteredProducts.length} items
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Package className="h-10 w-10 text-[#64748B] mx-auto mb-2" />
              <h3 className="font-semibold text-[#0F172A] text-sm">No Products Listed</h3>
              <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto mb-4">
                {searchQuery ? "No products match your search query." : "Click Add Product to start listing store products."}
              </p>
              {!searchQuery && (
                <Button size="sm" variant="success" onClick={() => setShowModal(true)}>
                  Add Product
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell className="font-mono text-xs font-semibold text-[#475569]">
                      #{product.product_id}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] overflow-hidden shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.product_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[#64748B]">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-[#0F172A] text-sm">
                          {product.product_name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        Category #{product.category_id}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-extrabold text-[#0F172A]">
                      ${parseFloat(product.price).toFixed(2)}
                    </TableCell>

                    <TableCell>{getStockBadge(product.stock)}</TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#475569]">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <DropdownMenuItem destructive onClick={() => setDeleteId(product.product_id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
              <span className="text-xs text-[#64748B] font-medium">
                Page <span className="font-bold text-[#0F172A]">{page}</span> of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 text-xs"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogHeader>
          <DialogTitle>Add Product to Store</DialogTitle>
          <DialogDescription>List a new item in your merchant catalog.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Product Name
            </label>
            <Input
              type="text"
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              placeholder="e.g. Mechanical Keyboard"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Price ($)
              </label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="59.99"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Stock Quantity
              </label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Category ID
            </label>
            <Input
              type="number"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              placeholder="1"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Product Image
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {imagePreview && (
              <div className="mt-2 relative h-28 w-full rounded-md overflow-hidden border border-[#E2E8F0]">
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              disabled={submitting}
              className="flex-1 gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Create Product</span>
              )}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#DC2626] font-semibold text-sm">
            <AlertCircle className="h-5 w-5" />
            <span>Confirm Delete</span>
          </div>
          <DialogTitle className="mt-1">Delete Product #{deleteId}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The product will be removed from your catalog.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="flex-1">
            Delete Product
          </Button>
        </div>
      </Dialog>
    </SellerLayout>
  );
};

export default SellerProducts;
