# Database Migration: Fix Menu Items Insert Error

This migration fixes the menu item insert error by ensuring the `available` column exists in the `menu_items` table with proper constraints.

## Problem
The menu item insert was failing because the `available` column might be missing or have incorrect constraints in the database.

## Solution
The migration script `run_migration.sql` will:

1. ✅ Create the `menu_items` table if it doesn't exist
2. ✅ Add the `available` column if it's missing
3. ✅ Set proper constraints (NOT NULL, DEFAULT true)
4. ✅ Update any existing NULL values to true
5. ✅ Create necessary indexes for performance
6. ✅ Set up Row Level Security (RLS) policies
7. ✅ Create triggers for automatic `updated_at` timestamps
8. ✅ Insert sample data if the table is empty

## How to Run the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/run_migration.sql`
4. Paste and execute the script
5. Check the output for any errors or success messages

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push
```

### Option 3: Using psql (if you have direct database access)

```bash
psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -f supabase/run_migration.sql
```

## Verification

After running the migration, you should see:

1. **Table Structure**: The `menu_items` table should have all required columns
2. **Available Column**: Should be `BOOLEAN NOT NULL DEFAULT true`
3. **Sample Data**: 5 sample menu items should be inserted
4. **Indexes**: Performance indexes should be created
5. **RLS Policies**: Security policies should be in place

## Expected Output

The migration will show:
- ✅ "Available column already exists" or "Added available column"
- ✅ Table structure verification
- ✅ Statistics showing total rows and available/unavailable items

## Troubleshooting

### If you get permission errors:
- Ensure your Supabase user has the necessary permissions
- Check that RLS policies are correctly configured

### If the table already exists:
- The migration is safe to run multiple times
- It will only add missing columns and update constraints

### If you need to reset the table:
```sql
DROP TABLE IF EXISTS public.menu_items CASCADE;
-- Then run the migration script again
```

## Next Steps

After running the migration:

1. **Test the Menu page** in your application
2. **Try adding a new menu item** to verify the insert works
3. **Check the browser console** for any remaining errors
4. **Verify data is being saved** to Supabase

## Files Modified

- `supabase/run_migration.sql` - Main migration script
- `supabase/add_available_column_migration.sql` - Specific column migration
- `supabase/MIGRATION_README.md` - This documentation

The existing files are already correct:
- ✅ `src/services/menuService.ts` - Already handles `available` field
- ✅ `src/integrations/supabase/types-with-orders.ts` - Already includes `available` column
- ✅ `src/pages/Menu.tsx` - Already uses the correct service 