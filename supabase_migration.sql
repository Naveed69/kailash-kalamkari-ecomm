-- Add 'material' column if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS material text;

-- Add 'specifications' column if it doesn't exist (using jsonb for flexibility)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS specifications jsonb DEFAULT '{}'::jsonb;

-- Comment on columns for clarity
COMMENT ON COLUMN public.products.material IS 'Primary material of the product (e.g., Silk, Cotton)';
COMMENT ON COLUMN public.products.specifications IS 'Dynamic key-value pairs for additional product details';

-- Notify PostgREST to reload the schema cache (optional but good practice)
NOTIFY pgrst, 'reload config';