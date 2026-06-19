# Image System Rules (PRODUCTION)

## 1. Rendering Rules

### Mandatory (Product Pipeline)

All product-related images MUST use `<CloudflareImage />`:

- Product listing (cards, grids)
- Product detail page
- Cart / Orders
- Admin (product management)

NO raw `<img>` allowed in these areas.

### Allowed Exceptions (Non-Product UI)

Raw `<img>` is allowed ONLY for:

1. Static bundled assets:
   - logos
   - icons
   - local decorative images (imported via Vite)
2. Generated images:
   - QR codes
   - canvas outputs
   - base64 / blob URLs
3. External third-party images:
   - user avatars
   - external profile images

These MUST NOT:

- use Supabase storage
- be dynamically generated from DB product data

## 2. Source Rules

`resolveImageSrc` is the ONLY place that builds Cloudflare image URLs.

It must support:

- Cloudflare Image IDs
- Legacy http(s) URLs (fallback during migration)
- Local/static paths (unchanged)
- Empty -> `/placeholder.svg`

## 3. Variant Rules

Strict enforcement:

- `thumb` -> list/grid views
- `medium` -> product detail page
- `full` -> ONLY after user interaction (zoom/modal)

`full` MUST NEVER load on initial render.

## 4. Performance Rules

- No full image on initial load
- No duplicate fetches
- Lazy loading required for non-critical images
- Avoid layout shift (width/height or aspect ratio required)

## 5. Migration Safety

- Fallback MUST support all legacy URLs
- DB MUST NOT be updated before verification
- Resolver MUST NOT break existing data
- Mixed mode (Cloudflare + legacy URLs) must work

## 6. Forbidden Patterns

STRICTLY forbidden in product pipeline:

- Supabase storage URLs in JSX
- `/render/image` usage
- Manual URL construction inside components
- Multiple image systems

## 7. Admin Rules (CRITICAL)

- Admin MUST NOT store Supabase public URLs for product images
- Only Cloudflare Image IDs should be persisted for new uploads
- Legacy data may remain temporarily

## 8. Enforcement Scope

These rules apply STRICTLY to:

- product images
- category images
- any image stored in DB

They DO NOT apply to:

- UI assets
- static design images
- external third-party sources

## 9. Migration Strategy

Phased approach:

Phase 1:

- Product pipeline fully on Cloudflare

Phase 2:

- Admin upload switched to Cloudflare

Phase 3:

- Remove fallback logic

Phase 4:

- Optional: migrate non-critical pages (About, Gallery)

Safe database migration order:

1. Run `npm run images:migrate:dry-run` and inspect the counts.
2. Before any DB update, apply `kailash-kalamkari/supabase/migrations/013_cloudflare_image_rollback.sql` so `image_legacy`, `images_legacy`, and `image_url_legacy` exist in Supabase.
3. Run `npm run images:migrate:upload` to upload Supabase Storage/render URLs to Cloudflare. This only writes `scripts/migrate-cloudflare-images.map.json`.
4. Run `npm run images:migrate:verify` to check Cloudflare API records and delivery variants.
5. Run `npm run images:migrate:apply` only after verification passes. This writes a timestamped backup under `migration-backups/`, preserves original refs in `image_legacy`, `images_legacy`, and `image_url_legacy`, then updates active DB refs to Cloudflare IDs.
6. Keep Supabase Storage images until the storefront and admin have been checked in production. Physical deletion from Supabase is a separate manual confirmation step and is not part of this migration script.

By default, only Supabase Storage/render URLs are migrated. External `http(s)` URLs require the explicit `--include-external` flag.

## 10. Dev Safety

System should warn (not break) when:

- fallback URLs are used
- env variables are missing
- placeholder is returned for non-empty refs

## Goal

Control bandwidth-heavy image delivery while keeping the system stable during migration.
