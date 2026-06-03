import type { FC } from "react";
import { useEffect, useState } from "react";
import AddCategoryModal from "../../components/AddCategoryModel";
import api from "../../api/axios";
import axios from "axios";

type Category = {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
  isActive: boolean;
  createdAt?: string;
};

type CategoryInput = {
  name: string;
  slug: string;
  image: File | null;
  isActive: boolean;
};

const Categories: FC = () => {

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [isOpen, setIsOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [addingCategory, setAddingCategory] =
    useState(false);

  // FETCH CATEGORIES
  const fetchCategories = async () => {

    try {

      setLoading(true);

      const response =
        await api.get("/category");

      const data = response.data;

      setCategories(data.categories);

    } catch (error) {

      console.log(
        "FETCH CATEGORY ERROR:",
        error
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchCategories();

  }, []);

  // ADD CATEGORY
  const handleAddCategory = async (
    category: CategoryInput
  ) => {

    try {

      setAddingCategory(true);

      // TOKEN DEBUG
      const token =
        localStorage.getItem("token");

      console.log(
        "TOKEN:",
        token
      );

      // FORM DATA
      const formData =
        new FormData();

      // NAME
      formData.append(
        "name",
        category.name
      );

      // SLUG
      formData.append(
        "slug",
        category.slug
      );

      // STATUS
      formData.append(
        "isActive",
        String(category.isActive)
      );

      // IMAGE
      if (category.image) {

        formData.append(
          "image",
          category.image
        );
      }

      // DEBUG FORM DATA
      console.log(
        "========= FORM DATA ========="
      );

      for (const pair of formData.entries()) {

        console.log(
          pair[0],
          pair[1]
        );
      }

      console.log(
        "============================="
      );

      // API REQUEST
      const response =
        await api.post(
          "/category",
          formData
        );

      // SUCCESS
      console.log(
        "CATEGORY CREATED SUCCESSFULLY"
      );

      console.log(
        "STATUS:",
        response.status
      );

      console.log(
        "RESPONSE DATA:",
        response.data
      );

      alert(
        "Category Added Successfully"
      );

      // REFRESH
      await fetchCategories();

      // CLOSE MODAL
      setIsOpen(false);

    } catch (error) {

      console.log(
        "CATEGORY CREATE ERROR"
      );

      // AXIOS ERROR
      if (
        axios.isAxiosError(error)
      ) {

        console.log(
          "STATUS:",
          error.response?.status
        );

        console.log(
          "ERROR RESPONSE:",
          error.response?.data
        );

        console.log(
          "ERROR MESSAGE:",
          error.message
        );

        alert(
          error.response?.data?.message ||
          "Something went wrong"
        );

      } else {

        console.log(
          "UNKNOWN ERROR:",
          error
        );

        alert(
          "Unknown Error"
        );
      }

    } finally {

      setAddingCategory(false);
    }
  };

  // DELETE CATEGORY
  const handleDelete = async (
    id: string
  ) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this category?"
      );

    if (!confirmDelete) return;

    try {

      await api.delete(
        `/category/${id}`
      );

      setCategories((prev) =>
        prev.filter(
          (cat) =>
            cat._id !== id
        )
      );

    } catch (error) {

      console.log(
        "DELETE CATEGORY ERROR:",
        error
      );
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Categories
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Manage all your cake categories
          </p>

        </div>

        <button
          onClick={() =>
            setIsOpen(true)
          }
          className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          + Add Category
        </button>

      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-3xl border border-slate-800 bg-[#0b1220]/50"
            >

              <div className="h-52 animate-pulse bg-slate-700" />

              <div className="space-y-3 p-5">

                <div className="h-5 w-40 animate-pulse rounded bg-slate-700" />

                <div className="h-4 w-24 animate-pulse rounded bg-slate-700" />

                <div className="mt-6 flex gap-3">

                  <div className="h-10 flex-1 animate-pulse rounded-2xl bg-slate-700" />

                  <div className="h-10 flex-1 animate-pulse rounded-2xl bg-slate-700" />

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* EMPTY */}
      {!loading && categories.length === 0 && (

          <div className="rounded-3xl border border-dashed border-slate-700 bg-[#0b1220]/50 py-24 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-700 text-2xl text-white">
              🗂
            </div>

            <h2 className="mt-5 text-2xl font-bold text-white">No Categories Yet</h2>

            <p className="mt-2 text-sm text-slate-400">Start by creating your first category</p>

            <button
              onClick={() => setIsOpen(true)}
              className="mt-6 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              + Add Category
            </button>

          </div>
        )}

      {/* GRID */}
      {!loading &&
        categories.length > 0 && (

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

            {categories.map((cat) => (

              <div
                key={cat._id}
                className="group overflow-hidden rounded-3xl border border-slate-800 bg-[#0b1220]/50 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >

                {/* IMAGE */}
                <div className="relative h-56 overflow-hidden">

                  <img
                    src={
                      cat.image ||
                      "https://images.unsplash.com/photo-1578985545062-69928b1d9587"
                    }
                    alt={cat.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <span
                    className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                      cat.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {cat.isActive ? "Active" : "Inactive"}
                  </span>

                </div>

                <div className="p-5">

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <h2 className="text-xl font-bold text-white">{cat.name}</h2>

                      <p className="mt-1 text-sm text-slate-400">/{cat.slug || "no-slug"}</p>

                    </div>

                  </div>

                  {/* DATE */}
                  <p className="mt-4 text-xs text-slate-400">
                    Added on {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : "N/A"}
                  </p>

                  {/* ACTIONS */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                    <button className="flex-1 rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-[#0b1220]/40">
                      Edit
                    </button>

                    <button onClick={() => handleDelete(cat._id)} className="flex-1 rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
                      Delete
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      {/* ADDING CATEGORY LOADER */}
      {addingCategory && (
        <div className="fixed bottom-5 right-5 rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white shadow-xl">
          Adding Category...
        </div>
      )}

      {/* MODAL */}
      <AddCategoryModal
        isOpen={isOpen}
        onClose={() =>
          setIsOpen(false)
        }
        onAdd={handleAddCategory}
      />

    </div>
  );
};

export default Categories;