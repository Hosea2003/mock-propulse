-- Monthly interaction quota, enforced in the database.

-- Current month usage for the signed-in user (RLS applies through security_invoker).
create view public.my_quota
with (security_invoker = true) as
select
  p.id as user_id,
  pl.id as plan_id,
  pl.name as plan_name,
  pl.monthly_interaction_quota as quota,
  coalesce(sum(r.interactions), 0)::integer as used
from public.profiles p
join public.plans pl on pl.id = p.plan_id
left join public.daily_results r
  on r.user_id = p.id
  and r.day >= date_trunc('month', current_date)::date
group by p.id, pl.id;


-- Records (or replaces) one target's result for a day, capping interactions
-- at what's left of the owner's monthly quota. Idempotent per (target, day).
create function public.record_daily_result(
  p_target_id uuid,
  p_day date,
  p_interactions integer,
  p_follow_back_rate numeric
)
returns public.daily_results
language plpgsql
set search_path = ''
as $$
declare
  v_target public.campaign_targets;
  v_quota integer;
  v_used integer;
  v_interactions integer;
  v_month_start date := date_trunc('month', p_day)::date;
  v_result public.daily_results;
begin
  select * into strict v_target
  from public.campaign_targets
  where id = p_target_id;

  -- Lock the owner's profile so concurrent calls can't overspend the quota
  select pl.monthly_interaction_quota into v_quota
  from public.profiles p
  join public.plans pl on pl.id = p.plan_id
  where p.id = v_target.user_id
  for update of p;

  select coalesce(sum(interactions), 0) into v_used
  from public.daily_results
  where user_id = v_target.user_id
    and day >= v_month_start
    and day < (v_month_start + interval '1 month')::date
    and not (target_id = p_target_id and day = p_day);

  v_interactions := greatest(0, least(p_interactions, v_quota - v_used));

  insert into public.daily_results
    (target_id, campaign_id, user_id, day, interactions, followers_gained)
  values (
    v_target.id,
    v_target.campaign_id,
    v_target.user_id,
    p_day,
    v_interactions,
    floor(v_interactions * least(greatest(p_follow_back_rate, 0), 1))::integer
  )
  on conflict (target_id, day) do update
    set interactions = excluded.interactions,
        followers_gained = excluded.followers_gained
  returning * into v_result;

  return v_result;
end;
$$;

-- Server-side only: called by the simulation edge function with the service role.
revoke execute on function public.record_daily_result(uuid, date, integer, numeric)
  from public, anon, authenticated;
grant execute on function public.record_daily_result(uuid, date, integer, numeric)
  to service_role;
