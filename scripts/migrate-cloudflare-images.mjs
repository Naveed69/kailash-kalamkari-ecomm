#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

const SCRIPT_DIR = path.resolve(process.cwd(), "scripts")
const MAP_PATH = path.join(SCRIPT_DIR, "migrate-cloudflare-images.map.json")
const BACKUP_DIR = path.resolve(process.cwd(), "migration-backups")
const LEGACY_BACKUP_PATH = path.resolve(process.cwd(), "migration-backup.json")
const FAIL_PATH = path.join(
  SCRIPT_DIR,
  "migrate-cloudflare-images.failures.jsonl",
)
const DELIVERY_VARIANTS = ["thumb", "medium", "full"]

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/)
  for (const line of lines) {
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

const args = new Set(process.argv.slice(2))
const mode = (() => {
  const known = [
    "--dry-run",
    "--check-cloudflare",
    "--upload-only",
    "--verify",
    "--apply",
    "--rollback",
  ]
  const selected = known.filter((k) => args.has(k))
  if (selected.length !== 1) {
    throw new Error(
      `Pick exactly one mode: ${known.join(", ")} (got: ${selected.join(", ") || "none"})`,
    )
  }
  return selected[0]
})()
const includeExternal = args.has("--include-external")

const env = (key) => (process.env[key] ?? "").trim()
const supabaseUrl = env("SUPABASE_URL") || env("VITE_SUPABASE_URL")
const supabaseServiceKey =
  env("SUPABASE_SERVICE_ROLE_KEY") || env("SUPABASE_SERVICE_KEY")
const cfAccountId = env("CF_ACCOUNT_ID")
const cfApiToken = env("CF_IMAGES_TOKEN")
const cfImagesHash = env("CF_IMAGES_HASH") || env("VITE_CF_IMAGES_HASH")

const isHttpUrl = (v) =>
  typeof v === "string" && (v.startsWith("https://") || v.startsWith("http://"))

const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const nowStamp = () =>
  new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_")

const classifyImageRef = (value) => {
  if (!value || typeof value !== "string") return "empty"
  const trimmed = value.trim()
  if (!trimmed) return "empty"
  if (trimmed.startsWith("https://imagedelivery.net/")) return "cloudflare-url"
  if (uuidRe.test(trimmed)) return "cloudflare-id"
  if (trimmed.includes("/storage/v1/render/image/")) return "supabase-render"
  if (trimmed.includes("supabase.co/storage")) return "supabase-storage"
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return "external-url"
  }
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return "local-preview"
  }
  return "other"
}

const isMigratableUrl = (value) => {
  const type = classifyImageRef(value)
  if (type === "supabase-storage" || type === "supabase-render") return true
  return includeExternal && type === "external-url"
}

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

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

const ensureScriptsDir = () => {
  if (!fs.existsSync(SCRIPT_DIR)) fs.mkdirSync(SCRIPT_DIR, { recursive: true })
}

const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true })
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

const saveBackup = (backup) => {
  ensureBackupDir()
  const payload = {
    createdAt: new Date().toISOString(),
    mode: "before-db-update",
    includeExternal,
    ...backup,
  }
  const backupPath = path.join(
    BACKUP_DIR,
    `${nowStamp()}_supabase-to-cloudflare-images.json`,
  )
  fs.writeFileSync(backupPath, JSON.stringify(payload, null, 2) + "\n", "utf8")
  fs.writeFileSync(
    LEGACY_BACKUP_PATH,
    JSON.stringify(payload.products || [], null, 2) + "\n",
    "utf8",
  )
  return backupPath
}

const loadBackup = () => {
  if (fs.existsSync(LEGACY_BACKUP_PATH)) {
    const parsed = JSON.parse(fs.readFileSync(LEGACY_BACKUP_PATH, "utf8"))
    return Array.isArray(parsed) ? parsed : parsed.products || []
  }
  if (!fs.existsSync(BACKUP_DIR)) return []
  const backups = fs
    .readdirSync(BACKUP_DIR)
    .filter((file) => file.endsWith("_supabase-to-cloudflare-images.json"))
    .sort()
  if (backups.length === 0) return []
  const latest = path.join(BACKUP_DIR, backups[backups.length - 1])
  const parsed = JSON.parse(fs.readFileSync(latest, "utf8"))
  return Array.isArray(parsed) ? parsed : parsed.products || []
}

