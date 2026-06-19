import { supabase } from "@/lib/supabaseClient"
import type { Product } from "@/components/ProductCard"
import { validateImageRef } from "@/lib/imageValidation"

const toValidationError = (error: unknown) => ({
  message: error instanceof Error ? error.message : "Invalid image reference",
  details: null,
  hint: "Use Cloudflare Image IDs for new image values. Legacy http(s) URLs are temporarily allowed during migration.",
  code: "VALIDATION",
  status: 400,
})

const validateImageRefArray = (
  refs: unknown,
  fieldName: string,
): string[] => {
  if (refs === null || refs === undefined || refs === "") return []
  if (!Array.isArray(refs)) {
    throw new Error(`${fieldName} must be an array of image references`)
  }

  const seen = new Set<string>()
  const validated: string[] = []

  refs.forEach((ref, index) => {
    const value = validateImageRef(ref, {
      allowLegacy: true,
      fieldName: `${fieldName}[${index}]`,
    })
    if (!value || seen.has(value)) return
    seen.add(value)
    validated.push(value)
  })

  return validated
}

const sanitizePayload = (payload: Partial<Product>) => {
  const p: any = { ...payload }
  // remove undefined fields
  Object.keys(p).forEach((k) => p[k] === undefined && delete p[k])

  if (p.image !== undefined) {
    p.image = validateImageRef(p.image, {
      allowLegacy: true,
      fieldName: "image",
    })
  }

  if (p.images !== undefined) {
    p.images = validateImageRefArray(p.images, "images")
  }

  // coerce numeric fields
  if (p.price !== undefined) p.price = p.price === "" ? null : Number(p.price)
  if (p.originalPrice !== undefined)
    p.originalPrice = p.originalPrice === "" ? null : Number(p.originalPrice)

  // coerce category/subCategory to numeric ids when provided
  const toNullableInt = (v: any) => {
    if (v === undefined || v === null || v === "") return null
    // treat booleans or boolean-like strings as null (unlikely to be valid ids)
    if (typeof v === "boolean") return null
    if (typeof v === "string") {
      const trimmed = v.trim()
      // explicit boolean-like strings
      if (trimmed === "true" || trimmed === "false") return null
      const n = Number(trimmed)
      return Number.isNaN(n) ? null : n
    }
    if (typeof v === "number") return Number.isFinite(v) ? v : null
    return null
  }

  if (p.category !== undefined) p.category = toNullableInt(p.category)
  if (p.subCategory !== undefined) p.subCategory = toNullableInt(p.subCategory)

  // colors: accept string (comma separated) or array
  if (p.colors !== undefined) {
    if (typeof p.colors === "string") {
      p.colors = p.colors
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
    } else if (!Array.isArray(p.colors)) {
      p.colors = [String(p.colors)]
    }
  }

  // inStock to boolean
  if (p.inStock !== undefined) p.inStock = Boolean(p.inStock)

  // Remove id when inserting
  if (p.id !== undefined) delete p.id

  // Map camelCase keys used in UI to snake_case column names in Postgres (common convention)
  const keyMap: Record<string, string> = {
    originalPrice: "original_price",
    inStock: "in_stock",
    isVisible: "is_visible",
    // products belong to a subcategory (by id) and subcategories belong to categories
    subCategory: "sub_category_id",
    category: "category_id",
    quantity: "stock_quantity",
    images: "images",
    // add more mappings if your DB uses different column names
  }

  const mapped: any = {}
  Object.keys(p).forEach((k) => {
    const mappedKey = keyMap[k] ?? k
    // ensure any *_id columns are numbers or null
    if (mappedKey.endsWith("_id")) {
      const val = p[k]
      if (val === null || val === undefined) {
        mapped[mappedKey] = null
      } else if (typeof val === "number") {
        mapped[mappedKey] = Number.isFinite(val) ? val : null
      } else {
        // try to coerce strings like "123" to numbers, otherwise null
        const coerced = Number(val)
        mapped[mappedKey] = Number.isNaN(coerced) ? null : coerced
      }
    } else {
      mapped[mappedKey] = p[k]
    }
  })

  return mapped as Partial<Product>
}

const findInvalidIdField = (obj: Record<string, any>) => {
  for (const key of Object.keys(obj)) {
    if (key.endsWith("_id")) {
      const v = obj[key]
      if (v !== null && typeof v !== "number") {
        return { field: key, value: v }
      }
    }
  }
  return null
}

const getMissingColumn = (error: any): string | null => {
  if (typeof error?.message !== "string") return null
  const match = error.message.match(/Could not find the '(.+?)' column/)
  return match?.[1] ?? null
}

