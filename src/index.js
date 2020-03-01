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
const futureDownloader = require('@ac/future-race-page-downloader')
const futureScraper = require('@ac/future-race-scraper')
const futureRegister = require('@ac/future-race-register')
const futureSimulator = require('@s/future-multi-ticket-type-purchase-simulator')
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
const simAnalyzer = require('@an/simulation-result-analyzer')

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
        await futureDownloader.download({
          raceIds: [
            '202006020210'
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
  case 'future-download':
    (async () => {
      try {
        await futureDownloader.download({
        })
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'future-scrape':
    (async () => {
      try {
        await futureScraper.scrape()
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
    break
  case 'future-register':
    futureRegister.register()
    break
  case 'future-simulate':
    // eslint-disable-next-line no-case-declarations
    const params = require('@h/purchase-helper').getPurchaseParams()
    futureSimulator.simulate(params)
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
  case 'test-simulate':
    (async () => {
      try {
        await testSimulator.simulate()
      } catch (e) {
        console.log(e)
      } finally {
        process.exit()
      }
    })()
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
    learningInputCreator.create(learningConfig)
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
  case 'pred-pre':
    learningInputCreator.create(predictionConfig)
    break
  case 'test-pre':
    learningInputCreator.create(testConfig)
    break
  case 'pred-adjust':
    predAdjuster.adjust()
    break
  case 'pred-key-adjust':
    require('@an/prediction-key-result-adjuster').adjust()
    break
  case 'sim-analyze':
    simAnalyzer.analyze()
    break
  default:
    throw new Error('unexpected target.')
}
