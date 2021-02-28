select
  race_id as raceId
from
  race_result
where
1 == 1
--  race_id between 33500 and 33900
--  race_id = '201905010809'
and race_date_year = 2021
--and race_date_year in (2019, 2018, 2020)
--and race_date_month in (1)
--and race_date_month in (8, 9, 10)
group by race_id
order by race_id