const requireCloudflareEnv = () => {
  if (!cfAccountId || !cfApiToken) {
    throw new Error(
      "Missing CF_ACCOUNT_ID / CF_IMAGES_TOKEN (required for upload/verify/apply).",
    )
  }
}

const requireDeliveryEnv = () => {
  if (!cfImagesHash) {
    throw new Error(
      "Missing CF_IMAGES_HASH or VITE_CF_IMAGES_HASH (required to verify Cloudflare delivery variants).",
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
  const res = await fetchWithRetry(input, {
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchWithRetry = async (input, init = {}, attempts = 4) => {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(input, init)
      if (response.status !== 429 && response.status < 500) return response
      lastError = new Error(`HTTP ${response.status}`)
      if (attempt === attempts) return response
    } catch (err) {
      lastError = err
      if (attempt === attempts) throw err
    }
    await sleep(750 * attempt)
  }
  throw lastError
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

const checkCloudflare = async () => {
  requireCloudflareEnv()

  const tokenResponse = await fetch(
    "https://api.cloudflare.com/client/v4/user/tokens/verify",
    {
      headers: { Authorization: `Bearer ${cfApiToken}` },
    },
  )
  const tokenPayload = await tokenResponse.json().catch(() => ({}))

  if (!tokenResponse.ok || !tokenPayload.success) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          step: "token_verify",
          status: tokenResponse.status,
          errors: tokenPayload.errors || [],
        },
        null,
        2,
      ),
    )
    throw new Error("Cloudflare token verification failed")
  }

  const listResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1?per_page=1`,
    {
      headers: { Authorization: `Bearer ${cfApiToken}` },
    },
  )
  const listPayload = await listResponse.json().catch(() => ({}))

  if (!listResponse.ok || !listPayload.success) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          step: "images_list",
          status: listResponse.status,
          errors: listPayload.errors || [],
        },
        null,
        2,
      ),
    )
    throw new Error("Cloudflare Images list failed")
  }

  const imagePath = path.resolve(process.cwd(), "public/favicon.png")
  const png = fs.readFileSync(imagePath)
  const form = new FormData()
  form.append(
    "file",
    new Blob([png], { type: "image/png" }),
    "kailash-cloudflare-preflight.png",
  )

  const uploadResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${cfApiToken}` },
      body: form,
    },
  )
  const uploadPayload = await uploadResponse.json().catch(() => ({}))

  if (!uploadResponse.ok || !uploadPayload.success || !uploadPayload.result?.id) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          step: "images_upload",
          status: uploadResponse.status,
          errors: uploadPayload.errors || [],
        },
        null,
        2,
      ),
    )
    throw new Error("Cloudflare Images upload failed")
  }

  const imageId = uploadPayload.result.id
  const deleteResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1/${imageId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${cfApiToken}` },
    },
  )
  const deletePayload = await deleteResponse.json().catch(() => ({}))

  console.log(
    JSON.stringify(
      {
        ok: deleteResponse.ok && deletePayload.success,
        tokenVerify: true,
        imagesList: true,
        testUpload: true,
        testDelete: deleteResponse.ok && deletePayload.success,
      },
      null,
      2,
    ),
  )

  if (!deleteResponse.ok || !deletePayload.success) {
    throw new Error("Cloudflare test image uploaded but delete failed")
  }
}

const cfGetImage = async (id) => {
  const json = await cloudflareFetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1/${id}`,
  )
  return json.result
}

const cfDeliveryUrl = (id, variant) =>
  `https://imagedelivery.net/${cfImagesHash}/${id}/${variant}`

const verifyCfDeliveryVariant = async (id, variant) => {
  const url = cfDeliveryUrl(id, variant)
  let res = await fetchWithRetry(url, { method: "HEAD" })
  if (res.status === 405) {
    res = await fetchWithRetry(url, { headers: { Range: "bytes=0-0" } })
  }
  if (!res.ok) {
    throw new Error(`Cloudflare delivery ${variant} failed (${res.status}): ${url}`)
  }
}

const verifyCfImage = async (id) => {
  const result = await cfGetImage(id)
  if (!result?.id) throw new Error("Missing result.id")
  for (const variant of DELIVERY_VARIANTS) {
    await verifyCfDeliveryVariant(id, variant)
  }
}

