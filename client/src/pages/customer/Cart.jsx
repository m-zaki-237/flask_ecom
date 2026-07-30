import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { ShoppingCart, Trash2, Minus, Plus, CreditCard, ArrowRight, Loader2, ShieldCheck, ShoppingBag, X, CheckCircle2, Lock } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCart = async () => {
    setLoading(true);
    if (!user) {
      const stored = localStorage.getItem("guest_cart");
      const guestItems = stored ? JSON.parse(stored) : [];
      setItems(guestItems);
      setCart({ cart_id: "guest", items: guestItems });
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/cart", { user_id: user.user_id });
      const cart_id = res.data.cart_id;
      const cartRes = await api.get(`/cart/${cart_id}`);
      setCart(cartRes.data);
      setItems(cartRes.data.items || []);
    } catch (err) {
      console.error("fetchCart error:", err.response?.data);
      toast({
        title: "Error loading cart",
        description: "Failed to load shopping cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const handleRemoveItem = async (item_id) => {
    if (!user) {
      const updated = items.filter((item) => (item.cart_item_id || item.product_id) !== item_id);
      setItems(updated);
      localStorage.setItem("guest_cart", JSON.stringify(updated));
      toast({
        title: "Item Removed",
        description: "Product removed from cart",
        variant: "info",
      });
      return;
    }

    try {
      await api.delete(`/cart/${cart.cart_id}/items/${item_id}`);
      toast({
        title: "Item Removed",
        description: "Product removed from cart",
        variant: "info",
      });
      fetchCart();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuantity = async (item_id, quantity) => {
    if (quantity < 1) return;

    if (!user) {
      const updated = items.map((item) =>
        (item.cart_item_id || item.product_id) === item_id ? { ...item, quantity } : item
      );
      setItems(updated);
      localStorage.setItem("guest_cart", JSON.stringify(updated));
      return;
    }

    try {
      await api.patch(`/cart/${cart.cart_id}/items/${item_id}`, { quantity });
      fetchCart();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const handlePlaceOrder = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your purchase.",
        variant: "warning",
      });
      navigate("/login", { state: { message: "Please sign in to complete your purchase." } });
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmOrder = async () => {
    setPlacing(true);
    try {
      const orderRes = await api.post("/orders", {
        user_id: user.user_id,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });

      const totalAmount = parseFloat(items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2));

      await api.post("/payments/create", {
        order_id: orderRes.data.order_id,
        amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: "pending",
      });

      for (const item of items) {
        await api.delete(`/cart/${cart.cart_id}/items/${item.cart_item_id}`);
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Order #${orderRes.data.order_id} has been registered.`,
        variant: "success",
      });

      setShowPaymentModal(false);
      navigate("/orders");
    } catch (err) {
      console.error(err);
      toast({
        title: "Order Failed",
        description: err.response?.data?.message || "Failed to process order",
        variant: "destructive",
      });
    } finally {
      setPlacing(false);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  };

  const calculateTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="space-y-6 animate-pulse py-8">
          <div className="h-8 w-48 bg-[#E8E5DF] rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-[#F8F7F4] rounded-2xl border border-[#E8E5DF]" />
              ))}
            </div>
            <div className="lg:col-span-4 h-64 bg-[#F8F7F4] rounded-2xl border border-[#E8E5DF]" />
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!cart || items.length === 0) {
    return (
      <CustomerLayout>
        <div className="rounded-3xl border border-[#E8E5DF] bg-[#F8F7F4] p-16 text-center space-y-4 max-w-md mx-auto my-12">
          <ShoppingBag className="h-14 w-14 text-[#B8865B] mx-auto opacity-70" />
          <h2 className="text-2xl font-serif-editorial font-bold text-[#1A1A1A]">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-[#6B6B6B]">Explore our curated lifestyle, home decor, and electronics catalog to add items.</p>
          <button
            onClick={() => navigate("/home")}
            className="px-8 py-3.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#B8865B] transition-colors shadow-md"
          >
            Explore Marketplace Catalog
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-10 pb-16">
        
        {/* Cart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">MY SELECTION</span>
            <h1 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A] mt-1">
              Shopping Cart ({calculateTotalItems()} Items)
            </h1>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="px-5 py-2.5 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF] transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Cart Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.cart_item_id || item.product_id}
                className="bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between transition-all hover:border-[#B8865B]/40"
              >
                <div className="flex items-center gap-5 flex-1">
                  <div className="h-24 w-24 bg-[#F8F7F4] rounded-xl border border-[#E8E5DF] shrink-0 overflow-hidden flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingCart className="h-8 w-8 text-[#71717A] opacity-30" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#B8865B] uppercase tracking-wider block">
                      SKU: MB-00{item.product_id}
                    </span>
                    <h3 className="text-base font-bold text-[#1A1A1A]">{item.product_name}</h3>
                    <p className="text-xs text-[#6B6B6B]">
                      Unit Price: <strong className="text-[#1A1A1A]">${parseFloat(item.price).toFixed(2)} USD</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-[#E8E5DF]">
                  
                  {/* Quantity controls */}
                  <div className="flex items-center bg-[#F8F7F4] border border-[#E8E5DF] rounded-xl p-1">
                    <button
                      onClick={() => handleUpdateQuantity(item.cart_item_id || item.product_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-1.5 text-[#1A1A1A] hover:bg-white rounded-lg disabled:opacity-30 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-4 text-xs font-bold text-[#1A1A1A]">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.cart_item_id || item.product_id, item.quantity + 1)}
                      className="p-1.5 text-[#1A1A1A] hover:bg-white rounded-lg transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="text-base font-bold font-display text-[#1A1A1A]">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => handleRemoveItem(item.cart_item_id || item.product_id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Column (4 cols) */}
          <div className="lg:col-span-4 bg-[#F8F7F4] rounded-3xl border border-[#E8E5DF] p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-serif-editorial font-bold text-[#1A1A1A] pb-4 border-b border-[#E8E5DF]">
              Order Summary
            </h3>

            <div className="space-y-3.5 text-xs text-[#52525B]">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="text-[#1A1A1A] font-bold text-sm">${calculateTotal()} USD</span>
              </div>
              <div className="flex justify-between">
                <span>White-Glove Express Shipping:</span>
                <span className="text-[#16A34A] font-bold">Complimentary</span>
              </div>
              <div className="flex justify-between">
                <span>Insured Quality Handling:</span>
                <span className="text-[#16A34A] font-bold">$0.00 USD</span>
              </div>

              <div className="pt-4 border-t border-[#E8E5DF] flex justify-between text-base">
                <span className="text-[#1A1A1A] font-bold">Total Due:</span>
                <span className="text-[#1A1A1A] font-bold font-display text-xl">${calculateTotal()} USD</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full py-4 bg-[#1A1A1A] text-white font-semibold text-xs rounded-xl uppercase tracking-wider hover:bg-[#B8865B] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>Proceed to Checkout</span>
            </button>

            <div className="p-4 bg-white rounded-2xl border border-[#E8E5DF] text-xs text-[#6B6B6B] flex items-center gap-3">
              <Lock className="h-5 w-5 text-[#B8865B] shrink-0" />
              <span>Encrypted checkout & white-glove seller dispatch guarantee.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout / Payment Method Modal */}
      <Dialog open={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <div className="bg-white border border-[#E8E5DF] rounded-2xl text-[#1A1A1A] p-8 max-w-lg w-full shadow-2xl">
          <DialogHeader className="pb-4 border-b border-[#E8E5DF] flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold font-serif-editorial text-[#1A1A1A]">
                Select Payment Option
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6B6B6B] mt-1">
                Choose your preferred payment method to complete your Market Bros order.
              </DialogDescription>
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-[#F8F7F4] rounded-xl">
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="space-y-4 my-6 text-xs">
            <div className="space-y-3">
              {[
                { id: "cash", label: "Cash on Delivery", desc: "Pay upon white-glove delivery arrival" },
                { id: "card", label: "Credit / Debit Card", desc: "Instant encrypted card payment" },
                { id: "digital", label: "Digital Wallet / Bank Transfer", desc: "Direct secure merchant transfer" },
              ].map((pm) => (
                <label
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === pm.id
                      ? "border-[#B8865B] bg-[#F4EFEA]"
                      : "border-[#E8E5DF] bg-[#F8F7F4] hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === pm.id}
                    onChange={() => setPaymentMethod(pm.id)}
                    className="mt-0.5 accent-[#B8865B]"
                  />
                  <div>
                    <div className="font-bold text-[#1A1A1A]">{pm.label}</div>
                    <div className="text-[11px] text-[#6B6B6B]">{pm.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#E8E5DF] flex justify-between font-bold text-sm">
              <span>Total Payment:</span>
              <span className="text-[#B8865B] font-display text-base">${calculateTotal()} USD</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#E8E5DF]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={placing}
                className="flex-1 py-3 bg-[#1A1A1A] text-white font-semibold text-xs rounded-xl hover:bg-[#B8865B] transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                {placing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <span>Confirm & Place Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </CustomerLayout>
  );
}