const removeMissingColumn = (payload: Record<string, any>, column: string) => {
  if (!(column in payload)) return null

  const next = { ...payload }

  // Older schemas sometimes used quantity before stock_quantity.
  if (column === "stock_quantity" && next.quantity === undefined) {
    next.quantity = next.stock_quantity
  }

  delete next[column]
  return next
}

const withMissingColumnFallback = async (
  payload: Record<string, any>,
  run: (obj: Record<string, any>) => Promise<any>,
) => {
  let currentPayload = payload
  let result = await run(currentPayload)
  const removedColumns = new Set<string>()

  while (result.error) {
    const missingColumn = getMissingColumn(result.error)
    if (!missingColumn || removedColumns.has(missingColumn)) break

    const nextPayload = removeMissingColumn(currentPayload, missingColumn)
    if (!nextPayload) break

    removedColumns.add(missingColumn)
    currentPayload = nextPayload
    result = await run(currentPayload)
  }

  return result
}

// Keep typings simple to avoid complex generic constraints from the Supabase client
export const getProducts = async (): Promise<{
  data: Product[] | null
  error: any
}> => {
  console.log("🌐 Fetching products from Supabase...")
  const { data, error } = await supabase.from("products").select("*")
  console.log("🌐 Supabase response:", {
    dataCount: data?.length,
    error: error?.message,
    firstItem: data?.[0]?.name,
  })
  return { data: (data as Product[]) ?? null, error }
}

export const getProductById = async (
  id: string,
): Promise<{ data: Product | null; error: any }> => {
  // use maybeSingle so PostgREST 406 (no rows) isn't treated as an exception
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  // If there was no error but also no data, return a friendly not-found error
  if (!error && !data) {
    return {
      data: null,
      error: { message: "Product not found", code: "NOT_FOUND", status: 404 },
    }
  }
  return { data: (data as Product) ?? null, error }
}

export const createProduct = async (
  payload: Partial<Product>,
): Promise<{ data: Product | null; error: any }> => {
  let sanitized: Partial<Product>
  try {
    sanitized = sanitizePayload(payload)
  } catch (error) {
    return { data: null, error: toValidationError(error) }
  }
  // Validate id fields before attempting insert
  const invalid = findInvalidIdField(sanitized as Record<string, any>)
  if (invalid) {
    const message = `Invalid id for column ${invalid.field}: ${JSON.stringify(
      invalid.value,
    )}`
    return {
      data: null,
      error: {
        message,
        details: null,
        hint: "Ensure *_id fields are numeric or null",
        code: "VALIDATION",
        status: 400,
      },
    }
  }
  const attemptInsert = async (obj: any) =>
    await supabase.from("products").insert([obj]).select().single()

  const { data, error, status } = await withMissingColumnFallback(
    sanitized as Record<string, any>,
    attemptInsert,
  )
  if (!error) return { data: (data as Product) ?? null, error: null }

  // Still failing - return structured error
  return {
    data: null,
    error: {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      status,
    },
  }
}

export const updateProduct = async (
  id: string,
  payload: Partial<Product>,
): Promise<{ data: Product | null; error: any }> => {
  let sanitized: Partial<Product>
  try {
    sanitized = sanitizePayload(payload)
  } catch (error) {
    return { data: null, error: toValidationError(error) }
  }
  // Validate id fields before attempting update
  const invalid = findInvalidIdField(sanitized as Record<string, any>)
  if (invalid) {
    const message = `Invalid id for column ${invalid.field}: ${JSON.stringify(
      invalid.value,
    )}`
    return {
      data: null,
      error: {
        message,
        details: null,
        hint: "Ensure *_id fields are numeric or null",
        code: "VALIDATION",
        status: 400,
      },
    }
  }
  const attemptUpdate = async (obj: any) =>
    await supabase
      .from("products")
      .update(obj)
      .eq("id", id)
      .select()
      .maybeSingle()

  const { data, error, status } = await withMissingColumnFallback(
    sanitized as Record<string, any>,
    attemptUpdate,
  )
  if (!error) {
    if (!data)
      return {
        data: null,
        error: { message: "Product not found", code: "NOT_FOUND", status: 404 },
      }
    return { data: (data as Product) ?? null, error: null }
  }

  return {
    data: null,
    error: {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      status,
    },
  }
}

export const deleteProduct = async (
  id: string,
): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase.from("products").delete().eq("id", id)
  return { data, error }
}

