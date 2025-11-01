CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Reserved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    grid_x INT DEFAULT 0,
    grid_y INT DEFAULT 0,
    grid_w INT DEFAULT 2,
    grid_h INT DEFAULT 2
);

-- Enable RLS
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- Policies for tables
CREATE POLICY "Allow all access to authenticated users"
ON public.tables
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add some sample data
INSERT INTO public.tables (name, status) VALUES 
('Table 1', 'Available'),
('Table 2', 'Occupied'),
('Table 3', 'Available'),
('Table 4', 'Reserved'),
('Bar Seat 1', 'Available'),
('Patio 1', 'Occupied'); 