'use strict'

const futureDownloader = require('@ac/future-race-page-downloader')
const futurePageClearer = require('@ac/future-page-clearer')
const futureRegister = require('@ac/future-race-register')
const futureScraper = require('@ac/future-race-scraper')
const futureSimulator = require('@s/future-multi-ticket-type-purchase-simulator')
const ipatPurchaser = require('@p/ipat-connect-purchaser')
// const jupyter = require('@s/jupyter-accessor')
const learningInputCreator = require('@an/learning-input-creator')
const predAdjuster = require('@an/prediction-result-adjuster')
const predictionConfig = require('@an/configs/prediction-config')
const predictor = require('@s/predictor')
const purchaseHelper = require('@h/purchase-helper')

/**
 * @description IPAT連携チケット購入の管理機能を提供します。
 */
module.exports = {
  /**
   * @description IPAT連携チケット購入を実行します。
   * @returns {void}
   */
  async execute () {
    // // レースページをクリア
    // futurePageClearer.clear()
    // // レースページをダウンロード
    // await futureDownloader.download({
    //   raceIds: [
    //     '202105010610'
    //   ]
    // })
    // // スクレイピング実行
    // await futureScraper.scrape()
    // // レースデータ登録
    // await futureRegister.register()
    // // 予測向けデータ作成
    // await learningInputCreator.create(predictionConfig)
    // // 予測実施
    // await predictor.predict()
    // // 予測結果整形
    // predAdjuster.adjust()
    // // 購入計画作成
    // const purchaseParams = purchaseHelper.getPurchaseParams()
    // futureSimulator.simulate(purchaseParams)
    // IPAT連携購入実行
    await ipatPurchaser.purchase({
      raceIds: [
        '202105010610'
      ]
    })
  }
}
