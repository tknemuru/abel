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
    race = module.exports._extractRaceNumber(dom, race)
    // 払い戻し
    race = module.exports._extractPayTable(dom, race)

    const horses = []
    let horseNumber = 1
    const horseListDoms = module.exports._extractHorseList(dom)
    for (const horseDom of horseListDoms) {
      if (module.exports._isCancel(horseDom)) {
        continue
      }
      let horse = {
        horseNumber
      }
      const cols = [].slice.call(horseDom.querySelectorAll('td'))
      horse = module.exports._extractNumber(cols, horse, 'orderOfFinish', 0)
      horse = module.exports._extractNumber(cols, horse, 'frameNumber', 1)
      horse = module.exports._extractNumber(cols, horse, 'horseNumber', 2)
      horse = module.exports._extractIdAndName(cols, horse, 'horse', 3)
      horse = module.exports._extractSexAndAge(cols, horse)
      horse = module.exports._extractNumber(cols, horse, 'basisWeight', 5)
      horse = module.exports._extractIdAndName(cols, horse, 'jockey', 6)
      horse = module.exports._extractStr(cols, horse, 'finishingTime', 7)
      horse = module.exports._extractStr(cols, horse, 'length', 8)
      // タイム指数
      horse = module.exports._extractStr(cols, horse, 'pass', 10)
      horse = module.exports._extractNumber(cols, horse, 'lastPhase', 11)
      horse = module.exports._extractNumber(cols, horse, 'odds', 12)
      horse = module.exports._extractNumber(cols, horse, 'popularity', 13)
      horse = module.exports._extractStr(cols, horse, 'horseWeight', 14, '計不')
      // 調教タイム
      // 厩舎コメント
      // 備考
      horse = module.exports._extractIdAndName(cols, horse, 'trainer', 18)
      horse = module.exports._extractIdAndName(cols, horse, 'owner', 19)
      horse = module.exports._extractStr(cols, horse, 'earningMoney', 20)
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
    let tags = dom.window.document.querySelectorAll('.race_table_01 tr')
    tags = [].slice.call(tags)
      // 先頭はヘッダ行
      .filter((t, i) => i > 0)
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
    const tag = dom.window.document.querySelector('.racedata>dd>h1')
    const _data = {
      raceName: tag.textContent
        .replace(/\n/g, '')
        .trim()
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
    // eslint-disable-next-line no-irregular-whitespace
    // ダ右1800m / 天候 : 晴 / ダート : 良 / 発走 : 14:40
    const tag = dom.window.document.querySelector('.racedata>dd>p>diary_snap_cut>span')
    const texts = tag.textContent
      .replace(/\n/g, '')
      .split('/')
      .map(t => t.trim())
    const raceStart = texts[3]
      .replace('発走 : ', '')
    const surface = texts[0]
      .substring(0, 2)
    const distance = texts[0]
      .replace(surface, '')
      .replace('m', '')
    const weather = texts[1]
      .replace('天候 : ', '')
    let surfaceState = texts[2]
      .split(':')[1]
      .trim()
      .replace('馬場:', '')
      .replace('稍', '稍重')
      .replace('不', '不良')
    surfaceState = `${surface}:${surfaceState}`
    const _data = {
      surface: `${surface}`,
      distance,
      raceStart,
      weather,
      surfaceState
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
    // 2019年12月15日 5回中山6日目 3歳以上1600万下  (混)[指](ハンデ)
    const tag = dom.window.document.querySelector('.data_intro>p')
    const texts = tag.textContent
      .replace(/\n/g, '')
      .trim()
      .split(' ')
    const raceDate = texts[0]
      .replace('年', '-')
      .replace('月', '-')
      .replace('日', '')
    const info = {
      raceDate,
      placeDetail: texts[1],
      raceClass1: texts[2],
      raceClass2: texts[3]
    }
    return Object.assign(data, info)
  },
  /**
   * @description 数値を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @param {String} key - データのキー
   * @param {Number} index - 列順
   * @param {Number|String} defaultVal - デフォルト値
   * @returns {Object} 抽出データ
   */
  _extractNumber (dom, data, key, index, defaultVal) {
    const _data = {}
    _data[key] = module.exports._convNum(dom[index].textContent || defaultVal)
    return module.exports._merge(data, _data)
  },
  /**
   * @description 文字列を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @param {String} key - データのキー
   * @param {Number} index - 列順
   * @param {Number|String} defaultVal - デフォルト値
   * @returns {Object} 抽出データ
   */
  _extractStr (dom, data, key, index, defaultVal) {
    const _data = {}
    _data[key] = dom[index].textContent.trim() || defaultVal
    return module.exports._merge(data, _data)
  },
  /**
   * @description 単純な構造のデータを抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @param {String} key - データのキー
   * @param {Number} index - 列順
   * @param {Number|String} defaultVal - デフォルト値
   * @param {Boolean} isNum - 数値かどうか
   * @returns {Object} 抽出データ
   */
  _extractSimpleData (dom, data, key, index, defaultVal, isNum) {
    if (isNum) {
      return module.exports._extractNumber(dom, data, key, index, defaultVal)
    } else {
      return module.exports._extractStr(dom, data, key, index, defaultVal)
    }
  },
  /**
   * @description IDと名称を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @param {String} key - データのキー
   * @param {Number} index - 列順
   * @returns {Object} 抽出データ
   */
  _extractIdAndName (dom, data, key, index) {
    const tag = dom[index].querySelector('a')
    const url = tag.href
    const id = url
      .replace(`/${key}/`, '')
      .replace('/', '')
    const idAndName = {}
    idAndName[`${key}Id`] = id
    idAndName[`${key}Name`] = tag.title
    return module.exports._merge(data, idAndName)
  },
  /**
   * @description レース番号を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractRaceNumber (dom, data) {
    const tag = dom.window.document.querySelector('.data_intro>.racedata>dt')
    const _data = {
      raceNumber: module.exports._convNum(tag.textContent.replace('R', '').trim())
    }
    return Object.assign(data, _data)
  },
  /**
   * @description 性別と年齢を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractSexAndAge (dom, data) {
    const texts = dom[4].textContent
      .replace(/\n/g, '')
      .trim()
      .split('')
    const sexAndAges = {
      sex: texts[0],
      age: texts[1]
    }
    return module.exports._merge(data, sexAndAges)
  },
  /**
   * @description 払い戻しテーブルを抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractPayTable (dom, data) {
    let tables = dom.window.document.querySelectorAll('.pay_table_01')
    tables = [].slice.call(tables)
    let trs = tables[0].querySelectorAll('tr')
    trs = [].slice.call(trs)
    // 単勝
    const tan = module.exports._extractPay(trs[0])
    // 複勝
    const fuku = module.exports._extractPay(trs[1])
    // 枠連
    const waku = module.exports._extractPay(trs[2])
    // 馬蓮
    const uren = module.exports._extractPay(trs[3])

    trs = tables[1].querySelectorAll('tr')
    // ワイド
    const wide = module.exports._extractPay(trs[0])
    // 馬単
    const utan = module.exports._extractPay(trs[1])
    // 三連複
    const sanfuku = module.exports._extractPay(trs[2])
    // 三連単
    const santan = module.exports._extractPay(trs[3])

    const _data = {
      tan,
      fuku,
      waku,
      uren,
      wide,
      utan,
      sanfuku,
      santan
    }
    return module.exports._merge(data, _data)
  },
  /**
   * @description 払い戻しを抽出します。
   * @param {Object} tr - 払い戻し行
   * @returns {Object} 抽出データ
   */
  _extractPay (tr) {
    const tds = [].slice.call(tr.querySelectorAll('td'))
    const horseNumbers = module.exports._extractPayColumn(tds[0])
    const pays = module.exports._extractPayColumn(tds[1])
    const popularity = module.exports._extractPayColumn(tds[2])
    const ret = []
    const length = horseNumbers.length
    for (let i = 0; i < length; i++) {
      ret.push({
        horseNumber: horseNumbers[i],
        pay: pays[i],
        popularity: popularity[i]
      })
    }
    return ret.length === 1 ? ret[0] : ret
  },
  /**
   * @description 払い戻しのカラムを抽出します。
   * @param {Object} td - 払い戻しカラム
   * @returns {Object} 抽出データ
   */
  _extractPayColumn (td) {
    return td.textContent
      .trim()
      .split(/\n/)
      .map(text => text.trim())
      .filter(text => !!text)
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
    if (!add) {
      return org
    }
    return Object.assign(org, add)
  },
  /**
   * @description 値を数値に変換します。
   * @param {String} val 値
   */
  _convNum (val) {
    return require('@h/convert-helper').convNum(val)
  }
}
