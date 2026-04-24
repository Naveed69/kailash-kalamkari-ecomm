export type CfVariant = "thumb" | "medium" | "full"

export const PLACEHOLDER_SRC = "/placeholder.svg"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SLUG_RE = /^[a-zA-Z0-9_-]{8,64}$/

export function isLikelyCfImageId(ref: string): boolean {
  const trimmed = ref.trim()
  if (!trimmed) return false
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
    return false
  if (/[/?#.]/.test(trimmed)) return false
  return UUID_RE.test(trimmed) || SLUG_RE.test(trimmed)
}

const normalizeBase = (base: string) => base.replace(/\/+$/, "")

export function cfVariantUrl(id: string, variant: CfVariant): string {
  const trimmedId = id.trim()
  if (!isLikelyCfImageId(trimmedId)) return PLACEHOLDER_SRC

  const envBase = (import.meta.env.VITE_CF_IMAGES_BASE_URL as string | undefined)
    ?.trim()
  const accountHash = (
    import.meta.env.VITE_CF_IMAGES_ACCOUNT_HASH as string | undefined
  )?.trim()

  const base = envBase
    ? normalizeBase(envBase)
    : accountHash
      ? `https://imagedelivery.net/${accountHash}`
      : ""

  if (!base) return PLACEHOLDER_SRC
  return `${base}/${trimmedId}/${variant}`
}

export function resolveImageSrc(
  imageRef: string | null | undefined,
  variant: CfVariant,
): string {
  const trimmed = (imageRef ?? "").trim()
  if (!trimmed) return PLACEHOLDER_SRC

  if (isLikelyCfImageId(trimmed)) return cfVariantUrl(trimmed, variant)

  // Temporary fallback during migration:
  // keep existing http(s) URLs unchanged (including Supabase URLs).
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://"))
    return trimmed

  return PLACEHOLDER_SRC
}

