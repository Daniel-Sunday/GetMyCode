-- Create sessions table
create table sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Create attendees table
create table attendees (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  email text not null,
  code text not null,
  is_claimed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint attendees_session_id_email_key unique (session_id, email),
  constraint attendees_session_id_code_key unique (session_id, code)
);

-- Create otp_tokens table
create table otp_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  session_id uuid not null references sessions(id) on delete cascade,
  token text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table sessions enable row level security;
alter table attendees enable row level security;
alter table otp_tokens enable row level security;

-- Policies for sessions
-- Allow public SELECT on sessions (so attendees can pick their session)
create policy "Allow public SELECT on sessions" on sessions
  for select using (true);

-- Policies for attendees
-- Allow public SELECT and UPDATE on attendees (for OTP flow)
create policy "Allow public SELECT on attendees" on attendees
  for select using (true);

create policy "Allow public UPDATE on attendees" on attendees
  for update using (true);

-- Policies for otp_tokens
-- Allow public SELECT and INSERT on otp_tokens
create policy "Allow public SELECT on otp_tokens" on otp_tokens
  for select using (true);

create policy "Allow public INSERT on otp_tokens" on otp_tokens
  for insert with check (true);
