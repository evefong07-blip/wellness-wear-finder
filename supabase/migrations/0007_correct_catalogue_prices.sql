-- Correct the three current catalogue price ranges used by matching and lead guidance.
update product_categories
set budget_min = 200, budget_max = 220
where name = 'Knee Supporter';

update product_categories
set budget_min = 95, budget_max = 120
where name = 'Wellness Socks';

update product_categories
set budget_min = 70, budget_max = 80
where name = 'Wellness Eye Mask';
