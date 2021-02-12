select
  race_id as raceId,
  horse_number as horseNumber,
  horse_id as horseId,
  race_date_year as raceDateYear,
  race_date_month as raceDateMonth,
  race_date_day as raceDateDay
  from
    race_result rr
  where
    horse_id = $horseId
    --horse_id = '2008105524'
    and cast(order_of_finish as int) <> 0
  order by
    race_date_year desc,
    race_date_month desc,
    race_date_day desc

