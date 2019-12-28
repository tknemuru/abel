select
  race_id as raceId,
  cast(order_of_finish as int) as orderOfFinish,
  frame_number as frameNumber,
  odds,
  rowid
from
  race_result
where
  cast(order_of_finish as int) <> 0
  and rowid <= 10000
