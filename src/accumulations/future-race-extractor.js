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
    let data = []
    data = module.exports._extractHorseIdAndName(dom, data)
    data = module.exports._extractSexAndAge(dom, data)
    data = module.exports._extractJockeyId(dom, data)
    data = module.exports._extractOdds(dom, data)
    data = module.exports._extractPopularity(dom, data)
    data = module.exports._extractTrainerId(dom, data)
    data = module.exports._numberingHorseNumber(data)
    return data
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
        odds: Number(tag.textContent)
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
        popularity: Number(tag.textContent)
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
   * @description 抽出年齢をマージします。
   * @param {Object} dom - DOM
   * @param {Array} data - 抽出データ
   * @returns {Array} 抽出データ
   */
  _merge (org, add) {
    const length = org.length
    return add.map((a, i) => {
      if (length <= i) {
        org.push({})
      }
      return Object.assign(org[i], a)
    })
  }
}
