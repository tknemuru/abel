select
  race_id as raceId,
  cast(order_of_finish as int) as orderOfFinish,
  horse_number as horseNumber,
  odds,
  sex,
  age,
  jockey_id as jockeyId,
  popularity,
  trainer_id as trainerId,
  rowid
from
  race_result
where
  cast(order_of_finish as int) <> 0
  and rowid <= 100000
--  and race_id % 3 = 0
