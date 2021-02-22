'use strict'

/**
 * @module 論理処理の補助機能を提供します。
 */
module.exports = {
  /**
   * @description 指定したキーでソートします。
   * @param {Array} list リスト
   * @param {String} key ソートキー
   * @param {Boolean} isNum ソート項目が数値かどうか
   * @returns {Array} ソートしたリスト
   */
  sort (list, key, isNum) {
    require('@h/validation-helper').required(key)
    if (isNum) {
      return list
        .sort((a, b) => {
          if (Number(a[key]) < Number(b[key])) return -1
          if (Number(a[key]) > Number(b[key])) return 1
          return 0
        })
    } else {
      return list
        .sort((a, b) => {
          if (a[key] < b[key]) return -1
          if (a[key] > b[key]) return 1
          return 0
        })
    }
  },
  /**
   * @description 指定したキーで降順ソートします。
   * @param {Array} list リスト
   * @param {String} key ソートキー
   * @param {Boolean} isNum ソート項目が数値かどうか
   * @returns {Array} ソートしたリスト
   */
  sortReverse (list, key, isNum) {
    require('@h/validation-helper').required(key)
    if (isNum) {
      return list
        .sort((a, b) => {
          if (Number(a[key]) > Number(b[key])) return -1
          if (Number(a[key]) < Number(b[key])) return 1
          return 0
        })
    } else {
      return list
        .sort((a, b) => {
          if (a[key] > b[key]) return -1
          if (a[key] < b[key]) return 1
          return 0
        })
    }
  },
  /**
   * @description 配列から組み合わせを生成します。
   * @param {Array} list 配列
   * @param {Number} length 組み合わせの要素数
   */
  genCombination (list, length) {
    const comb = require('js-combinatorics')
    return comb.combination(list, length)
  },
  /**
   * @description ゼロ埋めした文字列を取得します。
   * @param {Any} val 値
   * @param {Number} length 長さ
   * @returns {String} ゼロ埋めした文字列
   */
  padZero (val, length) {
    return (val + '').padStart(length, '0')
  },
  /**
   * @description 配列を行の文字列に変換します。
   */
  ArrayToString (array) {
    return array.reduce((prev, curr) => {
      if (!prev) {
        return curr
      } else {
        return `${prev}\n${curr}`
      }
    }, '')
  }
}
