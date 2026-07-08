-- Supabase schema for CampusHub
-- Requires: pgcrypto extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users primary key,
  role text check (role in ('student','agent','admin')) default 'student',
  full_name text,
  avatar_url text,
  phone text,
  department text,
  level text,
  university text default 'FUTO',
  created_at timestamptz default now()
);

-- agents
create table if not exists agents (
  id uuid references profiles(id) primary key,
  agent_type text default 'individual' check (agent_type in ('individual','campus_hub_official')),
  agency_name text,
  nin text,
  verified boolean default false,
  approved boolean default false,
  tier text default 'free',
  listing_limit int default 5,
  response_time text,
  avg_rating numeric(2,1),
  total_reviews int default 0,
  created_at timestamptz default now()
);

-- agent_applications
create table if not exists agent_applications (
  id uuid default gen_random_uuid() primary key,
  full_name text,
  phone text,
  whatsapp text,
  area text,
  lodges_managed int,
  nin text,
  declaration boolean default false,
  status text default 'pending' check (status in ('pending','contacted','approved','rejected')),
  created_at timestamptz default now()
);

-- lodges
create table if not exists lodges (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid references agents(id) not null,
  name text not null,
  slug text unique,
  area text,
  landmark text,
  building_amenities text[],
  created_at timestamptz default now()
);

-- room_units
create table if not exists room_units (
  id uuid default gen_random_uuid() primary key,
  lodge_id uuid references lodges(id) on delete cascade,
  room_type text,
  price numeric,
  availability text default 'available' check (availability in ('available','pending','rented')),
  room_amenities text[],
  photos text[],
  created_at timestamptz default now()
);

-- reviews
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  lodge_id uuid references lodges(id) not null,
  student_id uuid references profiles(id) not null,
  rating_water int check (rating_water between 1 and 5),
  rating_electricity int check (rating_electricity between 1 and 5),
  rating_security int check (rating_security between 1 and 5),
  review_text text,
  tenant_type text check (tenant_type in ('verified_tenant','prospective_tenant')),
  created_at timestamptz default now(),
  updated_at timestamptz,
  unique(lodge_id, student_id)
);

-- saved_rooms
create table if not exists saved_rooms (
  user_id uuid references profiles(id),
  room_unit_id uuid references room_units(id),
  created_at timestamptz default now(),
  primary key (user_id, room_unit_id)
);

-- recently_viewed
create table if not exists recently_viewed (
  user_id uuid references profiles(id),
  room_unit_id uuid references room_units(id),
  viewed_at timestamptz default now(),
  primary key (user_id, room_unit_id)
);

-- roommate_posts
create table if not exists roommate_posts (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references profiles(id) not null,
  department text,
  level text,
  budget_range text,
  area_preference text,
  gender_preference text,
  extra_info text,
  status text default 'active' check (status in ('active','closed','expired')),
  expires_at timestamptz default (now() + interval '30 days'),
  created_at timestamptz default now()
);

-- roommate_requests
create table if not exists roommate_requests (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references roommate_posts(id),
  requester_id uuid references profiles(id),
  status text default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz default now()
);

-- notifications
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  type text,
  message text,
  read boolean default false,
  created_at timestamptz default now()
);

-- reports
create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references profiles(id),
  entity_type text,
  entity_id uuid,
  reason text,
  status text default 'pending' check (status in ('pending','investigating','resolved','dismissed')),
  created_at timestamptz default now()
);

-- availability_watches
create table if not exists availability_watches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  room_unit_id uuid references room_units(id),
  created_at timestamptz default now()
);

-- marketplace_items
create table if not exists marketplace_items (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references profiles(id) not null,
  title text not null,
  price decimal not null,
  category text check (category in ('Electronics','Furniture','Kitchen','Books','Other')),
  area text,
  condition text check (condition in ('New','Gently Used','Fair')),
  description text,
  photos text[] default '{}',
  status text default 'active' check (status in ('active','sold','deleted')),
  created_at timestamptz default now()
);

-- service_providers
create table if not exists service_providers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  service_type text not null,
  phone text not null,
  whatsapp text,
  area text,
  description text,
  photo_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- service_applications
create table if not exists service_applications (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  service_type text not null,
  phone text not null,
  whatsapp text,
  area text,
  description text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- Notes: add RLS policies in Supabase console according to your security model.
