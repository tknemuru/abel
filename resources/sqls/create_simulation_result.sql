create table if not exists simulation_result (
  race_id text not null,
  ticket_type text not null,
  seq_no integer not null,
  seq_sub_no integer not null,
  horse_number       integer not null,
  race_name          text,
  horse_id           text    not null,
  horse_name          text,
  order_of_finish     integer,
  popularity          integer,
  odds                real,
  score               real,
  score_order         integer,
  ticket_num          integer,
  ss                  real,
  primary key (race_id, ticket_type, seq_no, seq_sub_no, horse_number)
);
