import { supabase } from "@/lib/supabaseClient"

export interface ContactInquiry {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: "new" | "solved" | "ignored"
  created_at: string
}

export const getInquiries = async (
  filter: string = "all",
  search: string = "",
  page: number = 1,
  itemsPerPage: number = 15
): Promise<{ data: ContactInquiry[]; count: number }> => {
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  let query = (supabase as any)
    .from("contact_inquiries")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (filter !== "all") {
    query = query.eq("status", filter)
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query

  if (error) throw error
  return { data: (data as ContactInquiry[]) || [], count: count || 0 }
}

export const updateInquiryStatus = async (
  id: string,
  status: "new" | "solved" | "ignored"
): Promise<void> => {
  const { error } = await (supabase as any)
    .from("contact_inquiries")
    .update({ status })
    .eq("id", id)
  if (error) throw error
}

export const getNewInquiriesCount = async (): Promise<number> => {
  const { count, error } = await (supabase as any)
    .from("contact_inquiries")
    .select("*", { count: "exact", head: true })
    .eq("status", "new")
  if (error) return 0
  return count || 0
}

export const createInquiry = async (
  payload: Omit<ContactInquiry, "id" | "status" | "created_at">
): Promise<ContactInquiry> => {
  const { data, error } = await (supabase as any)
    .from("contact_inquiries")
    .insert([{ ...payload, status: "new" }])
    .select()
    .single()
  if (error) throw error
  return data as ContactInquiry
}
