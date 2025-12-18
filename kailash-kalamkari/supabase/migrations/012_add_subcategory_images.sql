-- Add image_url column to sub_categories for storing subcategory images
ALTER TABLE public.sub_categories
ADD COLUMN IF NOT EXISTS image_url text;

-- Optional: document the purpose of the column for future contributors
COMMENT ON COLUMN public.sub_categories.image_url IS 'Public image URL stored in Supabase storage for subcategory cards.';
