import { supabase } from "@/lib/supabaseClient"

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_order_amount: number
  max_discount_amount: number | null
  usage_limit: number | null
  used_count: number
  starts_at: string
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export const getCoupons = async (): Promise<Coupon[]> => {
  const { data, error } = await (supabase as any)
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Coupon[]
}

export const createCoupon = async (
  payload: Omit<Coupon, "id" | "used_count" | "created_at" | "starts_at">
): Promise<Coupon> => {
  const { data, error } = await (supabase as any)
    .from("coupons")
    .insert([{ ...payload, code: payload.code.toUpperCase().trim() }])
    .select()
    .single()
  if (error) throw error
  return data as Coupon
}

export const updateCoupon = async (
  id: string,
  payload: Partial<Omit<Coupon, "id" | "used_count" | "created_at">>
): Promise<Coupon> => {
  const { data, error } = await (supabase as any)
    .from("coupons")
    .update(payload)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as Coupon
}

export const deleteCoupon = async (id: string): Promise<void> => {
  const { error } = await (supabase as any)
    .from("coupons")
    .delete()
    .eq("id", id)
  if (error) throw error
}

export const toggleCouponActive = async (
  id: string,
  currentActive: boolean
): Promise<void> => {
  const { error } = await (supabase as any)
    .from("coupons")
    .update({ is_active: !currentActive })
    .eq("id", id)
  if (error) throw error
}

export const getActiveCouponsCount = async (): Promise<number> => {
  const { count, error } = await (supabase as any)
    .from("coupons")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
  if (error) return 0
  return count || 0
}
