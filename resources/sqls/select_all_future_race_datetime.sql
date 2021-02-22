select distinct
  race.race_id as raceId,
  race.race_name as raceName,
  race.race_start as raceStart,
  race.race_date_year as raceDateYear,
  race.race_date_month as raceDateMonth,
  race.race_date_day as raceDateDay
from
  race_future as race
inner join
  purchase as pu
on
  race.race_id = pu.race_id
where
  1 = 1
  and pu.purchase_status = $purchaseStatus
  and race.race_name not like '%新馬%'
  and race.race_name not like '%障害%'
order by
  race.race_date_year,
  race.race_date_month,
  race.race_date_day

