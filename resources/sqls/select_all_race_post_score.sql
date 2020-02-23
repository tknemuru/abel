select
  ret0_race_id as raceId,
  ret0_horse_number as horseNumber,
  ifnull(ret0_horse_count - ret0_order_of_finish, 0) + ifnull(ret1_horse_count - ret1_order_of_finish, 0) +  ifnull(ret2_horse_count - ret2_order_of_finish, 0) +  ifnull(ret3_horse_count - ret3_order_of_finish, 0) +  ifnull(ret4_horse_count - ret4_order_of_finish, 0) as score
from
  result_race_history
order by
  ret0_race_id
  , ret0_horse_number
