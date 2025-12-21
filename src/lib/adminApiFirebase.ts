import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getStorage } from "firebase/storage";
import type { Product } from "@/components/ProductCard";

const storage = getStorage();

// Helper function to convert Firestore data to Product type
const convertFirestoreData = (firestoreData: any): Product => {
  return {
    ...firestoreData,
    id: firestoreData.id,
    createdAt: firestoreData.createdAt?.toDate?.() || firestoreData.created_at || new Date(),
    updatedAt: firestoreData.updatedAt?.toDate?.() || firestoreData.updated_at || new Date(),
  };
};

// Helper function to prepare data for Firestore
const prepareDataForFirestore = (data: any) => {
  const prepared = { ...data };
  
  // Convert dates to Firestore timestamps
  if (prepared.createdAt && !(prepared.createdAt instanceof Timestamp)) {
    prepared.createdAt = new Date(prepared.createdAt);
  }
  if (prepared.updatedAt && !(prepared.updatedAt instanceof Timestamp)) {
    prepared.updatedAt = new Date(prepared.updatedAt);
  }
  
  // Remove id field as it's handled by Firestore
  delete prepared.id;
  
  return prepared;
};

const sanitizePayload = (payload: Partial<Product>) => {
  const p: any = { ...payload };
  // remove undefined fields
  Object.keys(p).forEach((k) => p[k] === undefined && delete p[k]);

  // coerce numeric fields
  if (p.price !== undefined) p.price = p.price === "" ? null : Number(p.price);
  if (p.originalPrice !== undefined)
    p.originalPrice = p.originalPrice === "" ? null : Number(p.originalPrice);

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
      p.colors = p.colors
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    } else if (!Array.isArray(p.colors)) {
      p.colors = [String(p.colors)];
    }
  }

  // inStock to boolean
  if (p.inStock !== undefined) p.inStock = Boolean(p.inStock);

  // Add timestamps
  p.createdAt = serverTimestamp();
  p.updatedAt = serverTimestamp();

  return p;
};

