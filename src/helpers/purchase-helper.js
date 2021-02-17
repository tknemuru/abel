'use strict'

/**
 * @module 馬券購入の補助機能を提供します。
 */
module.exports = {
  /**
   * @description 購入対象のチケット種別を取得します。
   * @returns {Array} 購入対象のチケット種別リスト
   */
  getPurchasingTicketType () {
    return [
      // 'tan'
      // 'tan',
      // 'fuku',
      // 'waku',
      'uren',
      'wide',
      'sanfuku',
      'utan',
      'santan'
    ]
  },
  /**
   * @description 購入用のパラメータを取得します。
   * @param {Number} add 加算値
   */
  getPurchaseParams (add = 0) {
    // const tan = 90
    const fuku = 80 + add
    const params = {
      tan: {
        minScore: fuku + add
      },
      fuku: {
        minScore: fuku + add
      },
      waku: {
        minScore: fuku + add
      },
      uren: {
        minScore: fuku + add
      },
      wide: {
        minScore: fuku + add
      },
      sanfuku: {
        minScore: fuku + add
      },
      utan: {
        minScore: fuku + add
      },
      santan: {
        minScore: fuku + add
      },
      minRageVal: 10,
      upperRageVal: 99 + add
    }
    return params
  }
}
