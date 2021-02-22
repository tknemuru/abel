'use strict'

require('module-alias/register')
const args = require('command-line-args')
const optionDefs = [
  {
    name: 'target',
    alias: 't',
    type: String
  }
]
const options = args(optionDefs)
console.log(options)

const additionalResultCreator = require('@an/race-result-additional-creator')
const configManger = require('@/config-manager')
const correlationAnalyzer = require('@an/correlation-coefficient-analyzer')
const databaseUrlExtractor = require('@ac/race-database-url-extractor')
const dbInit = require('@d/db-initializer')
const horseHistCreator = require('@an/horse-race-history-creator')
const ipatPurchaseManager = require('@p/ipat-purchase-manager')
const learningInputCreator = require('@an/learning-input-creator')
const learningConfig = require('@an/configs/learning-config')
const learningRageInputCreator = require('@an/learning-rage-input-creator')
const learningRageConfig = require('@an/configs/learning-rage-config')
const learningCollegialInputCreator = require('@an/learning-collegial-input-creator')
const mailer = require('@p/mailer')
const predAnalyzer = require('@an/prediction-correlation-coefficient-analyzer')
const predAdjuster = require('@an/prediction-result-adjuster')
const predictor = require('@s/predictor')
const purchaseChecker = require('@p/purchase-result-checker')
const resultClearer = require('@ac/result-page-clearer')
const resultScraper = require('@ac/result-race-scraper')
const testConfig = require('@an/configs/test-config')
const testSimulator = require('@s/test-purchase-simulator')

const config = configManger.get()

switch (options.target) {
  // テスト用
  case 'sandbox':
    mailer.send({
      subject: 'テスト',
      text: 'テスト１\nテスト２'
    })
    break
  // DB初期化
  case 'init-db':
    dbInit.init()
    break
  // SQL生成
  case 'gen-race-sql':
    require('@ac/race-sql-generator').generate()
    break
  // 未来の馬を対象に履歴データを追加する
  // result-set-registerを実行すれば通常実行不要
  case 'create-horse-hist':
    horseHistCreator.create({
      isFuture: true
    })
    break
  // 途中で追加したパラメータを設定する
  // 通常使うことはない
  case 'create-result-additional':
    additionalResultCreator.create()
    break
  // 学習情報の作成
  case 'learn-pre':
    (async () => {
      try {
        // 学習情報作成
        await learningInputCreator.create(learningConfig)
        // 相関係数分析
        correlationAnalyzer.analyze({
          colsPath: config.inputAbilityColsFilePath,
          inputsPath: config.inputAbilityFilePath,
          answersPath: config.answerAbilityMoneyFilePath
        })
        correlationAnalyzer.analyze({
          colsPath: config.inputAbilityColsFilePath,
          inputsPath: config.inputAbilityFilePath,
          answersPath: config.answerAbilityRecoveryFilePath
        })
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  // 学習情報の作成
  case 'learn-rage-pre':
    (async () => {
      try {
        // 学習情報作成
        await learningRageInputCreator.create(learningRageConfig)
        // 相関係数分析
        correlationAnalyzer.analyze({
          colsPath: config.inputRageColsFilePath,
          inputsPath: config.inputRageFilePath,
          answersPath: config.answerRageOddsFilePath
        })
        correlationAnalyzer.analyze({
          colsPath: config.inputRageColsFilePath,
          inputsPath: config.inputRageFilePath,
          answersPath: config.answerRageOrderFilePath
        })
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  // 学習情報の作成
  case 'learn-collegial-pre':
    (async () => {
      try {
        // 学習情報作成
        await learningCollegialInputCreator.create()
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  // 予測テスト
  case 'test-pred':
    (async () => {
      try {
        // 予測情報作成
        await learningCollegialInputCreator.create(testConfig)
        // 予測実施
        await predictor.predict({
          target: 'collegial'
        })
        // 予測結果整形
        predAdjuster.adjust({
          target: 'collegial'
        })
        // シミュレーション実施
        await testSimulator.simulate()
        // // 予測結果の分析
        predAnalyzer.analyze()
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  // 過去のレース結果を登録する
  case 'result-set-register':
    (async () => {
      try {
        resultClearer.clear()
        const endDate = '202102'
        await databaseUrlExtractor.extract({
          endDate
        })
        await require('@ac/race-database-downloader').extract({
          endDate
        })
        await require('@ac/result-race-page-downloader').download({
          endDate
        })
        await resultScraper.scrape()
        await require('@ac/result-race-register').register({
          endDate
        })
        await horseHistCreator.create({
          minYear: 2021,
          minMonth: 2
        })
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  // 予測によるチケット購入
  case 'purchase-ipat':
    (async () => {
      try {
        await ipatPurchaseManager.execute()
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  // チケット購入結果の確認
  case 'check-purchase':
    (async () => {
      try {
        await purchaseChecker.check()
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  default:
    throw new Error('unexpected target.')
}
