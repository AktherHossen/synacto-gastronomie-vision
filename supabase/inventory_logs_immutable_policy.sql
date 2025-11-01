-- Enable Row Level Security (RLS)
alter table inventory_logs enable row level security;

-- Allow INSERT for authenticated users
create policy "Allow insert for authenticated users" on inventory_logs
  for insert
  to authenticated
  using (true);

-- Disallow UPDATE for everyone
create policy "Disallow update for everyone" on inventory_logs
  for update
  to public
  using (false);

-- Disallow DELETE for everyone
create policy "Disallow delete for everyone" on inventory_logs
  for delete
  to public
  using (false); 