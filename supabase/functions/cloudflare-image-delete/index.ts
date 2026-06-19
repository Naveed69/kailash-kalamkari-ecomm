import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { verifyFirebaseAdmin } from "../_shared/firebaseAdminAuth.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}
const CLOUDFLARE_TIMEOUT_MS = 30_000

type CloudflareImagesResponse = {
  success?: boolean
  errors?: Array<{
    message?: string
  }>
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })

const cfConfig = () => {
  const accountId = Deno.env.get("CF_ACCOUNT_ID")
  const token = Deno.env.get("CF_IMAGES_TOKEN")

  if (!accountId || !token) {
    throw new Error("Cloudflare Images secrets are not configured.")
  }

  return { accountId, token }
}

const cfErrorMessage = (data: CloudflareImagesResponse) =>
  data.errors
    ?.map((error) => error.message)
    .filter(Boolean)
    .join(", ") || "Cloudflare Images delete failed"

const cloudflareFetch = async (input: string, init: RequestInit) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), CLOUDFLARE_TIMEOUT_MS)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" })
  }

  try {
    const auth = await verifyFirebaseAdmin(req)
    if (!auth.ok) return json(auth.status, { error: auth.error })

    const { accountId, token } = cfConfig()
    const { imageId } = await req.json().catch(() => ({ imageId: "" }))
    const trimmedId = String(imageId || "").trim()

    if (!trimmedId) {
      return json(400, { error: "Missing imageId" })
    }

    const response = await cloudflareFetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${trimmedId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    const data = (await response.json().catch(
      () => ({}),
    )) as CloudflareImagesResponse

    if (!response.ok || data.success === false) {
      return json(response.status || 502, { error: cfErrorMessage(data) })
    }

    return json(200, { imageId: trimmedId })
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "Cloudflare Images delete failed",
    })
  }
})
