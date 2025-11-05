import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { getProductById, createProduct, updateProduct } from "@/lib/adminApi";
import { ProductForm } from "@/components/admin/ProductForm";

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && id !== "new") {
      getProductById(id).then(({ data, error }) => {
        if (error) {
          setError(JSON.stringify(error));
          setInitial(null);
        } else {
          setInitial(data);
        }
      });
    }
  }, [id]);

  const handleSubmit = async (payload: any) => {
    setError(null);
    if (id === "new") {
      const { error } = await createProduct(payload);
      if (error) return setError(JSON.stringify(error));
    } else {
      const { error } = await updateProduct(id!, payload);
      if (error) return setError(JSON.stringify(error));
    }
    navigate("/admin/products");
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold">{id === "new" ? "New Product" : "Edit Product"}</h2>
        <div className="mt-4">
          {error && <div className="mb-4 text-sm text-red-600">Error: {error}</div>}
          <ProductForm initial={initial ?? undefined} onSubmit={handleSubmit} />
        </div>
      </div>
    </AdminLayout>
  );
}
