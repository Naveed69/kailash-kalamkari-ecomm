import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { getProducts, deleteProduct } from "@/lib/adminApi";
import { Link } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  const load = async () => {
    const { data } = await getProducts();
    setProducts(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await deleteProduct(id);
    load();
  };

  const filtered = products.filter((p) => p.name?.toLowerCase().includes(query.toLowerCase()));

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-4 w-full md:w-1/2">
            <h2 className="text-2xl font-bold">Products</h2>
            <div className="flex-1">
              <input
                placeholder="Search products by name or description"
                className="input w-full"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select className="input w-full md:w-48">
              <option>Sort: Newest</option>
              <option>Sort: Price ↑</option>
              <option>Sort: Price ↓</option>
            </select>
            <Link to="/admin/products/new" className="btn btn-primary">
              New Product
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="divide-y">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <div className="w-28 h-20 flex-shrink-0 bg-slate-50 rounded overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-lg truncate">{p.name}</div>
                    <div className="text-sm text-muted-foreground mt-1 truncate">{p.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">₹{p.price}</div>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {p.category_name && <span className="text-xs px-2 py-1 bg-slate-100 rounded">{p.category_name}</span>}
                  {p.sub_category_name && <span className="text-xs px-2 py-1 bg-slate-100 rounded">{p.sub_category_name}</span>}
                  {p.in_stock ? (
                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded">In stock</span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-rose-100 text-rose-800 rounded">Out of stock</span>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
                <Link to={`/admin/products/${p.id}`} className="btn btn-sm">
                  Edit
                </Link>
                <button className="btn btn-sm btn-destructive" onClick={() => handleDelete(p.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
