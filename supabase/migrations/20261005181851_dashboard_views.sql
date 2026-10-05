-- Aggregations for the dashboard. security_invoker keeps RLS in effect,
-- so each user only aggregates their own rows.

create view public.daily_followers
with (security_invoker = true) as
select
  user_id,
  day,
  sum(interactions)::integer as interactions,
  sum(followers_gained)::integer as followers_gained
from public.daily_results
group by user_id, day;


create view public.target_performance
with (security_invoker = true) as
select
  t.id as target_id,
  t.user_id,
  t.campaign_id,
  t.handle,
  c.instagram_handle as campaign_handle,
  coalesce(sum(r.interactions), 0)::integer as interactions,
  coalesce(sum(r.followers_gained), 0)::integer as followers_gained,
  case when coalesce(sum(r.interactions), 0) = 0 then 0
  else round(sum(r.followers_gained)::numeric / sum(r.interactions), 4) end as follow_back_rate
from public.campaign_targets t
join public.campaigns c on c.id = t.campaign_id
left join public.daily_results r on r.target_id = t.id
group by t.id, c.instagram_handle;
