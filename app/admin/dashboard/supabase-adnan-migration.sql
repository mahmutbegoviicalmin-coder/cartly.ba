-- Payments to Adnan (tool supplier) — run once in the Supabase SQL Editor.
create table if not exists adnan_payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  paid_on date not null default current_date,
  amount numeric(10,2) not null check (amount > 0),
  note text
);

create index if not exists adnan_payments_paid_on_idx on adnan_payments (paid_on);

-- Only the server (service role) reads/writes it.
alter table adnan_payments enable row level security;
