-- Keep prices available as structured budget fields, not inside option-card copy.
update product_categories
set description = 'Everyday knee comfort for walking, standing and stairs.'
where name = 'Knee Supporter';

update product_categories
set description = 'Everyday foot and lower-leg comfort after a long day.'
where name = 'Wellness Socks';

update product_categories
set description = 'Quiet eye rest for travel, bedtime and winding down.'
where name = 'Wellness Eye Mask';
