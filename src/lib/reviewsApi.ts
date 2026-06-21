import { supabase } from "@/lib/supabaseClient"

export interface Review {
  id: string
  product_id: number | null
  product_name?: string
  customer_name: string
  rating: number
  title: string | null
  content: string | null
  is_approved: boolean
  is_featured: boolean
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
}

export const getAllReviews = async (): Promise<Review[]> => {
  const { data, error } = await (supabase as any)
    .from("reviews")
    .select("*, products(name)")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data || []).map((r: any) => ({
    ...r,
    product_name: r.products?.name || null,
  })) as Review[]
}

export const approveReview = async (id: string): Promise<void> => {
  const { error } = await (supabase as any)
    .from("reviews")
    .update({ is_approved: true })
    .eq("id", id)
  if (error) throw error
}

export const toggleReviewFeatured = async (
  id: string,
  currentFeatured: boolean
): Promise<void> => {
  const { error } = await (supabase as any)
    .from("reviews")
    .update({ is_featured: !currentFeatured })
    .eq("id", id)
  if (error) throw error
}

export const deleteReview = async (id: string): Promise<void> => {
  const { error } = await (supabase as any)
    .from("reviews")
    .delete()
    .eq("id", id)
  if (error) throw error
}

export const getPendingReviewsCount = async (): Promise<number> => {
  const { count, error } = await (supabase as any)
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("is_approved", false)
  if (error) return 0
  return count || 0
}
