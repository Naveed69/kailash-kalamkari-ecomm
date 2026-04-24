#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

const SCRIPT_DIR = path.resolve(process.cwd(), "scripts")
const MAP_PATH = path.join(SCRIPT_DIR, "migrate-cloudflare-images.map.json")
const FAIL_PATH = path.join(
  SCRIPT_DIR,
  "migrate-cloudflare-images.failures.jsonl",
)

const args = new Set(process.argv.slice(2))
const mode = (() => {
  const known = ["--dry-run", "--upload-only", "--verify", "--apply", "--rollback"]
  const selected = known.filter((k) => args.has(k))
  if (selected.length !== 1) {
    throw new Error(
      `Pick exactly one mode: ${known.join(", ")} (got: ${selected.join(", ") || "none"})`,
    )
  }
  return selected[0]
})()

const env = (key) => (process.env[key] ?? "").trim()
const supabaseUrl = env("SUPABASE_URL") || env("VITE_SUPABASE_URL")
const supabaseServiceKey =
  env("SUPABASE_SERVICE_ROLE_KEY") || env("SUPABASE_SERVICE_KEY")
const cfAccountId = env("CF_ACCOUNT_ID")
const cfApiToken = env("CF_IMAGES_API_TOKEN")

const isHttpUrl = (v) =>
  typeof v === "string" && (v.startsWith("https://") || v.startsWith("http://"))

const ensureScriptsDir = () => {
  if (!fs.existsSync(SCRIPT_DIR)) fs.mkdirSync(SCRIPT_DIR, { recursive: true })
}

const logFailure = async (obj) => {
  ensureScriptsDir()
  fs.appendFileSync(FAIL_PATH, JSON.stringify(obj) + "\n", "utf8")
}

const loadMap = () => {
  if (!fs.existsSync(MAP_PATH)) return { urls: {} }
  return JSON.parse(fs.readFileSync(MAP_PATH, "utf8"))
}

const saveMap = (map) => {
  ensureScriptsDir()
  fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2) + "\n", "utf8")
}

const requireCloudflareEnv = () => {
  if (!cfAccountId || !cfApiToken) {
    throw new Error(
      "Missing CF_ACCOUNT_ID / CF_IMAGES_API_TOKEN (required for upload/verify/apply).",
    )
  }
}

const requireSupabaseEnv = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (required for apply/rollback).",
    )
  }
}

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      })
    : null

const cloudflareFetch = async (input, init = {}) => {
  const res = await fetch(input, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfApiToken}`,
      ...(init.headers || {}),
    },
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.success) {
    const err = new Error(
      `Cloudflare API error (${res.status}): ${JSON.stringify(json)}`,
    )
    err.response = json
    throw err
  }
  return json
}

const cfCreateFromUrl = async (url) => {
  const form = new FormData()
  form.set("url", url)
  const json = await cloudflareFetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1`,
    { method: "POST", body: form },
  )
  return json.result?.id
}

