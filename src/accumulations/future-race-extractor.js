'use strict'

/**
 * @module 開催予定レース情報の抽出機能を提供します。
 */
module.exports = {
  /**
   * @description 基底URL
   */
  BaseUrl: 'https://db.netkeiba.com',
  /**
   * @description 開催予定レースの情報を抽出します。
   * @param {Object} dom DOM
   * @param {String} raceId レースID
   * @returns {void}
   */
  extract (dom, raceId) {
    let race = {
      raceId
    }
    const horses = []
    const horseListDoms = module.exports._extractHorseList(dom)
    const horseCount = horseListDoms.length
    race.horseCount = horseCount
    race = module.exports._extractRaceName(dom, race)
    race = module.exports._extractRaceInfo1(dom, race)
    race = module.exports._extractRaceInfo2(dom, race)
    race = module.exports._extractRaceNumber(dom, race)

    let horseNumber = 1
    for (const horseDom of horseListDoms) {
      if (module.exports._isCancel(horseDom)) {
        continue
      }
      let horse = {
        horseNumber
      }
      horse = module.exports._extractHorseIdAndName(horseDom, horse)
      horse = module.exports._extractSexAndAge(horseDom, horse)
      horse = module.exports._extractJockeyId(horseDom, horse)
      horse = module.exports._extractOdds(horseDom, horse)
      horse = module.exports._extractPopularity(horseDom, horse)
      horse = module.exports._extractTrainerId(horseDom, horse)
      horse = module.exports._extractFrameNumber(horseDom, horse)
      horse = module.exports._extractBasisWeight(horseDom, horse)
      horse = module.exports._extractHorseWeight(horseDom, horse)

      const converter = require('@h/convert-helper')
      horse.sexDigit = converter.convSex(horse.sex)

      horses.push(horse)
      horseNumber++
    }
    return {
      race,
      horses
    }
  },
  /**
   * @description 馬行リストを抽出します。
   * @param {Object} dom DOM
   */
  _extractHorseList (dom) {
    let tags = dom.window.document.querySelectorAll('.HorseList')
    tags = [].slice.call(tags)
    return tags
  },
  /**
   * @description 対象の馬が取り消しかどうか
   * @param {Object} horseListDom 馬行のDOM
   */
  _isCancel (horseListDom) {
    let cancelTag = horseListDom.querySelectorAll('.Cancel_Txt')
    cancelTag = [].slice.call(cancelTag)
    return cancelTag.length > 0
  },
  /**
   * @description レース名を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractRaceName (dom, data) {
    const tag = dom.window.document.querySelector('.RaceName')
    const _data = {
      raceName: tag.textContent.replace(/\n/g, '')
    }
    return Object.assign(data, _data)
  },
  /**
   * @description レース情報(1行目)を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractRaceInfo1 (dom, data) {
    const converter = require('@h/convert-helper')
    const tag = dom.window.document.querySelector('.RaceData01')
    const texts = tag.textContent
      .replace(/\n/g, '')
      .split('/')
    const time = texts.length > 1 ? texts[0] : '未定'
    const surfaceUnit = texts.length > 1 ? texts[1] : texts[0]
    const weatherUnit = texts.length > 2 ? texts[2] : '未定'
    const stateUnit = texts.length > 3 ? texts[3] : '未定'
    const raceStart = time
      .trim()
      .replace('発走', '')
    const surface = surfaceUnit
      .split('(')[0]
      .trim()
      .substring(0, 1)
    const distance = surfaceUnit
      .split('(')[0]
      .trim()
      .replace(surface, '')
      .replace('m', '')
    const direction = surfaceUnit
      .split('(')[1]
      .trim()
      .replace(' ', '')
      .replace(')', '')
    const weather = weatherUnit
      .trim()
      .replace('天候:', '')
    let surfaceState = stateUnit
      .trim()
      .replace('馬場:', '')
      .replace('稍', '稍重')
      .replace('不', '不良')
    surfaceState = `${surface}:${surfaceState}`
    console.log(surfaceState)
    const joinedSurface = `${surface}${direction}`
    const surfaceStateDigit = converter.convRaceSurface(joinedSurface)
    const _data = {
      surface: joinedSurface,
      distance: Number(distance),
      raceStart: Number(raceStart),
      weather,
      surfaceState,
      surfaceDigit: surfaceStateDigit.surface,
      directionDigit: surfaceStateDigit.direction,
      weatherDigit: converter.convWeather(weather),
      surfaceStateDigit: converter.convSurfaceState(surfaceState)
    }
    return Object.assign(data, _data)
  },
  /**
   * @description レース情報(2行目)を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractRaceInfo2 (dom, data) {
    let tags = dom.window.document.querySelectorAll('.RaceData02>span')
    tags = [].slice.call(tags)
    const placeDetail = `${tags[0].textContent}${tags[1].textContent}${tags[2].textContent}`
    let raceClass = '未定'
    if ([3, 4, 5, 6].some(i => !!tags[i].textContent)) {
      raceClass = `${tags[3].textContent}${tags[4].textContent}${tags[5].textContent}(${tags[6].textContent})`
    }
    const qs = require('querystring')
    const dateTag = dom.window.document.querySelector('#RaceList_DateList .Active a')
    const query = qs.parse(dateTag.href.split('?')[1])
    const raceDateYear = Number(query.kaisai_date.substring(0, 3))
    const raceDateMonth = Number(query.kaisai_date.substring(4, 5))
    const raceDateDay = Number(query.kaisai_date.substring(6, 7))
    const info = {
      raceDateYear,
      raceDateMonth,
      raceDateDay,
      placeDetail,
      raceClass1: raceClass
    }
    return Object.assign(data, info)
  },
  /**
   * @description レース番号を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractRaceNumber (dom, data) {
    const tag = dom.window.document.querySelector('.RaceNum')
    const _data = {
      raceNumber: module.exports._convNum(tag.textContent.replace('R', ''))
    }
    return Object.assign(data, _data)
  },
  /**
   * @description 馬名と馬IDを抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractHorseIdAndName (dom, data) {
    const tags = dom.querySelectorAll('.HorseList .HorseName>a')
    const idAndNames = [].slice.call(tags).map(tag => {
      const url = tag.href
      const horseId = url.replace(`${module.exports.BaseUrl}/horse/`, '')
      const horseName = tag.title
      return {
        horseId,
        horseName
      }
    })
    return module.exports._merge(data, idAndNames)
  },
  /**
   * @description 騎手IDを抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractJockeyId (dom, data) {
    const tags = dom.querySelectorAll('.Jockey>a')
    const ids = [].slice.call(tags).map(tag => {
      const url = tag.href
      const jockeyId = url
        .replace(`${module.exports.BaseUrl}/jockey/`, '')
        .replace('/', '')
      return {
        jockeyId
      }
    })
    return module.exports._merge(data, ids)
  },
  /**
   * @description 性別と年齢を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractSexAndAge (dom, data) {
    const tags = dom.querySelectorAll('.HorseInfo + td')
    const sexAndAges = [].slice.call(tags).map(tag => {
      const texts = tag.textContent.split('')
      return {
        sex: texts[0],
        age: Number(texts[1])
      }
    })
    return module.exports._merge(data, sexAndAges)
  },
  /**
   * @description 枠番を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractFrameNumber (dom, data) {
    const tags = dom.querySelectorAll('.Waku>span')
    const _data = [].slice.call(tags).map(tag => {
      return {
        frameNumber: module.exports._convNum(tag.textContent)
      }
    })
    return module.exports._merge(data, _data)
  },
  /**
   * @description 斤量を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractBasisWeight (dom, data) {
    const tags = dom.querySelectorAll('.HorseInfo+td+td')
    const _data = [].slice.call(tags).map(tag => {
      return {
        basisWeight: module.exports._convNum(tag.textContent)
      }
    })
    return module.exports._merge(data, _data)
  },
  /**
   * @description 馬体重を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractHorseWeight (dom, data) {
    const tags = dom.querySelectorAll('.HorseList .Weight')
    const _data = [].slice.call(tags).map(tag => {
      return {
        horseWeight: tag.textContent.replace(/\n/g, '') || '計不'
      }
    })[0]
    const weight = require('@h/convert-helper').convHorseWeight(_data.horseWeight)
    _data.horseWeight = weight.weight
    _data.horseWeightDiff = weight.diff
    return module.exports._merge(data, [_data])
  },
  /**
   * @description オッズを抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractOdds (dom, data) {
    const tags = dom.querySelectorAll('span[id^="odds-"]')
    const odds = [].slice.call(tags).map(tag => {
      return {
        odds: module.exports._convNum(tag.textContent)
      }
    })
    return module.exports._merge(data, odds)
  },
  /**
   * @description 人気を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractPopularity (dom, data) {
    const tags = dom.querySelectorAll('span[id^="ninki-"]')
    const popularity = [].slice.call(tags).map(tag => {
      return {
        popularity: module.exports._convNum(tag.textContent)
      }
    })
    return module.exports._merge(data, popularity)
  },
  /**
   * @description 調教師IDを抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractTrainerId (dom, data) {
    const tags = dom.querySelectorAll('.Trainer a')
    const trainerIds = [].slice.call(tags).map(tag => {
      const url = tag.href
      const trainerId = url
        .replace(`${module.exports.BaseUrl}/trainer/`, '')
        .replace('/', '')
      return {
        trainerId
      }
    })
    return module.exports._merge(data, trainerIds)
  },
  /**
   * @description データをマージします。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _merge (org, add) {
    const validator = require('@h/validation-helper')
    validator.required(org)
    validator.expect(Array.isArray(add))
    validator.expect(add.length <= 1)
    if (add.length <= 0) {
      return org
    }
    return Object.assign(org, add[0])
  },
  /**
   * @description 値を数値に変換します。
   * @param {String} val 値
   */
  _convNum (val) {
    return require('@h/convert-helper').convNum(val)
  }
}
