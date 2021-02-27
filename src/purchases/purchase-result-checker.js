'use strict'

const accessor = require('@d/db-accessor')
const adjuster = require('@s/race-adjuster')
const calculator = require('@s/recovery-rate-calculator')
const config = require('@/config-manager').get()
const consts = require('@/consts')
const downloader = require('@ac/page-downloader')
const mailer = require('@p/mailer')
const path = require('path')
const purchaseConfig = require('@p/purchase-notify-config')
const purchaseHelper = require('@h/purchase-helper')
const reader = require('@d/sql-reader')
const payoutExtractor = require('@ac/result-payout-race-extractor')
const resultClearer = require('@ac/result-page-clearer')
const resultRegister = require('@ac/result-race-register')
const futureScraper = require('@ac/future-race-scraper')
const sleep = require('thread-sleep')
const sqlHelper = require('@h/sql-helper')
const futureSimulator = require('@s/future-multi-ticket-type-purchase-simulator')
const fileHelper = require('@h/file-helper')
const logicHelper = require('@h/logic-helper')

/**
 * @description チケット購入の結果確認機能を提供します。
 */
module.exports = {
  /**
   * @description チケット購入の結果確認を実行します。
   * @returns {void}
   */
  async check () {
    // 監視開始
    while (true) {
      await executeWithWatching()
      if (config.ipat.dev) {
        break
      }
    }
  }
}

/**
 * @description チケット購入の結果確認を監視して行います。
 * @returns {void}
 */
async function executeWithWatching () {
  let retryCount = 0
  while (retryCount < config.ipat.maxRetryCount) {
    try {
      // // 開催済のレースを監視
      const races = await watch()
      // 開催済レースページファイルをクリア
      resultClearer.clear()
      // // 開催済レースページをダウンロード
      let raceIds = races.map(r => r.raceId)
      // const raceIds = ['202109010401']
      // const raceIds = ['202105010802']
      // const raceIds = ['202106020209']
      await downloadResults(raceIds)
      // 結果未公開のレースは対象外
      raceIds = raceIds.filter(raceId => {
        const has = payoutExtractor.hasPublishedResult(raceId)
        if (!has) {
          console.log(`${raceId}:結果未公開のレースです。`)
        }
        return has
      })
      if (raceIds.length <= 0) {
        sleep(config.ipat.watchSpanTime * 60000)
        return
      }
      // スクレイピング実行
      await futureScraper.scrape({
        htmlDir: config.resultRaceHtmlDir,
        requiredResult: true
      })
      // レースデータ登録
      await resultRegister.register()
      // レースデータ取得
      let sql = reader.read('select_in_result_race_history')
      sql = sqlHelper.makeInPlaceHolder(sql, raceIds)
      const raceResults = await accessor.all(sql, raceIds)
      // 予測結果を取得
      const predsPath = config.predCollegialPurchaseFilePath
      let preds = fileHelper.readJson(predsPath)
      // 予測結果にレース結果をマージ
      preds = mergeResult(preds, raceResults)
      // マージした予測結果を書き戻しておく
      fileHelper.writeJson(preds, config.predCollegialPurchaseFilePath)
      // 購入計画作成
      const simResults = await futureSimulator.simulate(purchaseConfig)
      // 対象レース以外も含まれているので対象レースに限定する
      const targetSimResults = {}
      for (const raceId of raceIds) {
        targetSimResults[raceId] = simResults[raceId]
      }
      const calcResults = calculator.calc(targetSimResults)
      // 購入結果サマリ作成
      const summary = createResultSummary(calcResults)
      // 購入結果出力情報を作成
      const dispCalcResultStr = purchaseHelper.createDispSimlationResult(calcResults)
      // 予測結果出力情報を作成
      let predVals = purchaseConfig.readAllPredResults()
      predVals = adjuster.adjust(predVals)
      const predValsStrList = []
      for (const raceId in predVals) {
        if (!raceIds.includes(raceId)) {
          continue
        }
        let vals = predVals[raceId]
        vals = logicHelper.sort(vals, 'orderOfFinish')
        // チケット購入結果
        predValsStrList.push('-----------------')
        const ticketsStr = logicHelper.ArrayToString(purchaseHelper.createDispPurchaseTickets(simResults, [raceId]).msg)
        predValsStrList.push(ticketsStr)
        predValsStrList.push('-----------------')
        for (const inp of vals) {
          predValsStrList.push(`${inp.horseNumber}(${inp.horseName}) popularity:${inp.popularity} odds:${inp.odds} coll:${inp.collegialEval} abilityM:${inp.abilityMoneyEval} abilityR:${inp.abilityRecoveryEval} rageOdds:${inp.rageOddsEval} rageOrder:${inp.rageOrderEval}`)
        }
      }
      const predValsStr = logicHelper.ArrayToString(predValsStrList)
      const text = `${summary}\n\n${dispCalcResultStr}\n\n${predValsStr}`
      console.log(summary)
      console.log(text)
      // メール送信
      if (!config.ipat.dev) {
        await mailer.send({
          subject: `【abel】レース結果通知(${summary})`,
          text
        })
        // レース終了に更新
        sql = reader.read('update_in_purchase')
        sql = sql.replace('$purchaseStatus', consts.PurchaseStatus.RaceFinished)
        sql = sql.replace('?#', raceIds.map(() => '?').join(','))
        accessor.run(sql, [raceIds])
      }
      break
    } catch (ex) {
      console.error(ex)
      console.error('purchase check retry')
      retryCount++
    }
  }
}

