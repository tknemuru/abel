'use strict'

/**
 * @module 開催予定レース情報の登録機能を提供します。
 */
module.exports = {
  /**
   * @description HTMLファイル配置ディレクトリ
   */
  RaceDataDir: 'resources/races/future-races',
  /**
   * @description 開催予定レース情報を登録します。
   * @returns {void}
   */
  async register () {
    const fs = require('fs')
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')
    const path = require('path')

    // DBの開催予定レース情報を全クリア
    const sql = reader.read('delete_all_future_race_info')
    await accessor.run(sql)

    // レース情報を取得
    const files = fs.readdirSync(module.exports.RaceDataDir)
      .map(f => path.join(module.exports.RaceDataDir, f))

    // 情報を登録
    for (const file of files) {
      console.log(file)
      await module.exports._register(file)
    }
  },
  /**
   * @description 開催予定レース情報を登録します。
   * @param {String} file ファイル名
   */
  async _register (file) {
    const fs = require('fs')
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')
    const converter = require('@h/convert-helper')
    const sql = reader.read('insert_future_race_info')

    const raceAndHorses = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
    const { race } = raceAndHorses
    const surface = converter.convRaceSurface(race.surface)
    const raceParam = {
      $raceId: file.split('/').slice(-1)[0].replace('.json', ''),
      $raceName: race.raceName,
      $surface: race.surface,
      $distance: race.distance,
      $weather: race.weather,
      $surfaceState: race.surfaceState,
      $raceStart: race.raceStart,
      $raceNumber: race.raceNumber,
      $surfaceScore: 0,
      $date: null,
      $placeDetail: race.placeDetail,
      $raceClass: race.raceClass,
      $digitSurface: surface.surface,
      $digitDirection: surface.direction,
      $digitWeather: converter.convWeather(race.weather),
      $digitSurfaceState: converter.convSurfaceState(race.surfaceState)
    }

    const { horses } = raceAndHorses
    const sqls = []
    const params = []
    for (const horse of horses) {
      const horseWeight = converter.convHorseWeight(horse.horseWeight)
      const preHist = await module.exports._selectPreRaceHistory(horse.horseId)
      const horseParam = {
        $horseName: horse.horseName,
        $frameNumber: horse.frameNumber,
        $horseNumber: horse.horseNumber,
        $horseId: horse.horseId,
        $sex: horse.sex,
        $age: horse.age,
        $basisWeight: horse.basisWeight,
        $jockeyId: horse.jockeyId,
        $speedFigure: 0,
        $odds: horse.odds,
        $popularity: horse.popularity,
        $horseWeight: horse.horseWeight,
        $trainerId: horse.trainerId,
        $digitSex: converter.convSex(horse.sex),
        $pureHorseWeight: horseWeight.weight,
        $diffHorseWeight: horseWeight.diff,
        $preRaceId: preHist.preRaceId,
        $preHorseNumber: preHist.preHorseNumber
      }

      const param = Object.assign(
        {},
        raceParam,
        horseParam
      )
      sqls.push(sql)
      params.push(param)
    }
    await accessor.run(sqls, params)
  },
  /**
   * @description 前回のレース情報を取得します。
   * @param {String} horseId 馬ID
   */
  async _selectPreRaceHistory (horseId) {
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')

    // レース履歴を取得
    const sql = reader.read('select_race_result_by_horse_id')
    const histories = await accessor.all(sql, {
      $horseId: horseId
    })
    const hist = {
      preRaceId: null,
      preHorseNumber: null
    }
    if (histories.length <= 0) {
      return hist
    }
    hist.preRaceId = histories[0].raceId
    hist.preHorseNumber = histories[0].horseNumber
    return hist
  }
}
