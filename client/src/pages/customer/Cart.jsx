import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { ShoppingCart, Trash2, Minus, Plus, CreditCard, ArrowRight, Loader2, ShieldCheck, ShoppingBag, X } from "lucide-react";
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
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-[#16151a]" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-[#16151a] border border-[#282630]" />
              ))}
            </div>
            <div className="h-64 bg-[#16151a] border border-[#282630]" />
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!cart || items.length === 0) {
    return (
      <CustomerLayout>
        <div className="border border-[#282630] bg-[#16151a] p-16 text-center space-y-4 max-w-md mx-auto my-12">
          <ShoppingCart className="h-12 w-12 text-[#6c697b] mx-auto" />
          <h2 className="text-xl font-mono-tech uppercase font-bold text-white">YOUR BAG IS EMPTY</h2>
          <p className="text-xs font-mono-tech text-[#6c697b]">No furniture pieces or build slots added to your bag yet.</p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3 bg-white text-black font-mono-tech font-bold text-xs uppercase hover:bg-[#d4a373] transition-colors"
          >
            EXPLORE MARKETPLACE
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-8 pb-16">
        {/* DeLorean Cart Header */}
        <div className="border border-[#282630] bg-[#16151a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373]">MY ALLOCATION BAG</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mt-1">
              SHOPPING BAG ({calculateTotalItems()} PIECES)
            </h1>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 border border-[#282630] bg-[#0f0e13] text-xs font-mono-tech uppercase text-white hover:border-[#d4a373]"
          >
            CONTINUE SHOPPING
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.cart_item_id || item.product_id}
                className="border border-[#282630] bg-[#16151a] p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-20 w-20 bg-[#0f0e13] border border-[#282630] shrink-0 overflow-hidden flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingCart className="h-6 w-6 text-[#6c697b]" />
                    )}
                  </div>

                  <div className="space-y-1 font-mono-tech">
                    <span className="text-[10px] text-[#d4a373] uppercase tracking-widest block">
                      SLOT #FW-00{item.product_id}
                    </span>
                    <h3 className="text-sm font-bold uppercase text-white">{item.product_name}</h3>
                    <p className="text-xs text-[#a19fad]">
                      PRICE PER PIECE: <strong className="text-white">${parseFloat(item.price).toFixed(2)} USD</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#282630]">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-[#282630] bg-[#0f0e13]">
                    <button
                      onClick={() => handleUpdateQuantity(item.cart_item_id || item.product_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-2 text-white hover:text-[#d4a373] disabled:opacity-30"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-4 text-xs font-mono-tech font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.cart_item_id || item.product_id, item.quantity + 1)}
                      className="p-2 text-white hover:text-[#d4a373]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-mono-tech font-bold text-white">
                    ${(item.price * item.quantity).toFixed(2)} USD
                  </span>

                  <button
                    onClick={() => handleRemoveItem(item.cart_item_id || item.product_id)}
                    className="p-2 text-[#6c697b] hover:text-red-400 border border-transparent hover:border-[#282630]"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Column (4 cols) */}
          <div className="lg:col-span-4 border border-[#282630] bg-[#16151a] p-6 space-y-6 font-mono-tech text-xs">
            <h3 className="text-base font-display font-bold uppercase text-white pb-4 border-b border-[#282630]">
              ORDER SUMMARY
            </h3>

            <div className="space-y-3 text-[#a19fad]">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span className="text-white font-bold">${calculateTotal()} USD</span>
              </div>
              <div className="flex justify-between">
                <span>WHITE-GLOVE DISPATCH:</span>
                <span className="text-emerald-400 font-bold">COMPLIMENTARY</span>
              </div>
              <div className="flex justify-between">
                <span>AUTHENTICATION & PROCESSING:</span>
                <span className="text-emerald-400 font-bold">$0.00 USD</span>
              </div>

              <div className="pt-4 border-t border-[#282630] flex justify-between text-sm">
                <span className="text-white uppercase font-bold">TOTAL AMOUNT:</span>
                <span className="text-white font-bold">${calculateTotal()} USD</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full py-3.5 bg-white text-black font-mono-tech font-bold text-xs uppercase tracking-wider hover:bg-[#d4a373] transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>PROCEED TO CHECKOUT</span>
            </button>

            <div className="p-3 bg-[#0f0e13] border border-[#282630] text-[11px] text-[#6c697b] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>BLOCKCHAIN-SECURED ALLOCATION & GUARANTEED DISPATCH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout / Payment Modal */}
      <Dialog open={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <div className="bg-[#16151a] border border-[#282630] text-white p-6 max-w-lg w-full">
          <DialogHeader className="pb-4 border-b border-[#282630] flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-mono-tech uppercase font-bold text-white">
                SELECT PAYMENT METHOD
              </DialogTitle>
              <DialogDescription className="text-xs font-mono-tech text-[#a19fad]">
                Choose payment option to complete your Furniture Waley allocation.
              </DialogDescription>
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="p-1 text-[#6c697b] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="space-y-4 my-6 font-mono-tech text-xs">
            <div className="space-y-2">
              {[
                { id: "cash", label: "CASH ON DELIVERY / IN-PERSON ALLOCATION", desc: "Pay upon white-glove arrival" },
                { id: "card", label: "CREDIT / DEBIT CARD", desc: "Instant secure transaction" },
                { id: "crypto", label: "USDC ON SUI / CRYPTO", desc: "Direct Web3 digital wallet settlement" },
              ].map((pm) => (
                <label
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`p-4 border flex items-start gap-3 cursor-pointer transition-colors ${
                    paymentMethod === pm.id
                      ? "border-[#d4a373] bg-[#282630]"
                      : "border-[#282630] bg-[#0f0e13] hover:border-[#6c697b]"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === pm.id}
                    onChange={() => setPaymentMethod(pm.id)}
                    className="mt-0.5 accent-[#d4a373]"
                  />
                  <div>
                    <div className="font-bold text-white uppercase">{pm.label}</div>
                    <div className="text-[11px] text-[#6c697b]">{pm.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="p-4 bg-[#0f0e13] border border-[#282630] flex justify-between font-bold text-sm">
              <span>PAYMENT DUE:</span>
              <span className="text-[#d4a373]">${calculateTotal()} USD</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2.5 border border-[#282630] bg-[#0f0e13] text-xs font-mono-tech uppercase text-white"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={placing}
                className="flex-1 py-2.5 bg-white text-black font-mono-tech font-bold text-xs uppercase hover:bg-[#d4a373] transition-colors flex items-center justify-center gap-2"
              >
                {placing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <span>CONFIRM ORDER</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </CustomerLayout>
  );
}
