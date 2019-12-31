create table if not exists race_result_additional (
  race_id integer not null,
  horse_number                    integer not null,
  horse_id                        text    not null,
  digit_sex                       integer,
  digit_finishing_time            real,
  digit_length                    integer,
  pure_horse_weight               integer,
  diff_horse_weight               integer,
  primary key (race_id, horse_number),
  foreign key (race_id) references race_info (id)
);
