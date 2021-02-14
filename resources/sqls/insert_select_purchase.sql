insert or replace into purchase
select distinct
  race_id,
  0
from
  race_future