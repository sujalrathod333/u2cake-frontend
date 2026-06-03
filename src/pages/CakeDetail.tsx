import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../hook/redux";
import api from "../api/axios";

type Category = {
  _id?: string;
  name: string;
};

type CakeDetailType = {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images?: { url: string }[];
  category?: Category | null;
  flavor?: string;
  weight?: string;
  eggless?: boolean;
  stock?: number;
  averageRating?: number;
  numReviews?: number;
  createdAt?: string;
  updatedAt?: string;
  isAvailable?: boolean;
};

type StoredCartItem = {
  cakeId: string;
  qty: number;
};

const whatsappNumber = "9326568842";

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
          return { cakeId: String(item.cakeId), qty: Number(item.qty ?? 1) };
        }
        if (item?.id) {
          return { cakeId: String(item.id), qty: Number(item.qty ?? 1) };
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

const CakeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [cake, setCake] = useState<CakeDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const fetchCake = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.get<{ cake: CakeDetailType }>(`/cake/${id}`);
        setCake(res.data?.cake ?? null);
      } catch (err: any) {
        console.error("[CakeDetail] fetch error:", err);
        setError(err?.response?.data?.message || "Cake details could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    fetchCake();
  }, [id]);

  const addToCart = () => {
    if (!cake) return;

    const items = loadStoredCart();
    const existing = items.find((item) => item.cakeId === cake._id);
    const qty = existing ? Math.min((existing.qty || 0) + 1, cake.stock ?? 1) : 1;
    const updated = existing
      ? items.map((item) => (item.cakeId === cake._id ? { ...item, qty } : item))
      : [...items, { cakeId: cake._id, qty }];

    saveStoredCart(updated);
    setNotice("Added to cart!");
    setTimeout(() => setNotice(""), 2500);
  };

  const orderNow = () => {
    if (!cake) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const price = cake.discountPrice ?? cake.price;
    const message = encodeURIComponent(
      `Hello Cake Palace, I want to order ${cake.name} for ₹${price}. Please contact me for delivery details.`,
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  if (loading) {
    return (
      <div className="bg-red-600 text-white min-h-screen flex items-center justify-center px-4">
        <p className="text-xl font-bold">Loading cake details...</p>
      </div>
    );
  }

  if (error || !cake) {
    return (
      <div className="bg-red-600 text-white min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-xl font-bold">{error || "Cake not found 🍰"}</p>
          <Link
            to="/"
            className="inline-block rounded-full border border-white px-4 py-2 text-sm font-semibold hover:bg-white hover:text-red-600 transition"
          >
            Back to cakes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-600 text-white min-h-screen px-4 md:px-16 py-10">
      <Link
        to="/"
        className="inline-block mb-6 rounded-full border border-white px-4 py-2 text-sm font-semibold hover:bg-white hover:text-red-600 transition"
      >
        ← Back to catalog
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="space-y-6">
          <img
            src={cake.images?.[0]?.url || "/placeholder.png"}
            alt={cake.name}
            className="w-full rounded-[2rem] mb-4 border border-white/20 object-cover shadow-2xl"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6">
              <h2 className="text-sm uppercase tracking-[0.3em] text-white/70">Delivery</h2>
              <p className="mt-3 text-sm text-white/80">2-4 day bakery delivery with fresh packaging.</p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6">
              <h2 className="text-sm uppercase tracking-[0.3em] text-white/70">Availability</h2>
              <p className="mt-3 text-sm text-white/80">{cake.isAvailable ? "In stock" : "Currently unavailable"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-8 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">{cake.category?.name || "Cake"}</p>
                <h1 className="mt-2 text-4xl mb-4 font-extrabold">{cake.name}</h1>
              </div>
              <div className="rounded-full bg-white px-5 py-3 text-red-600 font-bold shadow-sm">
                ₹{cake.discountPrice ?? cake.price}
                {cake.discountPrice ? (
                  <span className="ml-2 text-sm font-medium text-white/80 line-through">₹{cake.price}</span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-white/80">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">{cake.flavor || "Classic"}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">{cake.weight || "Standard"}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">{cake.eggless ? "Eggless" : "With eggs"}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">{cake.stock ?? 0} pcs</span>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-white/70">Rating</p>
                <p className="text-2xl font-bold">{cake.averageRating?.toFixed(1) ?? "0.0"} ★</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Reviews</p>
                <p className="text-2xl font-bold">{cake.numReviews ?? 0}</p>
              </div>
            </div>

            <p className="text-sm leading-7 text-white/80">{cake.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6">
              <h2 className="text-sm uppercase tracking-[0.3em] text-white/70">Cake details</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                <li>Flavor: <span className="font-semibold text-white">{cake.flavor || "Classic"}</span></li>
                <li>Weight: <span className="font-semibold text-white">{cake.weight || "Standard"}</span></li>
                <li>Eggless: <span className="font-semibold text-white">{cake.eggless ? "Yes" : "No"}</span></li>
                <li>Stock: <span className="font-semibold text-white">{cake.stock ?? 0}</span></li>
                <li>Category: <span className="font-semibold text-white">{cake.category?.name || "Uncategorized"}</span></li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/10 p-6">
              <h2 className="text-sm uppercase tracking-[0.3em] text-white/70">Order info</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                <li>{cake.isAvailable ? "Available for immediate delivery" : "Currently unavailable"}</li>
                <li>Created: <span className="font-semibold text-white">{cake.createdAt ? new Date(cake.createdAt).toLocaleDateString() : "N/A"}</span></li>
                <li>Updated: <span className="font-semibold text-white">{cake.updatedAt ? new Date(cake.updatedAt).toLocaleDateString() : "N/A"}</span></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={addToCart}
              className="rounded-full bg-white px-6 py-3 text-red-600 font-bold transition hover:bg-red-50"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={orderNow}
              className="rounded-full border border-white px-6 py-3 text-white transition hover:bg-white hover:text-red-600"
            >
              Order Now
            </button>
          </div>

          {notice ? (
            <div className="rounded-3xl border border-white/20 bg-white/10 p-4 text-sm text-white/90">
              {notice}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CakeDetail;
