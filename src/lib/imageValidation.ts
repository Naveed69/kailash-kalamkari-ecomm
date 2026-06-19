import { isLikelyCfImageId } from "@/lib/cloudflareImages"

type ValidateImageRefOptions = {
  allowLegacy?: boolean
  fieldName?: string
}

const warnedLegacyRefs = new Set<string>()
const MIGRATION_MODE = true

const warnLegacyRef = (fieldName: string, ref: string) => {
  if (!import.meta.env.DEV) return
  const key = `${fieldName}:${ref}`
  if (warnedLegacyRefs.has(key)) return
  warnedLegacyRefs.add(key)
  console.warn(
    `[imageValidation] Legacy image URL accepted for ${fieldName}. Migrate this value to a Cloudflare Image ID when safe.`,
    { fieldName, ref },
  )
}

export function validateImageRef(
  ref: string | null | undefined,
  options: ValidateImageRefOptions = {},
): string | null {
  const { allowLegacy = false, fieldName = "image ref" } = options

  if (ref === null || ref === undefined) return null
  if (typeof ref !== "string") {
    if (MIGRATION_MODE) {
      console.warn("Invalid image ref skipped:", ref)
      return null
    }
    throw new Error(`${fieldName} must be a string image reference`)
  }

  const trimmed = ref.trim()
  if (!trimmed) return null

  if (isLikelyCfImageId(trimmed)) return trimmed

  if (
    allowLegacy &&
    (trimmed.startsWith("https://") || trimmed.startsWith("http://"))
  ) {
    warnLegacyRef(fieldName, trimmed)
    return trimmed
  }

  if (MIGRATION_MODE) {
    console.warn("Invalid image ref skipped:", ref)
    return null
  }

  throw new Error(
    `${fieldName} must be a Cloudflare Image ID${
      allowLegacy ? " or a legacy http(s) URL" : ""
    }`,
  )
}
