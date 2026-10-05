-- Campaigns and their target accounts.
-- Instagram accounts are plain handles: no account linking.

create type public.campaign_status as enum ('active', 'paused');

create domain public.instagram_handle as text
  check (value ~ '^[a-z0-9._]{1,30}$');

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  instagram_handle public.instagram_handle not null,
  status public.campaign_status not null default 'active',
  created_at timestamptz not null default now(),
  -- Target for the composite foreign key below
  unique (id, user_id)
);

create index campaigns_user_id_idx on public.campaigns (user_id);

alter table public.campaigns enable row level security;

-- Inserts go through create_campaign() so validation lives in one place.
create policy "Users can read their own campaigns"
  on public.campaigns for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can update their own campaigns"
  on public.campaigns for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own campaigns"
  on public.campaigns for delete to authenticated
  using ((select auth.uid()) = user_id);


-- user_id is denormalized so RLS stays a simple indexed equality.
-- The composite foreign key guarantees it matches the campaign's owner.
create table public.campaign_targets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null,
  user_id uuid not null,
  handle public.instagram_handle not null,
  created_at timestamptz not null default now(),
  unique (campaign_id, handle),
  unique (id, campaign_id, user_id),
  foreign key (campaign_id, user_id)
    references public.campaigns (id, user_id) on delete cascade
);

create index campaign_targets_user_id_idx on public.campaign_targets (user_id);

alter table public.campaign_targets enable row level security;

create policy "Users can read their own targets"
  on public.campaign_targets for select to authenticated
  using ((select auth.uid()) = user_id);


-- Creates a campaign and its targets in one transaction.
-- Handles are normalized (trimmed, lowercased, leading @ removed) and deduplicated.
create function public.create_campaign(p_instagram_handle text, p_targets text[])
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_campaign_id uuid;
  v_targets text[];
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select coalesce(array_agg(distinct h), '{}') into v_targets
  from (
    select lower(ltrim(trim(t), '@')) as h
    from unnest(p_targets) as t
  ) normalized
  where h <> '';

  if cardinality(v_targets) = 0 then
    raise exception 'A campaign needs at least one target account' using errcode = '22023';
  end if;

  if cardinality(v_targets) > 50 then
    raise exception 'A campaign can have at most 50 target accounts' using errcode = '22023';
  end if;

  insert into public.campaigns (user_id, instagram_handle)
  values (v_user_id, lower(ltrim(trim(p_instagram_handle), '@')))
  returning id into v_campaign_id;

  insert into public.campaign_targets (campaign_id, user_id, handle)
  select v_campaign_id, v_user_id, unnest(v_targets);

  return v_campaign_id;
end;
$$;

revoke execute on function public.create_campaign(text, text[]) from public, anon;
grant execute on function public.create_campaign(text, text[]) to authenticated;
