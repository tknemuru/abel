select distinct
  horse_id as horseId
  from
    race_result
  where
    cast(order_of_finish as int) <> 0
/*
    and ((race_date_year = 2019 and race_date_month = 12)
         or race_date_year = 2020)
*/
  order by
    horse_id;
