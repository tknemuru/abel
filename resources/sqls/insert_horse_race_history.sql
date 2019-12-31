insert or replace into horse_race_history (
  race_id,
  horse_number,
  horse_id,
  post_race_id,
  post_horse_number,
  pre_race_id,
  pre_horse_number
) values (
  $raceId,
  $horseNumber,
  $horseId,
  $postRaceId,
  $postHorseNumber,
  $preRaceId,
  $preHorseNumber
)
