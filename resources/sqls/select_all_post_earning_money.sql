select
  ret0_race_id as raceId,
  ret0_horse_id as horseId,
  ifnull(ret1_top_earning_money * (ret1_horse_count - ret1_order_of_finish), 0)
  + ifnull(ret2_top_earning_money * (ret2_horse_count - ret2_order_of_finish), 0)
  + ifnull(ret3_top_earning_money * (ret3_horse_count - ret3_order_of_finish), 0)
  + ifnull(ret4_top_earning_money * (ret4_horse_count - ret4_order_of_finish), 0) as postMoneys
from
  result_post_history
