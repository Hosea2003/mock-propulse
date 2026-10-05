-- Daily simulated results, one row per target per day.
-- Written only by the simulation (service role); users can only read their own.

create table public.daily_results (
  id bigint generated always as identity primary key,
  target_id uuid not null,
  campaign_id uuid not null,
  user_id uuid not null,
  day date not null,
  interactions integer not null check (interactions >= 0),
  followers_gained integer not null check (followers_gained between 0 and interactions),
  -- Derived, so it can never disagree with the two columns above
  follow_back_rate numeric(5, 4) generated always as (
    case when interactions = 0 then 0
    else followers_gained::numeric / interactions end
  ) stored,
  created_at timestamptz not null default now(),
  unique (target_id, day),
  foreign key (target_id, campaign_id, user_id)
    references public.campaign_targets (id, campaign_id, user_id) on delete cascade
);

create index daily_results_user_id_day_idx on public.daily_results (user_id, day);
create index daily_results_campaign_id_day_idx on public.daily_results (campaign_id, day);

alter table public.daily_results enable row level security;

create policy "Users can read their own results"
  on public.daily_results for select to authenticated
  using ((select auth.uid()) = user_id);
