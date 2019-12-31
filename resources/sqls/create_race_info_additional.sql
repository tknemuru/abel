create table if not exists race_info_additional (
  race_id integer not null,
  digit_surface              integer not null,
  digit_direction            integer not null,
  digit_weather              integer not null,
  digit_surface_state        integer not null,
  primary key (race_id)
);
