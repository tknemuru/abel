select
  *
from
  result_post_history
where
  ret0_race_id in (?#)
order by
  ret0_race_id,
  ret0_horse_number
