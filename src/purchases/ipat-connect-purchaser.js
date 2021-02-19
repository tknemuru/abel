'use strict'

const _ = require('lodash')
const accessor = require('@d/db-accessor')
const config = require('@/config-manager')
const fileHelper = require('@h/file-helper')
const htmlHelper = require('@h/html-helper')
const reader = require('@d/sql-reader')
const log = require('@h/log-helper')
const sleep = require('thread-sleep')

/**
 * @description 予測結果ファイル
 */
const SimResultFilePath = 'resources/simulations/sim-result.json'

/**
 * @description チケット種別リスト
 */
const TicketTypes = [
  'tan',
  'fuku',
  'waku',
  'uren',
  'wide',
  'utan',
  'sanfuku',
  'santan'
]

/**
 * @description ベースURL
 */
const BaseUrl = 'https://race.netkeiba.com/race/shutuba.html?race_id='

/**
 * @description IPAT連携による購入機能を提供します。
 */
module.exports = {
  /**
   * @description IPAT連携による購入を行います。
   * @param {Object} param パラメータ
   * @param {Array} param.raceIds 購入対象のレースIDリスト
   * @returns {void}
   */
  async purchase (params = {}) {
    const { raceIds } = params
    // 対象レースを馬券購入済に更新
    let sql = reader.read('update_in_purchase')
    sql = sql.replace('?#', raceIds.map(() => '?').join(','))
    accessor.run(sql, [raceIds])

    // 予測結果を取得
    const simResult = fileHelper.readJson(SimResultFilePath)
    const hasTicket = writePurchaseLog(simResult, raceIds)

    // レースページを操作して馬券を購入
    for (const raceId of raceIds) {
      if (!hasTicket[raceId]) {
        console.log(`purchase ticket is empty ${raceId}`)
        sleep(3000)
        continue
      }
      const sim = simResult[raceId]
      const url = `${BaseUrl}${raceId}`
      await htmlHelper.openPuppeteerPage(url, onOpenRacePage, sim)
    }
  }
}

/**
 * @description レースページを開いたときに実行します。
 * @param {Object} browser ブラウザ
 * @param {Object} page ページ
 * @param {Object} params パラメータ
 * @returns {void}
 */
async function onOpenRacePage (browser, page, params) {
  const config = getConfig()

  // IPAT連携馬券購入画面に遷移
  console.log('IPAT連携馬券購入画面に遷移')
  const linkToIpat = await page.$$('.RaceHeadBtnArea a')
  await linkToIpat[1].click()
  await page.waitForTimeout(5000)
  page = await htmlHelper.selectNewPuppeteerPage(browser, page)
  await page.screenshot({ path: 'resources/screenshots/010_netkeiba-ipat-purchase.png' })

  // 馬券購入済レースなら処理終了
  const has = await hasPurchased(page)
  if (has) {
    console.warn(`this race has purchased ${params.raceName}(${params.raceId})`)
    return
  }

  // 馬券購入情報入力
  console.log('馬券購入情報入力')
  let sumTicketNum = 0
  const { purchases } = params
  for (const ticketType in purchases) {
    const tickets = purchases[ticketType]
    if (tickets[0].ticketNum <= 0) {
      continue
    }
    const ticketTypeAnchors = await page.$$('.shikibetu a')
    const index = getTicketTypeIndex(ticketType)
    await ticketTypeAnchors[index].click()
    await page.waitForTimeout(300)
    for (const ticket of tickets) {
      let i = 0
      for (const horse of ticket.horses) {
        switch (ticketType) {
          case 'uren':
          case 'wide':
            await page.click(`#tr_${horse.horseNumber} .Horse_Select div`)
            break
          case 'utan':
          case 'santan':
          case 'sanfuku':
          // eslint-disable-next-line no-case-declarations
            const selects = await page.$$(`#tr_${horse.horseNumber} .Horse_Select div`)
            await selects[i].click()
            break
          default:
            throw new Error(`invalid ticket type -> ${ticketType}`)
        }
        i++
      }
      await page.waitForTimeout(300)
      const ticketNum = ticket.ticketNum
      await page.type('.Money input', ticketNum + '')
      sumTicketNum += ticketNum
      await page.click('.AddBtn button')
      await page.waitForTimeout(300)
    }
  }
  // IPAT画面を起動
  console.log('IPAT画面を起動')
  await page.screenshot({ path: 'resources/screenshots/020_netkeiba-input-complete.png' })
  await page.click('#ipat_dialog')
  page = await htmlHelper.selectNewPuppeteerPage(browser, page)
  // IPAT同意
  console.log('IPAT同意')
  await page.screenshot({ path: 'resources/screenshots/030_ipat-agree-confirm.png' })
  await page.click('.Agree input')
  page = await htmlHelper.selectNewPuppeteerPage(browser, page)
  // IPATログイン
  console.log('IPATログイン')
  await page.screenshot({ path: 'resources/screenshots/040_ipat-login.png' })
  const ipatLoginInputs = await page.$$('#ipat_login_form input')
  await ipatLoginInputs[0].type(config.ipatNum + '')
  await ipatLoginInputs[1].type(config.password + '')
  await ipatLoginInputs[2].type(config.parsNum + '')
  // await htmlHelper.captureRequest(page)
  await page.click('.SubmitBtn')
  page = await htmlHelper.selectNewPuppeteerPage(browser, page)
  // IPAT購入金額入力
  console.log('IPAT購入金額入力')
  await page.screenshot({ path: 'resources/screenshots/050_ipat-input-purchase-sum-money.png' })
  await page.type('#sum', (sumTicketNum * 100) + '')
  // 投票実行
  console.log('投票実行')
  await page.screenshot({ path: 'resources/screenshots/060_ipat-before-purchase.png' })
  const promise = new Promise(resolve => {
    page.on('dialog', async (dialog) => {
      // 投票確認ダイアログ合意
      console.log('投票確認ダイアログ合意')
      console.log('dialog message : ' + dialog.message())
      if (config.dev) {
        console.log('開発モードのため購入を中止します')
        await dialog.dismiss()
      } else {
        // await dialog.accept()
      }
      page = await htmlHelper.selectNewPuppeteerPage(browser, page)
      await page.screenshot({ path: 'resources/screenshots/070_ipat-complete-purchase.png' })
      // 投票完了
      console.log('投票完了')
      resolve()
    })
    page.click('.btnGreen a')
  })
  return promise
}

