'use strict'

/**
 * @module 変換補助機能を提供します。
 */
module.exports = {
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
  }
}
