select
  $$columnName as $$columnAlias,
  count(*) as $$countName,
  avg(case when order_of_finish = 1 then
      odds
    else
      0
    end) * 100.0 as $$recoveryRateName
  from
    (select * from race_result limit 100000)
  where
    cast(order_of_finish as int) <> 0
  group by
    $$columnName
  having
    count(*) >= 50
  order by
    avg(case when order_of_finish = 1 then
      odds
    else
      0
    end) desc;
