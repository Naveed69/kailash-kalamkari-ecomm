-- Add stock_quantity column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- Add low_stock_threshold for inventory alerts 
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;

-- Add SKU for inventory management
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;

-- Add index for stock queries
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Update existing products to have stock quantity based on in_stock field
UPDATE products 
SET stock_quantity = CASE 
  WHEN in_stock = TRUE THEN 10 
  ELSE 0 
END
WHERE stock_quantity IS NULL OR stock_quantity = 0;
