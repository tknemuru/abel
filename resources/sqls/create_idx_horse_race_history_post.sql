create index if not exists idx_horse_race_history_post
on
  horse_race_history(
    post_race_id,
    post_horse_number
)