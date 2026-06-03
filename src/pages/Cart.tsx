import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../hook/redux";
import api from "../api/axios";

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

const saveStoredCart = (items: StoredCartItem[]) => {
  if (typeof window === "undefined") return;

  localStorage.setItem("cartItems", JSON.stringify(items));
};

const Cart = () => {
  const navigate = useNavigate();

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [storedItems, setStoredItems] =
    useState<StoredCartItem[]>(loadStoredCart);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    saveStoredCart(storedItems);

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
            (
              result
            ): result is PromiseFulfilledResult<CartItem> =>
              result.status === "fulfilled"
          )
          .map((result) => result.value);

        setCartItems(validItems);

        if (validItems.length !== storedItems.length) {
          setStoredItems(
            validItems.map((item) => ({
              cakeId: item.cakeId,
              qty: item.qty,
            }))
          );
        }
      } catch (error) {
        console.error("[Cart] fetch cart details error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [storedItems]);

  const total = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );
  }, [cartItems]);

  const increaseQty = (cakeId: string) => {
    const maxStock =
      cartItems.find((item) => item.cakeId === cakeId)?.stock ??
      Infinity;

    setStoredItems((prev) =>
      prev.map((item) =>
        item.cakeId === cakeId
          ? {
              ...item,
              qty: Math.min(item.qty + 1, maxStock),
            }
          : item
      )
    );
  };

  const decreaseQty = (cakeId: string) => {
    setStoredItems((prev) =>
      prev.map((item) =>
        item.cakeId === cakeId && item.qty > 1
          ? {
              ...item,
              qty: item.qty - 1,
            }
          : item
      )
    );
  };

  const removeItem = (cakeId: string) => {
    setStoredItems((prev) =>
      prev.filter((item) => item.cakeId !== cakeId)
    );
  };

  const proceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-red-600 text-white px-4 md:px-16 py-10">
      {/* HEADER */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
        Your Cart 🛒
      </h1>

      <p className="text-sm opacity-90 mb-8">
        Review your selected cakes before checkout
      </p>

      {/* LOADING */}
      {loading ? (
        <div className="text-center mt-20">
          <p className="text-xl font-bold">
            Loading cart...
          </p>
        </div>
      ) : cartItems.length === 0 ? (
        /* EMPTY STATE */
        <div className="text-center mt-20">
          <p className="text-xl font-bold">
            Cart is empty 🍰
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* CART ITEMS */}
          <div className="md:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.cakeId}
                className="bg-red-700 border border-white/30 rounded-2xl p-4 flex gap-4 items-center"
              >
                {/* IMAGE */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl"
                />

                {/* DETAILS */}
                <div className="flex-1">
                  <h2 className="font-bold text-lg">
                    {item.name}
                  </h2>

                  <p className="text-sm opacity-90">
                    ₹{item.price} per item
                  </p>

                  {/* QTY CONTROLS */}
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() =>
                        decreaseQty(item.cakeId)
                      }
                      className="bg-white text-red-600 px-2 rounded"
                    >
                      -
                    </button>

                    <span>{item.qty}</span>

                    <button
                      onClick={() =>
                        increaseQty(item.cakeId)
                      }
                      disabled={item.qty >= item.stock}
                      className="bg-white text-red-600 px-2 rounded disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* TOTAL + REMOVE */}
                <div className="text-right space-y-2">
                  <p className="font-bold">
                    ₹{item.price * item.qty}
                  </p>

                  <button
                    onClick={() =>
                      removeItem(item.cakeId)
                    }
                    className="text-xs border border-white px-3 py-1 rounded-full hover:bg-white hover:text-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="bg-red-700 border border-white/30 rounded-2xl p-6 space-y-4 h-fit">
            <h2 className="text-xl font-bold">
              Summary
            </h2>

            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Delivery</span>
              <span>Free 🚚</span>
            </div>

            <div className="border-t border-white/30 pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <button
              type="button"
              onClick={proceedToCheckout}
              className="w-full bg-white text-red-600 font-bold py-3 rounded-xl hover:scale-105 transition"
            >
              Proceed to Checkout
            </button>

            <p className="text-xs text-center opacity-80">
              Secure checkout process 🔒
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;