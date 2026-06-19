#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

const BACKUP_DIR = path.resolve(process.cwd(), "migration-backups")
const args = new Set(process.argv.slice(2))
const apply = args.has("--apply")

if (apply && args.has("--dry-run")) {
  throw new Error("Use either --dry-run or --apply, not both.")
}

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
const supabaseUrl = env("SUPABASE_URL") || env("VITE_SUPABASE_URL")
const supabaseServiceKey =
  env("SUPABASE_SERVICE_ROLE_KEY") || env("SUPABASE_SERVICE_KEY")

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
  )
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

const nowStamp = () =>
  new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_")

const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

const normalizeImages = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return []
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return [trimmed]
  }
  return []
}

const isSupabaseStorageUrl = (value) =>
  typeof value === "string" &&
  (value.includes("/storage/v1/object/public/") ||
    value.includes("/storage/v1/render/image/public/"))

const parseStorageUrl = (url) => {
  try {
    const parsed = new URL(url)
    const markers = [
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/",
    ]
    const marker = markers.find((candidate) =>
      parsed.pathname.includes(candidate),
    )
    if (!marker) return null

    const start = parsed.pathname.indexOf(marker) + marker.length
    const suffix = decodeURIComponent(parsed.pathname.slice(start))
    const [bucket, ...parts] = suffix.split("/").filter(Boolean)
    const objectPath = parts.join("/")
    if (!bucket || !objectPath) return null
    return { bucket, path: objectPath }
  } catch {
    return null
  }
}

const addRef = (refs, source, url) => {
  if (!isSupabaseStorageUrl(url)) return
  refs.push({ ...source, url })
}

const fetchLegacyRefs = async () => {
  const [{ data: products, error: productError }, { data: subCategories, error: subCatError }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id,name,image,image_legacy,images,images_legacy"),
      supabase
        .from("sub_categories")
        .select("id,image_url,image_url_legacy"),
    ])

  if (productError || subCatError) throw productError || subCatError

  const refs = []
  for (const product of products ?? []) {
    addRef(
      refs,
      { table: "products", rowId: product.id, column: "image_legacy" },
      product.image_legacy,
    )
    for (const url of normalizeImages(product.images_legacy)) {
      addRef(
        refs,
        { table: "products", rowId: product.id, column: "images_legacy" },
        url,
      )
    }
  }

  for (const subCategory of subCategories ?? []) {
    addRef(
      refs,
      {
        table: "sub_categories",
        rowId: subCategory.id,
        column: "image_url_legacy",
      },
      subCategory.image_url_legacy,
    )
  }

  return { products: products ?? [], subCategories: subCategories ?? [], refs }
}

const buildPlan = (refs) => {
  const objects = new Map()
  const unsupported = []

  for (const ref of refs) {
    const parsed = parseStorageUrl(ref.url)
    if (!parsed) {
      unsupported.push(ref)
      continue
    }
    const key = `${parsed.bucket}/${parsed.path}`
    const existing = objects.get(key) ?? { ...parsed, refs: [] }
    existing.refs.push(ref)
    objects.set(key, existing)
  }

  return {
    objects: Array.from(objects.values()),
    unsupported,
  }
}

const summarizeByBucket = (objects) =>
  objects.reduce((acc, object) => {
    acc[object.bucket] = (acc[object.bucket] ?? 0) + 1
    return acc
  }, {})

const saveBackup = ({ products, subCategories, refs, objects, unsupported }) => {
  ensureBackupDir()
  const backup = {
    createdAt: new Date().toISOString(),
    mode: "before-supabase-legacy-storage-delete",
    products,
    subCategories,
    refs,
    objects,
    unsupported,
  }
  const backupPath = path.join(
    BACKUP_DIR,
    `${nowStamp()}_supabase-legacy-storage-delete.json`,
  )
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2) + "\n", "utf8")
  return backupPath
}

const chunk = (items, size) => {
  const chunks = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

const deleteStorageObjects = async (objects) => {
  let deleted = 0
  const byBucket = new Map()
  for (const object of objects) {
    const paths = byBucket.get(object.bucket) ?? []
    paths.push(object.path)
    byBucket.set(object.bucket, paths)
  }

  for (const [bucket, paths] of byBucket) {
    for (const batch of chunk(paths, 100)) {
      const { data, error } = await supabase.storage.from(bucket).remove(batch)
      if (error) throw error
      deleted += Array.isArray(data) ? data.length : batch.length
      console.log(`[storage] bucket=${bucket} removed=${deleted}/${objects.length}`)
    }
  }

  return deleted
}

const clearLegacyColumns = async () => {
  const { error: productError } = await supabase
    .from("products")
    .update({ image_legacy: null, images_legacy: null })
    .or("image_legacy.not.is.null,images_legacy.not.is.null")

  if (productError) throw productError

  const { error: subCategoryError } = await supabase
    .from("sub_categories")
    .update({ image_url_legacy: null })
    .not("image_url_legacy", "is", null)

  if (subCategoryError) throw subCategoryError
}

const countRemainingLegacyRefs = async () => {
  const { refs } = await fetchLegacyRefs()
  return refs.length
}

const main = async () => {
  if (!apply && !args.has("--dry-run")) {
    throw new Error("Pick one mode: --dry-run or --apply.")
  }

  const { products, subCategories, refs } = await fetchLegacyRefs()
  const { objects, unsupported } = buildPlan(refs)
  const summary = {
    products: products.length,
    subCategories: subCategories.length,
    legacySupabaseRefs: refs.length,
    uniqueStorageObjects: objects.length,
    unsupportedRefs: unsupported.length,
    objectsByBucket: summarizeByBucket(objects),
  }

  if (!apply) {
    console.log(JSON.stringify({ mode: "dry-run", ...summary }, null, 2))
    return
  }

  if (unsupported.length > 0) {
    console.log(JSON.stringify({ mode: "apply-blocked", ...summary }, null, 2))
    throw new Error("Unsupported legacy Supabase URLs found. No files deleted.")
  }

  const backupPath = saveBackup({
    products,
    subCategories,
    refs,
    objects,
    unsupported,
  })
  console.log(`[backup] ${path.relative(process.cwd(), backupPath)}`)

  const deletedObjects = await deleteStorageObjects(objects)
  await clearLegacyColumns()
  const remainingLegacyRefs = await countRemainingLegacyRefs()

  console.log(
    JSON.stringify(
      {
        mode: "apply",
        ...summary,
        deletedObjects,
        remainingLegacySupabaseRefs: remainingLegacyRefs,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
