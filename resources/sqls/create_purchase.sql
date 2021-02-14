create table if not exists purchase (
  race_id text not null,
  purchased_flg integer,
  primary key (race_id)
)