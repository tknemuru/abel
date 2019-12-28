select
  $$columnName as $$columnJpName,
  count(*) as 買い目数,
  avg(case when order_of_finish = 1 then
      odds
    else
      0
    end) * 100.0 as 回収率
  from
    (select * from race_result limit 100000)
  where
    cast(order_of_finish as int) <> 0
  group by
    $$columnName;
