select
  *
from
  result_race_history
where
  ret0_race_id between $from and $to
order by
  ret0_race_id,
  ret0_order_of_finish
