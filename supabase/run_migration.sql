-- Comprehensive Migration Script for menu_items table
-- This script ensures the table has all required columns with proper constraints

-- Step 1: Create the menu_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.menu_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    available BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add available column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'available'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.menu_items ADD COLUMN available BOOLEAN DEFAULT true NOT NULL;
        RAISE NOTICE 'Added available column to menu_items table';
    ELSE
        RAISE NOTICE 'Available column already exists in menu_items table';
    END IF;
END $$;

-- Step 3: Update any existing NULL values to true
UPDATE public.menu_items 
SET available = true 
WHERE available IS NULL;

-- Step 4: Ensure the column is NOT NULL and has default value
ALTER TABLE public.menu_items 
ALTER COLUMN available SET NOT NULL;

ALTER TABLE public.menu_items 
ALTER COLUMN available SET DEFAULT true;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(available);
CREATE INDEX IF NOT EXISTS idx_menu_items_created_at ON public.menu_items(created_at);

-- Step 6: Enable Row Level Security (RLS)
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to read menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow authenticated users to insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow authenticated users to update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow authenticated users to delete menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow anonymous users to read menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow anonymous users to insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow anonymous users to update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow anonymous users to delete menu items" ON public.menu_items;

-- Create new RLS policies
CREATE POLICY "Allow authenticated users to read menu items" ON public.menu_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert menu items" ON public.menu_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update menu items" ON public.menu_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete menu items" ON public.menu_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- For development, also allow anonymous access (remove in production)
CREATE POLICY "Allow anonymous users to read menu items" ON public.menu_items
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous users to insert menu items" ON public.menu_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous users to update menu items" ON public.menu_items
    FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous users to delete menu items" ON public.menu_items
    FOR DELETE USING (true);

-- Step 8: Create trigger function for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 9: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER update_menu_items_updated_at 
    BEFORE UPDATE ON public.menu_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Insert sample data if table is empty
INSERT INTO public.menu_items (name, description, price, category, available) 
SELECT * FROM (VALUES
    ('Margherita Pizza', 'Classic tomato sauce with mozzarella cheese', 12.99, 'main-courses', true),
    ('Caesar Salad', 'Fresh romaine lettuce with Caesar dressing', 8.99, 'salads', true),
    ('Chocolate Cake', 'Rich chocolate cake with vanilla ice cream', 6.99, 'desserts', true),
    ('Espresso', 'Single shot of Italian espresso', 3.50, 'beverages', true),
    ('Garlic Bread', 'Toasted bread with garlic butter', 4.99, 'appetizers', true)
) AS v(name, description, price, category, available)
WHERE NOT EXISTS (SELECT 1 FROM public.menu_items LIMIT 1);

-- Step 11: Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 12: Show table statistics
SELECT 
    'menu_items' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN available = true THEN 1 END) as available_items,
    COUNT(CASE WHEN available = false THEN 1 END) as unavailable_items
FROM public.menu_items;

-- Step 13: Create fiscal_receipts table
create table if not exists fiscal_receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_number text not null,
  transaction_id text not null,
  timestamp timestamptz not null,
  items jsonb not null,
  subtotal_net numeric not null,
  total_vat numeric not null,
  total_gross numeric not null,
  payment_method text not null,
  tse_signature text not null,
  fiscal_memory_serial text not null,
  cashier_name text,
  cancelled boolean default false
); 

-- Enable RLS for fiscal_receipts
alter table fiscal_receipts enable row level security;

-- Allow INSERT for authenticated users
create policy "Allow insert for authenticated users" on fiscal_receipts
  for insert
  to authenticated
  with check (true);

-- Allow SELECT for authenticated users
create policy "Allow select for authenticated users" on fiscal_receipts
  for select
  to authenticated
  using (true);

-- Disallow UPDATE for everyone
create policy "Disallow update for everyone" on fiscal_receipts
  for update
  to public
  using (false);

-- Disallow DELETE for everyone
create policy "Disallow delete for everyone" on fiscal_receipts
  for delete
  to public
  using (false);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fiscal_receipts_timestamp ON fiscal_receipts(timestamp);
CREATE INDEX IF NOT EXISTS idx_fiscal_receipts_receipt_number ON fiscal_receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_fiscal_receipts_transaction_id ON fiscal_receipts(transaction_id); 