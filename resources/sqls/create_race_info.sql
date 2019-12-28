create table if not exists race_info (
  id integer primary key autoincrement,

  race_name     text    not null,
  surface       text    not null,
  distance      integer not null,
  weather       text    not null,
  surface_state text    not null,

  race_start    text    not null,
  race_number   integer not null,

  surface_score integer,
  date          text    not null,
  place_detail  text    not null,
  race_class    text    not null
);
