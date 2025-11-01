-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255),
  table_number VARCHAR(50),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  customer_phone TEXT,
  order_type TEXT CHECK (order_type IN ('delivery', 'takeaway', 'dine_in')),
  customer_email TEXT,
  table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fiscal receipts table
CREATE TABLE IF NOT EXISTS fiscal_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  items JSONB NOT NULL,
  subtotal_net NUMERIC NOT NULL,
  total_vat NUMERIC NOT NULL,
  total_gross NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  tse_signature TEXT NOT NULL,
  fiscal_memory_serial TEXT NOT NULL,
  cashier_name TEXT,
  cancelled BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (adjust as needed for your auth setup)
CREATE POLICY "Allow authenticated users to manage orders" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage order items" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at for orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint to orders table
ALTER TABLE public.orders
ADD CONSTRAINT fk_orders_staff
FOREIGN KEY (created_by) REFERENCES public.staff(id)
ON DELETE SET NULL;

-- Create trigger to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = CONCAT('ORD-', LPAD(CAST(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) AS INTEGER), 10, '0'));
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();

-- Add table_id column to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS table_id UUID;

-- Add foreign key constraint to orders table
ALTER TABLE public.orders
ADD CONSTRAINT fk_orders_tables
FOREIGN KEY (table_id) REFERENCES public.tables(id)
ON DELETE SET NULL; 