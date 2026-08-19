-- Authorize the distributor without storing their email address in the database.
insert into admin_email_hashes (email_hash)
values ('5da614e3ed66f714017f82688fc22cc87451b257df02fbaf6fdfc84d5a0cecc7')
on conflict (email_hash) do nothing;
