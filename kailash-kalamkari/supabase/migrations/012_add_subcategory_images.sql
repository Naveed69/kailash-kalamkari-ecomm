-- Add image_url column to sub_categories for storing subcategory images
ALTER TABLE public.sub_categories
ADD COLUMN IF NOT EXISTS image_url text;

-- Optional: document the purpose of the column for future contributors
COMMENT ON COLUMN public.sub_categories.image_url IS 'Cloudflare Image ID for subcategory cards; legacy URLs may remain temporarily during image migration.';