// Keep typings simple to avoid complex generic constraints from Firebase client
export const getProducts = async (): Promise<{
  data: Product[] | null;
  error: any;
}> => {
  try {
    const productsCollection = collection(db, "products");
    const querySnapshot = await getDocs(productsCollection);
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { data: products as Product[], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getProductById = async (
  id: string
): Promise<{ data: Product | null; error: any }> => {
  try {
    const productDoc = doc(db, "products", id);
    const productSnapshot = await getDoc(productDoc);
    
    if (!productSnapshot.exists()) {
      return {
        data: null,
        error: { message: "Product not found", code: "NOT_FOUND", status: 404 },
      };
    }
    
    const product = {
      id: productSnapshot.id,
      ...productSnapshot.data()
    };
    
    return { data: product as Product, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const createProduct = async (
  payload: Partial<Product>
): Promise<{ data: Product | null; error: any }> => {
  try {
    const sanitized = sanitizePayload(payload);
    const productsCollection = collection(db, "products");
    const docRef = await addDoc(productsCollection, sanitized);
    
    const newProduct = {
      id: docRef.id,
      ...sanitized
    };
    
    return { data: newProduct as Product, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        status: 400,
      },
    };
  }
};

export const updateProduct = async (
  id: string,
  payload: Partial<Product>
): Promise<{ data: Product | null; error: any }> => {
  try {
    const sanitized = sanitizePayload(payload);
    delete sanitized.createdAt; // Don't update creation time
    
    const productDoc = doc(db, "products", id);
    await updateDoc(productDoc, sanitized);
    
    // Get updated document
    const updatedSnapshot = await getDoc(productDoc);
    if (!updatedSnapshot.exists()) {
      return {
        data: null,
        error: { message: "Product not found", code: "NOT_FOUND", status: 404 },
      };
    }
    
    const updatedProduct = {
      id: updatedSnapshot.id,
      ...updatedSnapshot.data()
    };
    
    return { data: updatedProduct as Product, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        status: 400,
      },
    };
  }
};

export const deleteProduct = async (
  id: string
): Promise<{ data: any; error: any }> => {
  try {
    const productDoc = doc(db, "products", id);
    await deleteDoc(productDoc);
    return { data: { id }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getCategories = async (): Promise<{
  data: any[] | null;
  error: any;
}> => {
  try {
    const categoriesCollection = collection(db, "categories");
    const querySnapshot = await getDocs(categoriesCollection);
    const categories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { data: categories, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Fetch all sub categories from database
export const getSubCategories = async (): Promise<{
  data: any[] | null;
  error: any;
}> => {
  try {
    const subCategoriesCollection = collection(db, "subCategories");
    const querySnapshot = await getDocs(subCategoriesCollection);
    
    const mappedData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      name: doc.data().subCatName || doc.data().name,
      image_url: doc.data().image_url ?? null,
    }));
    
    return { data: mappedData, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const uploadImage = async (
  file: File
): Promise<{ url: string | null; error: any }> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()
      .toString(36)
      .substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;
    const storageRef = ref(storage, filePath);

    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    
    return { url, error: null };
  } catch (error: any) {
    return { url: null, error };
  }
};

// Category CRUD operations
export const createCategory = async (payload: {
  name: string;
  description?: string;
}): Promise<{ data: any | null; error: any }> => {
  try {
    const categoriesCollection = collection(db, "categories");
    const docRef = await addDoc(categoriesCollection, {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const newCategory = {
      id: docRef.id,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return { data: newCategory, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateCategory = async (
  id: number,
  payload: { name?: string; description?: string }
): Promise<{ data: any | null; error: any }> => {
  try {
    const categoryDoc = doc(db, "categories", id.toString());
    await updateDoc(categoryDoc, {
      ...payload,
      updatedAt: serverTimestamp()
    });
    
    const updatedSnapshot = await getDoc(categoryDoc);
    const updatedCategory = {
      id: updatedSnapshot.id,
      ...updatedSnapshot.data()
    };
    
    return { data: updatedCategory, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const deleteCategory = async (
  id: number
): Promise<{ data: any; error: any }> => {
  try {
    const categoryDoc = doc(db, "categories", id.toString());
    await deleteDoc(categoryDoc);
    return { data: { id }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// SubCategory CRUD operations
export const createSubCategory = async (payload: {
  name: string;
  description?: string;
  category_id: number;
  image_url?: string | null;
}): Promise<{ data: any | null; error: any }> => {
  try {
    const subCategoriesCollection = collection(db, "subCategories");
    const docRef = await addDoc(subCategoriesCollection, {
      ...payload,
      subCatName: payload.name, // Keep both for compatibility
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const newSubCategory = {
      id: docRef.id,
      ...payload,
      subCatName: payload.name,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return { data: newSubCategory, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateSubCategory = async (
  id: number,
  payload: {
    name?: string;
    description?: string;
    category_id?: number;
    image_url?: string | null;
  }
): Promise<{ data: any | null; error: any }> => {
  try {
    const subCategoryDoc = doc(db, "subCategories", id.toString());
    const updatePayload: any = { ...payload, updatedAt: serverTimestamp() };
    
    if (payload.name) {
      updatePayload.subCatName = payload.name;
    }
    
    await updateDoc(subCategoryDoc, updatePayload);
    
    const updatedSnapshot = await getDoc(subCategoryDoc);
    const updatedSubCategory = {
      id: updatedSnapshot.id,
      ...updatedSnapshot.data(),
      name: updatedSnapshot.data().subCatName || updatedSnapshot.data().name
    };
    
    return { data: updatedSubCategory, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const deleteSubCategory = async (
  id: number
): Promise<{ data: any; error: any }> => {
  try {
    const subCategoryDoc = doc(db, "subCategories", id.toString());
    await deleteDoc(subCategoryDoc);
    return { data: { id }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Helper functions for cascade operations
export const unlinkProductsFromCategory = async (
  categoryId: number
): Promise<{ error: any }> => {
  try {
    const productsCollection = collection(db, "products");
    const q = query(productsCollection, where("category_id", "==", categoryId));
    const querySnapshot = await getDocs(q);
    
    const batch = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { category_id: null, sub_category_id: null, updatedAt: serverTimestamp() })
    );
    
    await Promise.all(batch);
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const unlinkProductsFromSubCategory = async (
  subCategoryId: number
): Promise<{ error: any }> => {
  try {
    const productsCollection = collection(db, "products");
    const q = query(productsCollection, where("sub_category_id", "==", subCategoryId));
    const querySnapshot = await getDocs(q);
    
    const batch = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { sub_category_id: null, updatedAt: serverTimestamp() })
    );
    
    await Promise.all(batch);
    return { error: null };
  } catch (error) {
    return { error };
  }
};

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
  excludeId?: number | string
): Promise<{ data: Product | null; error: any }> => {
  try {
    const trimmedName = name.trim().toLowerCase();
    const productsCollection = collection(db, "products");
    let q = query(productsCollection, where("nameLower", "==", trimmedName));
    
    if (excludeId) {
      q = query(q, where("__name__", "!=", excludeId.toString()));
    }
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { data: null, error: null };
    }
    
    const product = {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    };
    
    return { data: product as Product, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Check if a product with the given barcode already exists
 * @param barcode Barcode to check
 * @param excludeId Optional product ID to exclude from check (for edit mode)
 * @returns Product if found, null otherwise
 */
export const findProductByBarcode = async (
  barcode: string,
  excludeId?: number | string
): Promise<{ data: Product | null; error: any }> => {
  try {
    if (!barcode || barcode.trim() === "") {
      return { data: null, error: null };
    }
    
    const productsCollection = collection(db, "products");
    let q = query(productsCollection, where("barcode", "==", barcode.trim()));
    
    if (excludeId) {
      q = query(q, where("__name__", "!=", excludeId.toString()));
    }
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { data: null, error: null };
    }
    
    const product = {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    };
    
    return { data: product as Product, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

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
  excludeId?: number | string
): Promise<{
  data: Product | null;
  error: any;
  duplicateType?: "name" | "barcode";
}> => {
  try {
    // Check name first
    const nameCheck = await findProductByName(name, excludeId);
    if (nameCheck.error) {
      return { data: null, error: nameCheck.error };
    }
    if (nameCheck.data) {
      return { data: nameCheck.data, error: null, duplicateType: "name" };
    }
    
    // If barcode provided, check barcode
    if (barcode && barcode.trim() !== "") {
      const barcodeCheck = await findProductByBarcode(barcode, excludeId);
      if (barcodeCheck.error) {
        return { data: null, error: barcodeCheck.error };
      }
      if (barcodeCheck.data) {
        return {
          data: barcodeCheck.data,
          error: null,
          duplicateType: "barcode",
        };
      }
    }
    
    // No duplicates found
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update stock quantity for a product
 * @param productId Product ID
 * @param additionalQuantity Quantity to add (can be negative to reduce)
 * @returns Updated product
 */
export const updateProductStock = async (
  productId: number | string,
  additionalQuantity: number
): Promise<{ data: Product | null; error: any }> => {
  try {
    const productDoc = doc(db, "products", productId.toString());
    const productSnapshot = await getDoc(productDoc);
    
    if (!productSnapshot.exists()) {
      return {
        data: null,
        error: { message: "Product not found" },
      };
    }
    
    const product = productSnapshot.data();
    const currentStock = product.stock_quantity || product.quantity || 0;
    const newStock = currentStock + additionalQuantity;
    
    // Prevent negative stock
    if (newStock < 0) {
      return {
        data: null,
        error: { message: "Stock cannot be negative", code: "INVALID_STOCK" },
      };
    }
    
    await updateDoc(productDoc, { 
      stock_quantity: newStock, 
      updatedAt: serverTimestamp() 
    });
    
    const updatedSnapshot = await getDoc(productDoc);
    const updatedProduct = {
      id: updatedSnapshot.id,
      ...updatedSnapshot.data()
    };
    
    return { data: updatedProduct as Product, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Mark an order as shipped with tracking details
 * @param orderId Order ID
 * @param shippingDetails Shipping company and tracking ID
 * @returns Updated order
 */
export const shipOrder = async (
  orderId: number | string,
  shippingDetails: { shipping_company: string; tracking_id: string }
): Promise<{ data: any | null; error: any }> => {
  try {
    const orderDoc = doc(db, "orders", orderId.toString());
    await updateDoc(orderDoc, {
      status: "shipped",
      shipped_at: serverTimestamp(),
      shipping_company: shippingDetails.shipping_company,
      tracking_id: shippingDetails.tracking_id,
      updatedAt: serverTimestamp()
    });
    
    const updatedSnapshot = await getDoc(orderDoc);
    const updatedOrder = {
      id: updatedSnapshot.id,
      ...updatedSnapshot.data()
    };
    
    return { data: updatedOrder, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Mark an order as delivered manually
 * @param orderId Order ID
 * @returns Updated order
 */
export const deliverOrder = async (
  orderId: number | string
): Promise<{ data: any | null; error: any }> => {
  try {
    const orderDoc = doc(db, "orders", orderId.toString());
    await updateDoc(orderDoc, {
      status: "delivered",
      delivered_at: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const updatedSnapshot = await getDoc(orderDoc);
    const updatedOrder = {
      id: updatedSnapshot.id,
      ...updatedSnapshot.data()
    };
    
    return { data: updatedOrder, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

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
  adminEmail: string
): Promise<{ data: any | null; error: any }> => {
  try {
    // Check for existing active session
    const packingSessionsCollection = collection(db, "packingSessions");
    const q = query(
      packingSessionsCollection,
      where("order_id", "==", orderId),
      where("status", "==", "in_progress")
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const existingSession = {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      };
      return { data: existingSession, error: null };
    }
    
    // Create new session
    const docRef = await addDoc(packingSessionsCollection, {
      order_id: orderId,
      admin_email: adminEmail,
      scan_progress: {},
      status: "in_progress",
      started_at: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const newSession = {
      id: docRef.id,
      order_id: orderId,
      admin_email: adminEmail,
      scan_progress: {},
      status: "in_progress",
      started_at: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Update order status to in_packing
    const orderDoc = doc(db, "orders", orderId.toString());
    await updateDoc(orderDoc, { 
      status: "in_packing", 
      updatedAt: serverTimestamp() 
    });
    
    return { data: newSession, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update scan progress for a packing session
 * @param sessionId Packing session ID
 * @param scanProgress Updated scan progress object
 * @returns Updated packing session
 */
export const updatePackingScanProgress = async (
  sessionId: number | string,
  scanProgress: Record<string, number>
): Promise<{ data: any | null; error: any }> => {
  try {
    const sessionDoc = doc(db, "packingSessions", sessionId.toString());
    await updateDoc(sessionDoc, { 
      scan_progress: scanProgress,
      updatedAt: serverTimestamp()
    });
    
    const updatedSnapshot = await getDoc(sessionDoc);
    const updatedSession = {
      id: updatedSnapshot.id,
      ...updatedSnapshot.data()
    };
    
    return { data: updatedSession, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Complete a packing session
 * @param sessionId Packing session ID
 * @returns Completed packing session
 */
export const completePackingSession = async (
  sessionId: number | string
): Promise<{ data: any | null; error: any }> => {
  try {
    const sessionDoc = doc(db, "packingSessions", sessionId.toString());
    const sessionSnapshot = await getDoc(sessionDoc);
    
    if (!sessionSnapshot.exists()) {
      return {
        data: null,
        error: { message: "Session not found" },
      };
    }
    
    const session = sessionSnapshot.data();
    const startedAt = session.started_at?.toDate?.() || new Date(session.started_at);
    const completedAt = new Date();
    const durationMinutes = Math.round(
      (completedAt.getTime() - startedAt.getTime()) / 60000
    );
    
    await updateDoc(sessionDoc, {
      status: "completed",
      completed_at: serverTimestamp(),
      packing_duration_minutes: durationMinutes,
      updatedAt: serverTimestamp()
    });
    
    const updatedSnapshot = await getDoc(sessionDoc);
    const updatedSession = {
      id: updatedSnapshot.id,
      ...updatedSnapshot.data()
    };
    
    // Update order status to packed
    const orderDoc = doc(db, "orders", session.order_id.toString());
    await updateDoc(orderDoc, {
      status: "packed",
      packed_at: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { data: updatedSession, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Cancel a packing session
 * @param sessionId Packing session ID
 * @returns Cancelled packing session
 */
export const cancelPackingSession = async (
  sessionId: number | string
): Promise<{ data: any | null; error: any }> => {
  try {
    const sessionDoc = doc(db, "packingSessions", sessionId.toString());
    const sessionSnapshot = await getDoc(sessionDoc);
    
    if (!sessionSnapshot.exists()) {
      return {
        data: null,
        error: { message: "Session not found" },
      };
    }
    
    const session = sessionSnapshot.data();
    
    await updateDoc(sessionDoc, {
      status: "cancelled",
      updatedAt: serverTimestamp()
    });
    
    const updatedSnapshot = await getDoc(sessionDoc);
    const updatedSession = {
      id: updatedSnapshot.id,
      ...updatedSnapshot.data()
    };
    
    // Revert order status to paid
    const orderDoc = doc(db, "orders", session.order_id.toString());
    await updateDoc(orderDoc, {
      status: "paid",
      updatedAt: serverTimestamp()
    });
    
    return { data: updatedSession, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get active packing session for an order
 * @param orderId Order ID
 * @returns Active packing session or null
 */
export const getActivePackingSession = async (
  orderId: number | string
): Promise<{ data: any | null; error: any }> => {
  try {
    const packingSessionsCollection = collection(db, "packingSessions");
    const q = query(
      packingSessionsCollection,
      where("order_id", "==", orderId),
      where("status", "==", "in_progress")
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { data: null, error: null };
    }
    
    const session = {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    };
    
    return { data: session, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get order statistics for dashboard
 * @returns Order statistics
 */
export const getOrderStatistics = async (): Promise<{
  data: any;
  error: any;
}> => {
  try {
    const ordersCollection = collection(db, "orders");
    const querySnapshot = await getDocs(ordersCollection);
    const orders = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at || data.createdAt?.toDate?.() || new Date(),
        total_amount: data.total_amount || 0,
        status: data.status || 'pending'
      };
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    
    const stats = {
      total: orders.length,
      todayCount: orders.filter((o) => o.created_at >= todayStr).length,
      todayRevenue: orders
        .filter((o) => o.created_at >= todayStr)
        .reduce((sum, o) => sum + (o.total_amount || 0), 0),
      pending: orders.filter((o) => o.status === "pending").length,
      paid: orders.filter((o) => o.status === "paid").length,
      inPacking: orders.filter((o) => o.status === "in_packing").length,
      packed: orders.filter((o) => o.status === "packed").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
    
    return { data: stats, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get a single order by ID with all related details
 * @param orderId Order ID
 * @returns Order object
 */
export const getOrderById = async (
  orderId: number | string
): Promise<{ data: any | null; error: any }> => {
  try {
    const orderDoc = doc(db, "orders", orderId.toString());
    const orderSnapshot = await getDoc(orderDoc);
    
    if (!orderSnapshot.exists()) {
      return { data: null, error: { message: "Order not found" } };
    }
    
    const order = {
      id: orderSnapshot.id,
      ...orderSnapshot.data()
    };
    
    return { data: order, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateOrderStatus = async (
  orderId: number | string,
  status: string
): Promise<{ data: any | null; error: any }> => {
  try {
    const orderDoc = doc(db, "orders", orderId.toString());
    await updateDoc(orderDoc, { 
      status,
      updatedAt: serverTimestamp()
    });
    
    const updatedSnapshot = await getDoc(orderDoc);
    const updatedOrder = {
      id: updatedSnapshot.id,
      ...updatedSnapshot.data()
    };
    
    return { data: updatedOrder, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const cancelOrder = async (
  orderId: number | string,
  reason: string
): Promise<{ data: any | null; error: any }> => {
  try {
    const orderDoc = doc(db, "orders", orderId.toString());
    await updateDoc(orderDoc, {
      status: "cancelled",
      cancellation_reason: reason,
      updatedAt: serverTimestamp()
    });
    
    const updatedSnapshot = await getDoc(orderDoc);
    const updatedOrder = {
      id: updatedSnapshot.id,
      ...updatedSnapshot.data()
    };
    
    return { data: updatedOrder, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
