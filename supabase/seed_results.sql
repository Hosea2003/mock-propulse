-- Demo results for the 35 days ending today (5 weeks, for the week-over-week chart).
-- Safe to re-run: it replaces all existing results, so `pnpm db:reseed` brings a
-- stale local database back to the current date without a full reset.
-- Kept as a single statement because `supabase db query -f` rejects multi-statement files.

do $$
declare
  t public.campaign_targets;
  d integer;
  base_rate numeric;
begin
  delete from public.daily_results;
  perform setseed(0.42);

  -- Oldest first so the quota caps apply in order.
  for d in reverse 34..0 loop
    for t in select * from public.campaign_targets order by handle loop
      -- Each target gets a stable base follow-back rate (3-13%) derived from its handle
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