const withProductLegacyDefaults = (rows) =>
  (rows ?? []).map((row) => ({
    image_legacy: null,
    images_legacy: null,
    ...row,
  }))

const withSubCategoryLegacyDefaults = (rows) =>
  (rows ?? []).map((row) => ({
    image_url_legacy: null,
    ...row,
  }))

const fetchDbRefs = async ({ requireLegacyColumns = false } = {}) => {
  if (!supabase) throw new Error("Supabase client not initialized")

  let [{ data: products, error: pErr }, { data: subCats, error: sErr }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id,name,image,images,image_legacy,images_legacy"),
      supabase
        .from("sub_categories")
        .select("id,image_url,image_url_legacy"),
    ])

  if (
    !requireLegacyColumns &&
    (pErr?.code === "42703" || sErr?.code === "42703")
  ) {
    ;[{ data: products, error: pErr }, { data: subCats, error: sErr }] =
      await Promise.all([
        supabase.from("products").select("id,name,image,images"),
        supabase.from("sub_categories").select("id,image_url"),
      ])
    products = withProductLegacyDefaults(products)
    subCats = withSubCategoryLegacyDefaults(subCats)
  }

  if (pErr || sErr) {
    const error = pErr || sErr
    if (requireLegacyColumns && error?.code === "42703") {
      throw new Error(
        "Legacy image columns are missing. Apply kailash-kalamkari/supabase/migrations/013_cloudflare_image_rollback.sql before running --apply so old Supabase image refs are preserved.",
      )
    }
    throw error
  }

  return {
    products: products ?? [],
    subCategories: subCats ?? [],
  }
}

const collectUrls = ({ products, subCategories }) => {
  const urls = new Set()

  for (const p of products) {
    if (isMigratableUrl(p.image)) urls.add(p.image)
    const imgs = normalizeImages(p.images)
    for (const ref of imgs) if (isMigratableUrl(ref)) urls.add(ref)
  }

  for (const sc of subCategories) {
    if (isMigratableUrl(sc.image_url)) urls.add(sc.image_url)
  }

  return Array.from(urls)
}

const buildRefReport = ({ products, subCategories }) => {
  const report = {
    products: { rows: products.length },
    subCategories: { rows: subCategories.length },
  }
  const bump = (bucket, key) => {
    bucket[key] = (bucket[key] || 0) + 1
  }

  for (const p of products) {
    bump(report.products, `image:${classifyImageRef(p.image)}`)
    for (const ref of normalizeImages(p.images)) {
      bump(report.products, `images:${classifyImageRef(ref)}`)
    }
  }

  for (const sc of subCategories) {
    bump(report.subCategories, `image_url:${classifyImageRef(sc.image_url)}`)
  }

  return report
}

const uploadOnly = async () => {
  requireCloudflareEnv()
  requireSupabaseEnv()
  const refs = await fetchDbRefs()
  const urls = collectUrls(refs)

  const map = loadMap()
  map.createdAt = map.createdAt || new Date().toISOString()
  map.urls = map.urls || {}

  console.log(
    `Found ${urls.length} unique Supabase image URLs to migrate. includeExternal=${includeExternal}`,
  )
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
  requireDeliveryEnv()
  const map = loadMap()
  const entries = Object.entries(map.urls || {})
  let failures = 0
  console.log(
    `Verifying ${entries.length} Cloudflare images across variants: ${DELIVERY_VARIANTS.join(", ")}...`,
  )
  for (const [url, id] of entries) {
    try {
      await verifyCfImage(id)
      console.log(`OK: ${id} (${url})`)
    } catch (err) {
      failures += 1
      await logFailure({ stage: "verify", url, id, error: String(err) })
      console.error(`VERIFY failed: ${id} (${url})`)
    }
  }
  if (failures > 0) {
    throw new Error(`Verification failed for ${failures} Cloudflare images.`)
  }
  console.log(`Verification passed for ${entries.length} Cloudflare images.`)
}