/**
 * @description 馬券購入済レースかどうか
 * @returns {Boolean} 馬券購入済レースかどうか
 */
async function hasPurchased (page) {
  const purchasedTables = await page.$$('.Kaime_Table')
  return purchasedTables && purchasedTables.length > 0
}

/**
 * @description チケット種別に応じたインデックスを取得します。
 * @param {String} ticketType チケット種別
 * @returns {Number} チケット種別に応じたインデックス
 */
function getTicketTypeIndex (ticketType) {
  return TicketTypes.indexOf(ticketType)
}

/**
 * @description 購入情報をログに出力します。
 * @param {Object} simResult 予測結果
 * @param {Array} raceIds 購入対象のレースIDリスト
 * @returns {void}
 */
function writePurchaseLog (simResult, raceIds) {
  let allSumTicketNum = 0
  const hasTicket = {}
  for (const raceId of raceIds) {
    let has = false
    const sim = simResult[raceId]
    log.info(`${sim.raceName}(${sim.raceId})`)
    const { purchases } = sim
    for (const ticketType in purchases) {
      const tickets = purchases[ticketType]
      if (tickets[0].ticketNum <= 0) {
        continue
      }
      has = true
      const sumTicketNum = _.sum(tickets.map(t => t.ticketNum))
      allSumTicketNum += sumTicketNum
      log.info(`${getTypeJpName(ticketType)}:${sumTicketNum}枚(${sumTicketNum * 100}円)`)
      for (const ticket of tickets) {
        const horses = ticket.horses.reduce((prev, curr) => {
          return `${prev} ${curr.horseNumber}(${curr.horseName})`
        }, '')
        log.info(`${horses}:${ticket.ticketNum}枚(${ticket.ticketNum * 100}円)`)
      }
    }
    hasTicket[raceId] = has
    if (!has) {
      log.info('チケット購入なし')
    }
  }
  log.info(`合計:${allSumTicketNum}枚(${allSumTicketNum * 100}円)`)
  return hasTicket
}

/**
 * @description 馬券の種類の日本語名を取得します。
 * @param {String} type 馬券の種類
 */
function getTypeJpName (type) {
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
}

/**
 * @description 設定情報を取得します。
 * @returns {Object} パラメータ
 */
function getConfig () {
  return config.get().ipat
}
