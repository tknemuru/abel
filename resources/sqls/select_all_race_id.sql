select
  race_id as raceId
from
  race_result
where
--  race_id between 33500 and 33900
--  race_id = '201905010809'
--  race_id = '201910010411'
--  race_id = '201905010807'

  race_date_year = 2019
  and race_date_month = 11
--  and race_date_day in (2, 3, 9, 10, 16, 17, 23, 24, 30, 31)
--  and race_date_day in (9, 10)
group by race_id
order by race_id