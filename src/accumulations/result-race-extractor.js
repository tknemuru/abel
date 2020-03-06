'use strict'

/**
 * @module 開催済レース情報の抽出機能を提供します。
 */
module.exports = {
  /**
   * @description 基底URL
   */
  BaseUrl: 'https://db.netkeiba.com',
  /**
   * @description 開催済レースの情報を抽出します。
   * @param {Object} $ jQueryオブジェクト
   * @param {String} raceId レースID
   * @returns {void}
   */
  extract ($, raceId) {
    let race = {
      raceId
    }
    const horses = []
    const horseListDoms = module.exports._extractHorseList($)
    const horseCount = [].slice.call(horseListDoms).length
    race.horseCount = horseCount
    race = module.exports._extractRaceName($, race)
    race = module.exports._extractRaceInfo1($, race)
    race = module.exports._extractRaceInfo2($, race)
    race = module.exports._extractRaceNumber($, race)
    // 直線は対象外とする
    if (race.surface.indexOf('直') > -1) {
      console.log('this race straight')
      return
    }
    // 払い戻し
    race = module.exports._extractPayTable($, race, horseCount)

    for (let i = 0; i < horseCount; i++) {
      const horseDom = horseListDoms[i]
      let horse = {}
      // const cols = [].slice.call(horseDom.querySelectorAll('td'))
      const cols = $(horseDom).find('td')
      if (module.exports._isCancel(cols)) {
        continue
      }
      horse = module.exports._extractNumber(cols, horse, 'orderOfFinish', 0)
      horse = module.exports._extractNumber(cols, horse, 'frameNumber', 1)
      horse = module.exports._extractNumber(cols, horse, 'horseNumber', 2)
      horse = module.exports._extractIdAndName(cols, horse, 'horse', 3)
      horse = module.exports._extractSexAndAge(cols, horse)
      horse = module.exports._extractNumber(cols, horse, 'basisWeight', 5)
      horse = module.exports._extractIdAndName(cols, horse, 'jockey', 6)
      horse = module.exports._extractStr(cols, horse, 'finishingTime', 7)
      horse = module.exports._extractStr(cols, horse, 'lengthDiff', 8, '')
      // タイム指数
      horse = module.exports._extractPass(cols, horse)
      horse = module.exports._extractNumber(cols, horse, 'lastPhase', 11)
      horse = module.exports._extractNumber(cols, horse, 'odds', 12)
      horse = module.exports._extractNumber(cols, horse, 'popularity', 13)
      horse = module.exports._extractHorseWeight(cols, horse)
      // 調教タイム
      // 厩舎コメント
      // 備考
      horse = module.exports._extractIdAndName(cols, horse, 'trainer', 18)
      horse = module.exports._extractIdAndName(cols, horse, 'owner', 19)
      horse = module.exports._extractNumber(cols, horse, 'earningMoney', 20)

      const converter = require('@h/convert-helper')
      horse.sexDigit = converter.convSex(horse.sex)
      horse.finishingTimeDigit = converter.convFinishingTime(horse.finishingTime)
      horse.lengthDiffDigit = converter.convLength(horse.lengthDiff)

      horses.push(horse)
    }
    return {
      race,
      horses
    }
  },
  /**
   * @description 馬行リストを抽出します。
   * @param {Object} $ DOM
   */
  _extractHorseList ($) {
    let tags = $('.race_table_01 tr')
    // 先頭はヘッダ行
    tags = tags.filter((i, el) => i > 0)
    return tags
  },
  /**
   * @description 対象の馬が取り消しかどうか
   * @param {Object} dom 馬行のDOM
   */
  _isCancel (dom) {
    const orderOfFinish = module.exports._convNum(dom.eq(0).text())
    return orderOfFinish < 0
  },
  /**
   * @description レース名を抽出します。
   * @param {Object} $ - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractRaceName ($, data) {
    const tag = $('.racedata>dd>h1')
    const _data = {
      raceName: tag.text()
        .replace(/\n/g, '')
        .trim()
    }
    return Object.assign(data, _data)
  },
  /**
   * @description レース情報(1行目)を抽出します。
   * @param {Object} $ - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractRaceInfo1 ($, data) {
    // eslint-disable-next-line no-irregular-whitespace
    // ダ右1800m / 天候 : 晴 / ダート : 良 / 発走 : 14:40
    const converter = require('@h/convert-helper')
    const tag = $('.racedata>dd>p>diary_snap_cut>span')
    const texts = tag.text()
      .replace(/\n/g, '')
      .split('/')
      .map(t => t.trim())
    const raceStart = texts[3]
      .replace('発走 : ', '')
      .replace(':', '')
    const surface = texts[0]
      .substring(0, 2)
    const distance = texts[0]
      .replace(surface, '')
      .replace('m', '')
      .replace('外', '')
      .replace('内2周', '')
    const weather = texts[1]
      .replace('天候 : ', '')
    const surfaceState = texts[2]
      .split(':')[1]
      .trim()
      .replace('馬場:', '')
    const surfaceStateDigit = converter.convRaceSurface(surface)
    const _data = {
      surface: `${surface}`,
      distance: Number(distance),
      raceStart: Number(raceStart),
      weather,
      surfaceState,
      surfaceDigit: surfaceStateDigit.surface,
      directionDigit: surfaceStateDigit.direction,
      weatherDigit: converter.convWeather(weather),
      surfaceStateDigit: converter.convSurfaceState(`:${surfaceState}`)
    }
    return Object.assign(data, _data)
  },
  /**
   * @description レース情報(2行目)を抽出します。
   * @param {Object} $ - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractRaceInfo2 ($, data) {
    // 2019年12月15日 5回中山6日目 3歳以上1600万下  (混)[指](ハンデ)
    const tag = $('.data_intro>p')
    const texts = tag.text()
      .replace(/\n/g, '')
      .trim()
      .split(' ')
      .map(t => t.trim())
    const raceDate = texts[0]
      .replace('年', '-')
      .replace('月', '-')
      .replace('日', '')
      .split('-')
    const info = {
      raceDateYear: Number(raceDate[0]),
      raceDateMonth: Number(raceDate[1]),
      raceDateDay: Number(raceDate[2]),
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
    _data[key] = module.exports._convNum(dom.eq(index).text() || defaultVal)
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
    _data[key] = dom.eq(index).text().trim() || defaultVal
    return module.exports._merge(data, _data)
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
    const tag = dom.eq(index).find('a')
    const url = tag.attr('href')
    const id = url
      .replace(`/${key}/`, '')
      .replace('/', '')
    const idAndName = {}
    idAndName[`${key}Id`] = id
    idAndName[`${key}Name`] = tag.attr('title')
    return module.exports._merge(data, idAndName)
  },
  /**
   * @description レース番号を抽出します。
   * @param {Object} $ - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractRaceNumber ($, data) {
    const tag = $('.data_intro>.racedata>dt')
    const _data = {
      raceNumber: module.exports._convNum(tag.text().replace('R', '').trim())
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
    const texts = dom.eq(4).text()
      .replace(/\n/g, '')
      .trim()
      .split('')
    const sexAndAges = {
      sex: texts[0],
      age: Number(texts[1])
    }
    return module.exports._merge(data, sexAndAges)
  },
  /**
   * @description 通過を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractPass (dom, data) {
    data = module.exports._extractStr(dom, data, 'pass', 10)
    // 通過がない場合がある
    // 【例】https://db.netkeiba.com/race/201104050509/
    if (!data.pass) {
      return {}
    }
    const pass = data.pass.split('-')
    for (let i = 0; i < pass.length; i++) {
      data[`pass${i + 1}`] = Number(pass[i])
    }
    delete data.pass
    return data
  },
  /**
   * @description 馬体重を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractHorseWeight (dom, data) {
    data = module.exports._extractStr(dom, data, 'horseWeight', 14, '計不')
    const weight = require('@h/convert-helper').convHorseWeight(data.horseWeight)
    data.horseWeight = weight.weight
    data.horseWeightDiff = weight.diff
    return data
  },
  /**
   * @description 払い戻しテーブルを抽出します。
   * @param {Object} $ - DOM
   * @param {Object} data - 抽出データ
   * @param {Object} horseCount - 出馬数
   * @returns {Object} 抽出データ
   */
  _extractPayTable ($, data, horseCount) {
    const tables = $('.pay_table_01')
    let trs = tables.eq(0).find('tr')
    let tan = {}
    let fuku = {}
    let waku = {}
    let uren = {}
    let wide = {}
    let utan = {}
    let sanfuku = {}
    let santan = {}
    let index = 0
    // 単勝
    if (horseCount >= 2) {
      tan = module.exports._extractPay(trs.eq(index), 'tan')
      index++
    }
    // 複勝
    if (horseCount >= 5) {
      fuku = module.exports._extractPay(trs.eq(index), 'fuku', true)
      index++
    }
    // 枠連
    if (horseCount >= 9) {
      waku = module.exports._extractPay(trs.eq(index), 'waku')
      index++
    }
    // 馬蓮
    if (horseCount >= 3) {
      uren = module.exports._extractPay(trs.eq(index), 'uren')
      index++
    }

    // trs = tables[1].querySelectorAll('tr')
    trs = tables.eq(1).find('tr')
    index = 0
    // ワイド
    if (horseCount >= 4) {
      wide = module.exports._extractPay(trs.eq(index), 'wide', true)
      index++
    }
    // 馬単
    if (horseCount >= 3) {
      utan = module.exports._extractPay(trs.eq(index), 'utan')
      index++
    }
    // 三連複
    if (horseCount >= 4) {
      sanfuku = module.exports._extractPay(trs.eq(index), 'sanfuku')
      index++
    }
    // 三連単
    if (horseCount >= 4) {
      santan = module.exports._extractPay(trs.eq(index), 'santan')
      index++
    }

    module.exports._merge(data, tan)
    module.exports._merge(data, fuku)
    module.exports._merge(data, waku)
    module.exports._merge(data, uren)
    module.exports._merge(data, wide)
    module.exports._merge(data, utan)
    module.exports._merge(data, sanfuku)
    return module.exports._merge(data, santan)
  },
  /**
   * @description 払い戻しを抽出します。
   * @param {Object} tr - 払い戻し行
   * @param {String} prefix - キーに付与するプレフィックス
   * @param {Boolean} isHtml - htmlから文字列を取得するかどうか
   * @returns {Object} 抽出データ
   */
  _extractPay (tr, prefix, isHtml) {
    // const tds = [].slice.call(tr.querySelectorAll('td'))
    const tds = tr.children('td')
    const horseNumbers = module.exports._extractPayColumn(tds.eq(0), isHtml)
    const pays = module.exports._extractPayColumn(tds.eq(1), isHtml)
    const popularity = module.exports._extractPayColumn(tds.eq(2), isHtml)
    const ret = {}
    const length = horseNumbers.length
    for (let i = 0; i < length; i++) {
      const suffixNum = length > 1 ? i + 1 : ''
      const innerHorseNumbers = horseNumbers[i]
        .replace(/→/g, '-')
        .split('-')
        .map(num => num.trim())
      const hLength = innerHorseNumbers.length
      for (let h = 0; h < hLength; h++) {
        const suffixHorseNum = hLength > 1 ? h + 1 : ''
        ret[`${prefix}HorseNumber${suffixNum}${suffixHorseNum}`] = Number(innerHorseNumbers[h])
      }
      ret[`${prefix}Pay${suffixNum}`] = Number(pays[i].replace(/,/g, ''))
      ret[`${prefix}Popularity${suffixNum}`] = Number(popularity[i])
    }
    return ret
  },
  /**
   * @description 払い戻しのカラムを抽出します。
   * @param {Object} td - 払い戻しカラム
   * @param {Boolean} isHtml - htmlから文字列を取得するかどうか
   * @returns {Object} 抽出データ
   */
  _extractPayColumn (td, isHtml) {
    let text
    if (isHtml) {
      text = td.html().replace(/<br>/g, '\n')
    } else {
      text = td.text()
    }
    return text
      .trim()
      .split(/\n/)
      .map(text => text.trim())
      .filter(text => !!text)
  },
  /**
   * @description データをマージします。
   * @param {Object} org - 元オブジェクト
   * @param {Object} add - マージオブジェクト
   * @returns {Object} 抽出データ
   */
  _merge (org, add) {
    const validator = require('@h/validation-helper')
    validator.required(org)
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
