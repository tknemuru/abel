'use strict'

const _ = require('lodash')
const logicHelper = require('@h/logic-helper')
const config = require('@/config-manager').get()

/**
 * @module 馬券購入の補助機能を提供します。
 */
module.exports = {
  /**
   * @description 馬券の種類の日本語名を取得します。
   * @param {String} type 馬券の種類
   * @returns {String} 馬券の種類の日本語名
   */
  getTypeJpName (type) {
    let name = ''
    switch (type) {
      case 'tan':
        name = '単勝'
        break
      case 'fuku':
        name = '複勝'
        break
      case 'waku':
        name = '枠連'
        break
      case 'uren':
        name = '馬連'
        break
      case 'wide':
        name = 'ワイド'
        break
      case 'sanfuku':
        name = '三連複'
        break
      case 'utan':
        name = '馬単'
        break
      case 'santan':
        name = '三連単'
        break
      case 'sum':
        name = '合計'
        break
      default:
        throw new Error(`unexpected ticket type: ${type}`)
    }
    return name
  },
  /**
   * @description 出力用シミュレーション結果を作成します。
   * @param {Array} results シミュレーション結果
   * @returns {String} 出力用シミュレーション結果
   */
  createDispSimlationResult (results) {
    const msg = []
    msg.push('-----------------')
    for (const type in results) {
      const typeName = module.exports.getTypeJpName(type)
      msg.push(createTicketTypeDispResult(results[type], typeName))
    }
    msg.push('-----------------')
    return logicHelper.ArrayToString(msg)
  },
  /**
   * @description 出力用チケット購入情報を作成します。
   * @param {Object} simResult シミュレーション結果
   * @param {Array} raceIds レースIDリスト
   * @returns {Array} 出力用チケット購入情報   */
  createDispPurchaseTickets (simResult, raceIds) {
    let allSumTicketNum = 0
    const hasTicket = {}
    const msg = []
    for (const raceId of raceIds) {
      let has = false
      const sim = simResult[raceId]
      msg.push(`${sim.raceName}(${sim.raceId})`)
      const { purchases } = sim
      for (const ticketType in purchases) {
        const tickets = purchases[ticketType]
        if (tickets[0].ticketNum <= 0) {
          continue
        }
        has = true
        const sumTicketNum = _.sum(tickets.map(t => t.ticketNum))
        allSumTicketNum += sumTicketNum
        msg.push(`${module.exports.getTypeJpName(ticketType)}:${sumTicketNum}枚(${sumTicketNum * 100}円)`)
        for (const ticket of tickets) {
          const horses = ticket.horses.reduce((prev, curr) => {
            return `${prev} ${curr.horseNumber}(${curr.horseName})`
          }, '')
          msg.push(`${horses}:${ticket.ticketNum}枚(${ticket.ticketNum * 100}円)`)
        }
      }
      hasTicket[raceId] = has
      if (!has) {
        msg.push('チケット購入なし')
      }
    }
    msg.push(`合計:${allSumTicketNum}枚(${allSumTicketNum * 100}円)`)
    return {
      msg,
      hasTicket
    }
  },
  /**
   * @description 購入予測評価値ファイルのパスセットを生成します。
   * @returns {Object} 購入予測評価値ファイルのパスセット
   */
  generatePurchasePredPathSet () {
    const abiMoPath = config.predAbilityMoneyFilePath.replace(
      config.learningAbilityDir,
      config.learningCollegialPurchaseDir
    )
    const abiRePath = config.predAbilityRecoveryFilePath.replace(
      config.learningAbilityDir,
      config.learningCollegialPurchaseDir
    )
    const rageOddsPath = config.predRageOddsFilePath.replace(
      config.learningRageDir,
      config.learningCollegialPurchaseDir
    )
    const rageOrderPath = config.predRageOrderFilePath.replace(
      config.learningRageDir,
      config.learningCollegialPurchaseDir
    )
    const collegialPath = config.predCollegialFilePath.replace(
      config.learningCollegialDir,
      config.learningCollegialPurchaseDir
    )
    return {
      abiMoPath,
      abiRePath,
      rageOddsPath,
      rageOrderPath,
      collegialPath
    }
  }
}

/**
  * @description 指定した馬券種類の出力用シミュレーション結果を作成します。
  * @param {Object} ret シミュレーション結果
  * @param {String} typeName 馬券種類名
  * @returns {String} 指定した馬券種類の出力用シミュレーション結果
  */
function createTicketTypeDispResult (ret, typeName) {
  const profitDiff = ret.profit + ret.loss
  const profitRate = Math.round((ret.profit / (ret.loss * -1)) * 10000) / 100
  const winRate = Math.round((ret.winTicketNum / ret.allTicketNum) * 10000) / 100
  return `[${typeName}] 収益: ${profitDiff} 収益率: ${profitRate}% 勝率: ${winRate}% 払い戻し金: ${ret.profit} 購入金: ${ret.loss} 購入枚数: ${ret.allTicketNum} 当たり枚数: ${ret.winTicketNum}`
}
