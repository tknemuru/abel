select distinct
  horse_id as horseId
  from
    race_result
  where
    cast(order_of_finish as int) <> 0
    and race_date_year >= $minYear
    and race_date_month >= $minMonth
  order by
    horse_id;
