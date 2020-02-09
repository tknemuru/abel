select
  race_id as raceId
from
  race_result
--where
--  race_id between 33500 and 33900
group by race_id
order by race_id