const apply = async () => {
  requireCloudflareEnv()
  requireDeliveryEnv()
  requireSupabaseEnv()
  if (!supabase) throw new Error("Supabase client not initialized")

  const map = loadMap()
  const urlToId = map.urls || {}
  const uniqueIds = Array.from(new Set(Object.values(urlToId).filter(Boolean)))

  console.log(
    `Preflight verifying ${uniqueIds.length} mapped Cloudflare images before DB writes...`,
  )
  for (const [index, id] of uniqueIds.entries()) {
    await verifyCfImage(id)
    if ((index + 1) % 25 === 0 || index + 1 === uniqueIds.length) {
      console.log(`[preflight] ${index + 1}/${uniqueIds.length}`)
    }
  }

  const refs = await fetchDbRefs({ requireLegacyColumns: true })
  const productBackup = []
  const subCategoryBackup = []
  const productUpdates = []
  const subCategoryUpdates = []

  for (const p of refs.products) {
    const currentImage = p.image
    const currentImages = normalizeImages(p.images)

    const nextImage = isMigratableUrl(currentImage)
      ? urlToId[currentImage]
      : currentImage
    const nextImages = []
    let missing = false
    for (const ref of currentImages) {
      if (isMigratableUrl(ref)) {
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

    if (isMigratableUrl(currentImage) && !nextImage) {
      missing = true
    }

    if (missing) {
      await logFailure({ stage: "apply", table: "products", id: p.id })
      continue
    }

    const changed =
      currentImage !== (nextImage ?? null) ||
      JSON.stringify(currentImages) !== JSON.stringify(nextImages)

    if (!changed) continue

    const legacy = {}
    if (!p.image_legacy) legacy.image_legacy = currentImage ?? null
    if (!p.images_legacy) legacy.images_legacy = currentImages

    const updatePayload = {
      ...legacy,
      image: nextImage ?? null,
      images: nextImages,
    }

    productBackup.push({
      productId: p.id,
      slug: slugify(p.name || p.id),
      oldImage: currentImage ?? null,
      oldImages: currentImages,
      newImage: updatePayload.image ?? null,
      newImages: updatePayload.images,
    })

    productUpdates.push({ productId: p.id, updatePayload })
  }

  for (const sc of refs.subCategories) {
    const current = sc.image_url
    const next = isMigratableUrl(current) ? urlToId[current] : current
    if (isMigratableUrl(current) && !next) {
      await logFailure({
        stage: "apply",
        table: "sub_categories",
        id: sc.id,
      })
      continue
    }
    if (current === (next ?? null)) continue

    const legacy = {}
    if (!sc.image_url_legacy) legacy.image_url_legacy = current ?? null

    const updatePayload = { ...legacy, image_url: next ?? null }

    subCategoryBackup.push({
      subCategoryId: sc.id,
      oldImageUrl: current ?? null,
      newImageUrl: updatePayload.image_url ?? null,
    })

    subCategoryUpdates.push({ subCategoryId: sc.id, updatePayload })
  }

  const backupPath = saveBackup({
    products: productBackup,
    subCategories: subCategoryBackup,
    map: urlToId,
  })
  console.log(`[backup] ${path.relative(process.cwd(), backupPath)}`)

  let updatedProducts = 0
  for (const { productId, updatePayload } of productUpdates) {
    const { error } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", productId)
    if (error) {
      await logFailure({
        stage: "apply",
        table: "products",
        id: productId,
        error: error.message,
      })
      continue
    }
    updatedProducts++
  }

  let updatedSubCats = 0
  for (const { subCategoryId, updatePayload } of subCategoryUpdates) {
    const { error } = await supabase
      .from("sub_categories")
      .update(updatePayload)
      .eq("id", subCategoryId)
    if (error) {
      await logFailure({
        stage: "apply",
        table: "sub_categories",
        id: subCategoryId,
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

  const refs = await fetchDbRefs({ requireLegacyColumns: true })
  const backup = loadBackup()

  let rolledProducts = 0
  if (backup.length > 0) {
    for (const entry of backup) {
      const { error } = await supabase
        .from("products")
        .update({
          image: entry.oldImage ?? null,
          images: entry.oldImages ?? [],
        })
        .eq("id", entry.productId)
      if (error) {
        await logFailure({
          stage: "rollback",
          table: "products",
          id: entry.productId,
          error: error.message,
        })
        continue
      }
      rolledProducts++
    }
  } else {
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
          includeExternal,
          uniqueMigratableUrls: urls.length,
          refsByType: buildRefReport(refs),
        },
        null,
        2,
      ),
    )
    return
  }

  if (mode === "--check-cloudflare") return checkCloudflare()
  if (mode === "--upload-only") return uploadOnly()
  if (mode === "--verify") return verify()
  if (mode === "--apply") return apply()
  if (mode === "--rollback") return rollback()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
