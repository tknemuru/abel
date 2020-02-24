insert or replace into simulation_result (
  race_id,
  ticket_type,
  seq_no,
  seq_sub_no,
  horse_number,
  race_name,
  horse_id,
  horse_name,
  order_of_finish,
  popularity,
  odds,
  score,
  score_order,
  ticket_num,
  ss
) values (
  $raceId,
  $ticketType,
  $seqNo,
  $seqSubNo,
  $horseNumber,
  $raceName,
  $horseId,
  $horseName,
  $orderOfFinish,
  $popularity,
  $odds,
  $score,
  $scoreOrder,
  $ticketNum,
  $ss
)
