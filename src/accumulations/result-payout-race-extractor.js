'use strict'

const config = require('@/config-manager').get()
const htmlHelper = require('@h/html-helper')

/**
 * @module 開催予定レース情報の抽出機能を提供します。
 */
module.exports = {
  /**
   * @description 開催予定レースの情報を抽出します。
   * @param {Object} dom DOM
   * @param {String} raceId レースID
   * @returns {void}
   */
  extract (dom, $, raceId) {
    let race = {
      raceId
    }
    const horses = []
    const horseListDoms = module.exports._extractHorseList(dom)
    const horseCount = horseListDoms.length
    console.log(horseCount)
    race.horseCount = horseCount
    race = module.exports._extractRaceName(dom, race)
    race = module.exports._extractRaceInfo1(dom, race)
    race = module.exports._extractRaceInfo2(dom, race)
    race = module.exports._extractRaceNumber(dom, race)
    // 払い戻し
    race = module.exports._extractPayTable($, race, horseCount)

    for (const horseDom of horseListDoms) {
      if (module.exports._isCancel(horseDom)) {
        continue
      }
      let horse = {}
      horse = module.exports._extractHorseNumber(horseDom, horse)
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
      // 着順
      horse = module.exports._extractOrderOfFinish(horseDom, horse)

      horses.push(horse)
    }
    return {
      race,
      horses
    }
  },
  /**
   * @description レース結果が公開済かどうか
   * @param {String} raceId レースID
   * @returns {Boolean} レース結果が公開済かどうか
   */
  hasPublishedResult (raceId) {
    const html = `${config.resultRaceHtmlDir}${raceId}.html`
    const dom = htmlHelper.toDom(html)
    const horseListDoms = module.exports._extractHorseList(dom)
    const horseCount = horseListDoms.length
    // 5頭以下は未完全
    if (horseCount <= 5) {
      return false
    }
    let horseNumber = 1
    for (const horseDom of horseListDoms) {
      if (module.exports._isCancel(horseDom)) {
        continue
      }
      let horse = {
        horseNumber
      }
      horse = module.exports._extractOrderOfFinish(horseDom, horse)
      if (horse.orderOfFinish > 0) {
        return true
      }
      horseNumber++
    }
    return false
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
      .replace(':', '')
    const surface = surfaceUnit
      .split('(')[0]
      .trim()
      .substring(0, 1)
    const distance = surfaceUnit
      .split('(')[0]
      .trim()
      .replace(surface, '')
      .replace('m', '')
      .replace('外', '')
      .replace('内2周', '')
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
    const raceDateYear = Number(query.kaisai_date.substring(0, 4))
    const raceDateMonth = Number(query.kaisai_date.substring(4, 6))
    const raceDateDay = Number(query.kaisai_date.substring(6, 8))
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
   * @description 馬番を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractHorseNumber (dom, data) {
    const tags = dom.querySelectorAll('.Result_Num+td+td>div')
    const _data = [].slice.call(tags).map(tag => {
      return {
        horseNumber: module.exports._convNum(tag.textContent)
      }
    })
    return module.exports._merge(data, _data)
  },
  /**
   * @description 馬名と馬IDを抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractHorseIdAndName (dom, data) {
    const tags = dom.querySelectorAll('.HorseList .Horse_Name>a')
    const idAndNames = [].slice.call(tags).map(tag => {
      const url = tag.href
      const horseId = url.replace(`${config.netkeibaDbBaseUrl}/horse/`, '')
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
        .replace(`${config.netkeibaDbBaseUrl}/jockey/`, '')
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
    const tags = dom.querySelectorAll('.Horse_Info_Detail.Txt_C span')
    const sexAndAges = [].slice.call(tags).map(tag => {
      const texts = tag.textContent
        .replace(/\n/g, '')
        .split('')
      return {
        sex: texts[0],
        age: Number(texts[1])
      }
    })
    return module.exports._merge(data, sexAndAges)
  },
  /**
   * @description 着順を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractOrderOfFinish (dom, data) {
    const tags = dom.querySelectorAll('.Rank')
    const _data = [].slice.call(tags).map(tag => {
      return {
        orderOfFinish: module.exports._convNum(tag.textContent)
      }
    })
    return module.exports._merge(data, _data)
  },
  /**
   * @description 枠番を抽出します。
   * @param {Object} dom - DOM
   * @param {Object} data - 抽出データ
   * @returns {Object} 抽出データ
   */
  _extractFrameNumber (dom, data) {
    const tags = dom.querySelectorAll('.Result_Num+td>div')
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
    const tags = dom.querySelectorAll('.JockeyWeight')
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
    // 開催直後のレース結果だとなぜか馬体重が取れない場合があるが、不要な情報なので気にしないで処理終了にする
    if (!_data) {
      console.warn('horseWeight is undefined')
      return data
    }
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
    const tags = dom.querySelectorAll('.Odds.Txt_R>span')
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
    const tags = dom.querySelectorAll('.OddsPeople')
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
        .replace(`${config.netkeibaDbBaseUrl}/trainer/`, '')
        .replace('/', '')
      return {
        trainerId
      }
    })
    return module.exports._merge(data, trainerIds)
  },
  /**
   * @description 払い戻しテーブルを抽出します。
   * @param {Object} $ - DOM
   * @param {Object} data - 抽出データ
   * @param {Object} horseCount - 出馬数
   * @returns {Object} 抽出データ
   */
  _extractPayTable ($, data, horseCount) {
    const tables = $('.Payout_Detail_Table')
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
      fuku = module.exports._extractPay(trs.eq(index), 'fuku')
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
      wide = module.exports._extractPay(trs.eq(index), 'wide')
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
    let horseNumbers = module.exports._extractPayColumn(tds.eq(0), isHtml, /\n/)
    const pays = module.exports._extractPayColumn(tds.eq(1), isHtml, '円')
    const popularity = module.exports._extractPayColumn(tds.eq(2), isHtml, '人気')
    const ret = {}
    switch (prefix) {
      case 'waku':
      case 'uren':
      case 'utan':
        horseNumbers = [
          `${horseNumbers[0]}-${horseNumbers[1]}`
        ]
        break
      case 'wide':
        horseNumbers = [
          `${horseNumbers[0]}-${horseNumbers[1]}`,
          `${horseNumbers[2]}-${horseNumbers[3]}`,
          `${horseNumbers[4]}-${horseNumbers[5]}`
        ]
        break
      case 'santan':
      case 'sanfuku':
        horseNumbers = [
          `${horseNumbers[0]}-${horseNumbers[1]}-${horseNumbers[2]}`
        ]
        break
    }
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
   * @param {String} splitKey - 分割キー
   * @returns {Object} 抽出データ
   */
  _extractPayColumn (td, isHtml, splitKey) {
    let text
    if (isHtml) {
      text = td.html().replace(/<br>/g, '\n')
    } else {
      text = td.text()
    }
    return text
      .trim()
      .split(splitKey)
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
    if (Array.isArray(add)) {
      validator.expect(add.length <= 1)
      if (add.length <= 0) {
        return org
      }
      return Object.assign(org, add[0])
    } else {
      return Object.assign(org, add)
    }
  },
  /**
   * @description 値を数値に変換します。
   * @param {String} val 値
   */
  _convNum (val) {
    return require('@h/convert-helper').convNum(val)
  }
}
