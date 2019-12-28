create table if not exists feature (
  race_id integer not null,
  horse_number  integer not null,

  grade integer not null,
  order_of_finish integer,
  
  horse_id text not null,
  jockey_id text not null,
  trainer_id text not null,

  age real,
  avgsr4 real,
  avgWin4 real,
  dhweight real,
  disavesr real,
  disRoc real,
  distance real,
  dsl real,
  enterTimes real,
  eps real,
  hweight real,
  jwinper real,
  odds real,
  owinper real,
  preSRa real,
  sex text,
  surface text,
  surfaceScore real,
  twinper real,
  weather text,
  weight real,
  winRun real,

  jEps real,
  jAvgWin4 real,
  preOOF real,
  pre2OOF real,

  month real,
  ridingStrongJockey real,
  runningStyle real,
  preLateStart real,
  preLastPhase real,
  lateStartPer real,
  course text, 
  placeCode text,

  headCount real,
  preHeadCount real,
  
  surfaceChanged real,
  gradeChanged real,

  preMargin real,
  femaleOnly real,

  primary key (race_id, horse_number)
);
