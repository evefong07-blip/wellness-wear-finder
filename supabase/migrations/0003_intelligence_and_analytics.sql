-- Sprint 4: structured assessment intelligence, lead scoring and event analytics.
alter table assessments add column if not exists parsed_concern text;
alter table assessments add column if not exists parsed_timing text;
alter table assessments add column if not exists parsed_budget_min numeric;
alter table assessments add column if not exists parsed_budget_max numeric;
alter table assessments add column if not exists recommendation_copy text;
alter table assessments add column if not exists lead_score integer not null default 0;
alter table assessments add column if not exists lead_score_reasons text[] not null default '{}';

alter table assessments drop constraint if exists assessments_lead_score_check;
alter table assessments add constraint assessments_lead_score_check check (lead_score between 0 and 100);

-- Backfill existing demo and production leads so the dashboard is useful immediately.
update assessments
set parsed_concern = case
      when comfort_concern ~* 'posture|back|slouch|spine' then 'posture_support'
      when comfort_concern ~* 'leg|waist|hip|lower' then 'lower_body_comfort'
      when comfort_concern ~* 'sleep|night|relax|rest' then 'sleep_relaxation'
      when comfort_concern ~* 'muscle|sore|recover|exercise' then 'active_recovery'
      else 'general_comfort'
    end,
    parsed_timing = case
      when when_affected ~* 'all day|work' then 'all_day'
      when when_affected ~* 'night' then 'night'
      when when_affected ~* 'exercise' then 'after_exercise'
      when when_affected ~* 'morning' then 'morning'
      else 'variable'
    end,
    lead_score = least(100,
      20
      + round(coalesce(suggestion_confidence, 0) * 30)::integer
      + case when preferred_next_step = 'fitting' then 25 else 10 end
      + case when comfort_concern ~* 'posture|back|sleep|leg|muscle|recover' then 15 else 5 end
    ),
    lead_score_reasons = array_remove(array[
      case when coalesce(suggestion_confidence, 0) >= 0.7 then 'Strong category match' else 'Existing enquiry' end,
      case when preferred_next_step = 'fitting' then 'Requested a fitting' else 'Requested WhatsApp follow-up' end,
      case when comfort_concern ~* 'posture|back|sleep|leg|muscle|recover' then 'Specific comfort need' end
    ], null)
where parsed_concern is null;

update assessments a
set recommendation_copy = c.name || ' is a practical place to start based on the comfort need and routine shared in this assessment.'
from product_categories c
where a.suggested_category_id = c.id and a.recommendation_copy is null;

create table if not exists assessment_events (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id) on delete cascade,
  event_type text not null check (event_type in (
    'assessment_started', 'assessment_completed', 'suggestion_shown',
    'whatsapp_clicked', 'fitting_requested'
  )),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table assessment_events enable row level security;
create policy "events_public_insert"
  on assessment_events for insert
  to anon, authenticated
  with check (true);
create policy "events_admin_read"
  on assessment_events for select
  to authenticated
  using (public.is_admin());

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  actor text not null,
  target_id uuid references assessments(id) on delete cascade,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;
create policy "audit_admin_read"
  on audit_logs for select
  to authenticated
  using (public.is_admin());
create policy "audit_admin_insert"
  on audit_logs for insert
  to authenticated
  with check (public.is_admin());

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
  set preferred_next_step = 'fitting',
      fitting_preferred_time = preferred_time,
      lead_score = least(100, lead_score + 20),
      lead_score_reasons = array_append(lead_score_reasons, 'Requested a fitting')
  where id = assessment_id;

  if found then
    insert into assessment_events (assessment_id, event_type)
    values (assessment_id, 'fitting_requested');
  end if;

  return found;
end;
$$;

revoke all on function public.request_assessment_fitting(uuid, text) from public;
grant execute on function public.request_assessment_fitting(uuid, text) to anon, authenticated;
