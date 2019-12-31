create view race_result_history
as
select
  -- info
  inf_pre0.id            as inf_pre0_race_id,
  inf_pre0.race_name     as inf_pre0_race_name,
  inf_pre0.surface       as inf_pre0_surface,
  inf_pre0.distance      as inf_pre0_distance,
  inf_pre0.weather       as inf_pre0_weather,
  inf_pre0.surface_state as inf_pre0_surface_state,
  inf_pre0.race_start    as inf_pre0_race_start,
  inf_pre0.race_number   as inf_pre0_race_number,
  inf_pre0.date          as inf_pre0_date,
  inf_pre0.place_detail  as inf_pre0_place_detail,
  inf_pre0.race_class    as inf_pre0_race_class,
  -- info_additional
  inf_add_pre0.digit_surface              as inf_pre0_digit_surface,
  inf_add_pre0.digit_direction            as inf_pre0_digit_direction,
  inf_add_pre0.digit_weather              as inf_pre0_digit_weather,
  inf_add_pre0.digit_surface_state        as inf_pre0_digit_surface_state,
  -- result
  ret_pre0.order_of_finish as inf_pre0_order_of_finish,
  ret_pre0.frame_number       as inf_pre0_frame_number,
  ret_pre0.horse_number       as inf_pre0_horse_number,
  ret_pre0.horse_id           as inf_pre0_horse_id,
  ret_pre0.sex                as inf_pre0_sex,
  ret_pre0.age                as inf_pre0_age,
  ret_pre0.basis_weight       as inf_pre0_basis_weight,
  ret_pre0.jockey_id          as inf_pre0_jockey_id,
  ret_pre0.finishing_time     as inf_pre0_finishing_time,
  ret_pre0.length             as inf_pre0_length,
  ret_pre0.pass               as inf_pre0_pass,
  ret_pre0.last_phase         as inf_pre0_last_phase,
  ret_pre0.odds               as inf_pre0_odds,
  ret_pre0.popularity         as inf_pre0_popularity,
  ret_pre0.horse_weight       as inf_pre0_horse_weight,
  ret_pre0.remark             as inf_pre0_remark,
  ret_pre0.stable             as inf_pre0_stable,
  ret_pre0.trainer_id         as inf_pre0_trainer_id,
  ret_pre0.owner_id           as inf_pre0_owner_id,
  ret_pre0.earning_money      as inf_pre0_earning_money,
  -- result_additional
  ret_add_pre0.digit_sex                       as inf_pre0_digit_sex,
  ret_add_pre0.digit_finishing_time            as inf_pre0_digit_finishing_time,
  ret_add_pre0.digit_length                    as inf_pre0_digit_length,
  ret_add_pre0.pure_horse_weight               as inf_pre0_pure_horse_weight,
  ret_add_pre0.diff_horse_weight               as inf_pre0_diff_horse_weight
from
  race_result ret_pre0
inner join
  race_info inf_pre0
on
  ret_pre0.race_id = inf_pre0.id
left join
  race_info_additional inf_add_pre0
on
  inf_pre0.id = inf_add_pre0.race_id
inner join
  race_result_additional ret_add_pre0
on
  ret_pre0.race_id = ret_add_pre0.race_id
  and ret_pre0.horse_number = ret_add_pre0.horse_number
-- pre1
inner join
  horse_race_history his_pre0
on
  ret_pre0.race_id = his_pre0.race_id
  and ret_pre0.horse_number = his_pre0.horse_number
left join
  race_result ret_pre1
on
  ret_pre1.race_id = his_pre0.pre_race_id
  and ret_pre1.horse_number = his_pre0.pre_horse_number
left join
  race_info inf_pre1
on
  ret_pre1.race_id = inf_pre1.id
left join
  race_info_additional inf_add_pre1
on
  inf_pre1.id = inf_add_pre1.race_id
left join
  race_result_additional ret_add_pre1
on
  ret_pre1.race_id = ret_add_pre1.race_id
  and ret_pre1.horse_number = ret_add_pre1.horse_number
-- pre2
left join
  horse_race_history his_pre1
on
  ret_pre1.race_id = his_pre1.race_id
  and ret_pre1.horse_number = his_pre1.horse_number
left join
  race_result ret_pre2
on
  ret_pre2.race_id = his_pre1.pre_race_id
  and ret_pre2.horse_number = his_pre1.pre_horse_number
left join
  race_info inf_pre2
on
  ret_pre2.race_id = inf_pre2.id
left join
  race_info_additional inf_add_pre2
on
  inf_pre2.id = inf_add_pre2.race_id
left join
  race_result_additional ret_add_pre2
on
  ret_pre2.race_id = ret_add_pre2.race_id
  and ret_pre2.horse_number = ret_add_pre2.horse_number
-- pre3
left join
  horse_race_history his_pre2
on
  ret_pre2.race_id = his_pre2.race_id
  and ret_pre2.horse_number = his_pre2.horse_number
left join
  race_result ret_pre3
on
  ret_pre3.race_id = his_pre2.pre_race_id
  and ret_pre3.horse_number = his_pre2.pre_horse_number
left join
  race_info inf_pre3
on
  ret_pre3.race_id = inf_pre3.id
left join
  race_info_additional inf_add_pre3
on
  inf_pre3.id = inf_add_pre3.race_id
left join
  race_result_additional ret_add_pre3
on
  ret_pre3.race_id = ret_add_pre3.race_id
  and ret_pre3.horse_number = ret_add_pre3.horse_number
-- pre4
left join
  horse_race_history his_pre3
on
  ret_pre3.race_id = his_pre3.race_id
  and ret_pre3.horse_number = his_pre3.horse_number
left join
  race_result ret_pre4
on
  ret_pre4.race_id = his_pre3.pre_race_id
  and ret_pre4.horse_number = his_pre3.pre_horse_number
left join
  race_info inf_pre4
on
  ret_pre4.race_id = inf_pre4.id
left join
  race_info_additional inf_add_pre4
on
  inf_pre4.id = inf_add_pre4.race_id
left join
  race_result_additional ret_add_pre4
on
  ret_pre4.race_id = ret_add_pre4.race_id
  and ret_pre4.horse_number = ret_add_pre4.horse_number
where
    cast(ret_pre0.order_of_finish as int) <> 0
    and cast(ret_pre1.order_of_finish as int) <> 0
    and cast(ret_pre2.order_of_finish as int) <> 0
    and cast(ret_pre3.order_of_finish as int) <> 0
    and cast(ret_pre4.order_of_finish as int) <> 0;
