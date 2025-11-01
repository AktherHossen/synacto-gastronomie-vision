-- Create menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(available);
CREATE INDEX IF NOT EXISTS idx_menu_items_created_at ON public.menu_items(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow all authenticated users to read menu items
CREATE POLICY "Allow authenticated users to read menu items" ON public.menu_items
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert menu items
CREATE POLICY "Allow authenticated users to insert menu items" ON public.menu_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update menu items
CREATE POLICY "Allow authenticated users to update menu items" ON public.menu_items
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete menu items
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

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_menu_items_updated_at 
    BEFORE UPDATE ON public.menu_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.menu_items (name, description, price, category, available) VALUES
('Margherita Pizza', 'Classic tomato sauce with mozzarella cheese', 12.99, 'main-courses', true),
('Caesar Salad', 'Fresh romaine lettuce with Caesar dressing', 8.99, 'salads', true),
('Chocolate Cake', 'Rich chocolate cake with vanilla ice cream', 6.99, 'desserts', true),
('Espresso', 'Single shot of Italian espresso', 3.50, 'beverages', true),
('Garlic Bread', 'Toasted bread with garlic butter', 4.99, 'appetizers', true)
ON CONFLICT (id) DO NOTHING; 