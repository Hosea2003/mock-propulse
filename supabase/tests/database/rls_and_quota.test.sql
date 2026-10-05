begin;
create extension if not exists pgtap with schema extensions;

select plan(16);

-- Two users; profiles are created by the signup trigger
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.dev'),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.dev');

create function pg_temp.login_as(p_user_id uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', p_user_id, 'role', 'authenticated')::text, true);
$$;

-- ── Profiles ────────────────────────────────────────────────────────────
select is(
  (select plan_id from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'visibilite',
  'New users get a profile on the Visibilité plan'
);

-- ── create_campaign ─────────────────────────────────────────────────────
select pg_temp.login_as('11111111-1111-1111-1111-111111111111');
select lives_ok(
  $$ select public.create_campaign('@Alice.Brand', array[' @Target_One ', 'target_one', 'target_two', '']) $$,
  'Alice can create a campaign'
);
select is(
  (select instagram_handle::text from public.campaigns),
  'alice.brand',
  'Campaign handle is normalized'
);
select results_eq(
  $$ select handle::text from public.campaign_targets order by handle $$,
  $$ values ('target_one'), ('target_two') $$,
  'Target handles are normalized and deduplicated'
);
select throws_ok(
  $$ select public.create_campaign('alice.brand', array['', '  ']) $$,
  '22023', null,
  'A campaign needs at least one target'
);
select throws_ok(
  $$ select public.create_campaign('not a handle!', array['target']) $$,
  '23514', null,
  'Invalid Instagram handles are rejected'
);

select pg_temp.login_as('22222222-2222-2222-2222-222222222222');
select public.create_campaign('bob.bakery', array['bread_lover']);

-- ── Isolation between users ─────────────────────────────────────────────
select results_eq(
  $$ select instagram_handle::text from public.campaigns $$,
  $$ values ('bob.bakery') $$,
  'Bob only sees his own campaign'
);
select is_empty(
  $$ select 1 from public.campaign_targets where user_id = '11111111-1111-1111-1111-111111111111' $$,
  'Bob cannot see Alice''s targets'
);
update public.campaigns set status = 'paused'
  where user_id = '11111111-1111-1111-1111-111111111111';
delete from public.campaigns
  where user_id = '11111111-1111-1111-1111-111111111111';

reset role;
select is(
  (select status::text from public.campaigns where user_id = '11111111-1111-1111-1111-111111111111'),
  'active',
  'Bob cannot update or delete Alice''s campaign'
);

-- ── Write protection ────────────────────────────────────────────────────
select pg_temp.login_as('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ insert into public.campaigns (instagram_handle) values ('sneaky') $$,
  '42501', null,
  'Campaigns cannot be inserted directly, only through create_campaign()'
);
select throws_ok(
  $$ select public.record_daily_result(gen_random_uuid(), current_date, 10, 0.5) $$,
  '42501', null,
  'Users cannot record results themselves'
);
update public.profiles set plan_id = 'croissance';
select is(
  (select plan_id from public.profiles),
  'visibilite',
  'Users cannot change their plan with a direct update'
);

-- ── Quota (as the service role, like the edge function) ─────────────────
reset role;
set local role service_role;

select is(
  (select interactions from public.record_daily_result(
    (select id from public.campaign_targets where handle = 'target_one'),
    current_date, 4000, 0.1)),
  4000,
  'Interactions within quota are recorded as-is'
);
select is(
  (select interactions from public.record_daily_result(
    (select id from public.campaign_targets where handle = 'target_two'),
    current_date, 4000, 0.1)),
  1000,
  'Interactions are capped at the remaining monthly quota (5 000)'
);
select is(
  (select interactions from public.record_daily_result(
    (select id from public.campaign_targets where handle = 'target_one'),
    current_date, 3000, 0.1)),
  3000,
  'Re-running a day replaces its row instead of adding to it'
);

reset role;
select pg_temp.login_as('11111111-1111-1111-1111-111111111111');
select is(
  (select used from public.my_quota),
  4000,
  'my_quota shows the current month usage'
);

select * from finish();
rollback;
