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
  inf_add_pre0.digit_surface              as inf_add_pre0_digit_surface,
  inf_add_pre0.digit_direction            as inf_add_pre0_digit_direction,
  inf_add_pre0.digit_weather              as inf_add_pre0_digit_weather,
  inf_add_pre0.digit_surface_state        as inf_add_pre0_digit_surface_state,
  -- result
  ret_pre0.order_of_finish as ret_pre0_order_of_finish,
  ret_pre0.frame_number       as ret_pre0_frame_number,
  ret_pre0.horse_number       as ret_pre0_horse_number,
  ret_pre0.horse_id           as ret_pre0_horse_id,
  ret_pre0.sex                as ret_pre0_sex,
  ret_pre0.age                as ret_pre0_age,
  ret_pre0.basis_weight       as ret_pre0_basis_weight,
  ret_pre0.jockey_id          as ret_pre0_jockey_id,
  ret_pre0.finishing_time     as ret_pre0_finishing_time,
  ret_pre0.length             as ret_pre0_length,
  ret_pre0.pass               as ret_pre0_pass,
  ret_pre0.last_phase         as ret_pre0_last_phase,
  ret_pre0.odds               as ret_pre0_odds,
  ret_pre0.popularity         as ret_pre0_popularity,
  ret_pre0.horse_weight       as ret_pre0_horse_weight,
  ret_pre0.remark             as ret_pre0_remark,
  ret_pre0.stable             as ret_pre0_stable,
  ret_pre0.trainer_id         as ret_pre0_trainer_id,
  ret_pre0.owner_id           as ret_pre0_owner_id,
  ret_pre0.earning_money      as ret_pre0_earning_money,
  -- result_additional
  ret_add_pre0.digit_sex                       as ret_add_pre0_digit_sex,
  ret_add_pre0.digit_finishing_time            as ret_add_pre0_digit_finishing_time,
  ret_add_pre0.digit_length                    as ret_add_pre0_digit_length,
  ret_add_pre0.pure_horse_weight               as ret_add_pre0_pure_horse_weight,
  ret_add_pre0.diff_horse_weight               as ret_add_pre0_diff_horse_weight,
  -- >>>>>pre1
  -- info
  inf_pre1.id            as inf_pre1_race_id,
  inf_pre1.race_name     as inf_pre1_race_name,
  inf_pre1.surface       as inf_pre1_surface,
  inf_pre1.distance      as inf_pre1_distance,
  inf_pre1.weather       as inf_pre1_weather,
  inf_pre1.surface_state as inf_pre1_surface_state,
  inf_pre1.race_start    as inf_pre1_race_start,
  inf_pre1.race_number   as inf_pre1_race_number,
  inf_pre1.date          as inf_pre1_date,
  inf_pre1.place_detail  as inf_pre1_place_detail,
  inf_pre1.race_class    as inf_pre1_race_class,
  -- info_additional
  inf_add_pre1.digit_surface              as inf_add_pre1_digit_surface,
  inf_add_pre1.digit_direction            as inf_add_pre1_digit_direction,
  inf_add_pre1.digit_weather              as inf_add_pre1_digit_weather,
  inf_add_pre1.digit_surface_state        as inf_add_pre1_digit_surface_state,
  -- result
  ret_pre1.order_of_finish as ret_pre1_order_of_finish,
  ret_pre1.frame_number       as ret_pre1_frame_number,
  ret_pre1.horse_number       as ret_pre1_horse_number,
  ret_pre1.horse_id           as ret_pre1_horse_id,
  ret_pre1.sex                as ret_pre1_sex,
  ret_pre1.age                as ret_pre1_age,
  ret_pre1.basis_weight       as ret_pre1_basis_weight,
  ret_pre1.jockey_id          as ret_pre1_jockey_id,
  ret_pre1.finishing_time     as ret_pre1_finishing_time,
  ret_pre1.length             as ret_pre1_length,
  ret_pre1.pass               as ret_pre1_pass,
  ret_pre1.last_phase         as ret_pre1_last_phase,
  ret_pre1.odds               as ret_pre1_odds,
  ret_pre1.popularity         as ret_pre1_popularity,
  ret_pre1.horse_weight       as ret_pre1_horse_weight,
  ret_pre1.remark             as ret_pre1_remark,
  ret_pre1.stable             as ret_pre1_stable,
  ret_pre1.trainer_id         as ret_pre1_trainer_id,
  ret_pre1.owner_id           as ret_pre1_owner_id,
  ret_pre1.earning_money      as ret_pre1_earning_money,
  -- result_additional
  ret_add_pre1.digit_sex                       as ret_add_pre1_digit_sex,
  ret_add_pre1.digit_finishing_time            as ret_add_pre1_digit_finishing_time,
  ret_add_pre1.digit_length                    as ret_add_pre1_digit_length,
  ret_add_pre1.pure_horse_weight               as ret_add_pre1_pure_horse_weight,
  ret_add_pre1.diff_horse_weight               as ret_add_pre1_diff_horse_weight,
  -- >>>>>pre2
  -- info
  inf_pre2.id            as inf_pre2_race_id,
  inf_pre2.race_name     as inf_pre2_race_name,
  inf_pre2.surface       as inf_pre2_surface,
  inf_pre2.distance      as inf_pre2_distance,
  inf_pre2.weather       as inf_pre2_weather,
  inf_pre2.surface_state as inf_pre2_surface_state,
  inf_pre2.race_start    as inf_pre2_race_start,
  inf_pre2.race_number   as inf_pre2_race_number,
  inf_pre2.date          as inf_pre2_date,
  inf_pre2.place_detail  as inf_pre2_place_detail,
  inf_pre2.race_class    as inf_pre2_race_class,
  -- info_additional
  inf_add_pre2.digit_surface              as inf_add_pre2_digit_surface,
  inf_add_pre2.digit_direction            as inf_add_pre2_digit_direction,
  inf_add_pre2.digit_weather              as inf_add_pre2_digit_weather,
  inf_add_pre2.digit_surface_state        as inf_add_pre2_digit_surface_state,
  -- result
  ret_pre2.order_of_finish as ret_pre2_order_of_finish,
  ret_pre2.frame_number       as ret_pre2_frame_number,
  ret_pre2.horse_number       as ret_pre2_horse_number,
  ret_pre2.horse_id           as ret_pre2_horse_id,
  ret_pre2.sex                as ret_pre2_sex,
  ret_pre2.age                as ret_pre2_age,
  ret_pre2.basis_weight       as ret_pre2_basis_weight,
  ret_pre2.jockey_id          as ret_pre2_jockey_id,
  ret_pre2.finishing_time     as ret_pre2_finishing_time,
  ret_pre2.length             as ret_pre2_length,
  ret_pre2.pass               as ret_pre2_pass,
  ret_pre2.last_phase         as ret_pre2_last_phase,
  ret_pre2.odds               as ret_pre2_odds,
  ret_pre2.popularity         as ret_pre2_popularity,
  ret_pre2.horse_weight       as ret_pre2_horse_weight,
  ret_pre2.remark             as ret_pre2_remark,
  ret_pre2.stable             as ret_pre2_stable,
  ret_pre2.trainer_id         as ret_pre2_trainer_id,
  ret_pre2.owner_id           as ret_pre2_owner_id,
  ret_pre2.earning_money      as ret_pre2_earning_money,
  -- result_additional
  ret_add_pre2.digit_sex                       as ret_add_pre2_digit_sex,
  ret_add_pre2.digit_finishing_time            as ret_add_pre2_digit_finishing_time,
  ret_add_pre2.digit_length                    as ret_add_pre2_digit_length,
  ret_add_pre2.pure_horse_weight               as ret_add_pre2_pure_horse_weight,
  ret_add_pre2.diff_horse_weight               as ret_add_pre2_diff_horse_weight,
  -- >>>>>pre3
  -- info
  inf_pre3.id            as inf_pre3_race_id,
  inf_pre3.race_name     as inf_pre3_race_name,
  inf_pre3.surface       as inf_pre3_surface,
  inf_pre3.distance      as inf_pre3_distance,
  inf_pre3.weather       as inf_pre3_weather,
  inf_pre3.surface_state as inf_pre3_surface_state,
  inf_pre3.race_start    as inf_pre3_race_start,
  inf_pre3.race_number   as inf_pre3_race_number,
  inf_pre3.date          as inf_pre3_date,
  inf_pre3.place_detail  as inf_pre3_place_detail,
  inf_pre3.race_class    as inf_pre3_race_class,
  -- info_additional
  inf_add_pre3.digit_surface              as inf_add_pre3_digit_surface,
  inf_add_pre3.digit_direction            as inf_add_pre3_digit_direction,
  inf_add_pre3.digit_weather              as inf_add_pre3_digit_weather,
  inf_add_pre3.digit_surface_state        as inf_add_pre3_digit_surface_state,
  -- result
  ret_pre3.order_of_finish as ret_pre3_order_of_finish,
  ret_pre3.frame_number       as ret_pre3_frame_number,
  ret_pre3.horse_number       as ret_pre3_horse_number,
  ret_pre3.horse_id           as ret_pre3_horse_id,
  ret_pre3.sex                as ret_pre3_sex,
  ret_pre3.age                as ret_pre3_age,
  ret_pre3.basis_weight       as ret_pre3_basis_weight,
  ret_pre3.jockey_id          as ret_pre3_jockey_id,
  ret_pre3.finishing_time     as ret_pre3_finishing_time,
  ret_pre3.length             as ret_pre3_length,
  ret_pre3.pass               as ret_pre3_pass,
  ret_pre3.last_phase         as ret_pre3_last_phase,
  ret_pre3.odds               as ret_pre3_odds,
  ret_pre3.popularity         as ret_pre3_popularity,
  ret_pre3.horse_weight       as ret_pre3_horse_weight,
  ret_pre3.remark             as ret_pre3_remark,
  ret_pre3.stable             as ret_pre3_stable,
  ret_pre3.trainer_id         as ret_pre3_trainer_id,
  ret_pre3.owner_id           as ret_pre3_owner_id,
  ret_pre3.earning_money      as ret_pre3_earning_money,
  -- result_additional
  ret_add_pre3.digit_sex                       as ret_add_pre3_digit_sex,
  ret_add_pre3.digit_finishing_time            as ret_add_pre3_digit_finishing_time,
  ret_add_pre3.digit_length                    as ret_add_pre3_digit_length,
  ret_add_pre3.pure_horse_weight               as ret_add_pre3_pure_horse_weight,
  ret_add_pre3.diff_horse_weight               as ret_add_pre3_diff_horse_weight,
  -- >>>>>pre4
  -- info
  inf_pre4.id            as inf_pre4_race_id,
  inf_pre4.race_name     as inf_pre4_race_name,
  inf_pre4.surface       as inf_pre4_surface,
  inf_pre4.distance      as inf_pre4_distance,
  inf_pre4.weather       as inf_pre4_weather,
  inf_pre4.surface_state as inf_pre4_surface_state,
  inf_pre4.race_start    as inf_pre4_race_start,
  inf_pre4.race_number   as inf_pre4_race_number,
  inf_pre4.date          as inf_pre4_date,
  inf_pre4.place_detail  as inf_pre4_place_detail,
  inf_pre4.race_class    as inf_pre4_race_class,
  -- info_additional
  inf_add_pre4.digit_surface              as inf_add_pre4_digit_surface,
  inf_add_pre4.digit_direction            as inf_add_pre4_digit_direction,
  inf_add_pre4.digit_weather              as inf_add_pre4_digit_weather,
  inf_add_pre4.digit_surface_state        as inf_add_pre4_digit_surface_state,
  -- result
  ret_pre4.order_of_finish as ret_pre4_order_of_finish,
  ret_pre4.frame_number       as ret_pre4_frame_number,
  ret_pre4.horse_number       as ret_pre4_horse_number,
  ret_pre4.horse_id           as ret_pre4_horse_id,
  ret_pre4.sex                as ret_pre4_sex,
  ret_pre4.age                as ret_pre4_age,
  ret_pre4.basis_weight       as ret_pre4_basis_weight,
  ret_pre4.jockey_id          as ret_pre4_jockey_id,
  ret_pre4.finishing_time     as ret_pre4_finishing_time,
  ret_pre4.length             as ret_pre4_length,
  ret_pre4.pass               as ret_pre4_pass,
  ret_pre4.last_phase         as ret_pre4_last_phase,
  ret_pre4.odds               as ret_pre4_odds,
  ret_pre4.popularity         as ret_pre4_popularity,
  ret_pre4.horse_weight       as ret_pre4_horse_weight,
  ret_pre4.remark             as ret_pre4_remark,
  ret_pre4.stable             as ret_pre4_stable,
  ret_pre4.trainer_id         as ret_pre4_trainer_id,
  ret_pre4.owner_id           as ret_pre4_owner_id,
  ret_pre4.earning_money      as ret_pre4_earning_money,
  -- result_additional
  ret_add_pre4.digit_sex                       as ret_add_pre4_digit_sex,
  ret_add_pre4.digit_finishing_time            as ret_add_pre4_digit_finishing_time,
  ret_add_pre4.digit_length                    as ret_add_pre4_digit_length,
  ret_add_pre4.pure_horse_weight               as ret_add_pre4_pure_horse_weight,
  ret_add_pre4.diff_horse_weight               as ret_add_pre4_diff_horse_weight
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
order by
  inf_pre0_race_id,
  ret_pre0_horse_number