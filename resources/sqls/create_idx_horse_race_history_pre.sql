create index if not exists idx_horse_race_history_pre
on
  horse_race_history(
    pre_race_id,
    pre_horse_number
)