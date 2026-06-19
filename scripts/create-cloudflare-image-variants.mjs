#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue
    const index = trimmed.indexOf("=")
    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"))
loadEnvFile(path.resolve(process.cwd(), ".env"))

const env = (key) => (process.env[key] ?? "").trim()
const accountId = env("CF_ACCOUNT_ID")
const token = env("CF_IMAGES_TOKEN")

if (!accountId || !token) {
  throw new Error("Missing CF_ACCOUNT_ID / CF_IMAGES_TOKEN")
}

const variants = [
  {
    id: "thumb",
    options: { fit: "scale-down", width: 420, height: 560, metadata: "none" },
    neverRequireSignedURLs: true,
  },
  {
    id: "medium",
    options: { fit: "scale-down", width: 900, height: 1200, metadata: "none" },
    neverRequireSignedURLs: true,
  },
  {
    id: "full",
    options: { fit: "scale-down", width: 1800, height: 2400, metadata: "none" },
    neverRequireSignedURLs: true,
  },
]

const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/variants`

const upsertVariant = async (variant) => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(variant),
  })
  const payload = await response.json().catch(() => ({}))

  if (response.ok && payload.success) {
    return { id: variant.id, action: "created", ok: true }
  }

  const alreadyExists = payload.errors?.some((error) =>
    String(error.message || "").toLowerCase().includes("already exists"),
  )

  if (!alreadyExists) {
    return {
      id: variant.id,
      action: "failed",
      ok: false,
      status: response.status,
      errors: payload.errors || [],
    }
  }

  const patchResponse = await fetch(`${endpoint}/${variant.id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      options: variant.options,
      neverRequireSignedURLs: variant.neverRequireSignedURLs,
    }),
  })
  const patchPayload = await patchResponse.json().catch(() => ({}))

  return {
    id: variant.id,
    action: patchResponse.ok && patchPayload.success ? "updated" : "failed",
    ok: patchResponse.ok && patchPayload.success,
    status: patchResponse.status,
    errors: patchPayload.errors || [],
  }
}

const results = []
for (const variant of variants) {
  results.push(await upsertVariant(variant))
}

console.log(JSON.stringify(results, null, 2))

if (results.some((result) => !result.ok)) {
  process.exit(1)
}
