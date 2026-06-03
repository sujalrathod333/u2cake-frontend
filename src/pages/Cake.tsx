import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppSelector } from "../hook/redux";
import api from "../api/axios";

type Category = {
  _id?: string;
  name: string;
};

type CakeImage = {
  url: string;
  public_id?: string;
};

type Cake = {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images?: CakeImage[];
  category?: Category | null;
  flavor?: string;
  weight?: string;
  eggless?: boolean;
  stock?: number;
  averageRating?: number;
  numReviews?: number;
};

type CakeResponse = {
  cakes: Cake[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CategoryResponse = {
  categories: Category[];
};

type StoredCartItem = {
  cakeId: string;
  qty: number;
};

const whatsappNumber = "9326568842";

const getStoredCartItems = (): StoredCartItem[] => {
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

const setStoredCartItems = (items: StoredCartItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("cartItems", JSON.stringify(items));
};

const addCakeToCart = (cake: Cake, qty = 1) => {
  if (!cake?._id) return;
  const stored = getStoredCartItems();
  const existing = stored.find((item) => item.cakeId === cake._id);
  const newQty = existing ? existing.qty + qty : qty;
  const clampedQty = Math.min(newQty, cake.stock ?? newQty);

  const updated = existing
    ? stored.map((item) =>
        item.cakeId === cake._id ? { ...item, qty: clampedQty } : item,
      )
    : [...stored, { cakeId: cake._id, qty: clampedQty }];

  setStoredCartItems(updated);
};

const CakePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showEggless, setShowEggless] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCakes = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.set("page", String(page));
      query.set("limit", String(limit));
      query.set("search", debouncedSearch.trim());
      query.set("sort", sortBy);
      if (selectedCategory) query.set("category", selectedCategory);
      if (showEggless) query.set("eggless", "true");
      if (minPrice) query.set("minPrice", minPrice);
      if (maxPrice) query.set("maxPrice", maxPrice);

      // debug: log constructed query and URL to help diagnose filter issues
      // eslint-disable-next-line no-console
      console.debug("[CakePage] fetchCakes url:/api/cake?", query.toString());

      const res = await api.get<CakeResponse>(`/cake?${query.toString()}`);
      // eslint-disable-next-line no-console
      console.debug("[CakePage] fetchCakes response:", res?.data);
      setCakes(res.data?.cakes ?? []);
      setTotalPages(res.data?.totalPages ?? 1);
    } catch (err) {
      console.log("[Cake] fetchCakes error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get<CategoryResponse>("/category");
      setCategories(res.data?.categories ?? []);
    } catch (err) {
      console.log("[Cake] fetchCategories error:", err);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCakes();
  }, [page, limit, debouncedSearch, selectedCategory, sortBy, showEggless, minPrice, maxPrice]);

  useEffect(() => {
    setSelectedQty(1);
  }, [selectedCake]);

  const openOrderModal = (cake: Cake) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setSelectedCake(cake);
    setSelectedQty(1);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCake(null);
  };

  const orderPrice = selectedCake ? selectedCake.discountPrice ?? selectedCake.price : 0;
  const orderTotal = selectedQty * orderPrice;
  const whatsappMessage = selectedCake
    ? encodeURIComponent(
        `Hello Cake Palace, I want to order ${selectedCake.name} x ${selectedQty} for ₹${orderPrice} each. Total ₹${orderTotal}. Please contact me for delivery details.`,
      )
    : "";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="bg-red-600 text-white min-h-screen">

      {/* HERO SECTION */}
      <section className="px-4 md:px-16 py-10 border-b border-white/20">
        <h1 className="text-4xl md:text-5xl font-extrabold">
          Explore Cakes 🍰
        </h1>

        <p className="text-sm opacity-90 mt-2">
          Fresh handmade cakes delivered in minutes from Cake Palace
        </p>

        {/* SEARCH BAR */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <input
            type="text"
            placeholder="Search cakes (chocolate, red velvet...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-white/40 bg-white px-4 py-3 text-red-600 font-medium outline-none transition focus:border-red-300"
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-white/40 bg-white px-4 py-3 text-red-600 outline-none"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-white/40 bg-white px-4 py-3 text-red-600 outline-none"
            >
              <option value="newest">Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/10 px-4 py-3">
            <input
              type="checkbox"
              checked={showEggless}
              onChange={(e) => {
                setShowEggless(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-white/50 text-red-600"
            />
            <span className="text-sm text-white">Eggless only</span>
          </label>

          <input
            type="number"
            min={0}
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
            className="rounded-2xl border border-white/40 bg-white px-4 py-3 text-red-600 outline-none"
          />

          <input
            type="number"
            min={0}
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
            className="rounded-2xl border border-white/40 bg-white px-4 py-3 text-red-600 outline-none"
          />

          <button
            type="button"
            onClick={() => {
              setSelectedCategory("");
              setSortBy("newest");
              setShowEggless(false);
              setMinPrice("");
              setMaxPrice("");
              setSearchTerm("");
              setPage(1);
            }}
            className="rounded-2xl border border-white/40 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Reset filters
          </button>
        </div>
      </section>

      {/* GRID */}
      <section className="px-4 md:px-16 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {cakes.map((cake) => (
            <div
              key={cake._id}
              className="bg-red-700 border border-white/30 rounded-3xl overflow-hidden hover:bg-red-800 transition duration-300 shadow-xl"
            >

              {/* IMAGE */}
              <div className="relative">
                  <img
                    src={cake.images?.[0]?.url || "/placeholder.png"}
                    className="h-56 w-full object-cover hover:scale-105 transition duration-300"
                    alt={cake.name}
                  />

                {/* TAG */}
                <div className="absolute top-3 left-3 bg-white text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                  {cake.category?.name || "Cake"}
                </div>

                {/* PRICE */}
                <div className="absolute top-3 right-3 bg-white text-red-600 px-3 py-1 rounded-full font-bold">
                  ₹{cake.discountPrice ?? cake.price}
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-5 space-y-3">

                <h2 className="text-2xl font-bold">
                  {cake.name}
                </h2>

                <p className="text-sm opacity-90">
                  Freshly baked premium cake for birthdays & celebrations 🎉
                </p>

                {/* CTA */}
                <div className="flex gap-3">
                  <Link
                    to={`/cakes/${cake._id}`}
                    className="flex-1 text-center bg-white text-red-600 font-bold py-2 rounded-xl hover:scale-105 transition"
                  >
                    View
                  </Link>

                  <button
                    type="button"
                    onClick={() => openOrderModal(cake)}
                    className="flex-1 border border-white py-2 rounded-xl hover:bg-white hover:text-red-600 transition"
                  >
                    Order
                  </button>
                </div>

              </div>
            </div>
          ))}

        </div>
      </section>

      <section className="px-4 md:px-16 pb-10">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/20 bg-white/5 p-5 text-white sm:flex-row sm:justify-between">
          <span className="text-sm text-white/80">
            Page {page} of {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1 || loading}
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages || loading}
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none"
            >
              {[6, 9, 12, 18].map((size) => (
                <option key={size} value={size} className="bg-red-600 text-white">
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {modalOpen && selectedCake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl bg-white text-red-600 shadow-2xl border border-red-200 overflow-hidden">
            <div className="flex items-start justify-between gap-4 bg-red-600 px-6 py-5 text-white">
              <div>
                <h2 className="text-3xl font-bold">Order {selectedCake.name}</h2>
                <p className="text-sm opacity-90 mt-1">
                  Send your order directly through WhatsApp or add this cake to your cart.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-[1fr_1.2fr]">
                <img
                  src={selectedCake.images?.[0]?.url || "/placeholder.png"}
                  alt={selectedCake.name}
                  className="h-64 w-full rounded-3xl object-cover"
                />
                <div className="space-y-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-red-600/80">
                      {selectedCake.category?.name || "Cake"}
                    </p>
                    <h3 className="mt-2 text-3xl font-bold">{selectedCake.name}</h3>
                  </div>
                  <div className="rounded-3xl border border-red-200 p-4 bg-red-50">
                    <p className="text-sm text-red-600/80">Price</p>
                    <p className="mt-1 text-3xl font-bold">
                      ₹{orderPrice}
                    </p>
                    <p className="text-sm text-red-500/90 mt-2">
                      {selectedCake.stock ?? 0} available
                    </p>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
                      <span>Quantity</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                          className="rounded-full bg-red-600 px-3 py-1 text-white"
                        >
                          -
                        </button>
                        <span className="min-w-[2rem] text-center font-bold">{selectedQty}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedQty((q) => Math.min(selectedCake.stock ?? q + 1, q + 1))}
                          className="rounded-full bg-red-600 px-3 py-1 text-white"
                        >
                          +
                        </button>
                      </div>
                    </label>
                    <p className="text-sm text-red-700/90">
                      Total: ₹{orderTotal}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    addCakeToCart(selectedCake, selectedQty);
                    navigate("/cart");
                  }}
                  className="rounded-3xl bg-red-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Add to Cart
                </button>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-3xl border border-red-600 px-6 py-4 text-center text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  Send WhatsApp Message
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CakePage;

