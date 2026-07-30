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
    if (stock <= 0) return <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] uppercase font-bold">OUT OF STOCK</span>;
    if (stock <= 5) return <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] uppercase font-bold">LOW STOCK ({stock})</span>;
    return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] uppercase font-bold">IN STOCK ({stock})</span>;
  };

  return (
    <SellerLayout>
      <div className="space-y-8 pb-16 font-mono-tech">
        {/* Header */}
        <div className="border border-[#282630] bg-[#16151a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373]">MERCHANT INVENTORY</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mt-1">
              STORE PRODUCTS & BUILD SLOTS
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
            className="px-5 py-3 bg-white text-black font-mono-tech font-bold text-xs uppercase hover:bg-[#d4a373] transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>ADD PRODUCT</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#282630] pb-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#6c697b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH PRODUCTS BY NAME OR ID..."
              className="w-full bg-[#0f0e13] border border-[#282630] pl-9 pr-4 py-2.5 text-xs font-mono-tech text-white placeholder-[#6c697b] focus:outline-none focus:border-[#d4a373]"
            />
          </div>
          <span className="text-xs font-mono-tech text-[#6c697b] uppercase">
            TOTAL LISTINGS: <strong className="text-white">{filteredProducts.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="border border-[#282630] bg-[#16151a] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#6c697b] animate-pulse">LOADING MERCHANT CATALOGUE...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <Package className="h-10 w-10 text-[#6c697b] mx-auto" />
              <h3 className="text-base font-bold uppercase text-white">NO PRODUCTS FOUND</h3>
              <p className="text-xs text-[#6c697b]">No products match your current search parameter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#282630] text-[#6c697b] uppercase bg-[#0f0e13]">
                    <th className="p-4 font-bold">IMAGE</th>
                    <th className="p-4 font-bold">PRODUCT NAME & ID</th>
                    <th className="p-4 font-bold">PRICE</th>
                    <th className="p-4 font-bold">STOCK</th>
                    <th className="p-4 font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282630]">
                  {filteredProducts.map((product) => (
                    <tr key={product.product_id} className="hover:bg-[#1c1b22] text-white">
                      <td className="p-4">
                        <div className="h-12 w-12 bg-[#0f0e13] border border-[#282630] overflow-hidden flex items-center justify-center">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.product_name} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-[#6c697b]" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white uppercase">{product.product_name}</div>
                        <div className="text-[10px] text-[#d4a373]">SLOT #FW-00{product.product_id}</div>
                      </td>
                      <td className="p-4 font-bold text-white">
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
                            className="p-2 border border-[#282630] bg-[#0f0e13] text-[#a19fad] hover:text-white hover:border-[#d4a373]"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(product.product_id)}
                            className="p-2 border border-[#282630] bg-[#0f0e13] text-[#6c697b] hover:text-red-400 hover:border-red-400"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
            <div className="p-4 border-t border-[#282630] bg-[#0f0e13] flex justify-between items-center text-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-[#282630] bg-[#16151a] text-white disabled:opacity-40"
              >
                PREVIOUS
              </button>
              <span className="text-[#6c697b]">PAGE {page} OF {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-[#282630] bg-[#16151a] text-white disabled:opacity-40"
              >
                NEXT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <div className="bg-[#16151a] border border-[#282630] text-white p-6 max-w-lg w-full font-mono-tech text-xs">
          <DialogHeader className="pb-4 border-b border-[#282630] flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-lg uppercase font-bold text-white">
                {editProduct ? "EDIT PRODUCT LISTING" : "CREATE NEW PRODUCT"}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#a19fad]">
                Fill out product details to list on Furniture Waley Marketplace.
              </DialogDescription>
            </div>
            <button onClick={() => setShowModal(false)} className="p-1 text-[#6c697b] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <form onSubmit={editProduct ? handleUpdate : handleSubmit} className="space-y-4 my-6">
            <div>
              <label className="block uppercase text-[#a19fad] mb-1">PRODUCT NAME*</label>
              <input
                type="text"
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                required
                className="w-full bg-[#0f0e13] border border-[#282630] p-2.5 text-xs text-white focus:outline-none focus:border-[#d4a373]"
              />
            </div>

            <div>
              <label className="block uppercase text-[#a19fad] mb-1">DESCRIPTION</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-[#0f0e13] border border-[#282630] p-2.5 text-xs text-white focus:outline-none focus:border-[#d4a373]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block uppercase text-[#a19fad] mb-1">PRICE (USD)*</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="w-full bg-[#0f0e13] border border-[#282630] p-2.5 text-xs text-white focus:outline-none focus:border-[#d4a373]"
                />
              </div>

              <div>
                <label className="block uppercase text-[#a19fad] mb-1">STOCK UNITS*</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                  className="w-full bg-[#0f0e13] border border-[#282630] p-2.5 text-xs text-white focus:outline-none focus:border-[#d4a373]"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase text-[#a19fad] mb-1">CATEGORY ID*</label>
              <input
                type="text"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                placeholder="1 (Furniture), 2 (Lighting), etc."
                required
                className="w-full bg-[#0f0e13] border border-[#282630] p-2.5 text-xs text-white focus:outline-none focus:border-[#d4a373]"
              />
            </div>

            <div>
              <label className="block uppercase text-[#a19fad] mb-1">PRODUCT IMAGE FILE</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full bg-[#0f0e13] border border-[#282630] p-2 text-xs text-white"
              />
              {imagePreview && (
                <div className="mt-2 h-20 w-20 bg-[#0f0e13] border border-[#282630] overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-[#282630] bg-[#0f0e13] text-xs font-mono-tech text-white uppercase"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-white text-black font-mono-tech font-bold text-xs uppercase hover:bg-[#d4a373] transition-colors"
              >
                {submitting ? "SAVING..." : editProduct ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <div className="bg-[#16151a] border border-[#282630] text-white p-6 max-w-md w-full font-mono-tech text-xs space-y-4">
          <h3 className="text-base font-bold uppercase text-white">CONFIRM DELETION</h3>
          <p className="text-xs text-[#a19fad]">
            Are you sure you want to delete Product #{deleteId}? This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 py-2 border border-[#282630] bg-[#0f0e13] text-white uppercase"
            >
              CANCEL
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2 bg-red-500 text-white font-bold uppercase hover:bg-red-600"
            >
              DELETE
            </button>
          </div>
        </div>
      </Dialog>
    </SellerLayout>
  );
};

export default SellerProducts;
