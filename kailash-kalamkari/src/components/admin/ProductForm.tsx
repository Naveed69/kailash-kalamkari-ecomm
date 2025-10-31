import React, { useState, useEffect, useRef } from "react";
import type { Product } from "@/components/ProductCard";
import { getCategories, getSubCategories } from "@/lib/adminApi";

type Props = {
  initial?: Partial<Product>;
  onSubmit: (payload: Partial<Product>) => Promise<void> | void;
  submitLabel?: string;
};

export const ProductForm: React.FC<Props> = ({ initial = {}, onSubmit, submitLabel = "Save" }) => {
  const [form, setForm] = useState<Partial<Product>>({ ...initial });
  const lastInitialRef = useRef<string | null>(null);

  useEffect(() => {
    // serialize initial to detect meaningful changes and avoid update loops
    try {
      const serialized = initial ? JSON.stringify(initial) : null;
      if (serialized && lastInitialRef.current !== serialized) {
        setForm({ ...initial });
        lastInitialRef.current = serialized;
      }
    } catch (err) {
      // fallback: shallow update if serialization fails
      setForm({ ...initial });
    }
  }, [initial]);

  const handleChange = (k: keyof Product, v: any) => setForm((s) => ({ ...s, [k]: v }));

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    getCategories().then(({ data, error }) => {
      console.log("Fetched categories:", data);
      if (mounted && data) setCategories(data);
    });
    getSubCategories().then(({ data }) => {
      console.log("Fetched subcategories:", data);
      if (mounted && data) setSubCategories(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Filter subcategories by selected category id (assume subCategories have a category_id field)
  const filteredSubcategories = (subCategories ?? []).filter((s) => {
    if (!form.category) return false; // don't show subcategories until category is selected
    // normalize id comparisons
    const catId = Number(form.category);
    return Number(s.category_id ?? s.category) === catId || Number(s.category_id ?? s.category_id) === catId;
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4 w-full bg-white p-4 rounded shadow"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input className="input w-full" value={form.name ?? ""} onChange={(e) => handleChange("name", e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <select className="input w-full" value={form.category ?? ""} onChange={(e) => handleChange("category", Number(e.target.value))}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name ?? c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Price</label>
          <input type="number" className="input w-full" value={form.price ?? 0} onChange={(e) => handleChange("price", Number(e.target.value))} />
        </div>

        <div>
          <label className="block text-sm font-medium">Original Price</label>
          <input type="number" className="input w-full" value={form.originalPrice ?? 0} onChange={(e) => handleChange("originalPrice", Number(e.target.value))} />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium">Image URL</label>
          <input className="input w-full" value={form.image ?? ""} onChange={(e) => handleChange("image", e.target.value)} />
        </div>

        {/* Image preview on larger screens */}
        {form.image && (
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium">Preview</label>
            <div className="mt-2 w-full h-48 bg-slate-50 rounded overflow-hidden flex items-center justify-center border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image} alt={form.name ?? "preview"} className="object-contain h-full" />
            </div>
          </div>
        )}

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium">Description</label>
          <textarea className="input w-full h-24" value={form.description ?? ""} onChange={(e) => handleChange("description", e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Colors (comma separated)</label>
          <input
            className="input w-full"
            value={(form.colors ?? []).join(",")}
            onChange={(e) => handleChange("colors", e.target.value.split(",").map((s) => s.trim()))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Sub Category</label>
          <select className="input w-full" value={form.subCategory ?? ""} onChange={(e) => handleChange("subCategory", Number(e.target.value))}>
            <option value="">Select subcategory</option>
            {filteredSubcategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name ?? s.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">In Stock</label>
          <select className="input w-full" value={form.inStock ? "yes" : "no"} onChange={(e) => handleChange("inStock", e.target.value === "yes")}> 
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        <button className="btn btn-primary w-full sm:w-auto" type="submit">
          {submitLabel}
        </button>
        <button type="button" className="btn w-full sm:w-auto" onClick={() => setForm({})}>
          Reset
        </button>
      </div>
    </form>
  );
};
