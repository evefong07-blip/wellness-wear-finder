create table if not exists product_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  description text,
  match_keywords text[] default '{}',
  budget_min numeric,
  budget_max numeric,
  created_at timestamptz not null default now()
);

alter table product_categories enable row level security;
drop policy if exists "product_categories_v1_read" on product_categories;
create policy "product_categories_v1_read" on product_categories for select using (true);
drop policy if exists "product_categories_v1_write" on product_categories;
create policy "product_categories_v1_write" on product_categories for all using (true) with check (true);

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  customer_name text not null,
  whatsapp_number text not null,
  comfort_concern text,
  when_affected text,
  preferred_category_id uuid references product_categories(id),
  budget_range text,
  suggested_category_id uuid references product_categories(id),
  suggestion_source text default 'rule',
  suggestion_confidence numeric default 0,
  review_status text default 'unreviewed',
  preferred_next_step text,
  fitting_preferred_time text,
  created_at timestamptz not null default now()
);

alter table assessments enable row level security;
drop policy if exists "assessments_v1_read" on assessments;
create policy "assessments_v1_read" on assessments for select using (true);
drop policy if exists "assessments_v1_write" on assessments;
create policy "assessments_v1_write" on assessments for all using (true) with check (true);

insert into product_categories (name, description, match_keywords, budget_min, budget_max) values
('Everyday Support Wear', 'Lightweight tops and bodysuits that gently support posture through the day.', array['posture', 'back', 'support', 'slouch', 'spine'], 50, 120),
('Comfort Bottoms', 'Soft, flexible-waist bottoms for all-day ease and movement.', array['legs', 'tight', 'waist', 'hips', 'movement'], 40, 90),
('Sleep & Relax Wear', 'Breathable, relaxed-fit pieces for rest and recovery.', array['sleep', 'night', 'rest', 'relax', 'recover'], 45, 100),
('Active Recovery Wear', 'Compression-friendly pieces for post-workout or post-work recovery.', array['sore', 'tired', 'muscle', 'recovery', 'after work'], 60, 150)
on conflict do nothing;

insert into assessments (customer_name, whatsapp_number, comfort_concern, when_affected, budget_range, suggested_category_id, suggestion_source, suggestion_confidence, review_status, preferred_next_step) values
('Sarah Tan', '81234567', 'Posture and back support during long office hours', 'All day at work', '$50-$100', (select id from product_categories where name = 'Everyday Support Wear'), 'rule', 0.85, 'unreviewed', 'whatsapp'),
('Mei Ling', '92345678', 'Legs feel tired and tight by evening', 'After work', '$40-$90', (select id from product_categories where name = 'Comfort Bottoms'), 'rule', 0.75, 'unreviewed', 'fitting'),
('Priya Kumar', '83456789', 'Trouble relaxing and sleeping comfortably', 'Night time', '$45-$100', (select id from product_categories where name = 'Sleep & Relax Wear'), 'rule', 0.80, 'unreviewed', 'whatsapp'),
('Janice Wong', '94567890', 'Muscle soreness after workouts', 'After exercise', '$60-$150', (select id from product_categories where name = 'Active Recovery Wear'), 'rule', 0.90, 'unreviewed', 'fitting'),
('Grace Lim', '85678901', 'General discomfort sitting all day', 'All day', '$50-$120', (select id from product_categories where name = 'Everyday Support Wear'), 'rule', 0.65, 'unreviewed', 'whatsapp')
on conflict do nothing;