const cfGetImage = async (id) => {
  const json = await cloudflareFetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1/${id}`,
  )
  return json.result
}

const fetchDbRefs = async () => {
  if (!supabase) throw new Error("Supabase client not initialized")

  const [{ data: products, error: pErr }, { data: subCats, error: sErr }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id,image,images,image_legacy,images_legacy"),
      supabase
        .from("sub_categories")
        .select("id,image_url,image_url_legacy"),
    ])

  if (pErr) throw pErr
  if (sErr) throw sErr

  return {
    products: products ?? [],
    subCategories: subCats ?? [],
  }
}

const collectUrls = ({ products, subCategories }) => {
  const urls = new Set()

  for (const p of products) {
    if (isHttpUrl(p.image)) urls.add(p.image)
    const imgs = Array.isArray(p.images)
      ? p.images
      : typeof p.images === "string"
        ? (() => {
            const t = p.images.trim()
            if (!t) return []
            if (t.startsWith("[")) {
              try {
                const parsed = JSON.parse(t)
                return Array.isArray(parsed) ? parsed : []
              } catch {
                return []
              }
            }
            return [t]
          })()
        : []
    for (const ref of imgs) if (isHttpUrl(ref)) urls.add(ref)
  }

  for (const sc of subCategories) {
    if (isHttpUrl(sc.image_url)) urls.add(sc.image_url)
  }

  return Array.from(urls)
}

const uploadOnly = async () => {
  requireCloudflareEnv()
  requireSupabaseEnv()
  const refs = await fetchDbRefs()
  const urls = collectUrls(refs)

  const map = loadMap()
  map.createdAt = map.createdAt || new Date().toISOString()
  map.urls = map.urls || {}

  console.log(`Found ${urls.length} unique http(s) URLs to migrate.`)
  for (const url of urls) {
    if (map.urls[url]) continue
    try {
      const id = await cfCreateFromUrl(url)
      if (!id) throw new Error("No Cloudflare image id returned")
      map.urls[url] = id
      console.log(`Uploaded: ${url} -> ${id}`)
      saveMap(map)
    } catch (err) {
      await logFailure({ stage: "upload", url, error: String(err) })
      console.error(`Upload failed: ${url}`)
    }
  }

  saveMap(map)
  console.log(`Done. Map written to ${path.relative(process.cwd(), MAP_PATH)}`)
}

const verify = async () => {
  requireCloudflareEnv()
  const map = loadMap()
  const entries = Object.entries(map.urls || {})
  console.log(`Verifying ${entries.length} Cloudflare images...`)
  for (const [url, id] of entries) {
    try {
      const result = await cfGetImage(id)
      if (!result?.id) throw new Error("Missing result.id")
      console.log(`OK: ${id} (${url})`)
    } catch (err) {
      await logFailure({ stage: "verify", url, id, error: String(err) })
      console.error(`VERIFY failed: ${id} (${url})`)
    }
  }
}

const apply = async () => {
  requireCloudflareEnv()
  requireSupabaseEnv()
  if (!supabase) throw new Error("Supabase client not initialized")

  const map = loadMap()
  const urlToId = map.urls || {}

  const refs = await fetchDbRefs()

  const normalizeImages = (value) => {
    if (Array.isArray(value)) return value
    if (typeof value === "string") {
      const t = value.trim()
      if (!t) return []
      if (t.startsWith("[")) {
        try {
          const parsed = JSON.parse(t)
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      }
      return [t]
    }
    return []
  }

  let updatedProducts = 0
  for (const p of refs.products) {
    const currentImage = p.image
    const currentImages = normalizeImages(p.images)

    const nextImage = isHttpUrl(currentImage) ? urlToId[currentImage] : currentImage
    const nextImages = []
    let missing = false
    for (const ref of currentImages) {
      if (isHttpUrl(ref)) {
        const mapped = urlToId[ref]
        if (!mapped) {
          missing = true
          break
        }
        nextImages.push(mapped)
      } else {
        nextImages.push(ref)
      }
    }

    if (isHttpUrl(currentImage) && !nextImage) {
      missing = true
    }

    if (missing) {
      await logFailure({ stage: "apply", table: "products", id: p.id })
      continue
    }

    const legacy = {}
    if (!p.image_legacy) legacy.image_legacy = currentImage ?? null
    if (!p.images_legacy) legacy.images_legacy = currentImages ?? []

    const updatePayload = {
      ...legacy,
      image: nextImage ?? null,
      images: nextImages,
    }

    const { error } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", p.id)
    if (error) {
      await logFailure({
        stage: "apply",
        table: "products",
        id: p.id,
        error: error.message,
      })
      continue
    }
    updatedProducts++
  }

  let updatedSubCats = 0
  for (const sc of refs.subCategories) {
    const current = sc.image_url
    const next = isHttpUrl(current) ? urlToId[current] : current
    if (isHttpUrl(current) && !next) {
      await logFailure({
        stage: "apply",
        table: "sub_categories",
        id: sc.id,
      })
      continue
    }

    const legacy = {}
    if (!sc.image_url_legacy) legacy.image_url_legacy = current ?? null

    const { error } = await supabase
      .from("sub_categories")
      .update({ ...legacy, image_url: next ?? null })
      .eq("id", sc.id)
    if (error) {
      await logFailure({
        stage: "apply",
        table: "sub_categories",
        id: sc.id,
        error: error.message,
      })
      continue
    }
    updatedSubCats++
  }

  console.log(`Applied: products=${updatedProducts}, sub_categories=${updatedSubCats}`)
}

const rollback = async () => {
  requireSupabaseEnv()
  if (!supabase) throw new Error("Supabase client not initialized")

  const refs = await fetchDbRefs()

  let rolledProducts = 0
  for (const p of refs.products) {
    if (!p.image_legacy && !p.images_legacy) continue
    const { error } = await supabase
      .from("products")
      .update({
        image: p.image_legacy ?? p.image ?? null,
        images: p.images_legacy ?? p.images ?? [],
      })
      .eq("id", p.id)
    if (error) {
      await logFailure({
        stage: "rollback",
        table: "products",
        id: p.id,
        error: error.message,
      })
      continue
    }
    rolledProducts++
  }

  let rolledSubCats = 0
  for (const sc of refs.subCategories) {
    if (!sc.image_url_legacy) continue
    const { error } = await supabase
      .from("sub_categories")
      .update({
        image_url: sc.image_url_legacy ?? sc.image_url ?? null,
      })
      .eq("id", sc.id)
    if (error) {
      await logFailure({
        stage: "rollback",
        table: "sub_categories",
        id: sc.id,
        error: error.message,
      })
      continue
    }
    rolledSubCats++
  }

  console.log(
    `Rollback complete: products=${rolledProducts}, sub_categories=${rolledSubCats}`,
  )
}

const main = async () => {
  ensureScriptsDir()

  if (mode === "--dry-run") {
    requireSupabaseEnv()
    const refs = await fetchDbRefs()
    const urls = collectUrls(refs)
    console.log(
      JSON.stringify(
        {
          products: refs.products.length,
          subCategories: refs.subCategories.length,
          uniqueHttpUrls: urls.length,
        },
        null,
        2,
      ),
    )
    return
  }

  if (mode === "--upload-only") return uploadOnly()
  if (mode === "--verify") return verify()
  if (mode === "--apply") return apply()
  if (mode === "--rollback") return rollback()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

