select
  *
from
  future_race_history
where
  inf_pre0_race_id between $from and $to
order by
  inf_pre0_race_id,
  ret_pre0_horse_number
