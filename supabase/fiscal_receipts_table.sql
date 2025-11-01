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

-- Enable RLS
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