export const getCategories = async (): Promise<{
  data: any[] | null
  error: any
}> => {
  const { data, error } = await supabase.from("categories").select("*")
  return { data: data ?? null, error }
}

// Fetch all sub categories from the database
export const getSubCategories = async (): Promise<{
  data: any[] | null
  error: any
}> => {
  const { data, error } = await supabase.from("sub_categories").select("*")

  // Map subCatName to name for frontend consistency
  const mappedData =
    data?.map((item) => ({
      ...item,
      name: item.subCatName,
      image_url: item.image_url ?? null,
    })) || null

  return { data: mappedData, error }
}

export const uploadImage = async (
  file: File,
): Promise<{ url: string | null; error: any }> => {
  void file
  return {
    url: null,
    error: new Error(
      "Supabase product image uploads are disabled. Upload images to Cloudflare Images and persist the Cloudflare Image ID.",
    ),
  }
}

// Category CRUD operations
export const createCategory = async (payload: {
  name: string
  description?: string
}): Promise<{ data: any | null; error: any }> => {
  const { data, error } = await supabase
    .from("categories")
    .insert([payload])
    .select()
    .single()
  return { data, error }
}

export const updateCategory = async (
  id: number,
  payload: { name?: string; description?: string },
): Promise<{ data: any | null; error: any }> => {
  const { data, error } = await supabase
    .from("categories")
    .update(payload)
    .eq("id", id)
    .select()
    .single()
  return { data, error }
}

export const deleteCategory = async (
  id: number,
): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
  return { data, error }
}

// SubCategory CRUD operations
export const createSubCategory = async (payload: {
  name: string
  description?: string
  category_id: number
  image_url?: string | null
}): Promise<{ data: any | null; error: any }> => {
  let imageUrl: string | null
  try {
    imageUrl = validateImageRef(payload.image_url ?? null, {
      allowLegacy: true,
      fieldName: "image_url",
    })
  } catch (error) {
    return { data: null, error: toValidationError(error) }
  }

  // Map 'name' to 'subCatName' for database
  const dbPayload = {
    subCatName: payload.name,
    category_id: payload.category_id,
    image_url: imageUrl,
  }
  const { data, error } = await supabase
    .from("sub_categories")
    .insert([dbPayload])
    .select()
    .single()

  // Map back for frontend consistency
  if (data) {
    data.name = data.subCatName
    data.image_url = data.image_url ?? null
  }
  return { data, error }
}

export const updateSubCategory = async (
  id: number,
  payload: {
    name?: string
    description?: string
    category_id?: number
    image_url?: string | null
  },
): Promise<{ data: any | null; error: any }> => {
  const dbPayload: any = {}
  if (payload.name) dbPayload.subCatName = payload.name
  if (payload.category_id) dbPayload.category_id = payload.category_id
  if (payload.image_url !== undefined) {
    try {
      dbPayload.image_url = validateImageRef(payload.image_url, {
        allowLegacy: true,
        fieldName: "image_url",
      })
    } catch (error) {
      return { data: null, error: toValidationError(error) }
    }
  }

  const { data, error } = await supabase
    .from("sub_categories")
    .update(dbPayload)
    .eq("id", id)
    .select()
    .single()

  if (data) {
    data.name = data.subCatName
    data.image_url = data.image_url ?? null
  }
  return { data, error }
}

export const deleteSubCategory = async (
  id: number,
): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase
    .from("sub_categories")
    .delete()
    .eq("id", id)
  return { data, error }
}

// Helper functions for cascade operations
export const unlinkProductsFromCategory = async (
  categoryId: number,
): Promise<{ error: any }> => {
  const { error } = await supabase
    .from("products")
    .update({ category_id: null, sub_category_id: null })
    .eq("category_id", categoryId)
  return { error }
}

export const unlinkProductsFromSubCategory = async (
  subCategoryId: number,
): Promise<{ error: any }> => {
  const { error } = await supabase
    .from("products")
    .update({ sub_category_id: null })
    .eq("sub_category_id", subCategoryId)
  return { error }
}

// ============================================
// DUPLICATE PREVENTION FUNCTIONS
// ============================================

/**
 * Check if a product with the given name already exists
 * @param name Product name to check (case-insensitive)
 * @param excludeId Optional product ID to exclude from check (for edit mode)
 * @returns Product if found, null otherwise
 */
