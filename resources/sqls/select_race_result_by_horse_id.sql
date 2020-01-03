select
  race_id as raceId,
  horse_number as horseNumber,
  horse_id as horseId,
  date
  from
    race_result rr
  inner join
    race_info ri
  on
    rr.race_id = ri.id
  where
    horse_id = $horseId
    and cast(order_of_finish as int) <> 0
  order by
    ri.date desc;
