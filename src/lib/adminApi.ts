import { supabase } from "@/lib/supabaseClient";
import type { Product } from "@/components/ProductCard";

const sanitizePayload = (payload: Partial<Product>) => {
  const p: any = { ...payload };
  // remove undefined fields
  Object.keys(p).forEach((k) => p[k] === undefined && delete p[k]);

  // coerce numeric fields
  if (p.price !== undefined) p.price = p.price === "" ? null : Number(p.price);
  if (p.originalPrice !== undefined) p.originalPrice = p.originalPrice === "" ? null : Number(p.originalPrice);

  // coerce category/subCategory to numeric ids when provided
  const toNullableInt = (v: any) => {
    if (v === undefined || v === null || v === "") return null;
    // treat booleans or boolean-like strings as null (unlikely to be valid ids)
    if (typeof v === "boolean") return null;
    if (typeof v === "string") {
      const trimmed = v.trim();
      // explicit boolean-like strings
      if (trimmed === "true" || trimmed === "false") return null;
      const n = Number(trimmed);
      return Number.isNaN(n) ? null : n;
    }
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    return null;
  };

  if (p.category !== undefined) p.category = toNullableInt(p.category);
  if (p.subCategory !== undefined) p.subCategory = toNullableInt(p.subCategory);

  // colors: accept string (comma separated) or array
  if (p.colors !== undefined) {
    if (typeof p.colors === "string") {
      p.colors = p.colors.split(",").map((s: string) => s.trim()).filter(Boolean);
    } else if (!Array.isArray(p.colors)) {
      p.colors = [String(p.colors)];
    }
  }

  // inStock to boolean
  if (p.inStock !== undefined) p.inStock = Boolean(p.inStock);

  // Remove id when inserting
  if (p.id !== undefined) delete p.id;

  // Map camelCase keys used in UI to snake_case column names in Postgres (common convention)
  const keyMap: Record<string, string> = {
    originalPrice: "original_price",
    inStock: "in_stock",
    // products belong to a subcategory (by id) and subcategories belong to categories
    subCategory: "sub_category_id",
    category: "category_id",
    // add more mappings if your DB uses different column names
  };

  const mapped: any = {};
  Object.keys(p).forEach((k) => {
    const mappedKey = keyMap[k] ?? k;
    // ensure any *_id columns are numbers or null
    if (mappedKey.endsWith("_id")) {
      const val = p[k];
      if (val === null || val === undefined) {
        mapped[mappedKey] = null;
      } else if (typeof val === "number") {
        mapped[mappedKey] = Number.isFinite(val) ? val : null;
      } else {
        // try to coerce strings like "123" to numbers, otherwise null
        const coerced = Number(val);
        mapped[mappedKey] = Number.isNaN(coerced) ? null : coerced;
      }
    } else {
      mapped[mappedKey] = p[k];
    }
  });

  return mapped as Partial<Product>;
};

const findInvalidIdField = (obj: Record<string, any>) => {
  for (const key of Object.keys(obj)) {
    if (key.endsWith("_id")) {
      const v = obj[key];
      if (v !== null && typeof v !== "number") {
        return { field: key, value: v };
      }
    }
  }
  return null;
};

// Keep typings simple to avoid complex generic constraints from the Supabase client
export const getProducts = async (): Promise<{ data: Product[] | null; error: any }> => {
  const { data, error } = await supabase.from("products").select("*");
  return { data: (data as Product[]) ?? null, error };
};

export const getProductById = async (id: string): Promise<{ data: Product | null; error: any }> => {
  // use maybeSingle so PostgREST 406 (no rows) isn't treated as an exception
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  // If there was no error but also no data, return a friendly not-found error
  if (!error && !data) {
    return { data: null, error: { message: "Product not found", code: "NOT_FOUND", status: 404 } };
  }
  return { data: (data as Product) ?? null, error };
};

