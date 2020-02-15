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
      'tan'
      // 'tan',
      // 'fuku',
      // 'waku',
      // 'uren',
      // 'wide',
      // 'sanfuku'
    ]
  }
}
