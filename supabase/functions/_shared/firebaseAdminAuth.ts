type FirebaseJwtHeader = {
  alg?: string
  kid?: string
}

type FirebaseJwtPayload = {
  aud?: string
  email?: string
  email_verified?: boolean
  exp?: number
  iat?: number
  iss?: string
  sub?: string
}

type JwksResponse = {
  keys?: JsonWebKey[]
}

export type AdminAuthResult =
  | { ok: true; email: string; uid: string }
  | { ok: false; status: 401 | 403 | 500; error: string }

const FIREBASE_JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
const AUTH_TIMEOUT_MS = 10_000

let cachedJwks: JsonWebKey[] | null = null
let cachedJwksAt = 0
const JWKS_CACHE_MS = 60 * 60 * 1000

const jsonPart = <T>(part: string): T => {
  const bytes = base64UrlToBytes(part)
  return JSON.parse(new TextDecoder().decode(bytes)) as T
}

const base64UrlToBytes = (value: string) => {
  let base64 = value.replace(/-/g, "+").replace(/_/g, "/")
  const padding = base64.length % 4
  if (padding) base64 += "=".repeat(4 - padding)

  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

const getBearerToken = (req: Request) => {
  const authHeader = req.headers.get("authorization") || ""
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || ""
}

const getAllowedAdminEmails = () =>
  (Deno.env.get("ADMIN_EMAILS") || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

const getFirebaseProjectId = () => Deno.env.get("FIREBASE_PROJECT_ID")?.trim()

const getJwks = async () => {
  const now = Date.now()
  if (cachedJwks && now - cachedJwksAt < JWKS_CACHE_MS) return cachedJwks

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS)
  try {
    const response = await fetch(FIREBASE_JWKS_URL, {
      signal: controller.signal,
    })
    if (!response.ok) {
      throw new Error(`Unable to fetch Firebase public keys: ${response.status}`)
    }

    const body = (await response.json()) as JwksResponse
    cachedJwks = body.keys || []
    cachedJwksAt = now
    return cachedJwks
  } finally {
    clearTimeout(timeoutId)
  }
}

const verifySignature = async (
  token: string,
  header: FirebaseJwtHeader,
  signingInput: string,
  signature: Uint8Array,
) => {
  if (header.alg !== "RS256" || !header.kid) return false

  const jwks = await getJwks()
  const jwk = jwks.find((key) => key.kid === header.kid)
  if (!jwk) return false

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  )

  return crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signature,
    new TextEncoder().encode(signingInput),
  )
}

export const verifyFirebaseAdmin = async (
  req: Request,
): Promise<AdminAuthResult> => {
  const projectId = getFirebaseProjectId()
  const allowedEmails = getAllowedAdminEmails()

  if (!projectId || allowedEmails.length === 0) {
    return {
      ok: false,
      status: 500,
      error: "Admin auth secrets are not configured.",
    }
  }

  const token = getBearerToken(req)
  if (!token) {
    return { ok: false, status: 401, error: "Missing admin auth token" }
  }

  const parts = token.split(".")
  if (parts.length !== 3) {
    return { ok: false, status: 401, error: "Malformed admin auth token" }
  }

  try {
    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const header = jsonPart<FirebaseJwtHeader>(encodedHeader)
    const payload = jsonPart<FirebaseJwtPayload>(encodedPayload)
    const signature = base64UrlToBytes(encodedSignature)
    const signingInput = `${encodedHeader}.${encodedPayload}`

    const validSignature = await verifySignature(
      token,
      header,
      signingInput,
      signature,
    )
    if (!validSignature) {
      return { ok: false, status: 401, error: "Invalid admin auth token" }
    }

    const now = Math.floor(Date.now() / 1000)
    const expectedIssuer = `https://securetoken.google.com/${projectId}`
    if (
      payload.aud !== projectId ||
      payload.iss !== expectedIssuer ||
      !payload.sub ||
      !payload.email ||
      !payload.exp ||
      payload.exp <= now ||
      (payload.iat || 0) > now + 60
    ) {
      return { ok: false, status: 401, error: "Invalid admin auth claims" }
    }

    const email = payload.email.toLowerCase()
    if (!allowedEmails.includes(email)) {
      return { ok: false, status: 403, error: "Admin access required" }
    }

    return { ok: true, email, uid: payload.sub }
  } catch {
    return { ok: false, status: 401, error: "Invalid admin auth token" }
  }
}
