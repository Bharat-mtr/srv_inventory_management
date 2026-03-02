-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Product photos (multiple per product)
CREATE TABLE IF NOT EXISTS product_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shopkeepers table
CREATE TABLE IF NOT EXISTS shopkeepers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  unique_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Product visibility (allowlist: row exists = visible to shopkeeper)
CREATE TABLE IF NOT EXISTS product_visibility (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  shopkeeper_id UUID NOT NULL REFERENCES shopkeepers(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, shopkeeper_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_product_photos_product_id ON product_photos(product_id);
CREATE INDEX IF NOT EXISTS idx_product_visibility_shopkeeper ON product_visibility(shopkeeper_id);
CREATE INDEX IF NOT EXISTS idx_product_visibility_product ON product_visibility(product_id);
CREATE INDEX IF NOT EXISTS idx_shopkeepers_unique_code ON shopkeepers(unique_code);

-- Enable RLS (optional, for future auth)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopkeepers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_visibility ENABLE ROW LEVEL SECURITY;

-- Allow all for anon key (prototype - restrict in production with proper auth)
CREATE POLICY "Allow all products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all product_photos" ON product_photos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all shopkeepers" ON shopkeepers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all product_visibility" ON product_visibility FOR ALL USING (true) WITH CHECK (true);
