import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/CustomerLayout";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

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
      setItems(cartRes.data.items);
    } catch (err) {
      console.error("fetchCart error:", err.response?.data);
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
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateQuantity = async (item_id, quantity) => {
    if (quantity < 1) return;
    try {
      await api.patch(`/cart/${cart.cart_id}/items/${item_id}`, { quantity });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };
  const handlePlaceOrder = async () => {
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
      // 2 — create payment
      await api.post("/payments/create", {
        order_id: orderRes.data.order_id,
        amount: parseFloat(items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)),
        payment_method: paymentMethod,
        payment_status: "pending",
      });

      // 3 — delete item from cart
      for (const item of items) {
            await api.delete(`/cart/${cart.cart_id}/items/${item.cart_item_id}`)
        }

      setShowPaymentModal(false);
      navigate("/orders");
    } catch (err) {
      console.error(err);
    } finally {
      setPlacing(false);
    }
  };

  if (loading)
    return (
      <CustomerLayout>
        <p className="text-gray-500">Loading...</p>
      </CustomerLayout>
    );

  if (!cart || items.length === 0)
    return (
      <CustomerLayout>
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/home")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </CustomerLayout>
    );

  return (
    <CustomerLayout>
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div
              key={item.cart_item_id}
              className="bg-white rounded-lg shadow p-4 flex gap-4 items-center"
            >
              <div className="flex-1">
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-blue-600">${item.price}</p>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>

              <div className="flex items-center border rounded">
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.cart_item_id, item.quantity - 1)
                  }
                  className="px-3 py-1 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-1 border-x">{item.quantity}</span>
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.cart_item_id, item.quantity + 1)
                  }
                  className="px-3 py-1 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => handleRemoveItem(item.cart_item_id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="w-72">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="flex justify-between text-sm mb-2">
              <span>Items ({items.length})</span>
              <span>
                {items.reduce((sum, item) => sum + item.quantity, 0)} units
              </span>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>
                  $
                  {items
                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 mt-6 disabled:opacity-50"
            >
              {placing ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Select Payment Method</h2>

            <div className="space-y-3 mb-6">
              {["cash", "credit_card", "debit_card", "bank_transfer"].map(
                (method) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm capitalize">
                      {method.replace("_", " ")}
                    </span>
                  </label>
                ),
              )}
            </div>

            <div className="flex justify-between font-bold mb-6">
              <span>Total</span>
              <span>
                $
                {items
                  .reduce((sum, item) => sum + item.price * item.quantity, 0)
                  .toFixed(2)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 border py-2 rounded text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={placing}
                className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {placing ? "Placing..." : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
