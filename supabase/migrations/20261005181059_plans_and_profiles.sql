-- Plans (formules) and user profiles.
-- A profile is created automatically for every new auth user.

create table public.plans (
  id text primary key,
  name text not null,
  monthly_interaction_quota integer not null check (monthly_interaction_quota > 0)
);

insert into public.plans (id, name, monthly_interaction_quota) values
  ('visibilite', 'Visibilité', 5000),
  ('croissance', 'Croissance', 10000);

alter table public.plans enable row level security;

create policy "Plans are readable by authenticated users"
  on public.plans for select to authenticated
  using (true);


create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan_id text not null default 'visibilite' references public.plans (id),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Read-only for the owner: the plan can't be changed through a direct update.
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);


create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users created before this migration
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;


-- Demo only: lets a user switch plan to see the quota difference.
create function public.set_plan(p_plan_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  update public.profiles
  set plan_id = p_plan_id
  where id = (select auth.uid());
end;
$$;

revoke execute on function public.set_plan(text) from public, anon;
grant execute on function public.set_plan(text) to authenticated;
