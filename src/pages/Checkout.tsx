import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../hook/redux";
import api from "../api/axios";
import { createOrder } from "../api/order";
import { initiatePayment, processPayment } from "../api/payment";
import { clearCart } from "../store/cartSlice";
import { addOrder } from "../store/orderSlice";

type CakeImage = {
  url: string;
};

type CakeDetailType = {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images?: CakeImage[];
  stock?: number;
};

interface StoredCartItem {
  cakeId: string;
  qty: number;
}

interface CartItem {
  cakeId: string;
  qty: number;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface OrderFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: "COD" | "CARD" | "UPI";
}

const loadStoredCart = (): StoredCartItem[] => {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem("cartItems");
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item: any) => {
        if (item?.cakeId) {
          return {
            cakeId: String(item.cakeId),
            qty: Number(item.qty ?? 1),
          };
        }
        if (item?.id) {
          return {
            cakeId: String(item.id),
            qty: Number(item.qty ?? 1),
          };
        }
        return null;
      })
      .filter((item): item is StoredCartItem => Boolean(item));
  } catch {
    return [];
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [storedItems] = useState<StoredCartItem[]>(loadStoredCart);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<OrderFormData>({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: user?.address?.street || "",
    city: user?.address?.city || "",
    postalCode: user?.address?.pincode || "",
    country: user?.address?.country || "India",
    paymentMethod: "COD",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        if (!storedItems.length) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        setLoading(true);

        const results = await Promise.allSettled(
          storedItems.map(async (item) => {
            const res = await api.get<{ cake: CakeDetailType }>(
              `/cake/${item.cakeId}`
            );

            const cake = res.data.cake;

            return {
              cakeId: item.cakeId,
              qty: Math.min(item.qty, cake.stock ?? item.qty),
              name: cake.name,
              price: cake.discountPrice ?? cake.price,
              image: cake.images?.[0]?.url || "/placeholder.png",
              stock: cake.stock ?? 0,
            } as CartItem;
          })
        );

        const validItems = results
          .filter(
            (result): result is PromiseFulfilledResult<CartItem> =>
              result.status === "fulfilled"
          )
          .map((result) => result.value);

        setCartItems(validItems);
      } catch (err) {
        console.error("[Checkout] fetch cart details error:", err);
        setError("Failed to load cart items");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated, navigate, storedItems]);

  const total = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  }, [cartItems]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (!formData.address.trim()) {
      setError("Address is required");
      return;
    }
    if (!formData.city.trim()) {
      setError("City is required");
      return;
    }
    if (!formData.postalCode.trim()) {
      setError("Postal code is required");
      return;
    }
    if (cartItems.length === 0) {
      setError("Cart is empty");
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Create Order
      const orderPayload = {
        items: cartItems.map((item) => ({
          cake: item.cakeId,
          quantity: item.qty,
          price: item.price,
        })),
        totalPrice: total,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
      };

      const orderResponse = await createOrder(orderPayload);

      if (!orderResponse.success) {
        throw new Error("Failed to create order");
      }

      // Extraction of ID with broad compatibility and logging
      const orderId =
        orderResponse?.orderId ??
        orderResponse?.order?._id ??
        (orderResponse as any)?._id;


      if (!orderId) {
        console.error("[Checkout] orderId missing from response body. Full response:", orderResponse);
        throw new Error(
          "Critical Error: Order ID was not returned by the server. Please check your network or contact support."
        );
      }



      // Step 2: Initiate Payment
      const paymentInitResponse = await initiatePayment({
        orderId,
        paymentMethod: formData.paymentMethod,
        amount: total,
      });

      if (!paymentInitResponse.success) {
        throw new Error("Failed to initiate payment");
      }

      const paymentId = paymentInitResponse.payment._id;

      // Step 3: Process Payment (for COD, directly process)
      const paymentProcessResponse = await processPayment({
        orderId,
        paymentId,
        transactionId: `TXN-${Date.now()}`,
        paymentMethod: formData.paymentMethod,
      });

      if (!paymentProcessResponse.success) {
        throw new Error(paymentProcessResponse.message || "Failed to process payment");
      }


      // Success! Clear cart and navigate
      dispatch(clearCart());
      localStorage.removeItem("cartItems");
      dispatch(addOrder((orderResponse as any).order));
      navigate(`/order/${orderId}`, { replace: true });

    } catch (err: any) {
      console.error("[Checkout] error:", err);
      // Determine error message more accurately
      let errorMessage = "Failed to complete order. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }

  };

  if (loading) {
    return (
      <div className="min-h-screen bg-red-600 text-white px-4 md:px-16 py-10 flex items-center justify-center">
        <p className="text-xl font-bold">Loading checkout...</p>
      </div>
    );
  }

  if (!loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-red-600 text-white px-4 md:px-16 py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
          Checkout 🧾
        </h1>
        <div className="mt-10 text-center">
          <p className="text-xl font-bold mb-6">Your cart is empty!</p>
          <button
            onClick={() => navigate("/cake")}
            className="bg-white text-red-600 font-bold py-3 px-8 rounded-xl hover:scale-105 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-600 text-white px-4 md:px-16 py-10">

      {/* HEADER */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
        Checkout 🧾
      </h1>

      <p className="text-sm opacity-90 mb-8">
        Confirm your order details before placing order
      </p>

      {error && (
        <div className="mb-6 bg-red-700 border border-red-400 text-white px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-3 gap-8">

          {/* LEFT - ITEMS */}
          <div className="md:col-span-2 space-y-4">

            {cartItems.map((item) => (
              <div
                key={item.cakeId}
                className="bg-red-700 border border-white/30 rounded-2xl p-4 flex justify-between"
              >
                <div>
                  <h2 className="font-bold text-lg">{item.name}</h2>
                  <p className="text-sm opacity-90">
                    ₹{item.price} x {item.qty}
                  </p>
                </div>

                <p className="font-bold">
                  ₹{item.price * item.qty}
                </p>
              </div>
            ))}

            {/* DELIVERY DETAILS */}
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-bold">
                Delivery Details 🚚
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white text-red-600 placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white text-red-600 placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white text-red-600 placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />

                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white text-red-600 placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />

                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white text-red-600 placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-400 md:col-span-2"
                  required
                />

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white text-red-600 placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />

                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white text-red-600 placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* RIGHT - SUMMARY + FORM */}
          <div className="bg-red-700 border border-white/30 rounded-2xl p-6 space-y-5 h-fit">

            {/* SUMMARY */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Delivery</span>
                <span>Free 🚚</span>
              </div>

              <div className="border-t border-white/30 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* PAYMENT OPTIONS */}
            <div className="space-y-3">
              <label className="font-bold">Payment Method</label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === "COD"}
                  onChange={handleInputChange}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm">Cash on Delivery 💵</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer opacity-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  disabled
                  className="w-4 h-4 cursor-not-allowed"
                />
                <span className="text-sm">Card Payment 💳 (Coming Soon)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer opacity-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  disabled
                  className="w-4 h-4 cursor-not-allowed"
                />
                <span className="text-sm">UPI Payment (Coming Soon)</span>
              </label>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={submitting || cartItems.length === 0}
              className="w-full bg-white text-red-600 font-bold py-3 rounded-xl hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating Order..." : "Place Order 🎂"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="block w-full text-center text-sm opacity-80 hover:opacity-100 py-2"
            >
              ← Back to Cart
            </button>

          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;