export const findProductByName = async (
  name: string,
  excludeId?: number | string,
): Promise<{ data: Product | null; error: any }> => {
  try {
    const trimmedName = name.trim().toLowerCase()

    let query = supabase.from("products").select("*").ilike("name", trimmedName)

    // Exclude specific ID if provided (for edit mode)
    if (excludeId) {
      query = query.neq("id", excludeId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      return { data: null, error }
    }

    return { data: (data as Product) ?? null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Check if a product with the given barcode already exists
 * @param barcode Barcode to check
 * @param excludeId Optional product ID to exclude from check (for edit mode)
 * @returns Product if found, null otherwise
 */
export const findProductByBarcode = async (
  barcode: string,
  excludeId?: number | string,
): Promise<{ data: Product | null; error: any }> => {
  try {
    if (!barcode || barcode.trim() === "") {
      return { data: null, error: null }
    }

    let query = supabase
      .from("products")
      .select("*")
      .eq("barcode", barcode.trim())

    // Exclude specific ID if provided (for edit mode)
    if (excludeId) {
      query = query.neq("id", excludeId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      return { data: null, error }
    }

    return { data: (data as Product) ?? null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Check for duplicate product by name OR barcode
 * @param name Product name
 * @param barcode Product barcode (optional)
 * @param excludeId Optional product ID to exclude from check (for edit mode)
 * @returns Duplicate product if found, null otherwise
 */
export const checkDuplicateProduct = async (
  name: string,
  barcode?: string,
  excludeId?: number | string,
): Promise<{
  data: Product | null
  error: any
  duplicateType?: "name" | "barcode"
}> => {
  try {
    // Check name first
    const nameCheck = await findProductByName(name, excludeId)
    if (nameCheck.error) {
      return { data: null, error: nameCheck.error }
    }
    if (nameCheck.data) {
      return { data: nameCheck.data, error: null, duplicateType: "name" }
    }

    // If barcode provided, check barcode
    if (barcode && barcode.trim() !== "") {
      const barcodeCheck = await findProductByBarcode(barcode, excludeId)
      if (barcodeCheck.error) {
        return { data: null, error: barcodeCheck.error }
      }
      if (barcodeCheck.data) {
        return {
          data: barcodeCheck.data,
          error: null,
          duplicateType: "barcode",
        }
      }
    }

    // No duplicates found
    return { data: null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Update stock quantity for a product
 * @param productId Product ID
 * @param additionalQuantity Quantity to add (can be negative to reduce)
 * @returns Updated product
 */
export const updateProductStock = async (
  productId: number | string,
  additionalQuantity: number,
): Promise<{ data: Product | null; error: any }> => {
  try {
    // First get current stock
    const { data: product, error: fetchError } = await getProductById(
      productId.toString(),
    )

    if (fetchError || !product) {
      return {
        data: null,
        error: fetchError || { message: "Product not found" },
      }
    }

    const currentStock = product.stock_quantity || product.quantity || 0
    const newStock = currentStock + additionalQuantity

    // Prevent negative stock
    if (newStock < 0) {
      return {
        data: null,
        error: { message: "Stock cannot be negative", code: "INVALID_STOCK" },
      }
    }

    // Update stock
    const { data, error } = await supabase
      .from("products")
      .update({ stock_quantity: newStock })
      .eq("id", productId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data: (data as Product) ?? null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Mark an order as shipped with tracking details
 * @param orderId Order ID
 * @param shippingDetails Shipping company and tracking ID
 * @returns Updated order
 */
export const shipOrder = async (
  orderId: number | string,
  shippingDetails: { shipping_company: string; tracking_id: string },
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "shipped",
        shipped_at: new Date().toISOString(),
        shipping_company: shippingDetails.shipping_company,
        tracking_id: shippingDetails.tracking_id,
      })
      .eq("id", orderId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Mark an order as delivered manually
 * @param orderId Order ID
 * @returns Updated order
 */
export const deliverOrder = async (
  orderId: number | string,
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "delivered",
        delivered_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// ============================================
// PACKING SESSION MANAGEMENT
// ============================================

/**
 * Create a new packing session for an order
 * @param orderId Order ID to start packing
 * @param adminEmail Admin user email starting the session
 * @returns Created packing session
 */
export const createPackingSession = async (
  orderId: number | string,
  adminEmail: string,
): Promise<{ data: any | null; error: any }> => {
  try {
    // Check for existing active session
    const { data: existingSession, error: checkError } = await supabase
      .from("packing_sessions")
      .select("*")
      .eq("order_id", orderId)
      .eq("status", "in_progress")
      .maybeSingle()

    if (checkError) {
      return { data: null, error: checkError }
    }

    // Return existing session if found
    if (existingSession) {
      return { data: existingSession, error: null }
    }

    // Create new session
    const { data, error } = await supabase
      .from("packing_sessions")
      .insert({
        order_id: orderId,
        admin_email: adminEmail,
        scan_progress: {},
        status: "in_progress",
      })
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    // Update order status to in_packing
    await supabase
      .from("orders")
      .update({ status: "in_packing" })
      .eq("id", orderId)

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Update scan progress for a packing session
 * @param sessionId Packing session ID
 * @param scanProgress Updated scan progress object
 * @returns Updated packing session
 */
export const updatePackingScanProgress = async (
  sessionId: number | string,
  scanProgress: Record<string, number>,
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("packing_sessions")
      .update({ scan_progress: scanProgress })
      .eq("id", sessionId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Complete a packing session
 * @param sessionId Packing session ID
 * @returns Completed packing session
 */
export const completePackingSession = async (
  sessionId: number | string,
): Promise<{ data: any | null; error: any }> => {
  try {
    // Get session to calculate duration
    const { data: session, error: fetchError } = await supabase
      .from("packing_sessions")
      .select("*")
      .eq("id", sessionId)
      .single()

    if (fetchError || !session) {
      return {
        data: null,
        error: fetchError || { message: "Session not found" },
      }
    }

    const startedAt = new Date(session.started_at)
    const completedAt = new Date()
    const durationMinutes = Math.round(
      (completedAt.getTime() - startedAt.getTime()) / 60000,
    )

    const { data, error } = await supabase
      .from("packing_sessions")
      .update({
        status: "completed",
        completed_at: completedAt.toISOString(),
        packing_duration_minutes: durationMinutes,
      })
      .eq("id", sessionId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    // Update order status to packed and set packed_at timestamp
    await supabase
      .from("orders")
      .update({
        status: "packed",
        packed_at: completedAt.toISOString(),
      })
      .eq("id", session.order_id)

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Cancel a packing session
 * @param sessionId Packing session ID
 * @returns Cancelled packing session
 */
export const cancelPackingSession = async (
  sessionId: number | string,
): Promise<{ data: any | null; error: any }> => {
  try {
    // Get session to revert order status
    const { data: session, error: fetchError } = await supabase
      .from("packing_sessions")
      .select("*")
      .eq("id", sessionId)
      .single()

    if (fetchError || !session) {
      return {
        data: null,
        error: fetchError || { message: "Session not found" },
      }
    }

    const { data, error } = await supabase
      .from("packing_sessions")
      .update({ status: "cancelled" })
      .eq("id", sessionId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    // Revert order status to paid
    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", session.order_id)

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Get active packing session for an order
 * @param orderId Order ID
 * @returns Active packing session or null
 */
export const getActivePackingSession = async (
  orderId: number | string,
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("packing_sessions")
      .select("*")
      .eq("order_id", orderId)
      .eq("status", "in_progress")
      .maybeSingle()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Get order statistics for dashboard
 * @returns Order statistics
 */
export const getOrderStatistics = async (): Promise<{
  data: any
  error: any
}> => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    // Get counts by status
    const { data: orders, error } = await supabase
      .from("orders")
      .select("status, total_amount, created_at")

    if (error) {
      return { data: null, error }
    }

    const stats = {
      total: orders?.length || 0,
      todayCount: orders?.filter((o) => o.created_at >= todayStr).length || 0,
      todayRevenue:
        orders
          ?.filter((o) => o.created_at >= todayStr)
          .reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
      pending: orders?.filter((o) => o.status === "pending").length || 0,
      paid: orders?.filter((o) => o.status === "paid").length || 0,
      inPacking: orders?.filter((o) => o.status === "in_packing").length || 0,
      packed: orders?.filter((o) => o.status === "packed").length || 0,
      shipped: orders?.filter((o) => o.status === "shipped").length || 0,
      delivered: orders?.filter((o) => o.status === "delivered").length || 0,
      cancelled: orders?.filter((o) => o.status === "cancelled").length || 0,
    }

    return { data: stats, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Get a single order by ID with all related details
 * @param orderId Order ID
 * @returns Order object
 */
export const getOrderById = async (
  orderId: number | string,
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateOrderStatus = async (
  orderId: number | string,
  status: string,
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const cancelOrder = async (
  orderId: number | string,
  reason: string,
): Promise<{ data: any | null; error: any }> => {
  try {
    // Try to update with cancellation_reason if column exists, otherwise just status
    // We'll assume the column might not exist and just update status for now to be safe,
    // or we can try to update it.
    // Let's just update status for now as per schema knowledge limitations.
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        // cancellation_reason: reason // Uncomment if column exists
      })
      .eq("id", orderId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
