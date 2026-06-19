import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { verifyFirebaseAdmin } from "../_shared/firebaseAdminAuth.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}
const CLOUDFLARE_TIMEOUT_MS = 45_000

type CloudflareImagesResponse = {
  success?: boolean
  result?: {
    id?: string
  }
  errors?: Array<{
    code?: number
    message?: string
  }>
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })

const cfConfig = () => {
  const accountId = Deno.env.get("CF_ACCOUNT_ID")?.trim()
  const token = Deno.env.get("CF_IMAGES_TOKEN")?.trim()

  if (!accountId || !token) {
    throw new Error("Cloudflare Images secrets are not configured.")
  }

  return { accountId, token }
}

const cfErrorMessage = (data: CloudflareImagesResponse) => {
  if (data.errors?.some((error) => error.code === 5403)) {
    return "Cloudflare Images rejected the upload. Use a token for this account with Account > Cloudflare Images > Edit permission, and confirm Cloudflare Images is enabled on that account."
  }

  return data.errors
    ?.map((error) => error.message)
    .filter(Boolean)
    .join(", ") || "Cloudflare Images upload failed"
}

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
  const requestId = crypto.randomUUID()
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" })
  }

  try {
    console.log("cloudflare-image-upload:start", { requestId })
    const auth = await verifyFirebaseAdmin(req)
    if (!auth.ok) {
      console.warn("cloudflare-image-upload:auth_failed", {
        requestId,
        status: auth.status,
        error: auth.error,
      })
      return json(auth.status, { error: auth.error })
    }
    console.log("cloudflare-image-upload:auth_ok", {
      requestId,
      email: auth.email,
    })

    const { accountId, token } = cfConfig()
    const body = await req.formData()
    const file = body.get("file")

    if (!(file instanceof File)) {
      console.warn("cloudflare-image-upload:missing_file", { requestId })
      return json(400, { error: "Missing image file" })
    }

    if (!file.type.startsWith("image/")) {
      console.warn("cloudflare-image-upload:unsupported_file", {
        requestId,
        name: file.name,
        type: file.type,
      })
      return json(400, { error: "Only image uploads are supported" })
    }

    console.log("cloudflare-image-upload:file_received", {
      requestId,
      name: file.name,
      size: file.size,
      type: file.type,
    })

    const formData = new FormData()
    formData.append("file", file, file.name)

    console.log("cloudflare-image-upload:cloudflare_start", { requestId })
    const response = await cloudflareFetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    )

    const data = (await response.json().catch(
      () => ({}),
    )) as CloudflareImagesResponse

    if (!response.ok || !data.success || !data.result?.id) {
      console.warn("cloudflare-image-upload:cloudflare_failed", {
        requestId,
        status: response.status,
        error: cfErrorMessage(data),
      })
      return json(response.status || 502, { error: cfErrorMessage(data) })
    }

    console.log("cloudflare-image-upload:success", {
      requestId,
      imageId: data.result.id,
    })
    return json(200, { imageId: data.result.id, url: data.result.id })
  } catch (error) {
    console.error("cloudflare-image-upload:error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return json(500, {
      error: error instanceof Error ? error.message : "Cloudflare Images upload failed",
    })
  }
})
