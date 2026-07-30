import { useState, useEffect } from "react";
import SellerLayout from "../../components/SellerLayout";
import api from "../../api/axios";
import {
  Plus,
  Search,
  Trash2,
  Image as ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Package,
  Pencil,
  X
} from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
    description: "",
    price: "",
    stock: "",
    category_id: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const fetchProducts = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/seller/products?page=${currentPage}&limit=10`,
      );
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
      formData.append("description", form.description);
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
      setForm({ product_name: "", description: "", price: "", stock: "", category_id: "" });
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (image) {
        const formData = new FormData();
        formData.append("image_url", image);
        formData.append("product_name", form.product_name);
        formData.append("description", form.description);
        formData.append("price", form.price);
        formData.append("stock", form.stock);
        formData.append("category_id", form.category_id);

        await api.patch(`/product/update/${editProduct.product_id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.patch(`/product/update/${editProduct.product_id}`, {
          product_name: form.product_name,
          description: form.description,
          price: form.price,
          stock: form.stock,
          category_id: form.category_id,
        });
      }

      toast({
        title: "Product Updated",
        description: `${form.product_name} updated successfully`,
        variant: "success",
      });

      setShowModal(false);
      setEditProduct(null);
      setForm({ product_name: "", description: "", price: "", stock: "", category_id: "" });
      setImage(null);
      setImagePreview(null);

      fetchProducts(page);
    } catch (error) {
      console.error(error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.product_id?.toString().includes(searchQuery),
  );

  const getStockChip = (stock) => {
    if (stock <= 0) return <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-full">Out of Stock</span>;
    if (stock <= 5) return <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full">Low Stock ({stock})</span>;
    return <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full">In Stock ({stock})</span>;
  };

  return (
    <SellerLayout>
      <div className="space-y-8 pb-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">MERCHANT CATALOG</span>
            <h1 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A] mt-1">
              Store Product Listings
            </h1>
          </div>

          <button
            onClick={() => {
              setEditProduct(null);
              setForm({ product_name: "", description: "", price: "", stock: "", category_id: "1" });
              setImage(null);
              setImagePreview(null);
              setShowModal(true);
            }}
            className="px-6 py-3 bg-[#1A1A1A] text-white font-semibold text-xs rounded-xl hover:bg-[#B8865B] transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#71717A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or ID..."
              className="w-full bg-white border border-[#E8E5DF] rounded-xl pl-10 pr-4 py-3 text-xs text-[#1A1A1A] placeholder-[#71717A] focus:outline-none focus:border-[#B8865B] shadow-sm"
            />
          </div>
          <span className="text-xs font-semibold text-[#52525B]">
            Total Listings: <strong className="text-[#1A1A1A]">{filteredProducts.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#71717A] animate-pulse">Loading merchant catalog...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <Package className="h-12 w-12 text-[#B8865B] mx-auto opacity-60" />
              <h3 className="text-lg font-bold text-[#1A1A1A]">No Products Found</h3>
              <p className="text-xs text-[#6B6B6B]">No items match your search parameter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E5DF] text-[#71717A] uppercase bg-[#F8F7F4]">
                    <th className="p-4 font-bold">Image</th>
                    <th className="p-4 font-bold">Product Name & SKU</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold">Stock</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DF]">
                  {filteredProducts.map((product) => (
                    <tr key={product.product_id} className="hover:bg-[#F8F7F4] text-[#1A1A1A] transition-colors">
                      <td className="p-4">
                        <div className="h-12 w-12 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF] overflow-hidden flex items-center justify-center">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.product_name} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-[#71717A] opacity-30" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#1A1A1A] text-sm">{product.product_name}</div>
                        <div className="text-[11px] text-[#B8865B] font-semibold">SKU: MB-00{product.product_id}</div>
                      </td>
                      <td className="p-4 font-bold font-display text-sm text-[#1A1A1A]">
                        ${parseFloat(product.price).toFixed(2)} USD
                      </td>
                      <td className="p-4">
                        {getStockChip(product.stock)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditProduct(product);
                              setForm({
                                product_name: product.product_name,
                                description: product.description || "",
                                price: product.price,
                                stock: product.stock,
                                category_id: product.category_id || "1",
                              });
                              setImage(null);
                              setImagePreview(product.image_url);
                              setShowModal(true);
                            }}
                            className="p-2 border border-[#E8E5DF] bg-[#F8F7F4] text-[#52525B] hover:text-[#1A1A1A] hover:bg-[#E8E5DF] rounded-xl transition-colors"
                            title="Edit Product"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(product.product_id)}
                            className="p-2 border border-[#E8E5DF] bg-[#F8F7F4] text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-[#E8E5DF] bg-[#F8F7F4] flex justify-between items-center text-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-[#E8E5DF] bg-white text-[#1A1A1A] rounded-xl disabled:opacity-40 font-semibold"
              >
                Previous
              </button>
              <span className="text-[#71717A]">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-[#E8E5DF] bg-white text-[#1A1A1A] rounded-xl disabled:opacity-40 font-semibold"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <div className="bg-white border border-[#E8E5DF] rounded-2xl text-[#1A1A1A] p-8 max-w-lg w-full shadow-2xl">
          <DialogHeader className="pb-4 border-b border-[#E8E5DF] flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold font-serif-editorial text-[#1A1A1A]">
                {editProduct ? "Edit Product Listing" : "Create New Product"}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6B6B6B] mt-1">
                Fill out details to publish on Market Bros Marketplace.
              </DialogDescription>
            </div>
            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-[#F8F7F4] rounded-xl">
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <form onSubmit={editProduct ? handleUpdate : handleSubmit} className="space-y-4 my-6 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Product Name*</label>
              <input
                type="text"
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                required
                className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Price (USD)*</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Stock Units*</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                  className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Category ID*</label>
              <input
                type="text"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                placeholder="1 (Furniture), 2 (Home Decor), 3 (Electronics), 4 (Appliances)"
                required
                className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#B8865B]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Product Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl p-2.5 text-xs text-[#1A1A1A]"
              />
              {imagePreview && (
                <div className="mt-2 h-20 w-20 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF] overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-[#1A1A1A] text-white font-semibold text-xs rounded-xl hover:bg-[#B8865B] transition-colors shadow-md"
              >
                {submitting ? "Saving..." : editProduct ? "Update Product" : "Publish Product"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <div className="bg-white border border-[#E8E5DF] rounded-2xl text-[#1A1A1A] p-6 max-w-md w-full shadow-2xl space-y-4">
          <h3 className="text-lg font-bold font-serif-editorial text-[#1A1A1A]">Confirm Deletion</h3>
          <p className="text-xs text-[#6B6B6B]">
            Are you sure you want to delete Product #{deleteId}? This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 py-2.5 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 bg-red-600 text-white font-semibold text-xs rounded-xl hover:bg-red-700 shadow-md"
            >
              Delete Product
            </button>
          </div>
        </div>
      </Dialog>
    </SellerLayout>
  );
};

export default SellerProducts;
