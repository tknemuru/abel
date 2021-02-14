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

const dbInit = require('@d/db-initializer')
const creator = require('@an/eval-param-creator')
const testSimulator = require('@s/test-purchase-simulator')
const futurePageClearer = require('@ac/future-page-clearer')
const futureDownloader = require('@ac/future-race-page-downloader')
const futureScraper = require('@ac/future-race-scraper')
const futureRegister = require('@ac/future-race-register')
const databaseUrlExtractor = require('@ac/race-database-url-extractor')
const resultScraper = require('@ac/result-race-scraper')
const horseHistCreator = require('@an/horse-race-history-creator')
const additionalResultCreator = require('@an/race-result-additional-creator')
const additionalInfoCreator = require('@an/race-info-additional-creator')
const learningInputCreator = require('@an/learning-input-creator')
const learningConfig = require('@an/configs/learning-config')
const testConfig = require('@an/configs/test-config')
const predictionConfig = require('@an/configs/prediction-config')
const predAdjuster = require('@an/prediction-result-adjuster')
const predictor = require('@s/predictor')
const simAnalyzer = require('@an/simulation-result-analyzer')
const correlationAnalyzer = require('@an/correlation-coefficient-analyzer')
const ipatPurchaseManager = require('@p/ipat-purchase-manager')

switch (options.target) {
  case 'init-db':
    dbInit.init()
    break
  case 'create-param':
    creator.create()
    break
  case 'future-set-register':
    (async () => {
      try {
        futurePageClearer.clear()
        await futureDownloader.download({
          raceIds: [
            '202105010511'
          ]
        })
        await futureScraper.scrape()
        await futureRegister.register()
        await learningInputCreator.create(predictionConfig)
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'result-set-register':
    // eslint-disable-next-line no-case-declarations
    (async () => {
      try {
        const endDate = '202002'
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
          minYear: 2020,
          minMonth: 2
        })
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'extract-database-url':
    (async () => {
      try {
        await databaseUrlExtractor.extract({
          endDate: '202002'
        })
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'extract-result-race-url':
    (async () => {
      try {
        await require('@ac/race-database-downloader').extract({
          // endDate: '202001'
        })
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'download-result-race':
    (async () => {
      try {
        await require('@ac/result-race-page-downloader').download({
          // endDate: '202001'
        })
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'result-scrape':
    resultScraper.scrape()
    break
  case 'result-register':
    require('@ac/result-race-register').register()
    break
  case 'gen-race-sql':
    require('@ac/race-sql-generator').generate()
    break
  case 'create-horse-hist':
    horseHistCreator.create({
      isFuture: true
    })
    break
  case 'create-result-additional':
    additionalResultCreator.create()
    break
  case 'create-info-additional':
    additionalInfoCreator.create()
    break
  case 'create-post-score':
    require('@an/race-post-score-creator').create()
    break
  case 'learn-pre':
    (async () => {
      try {
        // 学習情報作成
        await learningInputCreator.create(learningConfig)
        // 相関係数分析
        correlationAnalyzer.analyze()
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'learn-pre-resource':
    (async () => {
      try {
        await require('@an/learning-input-resource-creator').create(learningConfig)
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'test-pred':
    (async () => {
      try {
        // 予測情報作成
        await learningInputCreator.create(testConfig)
        // 予測実施
        await predictor.predict()
        // 予測結果整形
        predAdjuster.adjust()
        // シミュレーション実施
        await testSimulator.simulate()
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'test-sim':
    (async () => {
      try {
        // シミュレーション実施
        await testSimulator.simulate()
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'pred-key-adjust':
    require('@an/prediction-key-result-adjuster').adjust()
    break
  case 'sim-analyze':
    simAnalyzer.analyze()
    break
  case 'analyze-correlation':
    correlationAnalyzer.analyze()
    break
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
  default:
    throw new Error('unexpected target.')
}
