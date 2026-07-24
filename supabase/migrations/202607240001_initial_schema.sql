create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('guest', 'registered_user', 'camp_manager', 'camp_team_member', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.camp_status as enum ('pending', 'approved', 'rejected', 'suspended');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.disaster_type as enum ('flood', 'earthquake', 'wildfire', 'landslide', 'storm', 'medical', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.emergency_urgency as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.emergency_status as enum (
    'Submitted',
    'Assigned',
    'Accepted',
    'En Route',
    'Arrived',
    'Resolved',
    'Cancelled'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  role public.user_role not null default 'registered_user',
  province text,
  district text,
  city text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.relief_camps (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid references public.profiles(id) on delete set null,
  name text not null unique,
  description text,
  province text not null,
  district text not null,
  tehsil text,
  address text not null,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  capacity_total integer not null check (capacity_total >= 0),
  capacity_available integer not null check (capacity_available >= 0),
  status public.camp_status not null default 'pending',
  contact_phone text,
  contact_email text,
  supported_disasters public.disaster_type[] not null default array[]::public.disaster_type[],
  services text[] not null default array[]::text[],
  is_accepting_emergencies boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint relief_camps_capacity_check check (capacity_available <= capacity_total)
);

create table if not exists public.camp_team_members (
  id uuid primary key default gen_random_uuid(),
  camp_id uuid not null references public.relief_camps(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Team Member',
  can_update_camp boolean not null default true,
  can_respond_emergencies boolean not null default true,
  created_at timestamptz not null default now(),
  unique (camp_id, user_id)
);

create table if not exists public.camp_supplies (
  id uuid primary key default gen_random_uuid(),
  camp_id uuid not null references public.relief_camps(id) on delete cascade,
  name text not null,
  category text not null,
  quantity integer not null default 0 check (quantity >= 0),
  unit text not null default 'items',
  low_stock_threshold integer not null default 0 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now(),
  unique (camp_id, name)
);

create table if not exists public.emergency_departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  province text,
  district text,
  phone text not null,
  service_type text not null,
  is_national boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.emergencies (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  assigned_camp_id uuid references public.relief_camps(id) on delete set null,
  disaster_type public.disaster_type not null,
  urgency public.emergency_urgency not null,
  status public.emergency_status not null default 'Submitted',
  title text not null,
  description text not null,
  province text not null,
  district text not null,
  address text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  people_count integer not null default 1 check (people_count > 0),
  required_supplies text[] not null default array[]::text[],
  ai_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.emergency_timeline (
  id uuid primary key default gen_random_uuid(),
  emergency_id uuid not null references public.emergencies(id) on delete cascade,
  performed_by uuid references public.profiles(id) on delete set null,
  status public.emergency_status not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  language text not null default 'en',
  topic_allowed boolean not null default true,
  extracted_location text,
  extracted_problem text,
  extracted_urgency public.emergency_urgency,
  recommended_camp_id uuid references public.relief_camps(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  emergency_id uuid references public.emergencies(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists relief_camps_location_idx on public.relief_camps (province, district);
create index if not exists relief_camps_status_idx on public.relief_camps (status);
create index if not exists emergencies_requester_idx on public.emergencies (requester_id);
create index if not exists emergencies_assigned_camp_idx on public.emergencies (assigned_camp_id);
create index if not exists emergencies_status_idx on public.emergencies (status);
create index if not exists emergency_timeline_emergency_idx on public.emergency_timeline (emergency_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists relief_camps_set_updated_at on public.relief_camps;
create trigger relief_camps_set_updated_at
before update on public.relief_camps
for each row execute function public.set_updated_at();

drop trigger if exists camp_supplies_set_updated_at on public.camp_supplies;
create trigger camp_supplies_set_updated_at
before update on public.camp_supplies
for each row execute function public.set_updated_at();

drop trigger if exists emergencies_set_updated_at on public.emergencies;
create trigger emergencies_set_updated_at
before update on public.emergencies
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'registered_user')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_app_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_camp_member(camp uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.camp_team_members
    where camp_id = camp
      and user_id = auth.uid()
  )
$$;

alter table public.profiles enable row level security;
alter table public.relief_camps enable row level security;
alter table public.camp_team_members enable row level security;
alter table public.camp_supplies enable row level security;
alter table public.emergency_departments enable row level security;
alter table public.emergencies enable row level security;
alter table public.emergency_timeline enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles can read own profile" on public.profiles;
create policy "profiles can read own profile"
on public.profiles for select
using (id = auth.uid() or public.current_app_role() = 'admin');

drop policy if exists "profiles can update own profile" on public.profiles;
create policy "profiles can update own profile"
on public.profiles for update
using (id = auth.uid() or public.current_app_role() = 'admin')
with check (id = auth.uid() or public.current_app_role() = 'admin');

drop policy if exists "approved camps are public" on public.relief_camps;
create policy "approved camps are public"
on public.relief_camps for select
using (
  status = 'approved'
  or manager_id = auth.uid()
  or public.current_app_role() in ('admin', 'camp_manager', 'camp_team_member')
);

drop policy if exists "admins manage camps" on public.relief_camps;
create policy "admins manage camps"
on public.relief_camps for all
using (public.current_app_role() = 'admin' or manager_id = auth.uid() or public.is_camp_member(id))
with check (public.current_app_role() = 'admin' or manager_id = auth.uid() or public.is_camp_member(id));

drop policy if exists "camp teams read membership" on public.camp_team_members;
create policy "camp teams read membership"
on public.camp_team_members for select
using (user_id = auth.uid() or public.current_app_role() = 'admin' or public.is_camp_member(camp_id));

drop policy if exists "camp managers manage team" on public.camp_team_members;
create policy "camp managers manage team"
on public.camp_team_members for all
using (
  public.current_app_role() = 'admin'
  or exists (select 1 from public.relief_camps c where c.id = camp_id and c.manager_id = auth.uid())
)
with check (
  public.current_app_role() = 'admin'
  or exists (select 1 from public.relief_camps c where c.id = camp_id and c.manager_id = auth.uid())
);

drop policy if exists "supplies visible with camps" on public.camp_supplies;
create policy "supplies visible with camps"
on public.camp_supplies for select
using (
  exists (
    select 1 from public.relief_camps c
    where c.id = camp_id
      and (c.status = 'approved' or c.manager_id = auth.uid() or public.current_app_role() = 'admin' or public.is_camp_member(c.id))
  )
);

drop policy if exists "camp teams manage supplies" on public.camp_supplies;
create policy "camp teams manage supplies"
on public.camp_supplies for all
using (
  public.current_app_role() = 'admin'
  or exists (select 1 from public.relief_camps c where c.id = camp_id and c.manager_id = auth.uid())
  or public.is_camp_member(camp_id)
)
with check (
  public.current_app_role() = 'admin'
  or exists (select 1 from public.relief_camps c where c.id = camp_id and c.manager_id = auth.uid())
  or public.is_camp_member(camp_id)
);

drop policy if exists "departments are public" on public.emergency_departments;
create policy "departments are public"
on public.emergency_departments for select
using (true);

drop policy if exists "admins manage departments" on public.emergency_departments;
create policy "admins manage departments"
on public.emergency_departments for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

drop policy if exists "emergency visibility" on public.emergencies;
create policy "emergency visibility"
on public.emergencies for select
using (
  requester_id = auth.uid()
  or public.current_app_role() = 'admin'
  or (assigned_camp_id is not null and public.is_camp_member(assigned_camp_id))
  or exists (select 1 from public.relief_camps c where c.id = assigned_camp_id and c.manager_id = auth.uid())
);

drop policy if exists "registered users create emergencies" on public.emergencies;
create policy "registered users create emergencies"
on public.emergencies for insert
with check (requester_id = auth.uid() and public.current_app_role() in ('registered_user', 'camp_manager', 'camp_team_member', 'admin'));

drop policy if exists "authorized users update emergencies" on public.emergencies;
create policy "authorized users update emergencies"
on public.emergencies for update
using (
  requester_id = auth.uid()
  or public.current_app_role() = 'admin'
  or (assigned_camp_id is not null and public.is_camp_member(assigned_camp_id))
  or exists (select 1 from public.relief_camps c where c.id = assigned_camp_id and c.manager_id = auth.uid())
)
with check (
  requester_id = auth.uid()
  or public.current_app_role() = 'admin'
  or (assigned_camp_id is not null and public.is_camp_member(assigned_camp_id))
  or exists (select 1 from public.relief_camps c where c.id = assigned_camp_id and c.manager_id = auth.uid())
);

drop policy if exists "timeline visibility follows emergency" on public.emergency_timeline;
create policy "timeline visibility follows emergency"
on public.emergency_timeline for select
using (
  exists (
    select 1 from public.emergencies e
    where e.id = emergency_id
      and (
        e.requester_id = auth.uid()
        or public.current_app_role() = 'admin'
        or (e.assigned_camp_id is not null and public.is_camp_member(e.assigned_camp_id))
        or exists (select 1 from public.relief_camps c where c.id = e.assigned_camp_id and c.manager_id = auth.uid())
      )
  )
);

drop policy if exists "authorized users create timeline" on public.emergency_timeline;
create policy "authorized users create timeline"
on public.emergency_timeline for insert
with check (
  exists (
    select 1 from public.emergencies e
    where e.id = emergency_id
      and (
        e.requester_id = auth.uid()
        or public.current_app_role() = 'admin'
        or (e.assigned_camp_id is not null and public.is_camp_member(e.assigned_camp_id))
        or exists (select 1 from public.relief_camps c where c.id = e.assigned_camp_id and c.manager_id = auth.uid())
      )
  )
);

drop policy if exists "users read own ai conversations" on public.ai_conversations;
create policy "users read own ai conversations"
on public.ai_conversations for select
using (user_id = auth.uid() or user_id is null or public.current_app_role() = 'admin');

drop policy if exists "users create own ai conversations" on public.ai_conversations;
create policy "users create own ai conversations"
on public.ai_conversations for insert
with check (user_id = auth.uid() or user_id is null);

drop policy if exists "messages follow conversation" on public.ai_messages;
create policy "messages follow conversation"
on public.ai_messages for select
using (
  exists (
    select 1 from public.ai_conversations c
    where c.id = conversation_id
      and (c.user_id = auth.uid() or c.user_id is null or public.current_app_role() = 'admin')
  )
);

drop policy if exists "users create messages in own conversations" on public.ai_messages;
create policy "users create messages in own conversations"
on public.ai_messages for insert
with check (
  exists (
    select 1 from public.ai_conversations c
    where c.id = conversation_id
      and (c.user_id = auth.uid() or c.user_id is null)
  )
);

drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications"
on public.notifications for select
using (user_id = auth.uid() or public.current_app_role() = 'admin');

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications"
on public.notifications for update
using (user_id = auth.uid() or public.current_app_role() = 'admin')
with check (user_id = auth.uid() or public.current_app_role() = 'admin');
