-- Replace broad demo categories with the three products used by the distributor.
-- Prices are from the Nefful Singapore Catalogue Vol. 2 (June 2026).
do $$
declare
  knee_id uuid;
  socks_id uuid;
  eye_mask_id uuid;
  recovery_id uuid;
begin
  select id into knee_id from product_categories
  where name in ('Knee Supporter', 'Everyday Support Wear')
  order by case when name = 'Knee Supporter' then 0 else 1 end
  limit 1;

  if knee_id is null then
    insert into product_categories (name, description, match_keywords, budget_min, budget_max)
    values ('Knee Supporter', 'A pair of knee supporters for everyday comfort during walking, standing and stairs. Catalogue price: S$165.', array['knee','knees','walking','stairs','joint','support'], 165, 165)
    returning id into knee_id;
  else
    update product_categories set
      name = 'Knee Supporter',
      description = 'A pair of knee supporters for everyday comfort during walking, standing and stairs. Catalogue price: S$165.',
      match_keywords = array['knee','knees','walking','stairs','joint','support'],
      budget_min = 165,
      budget_max = 165
    where id = knee_id;
  end if;

  select id into socks_id from product_categories
  where name in ('Wellness Socks', 'Comfort Bottoms')
  order by case when name = 'Wellness Socks' then 0 else 1 end
  limit 1;

  if socks_id is null then
    insert into product_categories (name, description, match_keywords, budget_min, budget_max)
    values ('Wellness Socks', 'Adult sock options for everyday foot and lower-leg comfort. Catalogue range: S$70-S$115.', array['feet','foot','legs','lower-leg','standing','socks','long day'], 70, 115)
    returning id into socks_id;
  else
    update product_categories set
      name = 'Wellness Socks',
      description = 'Adult sock options for everyday foot and lower-leg comfort. Catalogue range: S$70-S$115.',
      match_keywords = array['feet','foot','legs','lower-leg','standing','socks','long day'],
      budget_min = 70,
      budget_max = 115
    where id = socks_id;
  end if;

  select id into eye_mask_id from product_categories
  where name in ('Wellness Eye Mask', 'Sleep & Relax Wear')
  order by case when name = 'Wellness Eye Mask' then 0 else 1 end
  limit 1;

  if eye_mask_id is null then
    insert into product_categories (name, description, match_keywords, budget_min, budget_max)
    values ('Wellness Eye Mask', 'Eye mask options for quiet rest, travel and winding down. Catalogue range: S$65-S$70.', array['eye','eyes','sleep','night','rest','bedtime','winding down'], 65, 70)
    returning id into eye_mask_id;
  else
    update product_categories set
      name = 'Wellness Eye Mask',
      description = 'Eye mask options for quiet rest, travel and winding down. Catalogue range: S$65-S$70.',
      match_keywords = array['eye','eyes','sleep','night','rest','bedtime','winding down'],
      budget_min = 65,
      budget_max = 70
    where id = eye_mask_id;
  end if;

  select id into recovery_id from product_categories where name = 'Active Recovery Wear' limit 1;
  if recovery_id is not null then
    update assessments set preferred_category_id = knee_id where preferred_category_id = recovery_id;
    update assessments set suggested_category_id = knee_id where suggested_category_id = recovery_id;
    delete from product_categories where id = recovery_id;
  end if;

  update assessments set recommendation_copy = replace(recommendation_copy, 'Everyday Support Wear', 'Knee Supporter') where recommendation_copy like '%Everyday Support Wear%';
  update assessments set recommendation_copy = replace(recommendation_copy, 'Comfort Bottoms', 'Wellness Socks') where recommendation_copy like '%Comfort Bottoms%';
  update assessments set recommendation_copy = replace(recommendation_copy, 'Sleep & Relax Wear', 'Wellness Eye Mask') where recommendation_copy like '%Sleep & Relax Wear%';
  update assessments set recommendation_copy = replace(recommendation_copy, 'Active Recovery Wear', 'Knee Supporter') where recommendation_copy like '%Active Recovery Wear%';
end $$;
