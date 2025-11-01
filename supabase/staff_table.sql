create table if not exists staff (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('admin', 'waiter', 'kitchen')),
  phone text,
  address text,
  emergency_contact text,
  joining_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for quick lookup
create index if not exists staff_email_idx on staff(email);

-- Add trigger for updating updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_staff_updated_at
  before update on staff
  for each row
  execute function update_updated_at_column(); 