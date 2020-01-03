create table if not exists future_race_info (
  race_id integer not null,
  horse_name    text    not null,
  -- race_info
  race_name     text    not null,
  surface       text    not null,
  distance      integer not null,
  weather       text,
  surface_state text,
  race_start    text,
  race_number   integer,
  surface_score integer,
  date          text,
  place_detail  text,
  race_class    text,
  -- race_info_additional
  digit_surface              integer,
  digit_direction            integer,
  digit_weather              integer,
  digit_surface_state        integer,
  -- race_result
  frame_number       integer,
  horse_number       integer not null,
  horse_id           text,
  sex                text,
  age                integer,
  basis_weight       real,
  jockey_id          text,
  speed_figure       integer,
  odds               real,
  popularity         integer,
  horse_weight       text,
  trainer_id         text,
  -- race_result_additional
  digit_sex           integer,
  pure_horse_weight   integer,
  diff_horse_weight   integer,
  -- horse_race_history
  pre_race_id        integer,
  pre_horse_number   integer,
  primary key (race_id, horse_number)
);
