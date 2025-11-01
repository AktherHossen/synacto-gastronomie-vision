-- Fix Menu Items Insert Error Migration
-- This script ensures the menu_items table has the correct schema for the available column

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
        -- Add the available column with correct specifications
        ALTER TABLE public.menu_items 
        ADD COLUMN available BOOLEAN DEFAULT true NOT NULL;
        
        RAISE NOTICE 'Added available column to menu_items table';
    ELSE
        RAISE NOTICE 'Available column already exists in menu_items table';
    END IF;
END $$;

-- Step 3: Fix existing available column if it has wrong specifications
DO $$
BEGIN
    -- Check if available column exists but has wrong data type
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'available'
        AND table_schema = 'public'
        AND data_type != 'boolean'
    ) THEN
        -- Drop and recreate the column with correct type
        ALTER TABLE public.menu_items DROP COLUMN available;
        ALTER TABLE public.menu_items ADD COLUMN available BOOLEAN DEFAULT true NOT NULL;
        RAISE NOTICE 'Fixed available column data type to boolean';
    END IF;
    
    -- Check if available column is nullable
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'available'
        AND table_schema = 'public'
        AND is_nullable = 'YES'
    ) THEN
        -- Update any NULL values to true first
        UPDATE public.menu_items SET available = true WHERE available IS NULL;
        -- Make column NOT NULL
        ALTER TABLE public.menu_items ALTER COLUMN available SET NOT NULL;
        RAISE NOTICE 'Made available column NOT NULL';
    END IF;
    
    -- Check if available column has wrong default
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'available'
        AND table_schema = 'public'
        AND (column_default IS NULL OR column_default != 'true')
    ) THEN
        -- Set correct default value
        ALTER TABLE public.menu_items ALTER COLUMN available SET DEFAULT true;
        RAISE NOTICE 'Set available column default to true';
    END IF;
END $$;

-- Step 4: Update any existing NULL values to true
UPDATE public.menu_items 
SET available = true 
WHERE available IS NULL;

-- Step 5: Ensure the column has all correct specifications
ALTER TABLE public.menu_items 
ALTER COLUMN available SET NOT NULL;

ALTER TABLE public.menu_items 
ALTER COLUMN available SET DEFAULT true;

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(available);
CREATE INDEX IF NOT EXISTS idx_menu_items_created_at ON public.menu_items(created_at);

-- Step 7: Enable Row Level Security (RLS)
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Step 8: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to read menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow authenticated users to insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow authenticated users to update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow authenticated users to delete menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow anonymous users to read menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow anonymous users to insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow anonymous users to update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow anonymous users to delete menu items" ON public.menu_items;

-- Step 9: Create RLS policies
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

-- Step 10: Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 11: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER update_menu_items_updated_at 
    BEFORE UPDATE ON public.menu_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 12: Insert sample data if table is empty
INSERT INTO public.menu_items (name, description, price, category, available) 
SELECT * FROM (VALUES
    ('Margherita Pizza', 'Classic tomato sauce with mozzarella cheese', 12.99, 'main-courses', true),
    ('Caesar Salad', 'Fresh romaine lettuce with Caesar dressing', 8.99, 'salads', true),
    ('Chocolate Cake', 'Rich chocolate cake with vanilla ice cream', 6.99, 'desserts', true),
    ('Espresso', 'Single shot of Italian espresso', 3.50, 'beverages', true),
    ('Garlic Bread', 'Toasted bread with garlic butter', 4.99, 'appetizers', true)
) AS v(name, description, price, category, available)
WHERE NOT EXISTS (SELECT 1 FROM public.menu_items LIMIT 1);

-- Step 13: Verify the table structure
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

-- Step 14: Show table statistics
SELECT 
    'menu_items' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN available = true THEN 1 END) as available_items,
    COUNT(CASE WHEN available = false THEN 1 END) as unavailable_items
FROM public.menu_items;

-- Step 15: Test insert to verify the fix
DO $$
DECLARE
    test_id BIGINT;
BEGIN
    -- Test insert
    INSERT INTO public.menu_items (name, description, price, category, available)
    VALUES ('Test Item - Migration', 'Test item to verify migration', 9.99, 'appetizers', true)
    RETURNING id INTO test_id;
    
    RAISE NOTICE 'Test insert successful, ID: %', test_id;
    
    -- Clean up test item
    DELETE FROM public.menu_items WHERE id = test_id;
    RAISE NOTICE 'Test item cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test insert failed: %', SQLERRM;
END $$; 