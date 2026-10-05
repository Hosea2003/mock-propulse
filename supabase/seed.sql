-- Demo data for local development.
-- Login: demo@propulse.dev / password123

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  'd0d0d0d0-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'demo@propulse.dev',
  extensions.crypt('password123', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(),
  '', '', '', ''
);

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(),
  'd0d0d0d0-0000-4000-8000-000000000001',
  'd0d0d0d0-0000-4000-8000-000000000001',
  'email',
  '{"sub":"d0d0d0d0-0000-4000-8000-000000000001","email":"demo@propulse.dev","email_verified":true}',
  now(), now(), now()
);

update public.profiles set plan_id = 'croissance'
where id = 'd0d0d0d0-0000-4000-8000-000000000001';

insert into public.campaigns (id, user_id, instagram_handle) values
  ('c0c0c0c0-0000-4000-8000-000000000001', 'd0d0d0d0-0000-4000-8000-000000000001', 'wilma.cc'),
  ('c0c0c0c0-0000-4000-8000-000000000002', 'd0d0d0d0-0000-4000-8000-000000000001', 'bro.bread');

insert into public.campaign_targets (campaign_id, user_id, handle)
select 'c0c0c0c0-0000-4000-8000-000000000001'::uuid, 'd0d0d0d0-0000-4000-8000-000000000001'::uuid, h
from unnest(array['cyclingweekly', 'gravel.life', 'strava', 'rapha', 'velo.paris']) as h
union all
select 'c0c0c0c0-0000-4000-8000-000000000002'::uuid, 'd0d0d0d0-0000-4000-8000-000000000001'::uuid, h
from unnest(array['sourdough.club', 'paris.food', 'boulangerie.lab']) as h;

-- 35 days of results (5 weeks, for the week-over-week chart), oldest first so the quota caps apply in order.
-- Each target gets a stable base follow-back rate (3-13%) derived from its handle.
select setseed(0.42);

do $$
declare
  t public.campaign_targets;
  d integer;
  base_rate numeric;
begin
  for d in reverse 34..0 loop
    for t in select * from public.campaign_targets order by handle loop
      base_rate := 0.03 + (abs(hashtext(t.handle)) % 100) / 1000.0;
      perform public.record_daily_result(
        t.id,
        current_date - d,
        20 + floor(random() * 40)::integer,
        greatest(0, base_rate + (random()::numeric - 0.5) * 0.04)
      );
    end loop;
  end loop;
end;
$$;
