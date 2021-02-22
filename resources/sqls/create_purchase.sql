create table if not exists purchase (
  race_id text not null,
  purchase_status integer,
  primary key (race_id)
)