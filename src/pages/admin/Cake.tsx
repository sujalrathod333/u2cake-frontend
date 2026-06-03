import type { FC } from "react";
import { useEffect, useState } from "react";
import AddCakeModal from "../../components/AddCakeModel";
import EditCakeModal from "../../components/EditCakeModel";
import api from "../../api/axios";

type Category = {
  _id: string;
  name: string;
};

type Cake = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  category: Category | null;
  images: {
    url: string;
    public_id: string;
    _id?: string;
  }[];
};

type CakeInput = {
  name: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  flavor?: string;
  weight?: string;
  eggless: boolean;
  image: File | null;
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

const Cakes: FC = () => {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null);

  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCakes = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.set("page", String(page));
      query.set("limit", String(limit));
      query.set("search", debouncedSearch.trim());

      const res = await api.get<CakeResponse>(`/cake?${query.toString()}`);
      setCakes(res.data?.cakes ?? []);
      setTotalPages(res.data?.totalPages ?? 1);
    } catch (error: any) {
      console.log("[Admin/Cake] Cake fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get<CategoryResponse>("/category");
      setCategories(res.data?.categories ?? []);
    } catch (error) {
      console.log("Category fetch error:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    fetchCakes();
  }, [page, limit, debouncedSearch]);

  const handleAddCake = async (cake: CakeInput) => {
    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("name", cake.name);
      formData.append("description", cake.description);
      formData.append("category", cake.category);
      formData.append("price", String(cake.price));
      formData.append("stock", String(cake.stock));

      if (cake.discountPrice) {
        formData.append("discountPrice", String(cake.discountPrice));
      }
      if (cake.flavor) formData.append("flavor", cake.flavor);
      if (cake.weight) formData.append("weight", cake.weight);

      formData.append("eggless", String(cake.eggless));

      if (cake.image) {
        // backend multer expects field name "images" (upload.array("images", 5))
        formData.append("images", cake.image);
      }

      const res = await api.post("/cake", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newCake = res.data?.cake || res.data;
      setCakes((prev) => [newCake, ...prev]);
    } catch (error: any) {
      console.log("Add cake error:", error);
      if (error?.response?.data?.message) {
        console.log("Add cake backend message:", error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (cake: Cake) => {
    setSelectedCake(cake);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setSelectedCake(null);
    setIsEditOpen(false);
  };

  const handleUpdateCake = async (id: string, payload: any) => {
    try {
      setUpdatingId(id);

      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("description", payload.description);
      formData.append("category", payload.category);
      formData.append("price", String(payload.price));
      formData.append("stock", String(payload.stock));

      if (payload.discountPrice !== undefined && payload.discountPrice !== null) {
        formData.append("discountPrice", String(payload.discountPrice));
      }

      if (payload.flavor) formData.append("flavor", payload.flavor);
      if (payload.weight) formData.append("weight", payload.weight);

      formData.append("eggless", String(payload.eggless));

      // new image optional; if not provided, we send no images field
      if (payload.image) {
        formData.append("images", payload.image);
      }

      const res = await api.put(`/cake/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedCake = res.data?.cake || res.data;
      setCakes((prev) => prev.map((c) => (c._id === id ? updatedCake : c)));

      closeEdit();
    } catch (error: any) {
      console.log("Update cake error:", error);
      if (error?.response?.data?.message) {
        console.log("Update cake backend message:", error.response.data.message);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteCake = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this cake?"
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await api.delete(`/cake/${id}`);
      setCakes((prev) => prev.filter((c) => c._id !== id));
    } catch (error: any) {
      console.log("Delete cake error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1120] via-[#111827] to-[#0f172a] text-white px-4 md:px-6 py-6 overflow-hidden space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Cakes</h1>
          <p className="text-sm text-slate-400">Manage all your cake products</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search cakes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-sm outline-none transition focus:border-indigo-500 placeholder-slate-400 text-white"
            />
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            + Add Cake
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-800 bg-[#0b1220]/50 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-transparent text-slate-400">
              <tr>
                <th className="p-5 text-left">Image</th>
                <th className="p-5 text-left">Name</th>
                <th className="p-5 text-left">Category</th>
                <th className="p-5 text-left">Price</th>
                <th className="p-5 text-left">Stock</th>
                <th className="p-5 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="text-slate-300">
              {cakes.map((cake) => (
                <tr key={cake._id} className="border-t hover:bg-[#0b1220]/40">
                  {/* IMAGE */}
                  <td className="p-5">
                    <img
                      src={cake.images?.[0]?.url || "/placeholder.png"}
                      className="h-14 w-14 rounded-2xl object-cover"
                    />
                  </td>

                  {/* NAME */}
                  <td className="p-5 font-semibold text-white">{cake.name}</td>

                  {/* CATEGORY */}
                  <td className="p-5 text-slate-400">
                    {cake.category?.name || "No Category"}
                  </td>

                  {/* PRICE */}
                  <td className="p-5 font-bold text-white">
                    ₹{cake.price}
                    {cake.discountPrice ? (
                      <span className="ml-2 text-xs text-green-600">
                        (-{cake.discountPrice})
                      </span>
                    ) : null}
                  </td>

                  {/* STOCK */}
                  <td className="p-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        cake.stock > 5
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {cake.stock}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="p-5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(cake)}
                        disabled={loading || updatingId === cake._id}
                        className="rounded-xl border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-[#0b1220]/40"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCake(cake._id)}
                        disabled={loading || updatingId === cake._id}
                        className="rounded-xl bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-sm text-gray-500">
          Showing page {page} of {totalPages} ({cakes.length} cakes on this page)
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page <= 1 || loading}
            className="rounded-2xl border border-slate-700 bg-[#0b1220]/40 px-4 py-2 text-sm font-medium text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages || loading}
            className="rounded-2xl border border-slate-700 bg-[#0b1220]/40 px-4 py-2 text-sm font-medium text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-2xl border border-slate-700 bg-[#0b1220]/40 px-4 py-2 text-sm text-slate-300 outline-none"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* EMPTY STATE */}
      {!loading && cakes.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-700 py-20 text-center bg-[#0b1220]/40">
          <h2 className="text-xl font-bold text-white">No Cakes Found</h2>
        </div>
      )}

      {/* MOBILE / SMALL SCREENS: show cards */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {cakes.map((cake) => (
          <div
            key={cake._id}
            className="rounded-2xl border border-slate-800 bg-[#0b1220]/50 p-4 shadow-sm flex items-start gap-4"
          >
            <img
              src={cake.images?.[0]?.url || "/placeholder.png"}
              className="h-20 w-20 rounded-lg object-cover"
              alt={cake.name}
            />

              <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{cake.name}</h3>
                <span className="text-sm font-bold text-white">₹{cake.price}</span>
              </div>

              <p className="text-sm text-slate-400">{cake.category?.name || "No Category"}</p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => openEdit(cake)}
                  disabled={loading || updatingId === cake._id}
                  className="rounded-xl border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-[#0b1220]/40"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCake(cake._id)}
                  disabled={loading || updatingId === cake._id}
                  className="rounded-xl bg-red-500 px-3 py-1 text-xs font-semibold text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODALS */}
      <AddCakeModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddCake}
        categories={categories}
      />

      <EditCakeModal
        isOpen={isEditOpen}
        onClose={closeEdit}
        onUpdate={handleUpdateCake}
        categories={categories}
        cake={selectedCake}
      />
    </div>
  );
};

export default Cakes;

