-- Disable RLS on all tables (removes "new row violates row-level security policy" error)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopkeepers DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_visibility DISABLE ROW LEVEL SECURITY;

-- Make price optional (nullable)
ALTER TABLE products ALTER COLUMN price DROP NOT NULL;
