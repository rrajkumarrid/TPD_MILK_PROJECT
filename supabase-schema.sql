-- ============================================================
-- PRD.143 THONDAPADI MILK CO-OP — SUPABASE DATABASE SCHEMA
-- Run this entire file in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ---- MEMBERS TABLE ----
create table if not exists members (
  id uuid default gen_random_uuid() primary key,
  sl_no integer,
  mem_no text not null,
  name text not null,
  bank_name text not null,
  ifsc_code text not null,
  account_no text not null,
  phone text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---- MILK ENTRIES TABLE ----
create table if not exists milk_entries (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references members(id) on delete cascade,
  entry_date date not null,
  litres numeric(8,2) not null check (litres > 0),
  rate numeric(6,2) not null default 33,
  amount numeric(10,2) generated always as (litres * rate) stored,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ---- SETTINGS TABLE ----
create table if not exists settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

-- Insert default milk price
insert into settings (key, value) values ('milk_price', '33')
  on conflict (key) do nothing;

-- ---- USER ROLES TABLE ----
create table if not exists user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  role text not null check (role in ('admin', 'data_entry')),
  full_name text,
  created_at timestamptz default now()
);

-- ---- ROW LEVEL SECURITY ----
alter table members enable row level security;
alter table milk_entries enable row level security;
alter table settings enable row level security;
alter table user_roles enable row level security;

-- Members: authenticated users can read; only admin can write
create policy "members_read" on members for select to authenticated using (true);
create policy "members_write" on members for all to authenticated
  using (exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin'));

-- Milk entries: authenticated users can read + insert; admin can delete
create policy "entries_read" on milk_entries for select to authenticated using (true);
create policy "entries_insert" on milk_entries for insert to authenticated
  with check (auth.uid() = created_by);
create policy "entries_delete" on milk_entries for delete to authenticated
  using (exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin'));
create policy "entries_update" on milk_entries for update to authenticated
  using (exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin'));

-- Settings: all read; admin write
create policy "settings_read" on settings for select to authenticated using (true);
create policy "settings_write" on settings for all to authenticated
  using (exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin'));

-- User roles: users can read own role; admin reads all
create policy "roles_read_own" on user_roles for select to authenticated
  using (user_id = auth.uid() or exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin'));
create policy "roles_write" on user_roles for all to authenticated
  using (exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin'));

-- ---- INDEXES ----
create index if not exists idx_entries_date on milk_entries(entry_date);
create index if not exists idx_entries_member on milk_entries(member_id);
create index if not exists idx_entries_date_member on milk_entries(entry_date, member_id);

-- ---- SEED: PRD.143 THONDAPADI MEMBERS ----
insert into members (sl_no, mem_no, name, bank_name, ifsc_code, account_no, phone) values
(1,  '1',  'S.SELVERAJ',          'TDCC', 'TNSC0011400', '212458700',        '9655476805'),
(2,  '2',  'M.KASTHURI',          'TDCC', 'TNSC0011400', '713767208',        '7806838551'),
(3,  '3',  'N.DHANAM',            'TDCC', 'TNSC0011400', '711276187',        '9047595264'),
(4,  '4',  'C.KALAIMANI',         'TDCC', 'TNSC0011400', '723362233',        '9786192803'),
(5,  '5',  'V.VIJAYAKUMARI',      'TDCC', 'TNSC0011400', '715359082',        '9943722977'),
(6,  '6',  'S.THAMILARASI',       'TDCC', 'TNSC0011400', '717868032',        '9159610919'),
(7,  '7',  'A.SURIYA',            'TDCC', 'TNSC0011400', '715980248',        '6380186656'),
(8,  '8',  'M.NEDILAMBAL',        'TDCC', 'TNSC0011400', '717860270',        '9751788731'),
(9,  '9',  'B.VASUKI',            'TDCC', 'TNSC0011400', '717832594',        '9361091029'),
(10, '10', 'K.POONKAVANAM',       'TDCC', 'TNSC0011400', '711707171',        '9943273384'),
(11, '11', 'M.RAJA LAKSHMI',      'TDCC', 'TNSC0011400', '717867742',        '9159922734'),
(12, '12', 'A.SAROJA',            'UBI',  'UBIN0544949', '449402010002077',  '9843745583'),
(13, '13', 'K.MUTHTAMIL SELVI',   'TDCC', 'TNSC0011400', '719697039',        '8489097627'),
(14, '14', 'R.DHANAM',            'UBI',  'UBIN0544949', '449402010012508',  '9751347915'),
(15, '15', 'K.ILANJIYAM',         'CNR',  'CNRB0002627', '2627101032722',    '9751348602'),
(16, '16', 'R.PRIYA',             'TDCC', 'TNSC0011400', '728333024',        '9715852033'),
(17, '17', 'T.THAMILARASI',       'UBI',  'UBIN0544949', '449402010016017',  '9159961701'),
(18, '18', 'E.BANUMATHI',         'TDCC', 'TNSC0011400', '732982030',        '8098132872'),
(19, '19', 'R.MEENA',             'TDCC', 'TNSC0011400', '715936742',        '9943529560'),
(20, '20', 'A.VIJYA',             'TDCC', 'TNSC0011400', '721238151',        '9751475092')
on conflict do nothing;

-- ============================================================
-- AFTER RUNNING THIS, DO THE FOLLOWING IN SUPABASE DASHBOARD:
-- 1. Authentication → Users → "Add User" → create admin@coop.com
-- 2. Copy that user's UUID
-- 3. Run this (replace UUID):
--    INSERT INTO user_roles (user_id, role, full_name)
--    VALUES ('PASTE-UUID-HERE', 'admin', 'Admin');
-- ============================================================
