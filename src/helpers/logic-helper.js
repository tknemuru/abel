'use strict'

/**
 * @module 論理処理の補助機能を提供します。
 */
module.exports = {
  /**
   * @description 指定したキーでソートします。
   * @param {Array} list リスト
   * @param {String} key ソートキー
   * @returns {Array} ソートしたリスト
   */
  sort (list, key) {
    require('@h/validation-helper').required(key)
    return list
      .sort((a, b) => {
        if (a[key] < b[key]) return -1
        if (a[key] > b[key]) return 1
        return 0
      })
  },
  /**
   * @description 指定したキーで降順ソートします。
   * @param {Array} list リスト
   * @param {String} key ソートキー
   * @returns {Array} ソートしたリスト
   */
  sortReverse (list, key) {
    require('@h/validation-helper').required(key)
    return list
      .sort((a, b) => {
        if (a[key] > b[key]) return -1
        if (a[key] < b[key]) return 1
        return 0
      })
  },
  /**
   * @description 配列から組み合わせを生成します。
   * @param {Array} list 配列
   * @param {Number} length 組み合わせの要素数
   */
  genCombination (list, length) {
    const comb = require('js-combinatorics')
    return comb.combination(list, length)
  }
}
