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
   * @returns {void}
   */
  extract (dom) {
    let race = {}
    race = module.exports._extractRaceName(dom, race)
    race = module.exports._extractRaceInfo1(dom, race)
    race = module.exports._extractRaceInfo2(dom, race)
    race = module.exports._extractWeather(dom, race)
    race = module.exports._extractSurfaceState(dom, race)
    race = module.exports._extractRaceNumber(dom, race)
    let horses = []
    horses = module.exports._extractHorseIdAndName(dom, horses)
    horses = module.exports._extractSexAndAge(dom, horses)
    horses = module.exports._extractJockeyId(dom, horses)
    horses = module.exports._extractOdds(dom, horses)
    horses = module.exports._extractPopularity(dom, horses)
    horses = module.exports._extractTrainerId(dom, horses)
    horses = module.exports._numberingHorseNumber(horses)
    return {
      race,
      horses
    }
  },
  /**
   * @description レース名を抽出します。
   * @param {Object} dom - DOM
   * @param {Array} data - 抽出データ
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
   * @param {Array} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractRaceInfo1 (dom, data) {
    const tag = dom.window.document.querySelector('.RaceData01')
    const texts = tag.textContent
      .replace(/\n/g, '')
      .split('/')
    const time = texts.length > 1 ? texts[0] : '未定'
    const surfaceUnit = texts.length > 1 ? texts[1] : texts[0]
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
    const _data = {
      surface: `${surface}${direction}`,
      distance,
      raceStart
    }
    return Object.assign(data, _data)
  },
  /**
   * @description レース情報(2行目)を抽出します。
   * @param {Object} dom - DOM
   * @param {Array} data - 抽出データ
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
    const info = {
      placeDetail,
      raceClass
    }
    return Object.assign(data, info)
  },
  /**
   * @description 天気を抽出します。
   * @param {Object} dom - DOM
   * @param {Array} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractWeather (dom, data) {
    const _data = {
      weather: '未定'
    }
    return Object.assign(data, _data)
  },
  /**
   * @description 馬場の状態を抽出します。
   * @param {Object} dom - DOM
   * @param {Array} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractSurfaceState (dom, data) {
    const _data = {
      surfaceState: '未定'
    }
    return Object.assign(data, _data)
  },
  /**
   * @description レース番号を抽出します。
   * @param {Object} dom - DOM
   * @param {Array} data - 抽出データ
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
   * @param {Array} data - 抽出データ
   * @returns {Array} 抽出データ
   */
  _extractHorseIdAndName (dom, data) {
    const tags = dom.window.document.querySelectorAll('.HorseList .HorseName>a')
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
   * @param {Array} data - 抽出データ
   * @returns {Array} 抽出データ
   */
  _extractJockeyId (dom, data) {
    const tags = dom.window.document.querySelectorAll('.Jockey>a')
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
   * @param {Array} data - 抽出データ
   * @returns {Array} 抽出データ
   */
  _extractSexAndAge (dom, data) {
    const tags = dom.window.document.querySelectorAll('.HorseInfo + td')
    const sexAndAges = [].slice.call(tags).map(tag => {
      const texts = tag.textContent.split('')
      return {
        sex: texts[0],
        age: texts[1]
      }
    })
    return module.exports._merge(data, sexAndAges)
  },
  /**
   * @description オッズを抽出します。
   * @param {Object} dom - DOM
   * @param {Array} data - 抽出データ
   * @returns {Array} 抽出データ
   */
  _extractOdds (dom, data) {
    const tags = dom.window.document.querySelectorAll('span[id^="odds-"]')
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
   * @param {Array} data - 抽出データ
   * @returns {Array} 抽出データ
   */
  _extractPopularity (dom, data) {
    const tags = dom.window.document.querySelectorAll('span[id^="ninki-"]')
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
   * @param {Array} data - 抽出データ
   * @returns {Array} 抽出データ
   */
  _extractTrainerId (dom, data) {
    const tags = dom.window.document.querySelectorAll('.Trainer a')
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
   * @description 馬番号採番します。
   * @param {Object} dom - DOM
   * @param {Array} data - 抽出データ
   * @returns {Array} 採番後の抽出データ
   */
  _numberingHorseNumber (data) {
    return data.map((d, i) => {
      i++
      d.horseNumber = i
      return d
    })
  },
  /**
   * @description データをマージします。
   * @param {Object} dom - DOM
   * @param {Array} data - 抽出データ
   * @returns {Array} 抽出データ
   */
  _merge (org, add) {
    const length = org.length
    let _add = add
    // 開催予定段階ではaddの方が少ない場合がある
    if (add.length < org.length) {
      _add = org.map((o, i) => {
        return (add.length <= i) ? {} : add[i]
      })
    }
    return _add.map((a, i) => {
      if (length <= i) {
        org.push({})
      }
      return Object.assign(org[i], a)
    })
  },
  /**
   * @description 値を数値に変換します。
   * @param {String} val 値
   */
  _convNum (val) {
    return require('@h/convert-helper').convNum(val)
  }
}