export const createProduct = async (payload: Partial<Product>): Promise<{ data: Product | null; error: any }> => {
  const sanitized = sanitizePayload(payload);
  // Validate id fields before attempting insert
  const invalid = findInvalidIdField(sanitized as Record<string, any>);
  if (invalid) {
    const message = `Invalid id for column ${invalid.field}: ${JSON.stringify(invalid.value)}`;
    console.error("Validation error before insert:", message);
    return { data: null, error: { message, details: null, hint: "Ensure *_id fields are numeric or null", code: "VALIDATION", status: 400 } };
  }
  console.debug("createProduct - sanitized payload:", sanitized);
  // Try initial insert
  const attemptInsert = async (obj: any) => await supabase.from("products").insert([obj]).select().single();

  let { data, error, status } = await attemptInsert(sanitized);
  if (!error) return { data: (data as Product) ?? null, error: null };

  console.warn("Supabase insert error - first attempt:", { message: error.message, details: error.details, hint: error.hint, code: error.code, status });

  // If PostgREST says a column is missing, try reasonable fallbacks (map `category` to category_id / category_name)
  const missingMatch = typeof error?.message === "string" && error.message.match(/Could not find the '(.+?)' column/);
  if (missingMatch) {
    const missingCol = missingMatch[1];
    console.debug("Detected missing column from PostgREST message:", missingCol);

    // Build fallback attempts
    const fallbacks: Array<{ desc: string; mapper: (src: any) => any }> = [];

    // If UI provided `category`, try mapping to `category_id` (numeric) and `category_name` (text)
    if (sanitized.category !== undefined) {
      fallbacks.push({
        desc: "map category -> category_id",
        mapper: (src) => {
          const copy = { ...src };
          const val = copy.category;
          delete copy.category;
          const coerced = Number(val);
          copy["category_id"] = Number.isNaN(coerced) ? null : coerced;
          return copy;
        },
      });

      fallbacks.push({
        desc: "map category -> category_name",
        mapper: (src) => {
          const copy = { ...src };
          copy["category_name"] = copy.category;
          delete copy.category;
          return copy;
        },
      });
    }

    // Generic fallback: remove the offending column if it exists in payload
    fallbacks.push({
      desc: `remove ${missingCol}`,
      mapper: (src) => {
        const copy = { ...src };
        if (copy[missingCol] !== undefined) delete copy[missingCol];
        return copy;
      },
    });

    for (const fb of fallbacks) {
      try {
        const attemptPayload = fb.mapper(sanitized);
        console.debug("Retrying insert with fallback:", fb.desc, attemptPayload);
        const r = await attemptInsert(attemptPayload);
        if (!r.error) {
          console.info("Insert successful after fallback:", fb.desc);
          return { data: (r.data as Product) ?? null, error: null };
        }
        console.warn("Fallback attempt failed:", fb.desc, r.error?.message ?? r.error);
      } catch (err) {
        console.error("Error during fallback attempt:", err);
      }
    }
  }

  // Still failing - return structured error
  console.error("Supabase insert final error:", { message: error.message, details: error.details, hint: error.hint, code: error.code, status });
  return {
    data: null,
    error: { message: error.message, details: error.details, hint: error.hint, code: error.code, status },
  };
};

export const updateProduct = async (id: string, payload: Partial<Product>): Promise<{ data: Product | null; error: any }> => {
  const sanitized = sanitizePayload(payload);
  // Validate id fields before attempting update
  const invalid = findInvalidIdField(sanitized as Record<string, any>);
  if (invalid) {
    const message = `Invalid id for column ${invalid.field}: ${JSON.stringify(invalid.value)}`;
    console.error("Validation error before update:", message);
    return { data: null, error: { message, details: null, hint: "Ensure *_id fields are numeric or null", code: "VALIDATION", status: 400 } };
  }
  console.debug("updateProduct - sanitized payload:", sanitized);
  const attemptUpdate = async (obj: any) => await supabase.from("products").update(obj).eq("id", id).select().maybeSingle();

  let { data, error, status } = await attemptUpdate(sanitized);
  if (!error) {
    if (!data) return { data: null, error: { message: "Product not found", code: "NOT_FOUND", status: 404 } };
    return { data: (data as Product) ?? null, error: null };
  }

  console.warn("Supabase update error - first attempt:", { message: error.message, details: error.details, hint: error.hint, code: error.code, status });

  const missingMatch = typeof error?.message === "string" && error.message.match(/Could not find the '(.+?)' column/);
  if (missingMatch) {
    const missingCol = missingMatch[1];
    const fallbacks: Array<{ desc: string; mapper: (src: any) => any }> = [];

    if (sanitized.category !== undefined) {
      fallbacks.push({
        desc: "map category -> category_id",
        mapper: (src) => {
          const copy = { ...src };
          const val = copy.category;
          delete copy.category;
          const coerced = Number(val);
          copy["category_id"] = Number.isNaN(coerced) ? null : coerced;
          return copy;
        },
      });
      fallbacks.push({
        desc: "map category -> category_name",
        mapper: (src) => {
          const copy = { ...src };
          copy["category_name"] = copy.category;
          delete copy.category;
          return copy;
        },
      });
    }

    fallbacks.push({
      desc: `remove ${missingCol}`,
      mapper: (src) => {
        const copy = { ...src };
        if (copy[missingCol] !== undefined) delete copy[missingCol];
        return copy;
      },
    });

    for (const fb of fallbacks) {
      try {
        const attemptPayload = fb.mapper(sanitized);
        console.debug("Retrying update with fallback:", fb.desc, attemptPayload);
        const r = await attemptUpdate(attemptPayload);
        if (!r.error) {
          console.info("Update successful after fallback:", fb.desc);
          return { data: (r.data as Product) ?? null, error: null };
        }
        console.warn("Fallback update attempt failed:", fb.desc, r.error?.message ?? r.error);
      } catch (err) {
        console.error("Error during fallback update attempt:", err);
      }
    }
  }

  console.error("Supabase update final error:", { message: error.message, details: error.details, hint: error.hint, code: error.code, status });
  return { data: null, error: { message: error.message, details: error.details, hint: error.hint, code: error.code, status } };
};

export const deleteProduct = async (id: string): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase.from("products").delete().eq("id", id);
  return { data, error };
};

export const getCategories = async (): Promise<{ data: any[] | null; error: any }> => {
  const { data, error } = await supabase.from("categories").select("*");
  return { data: data ?? null, error };
};

export const getSubCategories = async (): Promise<{ data: any[] | null; error: any }> => {
  const { data, error } = await supabase.from("subCategories").select("*");
  return { data: data ?? null, error };
};
