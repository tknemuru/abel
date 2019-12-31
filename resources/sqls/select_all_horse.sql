select distinct
  horse_id as horseId
  from
    race_result
  where
    cast(order_of_finish as int) <> 0
  order by
    horse_id;
