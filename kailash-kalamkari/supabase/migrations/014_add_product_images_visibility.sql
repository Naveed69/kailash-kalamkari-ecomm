-- Add Cloudflare image gallery and storefront visibility fields expected by the admin UI.

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;

UPDATE public.products
SET is_visible = true
WHERE is_visible IS NULL;

COMMENT ON COLUMN public.products.images IS 'Cloudflare Image IDs for product gallery images; legacy URLs may remain temporarily during migration.';
COMMENT ON COLUMN public.products.is_visible IS 'Controls whether the product appears on customer-facing catalog pages.';
