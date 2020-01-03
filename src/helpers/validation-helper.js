'use strict'

/**
 * @module バリデーションに関する補助機能を提供します。
 */
module.exports = {
  /**
   * @description 値がセットされているかどうかを検証します。
   * @param {Any} val - 値
   * @returns {void}
   */
  required (val) {
    if (!val) {
      throw new Error('required val')
    }
  },
  /**
   * @description 値が期待通りかどうかを検証します。
   * @param {Any} val - 値
   * @returns {void}
   */
  expect (val) {
    if (!val) {
      throw new Error('expect val')
    }
  },
  /**
   * @description 値が要素の存在する配列かどうかを検証します。
   * @param {Array} val - 値
   */
  requiredContainsArray (val) {
    if (!Array.isArray(val) || val.length <= 0) {
      throw new Error('required contains array')
    }
  }
}