/**
 * @description 購入タイミングの監視を行います。
 * @returns {Array} 購入対象レースIDリスト
 */
async function watch () {
  let races = []
  while (races.length <= 0) {
    // 購入レース情報を取得
    const sql = reader.read('select_all_future_race_datetime')
    races = await accessor.all(sql, {
      $purchaseStatus: consts.PurchaseStatus.Purchased
    })
    if (Array.isArray(races) && races.length > 0) {
      console.log('start check result')
    } else {
      console.log('still watch...')
      sleep(config.ipat.watchSpanTime * 60000)
    }
  }
  return races
}

/**
 * @description レース結果をダウンロードします。
 * @returns {void}
 */
async function downloadResults (raceIds) {
  for (const raceId of raceIds) {
    const url = `https://race.netkeiba.com/race/result.html?race_id=${raceId}`
    const fileName = raceId
    const pageFilePath = path.join(config.resultRaceHtmlDir, `${fileName}.html`)
    console.log(pageFilePath)
    if (fileHelper.existsFile(pageFilePath)) {
      console.log('file exists skip')
      continue
    }
    await downloader.download({
      urls: [
        url
      ],
      fileNameGen: () => pageFilePath
    })
  }
}

/**
 * @description 予測結果とレース結果をマージします。
 * @param {Array} preds 予測結果
 * @param {Array} results レース結果
 * @returns {Array} レース結果をマージした予測結果
 */
function mergeResult (preds, results) {
  const mergedPred = preds.map(p => {
    let result = results
      .filter(r => r.ret0_race_id === p.raceId && r.ret0_horse_id === p.horseId)
    if (!result || result.length <= 0) {
      return p
    }
    result = result[0]
    p.orderOfFinish = result.ret0_order_of_finish
    // 払い戻し情報の作成
    const pays = {}
    pays.ret0_horse_number = result.ret0_horse_number
    pays.ret0_frame_number = result.ret0_frame_number
    for (const key in result) {
      if (key.startsWith('ret0_tan_') ||
      key.startsWith('ret0_fuku_') ||
      key.startsWith('ret0_waku_') ||
      key.startsWith('ret0_uren_') ||
      key.startsWith('ret0_wide_') ||
      key.startsWith('ret0_utan_') ||
      key.startsWith('ret0_sanfuku_') ||
      key.startsWith('ret0_santan_')) {
        pays[key] = result[key]
      }
    }
    p.pays = pays
    return p
  })
  return mergedPred
}

function createResultSummary (calcResults) {
  let summary = ''
  const results = Object.values(calcResults)
  const hasPurchased = results.some(r => r.allTicketNum > 0)
  const hasWin = results.some(r => r.winTicketNum > 0)
  if (!hasPurchased) {
    summary = '馬券購入はありませんでした。'
    return summary
  }
  if (hasWin) {
    summary = '購入した馬券が当たりました！！！'
  } else {
    summary = '購入した馬券は全て外れました。'
  }
  return summary
}
