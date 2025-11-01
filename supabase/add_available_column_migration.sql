-- Migration: Add available column to menu_items table
-- This script ensures the available column exists with proper default value

-- Check if the available column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'available'
        AND table_schema = 'public'
    ) THEN
        -- Add the available column with default value true
        ALTER TABLE public.menu_items 
        ADD COLUMN available BOOLEAN DEFAULT true NOT NULL;
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_menu_items_available 
        ON public.menu_items(available);
        
        RAISE NOTICE 'Added available column to menu_items table';
    ELSE
        RAISE NOTICE 'Available column already exists in menu_items table';
    END IF;
END $$;

-- Update any existing rows that might have NULL values
UPDATE public.menu_items 
SET available = true 
WHERE available IS NULL;

-- Ensure the column is NOT NULL
ALTER TABLE public.menu_items 
ALTER COLUMN available SET NOT NULL;

-- Ensure the default value is set
ALTER TABLE public.menu_items 
ALTER COLUMN available SET DEFAULT true;

-- Verify the column structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
AND column_name = 'available'
AND table_schema = 'public'; 