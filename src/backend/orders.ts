import { supabase } from "@/backend/supabase/client"

export const shipOrder = async (
  orderId: number | string,
  shippingDetails: { shipping_company: string; tracking_id: string }
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

export const deliverOrder = async (
  orderId: number | string
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

export const createPackingSession = async (
  orderId: number | string,
  adminEmail: string
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data: existingSession, error: checkError } = await supabase
      .from("packing_sessions")
      .select("*")
      .eq("order_id", orderId)
      .eq("status", "in_progress")
      .maybeSingle()

    if (checkError) {
      return { data: null, error: checkError }
    }

    if (existingSession) {
      return { data: existingSession, error: null }
    }

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

    await supabase
      .from("orders")
      .update({ status: "in_packing" })
      .eq("id", orderId)

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const updatePackingScanProgress = async (
  sessionId: number | string,
  scanProgress: Record<string, number>
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

export const completePackingSession = async (
  sessionId: number | string
): Promise<{ data: any | null; error: any }> => {
  try {
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
      (completedAt.getTime() - startedAt.getTime()) / 60000
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

export const cancelPackingSession = async (
  sessionId: number | string
): Promise<{ data: any | null; error: any }> => {
  try {
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

    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", session.order_id)

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const getActivePackingSession = async (
  orderId: number | string
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

export const getOrderStatistics = async (): Promise<{
  data: any
  error: any
}> => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

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

export const getOrderById = async (
  orderId: number | string
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
  status: string
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
  reason: string
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
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
