select
  race_id as raceId,
  horse_number as horseNumber,
  horse_id as horseId,
  sex,
  finishing_time as finishingTime,
  length as margin,
  horse_weight as horseWeight
from
  race_result
where
  cast(order_of_finish as int) <> 0;
