-- Cloudflare Images migration safety rails (image-only).
-- Adds legacy columns so we can rollback image refs after cutover.

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS image_legacy text;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS images_legacy jsonb;

ALTER TABLE public.sub_categories
ADD COLUMN IF NOT EXISTS image_url_legacy text;

