import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { ShoppingCart, Trash2, Minus, Plus, CreditCard, ArrowRight, Loader2, ShieldCheck, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
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
    if (user) fetchCart();
  }, [user]);

  const handleRemoveItem = async (item_id) => {
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
    setShowPaymentModal(true);
  };

  const handleConfirmOrder = async () => {
    setPlacing(true);
    try {
      // 1 — create order
      const orderRes = await api.post("/orders", {
        user_id: user.user_id,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });

      const totalAmount = parseFloat(items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2));

      // 2 — create payment
      await api.post("/payments/create", {
        order_id: orderRes.data.order_id,
        amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: "pending",
      });

      // 3 — delete item from cart
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
        <div className="space-y-6">
          <Skeleton className="h-8 w-40 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!cart || items.length === 0) {
    return (
      <CustomerLayout>
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-2xs max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Button onClick={() => navigate("/home")} variant="primary" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span>Start Shopping</span>
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">Review your selected products before proceeding to checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.cart_item_id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-slate-900 text-base">{item.product_name}</h3>
                  <p className="text-sm font-extrabold text-blue-600">${parseFloat(item.price).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8 rounded-none hover:bg-slate-200"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-10 text-center font-bold text-xs text-slate-900">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                      className="h-8 w-8 rounded-none hover:bg-slate-200"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <span className="font-bold text-slate-900 text-sm min-w-[70px] text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.cart_item_id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary Card */}
          <Card className="sticky top-24 p-6 space-y-6">
            <CardHeader className="p-0 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>

            <CardContent className="p-0 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Items ({items.length})</span>
                <span className="font-medium text-slate-900">{calculateTotalItems()} units</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-medium text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Fees</span>
                <span className="font-medium text-slate-900">$0.00</span>
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-base">Total Due</span>
                <span className="text-2xl font-extrabold text-blue-600">${calculateTotal()}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full gap-2 mt-4 shadow-md shadow-blue-500/20"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>100% Encrypted Checkout</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Selection Modal */}
      <Dialog open={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <DialogHeader>
          <DialogTitle>Select Payment Method</DialogTitle>
          <DialogDescription>Choose your preferred payment option to complete your order.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="space-y-2">
            {[
              { id: "cash", label: "Cash on Delivery", desc: "Pay when item is delivered" },
              { id: "credit_card", label: "Credit Card", desc: "Visa, Mastercard, AMEX" },
              { id: "debit_card", label: "Debit Card", desc: "Direct bank card payment" },
              { id: "bank_transfer", label: "Bank Transfer", desc: "Wire transfer settlement" },
            ].map((method) => (
              <label
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === method.id
                    ? "border-blue-500 bg-blue-50/50 shadow-2xs"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={() => setPaymentMethod(method.id)}
                  className="accent-blue-600"
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">{method.label}</p>
                  <p className="text-xs text-slate-500">{method.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700">Total Order Amount:</span>
            <span className="text-xl font-extrabold text-blue-600">${calculateTotal()}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmOrder}
              disabled={placing}
              className="flex-1 gap-2"
            >
              {placing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <span>Confirm Order</span>
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </CustomerLayout>
  );
}
