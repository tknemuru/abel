insert or replace into race_info_additional (
  race_id,
  digit_surface,
  digit_direction,
  digit_weather,
  digit_surface_state
) values (
  $raceId,
  $surface,
  $direction,
  $weather,
  $surfaceState
)
