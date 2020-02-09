'use strict'

/**
 * @module 変換補助機能を提供します。
 */
module.exports = {
  /**
   * @description 対象外の数値
   */
  UntargetedNum: -1,
  /**
   * @description レース場種別
   */
  RaceSurface: {
    /**
     * @description ダート
     */
    Dirt: 1,
    /**
     * @description 芝
     */
    Grass: 2,
    /**
     * @description 集計対象外
     */
    Untargeted: -1
  },
  /**
   * レース向き
   */
  RaceDirection: {
    /**
     * @description 右
     */
    Right: 1,
    /**
     * @description 左
     */
    Left: 2,
    /**
     * @description 右外
     */
    RightOutside: 3,
    /**
     * @description 左外
     */
    LeftOutside: 4,
    /**
     * @description 集計対象外
     */
    Untargeted: -1
  },
  /**
   * @description 天気
   */
  Weather: {
    LightRain: {
      jpName: '小雨',
      value: 1
    },
    LightSnow: {
      jpName: '小雪',
      value: 2
    },
    Sunny: {
      jpName: '晴',
      value: 3
    },
    Cloud: {
      jpName: '曇',
      value: 4
    },
    Rain: {
      jpName: '雨',
      value: 5
    },
    Snow: {
      jpName: '雪',
      value: 6
    },
    Untargeted: {
      jpName: null,
      value: -1
    }
  },
  SurfaceState: {
    Good: {
      jpName: '良',
      value: 1
    },
    Heavy: {
      jpName: '重',
      value: 2
    },
    SlightlyHeavy: {
      jpName: '稍重',
      value: 3
    },
    Bad: {
      jpName: '不良',
      value: 4
    },
    Untargeted: {
      jpName: null,
      value: -1
    }
  },
  /**
   * @description 1馬身(cm)
   */
  HorseLength: 240,
  /**
   * @description 値を数値に変換します。
   * @param {String} val 値
   */
  convNum (val) {
    if (!val) return module.exports.UntargetedNum
    if (typeof val === 'number') return val
    const _val = val.replace(/,/g, '')
    return Number.isNaN(Number(_val))
      ? module.exports.UntargetedNum : Number(_val)
  },
  /**
   * @description 性別の変換を行います。
   * @param {String} val - 値
   * @returns {String} 変換後の値
   */
  convSex (val) {
    let ret
    switch (val) {
      case 'セ':
        ret = 1
        break
      case '牝':
        ret = 2
        break
      case '牡':
        ret = 3
        break
    }
    return ret
  },
  /**
   * @description タイムの変換を行います。
   * @param {String} val - 値
   * @returns {String} 変換後の値
   */
  convFinishingTime (val) {
    const vals = val.split(':').map(v => Number(v))
    return (vals[0] * 60) + vals[1]
  },
  /**
   * @description 着差の変換を行います。
   * @param {String} val - 値
   * @returns {Number} 変換後の値
   */
  convLength (val) {
    let ret = -1
    // 一位は値が存在しない
    if (!val) {
      return 0
    }
    // 判断不能の値は-1を返して処理終了
    if (val.includes('+')) {
      return ret
    }

    switch (val) {
      case '同着':
        ret = 0
        break
      case 'ハナ':
        ret = 20
        break
      case 'アタマ':
        ret = 40
        break
      case 'クビ':
        ret = 80
        break
      case '大':
        ret = 11 * module.exports.HorseLength
        break
      default:
        if (val.includes('.')) {
          ret = val
            .split('.')
            .map(v => module.exports._convNumLength(v))
            .reduce((prev, curr) => prev + curr)
        } else {
          ret = module.exports._convNumLength(val)
        }
        break
    }
    return ret
  },
  /**
   * @description 馬体重の変換を行います。
   * @param {String} val - 値
   * @returns {Object} 変換後の値
   */
  convHorseWeight (val) {
    if (val === '計不') {
      return {
        weight: -1,
        diff: -1
      }
    }
    const vals = val.split('(')
    const diff = vals[1]
      .replace(')', '')
    return {
      weight: Number(vals[0]),
      diff: Number(diff)
    }
  },
  /**
   * @description レース場の変換を行います。
   * @param {String} val - 値
   * @returns {Object} 変換後の値
   */
  convRaceSurface (val) {
    const ret = {
      surface: module.exports.RaceSurface.Untargeted,
      direction: module.exports.RaceDirection.Untargeted
    }
    const surfaces = val.split('')
    if (['ダ', '芝'].every(s => s !== surfaces[0])) {
      return ret
    }
    if (['右', '左'].every(s => s !== surfaces[1])) {
      return ret
    }
    if (surfaces.length > 2 && surfaces[2] !== '外') {
      return ret
    }

    ret.surface = (surfaces[0] === 'ダ')
      ? module.exports.RaceSurface.Dirt
      : module.exports.RaceSurface.Grass
    if (surfaces[1] === '右') {
      ret.direction = (surfaces.length > 2)
        ? module.exports.RaceDirection.RightOutside
        : module.exports.RaceDirection.Right
    } else {
      ret.direction = (surfaces.length > 2)
        ? module.exports.RaceDirection.LeftOutside
        : module.exports.RaceDirection.Left
    }
    return ret
  },
  /**
   * @description 天気の変換を行います。
   * @param {String} val - 値
   * @returns {Object} 変換後の値
   */
  convWeather (val) {
    const weather = Object.values(module.exports.Weather)
      .filter(w => w.jpName === val)
    if (weather.length !== 1) {
      return module.exports.Weather.Untargeted.value
    }
    return weather[0].value
  },
  /**
   * @description 馬場状態の変換を行います。
   * @param {String} val - 値
   * @returns {Object} 変換後の値
   */
  convSurfaceState (val) {
    const ret = module.exports.SurfaceState.Untargeted
    if (val === '未定') {
      return ret.value
    }
    const status = val.split('  ')
    if (status.length > 1) {
      return ret.value
    }
    const state = val.split(':')[1].trim()
    return Object.values(module.exports.SurfaceState)
      .filter(s => s.jpName === state)[0].value
  },
  /**
   * @description 数字の着差の変換を行います。
   * @param {String} val - 値
   * @returns {Number} 変換後の値
   */
  _convNumLength (val) {
    let horseLen = -1
    if (val.includes('/')) {
      const vals = val.split('/').map(v => Number(v))
      horseLen = vals[0] / vals[1]
    } else {
      horseLen = Number(val)
    }
    return horseLen * module.exports.HorseLength
  }
}
