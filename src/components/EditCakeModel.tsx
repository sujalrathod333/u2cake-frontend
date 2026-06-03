import type { FC } from "react";
import { useEffect, useState } from "react";
import { UploadCloud, X } from "lucide-react";

type Category = {
  _id: string;
  name: string;
};

type CakeForEdit = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  category: Category | null;
  images: { url: string; public_id: string }[];
};

type CakeUpdateInput = {
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
  onUpdate: (id: string, payload: CakeUpdateInput) => Promise<void> | void;
  categories: Category[];
  cake: CakeForEdit | null;
};

const EditCakeModal: FC<Props> = ({
  isOpen,
  onClose,
  onUpdate,
  categories,
  cake,
}) => {
  const [form, setForm] = useState<CakeUpdateInput>({
    name: "",
    description: "",
    category: "",
    price: 0,
    discountPrice: undefined,
    stock: 0,
    flavor: "",
    weight: "",
    eggless: false,
    image: null,
  });

  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !cake) return;

    setForm({
      name: cake.name ?? "",
      description: cake.description ?? "",
      category: cake.category?._id ?? "",
      price: Number(cake.price ?? 0),
      discountPrice:
        cake.discountPrice !== undefined && cake.discountPrice !== null
          ? Number(cake.discountPrice)
          : undefined,
      stock: Number(cake.stock ?? 0),
      flavor: "",
      weight: "",
      eggless: false,
      image: null,
    });

    setPreview(cake.images?.[0]?.url ?? "");
  }, [isOpen, cake]);

  if (!isOpen || !cake) return null;

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
          ? value === ""
            ? undefined
            : Number(value)
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

  const handleSubmit = async (e: React.FormEvent) => {
    // allow update even if no new image selected (backend update can keep old images)

    e.preventDefault();
    if (!form.name || !form.category) {
      alert("Please fill required fields");
      return;
    }

    try {
      setLoading(true);
      await onUpdate(cake._id, form);
      onClose();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="flex justify-between border-b p-4">
          <h2 className="text-xl font-bold">Edit Cake</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 p-5">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Cake Name"
            className="w-full rounded border p-2"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full rounded border p-2"
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded border p-2"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              className="w-full rounded border p-2"
            />

            <input
              name="discountPrice"
              type="number"
              value={form.discountPrice ?? ""}
              onChange={handleChange}
              placeholder="Discount Price"
              className="w-full rounded border p-2"
            />
          </div>

          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            placeholder="Stock"
            className="w-full rounded border p-2"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              name="flavor"
              value={form.flavor ?? ""}
              onChange={handleChange}
              placeholder="Flavor (Optional)"
              className="w-full rounded border p-2"
            />

            <input
              name="weight"
              value={form.weight ?? ""}
              onChange={handleChange}
              placeholder="Weight (Optional)"
              className="w-full rounded border p-2"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.eggless}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, eggless: e.target.checked }))
              }
            />
            Eggless Cake
          </label>

          <label className="block cursor-pointer border p-3 text-center">
            <UploadCloud className="mx-auto" />
            <input type="file" hidden onChange={handleImageChange} />
          </label>

          {preview && (
            <img
              src={preview}
              className="h-40 w-full rounded object-cover"
            />
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose}>
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded bg-black px-4 py-2 text-white"
            >
              {loading ? "Updating..." : "Update Cake"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCakeModal;

