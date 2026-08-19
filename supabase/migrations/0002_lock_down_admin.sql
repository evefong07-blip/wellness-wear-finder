-- Sprint 3: keep visitor submissions public while protecting distributor data.
create extension if not exists pgcrypto;

create table if not exists admin_email_hashes (
  email_hash text primary key,
  created_at timestamptz not null default now()
);

alter table admin_email_hashes enable row level security;
revoke all on admin_email_hashes from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from admin_email_hashes
    where email_hash = encode(extensions.digest(lower(coalesce(auth.jwt() ->> 'email', '')), 'sha256'), 'hex')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "product_categories_v1_read" on product_categories;
drop policy if exists "product_categories_v1_write" on product_categories;
create policy "product_categories_public_read"
  on product_categories for select
  to anon, authenticated
  using (true);

drop policy if exists "assessments_v1_read" on assessments;
drop policy if exists "assessments_v1_write" on assessments;
create policy "assessments_public_insert"
  on assessments for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
create policy "assessments_admin_read"
  on assessments for select
  to authenticated
  using (public.is_admin());
create policy "assessments_admin_update"
  on assessments for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Visitors can update only the fitting fields for an unguessable assessment UUID.
create or replace function public.request_assessment_fitting(
  assessment_id uuid,
  preferred_time text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if preferred_time is null or length(trim(preferred_time)) = 0 then
    raise exception 'Preferred fitting time is required';
  end if;

  update assessments
  set preferred_next_step = 'fitting', fitting_preferred_time = preferred_time
  where id = assessment_id;

  return found;
end;
$$;

revoke all on function public.request_assessment_fitting(uuid, text) from public;
grant execute on function public.request_assessment_fitting(uuid, text) to anon, authenticated;
