-- Create the ingredients table
CREATE TABLE IF NOT EXISTS public.ingredients (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    stock_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    expiry_date DATE NOT NULL,
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON public.ingredients(name);

-- Create an index on expiry_date for expiry tracking
CREATE INDEX IF NOT EXISTS idx_ingredients_expiry ON public.ingredients(expiry_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on ingredients" ON public.ingredients
    FOR ALL USING (true)
    WITH CHECK (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_ingredients_updated_at 
    BEFORE UPDATE ON public.ingredients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.ingredients (name, unit, stock_quantity, expiry_date, cost_per_unit) VALUES
    ('Tomatoes', 'kg', 10.5, '2024-02-15', 2.50),
    ('Flour', 'kg', 25.0, '2024-06-30', 1.20),
    ('Olive Oil', 'l', 5.0, '2024-12-31', 8.00),
    ('Salt', 'kg', 2.0, '2025-01-01', 0.50),
    ('Black Pepper', 'kg', 1.5, '2024-08-15', 15.00)
ON CONFLICT (id) DO NOTHING; 