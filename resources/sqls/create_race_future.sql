create table if not exists race_future (
  race_id text not null,
  horse_count integer ,
  race_name text ,
  surface text ,
  distance integer ,
  race_start integer ,
  weather text ,
  surface_state text ,
  surface_digit integer ,
  direction_digit integer ,
  weather_digit integer ,
  surface_state_digit integer ,
  race_date_year integer ,
  race_date_month integer ,
  race_date_day integer ,
  place_detail text ,
  race_class_1 text ,
  race_class_2 text ,
  race_number integer ,
  tan_horse_number integer ,
  tan_pay integer ,
  tan_popularity integer ,
  fuku_horse_number_1 integer ,
  fuku_pay_1 integer ,
  fuku_popularity_1 integer ,
  fuku_horse_number_2 integer ,
  fuku_pay_2 integer ,
  fuku_popularity_2 integer ,
  fuku_horse_number_3 integer ,
  fuku_pay_3 integer ,
  fuku_popularity_3 integer ,
  waku_horse_number_1 integer ,
  waku_horse_number_2 integer ,
  waku_pay integer ,
  waku_popularity integer ,
  uren_horse_number_1 integer ,
  uren_horse_number_2 integer ,
  uren_pay integer ,
  uren_popularity integer ,
  wide_horse_number_11 integer ,
  wide_horse_number_12 integer ,
  wide_pay_1 integer ,
  wide_popularity_1 integer ,
  wide_horse_number_21 integer ,
  wide_horse_number_22 integer ,
  wide_pay_2 integer ,
  wide_popularity_2 integer ,
  wide_horse_number_31 integer ,
  wide_horse_number_32 integer ,
  wide_pay_3 integer ,
  wide_popularity_3 integer ,
  utan_horse_number_1 integer ,
  utan_horse_number_2 integer ,
  utan_pay integer ,
  utan_popularity integer ,
  sanfuku_horse_number_1 integer ,
  sanfuku_horse_number_2 integer ,
  sanfuku_horse_number_3 integer ,
  sanfuku_pay integer ,
  sanfuku_popularity integer ,
  santan_horse_number_1 integer ,
  santan_horse_number_2 integer ,
  santan_horse_number_3 integer ,
  santan_pay integer ,
  santan_popularity integer ,
  order_of_finish integer ,
  frame_number integer ,
  horse_number integer not null,
  horse_id text not null,
  horse_name text ,
  sex text ,
  age integer ,
  basis_weight real ,
  jockey_id text ,
  jockey_name text ,
  finishing_time text ,
  length_diff text ,
  pass_1 integer ,
  pass_2 integer ,
  pass_3 integer ,
  pass_4 integer ,
  last_phase integer ,
  odds integer ,
  popularity integer ,
  horse_weight real ,
  horse_weight_diff real ,
  trainer_id text ,
  trainer_name text ,
  owner_id text ,
  owner_name text ,
  earning_money real ,
  sex_digit integer ,
  finishing_time_digit integer ,
  length_diff_digit integer ,
  pre_race_id text ,
  pre_horse_number integer ,
  primary key (race_id, horse_number)
)