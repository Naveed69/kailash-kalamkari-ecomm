import { supabase } from "@/backend/supabase/client"

export const getCategories = async (): Promise<{
  data: any[] | null
  error: any
}> => {
  const { data, error } = await supabase.from("categories").select("*")
  return { data: data ?? null, error }
}

export const getSubCategories = async (): Promise<{
  data: any[] | null
  error: any
}> => {
  const { data, error } = await supabase.from("sub_categories").select("*")

  const mappedData =
    data?.map((item) => ({
      ...item,
      name: item.subCatName,
      image_url: item.image_url ?? null,
    })) || null

  return { data: mappedData, error }
}

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
  payload: { name?: string; description?: string }
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
  id: number
): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
  return { data, error }
}

export const createSubCategory = async (payload: {
  name: string
  description?: string
  category_id: number
  image_url?: string | null
}): Promise<{ data: any | null; error: any }> => {
  const dbPayload = {
    subCatName: payload.name,
    category_id: payload.category_id,
    image_url: payload.image_url ?? null,
  }
  const { data, error } = await supabase
    .from("sub_categories")
    .insert([dbPayload])
    .select()
    .single()

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
  }
): Promise<{ data: any | null; error: any }> => {
  const dbPayload: any = {}
  if (payload.name) dbPayload.subCatName = payload.name
  if (payload.category_id) dbPayload.category_id = payload.category_id
  if (payload.image_url !== undefined) dbPayload.image_url = payload.image_url

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
  id: number
): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase
    .from("sub_categories")
    .delete()
    .eq("id", id)
  return { data, error }
}

export const unlinkProductsFromCategory = async (
  categoryId: number
): Promise<{ error: any }> => {
  const { error } = await supabase
    .from("products")
    .update({ category_id: null, sub_category_id: null })
    .eq("category_id", categoryId)
  return { error }
}

export const unlinkProductsFromSubCategory = async (
  subCategoryId: number
): Promise<{ error: any }> => {
  const { error } = await supabase
    .from("products")
    .update({ sub_category_id: null })
    .eq("sub_category_id", subCategoryId)
  return { error }
}
