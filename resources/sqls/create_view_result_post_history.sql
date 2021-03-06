create view if not exists result_post_history
as
select
  ret0.race_id as ret0_race_id,
  ret0.horse_count as ret0_horse_count,
  ret0.race_name as ret0_race_name,
  ret0.surface as ret0_surface,
  ret0.distance as ret0_distance,
  ret0.race_start as ret0_race_start,
  ret0.weather as ret0_weather,
  ret0.surface_state as ret0_surface_state,
  ret0.surface_digit as ret0_surface_digit,
  ret0.direction_digit as ret0_direction_digit,
  ret0.weather_digit as ret0_weather_digit,
  ret0.surface_state_digit as ret0_surface_state_digit,
  ret0.race_date_year as ret0_race_date_year,
  ret0.race_date_month as ret0_race_date_month,
  ret0.race_date_day as ret0_race_date_day,
  ret0.place_detail as ret0_place_detail,
  ret0.race_class_1 as ret0_race_class_1,
  ret0.race_class_2 as ret0_race_class_2,
  ret0.race_number as ret0_race_number,
  ret0.tan_horse_number as ret0_tan_horse_number,
  ret0.tan_pay as ret0_tan_pay,
  ret0.tan_popularity as ret0_tan_popularity,
  ret0.fuku_horse_number_1 as ret0_fuku_horse_number_1,
  ret0.fuku_pay_1 as ret0_fuku_pay_1,
  ret0.fuku_popularity_1 as ret0_fuku_popularity_1,
  ret0.fuku_horse_number_2 as ret0_fuku_horse_number_2,
  ret0.fuku_pay_2 as ret0_fuku_pay_2,
  ret0.fuku_popularity_2 as ret0_fuku_popularity_2,
  ret0.fuku_horse_number_3 as ret0_fuku_horse_number_3,
  ret0.fuku_pay_3 as ret0_fuku_pay_3,
  ret0.fuku_popularity_3 as ret0_fuku_popularity_3,
  ret0.waku_horse_number_1 as ret0_waku_horse_number_1,
  ret0.waku_horse_number_2 as ret0_waku_horse_number_2,
  ret0.waku_pay as ret0_waku_pay,
  ret0.waku_popularity as ret0_waku_popularity,
  ret0.uren_horse_number_1 as ret0_uren_horse_number_1,
  ret0.uren_horse_number_2 as ret0_uren_horse_number_2,
  ret0.uren_pay as ret0_uren_pay,
  ret0.uren_popularity as ret0_uren_popularity,
  ret0.wide_horse_number_11 as ret0_wide_horse_number_11,
  ret0.wide_horse_number_12 as ret0_wide_horse_number_12,
  ret0.wide_pay_1 as ret0_wide_pay_1,
  ret0.wide_popularity_1 as ret0_wide_popularity_1,
  ret0.wide_horse_number_21 as ret0_wide_horse_number_21,
  ret0.wide_horse_number_22 as ret0_wide_horse_number_22,
  ret0.wide_pay_2 as ret0_wide_pay_2,
  ret0.wide_popularity_2 as ret0_wide_popularity_2,
  ret0.wide_horse_number_31 as ret0_wide_horse_number_31,
  ret0.wide_horse_number_32 as ret0_wide_horse_number_32,
  ret0.wide_pay_3 as ret0_wide_pay_3,
  ret0.wide_popularity_3 as ret0_wide_popularity_3,
  ret0.utan_horse_number_1 as ret0_utan_horse_number_1,
  ret0.utan_horse_number_2 as ret0_utan_horse_number_2,
  ret0.utan_pay as ret0_utan_pay,
  ret0.utan_popularity as ret0_utan_popularity,
  ret0.sanfuku_horse_number_1 as ret0_sanfuku_horse_number_1,
  ret0.sanfuku_horse_number_2 as ret0_sanfuku_horse_number_2,
  ret0.sanfuku_horse_number_3 as ret0_sanfuku_horse_number_3,
  ret0.sanfuku_pay as ret0_sanfuku_pay,
  ret0.sanfuku_popularity as ret0_sanfuku_popularity,
  ret0.santan_horse_number_1 as ret0_santan_horse_number_1,
  ret0.santan_horse_number_2 as ret0_santan_horse_number_2,
  ret0.santan_horse_number_3 as ret0_santan_horse_number_3,
  ret0.santan_pay as ret0_santan_pay,
  ret0.santan_popularity as ret0_santan_popularity,
  ret0.top_earning_money as ret0_top_earning_money,
  ret0.order_of_finish as ret0_order_of_finish,
  ret0.frame_number as ret0_frame_number,
  ret0.horse_number as ret0_horse_number,
  ret0.horse_id as ret0_horse_id,
  ret0.horse_name as ret0_horse_name,
  ret0.sex as ret0_sex,
  ret0.age as ret0_age,
  ret0.basis_weight as ret0_basis_weight,
  ret0.jockey_id as ret0_jockey_id,
  ret0.jockey_name as ret0_jockey_name,
  ret0.finishing_time as ret0_finishing_time,
  ret0.length_diff as ret0_length_diff,
  ret0.pass_1 as ret0_pass_1,
  ret0.pass_2 as ret0_pass_2,
  ret0.pass_3 as ret0_pass_3,
  ret0.pass_4 as ret0_pass_4,
  ret0.last_phase as ret0_last_phase,
  ret0.odds as ret0_odds,
  ret0.popularity as ret0_popularity,
  ret0.horse_weight as ret0_horse_weight,
  ret0.horse_weight_diff as ret0_horse_weight_diff,
  ret0.trainer_id as ret0_trainer_id,
  ret0.trainer_name as ret0_trainer_name,
  ret0.owner_id as ret0_owner_id,
  ret0.owner_name as ret0_owner_name,
  ret0.earning_money as ret0_earning_money,
  ret0.sex_digit as ret0_sex_digit,
  ret0.finishing_time_digit as ret0_finishing_time_digit,
  ret0.length_diff_digit as ret0_length_diff_digit,
  ret1.race_id as ret1_race_id,
  ret1.horse_count as ret1_horse_count,
  ret1.race_name as ret1_race_name,
  ret1.surface as ret1_surface,
  ret1.distance as ret1_distance,
  ret1.race_start as ret1_race_start,
  ret1.weather as ret1_weather,
  ret1.surface_state as ret1_surface_state,
  ret1.surface_digit as ret1_surface_digit,
  ret1.direction_digit as ret1_direction_digit,
  ret1.weather_digit as ret1_weather_digit,
  ret1.surface_state_digit as ret1_surface_state_digit,
  ret1.race_date_year as ret1_race_date_year,
  ret1.race_date_month as ret1_race_date_month,
  ret1.race_date_day as ret1_race_date_day,
  ret1.place_detail as ret1_place_detail,
  ret1.race_class_1 as ret1_race_class_1,
  ret1.race_class_2 as ret1_race_class_2,
  ret1.race_number as ret1_race_number,
  ret1.tan_horse_number as ret1_tan_horse_number,
  ret1.tan_pay as ret1_tan_pay,
  ret1.tan_popularity as ret1_tan_popularity,
  ret1.fuku_horse_number_1 as ret1_fuku_horse_number_1,
  ret1.fuku_pay_1 as ret1_fuku_pay_1,
  ret1.fuku_popularity_1 as ret1_fuku_popularity_1,
  ret1.fuku_horse_number_2 as ret1_fuku_horse_number_2,
  ret1.fuku_pay_2 as ret1_fuku_pay_2,
  ret1.fuku_popularity_2 as ret1_fuku_popularity_2,
  ret1.fuku_horse_number_3 as ret1_fuku_horse_number_3,
  ret1.fuku_pay_3 as ret1_fuku_pay_3,
  ret1.fuku_popularity_3 as ret1_fuku_popularity_3,
  ret1.waku_horse_number_1 as ret1_waku_horse_number_1,
  ret1.waku_horse_number_2 as ret1_waku_horse_number_2,
  ret1.waku_pay as ret1_waku_pay,
  ret1.waku_popularity as ret1_waku_popularity,
  ret1.uren_horse_number_1 as ret1_uren_horse_number_1,
  ret1.uren_horse_number_2 as ret1_uren_horse_number_2,
  ret1.uren_pay as ret1_uren_pay,
  ret1.uren_popularity as ret1_uren_popularity,
  ret1.wide_horse_number_11 as ret1_wide_horse_number_11,
  ret1.wide_horse_number_12 as ret1_wide_horse_number_12,
  ret1.wide_pay_1 as ret1_wide_pay_1,
  ret1.wide_popularity_1 as ret1_wide_popularity_1,
  ret1.wide_horse_number_21 as ret1_wide_horse_number_21,
  ret1.wide_horse_number_22 as ret1_wide_horse_number_22,
  ret1.wide_pay_2 as ret1_wide_pay_2,
  ret1.wide_popularity_2 as ret1_wide_popularity_2,
  ret1.wide_horse_number_31 as ret1_wide_horse_number_31,
  ret1.wide_horse_number_32 as ret1_wide_horse_number_32,
  ret1.wide_pay_3 as ret1_wide_pay_3,
  ret1.wide_popularity_3 as ret1_wide_popularity_3,
  ret1.utan_horse_number_1 as ret1_utan_horse_number_1,
  ret1.utan_horse_number_2 as ret1_utan_horse_number_2,
  ret1.utan_pay as ret1_utan_pay,
  ret1.utan_popularity as ret1_utan_popularity,
  ret1.sanfuku_horse_number_1 as ret1_sanfuku_horse_number_1,
  ret1.sanfuku_horse_number_2 as ret1_sanfuku_horse_number_2,
  ret1.sanfuku_horse_number_3 as ret1_sanfuku_horse_number_3,
  ret1.sanfuku_pay as ret1_sanfuku_pay,
  ret1.sanfuku_popularity as ret1_sanfuku_popularity,
  ret1.santan_horse_number_1 as ret1_santan_horse_number_1,
  ret1.santan_horse_number_2 as ret1_santan_horse_number_2,
  ret1.santan_horse_number_3 as ret1_santan_horse_number_3,
  ret1.santan_pay as ret1_santan_pay,
  ret1.santan_popularity as ret1_santan_popularity,
  ret1.top_earning_money as ret1_top_earning_money,
  ret1.order_of_finish as ret1_order_of_finish,
  ret1.frame_number as ret1_frame_number,
  ret1.horse_number as ret1_horse_number,
  ret1.horse_id as ret1_horse_id,
  ret1.horse_name as ret1_horse_name,
  ret1.sex as ret1_sex,
  ret1.age as ret1_age,
  ret1.basis_weight as ret1_basis_weight,
  ret1.jockey_id as ret1_jockey_id,
  ret1.jockey_name as ret1_jockey_name,
  ret1.finishing_time as ret1_finishing_time,
  ret1.length_diff as ret1_length_diff,
  ret1.pass_1 as ret1_pass_1,
  ret1.pass_2 as ret1_pass_2,
  ret1.pass_3 as ret1_pass_3,
  ret1.pass_4 as ret1_pass_4,
  ret1.last_phase as ret1_last_phase,
  ret1.odds as ret1_odds,
  ret1.popularity as ret1_popularity,
  ret1.horse_weight as ret1_horse_weight,
  ret1.horse_weight_diff as ret1_horse_weight_diff,
  ret1.trainer_id as ret1_trainer_id,
  ret1.trainer_name as ret1_trainer_name,
  ret1.owner_id as ret1_owner_id,
  ret1.owner_name as ret1_owner_name,
  ret1.earning_money as ret1_earning_money,
  ret1.sex_digit as ret1_sex_digit,
  ret1.finishing_time_digit as ret1_finishing_time_digit,
  ret1.length_diff_digit as ret1_length_diff_digit,
  ret2.race_id as ret2_race_id,
  ret2.horse_count as ret2_horse_count,
  ret2.race_name as ret2_race_name,
  ret2.surface as ret2_surface,
  ret2.distance as ret2_distance,
  ret2.race_start as ret2_race_start,
  ret2.weather as ret2_weather,
  ret2.surface_state as ret2_surface_state,
  ret2.surface_digit as ret2_surface_digit,
  ret2.direction_digit as ret2_direction_digit,
  ret2.weather_digit as ret2_weather_digit,
  ret2.surface_state_digit as ret2_surface_state_digit,
  ret2.race_date_year as ret2_race_date_year,
  ret2.race_date_month as ret2_race_date_month,
  ret2.race_date_day as ret2_race_date_day,
  ret2.place_detail as ret2_place_detail,
  ret2.race_class_1 as ret2_race_class_1,
  ret2.race_class_2 as ret2_race_class_2,
  ret2.race_number as ret2_race_number,
  ret2.tan_horse_number as ret2_tan_horse_number,
  ret2.tan_pay as ret2_tan_pay,
  ret2.tan_popularity as ret2_tan_popularity,
  ret2.fuku_horse_number_1 as ret2_fuku_horse_number_1,
  ret2.fuku_pay_1 as ret2_fuku_pay_1,
  ret2.fuku_popularity_1 as ret2_fuku_popularity_1,
  ret2.fuku_horse_number_2 as ret2_fuku_horse_number_2,
  ret2.fuku_pay_2 as ret2_fuku_pay_2,
  ret2.fuku_popularity_2 as ret2_fuku_popularity_2,
  ret2.fuku_horse_number_3 as ret2_fuku_horse_number_3,
  ret2.fuku_pay_3 as ret2_fuku_pay_3,
  ret2.fuku_popularity_3 as ret2_fuku_popularity_3,
  ret2.waku_horse_number_1 as ret2_waku_horse_number_1,
  ret2.waku_horse_number_2 as ret2_waku_horse_number_2,
  ret2.waku_pay as ret2_waku_pay,
  ret2.waku_popularity as ret2_waku_popularity,
  ret2.uren_horse_number_1 as ret2_uren_horse_number_1,
  ret2.uren_horse_number_2 as ret2_uren_horse_number_2,
  ret2.uren_pay as ret2_uren_pay,
  ret2.uren_popularity as ret2_uren_popularity,
  ret2.wide_horse_number_11 as ret2_wide_horse_number_11,
  ret2.wide_horse_number_12 as ret2_wide_horse_number_12,
  ret2.wide_pay_1 as ret2_wide_pay_1,
  ret2.wide_popularity_1 as ret2_wide_popularity_1,
  ret2.wide_horse_number_21 as ret2_wide_horse_number_21,
  ret2.wide_horse_number_22 as ret2_wide_horse_number_22,
  ret2.wide_pay_2 as ret2_wide_pay_2,
  ret2.wide_popularity_2 as ret2_wide_popularity_2,
  ret2.wide_horse_number_31 as ret2_wide_horse_number_31,
  ret2.wide_horse_number_32 as ret2_wide_horse_number_32,
  ret2.wide_pay_3 as ret2_wide_pay_3,
  ret2.wide_popularity_3 as ret2_wide_popularity_3,
  ret2.utan_horse_number_1 as ret2_utan_horse_number_1,
  ret2.utan_horse_number_2 as ret2_utan_horse_number_2,
  ret2.utan_pay as ret2_utan_pay,
  ret2.utan_popularity as ret2_utan_popularity,
  ret2.sanfuku_horse_number_1 as ret2_sanfuku_horse_number_1,
  ret2.sanfuku_horse_number_2 as ret2_sanfuku_horse_number_2,
  ret2.sanfuku_horse_number_3 as ret2_sanfuku_horse_number_3,
  ret2.sanfuku_pay as ret2_sanfuku_pay,
  ret2.sanfuku_popularity as ret2_sanfuku_popularity,
  ret2.santan_horse_number_1 as ret2_santan_horse_number_1,
  ret2.santan_horse_number_2 as ret2_santan_horse_number_2,
  ret2.santan_horse_number_3 as ret2_santan_horse_number_3,
  ret2.santan_pay as ret2_santan_pay,
  ret2.santan_popularity as ret2_santan_popularity,
  ret2.top_earning_money as ret2_top_earning_money,
  ret2.order_of_finish as ret2_order_of_finish,
  ret2.frame_number as ret2_frame_number,
  ret2.horse_number as ret2_horse_number,
  ret2.horse_id as ret2_horse_id,
  ret2.horse_name as ret2_horse_name,
  ret2.sex as ret2_sex,
  ret2.age as ret2_age,
  ret2.basis_weight as ret2_basis_weight,
  ret2.jockey_id as ret2_jockey_id,
  ret2.jockey_name as ret2_jockey_name,
  ret2.finishing_time as ret2_finishing_time,
  ret2.length_diff as ret2_length_diff,
  ret2.pass_1 as ret2_pass_1,
  ret2.pass_2 as ret2_pass_2,
  ret2.pass_3 as ret2_pass_3,
  ret2.pass_4 as ret2_pass_4,
  ret2.last_phase as ret2_last_phase,
  ret2.odds as ret2_odds,
  ret2.popularity as ret2_popularity,
  ret2.horse_weight as ret2_horse_weight,
  ret2.horse_weight_diff as ret2_horse_weight_diff,
  ret2.trainer_id as ret2_trainer_id,
  ret2.trainer_name as ret2_trainer_name,
  ret2.owner_id as ret2_owner_id,
  ret2.owner_name as ret2_owner_name,
  ret2.earning_money as ret2_earning_money,
  ret2.sex_digit as ret2_sex_digit,
  ret2.finishing_time_digit as ret2_finishing_time_digit,
  ret2.length_diff_digit as ret2_length_diff_digit,
  ret3.race_id as ret3_race_id,
  ret3.horse_count as ret3_horse_count,
  ret3.race_name as ret3_race_name,
  ret3.surface as ret3_surface,
  ret3.distance as ret3_distance,
  ret3.race_start as ret3_race_start,
  ret3.weather as ret3_weather,
  ret3.surface_state as ret3_surface_state,
  ret3.surface_digit as ret3_surface_digit,
  ret3.direction_digit as ret3_direction_digit,
  ret3.weather_digit as ret3_weather_digit,
  ret3.surface_state_digit as ret3_surface_state_digit,
  ret3.race_date_year as ret3_race_date_year,
  ret3.race_date_month as ret3_race_date_month,
  ret3.race_date_day as ret3_race_date_day,
  ret3.place_detail as ret3_place_detail,
  ret3.race_class_1 as ret3_race_class_1,
  ret3.race_class_2 as ret3_race_class_2,
  ret3.race_number as ret3_race_number,
  ret3.tan_horse_number as ret3_tan_horse_number,
  ret3.tan_pay as ret3_tan_pay,
  ret3.tan_popularity as ret3_tan_popularity,
  ret3.fuku_horse_number_1 as ret3_fuku_horse_number_1,
  ret3.fuku_pay_1 as ret3_fuku_pay_1,
  ret3.fuku_popularity_1 as ret3_fuku_popularity_1,
  ret3.fuku_horse_number_2 as ret3_fuku_horse_number_2,
  ret3.fuku_pay_2 as ret3_fuku_pay_2,
  ret3.fuku_popularity_2 as ret3_fuku_popularity_2,
  ret3.fuku_horse_number_3 as ret3_fuku_horse_number_3,
  ret3.fuku_pay_3 as ret3_fuku_pay_3,
  ret3.fuku_popularity_3 as ret3_fuku_popularity_3,
  ret3.waku_horse_number_1 as ret3_waku_horse_number_1,
  ret3.waku_horse_number_2 as ret3_waku_horse_number_2,
  ret3.waku_pay as ret3_waku_pay,
  ret3.waku_popularity as ret3_waku_popularity,
  ret3.uren_horse_number_1 as ret3_uren_horse_number_1,
  ret3.uren_horse_number_2 as ret3_uren_horse_number_2,
  ret3.uren_pay as ret3_uren_pay,
  ret3.uren_popularity as ret3_uren_popularity,
  ret3.wide_horse_number_11 as ret3_wide_horse_number_11,
  ret3.wide_horse_number_12 as ret3_wide_horse_number_12,
  ret3.wide_pay_1 as ret3_wide_pay_1,
  ret3.wide_popularity_1 as ret3_wide_popularity_1,
  ret3.wide_horse_number_21 as ret3_wide_horse_number_21,
  ret3.wide_horse_number_22 as ret3_wide_horse_number_22,
  ret3.wide_pay_2 as ret3_wide_pay_2,
  ret3.wide_popularity_2 as ret3_wide_popularity_2,
  ret3.wide_horse_number_31 as ret3_wide_horse_number_31,
  ret3.wide_horse_number_32 as ret3_wide_horse_number_32,
  ret3.wide_pay_3 as ret3_wide_pay_3,
  ret3.wide_popularity_3 as ret3_wide_popularity_3,
  ret3.utan_horse_number_1 as ret3_utan_horse_number_1,
  ret3.utan_horse_number_2 as ret3_utan_horse_number_2,
  ret3.utan_pay as ret3_utan_pay,
  ret3.utan_popularity as ret3_utan_popularity,
  ret3.sanfuku_horse_number_1 as ret3_sanfuku_horse_number_1,
  ret3.sanfuku_horse_number_2 as ret3_sanfuku_horse_number_2,
  ret3.sanfuku_horse_number_3 as ret3_sanfuku_horse_number_3,
  ret3.sanfuku_pay as ret3_sanfuku_pay,
  ret3.sanfuku_popularity as ret3_sanfuku_popularity,
  ret3.santan_horse_number_1 as ret3_santan_horse_number_1,
  ret3.santan_horse_number_2 as ret3_santan_horse_number_2,
  ret3.santan_horse_number_3 as ret3_santan_horse_number_3,
  ret3.santan_pay as ret3_santan_pay,
  ret3.santan_popularity as ret3_santan_popularity,
  ret3.top_earning_money as ret3_top_earning_money,
  ret3.order_of_finish as ret3_order_of_finish,
  ret3.frame_number as ret3_frame_number,
  ret3.horse_number as ret3_horse_number,
  ret3.horse_id as ret3_horse_id,
  ret3.horse_name as ret3_horse_name,
  ret3.sex as ret3_sex,
  ret3.age as ret3_age,
  ret3.basis_weight as ret3_basis_weight,
  ret3.jockey_id as ret3_jockey_id,
  ret3.jockey_name as ret3_jockey_name,
  ret3.finishing_time as ret3_finishing_time,
  ret3.length_diff as ret3_length_diff,
  ret3.pass_1 as ret3_pass_1,
  ret3.pass_2 as ret3_pass_2,
  ret3.pass_3 as ret3_pass_3,
  ret3.pass_4 as ret3_pass_4,
  ret3.last_phase as ret3_last_phase,
  ret3.odds as ret3_odds,
  ret3.popularity as ret3_popularity,
  ret3.horse_weight as ret3_horse_weight,
  ret3.horse_weight_diff as ret3_horse_weight_diff,
  ret3.trainer_id as ret3_trainer_id,
  ret3.trainer_name as ret3_trainer_name,
  ret3.owner_id as ret3_owner_id,
  ret3.owner_name as ret3_owner_name,
  ret3.earning_money as ret3_earning_money,
  ret3.sex_digit as ret3_sex_digit,
  ret3.finishing_time_digit as ret3_finishing_time_digit,
  ret3.length_diff_digit as ret3_length_diff_digit,
  ret4.race_id as ret4_race_id,
  ret4.horse_count as ret4_horse_count,
  ret4.race_name as ret4_race_name,
  ret4.surface as ret4_surface,
  ret4.distance as ret4_distance,
  ret4.race_start as ret4_race_start,
  ret4.weather as ret4_weather,
  ret4.surface_state as ret4_surface_state,
  ret4.surface_digit as ret4_surface_digit,
  ret4.direction_digit as ret4_direction_digit,
  ret4.weather_digit as ret4_weather_digit,
  ret4.surface_state_digit as ret4_surface_state_digit,
  ret4.race_date_year as ret4_race_date_year,
  ret4.race_date_month as ret4_race_date_month,
  ret4.race_date_day as ret4_race_date_day,
  ret4.place_detail as ret4_place_detail,
  ret4.race_class_1 as ret4_race_class_1,
  ret4.race_class_2 as ret4_race_class_2,
  ret4.race_number as ret4_race_number,
  ret4.tan_horse_number as ret4_tan_horse_number,
  ret4.tan_pay as ret4_tan_pay,
  ret4.tan_popularity as ret4_tan_popularity,
  ret4.fuku_horse_number_1 as ret4_fuku_horse_number_1,
  ret4.fuku_pay_1 as ret4_fuku_pay_1,
  ret4.fuku_popularity_1 as ret4_fuku_popularity_1,
  ret4.fuku_horse_number_2 as ret4_fuku_horse_number_2,
  ret4.fuku_pay_2 as ret4_fuku_pay_2,
  ret4.fuku_popularity_2 as ret4_fuku_popularity_2,
  ret4.fuku_horse_number_3 as ret4_fuku_horse_number_3,
  ret4.fuku_pay_3 as ret4_fuku_pay_3,
  ret4.fuku_popularity_3 as ret4_fuku_popularity_3,
  ret4.waku_horse_number_1 as ret4_waku_horse_number_1,
  ret4.waku_horse_number_2 as ret4_waku_horse_number_2,
  ret4.waku_pay as ret4_waku_pay,
  ret4.waku_popularity as ret4_waku_popularity,
  ret4.uren_horse_number_1 as ret4_uren_horse_number_1,
  ret4.uren_horse_number_2 as ret4_uren_horse_number_2,
  ret4.uren_pay as ret4_uren_pay,
  ret4.uren_popularity as ret4_uren_popularity,
  ret4.wide_horse_number_11 as ret4_wide_horse_number_11,
  ret4.wide_horse_number_12 as ret4_wide_horse_number_12,
  ret4.wide_pay_1 as ret4_wide_pay_1,
  ret4.wide_popularity_1 as ret4_wide_popularity_1,
  ret4.wide_horse_number_21 as ret4_wide_horse_number_21,
  ret4.wide_horse_number_22 as ret4_wide_horse_number_22,
  ret4.wide_pay_2 as ret4_wide_pay_2,
  ret4.wide_popularity_2 as ret4_wide_popularity_2,
  ret4.wide_horse_number_31 as ret4_wide_horse_number_31,
  ret4.wide_horse_number_32 as ret4_wide_horse_number_32,
  ret4.wide_pay_3 as ret4_wide_pay_3,
  ret4.wide_popularity_3 as ret4_wide_popularity_3,
  ret4.utan_horse_number_1 as ret4_utan_horse_number_1,
  ret4.utan_horse_number_2 as ret4_utan_horse_number_2,
  ret4.utan_pay as ret4_utan_pay,
  ret4.utan_popularity as ret4_utan_popularity,
  ret4.sanfuku_horse_number_1 as ret4_sanfuku_horse_number_1,
  ret4.sanfuku_horse_number_2 as ret4_sanfuku_horse_number_2,
  ret4.sanfuku_horse_number_3 as ret4_sanfuku_horse_number_3,
  ret4.sanfuku_pay as ret4_sanfuku_pay,
  ret4.sanfuku_popularity as ret4_sanfuku_popularity,
  ret4.santan_horse_number_1 as ret4_santan_horse_number_1,
  ret4.santan_horse_number_2 as ret4_santan_horse_number_2,
  ret4.santan_horse_number_3 as ret4_santan_horse_number_3,
  ret4.santan_pay as ret4_santan_pay,
  ret4.santan_popularity as ret4_santan_popularity,
  ret4.top_earning_money as ret4_top_earning_money,
  ret4.order_of_finish as ret4_order_of_finish,
  ret4.frame_number as ret4_frame_number,
  ret4.horse_number as ret4_horse_number,
  ret4.horse_id as ret4_horse_id,
  ret4.horse_name as ret4_horse_name,
  ret4.sex as ret4_sex,
  ret4.age as ret4_age,
  ret4.basis_weight as ret4_basis_weight,
  ret4.jockey_id as ret4_jockey_id,
  ret4.jockey_name as ret4_jockey_name,
  ret4.finishing_time as ret4_finishing_time,
  ret4.length_diff as ret4_length_diff,
  ret4.pass_1 as ret4_pass_1,
  ret4.pass_2 as ret4_pass_2,
  ret4.pass_3 as ret4_pass_3,
  ret4.pass_4 as ret4_pass_4,
  ret4.last_phase as ret4_last_phase,
  ret4.odds as ret4_odds,
  ret4.popularity as ret4_popularity,
  ret4.horse_weight as ret4_horse_weight,
  ret4.horse_weight_diff as ret4_horse_weight_diff,
  ret4.trainer_id as ret4_trainer_id,
  ret4.trainer_name as ret4_trainer_name,
  ret4.owner_id as ret4_owner_id,
  ret4.owner_name as ret4_owner_name,
  ret4.earning_money as ret4_earning_money,
  ret4.sex_digit as ret4_sex_digit,
  ret4.finishing_time_digit as ret4_finishing_time_digit,
  ret4.length_diff_digit as ret4_length_diff_digit
from
  race_result ret0
-- ret1
left join
  horse_race_history his0
on
  ret0.race_id = his0.race_id
  and ret0.horse_number = his0.horse_number
left join
  race_result ret1
on
  ret1.race_id = his0.post_race_id
  and ret1.horse_number = his0.post_horse_number
-- ret2
left join
  horse_race_history his1
on
  ret1.race_id = his1.race_id
  and ret1.horse_number = his1.horse_number
left join
  race_result ret2
on
  ret2.race_id = his1.post_race_id
  and ret2.horse_number = his1.post_horse_number
-- ret3
left join
  horse_race_history his2
on
  ret2.race_id = his2.race_id
  and ret2.horse_number = his2.horse_number
left join
  race_result ret3
on
  ret3.race_id = his2.post_race_id
  and ret3.horse_number = his2.post_horse_number
-- ret4
left join
  horse_race_history his3
on
  ret3.race_id = his3.race_id
  and ret3.horse_number = his3.horse_number
left join
  race_result ret4
on
  ret4.race_id = his3.post_race_id
  and ret4.horse_number = his3.post_horse_number
order by
  ret0.race_id,
  ret0.horse_number