create table if not exists horse_race_history (
  race_id text not null,
  horse_number       integer not null,
  horse_id           text    not null,
  post_race_id        text,
  post_horse_number   integer,
  pre_race_id        text,
  pre_horse_number   integer,
  primary key (race_id, horse_number),
  foreign key (race_id) references race_result (race_id),
  foreign key (post_race_id) references race_result (race_id),
  foreign key (pre_race_id) references race_result (race_id)
);
