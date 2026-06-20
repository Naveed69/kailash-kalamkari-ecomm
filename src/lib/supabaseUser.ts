import type { User } from "firebase/auth"
import { supabase } from "@/lib/supabaseClient"
import { getDbUserId, getUserPhone } from "@/lib/userIdentity"

type UserDetails = {
  name?: string | null
  email?: string | null
  phone?: string | null
}

type MissingColumnResult = {
  error: { message?: string } | null
} & Record<string, unknown>

const getErrorMessage = (error: unknown) => {
  if (!error || typeof error !== "object" || !("message" in error)) return null
  const message = (error as { message?: unknown }).message
  return typeof message === "string" ? message : null
}

export const getMissingColumn = (error: unknown): string | null => {
  const message = getErrorMessage(error)
  if (!message) return null
  const match = message.match(/Could not find the '(.+?)' column/)
  return match?.[1] ?? null
}

export const withMissingColumnFallback = async (
  payload: Record<string, unknown>,
  run: (payload: Record<string, unknown>) => Promise<MissingColumnResult>,
) => {
  let currentPayload = payload
  const removedColumns = new Set<string>()

  while (true) {
    const result = await run(currentPayload)

    if (!result.error) return result

    const missingColumn = getMissingColumn(result.error)
    if (
      !missingColumn ||
      removedColumns.has(missingColumn) ||
      !(missingColumn in currentPayload)
    ) {
      return result
    }

    removedColumns.add(missingColumn)
    const nextPayload = { ...currentPayload }
    delete nextPayload[missingColumn]
    currentPayload = nextPayload
  }
}

const upsertWithMissingColumnFallback = async (
  table: string,
  payload: Record<string, unknown>,
  onConflict = "id",
) =>
  withMissingColumnFallback(payload, (currentPayload) =>
    supabase.from(table).upsert(currentPayload, { onConflict }),
  )

export const ensureSupabaseUser = async (
  user: User | null | undefined,
  details: UserDetails = {},
) => {
  const dbUserId = getDbUserId(user)
  if (!dbUserId) return null

  const email = details.email ?? user?.email ?? null
  const phone = details.phone ?? getUserPhone(user) ?? null
  const name = details.name ?? user?.displayName ?? null

  const profileResult = await upsertWithMissingColumnFallback("profiles", {
    id: dbUserId,
    email,
    full_name: name,
    phone,
    updated_at: new Date().toISOString(),
  })

  if (!profileResult.error) return dbUserId

  console.log(
    "Upsert to profiles failed, trying users table...",
    getErrorMessage(profileResult.error),
  )

  const userResult = await upsertWithMissingColumnFallback("users", {
    id: dbUserId,
    email,
    name,
    phone_number: phone,
    phone,
    updated_at: new Date().toISOString(),
  })

  if (userResult.error) {
    console.error("Failed to ensure user exists in public tables:", userResult.error)
  }

  return dbUserId
}
