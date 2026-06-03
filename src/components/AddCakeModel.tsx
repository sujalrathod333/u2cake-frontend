import type { FC } from "react";
import { useState } from "react";
import { X, UploadCloud } from "lucide-react";

type Category = {
  _id: string;
  name: string;
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (cake: CakeInput) => Promise<void> | void;
  categories: Category[];
};

const AddCakeModal: FC<Props> = ({
  isOpen,
  onClose,
  onAdd,
  categories,
}) => {
  const [form, setForm] = useState<CakeInput>({
    name: "",
    description: "",
    category: "",
    price: 0,
    discountPrice: 0,
    stock: 0,
    flavor: "",
    weight: "",
    eggless: false,
    image: null,
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price" ||
        name === "stock" ||
        name === "discountPrice"
          ? Number(value)
          : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      category: "",
      price: 0,
      discountPrice: 0,
      stock: 0,
      flavor: "",
      weight: "",
      eggless: false,
      image: null,
    });
    setPreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.category || !form.price || !form.image) {
      alert("Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      await onAdd(form);

      resetForm();
      onClose();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-800 bg-[#0b1220] shadow-2xl">

        {/* HEADER */}
        <div className="flex justify-between border-b border-slate-800 bg-slate-950 p-4">
          <h2 className="text-xl font-bold text-white">Add Cake</h2>
          <button className="rounded-full p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white" onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">

          {/* NAME */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Cake Name"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500 focus:bg-[#111827]"
          />

          {/* DESCRIPTION */}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500 focus:bg-[#111827]"
          />

          {/* CATEGORY */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:bg-[#111827]"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* PRICE + DISCOUNT */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500 focus:bg-[#111827]"
            />

            <input
              name="discountPrice"
              type="number"
              value={form.discountPrice}
              onChange={handleChange}
              placeholder="Discount Price"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500 focus:bg-[#111827]"
            />
          </div>

          {/* STOCK */}
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            placeholder="Stock"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500 focus:bg-[#111827]"
          />

          {/* FLAVOR + WEIGHT */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="flavor"
              value={form.flavor}
              onChange={handleChange}
              placeholder="Flavor (Chocolate, Vanilla...)"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500 focus:bg-[#111827]"
            />

            <input
              name="weight"
              value={form.weight}
              onChange={handleChange}
              placeholder="Weight (1kg, 500g...)"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500 focus:bg-[#111827]"
            />
          </div>

          {/* EGGLESS */}
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={form.eggless}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  eggless: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
            />
            Eggless Cake
          </label>

          {/* IMAGE */}
          <label className="block cursor-pointer rounded-3xl border border-dashed border-slate-700 bg-slate-900 px-4 py-6 text-center text-slate-300 transition hover:border-white hover:bg-slate-800">
            <UploadCloud className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm text-slate-300">Upload cake image</p>
            <input type="file" hidden onChange={handleImageChange} />
          </label>

          {/* PREVIEW */}
          {preview && (
            <img
              src={preview}
              className="h-40 w-full rounded-3xl object-cover"
            />
          )}

          {/* BUTTONS */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Cake"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddCakeModal;