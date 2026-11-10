-- Run this SQL once in Supabase > SQL Editor.
create table if not exists public.cagnotte_donations (
  capture_id text primary key,
  amount_eur numeric(10,2) not null check (amount_eur > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.cagnotte_totals (
  id integer primary key check (id = 1),
  total_eur numeric(10,2) not null default 0,
  donor_count integer not null default 0
);
insert into public.cagnotte_totals (id, total_eur, donor_count)
values (1, 0, 0) on conflict (id) do nothing;

create or replace function public.record_cagnotte_donation(p_capture_id text, p_amount numeric)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_amount <= 0 then raise exception 'Invalid donation amount'; end if;
  insert into public.cagnotte_donations(capture_id, amount_eur)
  values (p_capture_id, p_amount)
  on conflict (capture_id) do nothing;
  if found then
    update public.cagnotte_totals
    set total_eur = total_eur + p_amount,
        donor_count = donor_count + 1
    where id = 1;
  end if;
end;
$$;
revoke all on function public.record_cagnotte_donation(text, numeric) from public, anon, authenticated;
grant execute on function public.record_cagnotte_donation(text, numeric) to service_role;
revoke all on public.cagnotte_donations from anon, authenticated;
revoke all on public.cagnotte_totals from anon, authenticated;
grant select on public.cagnotte_totals to service_role;
