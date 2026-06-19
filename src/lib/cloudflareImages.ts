import { auth } from "@/lib/firebase"

export type CfVariant = "thumb" | "medium" | "full"

export const PLACEHOLDER_SRC = "/placeholder.svg"

const warned = new Set<string>()
const warnOnce = (key: string, message: string, meta?: unknown) => {
  if (!import.meta.env.DEV) return
  if (warned.has(key)) return
  warned.add(key)
  console.warn(message, meta)
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SLUG_RE = /^[a-zA-Z0-9_-]{24,64}$/
const hasSlugSeparator = (value: string) => /[-_]/.test(value)
const shouldAllowSlugIds = () => {
  const raw = (import.meta.env.VITE_CF_IMAGES_ALLOW_SLUG_IDS as
    | string
    | undefined)?.trim()
  if (!raw) return true
  return raw.toLowerCase() === "true"
}

export function isLikelyCfImageId(ref: string): boolean {
  const trimmed = ref.trim()
  if (!trimmed) return false
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
    return false
  if (/[/?#.]/.test(trimmed)) return false
  if (UUID_RE.test(trimmed)) return true

  if (!shouldAllowSlugIds()) return false

  const ok = SLUG_RE.test(trimmed) && hasSlugSeparator(trimmed)
  if (ok) {
    warnOnce(
      `cf_slug_id:${trimmed}`,
      "[cloudflareImages] Non-UUID image id detected. Prefer using Cloudflare UUID ids to avoid misclassification during migration.",
      { ref: trimmed },
    )
  }
  return ok
}

export function isCloudflareId(ref: string): boolean {
  return isLikelyCfImageId(ref)
}

const normalizeBase = (base: string) => base.replace(/\/+$/, "")
const isSupabaseStorageUrl = (ref: string) =>
  ref.includes("/storage/v1/object/public")

const shouldAllowLegacySupabaseUrls = () => {
  const raw = (import.meta.env.VITE_CF_IMAGES_ALLOW_SUPABASE_LEGACY_URLS as
    | string
    | undefined)?.trim()
  if (!raw) return true
  return raw.toLowerCase() === "true"
}

function cfVariantUrl(id: string, variant: CfVariant): string {
  const trimmedId = id.trim()
  if (!isLikelyCfImageId(trimmedId)) return PLACEHOLDER_SRC

  const accountHash = (import.meta.env.VITE_CF_IMAGES_HASH as string | undefined)
    ?.trim()

  const base = accountHash
    ? normalizeBase(`https://imagedelivery.net/${accountHash}`)
    : ""

  if (!base) {
    warnOnce(
      "cf_missing_env",
      "[cloudflareImages] Missing VITE_CF_IMAGES_HASH. Cloudflare image ids will render as placeholder in this environment.",
      { variant, id: trimmedId },
    )
    return PLACEHOLDER_SRC
  }
  return `${base}/${trimmedId}/${variant}`
}

type SecureFunctionResponse = {
  imageId?: string
  error?: string
}

const FUNCTIONS_TIMEOUT_MS = 60_000

async function getFirebaseAuthHeader(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken(true)
  if (!token) {
    throw new Error("Admin authentication required to upload product images")
  }
  return { Authorization: `Bearer ${token}` }
}

function functionUrl(functionName: string): string {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
    ?.trim()
    .replace(/\/+$/, "")
  if (!supabaseUrl) {
    throw new Error("VITE_SUPABASE_URL is required for image uploads")
  }
  return `${supabaseUrl}/functions/v1/${functionName}`
}

async function invokeImageFunction(
  functionName: string,
  body: BodyInit,
  contentType?: string,
): Promise<SecureFunctionResponse> {
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
    ?.trim()
  if (!anonKey) {
    throw new Error("VITE_SUPABASE_ANON_KEY is required for image uploads")
  }

  const authHeader = await getFirebaseAuthHeader()
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), FUNCTIONS_TIMEOUT_MS)

  try {
    const headers: Record<string, string> = {
      apikey: anonKey,
      ...authHeader,
    }
    if (contentType) headers["Content-Type"] = contentType

    const response = await fetch(functionUrl(functionName), {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    })
    const data = (await response.json().catch(() => ({}))) as SecureFunctionResponse

    if (!response.ok) {
      throw new Error(data.error || `Image function failed with ${response.status}`)
    }

    return data
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Cloudflare image upload timed out. Check Edge Function logs and secrets.")
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export async function uploadImageToCloudflare(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const data = await invokeImageFunction(
    "cloudflare-image-upload",
    formData,
  )

  if (!data.imageId) {
    throw new Error(data.error || "Cloudflare Images upload failed")
  }

  return data.imageId
}

export async function deleteImageFromCloudflare(
  imageId: string,
): Promise<void> {
  const trimmedId = imageId.trim()
  if (!isCloudflareId(trimmedId)) {
    throw new Error("Invalid Cloudflare Image ID")
  }

  const data = await invokeImageFunction(
    "cloudflare-image-delete",
    JSON.stringify({ imageId: trimmedId }),
    "application/json",
  )

  if (data.error) {
    throw new Error(data.error)
  }
}

export function resolveImageSrc(
  imageRef: string | null | undefined,
  variant: CfVariant,
): string {
  const trimmed = (imageRef ?? "").trim()
  if (!trimmed) return PLACEHOLDER_SRC

  if (isLikelyCfImageId(trimmed)) return cfVariantUrl(trimmed, variant)

  // Local/Vite/static URLs: keep unchanged.
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed
  }

  // Temporary fallback during migration:
  // keep existing http(s) URLs unchanged (including Supabase URLs).
  //
  // TODO: After migration is complete, remove this fallback and enforce
  // Cloudflare-only delivery for all product image refs.
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    if (isSupabaseStorageUrl(trimmed) && !shouldAllowLegacySupabaseUrls()) {
      warnOnce(
        `blocked_supabase_storage:${trimmed}`,
        "[cloudflareImages] Supabase Storage image URL blocked. Migrate this ref to a Cloudflare image id.",
        { ref: trimmed, variant },
      )
      return PLACEHOLDER_SRC
    }
    return trimmed
  }

  warnOnce(
    `unhandled_ref:${trimmed}`,
    "[cloudflareImages] Unhandled image ref; rendering placeholder. This may indicate a migration or data issue.",
    { ref: trimmed, variant },
  )
  return PLACEHOLDER_SRC
}
