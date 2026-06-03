import type { FC } from "react";
import { useState } from "react";
import { UploadCloud, X } from "lucide-react";

type CategoryInput = {
  name: string;
  slug: string;
  image: File | null;
  isActive: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    category: CategoryInput
  ) => Promise<void> | void;
};

const AddCategoryModal: FC<Props> = ({
  isOpen,
  onClose,
  onAdd,
}) => {

  const [name, setName] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [image, setImage] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState("");

  const [isActive, setIsActive] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  if (!isOpen) return null;

  // IMAGE CHANGE
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (file) {

      setImage(file);

      setPreview(
        URL.createObjectURL(file)
      );
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);

    // slug auto-generate from name to avoid mismatch
    const nextSlug = value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    setSlug(nextSlug);
  };

  // RESET FORM
  const resetForm = () => {

    setName("");

    setSlug("");

    setImage(null);

    setPreview("");

    setIsActive(true);
  };

  // SUBMIT
  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!name || !slug || !image) {
      alert("Please fill all required fields");
      return;
    }

    // final normalization before sending
    const normalizedSlug = slug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    if (!normalizedSlug) {
      alert("Invalid slug");
      return;
    }

    try {
      setLoading(true);

      await onAdd({
        name,
        slug: normalizedSlug,
        image,
        isActive,
      });

      resetForm();

      onClose();

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }


  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">

      {/* MODAL */}
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-[#0b1220] shadow-2xl">

        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-5">

          <div>

            <h2 className="text-2xl font-bold text-white">
              Add Category
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Create a new cake category
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            <X size={22} />
          </button>

        </div>

        {/* BODY */}
        <div className="max-h-[80vh] overflow-y-auto px-6 py-6">

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* CATEGORY NAME */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Category Name
              </label>

              <input
                type="text"
                placeholder="Birthday Cakes"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500 focus:bg-[#111827]"
              />

            </div>

            {/* SLUG */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Category Slug
              </label>

              <input
                type="text"
                placeholder="birthday-cakes"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "")
                  )
                }
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500 focus:bg-[#111827]"
              />

              <p className="mt-2 text-xs text-slate-400">
                Slug should be unique
              </p>

            </div>

            {/* IMAGE */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Upload Category Image
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-700 bg-slate-900 px-6 py-10 text-slate-300 transition hover:border-white hover:bg-slate-800">

                <UploadCloud
                  size={42}
                  className="mb-3 text-slate-300"
                />

                <p className="text-sm font-medium text-slate-200">
                  Click to upload image
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  PNG, JPG or JPEG
                </p>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={
                    handleImageChange
                  }
                />

              </label>

            </div>

            {/* PREVIEW */}
            {preview && (
              <div className="overflow-hidden rounded-3xl border border-slate-800">

                <img
                  src={preview}
                  alt="Preview"
                  className="h-72 w-full object-cover"
                />

              </div>
            )}

            {/* STATUS */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4">

              <div>

                <h3 className="font-semibold text-white">
                  Active Category
                </h3>

                <p className="text-sm text-slate-400">
                  Enable or disable this category
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setIsActive(
                    !isActive
                  )
                }
                className={`relative h-7 w-14 rounded-full transition ${
                  isActive
                    ? "bg-red-600"
                    : "bg-slate-700"
                }`}
              >

                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    isActive
                      ? "left-8"
                      : "left-1"
                  }`}
                />

              </button>

            </div>

            {/* BUTTONS */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end sm:gap-4">

              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {loading
                  ? "Adding..."
                  : "Add Category"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
};

export default AddCategoryModal;