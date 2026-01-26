-- Payout Requests Table for Multi-Vendor Marketplace
-- Run this SQL in your Supabase SQL editor to create the payout_requests table

create table if not exists public.payout_requests (
  id uuid not null default extensions.uuid_generate_v4 (),
  seller_id uuid not null,
  amount numeric(10, 2) not null,
  payment_method text not null default 'bank_transfer'::text,
  bank_details jsonb null,
  status text not null default 'pending'::text,
  admin_notes text null,
  created_at timestamp with time zone null default now(),
  processed_at timestamp with time zone null,
  updated_at timestamp with time zone null default now(),
  constraint payout_requests_pkey primary key (id),
  constraint payout_requests_seller_id_fkey foreign key (seller_id) references users (id) on delete cascade,
  constraint payout_requests_amount_check check ((amount > (0)::numeric)),
  constraint payout_requests_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'approved'::text,
          'rejected'::text,
          'completed'::text
        ]
      )
    )
  ),
  constraint payout_requests_payment_method_check check (
    (
      payment_method = any (
        array[
          'bank_transfer'::text,
          'interac'::text,
          'paypal'::text
        ]
      )
    )
  )
) tablespace pg_default;

-- Create indexes for faster queries
create index if not exists idx_payout_requests_seller_id on public.payout_requests using btree (seller_id) tablespace pg_default;
create index if not exists idx_payout_requests_status on public.payout_requests using btree (status) tablespace pg_default;
create index if not exists idx_payout_requests_created_at on public.payout_requests using btree (created_at desc) tablespace pg_default;

-- Enable Row Level Security
alter table public.payout_requests enable row level security;

-- RLS Policies

-- Sellers can view their own payout requests
create policy "Users can view their own payout requests"
  on public.payout_requests for select
  using (auth.uid() = seller_id);

-- Sellers can create payout requests
create policy "Users can create payout requests"
  on public.payout_requests for insert
  with check (auth.uid() = seller_id);

-- Admins can view all payout requests
create policy "Admins can view all payout requests"
  on public.payout_requests for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );

-- Admins can update payout requests (approve/reject/complete)
create policy "Admins can update payout requests"
  on public.payout_requests for update
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );

-- Trigger to update updated_at timestamp
create trigger update_payout_requests_updated_at
  before update on payout_requests
  for each row
  execute function update_updated_at_column();
