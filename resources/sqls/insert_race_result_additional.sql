insert or replace into race_result_additional (
  race_id,
  horse_number,
  horse_id,
  digit_sex,
  digit_finishing_time,
  digit_length,
  pure_horse_weight,
  diff_horse_weight
) values (
  $raceId,
  $horseNumber,
  $horseId,
  $sex,
  $finishingTime,
  $length,
  $horseWeight,
  $horseWeightDiff
)
